<?php
/**
 * Main plugin orchestrator.
 */

declare(strict_types=1);

namespace Sira\Core;

use Sira\Core\Admin\DemoImporter;
use Sira\Core\Admin\NetworkSettings;
use Sira\Core\Admin\SiteSettings;
use Sira\Core\Brand\BrandManager;
use Sira\Core\Content\MetaFields;
use Sira\Core\Content\PostTypes;
use Sira\Core\Content\Taxonomies;
use Sira\Core\Forms\LegacyContactForm;
use Sira\Core\GraphQL\ApplicationPasswordAuthentication;
use Sira\Core\GraphQL\BrandSchema;
use Sira\Core\GraphQL\PresentationVisibility;
use Sira\Core\Integrations\AcfIntegration;
use Sira\Core\Rest\BrandRoute;
use Sira\Core\Revalidation\RevalidationWebhook;
use Sira\Core\Schema\OrganizationSchema;

final class Plugin {
	private static ?self $instance = null;
	private bool $booted = false;

	public static function instance(): self {
		return self::$instance ??= new self();
	}

	public function boot(): void {
		if ( $this->booted ) {
			return;
		}

		$this->booted = true;

		load_plugin_textdomain(
			'sira-core',
			false,
			dirname( plugin_basename( SIRA_CORE_FILE ) ) . '/languages'
		);

		BrandManager::instance()->hooks();
		( new PostTypes() )->hooks();
		( new Taxonomies() )->hooks();
		( new MetaFields() )->hooks();
		( new SiteSettings() )->hooks();
		( new DemoImporter() )->hooks();
		( new AcfIntegration() )->hooks();
		( new ApplicationPasswordAuthentication() )->hooks();
		( new BrandSchema() )->hooks();
		( new PresentationVisibility() )->hooks();
		( new BrandRoute() )->hooks();
		( new RevalidationWebhook() )->hooks();
		( new OrganizationSchema() )->hooks();

		/*
		 * Temporary compatibility bridge. Layout shortcodes have been removed.
		 * Keep only the contact shortcode and admin-post handlers until the
		 * approved headless forms endpoint is deployed and existing pages have
		 * been migrated.
		 */
		( new LegacyContactForm() )->hooks();

		if ( is_multisite() ) {
			( new NetworkSettings() )->hooks();
		}
	}
}
