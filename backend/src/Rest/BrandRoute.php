<?php
/**
 * Temporary public brand REST compatibility endpoint.
 */

declare(strict_types=1);

namespace Sira\Core\Rest;

use Sira\Core\Brand\BrandManager;

final class BrandRoute {
	public function hooks(): void {
		add_action( 'rest_api_init', array( $this, 'register' ) );
	}

	public function register(): void {
		register_rest_route(
			'sira/v1',
			'/brand',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	public function get(): \WP_REST_Response {
		$brand = BrandManager::instance()->get_public();

		/*
		 * Preserve the legacy REST key names while sourcing only from the
		 * curated public brand contract. New integrations must use siraBrand.
		 */
		$data = array(
			'brand_name'      => $brand['brand_name'],
			'brand_key'       => $brand['brand_key'],
			'tagline'         => $brand['tagline'],
			'primary_color'   => $brand['primary_color'],
			'secondary_color' => $brand['secondary_color'],
			'accent_color'    => $brand['accent_color'],
			'description'     => $brand['description'],
			'mission'         => $brand['mission'],
			'vision'          => $brand['vision'],
			'office_locations' => $brand['office_locations'],
			'linkedin_url'    => $brand['social_profiles']['linkedin'] ?? null,
			'instagram_url'   => $brand['social_profiles']['instagram'] ?? null,
			'x_url'           => $brand['social_profiles']['x'] ?? null,
			'youtube_url'     => $brand['social_profiles']['youtube'] ?? null,
		);

		return new \WP_REST_Response( $data, 200 );
	}
}
