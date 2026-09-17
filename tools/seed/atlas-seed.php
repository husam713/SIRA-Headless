<?php
/**
 * Writes the Atlas page content for one tenant of the SIRA multisite.
 *
 * Run through WP-CLI against the tenant, from a directory holding this file
 * and atlas-seed.json side by side:
 *   wp eval-file atlas-seed.php --url=https://cms-consulting.siratrgroup.com
 *   wp eval-file atlas-seed.php dry-run --url=…   (plan only, no writes)
 *
 * The payload keys tenants by home URL, so one file carries Group and the four
 * companies and the tenant is selected by `--url`. Every write is idempotent —
 * pages, services, projects and testimonials are matched on slug; imported
 * media is matched on the `_sira_atlas_media` key it carries — so re-running
 * updates rather than duplicates.
 *
 * This is production content, not placeholder (owner instruction, 2026-09-17):
 * no record carries `_sira_seed`. Photography is interim and every imported
 * image records its source, author and licence on the attachment (caption and
 * description) so it can be replaced one by one.
 *
 * @package Sira
 */

// No `declare(strict_types=1)`: `wp eval-file` eval()s this file.

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// A constant rather than a variable: `wp eval-file` runs this file inside a
// function scope, so a top-level variable is not visible as a global.
if ( ! defined( 'SIRA_ATLAS_DRY_RUN' ) ) {
	define( 'SIRA_ATLAS_DRY_RUN', in_array( 'dry-run', (array) ( $args ?? array() ), true ) );
}

/** Logs one line, prefixed when planning only. */
function sira_atlas_log( string $line ): void {
	WP_CLI::log( ( SIRA_ATLAS_DRY_RUN ? '[dry-run] ' : '' ) . $line );
}

/** Reads the payload beside this file, or fails loudly. */
function sira_atlas_payload(): array {
	$path = __DIR__ . '/atlas-seed.json';

	if ( ! file_exists( $path ) ) {
		WP_CLI::error( "Payload not found: {$path}" );
	}

	$decoded = json_decode( (string) file_get_contents( $path ), true );

	if ( ! is_array( $decoded ) ) {
		WP_CLI::error( 'Payload is not valid JSON: ' . json_last_error_msg() );
	}

	return $decoded;
}

/** Finds a post of this type by slug, in any non-trashed status. */
function sira_atlas_find( string $post_type, string $slug ): ?int {
	$existing = get_posts(
		array(
			'post_type'        => $post_type,
			'name'             => $slug,
			'post_status'      => array( 'publish', 'draft', 'pending', 'private', 'future' ),
			'numberposts'      => 1,
			'fields'           => 'ids',
			'suppress_filters' => false,
		)
	);

	return empty( $existing ) ? null : (int) $existing[0];
}

/** Creates or updates one post and returns its id (0 when planning). */
function sira_atlas_upsert( string $post_type, array $record, array $extra = array() ): int {

	$slug     = (string) $record['slug'];
	$existing = sira_atlas_find( $post_type, $slug );
	$postarr  = array_merge(
		array(
			'post_type'    => $post_type,
			'post_name'    => $slug,
			'post_title'   => (string) $record['title'],
			'post_content' => (string) ( $record['content'] ?? '' ),
			'post_excerpt' => (string) ( $record['excerpt'] ?? '' ),
			'post_status'  => 'publish',
		),
		$extra
	);

	if ( null !== $existing ) {
		$postarr['ID'] = $existing;
	}

	sira_atlas_log( sprintf( '%s %s/%s', null === $existing ? 'create' : 'update', $post_type, $slug ) );

	if ( SIRA_ATLAS_DRY_RUN ) {
		return (int) ( $existing ?? 0 );
	}

	$post_id = wp_insert_post( $postarr, true );

	if ( is_wp_error( $post_id ) ) {
		WP_CLI::error( "Could not write {$post_type}/{$slug}: " . $post_id->get_error_message() );
	}

	return (int) $post_id;
}

/** Sets an ACF field unless planning. */
function sira_atlas_field( string $key, $value, $target ): void {

	if ( ! SIRA_ATLAS_DRY_RUN ) {
		update_field( $key, $value, $target );
	}
}

/**
 * Resolves one media key to an attachment id on this tenant, importing it on
 * first use. A `url` entry is downloaded; a `path` entry is copied from the
 * network's uploads directory (a file that already belongs to SIRA).
 */
function sira_atlas_media( string $key, array $media, array &$cache ): int {

	if ( isset( $cache[ $key ] ) ) {
		return $cache[ $key ];
	}

	if ( ! isset( $media[ $key ] ) ) {
		WP_CLI::error( "Unknown media key: {$key}" );
	}

	$found = get_posts(
		array(
			'post_type'   => 'attachment',
			'post_status' => 'any',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => '_sira_atlas_media',
			'meta_value'  => $key,
		)
	);

	if ( ! empty( $found ) ) {
		$cache[ $key ] = (int) $found[0];
		return $cache[ $key ];
	}

	$entry = $media[ $key ];
	sira_atlas_log( "import media {$key} -> {$entry['file']}" );

	if ( SIRA_ATLAS_DRY_RUN ) {
		$cache[ $key ] = 0;
		return 0;
	}

	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	if ( isset( $entry['path'] ) ) {
		// The network uploads root, whichever tenant we are on.
		$root   = WP_CONTENT_DIR . '/uploads/';
		$source = $root . ltrim( (string) $entry['path'], '/' );

		if ( ! file_exists( $source ) ) {
			WP_CLI::error( "Source file missing: {$source}" );
		}

		$tmp = wp_tempnam( $entry['file'] );
		copy( $source, $tmp );
	} else {
		$tmp = download_url( (string) $entry['url'], 120 );

		if ( is_wp_error( $tmp ) ) {
			WP_CLI::error( "Download failed for {$key}: " . $tmp->get_error_message() );
		}
	}

	$attachment_id = media_handle_sideload(
		array(
			'name'     => (string) $entry['file'],
			'tmp_name' => $tmp,
		),
		0,
		(string) $entry['title'],
		array(
			'post_title'   => (string) $entry['title'],
			'post_excerpt' => sprintf( 'Photo: %s (%s)', $entry['credit'], $entry['license'] ),
			'post_content' => '' === (string) $entry['page']
				? sprintf( '%s. Licence: %s. Interim image, to be replaced.', $entry['credit'], $entry['license'] )
				: sprintf( 'Source: %s — %s. Licence: %s. Interim image, to be replaced.', $entry['page'], $entry['credit'], $entry['license'] ),
		)
	);

	if ( is_wp_error( $attachment_id ) ) {
		@unlink( $tmp ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		WP_CLI::error( "Sideload failed for {$key}: " . $attachment_id->get_error_message() );
	}

	update_post_meta( (int) $attachment_id, '_wp_attachment_image_alt', (string) $entry['alt'] );
	update_post_meta( (int) $attachment_id, '_sira_atlas_media', $key );

	$cache[ $key ] = (int) $attachment_id;

	return $cache[ $key ];
}

/** Ensures the business-unit term exists and assigns it. */
function sira_atlas_unit( int $post_id, string $slug, array $units ): void {

	if ( SIRA_ATLAS_DRY_RUN ) {
		return;
	}

	$term = get_term_by( 'slug', $slug, 'sira_business_unit' );

	if ( false === $term ) {
		$created = wp_insert_term( (string) ( $units[ $slug ] ?? $slug ), 'sira_business_unit', array( 'slug' => $slug ) );

		if ( is_wp_error( $created ) ) {
			WP_CLI::error( "Could not create business unit {$slug}: " . $created->get_error_message() );
		}

		sira_atlas_log( "created business unit {$slug}" );
	}

	wp_set_object_terms( $post_id, array( $slug ), 'sira_business_unit', false );
}

/** Repairs an attachment whose file is missing from disk by copying it from another path. */
function sira_atlas_repair( array $repair ): void {

	$attachment_id = (int) $repair['attachment'];
	$target        = (string) get_attached_file( $attachment_id );
	$source        = WP_CONTENT_DIR . '/uploads/' . ltrim( (string) $repair['path'], '/' );

	if ( '' === $target ) {
		WP_CLI::warning( "Attachment {$attachment_id} not found; nothing to repair." );
		return;
	}

	if ( file_exists( $target ) ) {
		sira_atlas_log( "attachment {$attachment_id} already has its file; skipped" );
		return;
	}

	if ( ! file_exists( $source ) ) {
		WP_CLI::error( "Repair source missing: {$source}" );
	}

	sira_atlas_log( "repair attachment {$attachment_id} from {$repair['path']}" );

	if ( SIRA_ATLAS_DRY_RUN ) {
		return;
	}

	require_once ABSPATH . 'wp-admin/includes/image.php';
	wp_mkdir_p( dirname( $target ) );
	copy( $source, $target );
	wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $target ) );
}

$sira_atlas_seed   = sira_atlas_payload();
$sira_atlas_home   = untrailingslashit( home_url() );
$sira_atlas_tenant = $sira_atlas_seed['tenants'][ $sira_atlas_home ] ?? null;

if ( null === $sira_atlas_tenant ) {
	WP_CLI::error( "No Atlas content for {$sira_atlas_home}; tenants in payload: " . implode( ', ', array_keys( $sira_atlas_seed['tenants'] ) ) );
}

$sira_atlas_media = $sira_atlas_seed['media'];
$sira_atlas_units = $sira_atlas_seed['units'];
$sira_atlas_cache = array();

WP_CLI::log( "Atlas content for {$sira_atlas_home} (blog " . get_current_blog_id() . ')' );

foreach ( (array) ( $sira_atlas_tenant['repair'] ?? array() ) as $sira_atlas_item ) {
	sira_atlas_repair( $sira_atlas_item );
}

// Brand office locations: the places chapter and the contact page read them.
if ( isset( $sira_atlas_tenant['offices'] ) ) {
	$sira_atlas_rows = array();
	foreach ( $sira_atlas_tenant['offices'] as $sira_atlas_office ) {
		$sira_atlas_rows[] = array(
			'name'    => (string) $sira_atlas_office['name'],
			'address' => (string) $sira_atlas_office['address'],
			'phone'   => (string) ( $sira_atlas_office['phone'] ?? '' ),
			'email'   => (string) ( $sira_atlas_office['email'] ?? '' ),
		);
	}
	sira_atlas_log( 'offices: ' . count( $sira_atlas_rows ) . ' locations' );
	sira_atlas_field( 'field_sira_office_locations', $sira_atlas_rows, 'option' );
}

foreach ( (array) ( $sira_atlas_tenant['pages'] ?? array() ) as $sira_atlas_page ) {
	$sira_atlas_id = sira_atlas_upsert( 'page', $sira_atlas_page );

	if ( $sira_atlas_id > 0 ) {
		$sira_atlas_intro = (array) $sira_atlas_page['intro'];
		sira_atlas_field( 'field_sira_page_intro_eyebrow', (string) $sira_atlas_intro['eyebrow'], $sira_atlas_id );
		sira_atlas_field( 'field_sira_page_intro_heading', (string) $sira_atlas_intro['heading'], $sira_atlas_id );
		sira_atlas_field( 'field_sira_page_intro_standfirst', (string) $sira_atlas_intro['standfirst'], $sira_atlas_id );
		sira_atlas_field( 'field_sira_page_intro_cta_label', (string) $sira_atlas_intro['cta_label'], $sira_atlas_id );
		sira_atlas_field( 'field_sira_page_intro_cta_heading', (string) $sira_atlas_intro['cta_heading'], $sira_atlas_id );
		sira_atlas_field( 'field_sira_locale_code', 'en', $sira_atlas_id );
	}

	if ( isset( $sira_atlas_page['image'] ) ) {
		$sira_atlas_thumb = sira_atlas_media( (string) $sira_atlas_page['image'], $sira_atlas_media, $sira_atlas_cache );
		if ( $sira_atlas_id > 0 && $sira_atlas_thumb > 0 ) {
			set_post_thumbnail( $sira_atlas_id, $sira_atlas_thumb );
		}
	}
}

foreach ( (array) ( $sira_atlas_tenant['services'] ?? array() ) as $sira_atlas_service ) {
	$sira_atlas_id = sira_atlas_upsert( 'sira_service', $sira_atlas_service, array( 'menu_order' => (int) $sira_atlas_service['order'] ) );

	if ( $sira_atlas_id > 0 ) {
		sira_atlas_unit( $sira_atlas_id, (string) $sira_atlas_service['unit'], $sira_atlas_units );
		sira_atlas_field( 'field_sira_locale_code', 'en', $sira_atlas_id );
	}

	$sira_atlas_thumb = sira_atlas_media( (string) $sira_atlas_service['image'], $sira_atlas_media, $sira_atlas_cache );
	if ( $sira_atlas_id > 0 && $sira_atlas_thumb > 0 ) {
		set_post_thumbnail( $sira_atlas_id, $sira_atlas_thumb );
	}
}

foreach ( (array) ( $sira_atlas_tenant['projects'] ?? array() ) as $sira_atlas_project ) {
	$sira_atlas_date = (string) $sira_atlas_project['date'] . ' 09:00:00';
	$sira_atlas_id   = sira_atlas_upsert(
		'sira_project',
		$sira_atlas_project,
		array(
			'post_date'     => $sira_atlas_date,
			'post_date_gmt' => get_gmt_from_date( $sira_atlas_date ),
			'edit_date'     => true,
		)
	);

	$sira_atlas_thumb   = sira_atlas_media( (string) $sira_atlas_project['image'], $sira_atlas_media, $sira_atlas_cache );
	$sira_atlas_gallery = array();
	foreach ( (array) ( $sira_atlas_project['gallery'] ?? array() ) as $sira_atlas_key ) {
		$sira_atlas_gallery[] = sira_atlas_media( (string) $sira_atlas_key, $sira_atlas_media, $sira_atlas_cache );
	}

	if ( $sira_atlas_id <= 0 ) {
		continue;
	}

	if ( $sira_atlas_thumb > 0 ) {
		set_post_thumbnail( $sira_atlas_id, $sira_atlas_thumb );
	}

	sira_atlas_unit( $sira_atlas_id, (string) $sira_atlas_project['unit'], $sira_atlas_units );
	sira_atlas_field( 'field_sira_locale_code', 'en', $sira_atlas_id );
	sira_atlas_field( 'field_project_subtitle', (string) $sira_atlas_project['subtitle'], $sira_atlas_id );
	sira_atlas_field( 'field_project_location', (string) $sira_atlas_project['location'], $sira_atlas_id );
	sira_atlas_field( 'field_project_status', (string) $sira_atlas_project['status'], $sira_atlas_id );
	sira_atlas_field( 'field_project_gallery', array_values( array_filter( $sira_atlas_gallery ) ), $sira_atlas_id );

	$sira_atlas_stats = array();
	foreach ( (array) ( $sira_atlas_project['stats'] ?? array() ) as $sira_atlas_stat ) {
		$sira_atlas_stats[] = array(
			'value' => (string) $sira_atlas_stat[0],
			'label' => (string) $sira_atlas_stat[1],
		);
	}
	sira_atlas_field( 'field_project_stats', $sira_atlas_stats, $sira_atlas_id );

	if ( isset( $sira_atlas_project['company'] ) ) {
		$sira_atlas_company = sira_atlas_find( 'sira_company', (string) $sira_atlas_project['company'] );
		if ( null === $sira_atlas_company ) {
			WP_CLI::warning( "Company {$sira_atlas_project['company']} not found on this tenant; relation left as is." );
		} else {
			sira_atlas_field( 'field_project_company', array( $sira_atlas_company ), $sira_atlas_id );
		}
	}
}

foreach ( (array) ( $sira_atlas_tenant['investments'] ?? array() ) as $sira_atlas_investment ) {
	$sira_atlas_id      = sira_atlas_find( 'sira_investment', (string) $sira_atlas_investment['slug'] );
	$sira_atlas_related = sira_atlas_find( 'sira_project', (string) $sira_atlas_investment['project'] );

	if ( null === $sira_atlas_id || null === $sira_atlas_related ) {
		WP_CLI::warning( "Investment {$sira_atlas_investment['slug']} or project {$sira_atlas_investment['project']} not found; skipped." );
		continue;
	}

	sira_atlas_log( "investment {$sira_atlas_investment['slug']} -> project {$sira_atlas_investment['project']}" );
	sira_atlas_field( 'field_sira_investment_related_project', array( $sira_atlas_related ), $sira_atlas_id );
}

foreach ( (array) ( $sira_atlas_tenant['testimonials'] ?? array() ) as $sira_atlas_testimonial ) {
	$sira_atlas_id = sira_atlas_upsert(
		'sira_testimonial',
		array(
			'slug'    => $sira_atlas_testimonial['slug'],
			'title'   => $sira_atlas_testimonial['title'],
			'content' => $sira_atlas_testimonial['quote'],
			'excerpt' => $sira_atlas_testimonial['quote'],
		)
	);

	if ( $sira_atlas_id > 0 ) {
		sira_atlas_field( 'field_sira_testimonial_role', (string) $sira_atlas_testimonial['role'], $sira_atlas_id );
		sira_atlas_field( 'field_sira_testimonial_organization', (string) $sira_atlas_testimonial['organization'], $sira_atlas_id );
		sira_atlas_field( 'field_sira_testimonial_consent', 1, $sira_atlas_id );
		sira_atlas_field( 'field_sira_testimonial_consent_recorded', current_time( 'Y-m-d H:i:s' ), $sira_atlas_id );
	}
}

WP_CLI::success( ( SIRA_ATLAS_DRY_RUN ? 'Planned' : 'Wrote' ) . " Atlas content for {$sira_atlas_home}." );
