# Step 2C.3C-B1 — Generated Runtime Contract Bridge + Typed Brand Banners

## Status

APPROVED FOR IMPLEMENTATION on `feature/2c3c-b1-brand-contract`.

## Objective

Connect the existing checked-in GraphQL Codegen output to the runtime brand operation contract and adopt the already-verified typed announcement/emergency banner fields without changing the GraphQL transport, cache architecture, site registry, WordPress runtime, or production visual components.

## Baseline

- Canonical integration branch: `main`
- B1 branch: `feature/2c3c-b1-brand-contract`
- Latest approved business milestone: Step 2C.3B
- Verified schema source: `frontend/schema/wpgraphql.graphql`
- Codegen source documents: `frontend/src/queries/**/*.graphql`
- Generated output: `frontend/src/generated/graphql/`

Read `AGENTS.md`, `project-state.json`, `docs/PROJECT-STATE.md`, `docs/SOURCE-OF-TRUTH.md`, and relevant decisions before editing.

## Confirmed current evidence

- `frontend/src/queries/brand.graphql` currently queries legacy `announcementBanner` and `emergencyBanner` strings but not typed `announcement` / `emergency` fields.
- `frontend/src/queries/brand.ts` currently duplicates the operation source and manually declares GraphQL result/variable interfaces.
- Codegen already emits `SiraBrandQuery`, `SiraBrandQueryVariables`, `SiraBrandDocument`, `TypedDocumentString`, and `toString()`.
- Existing runtime abstraction is `GraphQLOperation` / `defineGraphQLOperation`.
- Existing published/preview GraphQL clients, cache tags, hostname/site registry, and WordPress configuration are approved architecture and must be preserved.
- The checked-in canonical live schema contains typed brand banner objects; no live schema fetch or public introspection is required.

## In scope

1. Update `frontend/src/queries/brand.graphql` to keep legacy banner strings for backward compatibility and also query typed:
   - `announcement`
   - `emergency`

   Each typed banner should use only canonical verified public fields supported by the checked-in schema, including message, severity, optional link, schedule fields, dismissibility, and revision key.

2. Regenerate `frontend/src/generated/graphql/*` from source using Codegen. Never hand-edit generated files.

3. Refactor `frontend/src/queries/brand.ts` so Codegen-generated `SiraBrandQuery`, `SiraBrandQueryVariables`, and `SiraBrandDocument` are the runtime source of truth.
   - Preserve established public SIRA-facing exports where practical to avoid unnecessary downstream churn.
   - Keep using `defineGraphQLOperation` / `GraphQLOperation`.
   - Build runtime query source from `SiraBrandDocument.toString()` rather than maintaining a duplicate GraphQL string.
   - Add typed aliases for the public banner contract where useful, but do not build banner UI in B1.

4. Strengthen `frontend/tests/contract/query-contracts.test.ts` so it proves:
   - runtime brand operation equals/derives from generated `SiraBrandDocument`;
   - legacy banner fields remain queried;
   - typed announcement and emergency fields are queried;
   - no internal/private analytics fields are introduced;
   - existing project operation contract remains intact.

5. Update durable task/state documentation only if required by the implementation evidence. Do not claim B1 accepted/complete until CI and owner acceptance.

## Out of scope

- homepage contract;
- navigation/footer/legal contracts;
- newsroom/editorial contracts;
- Business Unit filtering;
- project archive/single refactor beyond preserving existing tests;
- brand banner normalization/UI rendering;
- Client Components;
- cache/site-registry/client redesign;
- WordPress/backend changes;
- live introspection or schema fetch;
- production deployment;
- merge to `main`.

## Architecture/security locks

- Server-first / server-only boundaries remain unchanged.
- No secrets, credentials, authorization headers, or temporary schema auth may enter source/generated artifacts.
- Shared frontend operations must use canonical branch fields only; do not depend on Group-only schema additions.
- Do not introduce `siraNavigation`, `siraEditorialFeed`, `SiraProjectDetails`, Bricks runtime code, or `.dc.html` runtime dependencies.
- Do not silently remove legacy `announcementBanner` / `emergencyBanner` fields in this increment.
- Do not modify backend runtime while SOT-001 remains open.

## Required validation

Run from `frontend/`:

1. `pnpm codegen`
2. `pnpm schema:check`
3. `pnpm lint`
4. `pnpm typecheck`
5. focused query-contract test
6. `pnpm test:run`
7. `pnpm build`
8. `git diff --check`

Review the final diff for:

- generated files changed only as a consequence of `.graphql` source changes;
- no duplicated runtime GraphQL source remains for the brand operation;
- no secrets;
- no Group-only coordinates;
- no unrelated formatting/dependency changes.

## Git / delivery

When all required local checks pass:

- commit only the scoped B1 changes on `feature/2c3c-b1-brand-contract`;
- push the branch;
- open a Pull Request to `main` using the repository evidence template;
- record exact validation results and warnings;
- do not merge the PR;
- do not deploy production.

## Acceptance gate

B1 is ready for owner review only when:

- Codegen succeeds;
- generated output is deterministic;
- lint/typecheck pass;
- focused and full tests pass;
- production build passes;
- final diff is scoped and security-reviewed;
- GitHub Frontend CI passes on the PR;
- rollback point is explicit.

End the implementation report with `CURRENT PROJECT STATE`.