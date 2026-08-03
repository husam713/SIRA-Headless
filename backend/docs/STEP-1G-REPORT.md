# Step 1G Backend Validation Report

## Objective

Validate the cumulative SIRA Core headless-backend refactor, provide repeatable
staging acceptance scripts, and package one installable plugin for Steps 1A
through 1G.

## Affected runtime files

- `sira-core.php`
- `src/Activator.php`
- `src/Admin/NetworkSettings.php`
- `src/Rest/BrandRoute.php`
- `src/Revalidation/RevalidationWebhook.php`

Validation documentation and tools were added under `docs/` and
`tools/validation/`.

## Validation-discovered hardening

1. Added WordPress's internal `new` status to the revalidation allowlist so a
   direct programmatic new-to-publish insertion is not skipped.
2. Preserved revalidation safety retries until queue updates complete, avoiding
   a stranded event if the queue lock is temporarily unavailable.
3. Changed the temporary brand REST route to read from `get_public()` instead
   of the uncurated effective options array.
4. Added `try/finally` blog restoration to network activation and new-site
   initialization.
5. Added a WordPress Coding Standards configuration and repeatable validation
   harness.

## Static checks executed in this build environment

- PHP CLI: 8.4.16
- PHP files linted: 21
- Definition and dependency audit: `Summary: 119 passed, 0 failed.`
- Active Bricks integration references: none
- Removed layout shortcodes in active PHP: none
- Remaining SIRA shortcode: `sira_contact_form`
- ZIP integrity: pending final package rebuild below
- Database migrations: none
- Rewrite changes: investor archive change from Step 1A only

## Checks not executable in this build environment

The following require the actual staging WordPress Multisite installation and
must not be represented as passed until their scripts complete there:

- plugin activation and network activation;
- WordPress Coding Standards;
- WPGraphQL schema construction;
- ACF Pro and WPGraphQL for ACF runtime integration;
- brand queries on all SIRA sites;
- anonymous/authenticated capability tests;
- actual WordPress lifecycle hooks;
- WP-Cron and outbound HTTP behavior;
- Hostinger server-cron reliability.

Use `docs/STEP-1-VALIDATION.md`.

## Acceptance rule

Step 1 is ready for staging validation but is not production-accepted solely
from these static results. Do not begin Step 2 implementation until the
required runtime scripts pass and the output is recorded.
