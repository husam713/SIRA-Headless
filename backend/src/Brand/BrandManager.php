<?php
/**
 * Multisite-aware brand configuration.
 */

declare(strict_types=1);

namespace Sira\Core\Brand;

final class BrandManager {
	private static ?self $instance = null;

	/**
	 * Effective brand values keyed by the current blog ID.
	 *
	 * @var array<int,array<string,mixed>>
	 */
	private array $cache = array();

	public static function instance(): self {
		return self::$instance ??= new self();
	}

	public function hooks(): void {
		add_action( 'add_option_sira_brand_options', array( $this, 'clear_cache' ), 10, 0 );
		add_action( 'update_option_sira_brand_options', array( $this, 'clear_cache' ), 10, 0 );
		add_action( 'delete_option_sira_brand_options', array( $this, 'clear_cache' ), 10, 0 );

		add_action( 'add_site_option_sira_network_defaults', array( $this, 'clear_cache' ), 10, 0 );
		add_action( 'update_site_option_sira_network_defaults', array( $this, 'clear_cache' ), 10, 0 );
		add_action( 'delete_site_option_sira_network_defaults', array( $this, 'clear_cache' ), 10, 0 );

		add_action( 'switch_blog', array( $this, 'clear_cache' ), 10, 0 );
		add_action( 'acf/save_post', array( $this, 'clear_cache_after_acf_save' ), 20, 1 );
	}

	public function clear_cache(): void {
		$this->cache = array();
	}

	/**
	 * Clear cached brand data after an ACF options save.
	 *
	 * ACF passes non-numeric identifiers such as "options" for options pages.
	 *
	 * @param mixed $post_id ACF save target.
	 */
	public function clear_cache_after_acf_save( mixed $post_id ): void {
		if ( ! is_numeric( $post_id ) ) {
			$this->clear_cache();
		}
	}

	/**
	 * Return the built-in brand presets.
	 *
	 * @return array<string,array<string,string>>
	 */
	public static function presets(): array {
		return array(
			'group'      => array(
				'brand_name'     => 'SIRA GROUP',
				'brand_key'      => 'group',
				'primary_color'  => '#cca34b',
				'secondary_color' => '#172232',
				'accent_color'   => '#cca34b',
				'paper_color'    => '#f7f4ed',
				'ink_color'      => '#20242b',
				'tagline'        => 'Shaping a smarter future.',
			),
			'realestate' => array(
				'brand_name'     => 'SIRA Real Estate',
				'brand_key'      => 'realestate',
				'primary_color'  => '#b0733c',
				'secondary_color' => '#2b1b14',
				'accent_color'   => '#b0733c',
				'paper_color'    => '#faf5ef',
				'ink_color'      => '#25201d',
				'tagline'        => 'Building enduring places across markets.',
			),
			'healthcare' => array(
				'brand_name'     => 'SIRA Healthcare',
				'brand_key'      => 'healthcare',
				'primary_color'  => '#2c6dad',
				'secondary_color' => '#12283f',
				'accent_color'   => '#2c6dad',
				'paper_color'    => '#f3f7fb',
				'ink_color'      => '#1f2932',
				'tagline'        => 'Advancing diagnostic and healthcare infrastructure.',
			),
			'lifestyle'  => array(
				'brand_name'     => 'SIRA Lifestyle',
				'brand_key'      => 'lifestyle',
				'primary_color'  => '#2e8c72',
				'secondary_color' => '#12382f',
				'accent_color'   => '#2e8c72',
				'paper_color'    => '#f2f8f5',
				'ink_color'      => '#1f2b27',
				'tagline'        => 'Creating destination-led hospitality and lifestyle experiences.',
			),
			'consulting' => array(
				'brand_name'     => 'SIRA Consulting',
				'brand_key'      => 'consulting',
				'primary_color'  => '#8b5aae',
				'secondary_color' => '#2b1f36',
				'accent_color'   => '#8b5aae',
				'paper_color'    => '#f8f4fa',
				'ink_color'      => '#29232d',
				'tagline'        => 'Strategy for new markets.',
			),
		);
	}

	/**
	 * Return defaults for the current WordPress site.
	 *
	 * @return array<string,mixed>
	 */
	public function defaults(): array {
		$preset = self::presets()[ $this->infer_brand_key() ] ?? self::presets()['group'];

		return array_merge(
			$preset,
			array(
				'logo_id'            => 0,
				'mark_id'            => 0,
				'email'              => '',
				'phone'              => '',
				'address'            => '',
				'description'        => '',
				'mission'            => '',
				'vision'             => '',
				'values'             => array(),
				'office_locations'   => array(),
				'linkedin_url'       => '',
				'instagram_url'      => '',
				'x_url'              => '',
				'youtube_url'        => '',
				'analytics_id'       => '',
				'emergency_banner'   => '',
				'announcement_bar'   => '',
				'announcement'       => array(),
				'emergency'          => array(),
			)
		);
	}

	public function infer_brand_key(): string {
		$host = strtolower( (string) wp_parse_url( home_url( '/' ), PHP_URL_HOST ) );
		$path = strtolower( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ) );

		foreach ( array_keys( self::presets() ) as $key ) {
			if (
				'group' !== $key
				&& ( str_contains( $host, $key ) || str_contains( $path, '/' . $key ) )
			) {
				return $key;
			}
		}

		return 'group';
	}

	/**
	 * Resolve the effective brand for the current WordPress site.
	 *
	 * Precedence:
	 * 1. Inferred preset and plugin defaults.
	 * 2. Network defaults.
	 * 3. Per-site options.
	 * 4. Populated ACF options.
	 *
	 * @return array<string,mixed>
	 */
	public function get(): array {
		$blog_id = get_current_blog_id();

		if ( isset( $this->cache[ $blog_id ] ) ) {
			return $this->cache[ $blog_id ];
		}

		$network = is_multisite()
			? get_site_option( 'sira_network_defaults', array() )
			: array();
		$site    = get_option( 'sira_brand_options', array() );
		$acf     = $this->acf_values();

		$this->cache[ $blog_id ] = array_replace_recursive(
			$this->defaults(),
			is_array( $network ) ? $network : array(),
			is_array( $site ) ? $site : array(),
			$acf
		);

		return $this->cache[ $blog_id ];
	}

	/**
	 * Return only the public brand contract used by APIs.
	 *
	 * Secret and operational values such as analytics identifiers are excluded.
	 *
	 * @return array<string,mixed>
	 */
	public function get_public(): array {
		$brand    = $this->get();
		$defaults = $this->defaults();
		$announcement_legacy = self::public_optional_textarea(
			$brand['announcement_bar'] ?? null
		);
		$emergency_legacy = self::public_optional_textarea(
			$brand['emergency_banner'] ?? null
		);
		$announcement = BannerContract::resolve(
			'announcement',
			$brand['announcement'] ?? array(),
			$announcement_legacy,
			BannerContract::SEVERITY_INFO
		);
		$emergency = BannerContract::resolve(
			'emergency',
			$brand['emergency'] ?? array(),
			$emergency_legacy,
			BannerContract::SEVERITY_URGENT
		);

		return array(
			'brand_name'          => self::public_text(
				$brand['brand_name'] ?? null,
				(string) $defaults['brand_name']
			),
			'brand_key'           => self::public_key(
				$brand['brand_key'] ?? null,
				(string) $defaults['brand_key']
			),
			'tagline'             => self::public_optional_text( $brand['tagline'] ?? null ),
			'primary_color'       => self::public_color(
				$brand['primary_color'] ?? null,
				(string) $defaults['primary_color']
			),
			'secondary_color'     => self::public_color(
				$brand['secondary_color'] ?? null,
				(string) $defaults['secondary_color']
			),
			'accent_color'        => self::public_color(
				$brand['accent_color'] ?? null,
				(string) $defaults['accent_color']
			),
			'paper_color'         => self::public_color(
				$brand['paper_color'] ?? null,
				(string) $defaults['paper_color']
			),
			'ink_color'           => self::public_color(
				$brand['ink_color'] ?? null,
				(string) $defaults['ink_color']
			),
			'logo_id'             => self::attachment_id( $brand['logo_id'] ?? 0 ),
			'mark_id'             => self::attachment_id( $brand['mark_id'] ?? 0 ),
			'email'               => self::public_optional_email( $brand['email'] ?? null ),
			'phone'               => self::public_optional_text( $brand['phone'] ?? null ),
			'address'             => self::public_optional_textarea( $brand['address'] ?? null ),
			'description'         => self::public_optional_html( $brand['description'] ?? null ),
			'mission'             => self::public_optional_textarea( $brand['mission'] ?? null ),
			'vision'              => self::public_optional_textarea( $brand['vision'] ?? null ),
			'values'              => self::public_values( $brand['values'] ?? array() ),
			'office_locations'    => self::public_offices( $brand['office_locations'] ?? array() ),
			'social_profiles'     => array(
				'linkedin' => self::public_optional_url( $brand['linkedin_url'] ?? null ),
				'instagram' => self::public_optional_url( $brand['instagram_url'] ?? null ),
				'x'        => self::public_optional_url( $brand['x_url'] ?? null ),
				'youtube'  => self::public_optional_url( $brand['youtube_url'] ?? null ),
			),
			'announcement_banner' => $announcement_legacy,
			'emergency_banner'    => $emergency_legacy,
			'announcement'        => $announcement,
			'emergency'           => $emergency,
		);
	}

	/**
	 * Return populated ACF option values for the current site.
	 *
	 * @return array<string,mixed>
	 */
	private function acf_values(): array {
		if ( ! function_exists( 'get_field' ) ) {
			return array();
		}

		$map = array(
			'sira_brand_name'        => 'brand_name',
			'sira_brand_key'         => 'brand_key',
			'sira_brand_logo'        => 'logo_id',
			'sira_brand_mark'        => 'mark_id',
			'sira_primary_color'     => 'primary_color',
			'sira_secondary_color'   => 'secondary_color',
			'sira_accent_color'      => 'accent_color',
			'sira_brand_email'       => 'email',
			'sira_brand_phone'       => 'phone',
			'sira_brand_address'     => 'address',
			'sira_brand_description' => 'description',
			'sira_brand_mission'     => 'mission',
			'sira_brand_vision'      => 'vision',
			'sira_brand_values'      => 'values',
			'sira_office_locations'          => 'office_locations',
			'sira_announcement_banner_config' => 'announcement',
			'sira_emergency_banner_config'    => 'emergency',
		);
		$out = array();

		foreach ( $map as $field => $key ) {
			$value = get_field( $field, 'option' );

			if ( ! self::is_populated( $value ) ) {
				continue;
			}

			if ( in_array( $key, array( 'logo_id', 'mark_id' ), true ) ) {
				$value = self::attachment_id( $value );
			}

			$out[ $key ] = $value;
		}

		return $out;
	}

	private static function is_populated( mixed $value ): bool {
		if ( null === $value || false === $value || '' === $value ) {
			return false;
		}

		return ! is_array( $value ) || array() !== $value;
	}

	private static function attachment_id( mixed $value ): int {
		if ( is_array( $value ) ) {
			$value = $value['ID'] ?? $value['id'] ?? 0;
		} elseif ( $value instanceof \WP_Post ) {
			$value = $value->ID;
		}

		return absint( $value );
	}

	private static function public_text( mixed $value, string $fallback ): string {
		$sanitized = sanitize_text_field( (string) $value );

		return '' !== $sanitized ? $sanitized : $fallback;
	}

	private static function public_key( mixed $value, string $fallback ): string {
		$sanitized = sanitize_key( (string) $value );

		return '' !== $sanitized ? $sanitized : $fallback;
	}

	private static function public_color( mixed $value, string $fallback ): string {
		$sanitized = sanitize_hex_color( (string) $value );

		return is_string( $sanitized ) && '' !== $sanitized ? $sanitized : $fallback;
	}

	private static function public_optional_text( mixed $value ): ?string {
		$sanitized = sanitize_text_field( (string) $value );

		return '' !== $sanitized ? $sanitized : null;
	}

	private static function public_optional_textarea( mixed $value ): ?string {
		$sanitized = sanitize_textarea_field( (string) $value );

		return '' !== $sanitized ? $sanitized : null;
	}

	private static function public_optional_html( mixed $value ): ?string {
		$sanitized = wp_kses_post( (string) $value );

		return '' !== trim( $sanitized ) ? $sanitized : null;
	}

	private static function public_optional_email( mixed $value ): ?string {
		$sanitized = sanitize_email( (string) $value );

		return '' !== $sanitized ? $sanitized : null;
	}

	private static function public_optional_url( mixed $value ): ?string {
		$sanitized = esc_url_raw( (string) $value );

		return '' !== $sanitized ? $sanitized : null;
	}

	/**
	 * @return array<int,array{title:string,description:?string}>
	 */
	private static function public_values( mixed $value ): array {
		if ( ! is_array( $value ) ) {
			return array();
		}

		$rows = array();

		foreach ( $value as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}

			$title = sanitize_text_field( (string) ( $row['title'] ?? '' ) );

			if ( '' === $title ) {
				continue;
			}

			$description = sanitize_textarea_field( (string) ( $row['copy'] ?? '' ) );

			$rows[] = array(
				'title'       => $title,
				'description' => '' !== $description ? $description : null,
			);
		}

		return $rows;
	}

	/**
	 * @return array<int,array{name:string,address:?string,phone:?string,email:?string}>
	 */
	private static function public_offices( mixed $value ): array {
		if ( ! is_array( $value ) ) {
			return array();
		}

		$rows = array();

		foreach ( $value as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}

			$name = sanitize_text_field( (string) ( $row['name'] ?? '' ) );

			if ( '' === $name ) {
				continue;
			}

			$rows[] = array(
				'name'    => $name,
				'address' => self::public_optional_textarea( $row['address'] ?? null ),
				'phone'   => self::public_optional_text( $row['phone'] ?? null ),
				'email'   => self::public_optional_email( $row['email'] ?? null ),
			);
		}

		return $rows;
	}

	/**
	 * Sanitize per-site brand options.
	 *
	 * @param array<string,mixed> $input Submitted settings.
	 * @return array<string,mixed>
	 */
	public static function sanitize( array $input ): array {
		$defaults = self::instance()->defaults();
		$out      = array();

		$text_fields = array(
			'brand_name',
			'brand_key',
			'tagline',
			'phone',
			'address',
			'analytics_id',
			'emergency_banner',
			'announcement_bar',
		);
		$textarea_fields = array( 'description', 'mission', 'vision' );
		$url_fields      = array(
			'linkedin_url',
			'instagram_url',
			'x_url',
			'youtube_url',
		);
		$email_fields    = array( 'email' );
		$color_fields    = array(
			'primary_color',
			'secondary_color',
			'accent_color',
			'paper_color',
			'ink_color',
		);

		foreach ( $text_fields as $key ) {
			if ( isset( $input[ $key ] ) ) {
				$out[ $key ] = sanitize_text_field( (string) $input[ $key ] );
			}
		}

		foreach ( $textarea_fields as $key ) {
			if ( isset( $input[ $key ] ) ) {
				$out[ $key ] = sanitize_textarea_field( (string) $input[ $key ] );
			}
		}

		foreach ( $url_fields as $key ) {
			if ( isset( $input[ $key ] ) ) {
				$out[ $key ] = esc_url_raw( (string) $input[ $key ] );
			}
		}

		foreach ( $email_fields as $key ) {
			if ( isset( $input[ $key ] ) ) {
				$out[ $key ] = sanitize_email( (string) $input[ $key ] );
			}
		}

		foreach ( $color_fields as $key ) {
			if ( isset( $input[ $key ] ) ) {
				$value       = sanitize_hex_color( (string) $input[ $key ] );
				$out[ $key ] = $value ?: (string) $defaults[ $key ];
			}
		}

		$out['logo_id'] = isset( $input['logo_id'] )
			? absint( $input['logo_id'] )
			: 0;
		$out['mark_id'] = isset( $input['mark_id'] )
			? absint( $input['mark_id'] )
			: 0;

		return $out;
	}
}
