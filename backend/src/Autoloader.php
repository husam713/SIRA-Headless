<?php
/**
 * Minimal PSR-4 style autoloader.
 */

declare(strict_types=1);

namespace Sira\Core;

final class Autoloader {
	public static function register(): void {
		spl_autoload_register( array( self::class, 'load' ) );
	}

	private static function load( string $class ): void {
		$prefix = __NAMESPACE__ . '\\';
		if ( ! str_starts_with( $class, $prefix ) ) {
			return;
		}
		$relative = substr( $class, strlen( $prefix ) );
		$file = SIRA_CORE_DIR . 'src/' . str_replace( '\\', '/', $relative ) . '.php';
		if ( is_readable( $file ) ) {
			require_once $file;
		}
	}
}
