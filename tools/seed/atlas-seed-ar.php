<?php
/**
 * Writes the Arabic edition of the Atlas content for one tenant (ADR-037).
 *
 * Run through WP-CLI against the tenant, from a directory holding this file
 * and atlas-seed.ar.json side by side, after atlas-seed.php has run:
 *   wp eval-file atlas-seed-ar.php --url=https://cms-consulting.siratrgroup.com
 *   wp eval-file atlas-seed-ar.php dry-run --url=…   (plan only, no writes)
 *
 * The model is ADR-034's, as Digital already runs it: every Arabic record is
 * its own post in the same site, carries `sira_locale = ar` and points at its
 * English original through `sira_translation_of`. A custom-post translation
 * takes the `ar-` slug prefix (`ar-sira-prime`); an Arabic page hangs under
 * the `ar` page so its URI reads `/ar/our-services/`; the Arabic homepage IS
 * that `ar` page.
 *
 * Nothing visual is authored twice. A translation borrows its English twin's
 * featured image, gallery, business unit, menu order and publish date, and the
 * Arabic homepage starts as a copy of the English homepage's meta with every
 * relationship re-pointed at the translations that exist. Only words change.
 *
 * Idempotent: records are matched on slug (and parent), menus on name, so a
 * re-run updates rather than duplicates. Production content: no `_sira_seed`.
 *
 * @package Sira
 */

// No `declare(strict_types=1)`: `wp eval-file` eval()s this file.

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'SIRA_ATLAS_AR_DRY_RUN' ) ) {
	define( 'SIRA_ATLAS_AR_DRY_RUN', in_array( 'dry-run', (array) ( $args ?? array() ), true ) );
}

/** Logs one line, prefixed when planning only. */
function sira_ar_log( string $line ): void {
	WP_CLI::log( ( SIRA_ATLAS_AR_DRY_RUN ? '[dry-run] ' : '' ) . $line );
}

/** Reads the payload beside this file, or fails loudly. */
function sira_ar_payload(): array {
	$path = __DIR__ . '/atlas-seed.ar.json';

	if ( ! file_exists( $path ) ) {
		WP_CLI::error( "Payload not found: {$path}" );
	}

	$decoded = json_decode( (string) file_get_contents( $path ), true );

	if ( ! is_array( $decoded ) ) {
		WP_CLI::error( 'Payload is not valid JSON: ' . json_last_error_msg() );
	}

	return $decoded;
}

/** Finds a post of this type by slug (and parent, for pages), in any non-trashed status. */
function sira_ar_find( string $post_type, string $slug, ?int $parent = null ): ?int {
	$query = array(
		'post_type'        => $post_type,
		'name'             => $slug,
		'post_status'      => array( 'publish', 'draft', 'pending', 'private', 'future' ),
		'numberposts'      => 1,
		'fields'           => 'ids',
		'suppress_filters' => false,
	);

	if ( null !== $parent ) {
		$query['post_parent'] = $parent;
	}

	$existing = get_posts( $query );

	return empty( $existing ) ? null : (int) $existing[0];
}

/** Sets an ACF field unless planning. */
function sira_ar_field( string $key, $value, $target ): void {
	if ( ! SIRA_ATLAS_AR_DRY_RUN ) {
		update_field( $key, $value, $target );
	}
}

/**
 * Creates or updates one Arabic record and returns its id (0 when planning).
 *
 * `$twin` is the English original. Its presentation — featured image,
 * business unit, menu order, publish date — is copied so the translation
 * renders exactly where and how the original does.
 */
function sira_ar_upsert( string $post_type, string $slug, array $record, ?int $twin, int $parent = 0 ): int {

	$existing = sira_ar_find( $post_type, $slug, 'page' === $post_type ? $parent : null );
	$postarr  = array(
		'post_type'    => $post_type,
		'post_name'    => $slug,
		'post_parent'  => $parent,
		'post_title'   => (string) $record['title'],
		'post_content' => (string) ( $record['content'] ?? '' ),
		'post_excerpt' => (string) ( $record['excerpt'] ?? '' ),
		'post_status'  => 'publish',
	);

	if ( null !== $twin ) {
		$original = get_post( $twin );
		if ( $original instanceof WP_Post ) {
			$postarr['menu_order']    = $original->menu_order;
			$postarr['post_date']     = $original->post_date;
			$postarr['post_date_gmt'] = $original->post_date_gmt;
			$postarr['edit_date']     = true;
		}
	}

	if ( null !== $existing ) {
		$postarr['ID'] = $existing;
	}

	sira_ar_log( sprintf( '%s %s/%s%s', null === $existing ? 'create' : 'update', $post_type, $slug, null === $twin ? ' (no English twin)' : " ⇐ {$twin}" ) );

	if ( SIRA_ATLAS_AR_DRY_RUN ) {
		return (int) ( $existing ?? 0 );
	}

	$post_id = wp_insert_post( $postarr, true );

	if ( is_wp_error( $post_id ) ) {
		WP_CLI::error( "Could not write {$post_type}/{$slug}: " . $post_id->get_error_message() );
	}

	$post_id = (int) $post_id;

	update_field( 'field_sira_locale_code', 'ar', $post_id );

	if ( null !== $twin ) {
		update_field( 'field_sira_locale_translation_of', $twin, $post_id );

		$thumbnail = (int) get_post_thumbnail_id( $twin );
		if ( $thumbnail > 0 ) {
			set_post_thumbnail( $post_id, $thumbnail );
		}

		$units = wp_get_object_terms( $twin, 'sira_business_unit', array( 'fields' => 'slugs' ) );
		if ( is_array( $units ) && ! empty( $units ) ) {
			wp_set_object_terms( $post_id, $units, 'sira_business_unit', false );
		}
	}

	return $post_id;
}

/**
 * Copies every ACF value from one post to another and re-points relationships.
 *
 * ACF stores a field as `name => value` plus `_name => field_key`; both are
 * copied so the clone is editable in the admin, not just readable over GraphQL.
 * Any value that is a list of post ids is mapped through `$translations`
 * (English id => Arabic id), so a chapter that curated the English projects
 * curates their translations instead. Ids without a translation — images,
 * partners, documents, news — stay as they are.
 */
function sira_ar_clone_meta( int $from, int $to, array $translations ): void {

	if ( SIRA_ATLAS_AR_DRY_RUN ) {
		sira_ar_log( "clone meta {$from} -> {$to}" );
		return;
	}

	$protected = array( '_edit_lock', '_edit_last', '_wp_page_template', '_wp_old_slug', '_thumbnail_id', 'sira_locale', '_sira_locale', 'sira_translation_of', '_sira_translation_of' );

	foreach ( get_post_meta( $from ) as $key => $values ) {
		if ( in_array( $key, $protected, true ) || str_starts_with( $key, '_wp_' ) ) {
			continue;
		}

		$value = maybe_unserialize( $values[0] );

		if ( is_array( $value ) && ! empty( $value ) && array_is_list( $value ) && sira_ar_all_ids( $value ) ) {
			$value = array_map(
				static fn( $id ) => (string) ( $translations[ (int) $id ] ?? $id ),
				$value
			);
		}

		update_post_meta( $to, $key, $value );
	}
}

/** Whether every entry looks like a post id. */
function sira_ar_all_ids( array $values ): bool {
	foreach ( $values as $value ) {
		if ( ! is_numeric( $value ) || (int) $value <= 0 ) {
			return false;
		}
	}
	return true;
}

/**
 * Applies the authored Arabic values to a homepage.
 *
 * `$meta` is keyed by ACF meta name — `hero_heading_before`,
 * `hero_slides_0_title_override`, `branch_statistics_1_label` — exactly as
 * ACF stores a group's or a repeater row's sub-field. Writing the meta name
 * directly, after the clone above put the `_name => field_key` references in
 * place, is what keeps a repeater row's other columns (its images, its
 * business unit) untouched.
 */
function sira_ar_apply_meta( int $post_id, array $meta ): void {
	foreach ( $meta as $name => $value ) {
		if ( is_array( $value ) && isset( $value['@records'] ) ) {
			// A relationship authored by slug: the Arabic translations of the
			// named English records, in that order, skipping any not yet written.
			$ids = array();
			foreach ( (array) $value['@records'] as $reference ) {
				$id = sira_ar_find( (string) $reference[0], 'ar-' . (string) $reference[1] );
				if ( null === $id ) {
					WP_CLI::warning( "{$name}: no Arabic {$reference[0]}/{$reference[1]} on this tenant; left out." );
					continue;
				}
				$ids[] = (string) $id;
			}
			$value = $ids;
		} elseif ( is_array( $value ) && isset( $value['url'] ) ) {
			// A link field: ACF stores title/url/target as one serialized array.
			$value = array(
				'title'  => (string) ( $value['title'] ?? '' ),
				'url'    => (string) $value['url'],
				'target' => (string) ( $value['target'] ?? '' ),
			);
		}

		if ( SIRA_ATLAS_AR_DRY_RUN ) {
			continue;
		}

		update_post_meta( $post_id, (string) $name, $value );
	}
	sira_ar_log( 'homepage meta: ' . count( $meta ) . ' values' );
}

/** Replaces one menu's items and assigns it to a location, keeping the others. */
function sira_ar_menu( string $name, string $location, array $items ): void {

	sira_ar_log( "menu {$name} -> {$location}: " . count( $items ) . ' items' );

	if ( SIRA_ATLAS_AR_DRY_RUN ) {
		return;
	}

	$menu = wp_get_nav_menu_object( $name );

	if ( ! $menu ) {
		$menu_id = wp_create_nav_menu( $name );

		if ( is_wp_error( $menu_id ) ) {
			WP_CLI::error( "Could not create menu {$name}: " . $menu_id->get_error_message() );
		}
	} else {
		$menu_id = (int) $menu->term_id;

		foreach ( wp_get_nav_menu_items( $menu_id ) ?: array() as $existing_item ) {
			wp_delete_post( (int) $existing_item->ID, true );
		}
	}

	foreach ( array_values( $items ) as $position => $item ) {
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

	$locations              = (array) get_theme_mod( 'nav_menu_locations', array() );
	$locations[ $location ] = (int) $menu_id;
	set_theme_mod( 'nav_menu_locations', $locations );
}

$sira_ar_seed   = sira_ar_payload();
$sira_ar_home   = untrailingslashit( home_url() );
$sira_ar_tenant = $sira_ar_seed['tenants'][ $sira_ar_home ] ?? null;

if ( null === $sira_ar_tenant ) {
	WP_CLI::error( "No Arabic Atlas content for {$sira_ar_home}; tenants in payload: " . implode( ', ', array_keys( $sira_ar_seed['tenants'] ) ) );
}

WP_CLI::log( "Arabic Atlas content for {$sira_ar_home} (blog " . get_current_blog_id() . ')' );

// English id => Arabic id, for re-pointing the homepage's relationships.
$sira_ar_translations = array();

// -- Custom post types ------------------------------------------------------
// Each record names its English twin by slug; the Arabic slug is `ar-<slug>`.
// Companies first: projects and investments point at them.

foreach ( array( 'companies' => 'sira_company', 'services' => 'sira_service', 'projects' => 'sira_project', 'investments' => 'sira_investment', 'testimonials' => 'sira_testimonial' ) as $sira_ar_bucket => $sira_ar_type ) {
	foreach ( (array) ( $sira_ar_tenant[ $sira_ar_bucket ] ?? array() ) as $sira_ar_record ) {
		$sira_ar_slug = (string) $sira_ar_record['slug'];
		$sira_ar_twin = sira_ar_find( $sira_ar_type, $sira_ar_slug );

		if ( null === $sira_ar_twin ) {
			WP_CLI::warning( "{$sira_ar_type}/{$sira_ar_slug} has no English record on this tenant; skipped." );
			continue;
		}

		$sira_ar_id = sira_ar_upsert( $sira_ar_type, "ar-{$sira_ar_slug}", $sira_ar_record, $sira_ar_twin );

		if ( $sira_ar_id <= 0 ) {
			continue;
		}

		$sira_ar_translations[ $sira_ar_twin ] = $sira_ar_id;

		switch ( $sira_ar_type ) {
			case 'sira_project':
				// The English record's gallery and relation, then the Arabic facts.
				sira_ar_field( 'field_project_gallery', (array) get_field( 'field_project_gallery', $sira_ar_twin, false ), $sira_ar_id );
				sira_ar_field( 'field_project_subtitle', (string) $sira_ar_record['subtitle'], $sira_ar_id );
				sira_ar_field( 'field_project_location', (string) $sira_ar_record['location'], $sira_ar_id );
				sira_ar_field( 'field_project_status', (string) $sira_ar_record['status'], $sira_ar_id );
				$sira_ar_stats = array();
				foreach ( (array) ( $sira_ar_record['stats'] ?? array() ) as $sira_ar_stat ) {
					$sira_ar_stats[] = array(
						'value' => (string) $sira_ar_stat[0],
						'label' => (string) $sira_ar_stat[1],
					);
				}
				sira_ar_field( 'field_project_stats', $sira_ar_stats, $sira_ar_id );
				// The related company: its translation once that exists (companies
				// are written before projects in the payload), else the original.
				$sira_ar_company = (array) get_field( 'field_project_company', $sira_ar_twin, false );
				if ( ! empty( $sira_ar_company ) ) {
					sira_ar_field( 'field_project_company', array_map( static fn( $id ) => $sira_ar_translations[ (int) $id ] ?? (int) $id, $sira_ar_company ), $sira_ar_id );
				}
				break;

			case 'sira_company':
				sira_ar_field( 'field_sira_company_short_descriptor', (string) $sira_ar_record['descriptor'], $sira_ar_id );
				sira_ar_field( 'field_sira_company_operating_status', (string) get_field( 'field_sira_company_operating_status', $sira_ar_twin, false ), $sira_ar_id );
				$sira_ar_card = (int) get_field( 'field_sira_company_card_image', $sira_ar_twin, false );
				if ( $sira_ar_card > 0 ) {
					sira_ar_field( 'field_sira_company_card_image', $sira_ar_card, $sira_ar_id );
				}
				break;

			case 'sira_investment':
				sira_ar_field( 'field_sira_investment_public_display', 1, $sira_ar_id );
				sira_ar_field( 'field_sira_investment_ticket_size', (string) $sira_ar_record['ticket_size'], $sira_ar_id );
				foreach ( array( 'field_sira_investment_related_company', 'field_sira_investment_related_project', 'field_sira_investment_one_pager' ) as $sira_ar_relation ) {
					$sira_ar_ids = (array) get_field( $sira_ar_relation, $sira_ar_twin, false );
					if ( ! empty( $sira_ar_ids ) ) {
						sira_ar_field( $sira_ar_relation, array_map( static fn( $id ) => $sira_ar_translations[ (int) $id ] ?? (int) $id, $sira_ar_ids ), $sira_ar_id );
					}
				}
				break;

			case 'sira_testimonial':
				sira_ar_field( 'field_sira_testimonial_role', (string) $sira_ar_record['role'], $sira_ar_id );
				sira_ar_field( 'field_sira_testimonial_organization', (string) $sira_ar_record['organization'], $sira_ar_id );
				sira_ar_field( 'field_sira_testimonial_consent', 1, $sira_ar_id );
				sira_ar_field( 'field_sira_testimonial_consent_recorded', (string) get_field( 'field_sira_testimonial_consent_recorded', $sira_ar_twin, false ), $sira_ar_id );
				break;
		}
	}
}

// -- The Arabic homepage: the `ar` page --------------------------------------

$sira_ar_front = (int) get_option( 'page_on_front' );
$sira_ar_home_record = (array) ( $sira_ar_tenant['home'] ?? array() );
$sira_ar_home_id = sira_ar_upsert( 'page', 'ar', array( 'title' => (string) ( $sira_ar_home_record['title'] ?? 'الرئيسية' ) ), $sira_ar_front > 0 ? $sira_ar_front : null );

if ( $sira_ar_home_id > 0 && $sira_ar_front > 0 ) {
	sira_ar_clone_meta( $sira_ar_front, $sira_ar_home_id, $sira_ar_translations );
	sira_ar_apply_meta( $sira_ar_home_id, (array) ( $sira_ar_home_record['meta'] ?? array() ) );
	// The clone copied the English locale fields' values before they were
	// filtered; say it again so the record ends up unambiguous.
	sira_ar_field( 'field_sira_locale_code', 'ar', $sira_ar_home_id );
	sira_ar_field( 'field_sira_locale_translation_of', $sira_ar_front, $sira_ar_home_id );
	$sira_ar_translations[ $sira_ar_front ] = $sira_ar_home_id;
}

// -- Pages under /ar/ ----------------------------------------------------------
// Never with parent 0: that is where the English pages live, and a lookup
// there would find and overwrite them. When planning, no `ar` page id exists
// yet, so an impossible parent keeps the plan honest ("create").

if ( ! SIRA_ATLAS_AR_DRY_RUN && $sira_ar_home_id <= 0 ) {
	WP_CLI::error( 'The `ar` homepage was not written; the Arabic pages need it as their parent.' );
}

$sira_ar_pages_parent = $sira_ar_home_id > 0 ? $sira_ar_home_id : -1;

foreach ( (array) ( $sira_ar_tenant['pages'] ?? array() ) as $sira_ar_page ) {
	$sira_ar_slug = (string) $sira_ar_page['slug'];
	$sira_ar_twin = sira_ar_find( 'page', $sira_ar_slug, 0 );

	if ( null === $sira_ar_twin ) {
		WP_CLI::warning( "page/{$sira_ar_slug} has no English record on this tenant; skipped." );
		continue;
	}

	$sira_ar_id = sira_ar_upsert( 'page', $sira_ar_slug, $sira_ar_page, $sira_ar_twin, $sira_ar_pages_parent );

	if ( $sira_ar_id <= 0 ) {
		continue;
	}

	$sira_ar_intro = (array) $sira_ar_page['intro'];
	sira_ar_field( 'field_sira_page_intro_eyebrow', (string) $sira_ar_intro['eyebrow'], $sira_ar_id );
	sira_ar_field( 'field_sira_page_intro_heading', (string) $sira_ar_intro['heading'], $sira_ar_id );
	sira_ar_field( 'field_sira_page_intro_standfirst', (string) $sira_ar_intro['standfirst'], $sira_ar_id );
	sira_ar_field( 'field_sira_page_intro_cta_label', (string) $sira_ar_intro['cta_label'], $sira_ar_id );
	sira_ar_field( 'field_sira_page_intro_cta_heading', (string) $sira_ar_intro['cta_heading'], $sira_ar_id );
}

// -- Navigation ------------------------------------------------------------------
// The `_ar` locations ADR-034 registered network-wide; a location left
// unassigned falls back to the English menu in the frontend.

$sira_ar_menu_prefix = (string) ( $sira_ar_tenant['menu_prefix'] ?? 'Arabic' );

foreach ( (array) ( $sira_ar_tenant['menus'] ?? array() ) as $sira_ar_location => $sira_ar_items ) {
	sira_ar_menu( $sira_ar_menu_prefix . ' ' . ucwords( str_replace( '_', ' ', (string) $sira_ar_location ) ), (string) $sira_ar_location, (array) $sira_ar_items );
}

WP_CLI::success( ( SIRA_ATLAS_AR_DRY_RUN ? 'Planned' : 'Wrote' ) . " Arabic Atlas content for {$sira_ar_home}: " . count( $sira_ar_translations ) . ' translations linked.' );
