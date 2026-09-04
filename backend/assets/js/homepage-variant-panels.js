( function ( window, document ) {
	'use strict';

	const variantFieldSelector = '[data-key="field_sira_homepage_variant"]';
	const panelSelectors = {
		group: '#acf-group_sira_group_homepage, [data-key="group_sira_group_homepage"]',
		branch: '#acf-group_sira_branch_homepage, [data-key="group_sira_branch_homepage"]',
	};
	const controlSelector = 'input, select, textarea, button';
	const disabledMarker = 'data-sira-variant-disabled';

	function setPanelVisibility( panel, visible ) {
		if ( ! panel ) {
			return;
		}

		panel.hidden = ! visible;

		if ( visible ) {
			panel.removeAttribute( 'aria-hidden' );
		} else {
			panel.setAttribute( 'aria-hidden', 'true' );
		}

		panel.querySelectorAll( controlSelector ).forEach( ( control ) => {
			if ( visible ) {
				// Never re-enable controls that another plugin or WordPress disabled.
				if ( control.getAttribute( disabledMarker ) === 'true' ) {
					control.disabled = false;
					control.removeAttribute( disabledMarker );
				}

				return;
			}

			// Hidden ACF fields must not validate or overwrite their stored values.
			if ( ! control.disabled ) {
				control.disabled = true;
				control.setAttribute( disabledMarker, 'true' );
			}
		} );
	}

	function selectedVariant() {
		const selected = document.querySelector(
			`${ variantFieldSelector } input[type="radio"]:checked`
		);

		return selected ? selected.value : null;
	}

	function sync() {
		const variant = selectedVariant();
		const groupPanel = document.querySelector( panelSelectors.group );
		const branchPanel = document.querySelector( panelSelectors.branch );

		if ( 'group' === variant ) {
			setPanelVisibility( groupPanel, true );
			setPanelVisibility( branchPanel, false );
			return;
		}

		if ( 'branch' === variant ) {
			setPanelVisibility( groupPanel, false );
			setPanelVisibility( branchPanel, true );
			return;
		}

		// Fail open if the variant field is absent or has an unexpected value.
		setPanelVisibility( groupPanel, true );
		setPanelVisibility( branchPanel, true );
	}

	function init() {
		document.addEventListener( 'change', ( event ) => {
			if ( event.target.matches( `${ variantFieldSelector } input[type="radio"]` ) ) {
				sync();
			}
		} );

		if ( window.acf && 'function' === typeof window.acf.addAction ) {
			window.acf.addAction( 'ready', sync );
			window.acf.addAction( 'append', sync );
			return;
		}

		if ( 'loading' === document.readyState ) {
			document.addEventListener( 'DOMContentLoaded', sync );
		} else {
			sync();
		}
	}

	window.SiraHomepageVariantPanels = { init, sync };
	init();
}( window, document ) );
