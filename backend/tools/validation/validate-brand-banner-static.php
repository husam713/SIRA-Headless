<?php
/**
 * Plain-PHP checks for the Step 2C.2F typed banner contract.
 *
 * Run:
 * php tools/validation/validate-brand-banner-static.php
 */

declare(strict_types=1);

if ( ! function_exists( 'sanitize_textarea_field' ) ) {
	function sanitize_textarea_field( mixed $value ): string {
		return trim( strip_tags( (string) $value ) );
	}
}

if ( ! function_exists( 'sanitize_text_field' ) ) {
	function sanitize_text_field( mixed $value ): string {
		return trim( preg_replace( '/\s+/', ' ', strip_tags( (string) $value ) ) ?? '' );
	}
}

if ( ! function_exists( 'sanitize_key' ) ) {
	function sanitize_key( mixed $value ): string {
		return preg_replace(
			'/[^a-z0-9_\-]/',
			'',
			strtolower( (string) $value )
		) ?? '';
	}
}

if ( ! function_exists( 'esc_url_raw' ) ) {
	function esc_url_raw(
		mixed $value,
		array $protocols = array()
	): string {
		$value = trim( (string) $value );

		if ( str_starts_with( $value, '/' ) && ! str_starts_with( $value, '//' ) ) {
			return $value;
		}

		$scheme = strtolower( (string) parse_url( $value, PHP_URL_SCHEME ) );

		if (
			'' === $scheme
			|| ( array() !== $protocols && ! in_array( $scheme, $protocols, true ) )
			|| false === filter_var( $value, FILTER_VALIDATE_URL )
		) {
			return '';
		}

		return $value;
	}
}

if ( ! function_exists( 'wp_parse_url' ) ) {
	function wp_parse_url(
		mixed $value,
		int $component = -1
	): mixed {
		return parse_url( (string) $value, $component );
	}
}

if ( ! function_exists( 'wp_timezone' ) ) {
	function wp_timezone(): DateTimeZone {
		return new DateTimeZone( 'Asia/Riyadh' );
	}
}

if ( ! function_exists( 'wp_json_encode' ) ) {
	function wp_json_encode(
		mixed $value,
		int $flags = 0
	): string|false {
		return json_encode( $value, $flags );
	}
}

require_once dirname( __DIR__, 2 ) . '/src/Brand/BannerContract.php';

use Sira\Core\Brand\BannerContract;

$passes   = array();
$failures = array();

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

$now = new DateTimeImmutable(
	'2026-08-03T08:30:00+00:00'
);

$active = BannerContract::resolve(
	'announcement',
	array(
		'message'     => 'Important service update',
		'severity'    => 'important',
		'link'        => array(
			'title'  => 'Read the update',
			'url'    => '/news/service-update/',
			'target' => '_self',
		),
		'starts_at'   => '2026-08-03 10:00:00',
		'ends_at'     => '2026-08-03 14:00:00',
		'dismissible' => '1',
	),
	'Legacy announcement',
	BannerContract::SEVERITY_INFO,
	$now
);

$record(
	is_array( $active ),
	'Active typed announcement resolves.'
);
$record(
	'IMPORTANT' === ( $active['severity'] ?? null ),
	'Editor severity maps to the public enum value.'
);
$record(
	'2026-08-03T07:00:00+00:00' === ( $active['startsAt'] ?? null )
		&& '2026-08-03T11:00:00+00:00' === ( $active['endsAt'] ?? null ),
	'WordPress-site times are normalized to UTC RFC 3339.'
);
$record(
	array(
		'label'  => 'Read the update',
		'url'    => '/news/service-update/',
		'target' => '_self',
	) === ( $active['link'] ?? null ),
	'Typed links expose only label, URL and approved target.'
);
$record(
	true === ( $active['dismissible'] ?? false ),
	'Explicit dismissible approval is preserved.'
);
$record(
	1 === preg_match(
		'/^[a-f0-9]{64}$/',
		(string) ( $active['revisionKey'] ?? '' )
	),
	'Revision key is a deterministic SHA-256 value.'
);

$before_start = BannerContract::resolve(
	'announcement',
	array(
		'message'   => 'Scheduled later',
		'starts_at' => '2026-08-03 12:00:00',
	),
	'Legacy must not bypass the schedule',
	'INFO',
	$now
);

$record(
	null === $before_start,
	'A populated typed banner is null before its start and does not fall back to legacy text.'
);

$at_end = BannerContract::resolve(
	'announcement',
	array(
		'message' => 'Expired',
		'ends_at' => '2026-08-03 11:30:00',
	),
	null,
	'INFO',
	new DateTimeImmutable( '2026-08-03T08:30:00+00:00' )
);

$record(
	null === $at_end,
	'Banner end time is exclusive.'
);

$invalid_range = BannerContract::resolve(
	'emergency',
	array(
		'message'   => 'Invalid schedule',
		'starts_at' => '2026-08-03 14:00:00',
		'ends_at'   => '2026-08-03 13:00:00',
	),
	null,
	'URGENT',
	$now
);

$record(
	null === $invalid_range,
	'Invalid schedule ranges fail closed.'
);

$invalid_date = BannerContract::resolve(
	'emergency',
	array(
		'message'   => 'Invalid date',
		'starts_at' => 'not-a-date',
	),
	null,
	'URGENT',
	$now
);

$record(
	null === $invalid_date,
	'Malformed configured dates fail closed.'
);

$legacy = BannerContract::resolve(
	'announcement',
	array(),
	'Legacy announcement',
	'INFO',
	$now
);

$record(
	is_array( $legacy )
		&& 'Legacy announcement' === $legacy['message']
		&& 'INFO' === $legacy['severity']
		&& null === $legacy['link']
		&& false === $legacy['dismissible'],
	'Legacy announcement text receives a typed backward-compatible payload.'
);

$empty_typed = BannerContract::resolve(
	'emergency',
	array(
		'message'  => '',
		'severity' => 'important',
	),
	'Legacy emergency',
	'URGENT',
	$now
);

$record(
	is_array( $empty_typed )
		&& 'Legacy emergency' === $empty_typed['message']
		&& 'URGENT' === $empty_typed['severity'],
	'An empty typed message preserves the channel-specific legacy fallback.'
);

$unsafe_link = BannerContract::resolve(
	'announcement',
	array(
		'message' => 'Safe message',
		'link'    => array(
			'title' => 'Unsafe',
			'url'   => 'javascript:alert(1)',
		),
	),
	null,
	'INFO',
	$now
);

$record(
	is_array( $unsafe_link ) && null === $unsafe_link['link'],
	'Unsafe banner protocols are omitted.'
);

$default_severity = BannerContract::resolve(
	'emergency',
	array(
		'message'  => 'Emergency',
		'severity' => 'unexpected',
	),
	null,
	'URGENT',
	$now
);

$record(
	is_array( $default_severity )
		&& 'URGENT' === $default_severity['severity'],
	'Invalid severity uses the channel default.'
);

$changed_revision = BannerContract::resolve(
	'announcement',
	array(
		'message' => 'Changed service update',
	),
	null,
	'INFO',
	$now
);

$record(
	is_array( $changed_revision )
		&& $changed_revision['revisionKey'] !== $active['revisionKey'],
	'Public content changes produce a new revision key.'
);

echo "SIRA Step 2C.2F static banner validation\n";
echo str_repeat( '=', 46 ) . "\n\n";

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
