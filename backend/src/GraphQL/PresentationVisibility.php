<?php
/**
 * Object-level GraphQL visibility for approval-gated presentation content.
 */

declare(strict_types=1);

namespace Sira\Core\GraphQL;

/**
 * Centralize Investment and Testimonial visibility in the WPGraphQL model
 * layer so every model-backed loading path applies the same decision.
 */
final class PresentationVisibility {
	/**
	 * Register model-layer privacy hooks.
	 */
	public function hooks(): void {
		add_filter(
			'graphql_data_is_private',
			array( $this, 'filter_data_is_private' ),
			20,
			6
		);
	}

	/**
	 * Return the approval meta keys for object-gated public content.
	 *
	 * @return array<string,string>
	 */
	public static function approval_rules(): array {
		return array(
			'sira_investment'  => 'sira_investment_public_display',
			'sira_testimonial' => 'sira_testimonial_consent_approved',
		);
	}

	/**
	 * Mark approval-gated post objects private unless the current user can
	 * edit the specific object.
	 *
	 * Returning the incoming value for approved objects preserves WPGraphQL's
	 * native publication-status, ownership, and capability checks. Returning
	 * true for an unapproved object sends it through WPGraphQL's restricted
	 * model path. Editors who can edit the specific post retain access.
	 *
	 * @param bool             $is_private  Existing WPGraphQL privacy result.
	 * @param string           $model_name WPGraphQL model name.
	 * @param mixed            $data       Unmodeled source data.
	 * @param mixed            $visibility Existing visibility value.
	 * @param mixed            $owner      Existing owner value.
	 * @param mixed            $current_user Current request user.
	 */
	public function filter_data_is_private(
		bool $is_private,
		string $model_name,
		mixed $data,
		mixed $visibility,
		mixed $owner,
		mixed $current_user
	): bool {
		unset( $visibility, $owner );

		$post = self::resolve_post( $model_name, $data );

		if ( ! $post instanceof \WP_Post ) {
			return $is_private;
		}

		$rules = self::approval_rules();

		if ( ! isset( $rules[ $post->post_type ] ) ) {
			return $is_private;
		}

		if ( self::is_approved( $post, $rules[ $post->post_type ] ) ) {
			return $is_private;
		}

		if (
			$current_user instanceof \WP_User
			&& 0 < (int) $current_user->ID
			&& user_can( $current_user, 'edit_post', $post->ID )
		) {
			return $is_private;
		}

		return true;
	}

	/**
	 * Resolve a WP_Post without treating arbitrary numeric model data as a
	 * post identifier.
	 */
	private static function resolve_post(
		string $model_name,
		mixed $data
	): ?\WP_Post {
		if ( $data instanceof \WP_Post ) {
			return $data;
		}

		if ( 'PostObject' !== $model_name ) {
			return null;
		}

		$post_id = 0;

		if ( is_int( $data ) || is_string( $data ) ) {
			$post_id = absint( $data );
		} elseif ( is_array( $data ) && isset( $data['ID'] ) ) {
			$post_id = absint( $data['ID'] );
		} elseif ( is_object( $data ) && isset( $data->ID ) ) {
			$post_id = absint( $data->ID );
		}

		if ( 0 === $post_id ) {
			return null;
		}

		$post = get_post( $post_id );

		return $post instanceof \WP_Post ? $post : null;
	}

	/**
	 * Accept only ACF's explicit enabled value. Missing, malformed, or merely
	 * truthy values remain private.
	 */
	private static function is_approved(
		\WP_Post $post,
		string $meta_key
	): bool {
		$value = get_post_meta( $post->ID, $meta_key, true );

		return true === $value || 1 === $value || '1' === $value;
	}
}
