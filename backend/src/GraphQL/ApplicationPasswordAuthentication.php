<?php
/**
 * Application Password support for WPGraphQL HTTP requests.
 */

declare(strict_types=1);

namespace Sira\Core\GraphQL;

final class ApplicationPasswordAuthentication {
	private const GRAPHQL_ENDPOINT_PATHS = array(
		'/graphql',
		'/graphql/',
	);

	public function hooks(): void {
		add_filter(
			'application_password_is_api_request',
			array( self::class, 'is_api_request' ),
			10,
			1
		);
	}

	public static function is_api_request( bool $is_api_request ): bool {
		if ( $is_api_request ) {
			return true;
		}

		if (
			defined( 'GRAPHQL_HTTP_REQUEST' )
			&& true === GRAPHQL_HTTP_REQUEST
		) {
			return true;
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- The parsed path is compared against an exact allowlist and never rendered.
		$request_uri = $_SERVER['REQUEST_URI'] ?? null;

		if ( ! is_string( $request_uri ) || '' === $request_uri ) {
			return false;
		}

		$request_path = wp_parse_url( $request_uri, PHP_URL_PATH );

		return is_string( $request_path )
			&& in_array( $request_path, self::GRAPHQL_ENDPOINT_PATHS, true );
	}
}
