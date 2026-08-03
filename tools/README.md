# SIRA Step 2C.2A — Live Schema and Data Inventory

This package performs a **read-only** inventory of the live SIRA WordPress
Multisite and its WPGraphQL schema.

It does not:

- register fields or types;
- alter WordPress options;
- update post meta;
- create posts, terms, menus, or users;
- change the Next.js application;
- reveal content bodies or private field values;
- store authorization headers.

## Required inputs

### GraphQL

Configure the five server-only endpoint variables already used by `sira-web`:

```text
SIRA_WP_GROUP_GRAPHQL_URL
SIRA_WP_CONSULTING_GRAPHQL_URL
SIRA_WP_HEALTHCARE_GRAPHQL_URL
SIRA_WP_LIFESTYLE_GRAPHQL_URL
SIRA_WP_REALESTATE_GRAPHQL_URL
```

When public schema introspection is disabled, provide an authorization header
only in the process environment:

```bash
export SIRA_INVENTORY_AUTHORIZATION='Bearer REDACTED'
```

The header is never printed or written to output.

### WordPress

Run the PHP inventory through WP-CLI against staging:

```bash
wp eval-file scripts/wp-inventory.php \
  --path=/path/to/wordpress \
  > output/wp-runtime-inventory.json
```

## Run GraphQL inventory

Copy this package into the approved `sira-web` repository, or run it from a
directory where the existing Step 2B GraphQL dependency is installed:

```bash
cd sira-web
cp -R /path/to/sira-step2c2a-live-inventory tools/step2c2a
node tools/step2c2a/scripts/graphql-inventory.mjs
```

Default output:

```text
tools/step2c2a/output/graphql/
├── group/
├── consulting/
├── healthcare/
├── lifestyle/
├── realestate/
└── network-comparison.json
```

Override the destination with:

```bash
export SIRA_INVENTORY_OUTPUT_DIR=/secure/path/step2c2a-output
```

## Run all staging checks

```bash
bash scripts/run-staging-inventory.sh /path/to/wordpress
```

The script expects to run from this package directory and expects the
JavaScript dependencies from the `sira-web` repository to be available.

## Files produced

Per GraphQL site:

- deterministic `schema.graphql`;
- schema SHA-256;
- root field inventory;
- Page and SIRA type inventory;
- ACF field-group types;
- menu-location enum values;
- public `siraBrand` probe;
- front-page probe;
- menu metadata probe;
- Business Unit term probe.

Network comparison:

- schema equality;
- required field/type presence;
- expected brand key;
- front-page discovery;
- menu support;
- content-node/feed capabilities.

WordPress runtime inventory:

- plugin versions;
- active theme;
- front-page configuration;
- registered CPTs and taxonomies;
- ACF field groups and top-level fields;
- menu locations and assignments;
- Business Unit terms;
- post counts by status;
- privacy-field coverage counts;
- front-page SIRA meta-key presence without values.

## Security

Run on staging or a sanitized production clone. The scripts do not output
authorization headers, content bodies, form submissions, personal emails,
private field values, or secret options.

Review output before sharing externally because hostnames, post counts, menu
names, and editorial structure are operational information.
