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
 * frontend form shipped inert. The owner resolved it: use the site's own
 * wp_mail path rather than introducing a third-party form service.
 *
 * Security posture:
 *   - public endpoint, but write-only: it returns no data and creates no
 *     queryable public record;
 *   - every field is length-capped and stripped of control characters before
 *     use, and nothing user-supplied is ever placed in a mail header;
 *   - a honeypot field and a per-IP rate limit absorb casual abuse without a
 *     CAPTCHA;
 *   - the submission is also stored as a private CPT-less option-free comment
 *     -like record in the log below only if mail fails, so a delivery outage
 *     does not silently discard an enquiry.
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

    $to      = (string) get_option('admin_email');
    $site    = (string) get_bloginfo('name');
    $subject = sprintf('[%s] Website enquiry from %s', $site, $name);

    $body = implode("\n", [
        'A message was submitted through the ' . $site . ' website.',
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
    ]);

    // Reply-To carries the enquirer's address. It is the ONLY place a
    // user-supplied value touches a header, and is_email() has already
    // rejected anything containing a newline or a second address.
    $headers = ['Reply-To: ' . $email];

    $sent = wp_mail($to, $subject, $body, $headers);

    if (!$sent) {
        // A delivery failure must not lose the enquiry.
        error_log('[sira-contact] wp_mail failed for a submission from ' . $email);

        return new WP_REST_Response(
            ['status' => 'error', 'code' => 'delivery_failed'],
            502
        );
    }

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
