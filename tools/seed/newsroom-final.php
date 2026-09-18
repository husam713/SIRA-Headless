<?php
/**
 * Makes the newsroom final on one tenant (owner instruction, 2026-09-18).
 *
 *   wp eval-file newsroom-final.php --url=https://cms-consulting.siratrgroup.com
 *   wp eval-file newsroom-final.php dry-run --url=…
 *
 * Reads newsroom-final.json beside it. For every entry the tenant lists it
 * finds the English record by slug across the four editorial types, gives it
 * its final excerpt and body (an existing body is kept where the payload says
 * `keepBody` and one exists), removes the `_sira_seed` placeholder marker,
 * marks it `sira_locale = en`, and writes its Arabic twin as `ar-<slug>` of
 * the same type, pointing back through `sira_translation_of` and borrowing
 * the original's featured image, business units and dates (ADR-037). Records
 * the payload names in `trash` are sent to the bin; `rename` changes a slug.
 * Idempotent. Purges the WPGraphQL object cache at the end.
 *
 * @package Sira
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'SIRA_NEWSROOM_DRY_RUN' ) ) {
	define( 'SIRA_NEWSROOM_DRY_RUN', in_array( 'dry-run', (array) ( $args ?? array() ), true ) );
}

function sira_nr_log( string $line ): void {
	WP_CLI::log( ( SIRA_NEWSROOM_DRY_RUN ? '[dry-run] ' : '' ) . $line );
}

$sira_nr_types = array( 'sira_news', 'sira_insight', 'sira_article', 'sira_press_release' );

/** Finds an editorial record by slug in any of the four types. */
function sira_nr_find( string $slug, array $types ): ?WP_Post {
	$found = get_posts(
		array(
			'post_type'        => $types,
			'name'             => $slug,
			'post_status'      => array( 'publish', 'draft', 'pending', 'private', 'future' ),
			'numberposts'      => 1,
			'suppress_filters' => false,
		)
	);

	return empty( $found ) ? null : $found[0];
}

$sira_nr_path = __DIR__ . '/newsroom-final.json';
if ( ! file_exists( $sira_nr_path ) ) {
	WP_CLI::error( "Payload not found: {$sira_nr_path}" );
}
$sira_nr_seed = json_decode( (string) file_get_contents( $sira_nr_path ), true );
if ( ! is_array( $sira_nr_seed ) ) {
	WP_CLI::error( 'Payload is not valid JSON: ' . json_last_error_msg() );
}

$sira_nr_home   = untrailingslashit( home_url() );
$sira_nr_tenant = $sira_nr_seed['tenants'][ $sira_nr_home ] ?? null;
if ( null === $sira_nr_tenant ) {
	WP_CLI::error( "No newsroom plan for {$sira_nr_home}." );
}

WP_CLI::log( "Final newsroom for {$sira_nr_home} (blog " . get_current_blog_id() . ')' );

// -- Trash and rename -------------------------------------------------------

foreach ( (array) ( $sira_nr_tenant['trash'] ?? array() ) as $sira_nr_slug ) {
	$sira_nr_post = sira_nr_find( (string) $sira_nr_slug, $sira_nr_types );
	if ( null === $sira_nr_post ) {
		continue;
	}
	sira_nr_log( "trash {$sira_nr_post->post_type}/{$sira_nr_post->post_name} (#{$sira_nr_post->ID})" );
	if ( ! SIRA_NEWSROOM_DRY_RUN ) {
		wp_trash_post( $sira_nr_post->ID );
	}
}

foreach ( (array) ( $sira_nr_tenant['trashByTypeSlug'] ?? array() ) as $sira_nr_ref ) {
	$sira_nr_post = sira_nr_find( (string) $sira_nr_ref[1], array( (string) $sira_nr_ref[0] ) );
	if ( null === $sira_nr_post ) {
		continue;
	}
	sira_nr_log( "trash {$sira_nr_post->post_type}/{$sira_nr_post->post_name} (#{$sira_nr_post->ID}, duplicate)" );
	if ( ! SIRA_NEWSROOM_DRY_RUN ) {
		wp_trash_post( $sira_nr_post->ID );
	}
}

foreach ( (array) ( $sira_nr_tenant['rename'] ?? array() ) as $sira_nr_from => $sira_nr_to ) {
	$sira_nr_post = sira_nr_find( (string) $sira_nr_from, $sira_nr_types );
	if ( null === $sira_nr_post ) {
		continue;
	}
	sira_nr_log( "rename {$sira_nr_post->post_type}/{$sira_nr_from} -> {$sira_nr_to}" );
	if ( ! SIRA_NEWSROOM_DRY_RUN ) {
		wp_update_post( array( 'ID' => $sira_nr_post->ID, 'post_name' => (string) $sira_nr_to ) );
	}
}

// -- Entries ------------------------------------------------------------------

$sira_nr_done = 0;

foreach ( (array) ( $sira_nr_tenant['entries'] ?? array() ) as $sira_nr_slug ) {
	$sira_nr_entry = $sira_nr_seed['entries'][ $sira_nr_slug ] ?? null;
	if ( null === $sira_nr_entry ) {
		WP_CLI::warning( "No content for {$sira_nr_slug}; skipped." );
		continue;
	}

	$sira_nr_post = sira_nr_find( (string) $sira_nr_slug, $sira_nr_types );
	if ( null === $sira_nr_post ) {
		WP_CLI::warning( "{$sira_nr_slug} not on this tenant; skipped." );
		continue;
	}

	$sira_nr_keep = ! empty( $sira_nr_entry['keepBody'] ) && '' !== trim( wp_strip_all_tags( $sira_nr_post->post_content ) );
	$sira_nr_body = $sira_nr_keep ? $sira_nr_post->post_content : (string) ( $sira_nr_entry['body'] ?? '' );

	sira_nr_log( sprintf( 'final %s/%s (#%d)%s', $sira_nr_post->post_type, $sira_nr_slug, $sira_nr_post->ID, $sira_nr_keep ? ' — body kept' : '' ) );

	if ( ! SIRA_NEWSROOM_DRY_RUN ) {
		wp_update_post(
			array(
				'ID'           => $sira_nr_post->ID,
				'post_title'   => (string) $sira_nr_entry['title'],
				'post_excerpt' => (string) $sira_nr_entry['excerpt'],
				'post_content' => $sira_nr_body,
				'post_status'  => 'publish',
			)
		);
		delete_post_meta( $sira_nr_post->ID, '_sira_seed' );
		update_field( 'field_sira_locale_code', 'en', $sira_nr_post->ID );

		// The image-led newsroom wants a photograph on every entry. The first of
		// the entry's preferred Atlas images that this tenant holds is set on the
		// original (and inherited by the twin below); an entry that already has
		// one keeps it.
		if ( (int) get_post_thumbnail_id( $sira_nr_post->ID ) <= 0 ) {
			foreach ( (array) ( $sira_nr_entry['images'] ?? array() ) as $sira_nr_key ) {
				$sira_nr_media = get_posts( array( 'post_type' => 'attachment', 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids', 'meta_key' => '_sira_atlas_media', 'meta_value' => (string) $sira_nr_key ) );
				if ( ! empty( $sira_nr_media ) ) {
					set_post_thumbnail( $sira_nr_post->ID, (int) $sira_nr_media[0] );
					break;
				}
			}
		}
	}

	// The Arabic twin.
	$sira_nr_ar   = (array) $sira_nr_entry['ar'];
	$sira_nr_twin = sira_nr_find( "ar-{$sira_nr_slug}", array( $sira_nr_post->post_type ) );
	sira_nr_log( sprintf( '  %s %s/ar-%s', null === $sira_nr_twin ? 'create' : 'update', $sira_nr_post->post_type, $sira_nr_slug ) );

	if ( SIRA_NEWSROOM_DRY_RUN ) {
		++$sira_nr_done;
		continue;
	}

	$sira_nr_postarr = array(
		'post_type'     => $sira_nr_post->post_type,
		'post_name'     => "ar-{$sira_nr_slug}",
		'post_title'    => (string) $sira_nr_ar['title'],
		'post_excerpt'  => (string) $sira_nr_ar['excerpt'],
		'post_content'  => (string) $sira_nr_ar['body'],
		'post_status'   => 'publish',
		'post_date'     => $sira_nr_post->post_date,
		'post_date_gmt' => $sira_nr_post->post_date_gmt,
		'edit_date'     => true,
	);
	if ( null !== $sira_nr_twin ) {
		$sira_nr_postarr['ID'] = $sira_nr_twin->ID;
	}

	$sira_nr_twin_id = wp_insert_post( $sira_nr_postarr, true );
	if ( is_wp_error( $sira_nr_twin_id ) ) {
		WP_CLI::error( "Could not write ar-{$sira_nr_slug}: " . $sira_nr_twin_id->get_error_message() );
	}
	$sira_nr_twin_id = (int) $sira_nr_twin_id;

	update_field( 'field_sira_locale_code', 'ar', $sira_nr_twin_id );
	update_field( 'field_sira_locale_translation_of', $sira_nr_post->ID, $sira_nr_twin_id );

	$sira_nr_thumb = (int) get_post_thumbnail_id( $sira_nr_post->ID );
	if ( $sira_nr_thumb > 0 ) {
		set_post_thumbnail( $sira_nr_twin_id, $sira_nr_thumb );
	}

	$sira_nr_units = wp_get_object_terms( $sira_nr_post->ID, 'sira_business_unit', array( 'fields' => 'slugs' ) );
	if ( is_array( $sira_nr_units ) && ! empty( $sira_nr_units ) ) {
		wp_set_object_terms( $sira_nr_twin_id, $sira_nr_units, 'sira_business_unit', false );
	}

	++$sira_nr_done;
}

if ( ! SIRA_NEWSROOM_DRY_RUN ) {
	do_action( 'wpgraphql_cache_purge_all' );
	sira_nr_log( 'purged the WPGraphQL object cache' );
}

WP_CLI::success( ( SIRA_NEWSROOM_DRY_RUN ? 'Planned' : 'Wrote' ) . " {$sira_nr_done} final entries for {$sira_nr_home}." );
