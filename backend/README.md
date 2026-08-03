# SIRA Core Platform

Network-activate this plugin across the SIRA WordPress Multisite network.

## Purpose

SIRA Core is the backend content and business-configuration layer for the
headless SIRA Enterprise platform. It must not own public page layouts.

## Responsibilities

- Shared custom post types and taxonomies
- Per-site and network brand settings
- ACF field groups and options when ACF Pro is active
- WPGraphQL content, taxonomy, ACF, and curated brand schema
- REST brand endpoint retained as a temporary compatibility fallback
- Optional structured starter-content importer
- WordPress capabilities, publication status, and editorial workflows
- Future preview and Next.js revalidation integrations

## Removed presentation dependencies

Version 1.1.0 removes active dependencies on:

- Bricks dynamic-data hooks
- `[sira_home]`
- `[sira_branch_home]`
- `[sira_newsroom]`
- Bricks child-theme page templates
- demo-imported shortcode pages
- default WordPress-rendered Organization JSON-LD

The previous Bricks integration and layout renderer are intentionally removed
from active plugin code. Preserve the last Bricks release in source control and
deployment storage until the headless cutover and rollback window are complete.

## Temporary contact-form bridge

`[sira_contact_form]` and its `admin-post.php` handlers remain temporarily
available through `Sira\Core\Forms\LegacyContactForm`.

This bridge exists only to avoid breaking current pages before the approved
headless forms service is deployed. It is not the target forms architecture.

Before removing it, the replacement must provide:

- server-side validation;
- spam protection and rate limiting;
- consent capture;
- reliable email or CRM routing;
- retention and deletion rules;
- audit logging without sensitive-data leakage;
- multilingual success and error responses;
- controlled file uploads where required.

## Brand APIs

Primary API:

```graphql
query {
  siraBrand {
    name
    key
    primaryColor
    secondaryColor
    accentColor
  }
}
```

Temporary REST fallback:

```text
GET /wp-json/sira/v1/brand
```

Do not expose raw options, analytics identifiers, secrets, or internal ACF
reference values as public API fields.

## WordPress Organization schema fallback

WordPress-rendered Organization JSON-LD is disabled by default to avoid
duplicate schema and backend-host canonical URLs in headless mode.

It may be enabled temporarily with:

```php
define( 'SIRA_CORE_ENABLE_WORDPRESS_SCHEMA', true );
```

or the `sira_core_enable_wordpress_schema` filter.

Do not enable it when Yoast/Rank Math or the Next.js frontend already emits the
equivalent schema.

## Starter importer

The importer creates only structured starter records:

- companies;
- projects;
- news.

It does not:

- create pages;
- insert shortcodes;
- assign theme templates;
- download third-party media;
- overwrite existing records.

## Optional integrations

The plugin must continue to boot when optional integrations are unavailable.
ACF and WPGraphQL features register only when their corresponding plugin APIs
exist.

## Deployment notes

1. Back up the current plugin, database, and previous Bricks deployment package.
2. Deploy the cumulative Step 1 package to staging.
3. Validate plugin activation and Multisite network activation.
4. Run the static, runtime, capability, GraphQL, and revalidation checks under
   `tools/validation`.
5. Audit existing pages that still contain SIRA shortcodes before production.
6. Do not deactivate or delete the Bricks child theme until the Next.js
   frontend is accepted and rollback criteria are met.

## Next.js revalidation webhook

Version 1.2.0 adds queued, signed revalidation events for the future Next.js
frontend.

The integration is disabled until all required server constants are defined.
Secrets are never read from WordPress options or exposed through GraphQL.

Example `wp-config.php` configuration using environment variables:

```php
define(
	'SIRA_NEXT_REVALIDATION_URL',
	(string) getenv( 'SIRA_NEXT_REVALIDATION_URL' )
);

define(
	'SIRA_NEXT_REVALIDATION_SECRET',
	(string) getenv( 'SIRA_NEXT_REVALIDATION_SECRET' )
);

define(
	'SIRA_NEXT_SITE_HOSTS',
	(string) getenv( 'SIRA_NEXT_SITE_HOSTS' )
);
```

`SIRA_NEXT_SITE_HOSTS` is a JSON object keyed by blog ID or brand key:

```json
{
  "1": "siragroup.com",
  "2": "consulting.siragroup.com",
  "healthcare": "healthcare.siragroup.com"
}
```

Multiple endpoints may be supplied through `SIRA_NEXT_REVALIDATION_URLS` as a
JSON array or comma-separated string.

Requests use HMAC-SHA256 over:

```text
<unix timestamp>.<raw JSON request body>
```

and include:

```text
X-Sira-Event-Id
X-Sira-Timestamp
X-Sira-Signature: v1=<hex signature>
```

The matching Next.js route must reject stale timestamps, validate the payload
against the hostname/site registry, compare signatures in constant time, and
deduplicate event IDs.

Events are queued in a non-autoloaded site option and delivered through a
single-event WP-Cron worker. Configure a real server cron for production
WordPress so events are not dependent on public traffic.

The integration listens for:

- publish, update, unpublish, trash, restore, and permanent deletion;
- SIRA taxonomy assignment and term changes;
- navigation menu creation, updates, and deletion;
- site, network, and ACF brand-option updates;
- relevant SIRA/featured-image metadata changes;
- attachment creation, editing, alternative-text changes, and metadata changes.

Extension filters:

```text
sira_revalidation_paths
sira_revalidation_tags
sira_revalidation_allowed_post_types
sira_revalidation_allowed_statuses
sira_revalidation_allowed_taxonomies
sira_revalidation_homepage_post_types
sira_revalidation_content_meta_keys
sira_revalidation_attachment_meta_keys
sira_revalidation_site_context
sira_revalidation_endpoints
sira_revalidation_max_attempts
sira_revalidation_retry_delays
```

Do not place the revalidation secret in the database, JavaScript bundles,
GraphQL responses, logs, or deployment artifacts.



## Step 1G validation and hardening

Version 1.2.1 adds the cumulative Step 1 validation harness and applies
validation-discovered hardening:

- direct `new` to `publish` transitions are accepted by the revalidation
  status allowlist;
- queue completion and retry scheduling preserve at-least-once delivery if the
  queue lock is temporarily unavailable;
- the temporary brand REST route now reads only from the curated public brand
  contract;
- Multisite activation and new-site initialization always restore the previous
  blog context;
- a WordPress Coding Standards configuration is included.

Static validation:

```bash
bash tools/validation/static-audit.sh
```

Read-only WordPress and GraphQL validation:

```bash
wp eval-file tools/validation/validate-runtime.php
```

Mutating staging-only checks:

```bash
SIRA_VALIDATION_ALLOW_MUTATIONS=1 wp eval-file tools/validation/validate-security.php

SIRA_VALIDATION_ALLOW_MUTATIONS=1 wp eval-file tools/validation/validate-revalidation.php
```

See:

- `docs/STEP-1G-REPORT.md`
- `docs/STEP-1-VALIDATION.md`
- `docs/GRAPHQL-SCHEMA.md`
- `docs/PUBLIC-PRIVATE-VISIBILITY.md`
- `docs/BACKEND-QA-CHECKLIST.md`
- `docs/UPGRADE-ROLLBACK.md`
- `docs/MIGRATION-DECISION-LOG.md`

Step 1 is not production-accepted until the runtime, security, GraphQL,
revalidation, PHPCS, and Multisite checks pass on staging.
