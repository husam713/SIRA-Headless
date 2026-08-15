<?php
/**
 * Public typed banner normalization and schedule contract.
 */

declare(strict_types=1);

namespace Sira\Core\Brand;

/**
 * Convert raw brand options into the stable public banner schema.
 */
final class BannerContract {
	public const SEVERITY_INFO      = 'INFO';
	public const SEVERITY_IMPORTANT = 'IMPORTANT';
	public const SEVERITY_URGENT    = 'URGENT';

	/**
	 * Return the approved editor values and public enum values.
	 *
	 * @return array<string,string>
	 */
	public static function severity_values(): array {
		return array(
			'info'      => self::SEVERITY_INFO,
			'important' => self::SEVERITY_IMPORTANT,
			'urgent'    => self::SEVERITY_URGENT,
		);
	}

	/**
	 * Resolve one active public banner.
	 *
	 * A populated typed message takes precedence over the legacy string. When
	 * the typed banner is outside its schedule, null is returned and the legacy
	 * string is not allowed to bypass the schedule.
	 *
	 * @param string                  $channel          Stable banner channel.
	 * @param mixed                   $configuration    Raw typed banner options.
	 * @param mixed                   $legacy_message   Backward-compatible text.
	 * @param string                  $default_severity Default public severity.
	 * @param \DateTimeImmutable|null $now              Testable UTC clock.
	 * @return array<string,mixed>|null
	 */
	public static function resolve(
		string $channel,
		mixed $configuration,
		mixed $legacy_message,
		string $default_severity,
		?\DateTimeImmutable $now = null
	): ?array {
		$configuration = is_array( $configuration )
			? $configuration
			: array();

		$typed_message = self::text(
			$configuration['message'] ?? null
		);
		$has_typed_message = null !== $typed_message;
		$message = $has_typed_message
			? $typed_message
			: self::text( $legacy_message );

		if ( null === $message ) {
			return null;
		}

		$severity = $has_typed_message
			? self::severity(
				$configuration['severity'] ?? null,
				$default_severity
			)
			: self::severity( null, $default_severity );

		$link = $has_typed_message
			? self::link( $configuration['link'] ?? null )
			: null;

		$starts_raw = $has_typed_message
			? ( $configuration['starts_at']
				?? $configuration['startsAt']
				?? null )
			: null;
		$ends_raw = $has_typed_message
			? ( $configuration['ends_at']
				?? $configuration['endsAt']
				?? null )
			: null;

		$starts_at = self::datetime( $starts_raw );
		$ends_at   = self::datetime( $ends_raw );

		if (
			$has_typed_message
			&& (
				( self::has_value( $starts_raw ) && null === $starts_at )
				|| ( self::has_value( $ends_raw ) && null === $ends_at )
			)
		) {
			return null;
		}

		if (
			$starts_at instanceof \DateTimeImmutable
			&& $ends_at instanceof \DateTimeImmutable
			&& $ends_at <= $starts_at
		) {
			return null;
		}

		$utc = new \DateTimeZone( 'UTC' );
		$now = $now instanceof \DateTimeImmutable
			? $now->setTimezone( $utc )
			: new \DateTimeImmutable( 'now', $utc );

		if (
			$starts_at instanceof \DateTimeImmutable
			&& $now < $starts_at
		) {
			return null;
		}

		if (
			$ends_at instanceof \DateTimeImmutable
			&& $now >= $ends_at
		) {
			return null;
		}

		$payload = array(
			'message'     => $message,
			'severity'    => $severity,
			'link'        => $link,
			'startsAt'    => self::format_datetime( $starts_at ),
			'endsAt'      => self::format_datetime( $ends_at ),
			'dismissible' => $has_typed_message
				&& self::boolean( $configuration['dismissible'] ?? false ),
		);

		$payload['revisionKey'] = self::revision_key(
			$channel,
			$payload
		);

		return $payload;
	}

	private static function text( mixed $value ): ?string {
		$value = sanitize_textarea_field( (string) $value );

		return '' !== trim( $value ) ? $value : null;
	}

	private static function severity(
		mixed $value,
		string $fallback
	): string {
		$values = self::severity_values();
		$key    = sanitize_key( (string) $value );

		if ( isset( $values[ $key ] ) ) {
			return $values[ $key ];
		}

		$fallback_key = sanitize_key( $fallback );

		if ( isset( $values[ $fallback_key ] ) ) {
			return $values[ $fallback_key ];
		}

		$normalized_fallback = strtoupper( trim( $fallback ) );

		return in_array( $normalized_fallback, $values, true )
			? $normalized_fallback
			: self::SEVERITY_INFO;
	}

	/**
	 * @return array{label:string,url:string,target:?string}|null
	 */
	private static function link( mixed $value ): ?array {
		if ( ! is_array( $value ) ) {
			return null;
		}

		$label = sanitize_text_field(
			(string) ( $value['title'] ?? $value['label'] ?? '' )
		);
		$url   = self::url( $value['url'] ?? null );

		if ( '' === $label || null === $url ) {
			return null;
		}

		$target = sanitize_key( (string) ( $value['target'] ?? '' ) );
		$target = in_array( $target, array( '_blank', '_self' ), true )
			? $target
			: null;

		return array(
			'label'  => $label,
			'url'    => $url,
			'target' => $target,
		);
	}

	private static function url( mixed $value ): ?string {
		$value = trim( (string) $value );

		if (
			'' === $value
			|| str_starts_with( $value, '//' )
		) {
			return null;
		}

		if ( str_starts_with( $value, '/' ) ) {
			$sanitized = esc_url_raw( $value );

			return '' !== $sanitized ? $sanitized : null;
		}

		$scheme = strtolower(
			(string) wp_parse_url( $value, PHP_URL_SCHEME )
		);

		if ( ! in_array( $scheme, array( 'http', 'https' ), true ) ) {
			return null;
		}

		$sanitized = esc_url_raw(
			$value,
			array( 'http', 'https' )
		);

		return '' !== $sanitized ? $sanitized : null;
	}

	private static function boolean( mixed $value ): bool {
		return true === $value || 1 === $value || '1' === $value;
	}

	private static function has_value( mixed $value ): bool {
		return null !== $value && '' !== trim( (string) $value );
	}

	private static function datetime(
		mixed $value
	): ?\DateTimeImmutable {
		$utc = new \DateTimeZone( 'UTC' );

		if ( $value instanceof \DateTimeInterface ) {
			return \DateTimeImmutable::createFromInterface( $value )
				->setTimezone( $utc );
		}

		$value = trim( (string) $value );

		if ( '' === $value ) {
			return null;
		}

		$site_timezone = function_exists( 'wp_timezone' )
			? wp_timezone()
			: $utc;

		foreach (
			array(
				array( 'Y-m-d H:i:s', $site_timezone ),
				array( 'Y-m-d H:i', $site_timezone ),
				array( 'Y-m-d\TH:i:sP', null ),
				array( \DATE_ATOM, null ),
			) as $candidate
		) {
			$format   = $candidate[0];
			$timezone = $candidate[1];
			$date     = \DateTimeImmutable::createFromFormat(
				'!' . $format,
				$value,
				$timezone
			);
			$errors   = \DateTimeImmutable::getLastErrors();

			if (
				$date instanceof \DateTimeImmutable
				&& (
					false === $errors
					|| (
						0 === $errors['warning_count']
						&& 0 === $errors['error_count']
					)
				)
				&& $date->format( $format ) === $value
			) {
				return $date->setTimezone( $utc );
			}
		}

		return null;
	}

	private static function format_datetime(
		?\DateTimeImmutable $value
	): ?string {
		return $value instanceof \DateTimeImmutable
			? $value->format( \DATE_ATOM )
			: null;
	}

	/**
	 * @param array<string,mixed> $payload Public banner payload.
	 */
	private static function revision_key(
		string $channel,
		array $payload
	): string {
		$canonical = array(
			'channel'     => sanitize_key( $channel ),
			'message'     => $payload['message'],
			'severity'    => $payload['severity'],
			'link'        => $payload['link'],
			'startsAt'    => $payload['startsAt'],
			'endsAt'      => $payload['endsAt'],
			'dismissible' => $payload['dismissible'],
		);

		$encoded = function_exists( 'wp_json_encode' )
			? wp_json_encode(
				$canonical,
				\JSON_UNESCAPED_SLASHES
				| \JSON_UNESCAPED_UNICODE
			)
			: json_encode(
				$canonical,
				\JSON_UNESCAPED_SLASHES
				| \JSON_UNESCAPED_UNICODE
			);

		return hash(
			'sha256',
			is_string( $encoded ) ? $encoded : serialize( $canonical )
		);
	}
}
