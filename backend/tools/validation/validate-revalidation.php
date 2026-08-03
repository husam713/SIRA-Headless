<?php
/**
 * Mutating revalidation queue, signature, delivery, and retry checks.
 *
 * Run only on isolated staging:
 * SIRA_VALIDATION_ALLOW_MUTATIONS=1 \
 * wp eval-file wp-content/plugins/sira-core/tools/validation/validate-revalidation.php
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	fwrite( STDERR, "Load this file through WP-CLI.\n" );
	exit( 1 );
}

if ( '1' !== (string) getenv( 'SIRA_VALIDATION_ALLOW_MUTATIONS' ) ) {
	fwrite(
		STDERR,
		"Set SIRA_VALIDATION_ALLOW_MUTATIONS=1 on staging.\n"
	);
	exit( 2 );
}

if (
	'production' === wp_get_environment_type()
	&& '1' !== (string) getenv( 'SIRA_VALIDATION_ALLOW_PRODUCTION' )
) {
	fwrite( STDERR, "Refusing to run revalidation tests in production.\n" );
	exit( 2 );
}

if ( ! defined( 'SIRA_NEXT_REVALIDATION_SECRET' ) ) {
	define(
		'SIRA_NEXT_REVALIDATION_SECRET',
		str_repeat( 'validation-only-', 4 )
	);
}

$secret = (string) SIRA_NEXT_REVALIDATION_SECRET;

if ( strlen( $secret ) < 32 ) {
	fwrite( STDERR, "The configured test secret must be at least 32 characters.\n" );
	exit( 1 );
}

$endpoint     = 'https://revalidation.invalid/api/revalidate';
$queue_option = 'sira_revalidation_queue_v1';
$captured     = array();
$response_code = 204;
$passes       = array();
$failures     = array();
$test_post_ids = array();
$test_event_ids = array();
$test_term_id = 0;
$before_event_ids = array();

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

add_filter(
	'sira_revalidation_endpoints',
	static fn(): array => array( $endpoint ),
	PHP_INT_MAX
);

add_filter(
	'pre_http_request',
	static function (
		mixed $preempt,
		array $args,
		string $url
	) use (
		$endpoint,
		&$captured,
		&$response_code
	): mixed {
		if ( $endpoint !== $url ) {
			return $preempt;
		}

		$captured[] = array(
			'url'  => $url,
			'args' => $args,
		);

		return array(
			'headers'  => array(),
			'body'     => '',
			'response' => array(
				'code'    => $response_code,
				'message' => 204 === $response_code
					? 'No Content'
					: 'Service Unavailable',
			),
			'cookies'  => array(),
			'filename' => null,
		);
	},
	PHP_INT_MAX,
	3
);

$get_queue = static function () use ( $queue_option ): array {
	$queue = get_option( $queue_option, array() );

	return is_array( $queue ) ? $queue : array();
};

$find_post_events = static function (
	array $queue,
	int $post_id,
	?string $operation = null
): array {
	return array_filter(
		$queue,
		static function ( mixed $item ) use ( $post_id, $operation ): bool {
			if ( ! is_array( $item ) || ! is_array( $item['payload'] ?? null ) ) {
				return false;
			}

			$payload = $item['payload'];

			if ( absint( $payload['postId'] ?? 0 ) !== $post_id ) {
				return false;
			}

			return null === $operation
				|| $operation === (string) ( $payload['operation'] ?? '' );
		}
	);
};

try {
	$before_queue     = $get_queue();
	$before_event_ids = array_keys( $before_queue );

	$publish_post_id = wp_insert_post(
		array(
			'post_type'    => 'sira_news',
			'post_status'  => 'publish',
			'post_title'   => 'SIRA revalidation publish ' . wp_generate_uuid4(),
			'post_content' => 'Temporary Step 1G revalidation fixture.',
		),
		true
	);

	$record(
		! is_wp_error( $publish_post_id ) && 0 < (int) $publish_post_id,
		'Created a published revalidation fixture.'
	);

	if ( is_wp_error( $publish_post_id ) ) {
		throw new RuntimeException( $publish_post_id->get_error_message() );
	}

	$publish_post_id   = (int) $publish_post_id;
	$test_post_ids[]   = $publish_post_id;
	$queue             = $get_queue();
	$publish_events    = $find_post_events( $queue, $publish_post_id, 'publish' );

	$record(
		1 === count( $publish_events ),
		'One publish event is queued for a direct new-to-publish insertion.'
	);

	$publish_event_id = (string) array_key_first( $publish_events );

	if ( '' === $publish_event_id ) {
		throw new RuntimeException( 'No publish event ID was queued.' );
	}

	$test_event_ids[] = $publish_event_id;
	$payload          = $publish_events[ $publish_event_id ]['payload'] ?? array();

	$record(
		'new' === (string) ( $payload['previousStatus'] ?? '' ),
		'The publish event records the WordPress new status.'
	);
	$record(
		'sira_news' === (string) ( $payload['postType'] ?? '' ),
		'The publish event contains the expected post type.'
	);
	$record(
		in_array( '/news/', (array) ( $payload['paths'] ?? array() ), true ),
		'The publish event contains the news archive path.'
	);
	$record(
		in_array(
			'post:sira_news:' . $publish_post_id,
			(array) ( $payload['tags'] ?? array() ),
			true
		),
		'The publish event contains its content cache tag.'
	);

	do_action( 'sira_revalidation_deliver_event', $publish_event_id );

	$delivery = $captured[0] ?? null;

	$record(
		is_array( $delivery ),
		'The delivery worker attempted one HTTP request.'
	);

	if ( is_array( $delivery ) ) {
		$args      = is_array( $delivery['args'] ?? null )
			? $delivery['args']
			: array();
		$headers   = is_array( $args['headers'] ?? null )
			? $args['headers']
			: array();
		$body      = is_string( $args['body'] ?? null )
			? $args['body']
			: '';
		$timestamp = (string) ( $headers['X-Sira-Timestamp'] ?? '' );
		$signature = (string) ( $headers['X-Sira-Signature'] ?? '' );
		$expected  = 'v1=' . hash_hmac(
			'sha256',
			$timestamp . '.' . $body,
			$secret
		);
		$decoded   = json_decode( $body, true );

		$record(
			$endpoint === (string) ( $delivery['url'] ?? '' ),
			'The request uses the configured endpoint.'
		);
		$record(
			hash_equals( $expected, $signature ),
			'The request HMAC-SHA256 signature is valid.'
		);
		$record(
			$publish_event_id
				=== (string) ( $headers['X-Sira-Event-Id'] ?? '' ),
			'The event ID header matches the queued event.'
		);
		$record(
			is_array( $decoded )
				&& $publish_event_id
					=== (string) ( $decoded['eventId'] ?? '' ),
			'The JSON body contains the matching event ID.'
		);
		$record(
			false === str_contains( $body, $secret ),
			'The request body does not contain the shared secret.'
		);
		$record(
			3 === (int) ( $args['timeout'] ?? 0 ),
			'The request uses the short three-second timeout.'
		);
		$record(
			true === (bool) ( $args['sslverify'] ?? false ),
			'TLS certificate verification remains enabled.'
		);
	}

	$record(
		! isset( $get_queue()[ $publish_event_id ] ),
		'A successful 2xx delivery removes the queue item.'
	);

	/*
	 * Taxonomy invalidation.
	 */
	$term = wp_insert_term(
		'SIRA validation sector ' . wp_generate_uuid4(),
		'sira_sector'
	);

	if ( ! is_wp_error( $term ) ) {
		$test_term_id = absint( $term['term_id'] ?? 0 );
		wp_set_object_terms(
			$publish_post_id,
			array( $test_term_id ),
			'sira_sector',
			false
		);

		$queue           = $get_queue();
		$taxonomy_events = $find_post_events(
			$queue,
			$publish_post_id,
			'taxonomy-assign'
		);

		$record(
			1 === count( $taxonomy_events ),
			'One taxonomy assignment event is queued.'
		);

		foreach ( $taxonomy_events as $event_id => $item ) {
			$test_event_ids[] = (string) $event_id;
			$event_payload    = is_array( $item['payload'] ?? null )
				? $item['payload']
				: array();

			$record(
				in_array(
					'term:sira_sector:' . $test_term_id,
					(array) ( $event_payload['tags'] ?? array() ),
					true
				),
				'The taxonomy event includes the affected term tag.'
			);
		}
	} else {
		$failures[] = 'Could not create a temporary taxonomy term.';
	}

	/*
	 * Retry behavior with a separate post, avoiding lifecycle de-duplication.
	 */
	$response_code = 503;

	$retry_post_id = wp_insert_post(
		array(
			'post_type'    => 'sira_news',
			'post_status'  => 'publish',
			'post_title'   => 'SIRA revalidation retry ' . wp_generate_uuid4(),
			'post_content' => 'Temporary Step 1G retry fixture.',
		),
		true
	);

	if ( is_wp_error( $retry_post_id ) ) {
		throw new RuntimeException( $retry_post_id->get_error_message() );
	}

	$retry_post_id   = (int) $retry_post_id;
	$test_post_ids[] = $retry_post_id;
	$queue           = $get_queue();
	$retry_events    = $find_post_events( $queue, $retry_post_id, 'publish' );
	$retry_event_id  = (string) array_key_first( $retry_events );

	$record(
		'' !== $retry_event_id,
		'A retry fixture publish event is queued.'
	);

	if ( '' !== $retry_event_id ) {
		$test_event_ids[] = $retry_event_id;
		do_action( 'sira_revalidation_deliver_event', $retry_event_id );

		$retry_queue = $get_queue();
		$retry_item  = $retry_queue[ $retry_event_id ] ?? null;

		$record(
			is_array( $retry_item ),
			'A 503 response keeps the event in the queue.'
		);
		$record(
			1 === absint( $retry_item['attempts'] ?? 0 ),
			'The failed delivery increments the attempt count.'
		);
		$record(
			false !== wp_next_scheduled(
				'sira_revalidation_deliver_event',
				array( $retry_event_id )
			),
			'The failed delivery schedules a retry.'
		);
	}
} catch ( Throwable $throwable ) {
	$failures[] = 'Test execution error: ' . $throwable->getMessage();
} finally {
	/*
	 * Prevent cleanup deletes from producing new events.
	 */
	add_filter(
		'sira_revalidation_allowed_post_types',
		static fn(): array => array(),
		PHP_INT_MAX
	);

	foreach ( $test_post_ids as $post_id ) {
		wp_delete_post( $post_id, true );
	}

	if ( 0 < $test_term_id ) {
		wp_delete_term( $test_term_id, 'sira_sector' );
	}

	$queue         = $get_queue();
	$new_event_ids = array_diff( array_keys( $queue ), $before_event_ids );
	$cleanup_ids   = array_values(
		array_unique(
			array_merge( $test_event_ids, $new_event_ids )
		)
	);

	foreach ( $cleanup_ids as $event_id ) {
		unset( $queue[ $event_id ] );
		wp_clear_scheduled_hook(
			'sira_revalidation_deliver_event',
			array( $event_id )
		);
	}

	if ( array() === $queue ) {
		delete_option( $queue_option );
	} else {
		update_option( $queue_option, $queue, false );
	}
}

echo "SIRA Step 1 revalidation validation\n";
echo str_repeat( '=', 38 ) . "\n\n";

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
