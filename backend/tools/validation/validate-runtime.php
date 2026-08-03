<?php
/**
 * Read-only WordPress/WPGraphQL runtime checks.
 *
 * Run:
 * wp eval-file wp-content/plugins/sira-core/tools/validation/validate-runtime.php
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	fwrite( STDERR, "Load this file through WP-CLI.\n" );
	exit( 1 );
}

use Sira\Core\Brand\BrandManager;
use Sira\Core\Content\MetaFields;
use Sira\Core\Content\PostTypes;
use Sira\Core\Content\Taxonomies;

$passes   = array();
$failures = array();
$warnings = array();

$record = static function (
	bool $condition,
	string $message,
	bool $required = true
) use ( &$passes, &$failures, &$warnings ): void {
	if ( $condition ) {
		$passes[] = $message;
		return;
	}

	if ( $required ) {
		$failures[] = $message;
		return;
	}

	$warnings[] = $message;
};

$record(
	defined( 'SIRA_CORE_VERSION' ),
	'SIRA Core version constant is loaded.'
);
$record(
	class_exists( \Sira\Core\Plugin::class ),
	'SIRA Core plugin class is available.'
);
$record(
	! class_exists( \Sira\Core\Integrations\BricksIntegration::class ),
	'The Bricks integration class is absent.'
);
$record(
	! class_exists( \Sira\Core\Shortcodes\Renderer::class ),
	'The layout shortcode renderer class is absent.'
);

$post_definitions = PostTypes::definitions();

foreach ( $post_definitions as $post_type => $definition ) {
	$object = get_post_type_object( $post_type );

	$record(
		$object instanceof \WP_Post_Type,
		"Post type {$post_type} is registered."
	);

	if ( ! $object instanceof \WP_Post_Type ) {
		continue;
	}

	$record(
		true === (bool) ( $object->show_in_graphql ?? false ),
		"Post type {$post_type} is GraphQL-enabled."
	);
	$record(
		(string) ( $object->graphql_single_name ?? '' )
			=== (string) $definition['graphql_single_name'],
		"Post type {$post_type} has the expected GraphQL singular name."
	);
	$record(
		(string) ( $object->graphql_plural_name ?? '' )
			=== (string) $definition['graphql_plural_name'],
		"Post type {$post_type} has the expected GraphQL plural name."
	);

	$rewrite_slug = is_array( $object->rewrite ?? null )
		? (string) ( $object->rewrite['slug'] ?? '' )
		: '';

	$record(
		$rewrite_slug === (string) $definition['slug'],
		"Post type {$post_type} preserves its rewrite slug."
	);
}

$investor = get_post_type_object( 'sira_investor' );

$record(
	$investor instanceof \WP_Post_Type
		&& false === (bool) $investor->publicly_queryable,
	'Investor records are not publicly queryable.'
);
$record(
	$investor instanceof \WP_Post_Type
		&& false === (bool) $investor->has_archive,
	'Investor records have no public archive.'
);

$taxonomy_definitions = Taxonomies::definitions();

foreach ( $taxonomy_definitions as $taxonomy => $definition ) {
	$object = get_taxonomy( $taxonomy );

	$record(
		$object instanceof \WP_Taxonomy,
		"Taxonomy {$taxonomy} is registered."
	);

	if ( ! $object instanceof \WP_Taxonomy ) {
		continue;
	}

	$record(
		true === (bool) ( $object->show_in_graphql ?? false ),
		"Taxonomy {$taxonomy} is GraphQL-enabled."
	);
	$record(
		true === (bool) $object->hierarchical,
		"Taxonomy {$taxonomy} remains hierarchical."
	);
	$record(
		(string) ( $object->graphql_single_name ?? '' )
			=== (string) $definition['graphql_single_name'],
		"Taxonomy {$taxonomy} has the expected GraphQL singular name."
	);
	$record(
		(string) ( $object->graphql_plural_name ?? '' )
			=== (string) $definition['graphql_plural_name'],
		"Taxonomy {$taxonomy} has the expected GraphQL plural name."
	);

	$actual_types   = array_values( (array) $object->object_type );
	$expected_types = array_values( (array) $definition['types'] );

	sort( $actual_types );
	sort( $expected_types );

	$record(
		$actual_types === $expected_types,
		"Taxonomy {$taxonomy} preserves its post-type relationships."
	);
}

foreach ( array_keys( $post_definitions ) as $post_type ) {
	$registered_meta = get_registered_meta_keys( 'post', $post_type );

	foreach ( array_keys( MetaFields::definitions() ) as $meta_key ) {
		$record(
			isset( $registered_meta[ $meta_key ] ),
			"Legacy meta {$meta_key} remains registered for {$post_type}."
		);

		if ( isset( $registered_meta[ $meta_key ] ) ) {
			$record(
				false === (bool) ( $registered_meta[ $meta_key ]['show_in_rest'] ?? false ),
				"Legacy meta {$meta_key} is not exposed through REST for {$post_type}."
			);
		}
	}
}

global $shortcode_tags;

$sira_shortcodes = array_values(
	array_filter(
		array_keys( is_array( $shortcode_tags ) ? $shortcode_tags : array() ),
		static fn( string $tag ): bool => str_starts_with( $tag, 'sira_' )
	)
);

sort( $sira_shortcodes );

$record(
	array( 'sira_contact_form' ) === $sira_shortcodes,
	'Only the temporary SIRA contact shortcode is active.'
);

$record(
	false !== has_action( 'sira_revalidation_deliver_event' ),
	'The revalidation worker hook is registered.'
);

$routes = rest_get_server()->get_routes();

$record(
	isset( $routes['/sira/v1/brand'] ),
	'The temporary SIRA brand REST fallback is registered.'
);

$schema_output = '';

if ( class_exists( \Sira\Core\Schema\OrganizationSchema::class ) ) {
	ob_start();
	( new \Sira\Core\Schema\OrganizationSchema() )->render();
	$schema_output = (string) ob_get_clean();
}

$record(
	'' === trim( $schema_output ),
	'WordPress Organization JSON-LD is disabled by default.'
);

$record(
	function_exists( 'graphql' ),
	'WPGraphQL is active and exposes the graphql() function.'
);

if ( function_exists( 'graphql' ) ) {
	$type_names = array();

	foreach ( $post_definitions as $definition ) {
		$type_names[] = (string) $definition['graphql_single_name'];
	}

	foreach ( $taxonomy_definitions as $definition ) {
		$type_names[] = (string) $definition['graphql_single_name'];
	}

	$type_names = array_merge(
		$type_names,
		array(
			'SiraBrand',
			'SiraBrandMedia',
			'SiraBrandValue',
			'SiraBrandOffice',
			'SiraBrandSocialProfiles',
			'SiraProjectDetails',
			'SiraPersonDetails',
			'SiraDocumentDetails',
		)
	);

	$fragments = array();

	foreach ( $type_names as $index => $type_name ) {
		$fragments[] = sprintf(
			't%d: __type(name: "%s") { name }',
			$index,
			$type_name
		);
	}

	$root_fields = graphql(
		array(
			'query' => 'query { root: __type(name: "RootQuery") { fields { name } } }',
		)
	);

	$record(
		empty( $root_fields['errors'] ),
		'RootQuery introspection completes without GraphQL errors.'
	);

	$root_names = array_column(
		(array) ( $root_fields['data']['root']['fields'] ?? array() ),
		'name'
	);

	$record(
		in_array( 'siraBrand', $root_names, true ),
		'RootQuery contains siraBrand.'
	);

	foreach ( $post_definitions as $definition ) {
		$root_field = lcfirst( (string) $definition['graphql_plural_name'] );

		$record(
			in_array( $root_field, $root_names, true ),
			"RootQuery contains {$root_field}."
		);
	}

	foreach ( $taxonomy_definitions as $definition ) {
		$root_field = lcfirst( (string) $definition['graphql_plural_name'] );

		$record(
			in_array( $root_field, $root_names, true ),
			"RootQuery contains {$root_field}."
		);
	}

	$types_result = graphql(
		array(
			'query' => 'query { ' . implode( ' ', $fragments ) . ' }',
		)
	);

	$record(
		empty( $types_result['errors'] ),
		'All expected SIRA GraphQL types can be introspected.'
	);

	foreach ( $type_names as $index => $type_name ) {
		$record(
			$type_name === (string) ( $types_result['data'][ 't' . $index ]['name'] ?? '' ),
			"GraphQL type {$type_name} exists."
		);
	}

	$brand_type = graphql(
		array(
			'query' => 'query {
				brand: __type(name: "SiraBrand") {
					fields { name }
				}
			}',
		)
	);

	$brand_fields = array_column(
		(array) ( $brand_type['data']['brand']['fields'] ?? array() ),
		'name'
	);

	$record(
		! in_array( 'analyticsId', $brand_fields, true ),
		'SiraBrand does not expose analyticsId.'
	);
	$record(
		! in_array( 'rawOptions', $brand_fields, true ),
		'SiraBrand does not expose rawOptions.'
	);

	$original_blog_id = get_current_blog_id();
	$sites            = is_multisite()
		? get_sites( array( 'number' => 0 ) )
		: array( get_site() );

	foreach ( $sites as $site ) {
		$blog_id = (int) $site->blog_id;

		if ( get_current_blog_id() !== $blog_id ) {
			switch_to_blog( $blog_id );
		}

		try {
			$result = graphql(
				array(
					'query' => 'query {
						siraBrand {
							name
							key
							primaryColor
							secondaryColor
							accentColor
							paperColor
							inkColor
						}
					}',
				)
			);

			$brand = $result['data']['siraBrand'] ?? null;

			$record(
				empty( $result['errors'] ) && is_array( $brand ),
				"Brand GraphQL query succeeds on blog {$blog_id}."
			);
			$record(
				is_array( $brand )
					&& '' !== (string) ( $brand['name'] ?? '' )
					&& '' !== (string) ( $brand['key'] ?? '' ),
				"Brand GraphQL query returns identity on blog {$blog_id}."
			);
		} finally {
			if ( get_current_blog_id() !== $original_blog_id ) {
				restore_current_blog();
			}
		}
	}
}

$acf_available = function_exists( 'acf_get_field_group' );

$record(
	$acf_available,
	'ACF Pro is active.',
	true
);

if ( $acf_available ) {
	foreach (
		array(
			'group_sira_brand'    => false,
			'group_sira_project'  => true,
			'group_sira_people'   => true,
			'group_sira_document' => true,
		) as $group_key => $expected_graphql
	) {
		$group = acf_get_field_group( $group_key );

		$record(
			is_array( $group ),
			"ACF field group {$group_key} exists."
		);

		if ( is_array( $group ) ) {
			$record(
				$expected_graphql === (bool) ( $group['show_in_graphql'] ?? false ),
				"ACF field group {$group_key} has the expected GraphQL visibility."
			);
		}
	}
}

echo "SIRA Step 1 runtime validation\n";
echo str_repeat( '=', 33 ) . "\n\n";

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
