# WPGraphQL schema workflow

## Approved compatibility policy

The five-site network intentionally has two schema profiles:

1. **Canonical branch schema** — Consulting, Healthcare, Lifestyle and Real
   Estate must be exactly identical.
2. **Group audit schema** — Group must structurally contain the complete
   canonical branch contract, but may retain additional legacy ACF and
   Bricks-era types.

The clean branch schema is the only GraphQL Code Generator input:

```text
schema/wpgraphql.graphql
```

The Group schema is saved separately and is never a code-generation source:

```text
schema/wpgraphql.group.graphql
```

Supporting artifacts:

```text
schema/wpgraphql.meta.json
schema/wpgraphql.compatibility.json
```

## Required live contract

Every site must expose:

```text
RootQuery.siraBrand
RootQuery.siraProjects

ContentNode
Page
SiraBrand
SiraProject
ProjectDetails
```

The verified generated ACF type is:

```text
ProjectDetails
```

Do not require or introduce `SiraProjectDetails`.

`SiraProject.projectDetails` must resolve to `ProjectDetails`.

## Fetch

Configure the five server-only endpoint variables:

```text
SIRA_WP_GROUP_GRAPHQL_URL
SIRA_WP_CONSULTING_GRAPHQL_URL
SIRA_WP_HEALTHCARE_GRAPHQL_URL
SIRA_WP_LIFESTYLE_GRAPHQL_URL
SIRA_WP_REALESTATE_GRAPHQL_URL
```

When authenticated introspection is temporarily approved, supply the
authorization value only in the process environment:

```bash
export SIRA_SCHEMA_AUTHORIZATION='Bearer REDACTED'
```

The value is used only as a request header. It is never printed or written to
a schema artifact.

Run:

```bash
pnpm schema:fetch
```

The fetch script:

- introspects all five configured sites;
- validates the required live contract;
- sorts and prints every schema deterministically;
- requires exact equality across the four branches;
- selects Consulting as the deterministic canonical branch;
- verifies that Group structurally contains the canonical branch contract;
- treats Group-only additions as audit information rather than failures;
- writes the canonical branch schema;
- writes the Group audit schema separately;
- preserves all five hashes and hostnames in metadata;
- writes a deterministic compatibility report;
- never persists endpoint URLs, headers, credentials, response bodies or
  introspection authorization.

## Structural Group compatibility

Group is compatible only when it preserves the canonical contract, including:

- schema root types;
- type kinds;
- fields and exact return types;
- arguments, exact argument types and defaults;
- no new required argument on a canonical field;
- implemented interfaces;
- input fields, exact types and defaults;
- no new required input field;
- enum values;
- union members;
- directives, repeatability, locations and arguments;
- custom scalar `specifiedBy` URLs.

Group may add:

- legacy types;
- legacy fields;
- optional arguments;
- optional input fields;
- enum values;
- union members;
- interfaces;
- directives and directive locations.

These additions are recorded in
`schema/wpgraphql.compatibility.json`.

## Check

```bash
pnpm schema:check
```

The check script verifies:

- deterministic SDL formatting;
- canonical and Group file hashes;
- all five metadata records;
- exact branch hash equality;
- the Group audit hash;
- the required `ProjectDetails` contract;
- structural Group compatibility;
- compatibility-report freshness;
- absence of credential-like keys in persisted JSON.

## Code generation

Only after `schema:fetch` and `schema:check` pass:

```bash
pnpm codegen
pnpm typecheck
pnpm test:run
pnpm build
```

GraphQL Code Generator continues to read only:

```text
schema/wpgraphql.graphql
```

The bootstrap schema remains a review aid. It is not a production schema and
must never be used by codegen.

## Current content caveats

Schema compatibility does not fabricate or configure:

- WordPress menus;
- branch static front pages;
- homepage content;
- newsroom content;
- Business Unit assignments.

Those remain separate WordPress content-readiness tasks.
