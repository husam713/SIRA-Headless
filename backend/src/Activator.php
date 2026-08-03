<?php
/**
 * Activation routines.
 */

declare(strict_types=1);

namespace Sira\Core;

use Sira\Core\Content\PostTypes;
use Sira\Core\Content\Taxonomies;

final class Activator {
	public static function activate( bool $network_wide = false ): void {
		if ( is_multisite() && $network_wide ) {
			$site_ids = get_sites(
				array(
					'fields' => 'ids',
					'number' => 0,
				)
			);

			foreach ( $site_ids as $site_id ) {
				switch_to_blog( (int) $site_id );

				try {
					self::activate_site();
				} finally {
					restore_current_blog();
				}
			}

			return;
		}

		self::activate_site();
	}

	private static function activate_site(): void {
		( new PostTypes() )->register();
		( new Taxonomies() )->register();
		flush_rewrite_rules();
	}

	public static function deactivate(): void {
		flush_rewrite_rules();
	}
}
