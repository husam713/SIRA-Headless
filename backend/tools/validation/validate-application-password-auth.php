<?php
/**
 * Plain-PHP checks for WPGraphQL Application Password request detection.
 *
 * Run:
 * php tools/validation/validate-application-password-auth.php
 */

declare(strict_types=1);

$plugin_dir = dirname( __DIR__, 2 );
$class_file = $plugin_dir . '/src/GraphQL/ApplicationPasswordAuthentication.php';

if ( '--case' === ( $argv[1] ?? '' ) ) {
	$graphql_state = (string) ( $argv[2] ?? 'undefined' );
	$incoming      = 'true' === ( $argv[3] ?? '' );
	$request_uri   = (string) ( $argv[4] ?? '__MISSING__' );
	$expected      = 'true' === ( $argv[5] ?? '' );

	if ( 'true' === $graphql_state ) {
		define( 'GRAPHQL_HTTP_REQUEST', true );
	} elseif ( 'false' === $graphql_state ) {
		define( 'GRAPHQL_HTTP_REQUEST', false );
	}

	if ( '__MISSING__' === $request_uri ) {
		unset( $_SERVER['REQUEST_URI'] );
	} else {
		$_SERVER['REQUEST_URI'] = $request_uri;
	}

	if ( ! function_exists( 'wp_parse_url' ) ) {
		function wp_parse_url( string $url, int $component = -1 ) {
			return parse_url( $url, $component );
		}
	}

	require_once $class_file;

	$actual = \Sira\Core\GraphQL\ApplicationPasswordAuthentication::is_api_request(
		$incoming
	);

	exit( $expected === $actual ? 0 : 1 );
}

$passes   = array();
$failures = array();

$check = static function ( bool $condition, string $message ) use (
	&$passes,
	&$failures
): void {
	if ( $condition ) {
		$passes[] = $message;
		return;
	}

	$failures[] = $message;
};

$cases = array(
	array( 'undefined', 'true', '/', 'true', 'Existing true value remains true for an unrelated path.' ),
	array( 'true', 'false', '/', 'true', 'GraphQL HTTP constant changes false to true.' ),
	array( 'false', 'false', '/graphql', 'true', 'Exact GraphQL endpoint changes false to true.' ),
	array( 'false', 'false', '/graphql/', 'true', 'GraphQL endpoint permits one trailing slash.' ),
	array( 'false', 'false', '/graphql?query=%7Bviewer%7D', 'true', 'GraphQL endpoint ignores its query string.' ),
	array( 'false', 'false', '/', 'false', 'Site root remains unchanged.' ),
	array( 'false', 'false', '/foo/graphql', 'false', 'Nested GraphQL-looking path remains unchanged.' ),
	array( 'false', 'false', '/graphql-attacker', 'false', 'GraphQL prefix collision remains unchanged.' ),
	array( 'false', 'false', '/graphql/anything', 'false', 'GraphQL child path remains unchanged.' ),
	array( 'false', 'false', '', 'false', 'Empty request URI remains unchanged.' ),
	array( 'false', 'false', '__MISSING__', 'false', 'Missing request URI remains unchanged.' ),
);

foreach ( $cases as $case ) {
	$output = array();
	$code   = 0;

	exec(
		escapeshellarg( PHP_BINARY )
			. ' '
			. escapeshellarg( __FILE__ )
			. ' --case '
			. escapeshellarg( $case[0] )
			. ' '
			. escapeshellarg( $case[1] )
			. ' '
			. escapeshellarg( $case[2] )
			. ' '
			. escapeshellarg( $case[3] ),
		$output,
		$code
	);

	$check( 0 === $code, $case[4] );
}

$registered_filters = array();

if ( ! function_exists( 'add_filter' ) ) {
	function add_filter(
		string $hook_name,
		callable $callback,
		int $priority = 10,
		int $accepted_args = 1
	): bool {
		global $registered_filters;

		$registered_filters[] = array(
			'hook_name'    => $hook_name,
			'callback'     => $callback,
			'priority'     => $priority,
			'accepted_args' => $accepted_args,
		);

		return true;
	}
}

require_once $class_file;

( new \Sira\Core\GraphQL\ApplicationPasswordAuthentication() )->hooks();

$registration = $registered_filters[0] ?? array();

$check(
	1 === count( $registered_filters ),
	'Application Password filter registers exactly once.'
);
$check(
	'application_password_is_api_request'
		=== ( $registration['hook_name'] ?? null ),
	'Application Password filter uses the WordPress Core hook.'
);
$check(
	array(
		\Sira\Core\GraphQL\ApplicationPasswordAuthentication::class,
		'is_api_request',
	) === ( $registration['callback'] ?? null ),
	'Application Password filter uses the intended callback.'
);
$check(
	10 === ( $registration['priority'] ?? null )
		&& 1 === ( $registration['accepted_args'] ?? null ),
	'Application Password filter priority and argument count are explicit.'
);

$plugin_source = (string) file_get_contents( $plugin_dir . '/src/Plugin.php' );
$class_source  = (string) file_get_contents( $class_file );
$main_source   = (string) file_get_contents( $plugin_dir . '/sira-core.php' );

$check(
	1 === substr_count( $main_source, "'plugins_loaded'" ),
	'Plugin entrypoint schedules orchestrator boot on plugins_loaded.'
);

$check(
	1 === substr_count(
		$plugin_source,
		'( new ApplicationPasswordAuthentication() )->hooks();'
	),
	'Plugin orchestrator registers the integration exactly once.'
);
$check(
	false === stripos( $class_source, 'jwt' ),
	'Application Password integration introduces no JWT dependency.'
);

if ( ! defined( 'SIRA_CORE_DIR' ) ) {
	define( 'SIRA_CORE_DIR', $plugin_dir . '/' );
}

require_once $plugin_dir . '/src/Autoloader.php';
\Sira\Core\Autoloader::register();

$check(
	class_exists( \Sira\Core\GraphQL\BrandSchema::class ),
	'SIRA autoloader resolves an unchanged GraphQL integration.'
);

echo "SIRA WPGraphQL Application Password validation\n";
echo str_repeat( '=', 47 ) . "\n\n";

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
