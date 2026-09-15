import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// The group and branch homepage field groups both attach to the same front
// page, so a storage name used by both is written to one meta key and read back
// by whichever field owns the `_key` reference row. The other reads empty.
//
// That is not hypothetical: `hero` and `contact` were declared on both groups,
// and on every branch site the branch hero resolved to null while the group
// hero — on the same page — returned the branch's content. `projects` and
// `insights` had already been prefixed for exactly this reason; `hero` and
// `contact` were missed.
//
// The invariant these tests hold is that every branch storage name carries the
// `branch_` prefix, so no branch field can ever claim a group field's key
// again. GraphQL field names are deliberately not prefixed: the schema and the
// frontend queries address `hero`, `contact`, `statistics` and so on, and must
// keep doing so.

const source = await readFile(
	new URL( '../../src/Integrations/PresentationFields.php', import.meta.url ),
	'utf8'
);

/**
 * Return the body of one private static method.
 *
 * @param {string} name Method name.
 * @return {string} Method body, up to the next method declaration.
 */
function methodBody( name ) {
	const start = source.indexOf( `private static function ${ name }(` );
	assert.notEqual( start, -1, `${ name }() not found` );

	const next = source.indexOf( 'private static function ', start + 1 );

	return source.slice( start, next === -1 ? source.length : next );
}

/**
 * Collect the storage names declared by group_field()/repeater() calls whose
 * field key belongs to the given namespace.
 *
 * Both helpers take (key, label, name, graphqlFieldName), so the third string
 * literal is the meta-key segment and the fourth is the GraphQL name.
 *
 * @param {string} body      Method body to scan.
 * @param {string} keyPrefix Field-key prefix identifying the namespace.
 * @return {Array<{key: string, name: string, graphql: string}>} Declarations.
 */
function declarations( body, keyPrefix ) {
	const pattern = new RegExp(
		String.raw`self::(?:group_field|repeater)\(\s*'(` +
			keyPrefix +
			String.raw`[a-z_]*)',\s*'[^']*',\s*'([a-z_]+)',\s*'([A-Za-z]+)'`,
		'g'
	);

	return [ ...body.matchAll( pattern ) ].map( ( match ) => ( {
		key: match[ 1 ],
		name: match[ 2 ],
		graphql: match[ 3 ],
	} ) );
}

test( 'every branch top-level field stores under a branch_ prefix', () => {
	const found = declarations( methodBody( 'branch_homepage_fields' ), 'field_sira_branch_' );

	// group_field/repeater cover five of the eight sections; contact, projects
	// and insights come from shared helpers and are asserted separately below.
	assert.equal( found.length, 5, 'expected five directly declared branch sections' );

	for ( const { key, name } of found ) {
		assert.ok(
			name.startsWith( 'branch_' ),
			`${ key } stores under "${ name }", which a group field can also claim`
		);
	}

	assert.deepEqual(
		found.map( ( declaration ) => declaration.name ).sort(),
		[
			'branch_focus_areas',
			'branch_footer',
			'branch_hero',
			'branch_overview',
			'branch_statistics',
		],
		'branch section storage names changed'
	);
} );

test( 'branch GraphQL names stay unprefixed so the schema does not move', () => {
	const found = declarations( methodBody( 'branch_homepage_fields' ), 'field_sira_branch_' );
	const graphql = Object.fromEntries(
		found.map( ( declaration ) => [ declaration.name, declaration.graphql ] )
	);

	assert.equal( graphql.branch_hero, 'hero' );
	assert.equal( graphql.branch_statistics, 'statistics' );
	assert.equal( graphql.branch_overview, 'overview' );
	assert.equal( graphql.branch_focus_areas, 'focusAreas' );
	assert.equal( graphql.branch_footer, 'footer' );
} );

test( 'the shared contact section stores under a distinct name per context', () => {
	// contact_section() is used by both homepage groups, so its storage name has
	// to be a parameter rather than the hard-coded 'contact' it once was.
	const helper = methodBody( 'contact_section' );

	assert.match(
		helper,
		/string \$name = 'contact'/,
		'contact_section() must take the storage name as a parameter'
	);
	assert.match(
		helper,
		/\$label,\s*\$name,\s*'contact',/,
		"contact_section() must pass \\$name as the storage name and keep 'contact' for GraphQL"
	);

	assert.match(
		methodBody( 'branch_homepage_fields' ),
		/contact_section\(\s*'branch',\s*'[^']*',\s*'branch_contact'\s*\)/,
		'the branch contact section must store under branch_contact'
	);
} );

test( 'the relationship and editorial branch sections keep their prefixes', () => {
	const body = methodBody( 'branch_homepage_fields' );

	assert.match( body, /relationship_section\(\s*'branch_projects'/ );
	assert.match( body, /editorial_section\(\s*'branch_insights'/ );
} );

test( 'no group field adopts a branch storage name', () => {
	const found = declarations( methodBody( 'group_homepage_fields' ), 'field_sira_' );

	for ( const { key, name } of found ) {
		assert.ok(
			! name.startsWith( 'branch_' ),
			`${ key } stores under "${ name }", which belongs to the branch namespace`
		);
	}
} );
