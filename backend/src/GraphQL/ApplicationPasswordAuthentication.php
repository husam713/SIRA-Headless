<?php
/**
 * Application Password support for WPGraphQL HTTP requests.
 */

declare(strict_types=1);

namespace Sira\Core\GraphQL;

final class ApplicationPasswordAuthentication {
	public function hooks(): void {
		add_filter(
			'application_password_is_api_request',
			array( self::class, 'is_api_request' ),
			10,
			1
		);
	}

	public static function is_api_request( bool $is_api_request ): bool {
		if (
			defined( 'GRAPHQL_HTTP_REQUEST' )
			&& true === GRAPHQL_HTTP_REQUEST
		) {
			return true;
		}

		return $is_api_request;
	}
}
