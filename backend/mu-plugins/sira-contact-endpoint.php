<?php
/**
 * Plugin Name: SIRA Contact Endpoint
 * Description: Server-side handler for the public contact form. Registers
 *              POST /sira/v1/contact in sira-core's existing namespace.
 * Version:     1.0.0
 *
 * Deployed as a must-use plugin so it loads without activation and does not
 * modify sira-core, whose source is reconciled against this repository
 * (SOT-001). Removing this one file removes the endpoint completely.
 *
 * 2C4-B08 (forms architecture) was previously unresolved, which is why the
 * frontend form shipped inert. The owner resolved it: handle submissions on
 * the site's own infrastructure rather than introducing a third-party form
 * service.
 *
 * Flow, in this order and for this reason:
 *
 *   1. validate;
 *   2. STORE the enquiry (sira-contact-store.php) — before any delivery is
 *      attempted, so a transport outage cannot lose it;
 *   3. attempt delivery through the authenticated Microsoft 365 transport
 *      (sira-m365-mailer.php);
 *   4. record the delivery outcome on the stored record.
 *
 * The visitor is told the enquiry was received as soon as step 2 succeeds. A
 * failure in step 3 is an internal problem: the enquiry is safe, somebody will
 * read it, and telling a visitor that our mail relay is unhappy would leak
 * infrastructure detail while helping nobody. Only a failure to STORE is
 * reported as an error, because only then is the enquiry actually lost.
 *
 * Local PHP mail is deliberately NOT used as a fallback. The domain publishes
 * `-all` and its MX is Microsoft 365, so mail sent from this host is discarded
 * on arrival; a fallback to it would look like redundancy while delivering
 * nothing.
 *
 * Security posture:
 *   - public endpoint, but write-only: it returns no data and creates no
 *     publicly queryable record;
 *   - every field is length-capped and stripped of control characters before
 *     use, and nothing user-supplied is ever placed in a mail header;
 *   - a honeypot field and a per-IP rate limit absorb casual abuse without a
 *     CAPTCHA;
 *   - stored submissions are private and administrator-only — see
 *     sira-contact-store.php for the full privacy posture.
 *
 * Recipients are resolved per tenant, not per network: see
 * sira_contact_recipient(). A network shares one wp-config.php, so a single
 * constant would route every company's enquiries to one inbox.
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

const SIRA_CONTACT_MAX_LENGTHS = [
    'name'    => 120,
    'email'   => 200,
    'service' => 80,
    'message' => 4000,
];

const SIRA_CONTACT_RATE_LIMIT   = 5;    // submissions
const SIRA_CONTACT_RATE_WINDOW  = 900;  // seconds (15 minutes)

/**
 * Collapse whitespace, drop control characters, and cap length.
 *
 * Header injection is impossible downstream because no value reaches a mail
 * header, but newlines are still removed from short fields so a name cannot
 * fake structure inside the message body.
 */
function sira_contact_clean(string $value, int $max, bool $multiline = false): string
{
    $value = wp_check_invalid_utf8($value, true);
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';

    if (!$multiline) {
        $value = preg_replace('/\s+/u', ' ', $value) ?? '';
    } else {
        $value = preg_replace('/\r\n?/u', "\n", $value) ?? '';
        $value = preg_replace('/\n{3,}/u', "\n\n", $value) ?? '';
    }

    return trim(mb_substr($value, 0, $max));
}

/** The hostname this tenant actually serves, for naming it in a notification. */
function sira_contact_site_host(): string
{
    $host = wp_parse_url(home_url('/'), PHP_URL_HOST);

    return is_string($host) && $host !== '' ? $host : 'unknown-host';
}

/**
 * Who receives an enquiry from THIS site.
 *
 * A Multisite network shares one wp-config.php, so a single constant cannot be
 * tenant-aware: it would route every company's enquiries to one inbox. Since
 * ADR-033 added a company with its own domain and its own commercial owner,
 * this resolves per tenant. Most specific source first:
 *
 *   1. the per-site `sira_contact_recipient` option, which lives in the
 *      tenant's own options table, so a company can own its inbox without a
 *      deploy and without editing a shared file;
 *   2. SIRA_CONTACT_RECIPIENTS in wp-config.php — an array keyed by blog id or
 *      by hostname, which lets the one shared file address every tenant
 *      explicitly;
 *   3. SIRA_CONTACT_RECIPIENT, the original single-value constant, kept so an
 *      existing single-tenant configuration keeps working unchanged;
 *   4. the site's own administrator address, which is already per-site.
 *
 * Every candidate is validated before it is used, so a mistyped override falls
 * through to the next source instead of silently sending an enquiry nowhere.
 */
function sira_contact_recipient(): string
{
    $candidates = [];

    $option = get_option('sira_contact_recipient');
    if (is_string($option)) {
        $candidates[] = $option;
    }

    if (defined('SIRA_CONTACT_RECIPIENTS') && is_array(SIRA_CONTACT_RECIPIENTS)) {
        $map  = SIRA_CONTACT_RECIPIENTS;
        // PHP normalises a numeric array key to an int on both sides, so the
        // blog id matches whether wp-config wrote 6 or '6'.
        $keys = [get_current_blog_id(), sira_contact_site_host()];

        foreach ($keys as $key) {
            if (isset($map[$key]) && is_string($map[$key])) {
                $candidates[] = $map[$key];
                break;
            }
        }
    }

    if (defined('SIRA_CONTACT_RECIPIENT')) {
        $candidates[] = (string) SIRA_CONTACT_RECIPIENT;
    }

    $candidates[] = (string) get_option('admin_email');

    foreach ($candidates as $candidate) {
        $candidate = trim($candidate);

        if ($candidate !== '' && is_email($candidate)) {
            return $candidate;
        }
    }

    // Unreachable in a healthy install: WordPress cannot run without an
    // administrator address. Returning empty rather than guessing means the
    // transport reports a real failure and the enquiry stays stored.
    return '';
}

/** Per-IP throttle held in the object cache / transients. */
function sira_contact_rate_limited(): bool
{
    $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
    if ($ip === '') {
        return false;
    }

    $key   = 'sira_contact_' . md5($ip);
    $count = (int) get_transient($key);

    if ($count >= SIRA_CONTACT_RATE_LIMIT) {
        return true;
    }

    set_transient($key, $count + 1, SIRA_CONTACT_RATE_WINDOW);

    return false;
}

function sira_contact_handle(WP_REST_Request $request)
{
    // Honeypot. Real submitters never see this field; bots fill everything.
    $trap = (string) $request->get_param('company_website');
    if ($trap !== '') {
        // Reported as success so an abuser learns nothing from the response.
        return new WP_REST_Response(['status' => 'received'], 202);
    }

    if (sira_contact_rate_limited()) {
        return new WP_REST_Response(
            ['status' => 'error', 'code' => 'rate_limited'],
            429
        );
    }

    $name    = sira_contact_clean((string) $request->get_param('name'), SIRA_CONTACT_MAX_LENGTHS['name']);
    $email   = sira_contact_clean((string) $request->get_param('email'), SIRA_CONTACT_MAX_LENGTHS['email']);
    $service = sira_contact_clean((string) $request->get_param('service'), SIRA_CONTACT_MAX_LENGTHS['service']);
    $message = sira_contact_clean((string) $request->get_param('message'), SIRA_CONTACT_MAX_LENGTHS['message'], true);

    $errors = [];
    if ($name === '') {
        $errors['name'] = 'required';
    }
    if ($email === '' || !is_email($email)) {
        $errors['email'] = 'invalid';
    }
    if ($message === '' || mb_strlen($message) < 10) {
        $errors['message'] = 'too_short';
    }

    if ($errors !== []) {
        return new WP_REST_Response(
            ['status' => 'invalid', 'fields' => $errors],
            422
        );
    }

    // One place decides who receives enquiries, and it is tenant-aware.
    $to = sira_contact_recipient();

    $fields = [
        'name'    => $name,
        'email'   => $email,
        'service' => $service,
        'message' => $message,
    ];

    // Step 2: store, before anything can fail.
    $stored = sira_contact_store($fields);

    if (is_wp_error($stored)) {
        // The only genuinely lost enquiry. Everything else is recoverable.
        error_log('[sira-contact] could not store a submission: ' . $stored->get_error_code());

        return new WP_REST_Response(
            ['status' => 'error', 'code' => 'unavailable'],
            503
        );
    }

    $site    = (string) get_bloginfo('name');
    $subject = sprintf('[%s] Website enquiry from %s', $site, $name);

    $body = implode("\n", [
        'A message was submitted through the ' . $site . ' website.',
        'Site:    ' . sira_contact_site_host() . ' (blog ' . get_current_blog_id() . ')',
        '',
        'Name:    ' . $name,
        'Email:   ' . $email,
        'Service: ' . ($service !== '' ? $service : 'Not specified'),
        '',
        'Message:',
        $message,
        '',
        '---',
        'Submitted: ' . gmdate('c'),
        'Record:    #' . $stored,
    ]);

    // Step 3. Reply-To carries the enquirer's address; it is the ONLY place a
    // user-supplied value reaches a mail header, and is_email() has already
    // rejected anything containing a newline or a second address.
    if (!sira_m365_configured()) {
        sira_contact_record_delivery(
            $stored,
            SIRA_CONTACT_DELIVERY_UNCONFIGURED,
            'microsoft 365 transport not configured'
        );
        error_log('[sira-contact] stored #' . $stored . ' but the mail transport is not configured');

        return new WP_REST_Response(['status' => 'received'], 201);
    }

    $sent = sira_m365_send($to, $subject, $body, [$email]);

    if (is_wp_error($sent)) {
        // Step 4, failure branch. The detail is a short transport status such
        // as "graph:403 ErrorAccessDenied" — never a token or a secret.
        sira_contact_record_delivery(
            $stored,
            SIRA_CONTACT_DELIVERY_FAILED,
            $sent->get_error_message()
        );
        error_log('[sira-contact] stored #' . $stored . ' but delivery failed: ' . $sent->get_error_message());
    } else {
        sira_contact_record_delivery($stored, SIRA_CONTACT_DELIVERY_SENT, 'graph:202');
    }

    // The enquiry is stored either way, so the visitor gets the same answer.
    return new WP_REST_Response(['status' => 'received'], 201);
}

add_action('rest_api_init', static function (): void {
    register_rest_route('sira/v1', '/contact', [
        'methods'             => 'POST',
        'callback'            => 'sira_contact_handle',
        // Public by design: this is the site's contact form. It is write-only
        // and returns nothing but a status.
        'permission_callback' => '__return_true',
        'args'                => [
            'name'    => ['type' => 'string', 'required' => true],
            'email'   => ['type' => 'string', 'required' => true],
            'message' => ['type' => 'string', 'required' => true],
            'service' => ['type' => 'string', 'required' => false],
        ],
    ]);
});
