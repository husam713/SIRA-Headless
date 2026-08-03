<?php
/**
 * Legacy SIRA post metadata registration.
 *
 * These keys predate the canonical ACF field groups and are retained only for
 * backward compatibility during the headless migration. They are deliberately
 * not exposed as a public REST or GraphQL contract.
 */

declare(strict_types=1);

namespace Sira\Core\Content;

final class MetaFields {
	public function hooks(): void {
		add_action( 'init', array( $this, 'register' ), 8 );
	}

	/**
	 * Return the legacy metadata definitions.
	 *
	 * Several underscored keys overlap with ACF's internal field-reference
	 * records. Do not expose these keys directly to public API consumers.
	 *
	 * @return array<string,array{type:string,description:string}>
	 */
	public static function definitions(): array {
		return array(
			'_sira_subtitle' => array(
				'type'        => 'string',
				'description' => 'Deprecated legacy subtitle metadata.',
			),
			'_sira_location' => array(
				'type'        => 'string',
				'description' => 'Deprecated legacy location metadata.',
			),
			'_sira_status' => array(
				'type'        => 'string',
				'description' => 'Deprecated legacy status metadata.',
			),
			'_sira_external_url' => array(
				'type'        => 'string',
				'description' => 'Deprecated legacy external URL metadata.',
			),
			'_sira_email' => array(
				'type'        => 'string',
				'description' => 'Deprecated legacy email metadata.',
			),
			'_sira_phone' => array(
				'type'        => 'string',
				'description' => 'Deprecated legacy phone metadata.',
			),
			'_sira_role' => array(
				'type'        => 'string',
				'description' => 'Deprecated legacy role metadata.',
			),
			'_sira_start_date' => array(
				'type'        => 'string',
				'description' => 'Deprecated legacy start-date metadata.',
			),
			'_sira_end_date' => array(
				'type'        => 'string',
				'description' => 'Deprecated legacy end-date metadata.',
			),
			'_sira_value' => array(
				'type'        => 'string',
				'description' => 'Deprecated legacy value metadata.',
			),
			'_sira_featured' => array(
				'type'        => 'boolean',
				'description' => 'Deprecated legacy featured-state metadata.',
			),
			'_sira_related_company' => array(
				'type'        => 'integer',
				'description' => 'Deprecated legacy related-company metadata.',
			),
		);
	}

	public function register(): void {
		$post_types = array_keys( PostTypes::definitions() );
		$fields     = apply_filters( 'sira_legacy_meta_definitions', self::definitions() );

		if ( ! is_array( $fields ) ) {
			return;
		}

		foreach ( $post_types as $post_type ) {
			foreach ( $fields as $key => $config ) {
				if (
					! is_string( $key )
					|| ! is_array( $config )
					|| empty( $config['type'] )
				) {
					continue;
				}

				$type = (string) $config['type'];

				register_post_meta(
					$post_type,
					$key,
					array(
						'single'            => true,
						'type'              => $type,
						'description'       => (string) ( $config['description'] ?? '' ),
						/*
						 * These protected keys are not a stable public API.
						 * Canonical headless fields are exposed through ACF and
						 * WPGraphQL for ACF instead.
						 */
						'show_in_rest'      => false,
						'auth_callback'     => static function (
							mixed $allowed,
							mixed $meta_key,
							mixed $object_id
						): bool {
							unset( $allowed, $meta_key );

							$post_id = absint( $object_id );

							return 0 < $post_id && current_user_can( 'edit_post', $post_id );
						},
						'sanitize_callback' => $this->sanitize_callback( $key, $type ),
					)
				);
			}
		}
	}

	private function sanitize_callback( string $key, string $type ): callable {
		if ( 'boolean' === $type ) {
			return static fn( mixed $value ): bool => rest_sanitize_boolean( $value );
		}

		if ( 'integer' === $type ) {
			return static fn( mixed $value ): int => absint( $value );
		}

		if ( str_contains( $key, 'url' ) ) {
			return static fn( mixed $value ): string => esc_url_raw( (string) $value );
		}

		if ( str_contains( $key, 'email' ) ) {
			return static fn( mixed $value ): string => sanitize_email( (string) $value );
		}

		return static fn( mixed $value ): string => sanitize_text_field( (string) $value );
	}
}
