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

$post_types = \Sira\Core\Content\PostTypes::definitions();
$taxonomies = \Sira\Core\Content\Taxonomies::definitions();
$meta       = \Sira\Core\Content\MetaFields::definitions();

$check( 28 === count( $post_types ), 'Exactly 28 custom post types are defined.' );
$check( 10 === count( $taxonomies ), 'Exactly 10 custom taxonomies are defined.' );
$check( 12 === count( $meta ), 'Exactly 12 legacy native meta keys are defined.' );

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
