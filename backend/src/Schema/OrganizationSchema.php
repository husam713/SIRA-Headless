<?php
/**
 * Optional WordPress-rendered Organization JSON-LD compatibility fallback.
 */

declare(strict_types=1);

namespace Sira\Core\Schema;

use Sira\Core\Brand\BrandManager;

final class OrganizationSchema {
	public function hooks(): void {
		add_action( 'wp_head', array( $this, 'render' ), 30 );
	}

	public function render(): void {
		if (
			is_admin()
			|| ! $this->is_enabled()
			|| defined( 'WPSEO_VERSION' )
			|| defined( 'RANK_MATH_VERSION' )
		) {
			return;
		}

		$brand = BrandManager::instance()->get();

		$data = array(
			'@context' => 'https://schema.org',
			'@type'    => 'Organization',
			'name'     => (string) $brand['brand_name'],
			'url'      => home_url( '/' ),
		);

		$logo_id = absint( $brand['logo_id'] ?? 0 );

		if ( 0 < $logo_id ) {
			$logo = wp_get_attachment_image_url( $logo_id, 'full' );

			if ( false !== $logo ) {
				$data['logo'] = $logo;
			}
		}

		if ( ! empty( $brand['email'] ) ) {
			$data['email'] = (string) $brand['email'];
		}

		if ( ! empty( $brand['phone'] ) ) {
			$data['telephone'] = (string) $brand['phone'];
		}

		$same_as = array_filter(
			array(
				$brand['linkedin_url'] ?? '',
				$brand['instagram_url'] ?? '',
				$brand['x_url'] ?? '',
				$brand['youtube_url'] ?? '',
			)
		);

		if ( $same_as ) {
			$data['sameAs'] = array_values( $same_as );
		}

		echo '<script type="application/ld+json">'
			. wp_json_encode(
				$data,
				JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
			)
			. '</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	private function is_enabled(): bool {
		$enabled = defined( 'SIRA_CORE_ENABLE_WORDPRESS_SCHEMA' )
			&& true === SIRA_CORE_ENABLE_WORDPRESS_SCHEMA;

		/**
		 * Enable the WordPress-rendered schema compatibility fallback.
		 *
		 * Default is false in headless mode to avoid duplicate schema and
		 * backend-host canonical URLs.
		 */
		return (bool) apply_filters(
			'sira_core_enable_wordpress_schema',
			$enabled
		);
	}
}
