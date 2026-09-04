import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// Regression guard for a production fatal.
//
// WordPress does not use one signature across the three post-meta hooks:
// `added_post_meta` and `updated_post_meta` pass a single int meta id, while
// `deleted_post_meta` passes an ARRAY - from delete_metadata() and from
// delete_metadata_by_mid(), which casts with (array).
//
// RevalidationWebhook hooks one handler to all three. Because the file declares
// strict_types, typing $meta_id as `int` made every meta deletion throw a
// TypeError and take the request down:
//
//   PHP Fatal error: Uncaught TypeError:
//   Sira\Core\Revalidation\RevalidationWebhook::post_meta_changed():
//   Argument #1 ($meta_id) must be of type int, array given
//
// It fired on any meta deletion - clearing a field on save, deleting a post, or
// WordPress pruning revisions when an editor is opened, which is how it
// surfaced: the front page could not be opened for editing at all.
//
// There is no PHP runtime in this environment, so this asserts the source
// contract rather than executing it.

const source = await readFile(
	new URL( '../../src/Revalidation/RevalidationWebhook.php', import.meta.url ),
	'utf8'
);

const HOOKS = [ 'added_post_meta', 'updated_post_meta', 'deleted_post_meta' ];

test( 'all three post-meta hooks still share one handler', () => {
	for ( const hook of HOOKS ) {
		assert.ok(
			source.includes( `add_action( '${ hook }', array( $this, 'post_meta_changed' )` ),
			`${ hook } should be handled by post_meta_changed`
		);
	}
} );

test( 'the shared handler accepts the array that deleted_post_meta passes', () => {
	const signature = source.match( /public function post_meta_changed\(([^)]*)\)/ );

	assert.ok( signature, 'post_meta_changed should be declared' );

	const meta_id = signature[ 1 ]
		.split( ',' )
		.map( ( part ) => part.trim() )
		.find( ( part ) => part.includes( '$meta_id' ) );

	assert.ok( meta_id, '$meta_id should be the first parameter' );

	// The narrow `int` is what caused the fatal. Widening is safe because the
	// parameter is unused: only $object_id decides what to revalidate.
	// The narrow `int` is what caused the fatal. Widening is safe because the
	// parameter is unused: only $object_id decides what to revalidate.
	assert.ok(
		meta_id.includes( 'int|array' ) || meta_id.includes( 'array|int' )
			|| meta_id.startsWith( '$meta_id' ),
		`$meta_id must accept int|array, or carry no type at all - saw: ${ meta_id }`
	);
	assert.ok(
		! meta_id.startsWith( 'int $meta_id' ),
		'$meta_id typed as bare int reintroduces the fatal on deleted_post_meta'
	);
} );

test( 'strict_types is why the narrow type was fatal rather than coerced', () => {
	// If this ever stops being true the guard above still holds, but the
	// reasoning recorded here would no longer explain the original failure.
	assert.ok( source.includes( 'declare(strict_types=1)' ) );
} );
