import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const script = await readFile(
	new URL( '../../assets/js/homepage-variant-panels.js', import.meta.url ),
	'utf8'
);

function control( disabled = false, value = 'stored-value' ) {
	const attributes = new Map();

	return {
		disabled,
		value,
		getAttribute: ( name ) => attributes.get( name ) ?? null,
		removeAttribute: ( name ) => attributes.delete( name ),
		setAttribute: ( name, value ) => attributes.set( name, value ),
	};
}

function panel( controls ) {
	const attributes = new Map();

	return {
		hidden: false,
		controls,
		getAttribute: ( name ) => attributes.get( name ) ?? null,
		querySelectorAll: () => controls,
		removeAttribute: ( name ) => attributes.delete( name ),
		setAttribute: ( name, value ) => attributes.set( name, value ),
	};
}

function harness( initialVariant = 'branch' ) {
	let variant = initialVariant;
	const groupControls = [ control( false, 'group-content' ), control( true, 'locked-content' ) ];
	const branchControls = [ control( false, 'branch-content' ) ];
	const groupPanel = panel( groupControls );
	const branchPanel = panel( branchControls );
	const listeners = new Map();
	const actions = new Map();
	const document = {
		readyState: 'complete',
		addEventListener: ( name, callback ) => listeners.set( name, callback ),
		querySelector: ( selector ) => {
			if ( selector.includes( ':checked' ) ) {
				return variant ? { value: variant } : null;
			}

			if ( selector.includes( 'group_sira_group_homepage' ) ) {
				return groupPanel;
			}

			if ( selector.includes( 'group_sira_branch_homepage' ) ) {
				return branchPanel;
			}

			return null;
		},
	};
	const window = {
		acf: {
			addAction: ( name, callback ) => actions.set( name, callback ),
		},
	};

	vm.runInNewContext( script, { document, window } );

	return {
		actions,
		branchControls,
		branchPanel,
		groupControls,
		groupPanel,
		listeners,
		setVariant: ( nextVariant ) => {
			variant = nextVariant;
		},
		window,
	};
}

test( 'branch variant hides and disables only the Group panel', () => {
	const fixture = harness( 'branch' );

	fixture.actions.get( 'ready' )();

	assert.equal( fixture.groupPanel.hidden, true );
	assert.equal( fixture.groupPanel.getAttribute( 'aria-hidden' ), 'true' );
	assert.equal( fixture.groupControls[ 0 ].disabled, true );
	assert.equal( fixture.groupControls[ 0 ].getAttribute( 'data-sira-variant-disabled' ), 'true' );
	assert.equal( fixture.branchPanel.hidden, false );
	assert.equal( fixture.branchControls[ 0 ].disabled, false );
} );

test( 'switching variants restores only controls disabled by this script', () => {
	const fixture = harness( 'branch' );

	fixture.window.SiraHomepageVariantPanels.sync();
	fixture.setVariant( 'group' );
	fixture.window.SiraHomepageVariantPanels.sync();

	assert.equal( fixture.groupPanel.hidden, false );
	assert.equal( fixture.groupControls[ 0 ].disabled, false );
	assert.equal( fixture.groupControls[ 1 ].disabled, true );
	assert.equal( fixture.branchPanel.hidden, true );
	assert.equal( fixture.branchControls[ 0 ].disabled, true );
	assert.equal( fixture.groupControls[ 0 ].value, 'group-content' );
	assert.equal( fixture.branchControls[ 0 ].value, 'branch-content' );
} );

test( 'an absent or unexpected variant fails open with both panels visible', () => {
	const fixture = harness( 'branch' );

	fixture.window.SiraHomepageVariantPanels.sync();
	fixture.setVariant( null );
	fixture.window.SiraHomepageVariantPanels.sync();

	assert.equal( fixture.groupPanel.hidden, false );
	assert.equal( fixture.branchPanel.hidden, false );
	assert.equal( fixture.groupControls[ 0 ].disabled, false );
	assert.equal( fixture.branchControls[ 0 ].disabled, false );
} );

test( 'ACF ready and append actions keep dynamic editor content synchronized', () => {
	const fixture = harness();

	assert.equal( typeof fixture.actions.get( 'ready' ), 'function' );
	assert.equal( typeof fixture.actions.get( 'append' ), 'function' );
} );

test( 'only a Homepage Variant radio change triggers synchronization', () => {
	const fixture = harness( 'branch' );
	const onChange = fixture.listeners.get( 'change' );

	onChange( { target: { matches: () => false } } );
	assert.equal( fixture.groupPanel.hidden, false );

	onChange( { target: { matches: () => true } } );
	assert.equal( fixture.groupPanel.hidden, true );
} );
