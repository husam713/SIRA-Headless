# SIRA Core Step 1G Validation Guide

## Scope

This guide validates the cumulative Step 1 backend release:

- 28 GraphQL-enabled custom post types;
- 10 GraphQL-enabled taxonomies;
- typed ACF content fields;
- curated multisite-aware `siraBrand`;
- removal of active Bricks and layout-shortcode dependencies;
- temporary legacy contact-form compatibility;
- signed queued Next.js revalidation events.

Static checks can run without WordPress. Runtime, capability, GraphQL and
webhook checks require an isolated staging Multisite installation.

## Required staging dependencies

- WordPress Multisite;
- PHP 8.3 or newer;
- ACF Pro;
- WPGraphQL;
- WPGraphQL for ACF;
- WP-CLI;
- a working WordPress cron runner.

Record installed versions before testing:

```bash
wp core version

wp plugin list   --fields=name,status,version   | grep -E 'sira-core|wp-graphql|wpgraphql-acf|advanced-custom-fields'
```

## 1. Static validation

```bash
bash wp-content/plugins/sira-core/tools/validation/static-audit.sh wp-content/plugins/sira-core
```

Acceptance:

- every PHP file passes syntax validation;
- exactly 28 CPTs, 10 taxonomies and 12 legacy meta keys are found;
- GraphQL names are valid and unique;
- no active Bricks hook, class or layout shortcode remains;
- only `[sira_contact_form]` remains;
- plugin versions match;
- no hardcoded webhook secret is detected.

## 2. Coding standards

Install the project-approved WordPress Coding Standards toolchain, then run:

```bash
vendor/bin/phpcs   --standard=wp-content/plugins/sira-core/phpcs.xml.dist   wp-content/plugins/sira-core
```

Step 1 is not production-accepted until PHPCS passes or every justified
exception is recorded in the decision log.

## 3. Plugin and Multisite runtime validation

```bash
wp plugin deactivate sira-core --network
wp plugin activate sira-core --network

wp eval-file wp-content/plugins/sira-core/tools/validation/validate-runtime.php
```

This is read-only. It checks:

- network plugin boot;
- CPT/taxonomy registration and GraphQL names;
- rewrite slugs and relationships;
- investor visibility;
- legacy meta registration without REST exposure;
- active shortcodes;
- REST fallback;
- disabled WordPress schema;
- WPGraphQL introspection;
- ACF groups;
- brand query on every site.

## 4. GraphQL content-family validation

Run the operations in:

```text
tools/validation/graphql-validation.graphql
```

against every site's GraphQL endpoint.

Provide real slugs for the project, person and document variables.

Acceptance:

- all 28 content collection fields resolve;
- all 10 taxonomy collections resolve;
- all expected ACF types appear;
- no schema errors occur;
- `siraBrand` resolves on every site;
- person email, direct document file and analytics ID are absent.

## 5. Capability and unpublished-content validation

Run only on staging:

```bash
SIRA_VALIDATION_ALLOW_MUTATIONS=1 wp eval-file wp-content/plugins/sira-core/tools/validation/validate-security.php
```

The script creates temporary records, tests anonymous and administrator
GraphQL access, then deletes its fixtures.

Acceptance:

- published news is public;
- draft and private news are not anonymous-readable;
- investor records are not anonymous-readable;
- an authorized administrator can read permitted unpublished records;
- sensitive fields remain absent from the schema.

## 6. Revalidation validation

Run only on staging:

```bash
SIRA_VALIDATION_ALLOW_MUTATIONS=1 wp eval-file wp-content/plugins/sira-core/tools/validation/validate-revalidation.php
```

The script intercepts HTTP locally through WordPress's request filter. It does
not contact Vercel.

Acceptance:

- direct new-to-publish creates one event;
- previous status is recorded;
- paths and tags are generated;
- HMAC-SHA256 verifies;
- the secret is absent from the body;
- 2xx removes the queue item;
- 503 retains the item and schedules retry;
- taxonomy assignment includes the term tag.

## 7. Manual lifecycle matrix

Verify through the WordPress editor:

| Action | Expected operation |
|---|---|
| Publish | `publish` |
| Update published record | `update` |
| Move published record to draft/private | `unpublish` |
| Trash | `trash` |
| Restore | `restore` |
| Permanently delete | `delete` |
| Assign/remove SIRA taxonomy | `taxonomy-assign` |
| Create/edit/delete term | term event |
| Create/edit/delete menu | menu event |
| Change brand/site/network/ACF options | brand event |
| Edit attachment or alt text | media event |

Confirm autosaves and revisions create no event.

## 8. Cron and retry

Configure a real server cron and verify due events execute without public
traffic.

```bash
wp cron event list   --fields=hook,next_run_gmt,args   | grep sira_revalidation

wp cron event run --due-now
```

## 9. Bricks removal confirmation

```bash
grep -RInE 'BricksIntegration|bricks/dynamic_tags_list|bricks/dynamic_data/render_tag|bricks/dynamic_data/render_content|bricks/frontend/render_data|bricks_is_builder' wp-content/plugins/sira-core --include='*.php' --exclude-dir='tools'
```

Expected: no matches.

Keep the Bricks themes and last deployable Bricks release outside the active
plugin until the headless cutover rollback window expires.

## Acceptance record

Record:

- date;
- environment;
- WordPress/PHP/plugin versions;
- site list;
- command output;
- failures and remediation;
- approving engineer;
- rollback package checksum.

Do not begin Step 2 until all required staging checks pass.
