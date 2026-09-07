<?php
/**
 * Plugin Name: SIRA Contact Store
 * Description: Private, administrator-only storage for contact form submissions.
 * Version:     1.0.0
 *
 * Every valid enquiry is written here BEFORE any delivery is attempted, so an
 * outage in the mail transport cannot lose it. The record also carries the
 * delivery outcome, which is what makes a failure diagnosable and retryable
 * rather than invisible.
 *
 * Privacy posture — these records hold personal data (a name, an email address
 * and whatever the sender chose to write), so the post type is closed by
 * construction rather than by convention:
 *
 *   - public, publicly_queryable, has_archive, rewrite and query_var are all
 *     off, so no front-end URL resolves to a submission;
 *   - exclude_from_search keeps them out of site search, and a non-public type
 *     is excluded from WordPress core sitemaps and feeds automatically;
 *   - show_in_rest is off, so the core REST API exposes nothing;
 *   - show_in_graphql is off and no GraphQL single/plural name is declared, so
 *     WPGraphQL never registers the type;
 *   - every capability maps to manage_options, so only administrators can read
 *     them, and create_posts is denied outright: submissions arrive through the
 *     endpoint, never by hand;
 *   - the meta keys are underscore-prefixed and registered as protected with a
 *     denying auth_callback, so nothing can read or write them through a
 *     generic meta route.
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

const SIRA_CONTACT_POST_TYPE = 'sira_contact';

/** Delivery states a stored submission can be in. */
const SIRA_CONTACT_DELIVERY_PENDING      = 'pending';
const SIRA_CONTACT_DELIVERY_SENT         = 'sent';
const SIRA_CONTACT_DELIVERY_FAILED       = 'failed';
const SIRA_CONTACT_DELIVERY_UNCONFIGURED = 'unconfigured';

const SIRA_CONTACT_META = [
    'name'         => '_sira_contact_name',
    'email'        => '_sira_contact_email',
    'service'      => '_sira_contact_service',
    'site'         => '_sira_contact_site',
    'submitted'    => '_sira_contact_submitted_at',
    'status'       => '_sira_contact_delivery_status',
    'attempted'    => '_sira_contact_delivery_attempted_at',
    'detail'       => '_sira_contact_delivery_detail',
];

add_action('init', static function (): void {
    register_post_type(SIRA_CONTACT_POST_TYPE, [
        'labels' => [
            'name'          => 'Enquiries',
            'singular_name' => 'Enquiry',
            'menu_name'     => 'Enquiries',
            'all_items'     => 'All Enquiries',
            'search_items'  => 'Search Enquiries',
            'not_found'     => 'No enquiries yet.',
        ],
        'public'              => false,
        'publicly_queryable'  => false,
        'exclude_from_search' => true,
        'has_archive'         => false,
        'rewrite'             => false,
        'query_var'           => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_nav_menus'   => false,
        'show_in_admin_bar'   => false,
        'show_in_rest'        => false,
        'show_in_graphql'     => false,
        'can_export'          => false,
        'menu_icon'           => 'dashicons-email-alt',
        'menu_position'       => 26,
        'supports'            => ['title', 'editor'],
        'map_meta_cap'        => false,
        'capabilities'        => [
            'edit_post'           => 'manage_options',
            'read_post'           => 'manage_options',
            'delete_post'         => 'manage_options',
            'edit_posts'          => 'manage_options',
            'edit_others_posts'   => 'manage_options',
            'delete_posts'        => 'manage_options',
            'publish_posts'       => 'manage_options',
            'read_private_posts'  => 'manage_options',
            // Enquiries arrive through the endpoint. Nothing creates one by hand.
            'create_posts'        => 'do_not_allow',
        ],
    ]);

    foreach (SIRA_CONTACT_META as $key) {
        register_post_meta(SIRA_CONTACT_POST_TYPE, $key, [
            'type'         => 'string',
            'single'       => true,
            'show_in_rest' => false,
            // Protected already by the underscore prefix; stated explicitly so
            // a future change to that convention cannot open these up.
            'auth_callback' => '__return_false',
        ]);
    }
});

/**
 * Store one validated submission and return its post ID, or a WP_Error.
 *
 * Called before delivery is attempted. The caller records the outcome with
 * sira_contact_record_delivery().
 *
 * @param array{name:string,email:string,service:string,message:string} $fields
 */
function sira_contact_store(array $fields)
{
    $submitted = gmdate('c');

    $post_id = wp_insert_post([
        'post_type'    => SIRA_CONTACT_POST_TYPE,
        // Private, not draft: a draft reads as unfinished work, whereas these
        // are complete records that simply have no public face.
        'post_status'  => 'private',
        'post_title'   => sprintf('%s — %s', $fields['name'], get_bloginfo('name')),
        'post_content' => $fields['message'],
        'post_author'  => 0,
    ], true);

    if (is_wp_error($post_id)) {
        return $post_id;
    }

    $values = [
        SIRA_CONTACT_META['name']      => $fields['name'],
        SIRA_CONTACT_META['email']     => $fields['email'],
        SIRA_CONTACT_META['service']   => $fields['service'],
        SIRA_CONTACT_META['site']      => sprintf('%d:%s', get_current_blog_id(), get_bloginfo('name')),
        SIRA_CONTACT_META['submitted'] => $submitted,
        SIRA_CONTACT_META['status']    => SIRA_CONTACT_DELIVERY_PENDING,
    ];

    foreach ($values as $key => $value) {
        update_post_meta((int) $post_id, $key, $value);
    }

    return (int) $post_id;
}

/**
 * Record what happened when delivery was attempted.
 *
 * $detail is a short, safe transport status such as "graph:202" or
 * "graph:403 ErrorAccessDenied". It must never carry a credential, a token or
 * a full response body.
 */
function sira_contact_record_delivery(int $post_id, string $status, string $detail = ''): void
{
    update_post_meta($post_id, SIRA_CONTACT_META['status'], $status);
    update_post_meta($post_id, SIRA_CONTACT_META['attempted'], gmdate('c'));

    if ($detail !== '') {
        update_post_meta($post_id, SIRA_CONTACT_META['detail'], mb_substr($detail, 0, 200));
    }
}

/**
 * Admin list columns, so an owner can see at a glance which enquiries were
 * delivered and which are waiting on a transport fix.
 */
add_filter('manage_' . SIRA_CONTACT_POST_TYPE . '_posts_columns', static function (array $columns): array {
    return [
        'cb'             => $columns['cb'] ?? '',
        'title'          => 'Enquiry',
        'sira_email'     => 'Email',
        'sira_service'   => 'Service',
        'sira_site'      => 'Site',
        'sira_delivery'  => 'Delivery',
        'date'           => $columns['date'] ?? 'Date',
    ];
});

add_action('manage_' . SIRA_CONTACT_POST_TYPE . '_posts_custom_column', static function (string $column, int $post_id): void {
    $map = [
        'sira_email'    => SIRA_CONTACT_META['email'],
        'sira_service'  => SIRA_CONTACT_META['service'],
        'sira_site'     => SIRA_CONTACT_META['site'],
    ];

    if (isset($map[$column])) {
        echo esc_html((string) get_post_meta($post_id, $map[$column], true));
        return;
    }

    if ($column !== 'sira_delivery') {
        return;
    }

    $status = (string) get_post_meta($post_id, SIRA_CONTACT_META['status'], true);
    $detail = (string) get_post_meta($post_id, SIRA_CONTACT_META['detail'], true);

    echo esc_html($status !== '' ? $status : 'unknown');

    if ($detail !== '' && $status !== SIRA_CONTACT_DELIVERY_SENT) {
        echo '<br><small>' . esc_html($detail) . '</small>';
    }
}, 10, 2);
