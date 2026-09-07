import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// BrandManager resolves the effective brand as
// defaults <- network <- sira_brand_options <- ACF options, so a populated ACF
// field outranks the Brand Settings screen. That screen rendered the effective
// value but saved only to sira_brand_options, so every field ACF had a value
// for reverted the moment the page reloaded — the edit was stored and then
// never read.
//
// The fix is a single correspondence table, BrandManager::acf_field_map(),
// that acf_values() reads through and the settings screen writes through.
// These tests hold the two halves of that: the screen may not render a field
// the table does not know, and the table may not name an ACF field that is not
// registered.

const root = new URL( '../../src/', import.meta.url );

const brandManager = await readFile( new URL( 'Brand/BrandManager.php', root ), 'utf8' );
const siteSettings = await readFile( new URL( 'Admin/SiteSettings.php', root ), 'utf8' );
const acfIntegration = await readFile( new URL( 'Integrations/AcfIntegration.php', root ), 'utf8' );

/**
 * The brand contract keys mapped to ACF, with the field name and field key.
 *
 * @return {Map<string, {name: string, key: string}>} Mapping table.
 */
function fieldMap() {
	const start = brandManager.indexOf( 'public static function acf_field_map()' );
	assert.notEqual( start, -1, 'acf_field_map() not found' );

	const body = brandManager.slice( start, brandManager.indexOf( "\n\t}", start ) );
	const rows = [ ...body.matchAll( /'([a-z_]+)'\s*=>\s*array\(\s*'([a-z_]+)',\s*'(field_[a-z_]+)'\s*\)/g ) ];

	assert.ok( rows.length > 20, `expected the full map, parsed ${ rows.length } rows` );

	return new Map( rows.map( ( row ) => [ row[ 1 ], { name: row[ 2 ], key: row[ 3 ] } ] ) );
}

/**
 * The brand keys the Brand Settings screen renders inputs for.
 *
 * @return {string[]} Rendered keys.
 */
function renderedKeys() {
	const start = siteSettings.indexOf( 'public function render()' );
	assert.notEqual( start, -1, 'render() not found' );

	const body = siteSettings.slice( start );
	const keys = [ ...body.matchAll( /'([a-z_]+)'\s*=>\s*'[A-Z][^']*'/g ) ].map( ( row ) => row[ 1 ] );

	assert.ok( keys.length > 15, `expected the rendered field list, parsed ${ keys.length }` );

	return keys;
}

test( 'every field the Brand screen renders is mapped to an ACF field', () => {
	const map = fieldMap();

	for ( const key of renderedKeys() ) {
		assert.ok(
			map.has( key ),
			`"${ key }" is editable on the Brand screen but absent from acf_field_map(), so a save there cannot reach the store the screen reads`
		);
	}
} );

test( 'every mapped ACF field is actually registered', () => {
	for ( const [ brandKey, field ] of fieldMap() ) {
		// The two typed banner groups are declared in BrandBannerFields, which
		// builds their keys from the channel name rather than spelling them out.
		if ( 'announcement' === brandKey || 'emergency' === brandKey ) {
			continue;
		}

		assert.ok(
			acfIntegration.includes( `'${ field.key }'` ),
			`${ brandKey } maps to ${ field.key }, which no field group registers`
		);
		assert.ok(
			acfIntegration.includes( `'${ field.name }'` ),
			`${ brandKey } maps to the ACF name ${ field.name }, which no field group registers`
		);
	}
} );

test( 'the Brand screen mirrors its save into the ACF options', () => {
	assert.match(
		siteSettings,
		/add_action\( 'update_option_sira_brand_options', array\( \$this, 'mirror_updated' \)/,
		'an update must be mirrored'
	);
	assert.match(
		siteSettings,
		/add_action\( 'add_option_sira_brand_options', array\( \$this, 'mirror_added' \)/,
		'a first save must be mirrored too, since add_option fires instead of update_option'
	);
	assert.match(
		siteSettings,
		/update_field\( \$field\[1\], \$value\[ \$key \], 'option' \)/,
		'the mirror must write through the mapped field key'
	);
} );

test( 'the mirror clears a cleared field rather than skipping it', () => {
	// Skipping empties would leave the ACF value in place, and it outranks the
	// screen — so clearing a field would silently do nothing.
	const start = siteSettings.indexOf( 'private function mirror_to_acf' );
	assert.notEqual( start, -1, 'mirror_to_acf() not found' );

	const body = siteSettings.slice( start, siteSettings.indexOf( "\n\t}", start ) );

	assert.match(
		body,
		/array_key_exists\( \$key, \$value \)/,
		'the mirror must select on key presence, not on the value being truthy'
	);
	assert.doesNotMatch(
		body,
		/if \(\s*'' === \$value\[ \$key \]/,
		'the mirror must not skip empty values'
	);
} );

test( 'the mirror refuses to write an attachment ID that does not resolve', () => {
	// Attachment IDs are per-site. A stale one — carried over from another site
	// or an older install — resolves to false, so mirroring it replaces a
	// working image with a broken reference. That happened once to the
	// healthcare logo before this guard existed.
	const start = siteSettings.indexOf( 'private function mirror_to_acf' );
	const body = siteSettings.slice( start, siteSettings.indexOf( "\n\t}", start ) );

	assert.match( body, /'logo_id', 'mark_id'/, 'both attachment fields must be checked' );
	assert.match(
		body,
		/wp_get_attachment_url\( \(int\) \$value\[ \$key \] \)/,
		'the mirror must confirm the attachment exists before writing its ID'
	);
} );
