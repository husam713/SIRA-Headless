---
paths:
  - "frontend/src/queries/**"
  - "frontend/src/generated/**"
  - "frontend/schema/**"
  - "frontend/codegen.ts"
  - "frontend/scripts/fetch-schema.mjs"
  - "frontend/scripts/check-schema.mjs"
  - "frontend/scripts/schema-compatibility.mjs"
---

# GraphQL contract — schema, operations, generated types

## What is generated (never hand-edit, never read whole)

- `frontend/schema/wpgraphql.graphql` (2.3 MB, canonical = Consulting) and `wpgraphql.group.graphql` (Group audit copy) come from `pnpm schema:fetch` (`--offline` replays `frontend/.schema-introspection/`). To look something up, `grep -n "^type Name" schema/wpgraphql.graphql` and read that block with `sed -n`; do not open the file.
- `frontend/src/generated/graphql/**` comes from `pnpm codegen` (client preset, `documentMode: string`). CI fails the PR if regenerating changes it (`git diff --exit-code -- src/generated/graphql`).
- `schema/wpgraphql.bootstrap.graphql` is a review subset and is never a codegen source.

## Editing an operation

1. Edit `src/queries/<name>.graphql`; keep its `.ts` wrapper (`defineGraphQLOperation`) in sync.
2. Every field must exist in the checked-in canonical schema. If it does not, the schema needs a refresh from the live CMS first — do not invent a type or field.
3. `pnpm codegen`, then `pnpm check:graphql` (schema:check + codegen + typecheck + graphql/contract tests). Commit the regenerated output with the operation.

## Policy (`frontend/schema/README.md`, ADR-009/010/016)

The four branch schemas must be byte-identical; Group may be a structural superset; shared operations use canonical fields only. Required contract: `RootQuery.siraBrand`, `RootQuery.siraProjects`, `ProjectDetails`.

A contract change (new field, new operation, schema refresh) is an architecture-visible change: record it under "Architecture decisions" in the PR and check whether `docs/DECISIONS.md` needs an ADR. Proceed; do not stop.
