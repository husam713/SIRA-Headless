<?php
/**
 * Plugin Name: SIRA Microsoft 365 Mailer
 * Description: Authenticated outbound mail through the Microsoft Graph API.
 * Version:     1.0.0
 *
 * Why Graph rather than SMTP
 * --------------------------
 * siratrgroup.com publishes `v=spf1 include:spf.protection.outlook.com -all`
 * and its MX points at Microsoft 365. That is a hard fail for every other
 * sender, and the WordPress host is Hostinger — so PHP's local sendmail can
 * hand a message off successfully and have it discarded on arrival. That is
 * the failure this file replaces.
 *
 * Graph sendMail submits the message INSIDE the tenant over HTTPS, so it
 * leaves Microsoft's own infrastructure and inherits the tenant's SPF and DKIM
 * alignment. No DNS change is required and the SPF policy stays at -all.
 *
 * It also uses OAuth 2.0 client credentials — an app registration with its own
 * identity — rather than a mailbox password. Microsoft is retiring basic
 * authentication for SMTP AUTH, so an app password would be both weaker and on
 * a deprecation path; this route is not.
 *
 * Configuration lives in wp-config.php. Nothing here is ever committed:
 *
 *   define('SIRA_M365_TENANT_ID',     '...');  // directory (tenant) ID
 *   define('SIRA_M365_CLIENT_ID',     '...');  // application (client) ID
 *   define('SIRA_M365_CLIENT_SECRET', '...');  // client secret VALUE
 *   define('SIRA_M365_SENDER',        'noreply@siratrgroup.com');
 *
 * The access token is cached in a transient. It is a credential, so it is
 * never logged, never returned, and never placed in an error message.
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

const SIRA_M365_TOKEN_TRANSIENT = 'sira_m365_token';
const SIRA_M365_HTTP_TIMEOUT    = 20;

/** True when every constant needed to authenticate is present and non-empty. */
function sira_m365_configured(): bool
{
    foreach (['SIRA_M365_TENANT_ID', 'SIRA_M365_CLIENT_ID', 'SIRA_M365_CLIENT_SECRET', 'SIRA_M365_SENDER'] as $constant) {
        if (!defined($constant) || trim((string) constant($constant)) === '') {
            return false;
        }
    }

    return true;
}

/**
 * An app-only access token for Graph, from cache when possible.
 *
 * Returns the token string or a WP_Error whose message is safe to log: it
 * carries the HTTP status and Microsoft's error CODE, never the description,
 * the request body, or any part of the secret.
 */
function sira_m365_access_token()
{
    $cached = get_transient(SIRA_M365_TOKEN_TRANSIENT);
    if (is_string($cached) && $cached !== '') {
        return $cached;
    }

    $response = wp_remote_post(
        sprintf('https://login.microsoftonline.com/%s/oauth2/v2.0/token', rawurlencode((string) SIRA_M365_TENANT_ID)),
        [
            'timeout' => SIRA_M365_HTTP_TIMEOUT,
            'headers' => ['Content-Type' => 'application/x-www-form-urlencoded'],
            'body'    => [
                'grant_type'    => 'client_credentials',
                'client_id'     => (string) SIRA_M365_CLIENT_ID,
                'client_secret' => (string) SIRA_M365_CLIENT_SECRET,
                'scope'         => 'https://graph.microsoft.com/.default',
            ],
        ]
    );

    if (is_wp_error($response)) {
        return new WP_Error('sira_m365_token_transport', 'token request failed at transport level');
    }

    $status = (int) wp_remote_retrieve_response_code($response);
    $data   = json_decode((string) wp_remote_retrieve_body($response), true);

    if ($status !== 200 || !is_array($data) || !isset($data['access_token'])) {
        $code = is_array($data) && isset($data['error']) ? (string) $data['error'] : 'unknown';

        return new WP_Error(
            'sira_m365_token_rejected',
            sprintf('token %d %s', $status, $code)
        );
    }

    $token   = (string) $data['access_token'];
    $expires = isset($data['expires_in']) ? (int) $data['expires_in'] : 3600;

    // A minute of headroom so a token cannot expire between the cache read and
    // the send that uses it.
    set_transient(SIRA_M365_TOKEN_TRANSIENT, $token, max(60, $expires - 60));

    return $token;
}

/**
 * Send one plain-text message as the configured sender.
 *
 * Returns true, or a WP_Error whose message is a short, safe transport status
 * suitable for storing on the submission record and writing to the log.
 *
 * @param string[] $reply_to
 */
function sira_m365_send(string $to, string $subject, string $body, array $reply_to = [])
{
    if (!sira_m365_configured()) {
        return new WP_Error('sira_m365_unconfigured', 'graph not configured');
    }

    $token = sira_m365_access_token();
    if (is_wp_error($token)) {
        return $token;
    }

    $message = [
        'subject'      => $subject,
        'body'         => ['contentType' => 'Text', 'content' => $body],
        'toRecipients' => [['emailAddress' => ['address' => $to]]],
    ];

    if ($reply_to !== []) {
        $message['replyTo'] = array_map(
            static fn(string $address): array => ['emailAddress' => ['address' => $address]],
            $reply_to
        );
    }

    $response = wp_remote_post(
        sprintf('https://graph.microsoft.com/v1.0/users/%s/sendMail', rawurlencode((string) SIRA_M365_SENDER)),
        [
            'timeout' => SIRA_M365_HTTP_TIMEOUT,
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
                'Content-Type'  => 'application/json',
            ],
            'body'    => wp_json_encode([
                'message' => $message,
                // The enquiry is already stored in WordPress; a copy in the
                // sender mailbox would duplicate personal data for no gain.
                'saveToSentItems' => false,
            ]),
        ]
    );

    if (is_wp_error($response)) {
        return new WP_Error('sira_m365_transport', 'graph request failed at transport level');
    }

    $status = (int) wp_remote_retrieve_response_code($response);

    if ($status === 202) {
        return true;
    }

    // A stale or revoked token shows up as a 401. Drop it so the next attempt
    // fetches a fresh one rather than retrying with the same dead credential.
    if ($status === 401) {
        delete_transient(SIRA_M365_TOKEN_TRANSIENT);
    }

    $data = json_decode((string) wp_remote_retrieve_body($response), true);
    $code = is_array($data) && isset($data['error']['code']) ? (string) $data['error']['code'] : 'unknown';

    return new WP_Error('sira_m365_rejected', sprintf('graph:%d %s', $status, $code));
}
