<?php
/**
 * Mutating capability and unpublished-content checks.
 *
 * Run only on an isolated staging site:
 * SIRA_VALIDATION_ALLOW_MUTATIONS=1 \
 * wp eval-file wp-content/plugins/sira-core/tools/validation/validate-security.php
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	fwrite( STDERR, "Load this file through WP-CLI.\n" );
	exit( 1 );
}

if (
	'1' !== (string) getenv( 'SIRA_VALIDATION_ALLOW_MUTATIONS' )
) {
	fwrite(
		STDERR,
		"Refusing to create temporary records. Set "
		. "SIRA_VALIDATION_ALLOW_MUTATIONS=1 on staging.\n"
	);
	exit( 2 );
}

if (
	'production' === wp_get_environment_type()
	&& '1' !== (string) getenv( 'SIRA_VALIDATION_ALLOW_PRODUCTION' )
) {
	fwrite(
		STDERR,
		"Refusing to run mutation tests in production.\n"
	);
	exit( 2 );
}

if ( ! function_exists( 'graphql' ) ) {
	fwrite( STDERR, "WPGraphQL is required.\n" );
	exit( 1 );
}

/*
 * Prevent validation fixtures from producing revalidation events.
 */
add_filter(
	'sira_revalidation_allowed_post_types',
	static fn(): array => array(),
	PHP_INT_MAX
);

$passes   = array();
$failures = array();
$post_ids = array();

$record = static function (
	bool $condition,
	string $message
) use ( &$passes, &$failures ): void {
	if ( $condition ) {
		$passes[] = $message;
		return;
	}

	$failures[] = $message;
};

$original_user_id = get_current_user_id();
$admin_ids        = get_users(
	array(
		'role'   => 'administrator',
		'number' => 1,
		'fields' => 'ID',
	)
);
$admin_id         = absint( $admin_ids[0] ?? 0 );

if ( 0 === $admin_id ) {
	fwrite( STDERR, "No site administrator is available for authenticated checks.\n" );
	exit( 1 );
}

$create_fixture = static function (
	string $post_type,
	string $status,
	string $label
) use ( $admin_id, &$post_ids ): int {
	$post_id = wp_insert_post(
		array(
			'post_type'    => $post_type,
			'post_status'  => $status,
			'post_title'   => 'SIRA validation ' . $label . ' ' . wp_generate_uuid4(),
			'post_content' => 'Temporary Step 1G capability validation fixture.',
			'post_author'  => $admin_id,
		),
		true
	);

	if ( is_wp_error( $post_id ) ) {
		return 0;
	}

	$post_ids[] = (int) $post_id;

	return (int) $post_id;
};

$published_news = $create_fixture( 'sira_news', 'publish', 'published news' );
$draft_news     = $create_fixture( 'sira_news', 'draft', 'draft news' );
$private_news   = $create_fixture( 'sira_news', 'private', 'private news' );
$investor       = $create_fixture( 'sira_investor', 'publish', 'investor' );

$record( 0 < $published_news, 'Created a published news fixture.' );
$record( 0 < $draft_news, 'Created a draft news fixture.' );
$record( 0 < $private_news, 'Created a private news fixture.' );
$record( 0 < $investor, 'Created an investor fixture.' );

$query_node = static function (
	string $field,
	int $post_id
): array {
	return graphql(
		array(
			'query'     => sprintf(
				'query ValidationNode($id: ID!) {
					node: %s(id: $id, idType: DATABASE_ID) {
						databaseId
						title
					}
				}',
				$field
			),
			'variables' => array(
				'id' => (string) $post_id,
			),
		)
	);
};

try {
	wp_set_current_user( 0 );

	$published_result = $query_node( 'siraNewsItem', $published_news );
	$draft_result     = $query_node( 'siraNewsItem', $draft_news );
	$private_result   = $query_node( 'siraNewsItem', $private_news );
	$investor_result  = $query_node( 'siraInvestor', $investor );

	$record(
		(int) ( $published_result['data']['node']['databaseId'] ?? 0 )
			=== $published_news,
		'Anonymous GraphQL can read published public news.'
	);
	$record(
		null === ( $draft_result['data']['node'] ?? null ),
		'Anonymous GraphQL cannot read draft news.'
	);
	$record(
		null === ( $private_result['data']['node'] ?? null ),
		'Anonymous GraphQL cannot read private news.'
	);
	$record(
		null === ( $investor_result['data']['node'] ?? null ),
		'Anonymous GraphQL cannot read investor records.'
	);

	wp_set_current_user( $admin_id );

	$draft_admin    = $query_node( 'siraNewsItem', $draft_news );
	$private_admin  = $query_node( 'siraNewsItem', $private_news );
	$investor_admin = $query_node( 'siraInvestor', $investor );

	$record(
		(int) ( $draft_admin['data']['node']['databaseId'] ?? 0 ) === $draft_news,
		'An administrator can read draft news through authenticated GraphQL.'
	);
	$record(
		(int) ( $private_admin['data']['node']['databaseId'] ?? 0 ) === $private_news,
		'An administrator can read private news through authenticated GraphQL.'
	);
	$record(
		(int) ( $investor_admin['data']['node']['databaseId'] ?? 0 ) === $investor,
		'An administrator can read investor records through authenticated GraphQL.'
	);

	$sensitive_types = graphql(
		array(
			'query' => 'query {
				person: __type(name: "SiraPersonDetails") {
					fields { name }
				}
				document: __type(name: "SiraDocumentDetails") {
					fields { name }
				}
				brand: __type(name: "SiraBrand") {
					fields { name }
				}
			}',
		)
	);

	$person_fields = array_column(
		(array) ( $sensitive_types['data']['person']['fields'] ?? array() ),
		'name'
	);
	$document_fields = array_column(
		(array) ( $sensitive_types['data']['document']['fields'] ?? array() ),
		'name'
	);
	$brand_fields = array_column(
		(array) ( $sensitive_types['data']['brand']['fields'] ?? array() ),
		'name'
	);

	$record(
		! in_array( 'email', $person_fields, true ),
		'Person email is absent from the public ACF GraphQL type.'
	);
	$record(
		! in_array( 'file', $document_fields, true ),
		'Direct document files are absent from the public ACF GraphQL type.'
	);
	$record(
		! in_array( 'analyticsId', $brand_fields, true ),
		'Analytics identifiers are absent from the public brand type.'
	);
} finally {
	wp_set_current_user( $admin_id );

	foreach ( $post_ids as $post_id ) {
		wp_delete_post( $post_id, true );
	}

	wp_set_current_user( $original_user_id );
}

echo "SIRA Step 1 security validation\n";
echo str_repeat( '=', 34 ) . "\n\n";

foreach ( $passes as $message ) {
	echo "[PASS] {$message}\n";
}

foreach ( $failures as $message ) {
	echo "[FAIL] {$message}\n";
}

echo "\nSummary: "
	. count( $passes )
	. ' passed, '
	. count( $failures )
	. " failed.\n";

exit( array() === $failures ? 0 : 1 );
