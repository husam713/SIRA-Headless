<?php
/**
 * Plugin Name: SIRA Core Platform
 * Plugin URI: https://siragroup.com/
 * Description: Network-wide headless content model, multisite branding, WPGraphQL schema, REST fallback, and governance for SIRA Group.
 * Version: 1.2.1
 * Requires at least: 6.6
 * Requires PHP: 8.3
 * Author: SIRA Group
 * Text Domain: sira-core
 * Network: true
 * License: GPL-2.0-or-later
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SIRA_CORE_VERSION', '1.2.1' );
define( 'SIRA_CORE_FILE', __FILE__ );
define( 'SIRA_CORE_DIR', plugin_dir_path( __FILE__ ) );
define( 'SIRA_CORE_URL', plugin_dir_url( __FILE__ ) );

require_once SIRA_CORE_DIR . 'src/Autoloader.php';
\Sira\Core\Autoloader::register();

register_activation_hook( __FILE__, array( \Sira\Core\Activator::class, 'activate' ) );
register_deactivation_hook( __FILE__, array( \Sira\Core\Activator::class, 'deactivate' ) );

add_action(
	'plugins_loaded',
	static function (): void {
		\Sira\Core\Plugin::instance()->boot();
	}
);

if ( ! function_exists( 'sira_get_brand' ) ) {
	/**
	 * Return the effective brand for the current multisite site.
	 *
	 * @return array<string,mixed>
	 */
	function sira_get_brand(): array {
		return \Sira\Core\Brand\BrandManager::instance()->get();
	}
}

if ( ! function_exists( 'sira_brand' ) ) {
	/**
	 * Return one effective brand value.
	 */
	function sira_brand( string $key, mixed $fallback = '' ): mixed {
		$brand = sira_get_brand();

		return array_key_exists( $key, $brand )
			? $brand[ $key ]
			: $fallback;
	}
}
