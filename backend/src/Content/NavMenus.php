<?php
/**
 * Network-wide navigation menu locations.
 *
 * WPGraphQL only exposes menus that are assigned to a *registered* location.
 * Registration lives here rather than in a theme so the headless frontend keeps
 * working across theme changes, including removing Bricks (ADR-007). ADR-002
 * already makes this plugin the owner of backend content architecture, and
 * ADR-012 fixes native WPGraphQL menus as the navigation contract.
 *
 * The three keys below are exactly the locations the frontend already queries
 * in `frontend/src/queries/navigation.graphql`; WPGraphQL derives the
 * `MenuLocationEnum` values (PRIMARY, FOOTER, LEGAL) from these keys.
 *
 * Without them the live enum degrades to a single `EMPTY` value, so the
 * navigation query does not return zero menus — it fails schema validation
 * outright:
 *
 *   Value "PRIMARY" does not exist in "MenuLocationEnum" enum.
 *
 * Because primary/footer/legal are aliases in one document, that single
 * invalid enum value kills all three at once. Verified live 2026-08-31.
 */

declare(strict_types=1);

namespace Sira\Core\Content;

final class NavMenus {
	public function hooks(): void {
		/*
		 * `init` rather than the conventional `after_setup_theme`: definitions()
		 * calls __(), and after_setup_theme fires before init, which trips the
		 * "translation loading triggered too early" notice WordPress 6.7 added.
		 * register_nav_menus() only populates $_wp_registered_nav_menus, and both
		 * the nav-menus admin screen and WPGraphQL's MenuLocationEnum read that
		 * global well after init, so nothing is lost by the later hook.
		 */
		add_action( 'init', array( $this, 'register' ), 0 );
	}

	/**
	 * Return the SIRA navigation menu location definitions.
	 *
	 * Keys are the WordPress location slugs. WPGraphQL uppercases them to build
	 * `MenuLocationEnum`, so `primary` is queried as `PRIMARY`.
	 *
	 * @return array<string,string> Location slug mapped to its editor-facing description.
	 */
	public static function definitions(): array {
		return array(
			'primary' => __( 'Primary navigation shown in the site header.', 'sira-core' ),
			'footer'  => __( 'Footer navigation shown in the site footer columns.', 'sira-core' ),
			'legal'   => __( 'Legal navigation for privacy, terms, and cookie pages.', 'sira-core' ),
		);
	}

	/**
	 * Register every SIRA navigation location.
	 *
	 * Runs on every site in the network because the plugin is network-activated,
	 * so each tenant gets the same three locations without per-site setup.
	 */
	public function register(): void {
		register_nav_menus( self::definitions() );
	}
}
