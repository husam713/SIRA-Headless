<?php
/**
 * Writes the SIRA Digital pre-launch placeholder content, in both languages.
 *
 * Run through WP-CLI against the Digital tenant:
 *   wp eval-file digital-seed.php --url=https://digital.siratrgroup.com
 *
 * The payloads live beside this file as digital-seed.json and digital-seed.ar.json
 * so the content is reviewable as content and this file stays the mechanism.
 * Every record it writes carries post meta `_sira_seed=1` — the marker
 * tools/verify-no-seed-content.mjs uses as the launch gate — and every write is
 * idempotent, matched on slug, so re-running updates rather than duplicates.
 *
 * ADR-034 shapes the Arabic pass. Each record carries an EXPLICIT `sira_locale`
 * rather than having its language inferred from its slug, because a slug is
 * editor-editable and a rename would otherwise move a record between languages
 * silently. The `ar-` prefix on custom post types and the `/ar/` page hierarchy
 * are URL decisions; the field is the contract.
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

/** Reads one payload file, or fails loudly. */
function sira_seed_payload( string $path ): array {
	if ( ! file_exists( $path ) ) {
		WP_CLI::error( "Payload not found: {$path}" );
	}

	$decoded = json_decode( (string) file_get_contents( $path ), true );

	if ( ! is_array( $decoded ) ) {
		WP_CLI::error( "Payload is not valid JSON: {$path}" );
	}

	return $decoded;
}

/** Marks a record as seeded and records the language it is written in. */
function sira_seed_mark( int $post_id, string $locale ): void {
	update_post_meta( $post_id, SIRA_SEED_MARKER, '1' );
	update_field( 'field_sira_locale_code', $locale, $post_id );
}

/** Finds an existing post of this type by slug, seeded or not. */
function sira_seed_find( string $post_type, string $slug, int $parent = 0 ): ?int {
	$existing = get_posts(
		array(
			'post_type'        => $post_type,
			'name'             => $slug,
			'post_parent'      => $parent,
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
	string $excerpt = '',
	string $locale = 'en',
	int $parent = 0
): int {
	$existing = sira_seed_find( $post_type, $slug, $parent );

	$postarr = array(
		'post_type'    => $post_type,
		'post_name'    => $slug,
		'post_title'   => $title,
		'post_content' => $content,
		'post_excerpt' => $excerpt,
		'post_parent'  => $parent,
		'post_status'  => 'publish',
	);

	if ( null !== $existing ) {
		$postarr['ID'] = $existing;
	}

	$post_id = wp_insert_post( $postarr, true );

	if ( is_wp_error( $post_id ) ) {
		WP_CLI::error( "Could not write {$post_type}/{$slug}: " . $post_id->get_error_message() );
	}

	sira_seed_mark( (int) $post_id, $locale );

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

/** Custom post types carry the language in their slug as well as their meta. */
function sira_seed_slug( string $slug, string $locale ): string {
	return 'en' === $locale ? $slug : "{$locale}-{$slug}";
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

	$terms = get_terms(
		array(
			'taxonomy'   => 'sira_industry',
			'hide_empty' => false,
			'meta_key'   => SIRA_SEED_MARKER,
			'meta_value' => '1',
			'fields'     => 'ids',
		)
	);

	if ( ! is_wp_error( $terms ) ) {
		foreach ( $terms as $term_id ) {
			wp_delete_term( (int) $term_id, 'sira_industry' );
		}
	}

	WP_CLI::success(
		'Removed ' . count( $seeded ) . ' seeded record(s) and '
		. ( is_wp_error( $terms ) ? 0 : count( $terms ) ) . ' seeded term(s).'
	);
	return;
}

// ---------------------------------------------------------------------------
// Content, once per language
// ---------------------------------------------------------------------------

/**
 * Writes one language's entire content set.
 *
 * `$parent` is the page every standalone page hangs under, which is what turns
 * an Arabic `about` page into `/ar/about/` rather than a second top-level page.
 * English has no parent, so its pages stay at the site root.
 */
function sira_seed_locale_bundle( array $bundle, string $locale, int $parent ): array {
	$counts = array();

	// -- Services ------------------------------------------------------------
	$service_ids = array();

	foreach ( (array) ( $bundle['services'] ?? array() ) as $service ) {
		$body = sprintf(
			'<h2>%s</h2><p>%s</p><h2>%s</h2><p>%s</p><h2>%s</h2><p>%s</p><h2>%s</h2><p>%s</p><h2>%s</h2><p>%s</p><h2>%s</h2><p>%s</p>',
			esc_html( (string) $bundle['labels']['problem'] ),
			esc_html( (string) $service['problem'] ),
			esc_html( (string) $bundle['labels']['changes'] ),
			esc_html( (string) $service['changes'] ),
			esc_html( (string) $bundle['labels']['capability'] ),
			esc_html( (string) $service['capability'] ),
			esc_html( (string) $bundle['labels']['integrates'] ),
			esc_html( (string) $service['integrates'] ),
			esc_html( (string) $bundle['labels']['oversight'] ),
			esc_html( (string) $service['oversight'] ),
			esc_html( (string) $bundle['labels']['outcome'] ),
			esc_html( (string) $service['outcome'] )
		);

		$service_ids[] = sira_seed_upsert(
			'sira_service',
			sira_seed_slug( (string) $service['slug'], $locale ),
			(string) $service['title'],
			$body,
			(string) $service['excerpt'],
			$locale
		);
	}

	$counts['services'] = count( $service_ids );

	// -- Work ----------------------------------------------------------------
	// `sira_project` already exists network-wide and already has a typed
	// frontend contract, so Digital's work reuses it rather than introducing a
	// Digital-only post type for the same idea.
	$work_ids = array();

	foreach ( (array) ( $bundle['work'] ?? array() ) as $item ) {
		$body = sprintf(
			'<h2>%s</h2><p>%s</p><h2>%s</h2><p>%s</p><h2>%s</h2><p>%s</p>',
			esc_html( (string) $bundle['labels']['problem'] ),
			esc_html( (string) $item['problem'] ),
			esc_html( (string) $bundle['labels']['built'] ),
			esc_html( (string) $item['built'] ),
			esc_html( (string) $bundle['labels']['detail'] ),
			esc_html( (string) $item['detail'] )
		);

		$work_id = sira_seed_upsert(
			'sira_project',
			sira_seed_slug( (string) $item['slug'], $locale ),
			(string) $item['title'],
			$body,
			(string) $item['excerpt'],
			$locale
		);

		update_post_meta( $work_id, '_sira_work_kind', (string) $item['kind'] );
		$work_ids[] = $work_id;
	}

	$counts['work'] = count( $work_ids );

	// -- Industries ----------------------------------------------------------
	// Terms of the existing `sira_industry` taxonomy, with the narrative in the
	// term description. An industry is a classification before it is a page,
	// and modelling it as a term keeps it reusable by services and work later.
	$industry_terms = array();

	foreach ( (array) ( $bundle['industries'] ?? array() ) as $industry ) {
		$slug        = sira_seed_slug( (string) $industry['slug'], $locale );
		$description = sprintf(
			'%s|%s|%s',
			(string) $industry['excerpt'],
			(string) $industry['bottleneck'],
			(string) $industry['opportunity']
		);

		$existing = term_exists( $slug, 'sira_industry' );

		if ( $existing ) {
			$term_id = is_array( $existing ) ? (int) $existing['term_id'] : (int) $existing;
			wp_update_term(
				$term_id,
				'sira_industry',
				array(
					'name'        => (string) $industry['title'],
					'description' => $description,
				)
			);
		} else {
			$created = wp_insert_term(
				(string) $industry['title'],
				'sira_industry',
				array( 'slug' => $slug, 'description' => $description )
			);

			if ( is_wp_error( $created ) ) {
				WP_CLI::warning( "Industry {$slug}: " . $created->get_error_message() );
				continue;
			}

			$term_id = (int) $created['term_id'];
		}

		// Terms have no post meta, so the seed marker goes in term meta under
		// the same name, and the language field is addressed the way ACF
		// addresses a term.
		update_term_meta( $term_id, SIRA_SEED_MARKER, '1' );
		update_field( 'field_sira_locale_code', $locale, 'sira_industry_' . $term_id );
		$industry_terms[] = $term_id;
	}

	$counts['industries'] = count( $industry_terms );

	// -- Standalone pages ----------------------------------------------------
	$page_ids = array();

	foreach ( (array) ( $bundle['pages'] ?? array() ) as $page ) {
		$page_ids[ (string) $page['slug'] ] = sira_seed_upsert(
			'page',
			(string) $page['slug'],
			(string) $page['title'],
			(string) $page['content'],
			'',
			$locale,
			$parent
		);

		$intro = (array) ( $page['intro'] ?? array() );

		if ( array() !== $intro ) {
			sira_seed_intro( $page_ids[ (string) $page['slug'] ], $intro );
		}
	}

	// Index pages carry no body of their own — the route composes the records —
	// but they own the heading block at the top and the closing call to action.
	foreach ( (array) ( $bundle['indexPages'] ?? array() ) as $page ) {
		$page_id = sira_seed_upsert(
			'page',
			(string) $page['slug'],
			(string) $page['title'],
			'',
			'',
			$locale,
			$parent
		);

		sira_seed_intro( $page_id, (array) ( $page['intro'] ?? array() ) );
		$page_ids[ (string) $page['slug'] ] = $page_id;
	}

	$counts['pages'] = count( $page_ids );

	return $counts;
}

/** Writes the CMS-authored heading block for one page. */
function sira_seed_intro( int $page_id, array $intro ): void {
	update_field(
		'field_sira_page_intro_eyebrow',
		(string) ( $intro['eyebrow'] ?? '' ),
		$page_id
	);
	update_field(
		'field_sira_page_intro_heading',
		(string) ( $intro['heading'] ?? '' ),
		$page_id
	);
	update_field(
		'field_sira_page_intro_standfirst',
		(string) ( $intro['standfirst'] ?? '' ),
		$page_id
	);
	update_field(
		'field_sira_page_intro_cta_label',
		(string) ( $intro['ctaLabel'] ?? '' ),
		$page_id
	);
	update_field(
		'field_sira_page_intro_cta_heading',
		(string) ( $intro['ctaHeading'] ?? '' ),
		$page_id
	);
}

/** Writes the Digital homepage composition onto one page. */
function sira_seed_homepage( int $home_id, array $home ): void {
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

	update_field(
		'field_sira_digital_capabilities_eyebrow',
		(string) $home['capabilities_eyebrow'],
		$home_id
	);

	$capabilities = array();

	foreach ( (array) $home['capabilities'] as $capability ) {
		$capabilities[] = array(
			'title'   => (string) $capability['title'],
			'summary' => (string) $capability['summary'],
			'link'    => sira_seed_link( $capability['link'] ?? null ),
		);
	}

	update_field( 'field_sira_digital_capabilities', $capabilities, $home_id );

	$marquee       = (array) $home['marquee'];
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
}

// ---------------------------------------------------------------------------
// English
// ---------------------------------------------------------------------------

$seed = sira_seed_payload( __DIR__ . '/digital-seed.json' );

$english = sira_seed_locale_bundle( $seed, 'en', 0 );

$home    = (array) ( $seed['homepage'] ?? array() );
$home_id = sira_seed_upsert( 'page', 'home', (string) $home['title'], '', '', 'en' );

update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $home_id );
sira_seed_homepage( $home_id, $home );

WP_CLI::log(
	sprintf(
		'English — services %d, work %d, industries %d, pages %d, homepage %d (front page)',
		$english['services'],
		$english['work'],
		$english['industries'],
		$english['pages'],
		$home_id
	)
);

// ---------------------------------------------------------------------------
// Arabic (ADR-034)
// ---------------------------------------------------------------------------
// The Arabic homepage is an ordinary page at `/ar/`, and every Arabic page
// hangs beneath it so the URL reads `/ar/about/`. It is not the site's front
// page — WordPress has only one of those — which is why the homepage field
// group's location rules name this page explicitly.

$arabic_seed = sira_seed_payload( __DIR__ . '/digital-seed.ar.json' );
$arabic_home = (array) ( $arabic_seed['homepage'] ?? array() );

$arabic_home_id = sira_seed_upsert(
	'page',
	'ar',
	(string) $arabic_home['title'],
	'',
	'',
	'ar'
);

sira_seed_homepage( $arabic_home_id, $arabic_home );
update_field( 'field_sira_locale_translation_of', $home_id, $arabic_home_id );

$arabic = sira_seed_locale_bundle( $arabic_seed, 'ar', $arabic_home_id );

WP_CLI::log(
	sprintf(
		'Arabic — services %d, work %d, industries %d, pages %d, homepage %d (/ar/)',
		$arabic['services'],
		$arabic['work'],
		$arabic['industries'],
		$arabic['pages'],
		$arabic_home_id
	)
);

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
// One menu per registered location. The Arabic locations are the `_ar` twins
// ADR-034 registered network-wide; a tenant that leaves them unassigned falls
// back to the default-locale menu rather than rendering no navigation.

$locations = array();
$menus     = (array) ( $seed['menus'] ?? array() );

foreach ( (array) ( $arabic_seed['menus'] ?? array() ) as $location => $items ) {
	$menus[ (string) $location ] = $items;
}

foreach ( $menus as $location => $items ) {
	$menu_name = 'Digital ' . ucwords( str_replace( '_', ' ', (string) $location ) );
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
				'menu-item-title'    => (string) $item['title'],
				'menu-item-url'      => (string) $item['url'],
				'menu-item-status'   => 'publish',
				'menu-item-type'     => 'custom',
				'menu-item-position' => $position + 1,
			)
		);
	}

	$locations[ (string) $location ] = (int) $menu_id;
}

set_theme_mod( 'nav_menu_locations', $locations );

WP_CLI::log( 'Menus: ' . implode( ', ', array_keys( $locations ) ) );

WP_CLI::success(
	'Seeded the Digital tenant in English and Arabic. Every record carries '
	. SIRA_SEED_MARKER . '=1 and an explicit sira_locale.'
);
