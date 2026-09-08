<?php
/**
 * Writes the SIRA Digital pre-launch placeholder content.
 *
 * Run through WP-CLI against the Digital tenant:
 *   wp eval-file digital-seed.php --url=https://sirahdigital.sa
 *
 * The payload lives beside this file as digital-seed.json so the content is
 * reviewable as content and this file stays the mechanism. Every record it
 * writes carries post meta `_sira_seed=1` — the marker
 * tools/verify-no-seed-content.mjs uses as the launch gate — and every write is
 * idempotent, matched on slug, so re-running updates rather than duplicates.
 *
 * Pass `--remove` as the first script argument to delete everything it made.
 *
 * @package Sira
 */

// No `declare(strict_types=1)` here on purpose: `wp eval-file` eval()s this
// file, and a strict_types declaration is only legal as the first statement of
// a real script. Types are asserted by casting at every boundary instead.

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'SIRA_SEED_MARKER' ) ) {
	define( 'SIRA_SEED_MARKER', '_sira_seed' );
}

$remove = in_array( 'remove', (array) ( $args ?? array() ), true );

$payload_path = __DIR__ . '/digital-seed.json';

if ( ! file_exists( $payload_path ) ) {
	WP_CLI::error( "Payload not found: {$payload_path}" );
}

$seed = json_decode( (string) file_get_contents( $payload_path ), true );

if ( ! is_array( $seed ) ) {
	WP_CLI::error( 'Payload is not valid JSON.' );
}

/** Marks a record as seeded so the launch gate can find it. */
function sira_seed_mark( int $post_id ): void {
	update_post_meta( $post_id, SIRA_SEED_MARKER, '1' );
}

/** Finds an existing post of this type by slug, seeded or not. */
function sira_seed_find( string $post_type, string $slug ): ?int {
	$existing = get_posts(
		array(
			'post_type'        => $post_type,
			'name'             => $slug,
			'post_status'      => array( 'publish', 'draft', 'pending', 'private' ),
			'numberposts'      => 1,
			'fields'           => 'ids',
			'suppress_filters' => false,
		)
	);

	return empty( $existing ) ? null : (int) $existing[0];
}

/** Creates or updates one post, and returns its id. */
function sira_seed_upsert(
	string $post_type,
	string $slug,
	string $title,
	string $content = '',
	string $excerpt = ''
): int {
	$existing = sira_seed_find( $post_type, $slug );

	$postarr = array(
		'post_type'    => $post_type,
		'post_name'    => $slug,
		'post_title'   => $title,
		'post_content' => $content,
		'post_excerpt' => $excerpt,
		'post_status'  => 'publish',
	);

	if ( null !== $existing ) {
		$postarr['ID'] = $existing;
	}

	$post_id = wp_insert_post( $postarr, true );

	if ( is_wp_error( $post_id ) ) {
		WP_CLI::error( "Could not write {$post_type}/{$slug}: " . $post_id->get_error_message() );
	}

	sira_seed_mark( (int) $post_id );

	return (int) $post_id;
}

/** ACF link fields want this exact shape. */
function sira_seed_link( ?array $link ): array {
	if ( null === $link || '' === (string) ( $link['url'] ?? '' ) ) {
		return array();
	}

	return array(
		'title'  => (string) ( $link['title'] ?? '' ),
		'url'    => (string) $link['url'],
		'target' => (string) ( $link['target'] ?? '' ),
	);
}

// ---------------------------------------------------------------------------
// Removal
// ---------------------------------------------------------------------------

if ( $remove ) {
	$seeded = get_posts(
		array(
			'post_type'   => 'any',
			'post_status' => 'any',
			'numberposts' => -1,
			'fields'      => 'ids',
			'meta_key'    => SIRA_SEED_MARKER,
			'meta_value'  => '1',
		)
	);

	foreach ( $seeded as $post_id ) {
		wp_delete_post( (int) $post_id, true );
	}

	WP_CLI::success( 'Removed ' . count( $seeded ) . ' seeded record(s).' );
	return;
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

$service_ids = array();

foreach ( (array) ( $seed['services'] ?? array() ) as $service ) {
	$body = sprintf(
		'<h2>The problem</h2><p>%s</p><h2>What changes</h2><p>%s</p><h2>What the system does</h2><p>%s</p><h2>What it connects to</h2><p>%s</p><h2>Where a person stays in the loop</h2><p>%s</p><h2>What it is for</h2><p>%s</p>',
		esc_html( (string) $service['problem'] ),
		esc_html( (string) $service['changes'] ),
		esc_html( (string) $service['capability'] ),
		esc_html( (string) $service['integrates'] ),
		esc_html( (string) $service['oversight'] ),
		esc_html( (string) $service['outcome'] )
	);

	$service_ids[] = sira_seed_upsert(
		'sira_service',
		(string) $service['slug'],
		(string) $service['title'],
		$body,
		(string) $service['excerpt']
	);
}

WP_CLI::log( 'Services: ' . count( $service_ids ) );

// ---------------------------------------------------------------------------
// Standalone pages
// ---------------------------------------------------------------------------

$page_ids = array();

foreach ( (array) ( $seed['pages'] ?? array() ) as $page ) {
	$page_ids[ (string) $page['slug'] ] = sira_seed_upsert(
		'page',
		(string) $page['slug'],
		(string) $page['title'],
		(string) $page['content']
	);
}

WP_CLI::log( 'Pages: ' . count( $page_ids ) );

// ---------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------

$home = (array) ( $seed['homepage'] ?? array() );
$home_id = sira_seed_upsert( 'page', 'home', (string) $home['title'] );

update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $home_id );

// The discriminator the frontend normalizer checks before anything else.
update_field( 'field_sira_homepage_variant', 'digital', $home_id );

$hero = (array) $home['hero'];
update_field(
	'field_sira_digital_home_hero',
	array(
		'eyebrow'           => (string) $hero['eyebrow'],
		'heading_before'    => (string) $hero['heading_before'],
		'heading_highlight' => (string) $hero['heading_highlight'],
		'heading_after'     => (string) $hero['heading_after'],
		'description'       => (string) $hero['description'],
		'primary_cta'       => sira_seed_link( $hero['primary_cta'] ?? null ),
		'secondary_cta'     => sira_seed_link( $hero['secondary_cta'] ?? null ),
	),
	$home_id
);

update_field( 'field_sira_digital_capabilities_eyebrow', (string) $home['capabilities_eyebrow'], $home_id );

$capabilities = array();

foreach ( (array) $home['capabilities'] as $capability ) {
	$capabilities[] = array(
		'title'   => (string) $capability['title'],
		'summary' => (string) $capability['summary'],
		'link'    => sira_seed_link( $capability['link'] ?? null ),
	);
}

update_field( 'field_sira_digital_capabilities', $capabilities, $home_id );

$marquee = (array) $home['marquee'];
$marquee_items = array();

foreach ( (array) $marquee['items'] as $item ) {
	$marquee_items[] = array( 'label' => (string) $item );
}

update_field(
	'field_sira_digital_home_marquee',
	array(
		'eyebrow'     => (string) $marquee['eyebrow'],
		'heading'     => (string) $marquee['heading'],
		'description' => (string) $marquee['description'],
		'body'        => (string) $marquee['body'],
		'link'        => sira_seed_link( $marquee['link'] ?? null ),
		'items'       => $marquee_items,
	),
	$home_id
);

$wordmark = (array) $home['wordmark'];
update_field(
	'field_sira_digital_home_wordmark',
	array(
		'word'   => (string) $wordmark['word'],
		'lockup' => (string) $wordmark['lockup'],
		'link'   => sira_seed_link( $wordmark['link'] ?? null ),
	),
	$home_id
);

$contact = (array) $home['contact'];
update_field(
	'field_sira_digital_home_contact',
	array(
		'eyebrow'      => (string) $contact['eyebrow'],
		'heading'      => (string) $contact['heading'],
		'description'  => (string) $contact['description'],
		'form_variant' => (string) $contact['form_variant'],
		'form_context' => (string) $contact['form_context'],
	),
	$home_id
);

WP_CLI::log( "Homepage: {$home_id} (front page)" );

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

$locations = array();

foreach ( (array) ( $seed['menus'] ?? array() ) as $location => $items ) {
	$menu_name = 'Digital ' . ucfirst( strtolower( (string) $location ) );
	$menu      = wp_get_nav_menu_object( $menu_name );

	if ( ! $menu ) {
		$menu_id = wp_create_nav_menu( $menu_name );

		if ( is_wp_error( $menu_id ) ) {
			WP_CLI::error( "Could not create menu {$menu_name}: " . $menu_id->get_error_message() );
		}
	} else {
		$menu_id = (int) $menu->term_id;

		foreach ( wp_get_nav_menu_items( $menu_id ) ?: array() as $existing_item ) {
			wp_delete_post( (int) $existing_item->ID, true );
		}
	}

	foreach ( (array) $items as $position => $item ) {
		wp_update_nav_menu_item(
			(int) $menu_id,
			0,
			array(
				'menu-item-title'     => (string) $item['title'],
				'menu-item-url'       => (string) $item['url'],
				'menu-item-status'    => 'publish',
				'menu-item-type'      => 'custom',
				'menu-item-position'  => $position + 1,
			)
		);
	}

	$locations[ (string) $location ] = (int) $menu_id;
}

set_theme_mod( 'nav_menu_locations', $locations );

WP_CLI::log( 'Menus: ' . implode( ', ', array_keys( $locations ) ) );

WP_CLI::success(
	'Seeded the Digital tenant. Every record carries ' . SIRA_SEED_MARKER . '=1.'
);
