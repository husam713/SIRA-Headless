<?php
/**
 * Mutating Step 2C.2C GraphQL privacy and capability checks.
 *
 * Run only on isolated staging:
 *
 * SIRA_VALIDATION_ALLOW_MUTATIONS=1 \
 * wp eval-file \
 * wp-content/plugins/sira-core/tools/validation/validate-presentation-privacy.php
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	fwrite( STDERR, "Load this file through WP-CLI.\n" );
	exit( 1 );
}

if ( '1' !== (string) getenv( 'SIRA_VALIDATION_ALLOW_MUTATIONS' ) ) {
	fwrite(
		STDERR,
		"Refusing to create fixtures. Set "
		. "SIRA_VALIDATION_ALLOW_MUTATIONS=1 on staging.\n"
	);
	exit( 2 );
}

if (
	'production' === wp_get_environment_type()
	&& '1' !== (string) getenv( 'SIRA_VALIDATION_ALLOW_PRODUCTION' )
) {
	fwrite( STDERR, "Refusing to run mutation tests in production.\n" );
	exit( 2 );
}

if ( ! function_exists( 'graphql' ) ) {
	fwrite( STDERR, "WPGraphQL is required.\n" );
	exit( 1 );
}

if ( ! function_exists( 'update_field' ) ) {
	fwrite( STDERR, "ACF Pro is required.\n" );
	exit( 1 );
}

/*
 * Prevent temporary validation fixtures from producing revalidation events.
 */
add_filter(
	'sira_revalidation_allowed_post_types',
	static fn(): array => array(),
	PHP_INT_MAX
);

$passes      = array();
$failures    = array();
$warnings    = array();
$post_ids    = array();
$user_ids    = array();
$unique      = 'sira-privacy-' . wp_generate_password( 12, false, false );
$original_id = get_current_user_id();

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

$warn = static function (
	string $message
) use ( &$warnings ): void {
	$warnings[] = $message;
};

$admin_ids = get_users(
	array(
		'role'   => 'administrator',
		'number' => 1,
		'fields' => 'ID',
	)
);
$admin_id = absint( $admin_ids[0] ?? 0 );

if ( 0 === $admin_id ) {
	fwrite( STDERR, "No site administrator is available.\n" );
	exit( 1 );
}

/**
 * Create a temporary user.
 */
$create_user = static function (
	string $role,
	string $suffix
) use ( $unique, &$user_ids ): int {
	$username = sanitize_user( $unique . '-' . $suffix, true );
	$user_id  = wp_insert_user(
		array(
			'user_login' => $username,
			'user_pass'  => wp_generate_password( 32, true, true ),
			'user_email' => $username . '@example.invalid',
			'role'       => $role,
		)
	);

	if ( is_wp_error( $user_id ) ) {
		return 0;
	}

	$user_ids[] = (int) $user_id;

	return (int) $user_id;
};

/**
 * Create a temporary post fixture.
 */
$create_post = static function (
	string $post_type,
	string $label,
	int $author_id
) use ( $unique, &$post_ids ): int {
	$post_id = wp_insert_post(
		array(
			'post_type'    => $post_type,
			'post_status'  => 'publish',
			'post_title'   => "{$unique} {$label}",
			'post_excerpt' => "Temporary {$unique} privacy fixture.",
			'post_content' => "Temporary {$unique} privacy fixture.",
			'post_author'  => $author_id,
		),
		true
	);

	if ( is_wp_error( $post_id ) ) {
		return 0;
	}

	$post_ids[] = (int) $post_id;

	return (int) $post_id;
};

$author_id     = $create_user( 'author', 'author' );
$subscriber_id = $create_user( 'subscriber', 'subscriber' );

$investment_public = $create_post(
	'sira_investment',
	'public investment',
	$author_id
);
$investment_hidden = $create_post(
	'sira_investment',
	'hidden investment',
	$author_id
);
$testimonial_public = $create_post(
	'sira_testimonial',
	'public testimonial',
	$author_id
);
$testimonial_hidden = $create_post(
	'sira_testimonial',
	'hidden testimonial',
	$author_id
);
$page_id = $create_post( 'page', 'relationship page', $admin_id );

$record( 0 < $author_id, 'Created a temporary Author.' );
$record( 0 < $subscriber_id, 'Created a temporary Subscriber.' );
$record( 0 < $investment_public, 'Created an approved Investment fixture.' );
$record( 0 < $investment_hidden, 'Created an unapproved Investment fixture.' );
$record( 0 < $testimonial_public, 'Created an approved Testimonial fixture.' );
$record( 0 < $testimonial_hidden, 'Created an unapproved Testimonial fixture.' );
$record( 0 < $page_id, 'Created a homepage-relationship fixture.' );

update_post_meta(
	$investment_public,
	'sira_investment_public_display',
	'1'
);
update_post_meta(
	$investment_hidden,
	'sira_investment_public_display',
	'0'
);
update_post_meta(
	$testimonial_public,
	'sira_testimonial_consent_approved',
	'1'
);
update_post_meta(
	$testimonial_hidden,
	'sira_testimonial_consent_approved',
	'0'
);

update_field(
	'field_sira_homepage_variant',
	'group',
	$page_id
);
update_field(
	'field_sira_group_homepage',
	array(
		'investor' => array(
			'selected_investments' => array(
				$investment_public,
				$investment_hidden,
			),
		),
		'testimonials' => array(
			'selected_testimonials' => array(
				$testimonial_public,
				$testimonial_hidden,
			),
		),
	),
	$page_id
);

/**
 * Execute a specific single-node query.
 *
 * @return array<string,mixed>
 */
$query_specific = static function (
	string $field,
	int $post_id
): array {
	return graphql(
		array(
			'query'     => sprintf(
				'query SiraPrivacySpecific($id: ID!) {
					node: %s(id: $id, idType: DATABASE_ID) {
						id
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

/**
 * Query a generic ContentNode by database ID.
 *
 * @return array<string,mixed>
 */
$query_content_node = static function ( int $post_id ): array {
	return graphql(
		array(
			'query'     => 'query SiraPrivacyContentNode($id: ID!) {
				node: contentNode(id: $id, idType: DATABASE_ID) {
					databaseId
				}
			}',
			'variables' => array(
				'id' => (string) $post_id,
			),
		)
	);
};

/**
 * Query a global Relay Node.
 *
 * @return array<string,mixed>
 */
$query_global_node = static function ( string $global_id ): array {
	return graphql(
		array(
			'query'     => 'query SiraPrivacyGlobalNode($id: ID!) {
				node(id: $id) {
					... on ContentNode {
						databaseId
					}
				}
			}',
			'variables' => array(
				'id' => $global_id,
			),
		)
	);
};

/**
 * Return database IDs from a known root connection.
 *
 * @return array<int,int>
 */
$query_collection = static function ( string $field ): array {
	$result = graphql(
		array(
			'query' => sprintf(
				'query SiraPrivacyCollection {
					items: %s(first: 100) {
						nodes {
							databaseId
						}
					}
				}',
				$field
			),
		)
	);

	return array_map(
		'absint',
		array_column(
			(array) ( $result['data']['items']['nodes'] ?? array() ),
			'databaseId'
		)
	);
};

/**
 * Search all ContentNodes for the unique fixture token.
 *
 * @return array<int,int>
 */
$query_search = static function ( string $search ): array {
	$result = graphql(
		array(
			'query'     => 'query SiraPrivacySearch($search: String!) {
				contentNodes(first: 100, where: { search: $search }) {
					nodes {
						databaseId
					}
				}
			}',
			'variables' => array(
				'search' => $search,
			),
		)
	);

	return array_map(
		'absint',
		array_column(
			(array) (
				$result['data']['contentNodes']['nodes']
				?? array()
			),
			'databaseId'
		)
	);
};

/**
 * Query the Page homepage relationships.
 *
 * @return array{investments:array<int,int>,testimonials:array<int,int>}
 */
$query_homepage_relationships = static function ( int $target_page_id ): array {
	$result = graphql(
		array(
			'query'     => 'query SiraPrivacyHomepage($id: ID!) {
				page(id: $id, idType: DATABASE_ID) {
					siraHomepage {
						groupHomepage {
							investor {
								selectedInvestments {
									nodes {
										databaseId
									}
								}
							}
							testimonials {
								selectedTestimonials {
									nodes {
										databaseId
									}
								}
							}
						}
					}
				}
			}',
			'variables' => array(
				'id' => (string) $target_page_id,
			),
		)
	);

	return array(
		'investments' => array_map(
			'absint',
			array_column(
				(array) (
					$result['data']['page']['siraHomepage']
						['groupHomepage']['investor']
						['selectedInvestments']['nodes']
					?? array()
				),
				'databaseId'
			)
		),
		'testimonials' => array_map(
			'absint',
			array_column(
				(array) (
					$result['data']['page']['siraHomepage']
						['groupHomepage']['testimonials']
						['selectedTestimonials']['nodes']
					?? array()
				),
				'databaseId'
			)
		),
	);
};

try {
	/*
	 * Obtain Relay IDs while authenticated, then use the same IDs in public
	 * global-node checks.
	 */
	wp_set_current_user( $admin_id );

	$investment_admin = $query_specific(
		'siraInvestment',
		$investment_hidden
	);
	$testimonial_admin = $query_specific(
		'siraTestimonial',
		$testimonial_hidden
	);

	$investment_global_id = (string) (
		$investment_admin['data']['node']['id'] ?? ''
	);
	$testimonial_global_id = (string) (
		$testimonial_admin['data']['node']['id'] ?? ''
	);

	$record(
		(int) (
			$investment_admin['data']['node']['databaseId'] ?? 0
		) === $investment_hidden,
		'Administrator can read an unapproved Investment.'
	);
	$record(
		(int) (
			$testimonial_admin['data']['node']['databaseId'] ?? 0
		) === $testimonial_hidden,
		'Administrator can read an unapproved Testimonial.'
	);

	/*
	 * Anonymous checks cover specific roots, generic ContentNode, Relay Node,
	 * root collections, cross-type search, and ACF homepage relationships.
	 */
	wp_set_current_user( 0 );

	$record(
		(int) (
			$query_specific(
				'siraInvestment',
				$investment_public
			)['data']['node']['databaseId'] ?? 0
		) === $investment_public,
		'Anonymous GraphQL can read an approved Investment.'
	);
	$record(
		null === (
			$query_specific(
				'siraInvestment',
				$investment_hidden
			)['data']['node'] ?? null
		),
		'Anonymous specific-node query cannot read an unapproved Investment.'
	);
	$record(
		(int) (
			$query_specific(
				'siraTestimonial',
				$testimonial_public
			)['data']['node']['databaseId'] ?? 0
		) === $testimonial_public,
		'Anonymous GraphQL can read a consent-approved Testimonial.'
	);
	$record(
		null === (
			$query_specific(
				'siraTestimonial',
				$testimonial_hidden
			)['data']['node'] ?? null
		),
		'Anonymous specific-node query cannot read an unapproved Testimonial.'
	);

	$record(
		null === (
			$query_content_node(
				$investment_hidden
			)['data']['node'] ?? null
		),
		'Anonymous generic ContentNode query cannot bypass Investment approval.'
	);
	$record(
		null === (
			$query_content_node(
				$testimonial_hidden
			)['data']['node'] ?? null
		),
		'Anonymous generic ContentNode query cannot bypass Testimonial consent.'
	);
	$record(
		'' !== $investment_global_id
			&& null === (
				$query_global_node(
					$investment_global_id
				)['data']['node'] ?? null
			),
		'Anonymous Relay Node query cannot bypass Investment approval.'
	);
	$record(
		'' !== $testimonial_global_id
			&& null === (
				$query_global_node(
					$testimonial_global_id
				)['data']['node'] ?? null
			),
		'Anonymous Relay Node query cannot bypass Testimonial consent.'
	);

	$anonymous_investments = $query_collection( 'siraInvestments' );
	$anonymous_testimonials = $query_collection( 'siraTestimonials' );

	$record(
		in_array( $investment_public, $anonymous_investments, true )
			&& ! in_array(
				$investment_hidden,
				$anonymous_investments,
				true
			),
		'Anonymous Investment collection contains approved but not unapproved records.'
	);
	$record(
		in_array( $testimonial_public, $anonymous_testimonials, true )
			&& ! in_array(
				$testimonial_hidden,
				$anonymous_testimonials,
				true
			),
		'Anonymous Testimonial collection contains approved but not unapproved records.'
	);

	$anonymous_search = $query_search( $unique );

	$record(
		in_array( $investment_public, $anonymous_search, true )
			&& in_array( $testimonial_public, $anonymous_search, true )
			&& ! in_array( $investment_hidden, $anonymous_search, true )
			&& ! in_array( $testimonial_hidden, $anonymous_search, true ),
		'Anonymous ContentNode search cannot reveal unapproved presentation objects.'
	);

	$anonymous_homepage = $query_homepage_relationships( $page_id );

	$record(
		in_array(
			$investment_public,
			$anonymous_homepage['investments'],
			true
		)
			&& ! in_array(
				$investment_hidden,
				$anonymous_homepage['investments'],
				true
			),
		'Anonymous homepage relationship cannot bypass Investment approval.'
	);
	$record(
		in_array(
			$testimonial_public,
			$anonymous_homepage['testimonials'],
			true
		)
			&& ! in_array(
				$testimonial_hidden,
				$anonymous_homepage['testimonials'],
				true
			),
		'Anonymous homepage relationship cannot bypass Testimonial consent.'
	);

	/*
	 * A logged-in user without edit capability must receive the same private
	 * result as an anonymous request.
	 */
	wp_set_current_user( $subscriber_id );

	$record(
		null === (
			$query_specific(
				'siraInvestment',
				$investment_hidden
			)['data']['node'] ?? null
		),
		'Subscriber cannot read an unapproved Investment.'
	);
	$record(
		null === (
			$query_specific(
				'siraTestimonial',
				$testimonial_hidden
			)['data']['node'] ?? null
		),
		'Subscriber cannot read an unapproved Testimonial.'
	);

	/*
	 * The fixture Author owns the records and should retain editorial access
	 * through the standard edit_post meta capability.
	 */
	wp_set_current_user( $author_id );

	$record(
		(int) (
			$query_specific(
				'siraInvestment',
				$investment_hidden
			)['data']['node']['databaseId'] ?? 0
		) === $investment_hidden,
		'Author can read the unapproved Investment they can edit.'
	);
	$record(
		(int) (
			$query_specific(
				'siraTestimonial',
				$testimonial_hidden
			)['data']['node']['databaseId'] ?? 0
		) === $testimonial_hidden,
		'Author can read the unapproved Testimonial they can edit.'
	);

	$author_homepage = $query_homepage_relationships( $page_id );

	$record(
		in_array(
			$investment_hidden,
			$author_homepage['investments'],
			true
		),
		'Authorized editor sees an unapproved Investment through a homepage relationship.'
	);
	$record(
		in_array(
			$testimonial_hidden,
			$author_homepage['testimonials'],
			true
		),
		'Authorized editor sees an unapproved Testimonial through a homepage relationship.'
	);
} catch ( Throwable $error ) {
	$failures[] = 'Runtime exception: ' . $error->getMessage();
} finally {
	wp_set_current_user( $admin_id );

	foreach ( array_reverse( $post_ids ) as $post_id ) {
		wp_delete_post( $post_id, true );
	}

	if ( ! function_exists( 'wp_delete_user' ) ) {
		require_once ABSPATH . 'wp-admin/includes/user.php';
	}

	foreach ( array_reverse( $user_ids ) as $user_id ) {
		wp_delete_user( $user_id );
	}

	wp_set_current_user( $original_id );
}

echo "SIRA Step 2C.2C runtime privacy validation\n";
echo str_repeat( '=', 46 ) . "\n\n";

foreach ( $passes as $message ) {
	echo "[PASS] {$message}\n";
}

foreach ( $warnings as $message ) {
	echo "[WARN] {$message}\n";
}

foreach ( $failures as $message ) {
	echo "[FAIL] {$message}\n";
}

echo "\nSummary: "
	. count( $passes )
	. ' passed, '
	. count( $warnings )
	. ' warnings, '
	. count( $failures )
	. " failed.\n";

exit( array() === $failures ? 0 : 1 );
