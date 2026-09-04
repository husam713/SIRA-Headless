<?php
/**
 * Signed Next.js on-demand revalidation events.
 */

declare(strict_types=1);

namespace Sira\Core\Revalidation;

use Sira\Core\Brand\BrandManager;
use Sira\Core\Content\PostTypes;
use Sira\Core\Content\Taxonomies;

final class RevalidationWebhook {
	private const CRON_HOOK    = 'sira_revalidation_deliver_event';
	private const QUEUE_OPTION = 'sira_revalidation_queue_v1';
	private const LOCK_OPTION  = 'sira_revalidation_queue_lock_v1';
	private const MAX_QUEUE    = 100;

	/**
	 * Event fingerprints queued during the current PHP request.
	 *
	 * @var array<string,true>
	 */
	private array $request_fingerprints = array();

	/**
	 * Lifecycle operations already queued for a post during this request.
	 *
	 * @var array<string,string>
	 */
	private array $request_post_lifecycle = array();

	public function hooks(): void {
		add_action( 'transition_post_status', array( $this, 'post_status_changed' ), 20, 3 );
		add_action( 'post_updated', array( $this, 'post_updated' ), 20, 3 );
		add_action( 'trashed_post', array( $this, 'post_trashed' ), 20, 2 );
		add_action( 'untrashed_post', array( $this, 'post_restored' ), 20, 2 );
		add_action( 'deleted_post', array( $this, 'post_deleted' ), 20, 2 );

		add_action( 'added_post_meta', array( $this, 'post_meta_changed' ), 20, 4 );
		add_action( 'updated_post_meta', array( $this, 'post_meta_changed' ), 20, 4 );
		add_action( 'deleted_post_meta', array( $this, 'post_meta_changed' ), 20, 4 );

		add_action( 'add_attachment', array( $this, 'attachment_changed' ), 20, 1 );
		add_action( 'edit_attachment', array( $this, 'attachment_changed' ), 20, 1 );

		add_action( 'set_object_terms', array( $this, 'object_terms_changed' ), 20, 6 );
		add_action( 'created_term', array( $this, 'term_created' ), 20, 3 );
		add_action( 'edited_term', array( $this, 'term_updated' ), 20, 3 );
		add_action( 'delete_term', array( $this, 'term_deleted' ), 20, 5 );

		add_action( 'wp_create_nav_menu', array( $this, 'menu_created' ), 20, 2 );
		add_action( 'wp_update_nav_menu', array( $this, 'menu_updated' ), 20, 2 );
		add_action( 'wp_update_nav_menu_item', array( $this, 'menu_item_updated' ), 20, 3 );
		add_action( 'wp_delete_nav_menu', array( $this, 'menu_deleted' ), 20, 1 );

		add_action( 'add_option_sira_brand_options', array( $this, 'site_brand_changed' ), 20, 0 );
		add_action( 'update_option_sira_brand_options', array( $this, 'site_brand_changed' ), 20, 0 );
		add_action( 'delete_option_sira_brand_options', array( $this, 'site_brand_changed' ), 20, 0 );

		add_action( 'add_site_option_sira_network_defaults', array( $this, 'network_brand_changed' ), 20, 0 );
		add_action( 'update_site_option_sira_network_defaults', array( $this, 'network_brand_changed' ), 20, 0 );
		add_action( 'delete_site_option_sira_network_defaults', array( $this, 'network_brand_changed' ), 20, 0 );

		/*
		 * ACF 6.1.7+ provides the options-page-specific action. The generic
		 * fallback keeps older supported ACF installations compatible.
		 */
		add_action( 'acf/options_page/save', array( $this, 'acf_options_page_saved' ), 20, 2 );
		add_action( 'acf/save_post', array( $this, 'acf_saved' ), 30, 1 );

		add_action( self::CRON_HOOK, array( $this, 'deliver_event' ), 10, 1 );
	}

	public function post_status_changed(
		string $new_status,
		string $old_status,
		\WP_Post $post
	): void {
		if (
			$new_status === $old_status
			|| ! $this->is_allowed_post( $post )
			|| ! $this->is_allowed_status( $new_status )
			|| ! $this->is_allowed_status( $old_status )
		) {
			return;
		}

		if ( 'trash' === $new_status || 'trash' === $old_status ) {
			/*
			 * Trash and restore have dedicated hooks that include the status
			 * WordPress intends to restore.
			 */
			return;
		}

		if ( 'publish' === $new_status ) {
			$this->queue_post_event( $post, 'publish', $old_status );
			return;
		}

		if ( 'publish' === $old_status ) {
			$this->queue_post_event( $post, 'unpublish', $old_status );
		}
	}

	public function post_updated(
		int $post_id,
		\WP_Post $post_after,
		\WP_Post $post_before
	): void {
		unset( $post_id );

		if (
			! $this->is_allowed_post( $post_after )
			|| $post_after->post_status !== $post_before->post_status
		) {
			return;
		}

		if ( 'attachment' === $post_after->post_type ) {
			$this->queue_post_event( $post_after, 'media-update', $post_before->post_status );
			return;
		}

		if (
			'publish' !== $post_after->post_status
			|| ! $this->public_post_fields_changed( $post_after, $post_before )
		) {
			return;
		}

		$this->queue_post_event( $post_after, 'update', $post_before->post_status );
	}

	public function post_trashed( int $post_id, string $previous_status = '' ): void {
		$post = get_post( $post_id );

		if ( $post instanceof \WP_Post && $this->is_allowed_post( $post ) ) {
			$this->queue_post_event(
				$post,
				'trash',
				$this->normalize_status( $previous_status, 'publish' )
			);
		}
	}

	public function post_restored( int $post_id, string $previous_status = '' ): void {
		$post = get_post( $post_id );

		if ( $post instanceof \WP_Post && $this->is_allowed_post( $post ) ) {
			$this->queue_post_event(
				$post,
				'restore',
				'trash',
				$this->normalize_status( $post->post_status, $previous_status )
			);
		}
	}

	public function post_deleted( int $post_id, \WP_Post $post ): void {
		unset( $post_id );

		if ( $this->is_allowed_post( $post ) ) {
			$this->queue_post_event( $post, 'delete', $post->post_status );
		}
	}

	/**
	 * WordPress does not use one signature for these three hooks.
	 *
	 * `added_post_meta` and `updated_post_meta` pass a single int meta id,
	 * but `deleted_post_meta` passes an ARRAY of ids - both from
	 * delete_metadata() and from delete_metadata_by_mid(), which casts with
	 * (array). Under declare(strict_types=1) an `int` parameter therefore
	 * threw a TypeError and took the whole request down.
	 *
	 * That fired on any meta deletion: clearing a field on save, deleting a
	 * post, or WordPress pruning revisions when an editor is opened - which
	 * is how it surfaced, as a fatal on the most heavily revised page.
	 *
	 * The id is unused here; only $object_id decides what to revalidate.
	 *
	 * @param int|array $meta_id Single id, or ids when meta was deleted.
	 */
	public function post_meta_changed(
		int|array $meta_id,
		int $object_id,
		string $meta_key,
		mixed $meta_value = null
	): void {
		unset( $meta_id, $meta_value );

		$post = get_post( $object_id );

		if ( ! $post instanceof \WP_Post || ! $this->is_allowed_post( $post ) ) {
			return;
		}

		if ( 'attachment' === $post->post_type ) {
			if ( $this->is_relevant_attachment_meta( $meta_key ) ) {
				$this->queue_post_event( $post, 'media-update', $post->post_status );
			}

			return;
		}

		if (
			'publish' === $post->post_status
			&& $this->is_relevant_content_meta( $meta_key )
		) {
			$this->queue_post_event( $post, 'update', $post->post_status );
		}
	}

	public function attachment_changed( int $post_id ): void {
		$post = get_post( $post_id );

		if ( $post instanceof \WP_Post && $this->is_allowed_post( $post ) ) {
			$this->queue_post_event( $post, 'media-update', $post->post_status );
		}
	}

	/**
	 * @param array<int|string,mixed> $terms
	 * @param array<int,int|string>   $tt_ids
	 * @param array<int,int|string>   $old_tt_ids
	 */
	public function object_terms_changed(
		int $object_id,
		array $terms,
		array $tt_ids,
		string $taxonomy,
		bool $append,
		array $old_tt_ids
	): void {
		unset( $terms, $append );

		if ( ! $this->is_allowed_taxonomy( $taxonomy ) ) {
			return;
		}

		$post = get_post( $object_id );

		if (
			! $post instanceof \WP_Post
			|| ! $this->is_allowed_post( $post )
			|| 'publish' !== $post->post_status
		) {
			return;
		}

		$term_ids = $this->term_ids_from_tt_ids(
			array_unique(
				array_merge(
					array_map( 'absint', $tt_ids ),
					array_map( 'absint', $old_tt_ids )
				)
			),
			$taxonomy
		);

		$this->queue_post_event(
			$post,
			'taxonomy-assign',
			$post->post_status,
			$post->post_status,
			$taxonomy,
			$term_ids
		);
	}

	public function term_created( int $term_id, int $tt_id, string $taxonomy ): void {
		unset( $tt_id );
		$this->queue_term_event( $term_id, $taxonomy, 'term-create' );
	}

	public function term_updated( int $term_id, int $tt_id, string $taxonomy ): void {
		unset( $tt_id );
		$this->queue_term_event( $term_id, $taxonomy, 'term-update' );
	}

	public function term_deleted(
		mixed $term_id,
		mixed $tt_id,
		mixed $taxonomy,
		mixed $deleted_term,
		mixed $object_ids
	): void {
		unset( $tt_id, $object_ids );

		$taxonomy = is_string( $taxonomy ) ? $taxonomy : '';

		if ( ! $this->is_allowed_taxonomy( $taxonomy ) ) {
			return;
		}

		$term_id = absint( $term_id );
		$slug    = '';

		if ( is_object( $deleted_term ) && isset( $deleted_term->slug ) ) {
			$slug = sanitize_title( (string) $deleted_term->slug );
		} elseif ( is_array( $deleted_term ) && isset( $deleted_term['slug'] ) ) {
			$slug = sanitize_title( (string) $deleted_term['slug'] );
		}

		$this->queue_taxonomy_event(
			'term-delete',
			$taxonomy,
			array( $term_id ),
			$slug
		);
	}

	/**
	 * @param array<string,mixed> $menu_data
	 */
	public function menu_created( int $menu_id, array $menu_data = array() ): void {
		unset( $menu_data );
		$this->queue_menu_event( $menu_id, 'menu-create' );
	}

	/**
	 * @param array<string,mixed> $menu_data
	 */
	public function menu_updated( int $menu_id, array $menu_data = array() ): void {
		unset( $menu_data );
		$this->queue_menu_event( $menu_id, 'menu-update' );
	}

	/**
	 * @param array<string,mixed> $args
	 */
	public function menu_item_updated(
		int $menu_id,
		int $menu_item_id,
		array $args = array()
	): void {
		unset( $menu_item_id, $args );
		$this->queue_menu_event( $menu_id, 'menu-update' );
	}

	public function menu_deleted( int $menu_id ): void {
		$this->queue_menu_event( $menu_id, 'menu-delete' );
	}

	public function site_brand_changed(): void {
		$this->queue_brand_event( 'brand-update' );
	}

	public function network_brand_changed(): void {
		if ( ! is_multisite() ) {
			$this->queue_brand_event( 'network-brand-update' );
			return;
		}

		$site_ids = get_sites(
			array(
				'fields' => 'ids',
				'number' => 0,
			)
		);

		foreach ( $site_ids as $site_id ) {
			switch_to_blog( (int) $site_id );

			try {
				$this->queue_brand_event( 'network-brand-update' );
			} finally {
				restore_current_blog();
			}
		}
	}

	public function acf_options_page_saved( mixed $post_id, string $menu_slug ): void {
		unset( $post_id );

		if ( 'sira-acf-options' === $menu_slug ) {
			$this->queue_brand_event( 'acf-options-update' );
		}
	}

	public function acf_saved( mixed $post_id ): void {
		if ( is_numeric( $post_id ) ) {
			return;
		}

		$value = sanitize_key( (string) $post_id );

		if ( 'options' === $value || str_starts_with( $value, 'options_' ) ) {
			$this->queue_brand_event( 'acf-options-update' );
		}
	}

	public function deliver_event( string $event_id ): void {
		$event_id = sanitize_text_field( $event_id );

		if ( '' === $event_id ) {
			return;
		}

		$item = $this->claim_queue_item( $event_id );

		if ( null === $item ) {
			return;
		}

		$payload   = is_array( $item['payload'] ?? null ) ? $item['payload'] : array();
		$endpoints = is_array( $item['pending_endpoints'] ?? null )
			? $item['pending_endpoints']
			: array();
		$attempts  = absint( $item['attempts'] ?? 1 );

		if ( array() === $payload || array() === $endpoints ) {
			$this->complete_queue_item( $event_id );
			return;
		}

		$secret = $this->secret();

		if ( null === $secret ) {
			$this->retry_or_fail(
				$event_id,
				$item,
				$endpoints,
				'missing-secret'
			);
			return;
		}

		$payload['sentAt'] = gmdate( DATE_ATOM );
		$body              = wp_json_encode(
			$payload,
			JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
		);

		if ( ! is_string( $body ) ) {
			$this->retry_or_fail(
				$event_id,
				$item,
				$endpoints,
				'json-encoding-failed'
			);
			return;
		}

		$timestamp = (string) time();
		$signature = hash_hmac(
			'sha256',
			$timestamp . '.' . $body,
			$secret
		);
		$failed     = array();

		foreach ( $endpoints as $endpoint ) {
			$endpoint = is_string( $endpoint ) ? $endpoint : '';

			if ( '' === $endpoint ) {
				continue;
			}

			$response = wp_remote_post(
				$endpoint,
				array(
					'timeout'     => 3,
					'redirection' => 0,
					'blocking'    => true,
					'sslverify'   => true,
					'headers'     => array(
						'Content-Type'     => 'application/json; charset=utf-8',
						'X-Sira-Event-Id'  => $event_id,
						'X-Sira-Timestamp' => $timestamp,
						'X-Sira-Signature' => 'v1=' . $signature,
						'User-Agent'       => 'SIRA-Core/' . SIRA_CORE_VERSION,
					),
					'body'        => $body,
					'data_format' => 'body',
				)
			);

			if ( is_wp_error( $response ) ) {
				$failed[] = $endpoint;
				$this->log_failure(
					$event_id,
					$endpoint,
					$attempts,
					$response->get_error_code()
				);
				continue;
			}

			$status_code = (int) wp_remote_retrieve_response_code( $response );

			if ( $status_code < 200 || $status_code >= 300 ) {
				$failed[] = $endpoint;
				$this->log_failure(
					$event_id,
					$endpoint,
					$attempts,
					'http-' . $status_code
				);
			}
		}

		if ( array() === $failed ) {
			$this->complete_queue_item( $event_id );
			do_action( 'sira_revalidation_delivered', $payload );
			return;
		}

		$this->retry_or_fail( $event_id, $item, $failed, 'delivery-failed' );
	}

	private function queue_post_event(
		\WP_Post $post,
		string $operation,
		string $previous_status,
		?string $status = null,
		?string $taxonomy = null,
		array $term_ids = array()
	): void {
		if ( ! $this->is_allowed_post( $post ) ) {
			return;
		}

		$operation_key = sanitize_key( $operation );
		$post_key      = get_current_blog_id() . ':' . absint( $post->ID );
		$lifecycle     = array(
			'publish',
			'unpublish',
			'trash',
			'restore',
			'delete',
		);

		/*
		 * A publish/restore/delete request often writes ACF and thumbnail meta
		 * after the lifecycle hook. Those writes must not create a second
		 * revalidation delivery for the same editorial operation.
		 */
		if (
			isset( $this->request_post_lifecycle[ $post_key ] )
			&& in_array( $operation_key, array( 'update', 'media-update' ), true )
		) {
			return;
		}

		if ( in_array( $operation_key, $lifecycle, true ) ) {
			$this->request_post_lifecycle[ $post_key ] = $operation_key;
		}

		$status = $this->normalize_status( $status ?? $post->post_status, $post->post_status );

		if (
			! $this->is_allowed_status( $status )
			|| ! $this->is_allowed_status( $previous_status )
		) {
			return;
		}

		$post_type = sanitize_key( $post->post_type );
		$post_id   = absint( $post->ID );
		$slug      = sanitize_title( $post->post_name );
		$paths     = $this->post_paths( $post );
		$tags      = array(
			'post-type:' . $post_type,
			'post:' . $post_type . ':' . $post_id,
			'archive:' . $post_type,
		);

		if ( '' !== $slug ) {
			$tags[] = 'slug:' . $post_type . ':' . $slug;
		}

		if ( 'attachment' === $post_type ) {
			$tags[] = 'media:' . $post_id;
		}

		if ( $this->affects_homepage( $post_type ) ) {
			$paths[] = '/';
			$tags[]  = 'homepage';
		}

		$taxonomy = is_string( $taxonomy ) ? sanitize_key( $taxonomy ) : null;
		$term_ids = array_values(
			array_filter(
				array_unique( array_map( 'absint', $term_ids ) )
			)
		);

		if ( null !== $taxonomy && '' !== $taxonomy ) {
			$tags[] = 'taxonomy:' . $taxonomy;

			foreach ( $term_ids as $term_id ) {
				$tags[] = 'term:' . $taxonomy . ':' . $term_id;
			}
		}

		$this->queue_event(
			array(
				'source'         => 'post',
				'operation'      => $operation_key,
				'postType'       => $post_type,
				'postId'         => $post_id,
				'slug'           => '' !== $slug ? $slug : null,
				'status'         => $status,
				'previousStatus' => $this->normalize_status(
					$previous_status,
					$status
				),
				'taxonomy'       => $taxonomy,
				'termIds'        => $term_ids,
				'menuId'         => null,
				'paths'          => $paths,
				'tags'           => $tags,
			)
		);
	}

	private function queue_term_event(
		int $term_id,
		string $taxonomy,
		string $operation
	): void {
		if ( ! $this->is_allowed_taxonomy( $taxonomy ) ) {
			return;
		}

		$term = get_term( $term_id, $taxonomy );
		$slug = $term instanceof \WP_Term ? sanitize_title( $term->slug ) : '';

		$this->queue_taxonomy_event(
			$operation,
			$taxonomy,
			array( $term_id ),
			$slug
		);
	}

	/**
	 * @param array<int,int> $term_ids
	 */
	private function queue_taxonomy_event(
		string $operation,
		string $taxonomy,
		array $term_ids,
		string $slug = ''
	): void {
		$taxonomy = sanitize_key( $taxonomy );

		if ( ! $this->is_allowed_taxonomy( $taxonomy ) ) {
			return;
		}

		$term_ids = array_values(
			array_filter(
				array_unique( array_map( 'absint', $term_ids ) )
			)
		);
		$tags     = array(
			'taxonomy:' . $taxonomy,
		);

		foreach ( $term_ids as $term_id ) {
			$tags[] = 'term:' . $taxonomy . ':' . $term_id;
		}

		if ( '' !== $slug ) {
			$tags[] = 'term-slug:' . $taxonomy . ':' . $slug;
		}

		$this->queue_event(
			array(
				'source'         => 'taxonomy',
				'operation'      => sanitize_key( $operation ),
				'postType'       => null,
				'postId'         => null,
				'slug'           => '' !== $slug ? $slug : null,
				'status'         => null,
				'previousStatus' => null,
				'taxonomy'       => $taxonomy,
				'termIds'        => $term_ids,
				'menuId'         => null,
				'paths'          => array(),
				'tags'           => $tags,
			)
		);
	}

	private function queue_menu_event( int $menu_id, string $operation ): void {
		$menu_id = absint( $menu_id );

		if ( 0 === $menu_id ) {
			return;
		}

		$this->queue_event(
			array(
				'source'         => 'menu',
				'operation'      => sanitize_key( $operation ),
				'postType'       => null,
				'postId'         => null,
				'slug'           => null,
				'status'         => null,
				'previousStatus' => null,
				'taxonomy'       => null,
				'termIds'        => array(),
				'menuId'         => $menu_id,
				'paths'          => array( '/' ),
				'tags'           => array(
					'navigation',
					'menu:' . $menu_id,
				),
			)
		);
	}

	private function queue_brand_event( string $operation ): void {
		$this->queue_event(
			array(
				'source'         => 'brand',
				'operation'      => sanitize_key( $operation ),
				'postType'       => null,
				'postId'         => null,
				'slug'           => null,
				'status'         => null,
				'previousStatus' => null,
				'taxonomy'       => null,
				'termIds'        => array(),
				'menuId'         => null,
				'paths'          => array( '/' ),
				'tags'           => array(
					'brand',
					'layout',
				),
			)
		);
	}

	/**
	 * @param array<string,mixed> $event
	 */
	private function queue_event( array $event ): void {
		if ( ! $this->is_configured() ) {
			do_action( 'sira_revalidation_skipped', 'not-configured', $event );
			return;
		}

		$site = $this->site_context();

		$event = array_merge(
			array(
				'schemaVersion'  => 1,
				'eventId'        => wp_generate_uuid4(),
				'occurredAt'     => gmdate( DATE_ATOM ),
				'sentAt'         => null,
				'site'           => $site,
				'source'         => null,
				'operation'      => null,
				'postType'       => null,
				'postId'         => null,
				'slug'           => null,
				'status'         => null,
				'previousStatus' => null,
				'taxonomy'       => null,
				'termIds'        => array(),
				'menuId'         => null,
				'paths'          => array(),
				'tags'           => array(),
			),
			$event
		);

		$event['paths'] = $this->sanitize_paths(
			(array) apply_filters(
				'sira_revalidation_paths',
				$event['paths'],
				$event
			)
		);
		$event['tags']  = $this->sanitize_tags(
			array_merge(
				array(
					'site:' . absint( $site['blogId'] ?? 0 ),
					'brand:' . sanitize_key( (string) ( $site['brandKey'] ?? 'group' ) ),
				),
				(array) apply_filters(
					'sira_revalidation_tags',
					$event['tags'],
					$event
				)
			)
		);

		$fingerprint = $this->fingerprint( $event );

		if ( isset( $this->request_fingerprints[ $fingerprint ] ) ) {
			return;
		}

		$this->request_fingerprints[ $fingerprint ] = true;

		$event_id = sanitize_text_field( (string) $event['eventId'] );
		$queued   = $this->store_queue_item(
			$event_id,
			array(
				'payload'           => $event,
				'pending_endpoints' => $this->endpoints(),
				'attempts'          => 0,
				'created_at'        => time(),
				'in_flight_until'   => 0,
			)
		);

		if ( $queued ) {
			$this->schedule_delivery( $event_id, 1 );
			do_action( 'sira_revalidation_queued', $event );
		}
	}

	/**
	 * @return array<string,mixed>
	 */
	private function site_context(): array {
		$brand   = BrandManager::instance()->get_public();
		$blog_id = get_current_blog_id();
		$context = array(
			'blogId'      => $blog_id,
			'networkId'   => is_multisite() ? get_current_network_id() : 0,
			'brandKey'    => sanitize_key( (string) ( $brand['brand_key'] ?? 'group' ) ),
			'hostname'    => $this->frontend_hostname(
				$blog_id,
				sanitize_key( (string) ( $brand['brand_key'] ?? 'group' ) )
			),
			'wordpressUrl' => esc_url_raw( home_url( '/' ) ),
		);

		$filtered = apply_filters(
			'sira_revalidation_site_context',
			$context,
			$blog_id,
			$brand
		);

		return is_array( $filtered ) ? $filtered : $context;
	}

	private function frontend_hostname( int $blog_id, string $brand_key ): ?string {
		$map = $this->site_host_map();

		$hostname = $map[ (string) $blog_id ]
			?? $map[ $brand_key ]
			?? null;

		if ( null === $hostname && defined( 'SIRA_NEXT_FRONTEND_HOSTNAME' ) ) {
			$hostname = constant( 'SIRA_NEXT_FRONTEND_HOSTNAME' );
		}

		if ( ! is_string( $hostname ) || '' === trim( $hostname ) ) {
			return null;
		}

		$hostname = strtolower( trim( $hostname ) );
		$hostname = (string) wp_parse_url(
			str_contains( $hostname, '://' )
				? $hostname
				: 'https://' . $hostname,
			PHP_URL_HOST
		);

		if (
			'' === $hostname
			|| ! preg_match( '/^[a-z0-9.-]+$/', $hostname )
		) {
			return null;
		}

		return $hostname;
	}

	/**
	 * @return array<string,string>
	 */
	private function site_host_map(): array {
		if ( ! defined( 'SIRA_NEXT_SITE_HOSTS' ) ) {
			return array();
		}

		$value = constant( 'SIRA_NEXT_SITE_HOSTS' );

		if ( is_string( $value ) ) {
			$decoded = json_decode( $value, true );
			$value   = is_array( $decoded ) ? $decoded : array();
		}

		if ( ! is_array( $value ) ) {
			return array();
		}

		$map = array();

		foreach ( $value as $key => $hostname ) {
			if ( is_scalar( $key ) && is_string( $hostname ) ) {
				$map[ (string) $key ] = $hostname;
			}
		}

		return $map;
	}

	/**
	 * @return array<int,string>
	 */
	private function endpoints(): array {
		$values = array();

		if ( defined( 'SIRA_NEXT_REVALIDATION_URLS' ) ) {
			$values = $this->normalize_list_constant(
				constant( 'SIRA_NEXT_REVALIDATION_URLS' )
			);
		}

		if ( defined( 'SIRA_NEXT_REVALIDATION_URL' ) ) {
			$values[] = (string) constant( 'SIRA_NEXT_REVALIDATION_URL' );
		}

		$values = (array) apply_filters(
			'sira_revalidation_endpoints',
			$values,
			get_current_blog_id()
		);

		$endpoints = array();

		foreach ( array_slice( $values, 0, 5 ) as $value ) {
			if ( ! is_string( $value ) ) {
				continue;
			}

			$url = $this->validate_endpoint( $value );

			if ( null !== $url ) {
				$endpoints[] = $url;
			}
		}

		return array_values( array_unique( $endpoints ) );
	}

	/**
	 * @return array<int,string>
	 */
	private function normalize_list_constant( mixed $value ): array {
		if ( is_array( $value ) ) {
			return array_values(
				array_filter( $value, 'is_string' )
			);
		}

		if ( ! is_string( $value ) ) {
			return array();
		}

		$decoded = json_decode( $value, true );

		if ( is_array( $decoded ) ) {
			return array_values(
				array_filter( $decoded, 'is_string' )
			);
		}

		return array_values(
			array_filter(
				array_map( 'trim', explode( ',', $value ) )
			)
		);
	}

	private function validate_endpoint( string $value ): ?string {
		$url = esc_url_raw( trim( $value ) );

		if ( '' === $url || ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
			return null;
		}

		$scheme = strtolower( (string) wp_parse_url( $url, PHP_URL_SCHEME ) );
		$host   = strtolower( (string) wp_parse_url( $url, PHP_URL_HOST ) );

		if ( '' === $host ) {
			return null;
		}

		if ( 'https' !== $scheme ) {
			$environment = function_exists( 'wp_get_environment_type' )
				? wp_get_environment_type()
				: 'production';
			$is_local    = in_array(
				$host,
				array( 'localhost', '127.0.0.1', '::1' ),
				true
			);

			if (
				'http' !== $scheme
				|| ! $is_local
				|| ! in_array( $environment, array( 'local', 'development' ), true )
			) {
				return null;
			}
		}

		if (
			null !== wp_parse_url( $url, PHP_URL_USER )
			|| null !== wp_parse_url( $url, PHP_URL_PASS )
		) {
			return null;
		}

		return $url;
	}

	private function secret(): ?string {
		if ( ! defined( 'SIRA_NEXT_REVALIDATION_SECRET' ) ) {
			return null;
		}

		$secret = (string) constant( 'SIRA_NEXT_REVALIDATION_SECRET' );

		return strlen( $secret ) >= 32 ? $secret : null;
	}

	private function is_configured(): bool {
		return null !== $this->secret() && array() !== $this->endpoints();
	}

	/**
	 * @return array<int,string>
	 */
	private function post_paths( \WP_Post $post ): array {
		$paths = array();

		if ( 'attachment' === $post->post_type ) {
			return $paths;
		}

		if ( 'page' === $post->post_type ) {
			$page_uri = get_page_uri( $post );

			if ( is_string( $page_uri ) && '' !== $page_uri ) {
				$paths[] = '/' . trim( $page_uri, '/' ) . '/';
			}

			return $paths;
		}

		$definitions = PostTypes::definitions();

		if ( isset( $definitions[ $post->post_type ] ) ) {
			$config = $definitions[ $post->post_type ];

			if ( false === (bool) ( $config['publicly_queryable'] ?? true ) ) {
				return $paths;
			}

			$archive_slug = sanitize_title( (string) ( $config['slug'] ?? '' ) );
			$has_archive  = (bool) ( $config['has_archive'] ?? true );

			if ( '' !== $archive_slug && $has_archive ) {
				$paths[] = '/' . $archive_slug . '/';
			}

			if ( '' !== $archive_slug && '' !== $post->post_name ) {
				$paths[] = sprintf(
					'/%s/%s/',
					$archive_slug,
					sanitize_title( $post->post_name )
				);
			}

			return $paths;
		}

		$permalink = get_permalink( $post );
		$path      = is_string( $permalink )
			? wp_parse_url( $permalink, PHP_URL_PATH )
			: null;

		if ( is_string( $path ) && '' !== $path ) {
			$paths[] = $path;
		}

		return $paths;
	}

	private function affects_homepage( string $post_type ): bool {
		$defaults = array(
			'sira_company',
			'sira_project',
			'sira_news',
			'sira_insight',
			'sira_service',
			'sira_event',
			'sira_partner',
			'sira_testimonial',
			'sira_leadership',
			'sira_press_release',
		);
		$types    = (array) apply_filters(
			'sira_revalidation_homepage_post_types',
			$defaults
		);

		return in_array( $post_type, $types, true );
	}

	private function is_allowed_post( \WP_Post $post ): bool {
		if ( wp_is_post_revision( $post->ID ) || wp_is_post_autosave( $post->ID ) ) {
			return false;
		}

		return in_array( $post->post_type, $this->allowed_post_types(), true );
	}

	/**
	 * @return array<int,string>
	 */
	private function allowed_post_types(): array {
		$types = array_merge(
			array_keys( PostTypes::definitions() ),
			array( 'page', 'post', 'attachment' )
		);
		$types = (array) apply_filters(
			'sira_revalidation_allowed_post_types',
			$types
		);

		return array_values(
			array_unique(
				array_filter(
					array_map( 'sanitize_key', $types )
				)
			)
		);
	}

	private function is_allowed_status( string $status ): bool {
		$statuses = (array) apply_filters(
			'sira_revalidation_allowed_statuses',
			array(
				'publish',
				'future',
				'draft',
				'pending',
				'private',
				'trash',
				'inherit',
				'auto-draft',
				'new',
			)
		);

		return in_array( $status, $statuses, true );
	}

	private function normalize_status( string $status, string $fallback ): string {
		$status = sanitize_key( $status );

		return '' !== $status ? $status : sanitize_key( $fallback );
	}

	private function is_allowed_taxonomy( string $taxonomy ): bool {
		$taxonomies = array_keys( Taxonomies::definitions() );
		$taxonomies = (array) apply_filters(
			'sira_revalidation_allowed_taxonomies',
			$taxonomies
		);

		return in_array( $taxonomy, $taxonomies, true );
	}

	private function public_post_fields_changed(
		\WP_Post $after,
		\WP_Post $before
	): bool {
		foreach (
			array(
				'post_title',
				'post_name',
				'post_content',
				'post_excerpt',
				'post_parent',
				'menu_order',
			) as $field
		) {
			if ( $after->{$field} !== $before->{$field} ) {
				return true;
			}
		}

		return false;
	}

	private function is_relevant_attachment_meta( string $meta_key ): bool {
		$keys = (array) apply_filters(
			'sira_revalidation_attachment_meta_keys',
			array(
				'_wp_attachment_image_alt',
				'_wp_attachment_metadata',
				'_wp_attached_file',
			)
		);

		return in_array( $meta_key, $keys, true );
	}

	private function is_relevant_content_meta( string $meta_key ): bool {
		$keys = (array) apply_filters(
			'sira_revalidation_content_meta_keys',
			array(
				'_thumbnail_id',
			)
		);

		if ( in_array( $meta_key, $keys, true ) ) {
			return true;
		}

		return str_starts_with( $meta_key, 'sira_' )
			|| str_starts_with( $meta_key, '_sira_' );
	}

	/**
	 * @param array<int,int> $tt_ids
	 * @return array<int,int>
	 */
	private function term_ids_from_tt_ids( array $tt_ids, string $taxonomy ): array {
		$term_ids = array();

		foreach ( $tt_ids as $tt_id ) {
			$term = get_term_by( 'term_taxonomy_id', $tt_id, $taxonomy );

			if ( $term instanceof \WP_Term ) {
				$term_ids[] = (int) $term->term_id;
			}
		}

		return array_values( array_unique( $term_ids ) );
	}

	/**
	 * @param array<int,mixed> $paths
	 * @return array<int,string>
	 */
	private function sanitize_paths( array $paths ): array {
		$valid = array();

		foreach ( $paths as $path ) {
			if ( ! is_string( $path ) || '' === trim( $path ) ) {
				continue;
			}

			$path = trim( $path );

			if ( str_contains( $path, '://' ) ) {
				$parsed = wp_parse_url( $path, PHP_URL_PATH );
				$path   = is_string( $parsed ) ? $parsed : '';
			}

			if (
				'' === $path
				|| '/' !== $path[0]
				|| str_contains( $path, '..' )
				|| str_contains( $path, "\0" )
			) {
				continue;
			}

			$path = preg_replace( '#/+#', '/', $path ) ?? '';

			if ( '' === $path || strlen( $path ) > 2048 ) {
				continue;
			}

			$valid[] = $path;
		}

		return array_values( array_unique( $valid ) );
	}

	/**
	 * @param array<int,mixed> $tags
	 * @return array<int,string>
	 */
	private function sanitize_tags( array $tags ): array {
		$valid = array();

		foreach ( $tags as $tag ) {
			if ( ! is_string( $tag ) ) {
				continue;
			}

			$tag = strtolower( trim( $tag ) );
			$tag = preg_replace( '/[^a-z0-9:_-]/', '-', $tag ) ?? '';
			$tag = trim( $tag, '-:' );

			if ( '' === $tag || strlen( $tag ) > 128 ) {
				continue;
			}

			$valid[] = $tag;
		}

		return array_values( array_unique( $valid ) );
	}

	/**
	 * @param array<string,mixed> $event
	 */
	private function fingerprint( array $event ): string {
		$identity = array(
			'blogId'    => absint( $event['site']['blogId'] ?? 0 ),
			'source'    => (string) ( $event['source'] ?? '' ),
			'operation' => (string) ( $event['operation'] ?? '' ),
			'postType'  => (string) ( $event['postType'] ?? '' ),
			'postId'    => absint( $event['postId'] ?? 0 ),
			'taxonomy'  => (string) ( $event['taxonomy'] ?? '' ),
			'termIds'   => array_values( (array) ( $event['termIds'] ?? array() ) ),
			'menuId'    => absint( $event['menuId'] ?? 0 ),
		);

		return hash(
			'sha256',
			(string) wp_json_encode( $identity )
		);
	}

	/**
	 * @param array<string,mixed> $item
	 */
	private function store_queue_item( string $event_id, array $item ): bool {
		if ( ! $this->acquire_queue_lock() ) {
			$this->log_internal( 'queue-lock-unavailable', $event_id );
			return false;
		}

		try {
			$queue              = $this->queue();
			$queue[ $event_id ] = $item;

			if ( count( $queue ) > self::MAX_QUEUE ) {
				uasort(
					$queue,
					static fn( array $left, array $right ): int =>
						absint( $left['created_at'] ?? 0 )
						<=>
						absint( $right['created_at'] ?? 0 )
				);

				while ( count( $queue ) > self::MAX_QUEUE ) {
					$discarded_id = array_key_first( $queue );

					if ( null === $discarded_id ) {
						break;
					}

					unset( $queue[ $discarded_id ] );
					$this->log_internal( 'queue-cap-discard', $discarded_id );
				}
			}

			return $this->save_queue( $queue );
		} finally {
			$this->release_queue_lock();
		}
	}

	/**
	 * @return array<string,mixed>|null
	 */
	private function claim_queue_item( string $event_id ): ?array {
		if ( ! $this->acquire_queue_lock() ) {
			$this->schedule_delivery( $event_id, 15 );
			return null;
		}

		try {
			$queue = $this->queue();
			$item  = $queue[ $event_id ] ?? null;

			if ( ! is_array( $item ) ) {
				return null;
			}

			$in_flight_until = absint( $item['in_flight_until'] ?? 0 );

			if ( $in_flight_until > time() ) {
				$this->schedule_delivery(
					$event_id,
					max( 15, $in_flight_until - time() + 5 )
				);
				return null;
			}

			$item['attempts']        = absint( $item['attempts'] ?? 0 ) + 1;
			$item['in_flight_until'] = time() + 120;
			$queue[ $event_id ]      = $item;
			$this->save_queue( $queue );

			/*
			 * Safety retry. A completed delivery removes this event. If PHP
			 * exits during HTTP transport, the event becomes eligible again.
			 */
			$this->schedule_delivery( $event_id, 130 );

			return $item;
		} finally {
			$this->release_queue_lock();
		}
	}

	private function complete_queue_item( string $event_id ): void {
		if ( ! $this->acquire_queue_lock() ) {
			/*
			 * Preserve at-least-once delivery semantics. The existing safety
			 * event remains scheduled; adding another short retry is harmless
			 * because the Next.js receiver deduplicates by event ID.
			 */
			$this->schedule_delivery( $event_id, 15 );
			return;
		}

		$completed = false;

		try {
			$queue = $this->queue();
			unset( $queue[ $event_id ] );
			$completed = $this->save_queue( $queue );
		} finally {
			$this->release_queue_lock();
		}

		if ( $completed ) {
			wp_clear_scheduled_hook( self::CRON_HOOK, array( $event_id ) );
			return;
		}

		$this->schedule_delivery( $event_id, 15 );
	}

	/**
	 * @param array<string,mixed> $item
	 * @param array<int,string>   $failed_endpoints
	 */
	private function retry_or_fail(
		string $event_id,
		array $item,
		array $failed_endpoints,
		string $reason
	): void {
		$attempts     = absint( $item['attempts'] ?? 1 );
		$max_attempts = max(
			1,
			(int) apply_filters( 'sira_revalidation_max_attempts', 3 )
		);

		if ( $attempts >= $max_attempts ) {
			$this->complete_queue_item( $event_id );
			$this->log_internal( $reason . '-exhausted', $event_id );
			do_action(
				'sira_revalidation_failed',
				$item['payload'] ?? array(),
				$reason
			);
			return;
		}

		$item['pending_endpoints'] = array_values(
			array_unique( $failed_endpoints )
		);
		$item['in_flight_until']   = 0;

		/*
		 * Keep the safety retry in place until the updated queue state is
		 * persisted. Clearing it first could strand the event if the queue
		 * lock is temporarily unavailable.
		 */
		if ( ! $this->store_queue_item( $event_id, $item ) ) {
			return;
		}

		wp_clear_scheduled_hook( self::CRON_HOOK, array( $event_id ) );

		$delays = (array) apply_filters(
			'sira_revalidation_retry_delays',
			array( 30, 300, 1800 )
		);
		$index  = max( 0, $attempts - 1 );
		$delay  = absint( $delays[ $index ] ?? 300 );

		$this->schedule_delivery( $event_id, max( 15, $delay ) );
	}

	private function schedule_delivery( string $event_id, int $delay ): void {
		$args = array( $event_id );

		if ( false !== wp_next_scheduled( self::CRON_HOOK, $args ) ) {
			return;
		}

		$result = wp_schedule_single_event(
			time() + max( 1, $delay ),
			self::CRON_HOOK,
			$args,
			true
		);

		if ( is_wp_error( $result ) ) {
			$this->log_internal(
				'cron-schedule-' . $result->get_error_code(),
				$event_id
			);
		}
	}

	/**
	 * @return array<string,array<string,mixed>>
	 */
	private function queue(): array {
		$queue = get_option( self::QUEUE_OPTION, array() );

		return is_array( $queue ) ? $queue : array();
	}

	/**
	 * @param array<string,array<string,mixed>> $queue
	 */
	private function save_queue( array $queue ): bool {
		if ( false === get_option( self::QUEUE_OPTION, false ) ) {
			return add_option(
				self::QUEUE_OPTION,
				$queue,
				'',
				false
			);
		}

		$updated = update_option( self::QUEUE_OPTION, $queue, false );

		/*
		 * update_option() returns false when the serialized value did not
		 * change. That is still a successful queue state.
		 */
		return $updated || $queue === $this->queue();
	}

	private function acquire_queue_lock(): bool {
		for ( $attempt = 0; $attempt < 5; $attempt++ ) {
			if (
				add_option(
					self::LOCK_OPTION,
					time(),
					'',
					false
				)
			) {
				return true;
			}

			$locked_at = absint( get_option( self::LOCK_OPTION, 0 ) );

			if ( 0 < $locked_at && $locked_at < time() - 30 ) {
				delete_option( self::LOCK_OPTION );
				continue;
			}

			usleep( 20000 );
		}

		return false;
	}

	private function release_queue_lock(): void {
		delete_option( self::LOCK_OPTION );
	}

	private function log_failure(
		string $event_id,
		string $endpoint,
		int $attempt,
		string $reason
	): void {
		$host = (string) wp_parse_url( $endpoint, PHP_URL_HOST );

		error_log(
			sprintf(
				'[SIRA Revalidation] event=%s host=%s attempt=%d result=%s',
				sanitize_text_field( $event_id ),
				sanitize_text_field( $host ),
				$attempt,
				sanitize_key( $reason )
			)
		);
	}

	private function log_internal( string $reason, string $event_id ): void {
		error_log(
			sprintf(
				'[SIRA Revalidation] event=%s result=%s',
				sanitize_text_field( $event_id ),
				sanitize_key( $reason )
			)
		);
	}
}
