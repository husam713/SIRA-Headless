<?php
/**
 * Plain-PHP static acceptance checks for the cumulative Step 1 plugin.
 *
 * Run:
 * php tools/validation/validate-static.php
 */

declare(strict_types=1);

$plugin_dir = dirname( __DIR__, 2 );
$failures   = array();
$passes     = array();

$pass = static function ( string $message ) use ( &$passes ): void {
	$passes[] = $message;
};

$fail = static function ( string $message ) use ( &$failures ): void {
	$failures[] = $message;
};

$check = static function (
	bool $condition,
	string $message
) use ( $pass, $fail ): void {
	$condition ? $pass( $message ) : $fail( $message );
};

$php_files = array();

$iterator = new RecursiveIteratorIterator(
	new RecursiveDirectoryIterator(
		$plugin_dir,
		FilesystemIterator::SKIP_DOTS
	)
);

foreach ( $iterator as $file ) {
	if (
		$file instanceof SplFileInfo
		&& $file->isFile()
		&& 'php' === strtolower( $file->getExtension() )
	) {
		$php_files[] = $file->getPathname();
	}
}

sort( $php_files );

foreach ( $php_files as $file ) {
	$output = array();
	$code   = 0;

	exec(
		escapeshellarg( PHP_BINARY ) . ' -l ' . escapeshellarg( $file ),
		$output,
		$code
	);

	$check(
		0 === $code,
		'PHP syntax: ' . str_replace( $plugin_dir . DIRECTORY_SEPARATOR, '', $file )
	);
}

require_once $plugin_dir . '/src/Content/PostTypes.php';
require_once $plugin_dir . '/src/Content/Taxonomies.php';
require_once $plugin_dir . '/src/Content/MetaFields.php';
require_once $plugin_dir . '/src/Integrations/PresentationFields.php';
require_once $plugin_dir . '/src/GraphQL/PresentationVisibility.php';
require_once $plugin_dir . '/src/Brand/BannerContract.php';
require_once $plugin_dir . '/src/Integrations/BrandBannerFields.php';

$post_types = \Sira\Core\Content\PostTypes::definitions();
$taxonomies = \Sira\Core\Content\Taxonomies::definitions();
$meta       = \Sira\Core\Content\MetaFields::definitions();
$presentation_groups = \Sira\Core\Integrations\PresentationFields::definitions();
$approval_rules = \Sira\Core\GraphQL\PresentationVisibility::approval_rules();
$banner_severities = \Sira\Core\Brand\BannerContract::severity_values();
$banner_fields = \Sira\Core\Integrations\BrandBannerFields::definitions();

$check( 28 === count( $post_types ), 'Exactly 28 custom post types are defined.' );
$check( 10 === count( $taxonomies ), 'Exactly 10 custom taxonomies are defined.' );
$check( 12 === count( $meta ), 'Exactly 12 legacy native meta keys are defined.' );

$check(
	array(
		'sira_investment'  => 'sira_investment_public_display',
		'sira_testimonial' => 'sira_testimonial_consent_approved',
	) === $approval_rules,
	'Step 2C.2C approval rules cover only Investments and Testimonials.'
);


$check(
	array(
		'info'      => 'INFO',
		'important' => 'IMPORTANT',
		'urgent'    => 'URGENT',
	) === $banner_severities,
	'Step 2C.2F exposes the approved banner severity values.'
);

$check(
	2 === count( $banner_fields ),
	'Exactly two typed banner ACF groups are defined.'
);

$banner_field_keys = array();
$banner_field_names = array();

foreach ( $banner_fields as $banner_field ) {
	$banner_field_keys[]  = (string) ( $banner_field['key'] ?? '' );
	$banner_field_names[] = (string) ( $banner_field['name'] ?? '' );
	$check(
		'group' === (string) ( $banner_field['type'] ?? '' ),
		'Typed banner editor field is an ACF group.'
	);
	$check(
		false === (bool) ( $banner_field['show_in_graphql'] ?? true ),
		'Raw typed banner ACF options remain outside GraphQL.'
	);

	$sub_fields = array_column(
		(array) ( $banner_field['sub_fields'] ?? array() ),
		null,
		'name'
	);
	$check(
		isset(
			$sub_fields['message'],
			$sub_fields['severity'],
			$sub_fields['link'],
			$sub_fields['starts_at'],
			$sub_fields['ends_at'],
			$sub_fields['dismissible']
		),
		'Typed banner group contains the complete approved editor contract.'
	);

	foreach ( $sub_fields as $sub_field ) {
		$banner_field_keys[] = (string) ( $sub_field['key'] ?? '' );
		$check(
			false === (bool) ( $sub_field['show_in_graphql'] ?? true ),
			'Raw typed banner subfield remains outside GraphQL.'
		);
	}
}

$check(
	array(
		'sira_announcement_banner_config',
		'sira_emergency_banner_config',
	) === $banner_field_names,
	'Typed banner ACF option names are stable.'
);
$check(
	! in_array( '', $banner_field_keys, true )
		&& count( $banner_field_keys )
			=== count( array_unique( $banner_field_keys ) ),
	'Typed banner ACF keys are present and unique.'
);

$check(
	5 === count( $presentation_groups ),
	'Exactly five Step 2C.2B presentation field groups are defined.'
);

$expected_presentation_groups = array(
	'group_sira_homepage' => array(
		'graphql_field_name' => 'siraHomepage',
		'graphql_type_name'  => 'SiraHomepage',
		'graphql_types'      => array( 'Page' ),
	),
	'group_sira_company_details' => array(
		'graphql_field_name' => 'companyDetails',
		'graphql_type_name'  => 'SiraCompanyDetails',
		'graphql_types'      => array( 'SiraCompany' ),
	),
	'group_sira_investment_details' => array(
		'graphql_field_name' => 'investmentDetails',
		'graphql_type_name'  => 'SiraInvestmentDetails',
		'graphql_types'      => array( 'SiraInvestment' ),
	),
	'group_sira_testimonial_details' => array(
		'graphql_field_name' => 'testimonialDetails',
		'graphql_type_name'  => 'SiraTestimonialDetails',
		'graphql_types'      => array( 'SiraTestimonial' ),
	),
	'group_sira_partner_details' => array(
		'graphql_field_name' => 'partnerDetails',
		'graphql_type_name'  => 'SiraPartnerDetails',
		'graphql_types'      => array( 'SiraPartner' ),
	),
);

foreach ( $expected_presentation_groups as $group_key => $expected ) {
	$group = $presentation_groups[ $group_key ] ?? array();

	$check(
		array() !== $group,
		"Presentation field group {$group_key} exists."
	);
	$check(
		true === (bool) ( $group['show_in_graphql'] ?? false ),
		"Presentation field group {$group_key} is GraphQL-enabled."
	);
	$check(
		$expected['graphql_field_name']
			=== (string) ( $group['graphql_field_name'] ?? '' ),
		"Presentation field group {$group_key} has the expected GraphQL field name."
	);
	$check(
		$expected['graphql_type_name']
			=== (string) ( $group['graphql_type_name'] ?? '' ),
		"Presentation field group {$group_key} has the expected GraphQL type name."
	);
	$check(
		$expected['graphql_types']
			=== array_values( (array) ( $group['graphql_types'] ?? array() ) ),
		"Presentation field group {$group_key} maps to the expected GraphQL parent type."
	);
	$check(
		false === (bool) (
			$group['map_graphql_types_from_location_rules'] ?? true
		),
		"Presentation field group {$group_key} uses explicit GraphQL parent mapping."
	);
}

$acf_keys = array_keys( $presentation_groups );
$nested_graphql_type_names = array();

/**
 * Collect source-controlled ACF field keys and nested explicit type names.
 *
 * @param array<int,array<string,mixed>> $fields ACF field definitions.
 */
$collect_acf_fields = static function (
	array $fields
) use ( &$collect_acf_fields, &$acf_keys, &$nested_graphql_type_names ): void {
	foreach ( $fields as $field ) {
		$acf_keys[] = (string) ( $field['key'] ?? '' );

		if ( isset( $field['graphql_type_name'] ) ) {
			$nested_graphql_type_names[] = (string) $field['graphql_type_name'];
		}

		if ( isset( $field['sub_fields'] ) ) {
			$collect_acf_fields( (array) $field['sub_fields'] );
		}
	}
};

foreach ( $presentation_groups as $group ) {
	$collect_acf_fields( (array) ( $group['fields'] ?? array() ) );
}

$check(
	! in_array( '', $acf_keys, true ),
	'Every Step 2C.2B ACF group and field has a source-controlled key.'
);
$check(
	count( $acf_keys ) === count( array_unique( $acf_keys ) ),
	'Every Step 2C.2B ACF group and field key is unique.'
);
$check(
	array() === $nested_graphql_type_names,
	'Nested WPGraphQL-for-ACF type names remain live-schema generated and are not finalized in source.'
);

$homepage_fields = array_column(
	(array) ( $presentation_groups['group_sira_homepage']['fields'] ?? array() ),
	null,
	'graphql_field_name'
);

$check(
	isset(
		$homepage_fields['variant'],
		$homepage_fields['groupHomepage'],
		$homepage_fields['branchHomepage']
	),
	'SiraHomepage defines variant, groupHomepage and branchHomepage.'
);

$business_unit_types = (array) (
	$taxonomies['sira_business_unit']['types'] ?? array()
);

$check(
	in_array( 'sira_company', $business_unit_types, true ),
	'Business Unit taxonomy classifies SIRA companies.'
);

$graphql_names = array();

foreach ( $post_types as $key => $definition ) {
	$single = (string) ( $definition['graphql_single_name'] ?? '' );
	$plural = (string) ( $definition['graphql_plural_name'] ?? '' );

	$check(
		1 === preg_match( '/^[A-Za-z][A-Za-z0-9]*$/', $single ),
		"Valid post-type GraphQL singular name: {$key}."
	);
	$check(
		1 === preg_match( '/^[A-Za-z][A-Za-z0-9]*$/', $plural ),
		"Valid post-type GraphQL plural name: {$key}."
	);

	$graphql_names[] = $single;
	$graphql_names[] = $plural;
}

foreach ( $taxonomies as $key => $definition ) {
	$single = (string) ( $definition['graphql_single_name'] ?? '' );
	$plural = (string) ( $definition['graphql_plural_name'] ?? '' );

	$check(
		1 === preg_match( '/^[A-Za-z][A-Za-z0-9]*$/', $single ),
		"Valid taxonomy GraphQL singular name: {$key}."
	);
	$check(
		1 === preg_match( '/^[A-Za-z][A-Za-z0-9]*$/', $plural ),
		"Valid taxonomy GraphQL plural name: {$key}."
	);

	$graphql_names[] = $single;
	$graphql_names[] = $plural;
}

$check(
	count( $graphql_names ) === count( array_unique( $graphql_names ) ),
	'All SIRA GraphQL type names are unique.'
);

$investor = $post_types['sira_investor'] ?? array();

$check(
	false === ( $investor['publicly_queryable'] ?? true ),
	'Investor records are not publicly queryable.'
);
$check(
	false === ( $investor['has_archive'] ?? true ),
	'Investor records have no public archive.'
);

$active_code = '';

foreach ( $php_files as $file ) {
	$relative = str_replace(
		$plugin_dir . DIRECTORY_SEPARATOR,
		'',
		$file
	);

	if ( str_starts_with( $relative, 'tools' . DIRECTORY_SEPARATOR ) ) {
		continue;
	}

	$active_code .= "\n" . (string) file_get_contents( $file );
}

$forbidden = array(
	'BricksIntegration',
	'bricks/dynamic_tags_list',
	'bricks/dynamic_data/render_tag',
	'bricks/dynamic_data/render_content',
	'bricks/frontend/render_data',
	'bricks_is_builder',
	'[sira_home]',
	'[sira_branch_home]',
	'[sira_newsroom]',
	'page-templates/sira-home.php',
	'page-templates/sira-newsroom.php',
);

foreach ( $forbidden as $needle ) {
	$check(
		false === strpos( $active_code, $needle ),
		"Active PHP contains no forbidden dependency: {$needle}."
	);
}

$shortcode_matches = array();

preg_match_all(
	'/add_shortcode\s*\(\s*[\'"]([^\'"]+)[\'"]/',
	$active_code,
	$shortcode_matches
);

$sira_shortcodes = array_values(
	array_filter(
		$shortcode_matches[1] ?? array(),
		static fn( string $tag ): bool => str_starts_with( $tag, 'sira_' )
	)
);

sort( $sira_shortcodes );

$check(
	array( 'sira_contact_form' ) === array_values( array_unique( $sira_shortcodes ) ),
	'Only the temporary sira_contact_form shortcode remains.'
);

$plugin_file = (string) file_get_contents( $plugin_dir . '/src/Plugin.php' );

$check(
	false !== strpos( $plugin_file, 'new PresentationVisibility()' ),
	'Plugin orchestrator registers PresentationVisibility.'
);
$brand_schema_source = (string) file_get_contents(
	$plugin_dir . '/src/GraphQL/BrandSchema.php'
);
$brand_manager_source = (string) file_get_contents(
	$plugin_dir . '/src/Brand/BrandManager.php'
);

foreach (
	array(
		'SiraBrandLink',
		'SiraBrandBannerSeverity',
		'SiraBrandBanner',
		"'announcement'",
		"'emergency'",
	) as $banner_schema_term
) {
	$check(
		false !== strpos( $brand_schema_source, $banner_schema_term ),
		'Brand schema contains typed banner contract term: '
			. $banner_schema_term . '.'
	);
}

$check(
	false !== strpos(
		$brand_manager_source,
		'BannerContract::resolve'
	),
	'BrandManager resolves typed banners through BannerContract.'
);
$check(
	false !== strpos(
		$brand_manager_source,
		"'announcement_banner' => \$announcement_legacy"
	)
		&& false !== strpos(
			$brand_manager_source,
			"'emergency_banner'    => \$emergency_legacy"
		),
	'Legacy announcement and emergency strings remain in the public contract.'
);

$check(
	false !== strpos( $active_code, 'graphql_data_is_private' ),
	'Active plugin code uses the WPGraphQL model-layer privacy filter.'
);
$check(
	false === strpos( $active_code, 'graphql_request_results' ),
	'Privacy is not implemented by post-processing GraphQL responses.'
);

$main_file = (string) file_get_contents( $plugin_dir . '/sira-core.php' );

preg_match( '/^\s*\*\s*Version:\s*([^\r\n]+)/m', $main_file, $header_match );
preg_match(
	"/define\(\s*'SIRA_CORE_VERSION'\s*,\s*'([^']+)'\s*\)/",
	$main_file,
	$constant_match
);

$header_version   = trim( (string) ( $header_match[1] ?? '' ) );
$constant_version = trim( (string) ( $constant_match[1] ?? '' ) );

$check(
	'' !== $header_version && $header_version === $constant_version,
	'Plugin header and SIRA_CORE_VERSION are synchronized.'
);
$check(
	1 === preg_match( '/^\s*\*\s*Requires PHP:\s*8\.3\s*$/m', $main_file ),
	'Plugin declares PHP 8.3 as the minimum.'
);
$check(
	1 === preg_match( '/^\s*\*\s*Network:\s*true\s*$/mi', $main_file ),
	'Plugin declares network activation support.'
);

$check(
	0 === preg_match(
		'/SIRA_NEXT_REVALIDATION_SECRET\s*[\'"]?\s*=>\s*[\'"][^\'"]{16,}/',
		$active_code
	),
	'No hardcoded revalidation secret was detected.'
);

echo "SIRA Step 1 static validation\n";
echo str_repeat( '=', 32 ) . "\n\n";

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
