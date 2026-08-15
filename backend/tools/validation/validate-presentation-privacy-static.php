<?php
/**
 * Plain-PHP unit checks for Step 2C.2C presentation visibility.
 *
 * Run:
 * php tools/validation/validate-presentation-privacy-static.php
 */

declare(strict_types=1);

if ( ! class_exists( 'WP_Post' ) ) {
	final class WP_Post {
		public function __construct(
			public int $ID,
			public string $post_type
		) {}
	}
}

if ( ! class_exists( 'WP_User' ) ) {
	final class WP_User {
		public function __construct( public int $ID ) {}
	}
}

/** @var array<int,WP_Post> */
$GLOBALS['sira_privacy_test_posts'] = array();

/** @var array<int,array<string,mixed>> */
$GLOBALS['sira_privacy_test_meta'] = array();

/** @var array<int,array<int,bool>> */
$GLOBALS['sira_privacy_test_edit_caps'] = array();

if ( ! function_exists( 'absint' ) ) {
	function absint( mixed $value ): int {
		return abs( (int) $value );
	}
}

if ( ! function_exists( 'get_post' ) ) {
	function get_post( int $post_id ): ?WP_Post {
		return $GLOBALS['sira_privacy_test_posts'][ $post_id ] ?? null;
	}
}

if ( ! function_exists( 'get_post_meta' ) ) {
	function get_post_meta(
		int $post_id,
		string $meta_key,
		bool $single
	): mixed {
		unset( $single );

		return $GLOBALS['sira_privacy_test_meta'][ $post_id ][ $meta_key ]
			?? '';
	}
}

if ( ! function_exists( 'user_can' ) ) {
	function user_can(
		WP_User $user,
		string $capability,
		int $post_id
	): bool {
		if ( 'edit_post' !== $capability ) {
			return false;
		}

		return $GLOBALS['sira_privacy_test_edit_caps'][ $user->ID ][ $post_id ]
			?? false;
	}
}

require_once dirname( __DIR__, 2 )
	. '/src/GraphQL/PresentationVisibility.php';

use Sira\Core\GraphQL\PresentationVisibility;

$passes   = array();
$failures = array();

$record = static function (
	bool $condition,
	string $message
) use ( &$passes, &$failures ): void {
	if ( $condition ) {
		$passes[] = $message;
		return;
	}

	$failures[] = $message;
};

$investment_approved   = new WP_Post( 101, 'sira_investment' );
$investment_unapproved = new WP_Post( 102, 'sira_investment' );
$testimonial_approved  = new WP_Post( 201, 'sira_testimonial' );
$testimonial_denied    = new WP_Post( 202, 'sira_testimonial' );
$unrelated             = new WP_Post( 301, 'sira_project' );

$GLOBALS['sira_privacy_test_posts'] = array(
	101 => $investment_approved,
	102 => $investment_unapproved,
	201 => $testimonial_approved,
	202 => $testimonial_denied,
	301 => $unrelated,
);

$GLOBALS['sira_privacy_test_meta'] = array(
	101 => array(
		'sira_investment_public_display' => '1',
	),
	102 => array(
		'sira_investment_public_display' => '0',
	),
	201 => array(
		'sira_testimonial_consent_approved' => 1,
	),
	202 => array(
		'sira_testimonial_consent_approved' => 'yes',
	),
);

$GLOBALS['sira_privacy_test_edit_caps'] = array(
	10 => array(
		102 => true,
		202 => true,
	),
	20 => array(),
);

$visibility = new PresentationVisibility();
$anonymous  = new WP_User( 0 );
$editor     = new WP_User( 10 );
$subscriber = new WP_User( 20 );

$rules = PresentationVisibility::approval_rules();

$record(
	array(
		'sira_investment'  => 'sira_investment_public_display',
		'sira_testimonial' => 'sira_testimonial_consent_approved',
	) === $rules,
	'Only Investments and Testimonials are approval-gated.'
);

$record(
	false === $visibility->filter_data_is_private(
		false,
		'PostObject',
		$investment_approved,
		null,
		null,
		$anonymous
	),
	'Approved published Investment preserves public visibility.'
);

$record(
	true === $visibility->filter_data_is_private(
		false,
		'PostObject',
		$investment_unapproved,
		null,
		null,
		$anonymous
	),
	'Unapproved Investment is private anonymously.'
);

$record(
	true === $visibility->filter_data_is_private(
		false,
		'PostObject',
		$testimonial_denied,
		null,
		null,
		$anonymous
	),
	'Noncanonical truthy Testimonial consent remains private.'
);

$record(
	false === $visibility->filter_data_is_private(
		false,
		'PostObject',
		$testimonial_approved,
		null,
		null,
		$anonymous
	),
	'Explicitly consent-approved Testimonial preserves public visibility.'
);

$record(
	false === $visibility->filter_data_is_private(
		false,
		'PostObject',
		$investment_unapproved,
		null,
		null,
		$editor
	),
	'User who can edit an Investment retains authenticated editorial access.'
);

$record(
	false === $visibility->filter_data_is_private(
		false,
		'PostObject',
		$testimonial_denied,
		null,
		null,
		$editor
	),
	'User who can edit a Testimonial retains authenticated editorial access.'
);

$record(
	true === $visibility->filter_data_is_private(
		false,
		'PostObject',
		$investment_unapproved,
		null,
		null,
		$subscriber
	),
	'Authenticated user without edit capability cannot bypass Investment approval.'
);

$record(
	true === $visibility->filter_data_is_private(
		false,
		'PostObject',
		$testimonial_denied,
		null,
		null,
		$subscriber
	),
	'Authenticated user without edit capability cannot bypass Testimonial consent.'
);

$record(
	true === $visibility->filter_data_is_private(
		true,
		'PostObject',
		$investment_approved,
		null,
		null,
		$anonymous
	),
	'Approval does not override existing draft/private visibility.'
);

$record(
	false === $visibility->filter_data_is_private(
		false,
		'PostObject',
		102,
		null,
		null,
		$editor
	),
	'PostObject numeric source data resolves through the same capability rule.'
);

$record(
	false === $visibility->filter_data_is_private(
		false,
		'UserObject',
		102,
		null,
		null,
		$anonymous
	),
	'Numeric data from a non-post model is never treated as a post.'
);

$record(
	false === $visibility->filter_data_is_private(
		false,
		'PostObject',
		$unrelated,
		null,
		null,
		$anonymous
	),
	'Unrelated post types retain their existing WPGraphQL visibility.'
);

echo "SIRA Step 2C.2C static privacy validation\n";
echo str_repeat( '=', 45 ) . "\n\n";

foreach ( $passes as $message ) {
	echo "[PASS] {$message}\n";
}

foreach ( $failures as $message ) {
	echo "[FAIL] {$message}\n";
}

echo "\nSummary: "
	. count( $passes )
	. ' passed, '
	. count( $failures )
	. " failed.\n";

exit( array() === $failures ? 0 : 1 );
