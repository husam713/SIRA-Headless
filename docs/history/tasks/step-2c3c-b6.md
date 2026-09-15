# Step 2C.3C-B6 — Project Archive Contract

## Status

APPROVED FOR IMPLEMENTATION on `feature/2c3c-b6-project-archive-contract`.

## Objective

Complete the next focused Step 2C.3C frontend contract increment by:

1. reconciling durable repository state after the accepted/merged B5 milestone;
2. converting the existing handwritten project archive GraphQL contract to the ADR-016 generated-contract flow;
3. verifying the exact canonical shared-schema coordinates for the project archive before changing the operation;
4. implementing a server-only, site-isolated, cursor-paginated project archive adapter with explicit result semantics and safe normalization;
5. separating archive/card data from project-single/detail data so the archive does not overfetch gallery/statistics/detail payloads unnecessarily.

B6 is a **project archive data-contract increment only**. Project single belongs to B7. Production design/components remain out of scope.

## Baseline evidence

- Canonical integration/default branch: `main`.
- Accepted B5 PR: `#9` — owner accepted and merged.
- Accepted B5 merge commit on `main`: `00022da346777ce67acc92b0c53c07627e1d85e3`.
- B5 implementation head: `9fec2ea30c36cab62c1af4f576429bea3ea42628`.
- B5 state reconciliation commit: `ccc6fbbe1f95a9586f128a5f56a22957966121bf`.
- B5 Frontend CI run #13: PASS.
- B5 full regression: 19 files / 147 tests PASS.
- Existing project query bridge: `frontend/src/queries/projects.ts`.
- Existing query operation name: `SiraProjects`.
- Existing root connection evidence: `siraProjects(first, after)`.
- Existing query selects `projectDetails` and currently contains handwritten result/variable interfaces plus an embedded operation string.
- ADR-011 locks the project ACF type to `ProjectDetails`; do not introduce `SiraProjectDetails`.
- ADR-016 requires canonical `.graphql` -> Codegen -> generated types/document -> runtime wrapper -> server adapter.
- Canonical checked-in schema source: `frontend/schema/wpgraphql.graphql`.
- Group audit schema remains a superset and Group-only coordinates must not enter the shared contract.

Read before editing:

- `AGENTS.md`
- `project-state.json`
- `docs/PROJECT-STATE.md`
- `docs/SOURCE-OF-TRUTH.md`
- `docs/DECISIONS.md`
- `docs/tasks/step-2c3c-b5.md`
- `docs/tasks/step-2c3c-b6.md`
- `frontend/src/queries/projects.ts`
- `frontend/tests/contract/query-contracts.test.ts`
- existing GraphQL client/cache/site-registry/server-only patterns
- `frontend/schema/wpgraphql.graphql` project/archive coordinates

## Mandatory pre-implementation durable-state reconciliation

Repository/GitHub evidence now supersedes the pre-merge B5 durable state. Reconcile durable state **before modifying B6 runtime/business code**.

At minimum inspect and update as required:

- `project-state.json`
- `docs/PROJECT-STATE.md`
- `docs/SOURCE-OF-TRUTH.md`

Required corrections:

- record B5 as owner accepted and merged through PR `#9`;
- record B5 implementation head `9fec2ea30c36cab62c1af4f576429bea3ea42628`;
- record B5 merge commit `00022da346777ce67acc92b0c53c07627e1d85e3`;
- record Frontend CI run #13 PASS;
- set current Step 2C.3C substage to B6;
- set current governed frontend baseline/head to the accepted B5 merge commit where appropriate;
- keep canonical/default branch `main`;
- keep `SOT-001` OPEN and backend-blocking;
- keep `productionAuthorized: false`;
- do not claim CMS readiness, backend reconciliation, staging, preview acceptance, or production deployment.

Commit durable-state reconciliation before the first runtime/business-code change when practical.

## B6-A — Verify canonical project archive schema coordinates

Inspect `frontend/schema/wpgraphql.graphql` before editing the existing project query.

Confirm from the checked-in canonical shared schema:

- exact root archive connection name and arguments;
- exact project node GraphQL type and public fields;
- exact pagination fields/semantics;
- exact `projectDetails` field and its GraphQL type (`ProjectDetails` per ADR-011);
- which archive-safe structured fields are shared across canonical branch sites;
- whether canonical ordering arguments exist and, if so, what evidence-backed ordering is appropriate;
- whether any currently selected field exists only in Group's superset;
- whether `isRestricted` or another public restriction signal is available and should protect the archive contract;
- whether project archive filtering is already part of the canonical project connection. Do not add Business Unit filtering merely because B5 introduced it for editorial content.

Do not run live introspection or `schema:fetch`.

If the checked-in schema contradicts the historical handwritten operation, treat the checked-in canonical schema as authoritative and document the verified correction. Do not guess.

## B6-B — Replace handwritten project operation ownership

The current `frontend/src/queries/projects.ts` contains handwritten interfaces and an embedded GraphQL operation string. B6 must migrate this to ADR-016.

Required flow:

`projects.graphql -> Codegen -> generated result/variable/document types -> GraphQLOperation wrapper -> existing published GraphQL client -> server-only archive adapter`

Requirements:

- add/modify the canonical `.graphql` source under the existing query convention;
- runtime source must derive from the generated document (`TypedDocumentString.toString()`), not an embedded duplicate query;
- generated result/variable types own the operation contract;
- do not hand-edit `frontend/src/generated/graphql/*`;
- do not maintain duplicate handwritten result interfaces that mirror Codegen output;
- preserve operation naming compatibility where sensible (`SiraProjects`) unless schema evidence requires a narrowly justified change;
- update contract tests to validate the operation against the checked-in canonical schema.

## B6-C — Archive/card field discipline

B6 is the project archive contract, not the project single contract.

The existing handwritten query currently selects detail-heavy payloads such as gallery/statistics. Reassess each field against archive needs and canonical evidence.

Archive operation should fetch only stable summary/card data needed for a future archive presentation contract, such as evidence-backed identity/title/URI/excerpt/featured-image and minimal `projectDetails` summary fields where useful (for example subtitle/location/status if canonical and justified).

Rules:

- do not fetch full project body content in the archive;
- do not fetch gallery merely because the legacy query did;
- do not fetch statistics merely because the legacy query did;
- do not fetch large relationship payloads merely because the legacy query did;
- if a relation is required for stable archive identity/presentation, fetch only minimal public fields and justify it with repository/schema evidence;
- B7 will own project-single/detail expansion.

The goal is to avoid locking Step 4 UI to an unnecessarily heavy archive payload before the design/data audit.

## B6-D — Server-only project archive adapter

Implement a server-only archive adapter following the accepted homepage/navigation/editorial patterns.

Expected behavior:

- accepts trusted `SiteKey` plus pagination request;
- uses the existing published GraphQL client and site registry;
- uses existing cache tags/invalidation architecture; do not create a parallel cache system;
- validates pagination before transport using repository-consistent bounds/semantics;
- preserves opaque cursors;
- never derives endpoint/site identity from arbitrary external input;
- no Client Components and no browser-side GraphQL.

Use stable explicit result states consistent with existing contract conventions, e.g.:

- `ready`
- `empty`
- `invalid`
- `remote-error`

Exact naming may follow existing project/domain conventions if such code already exists, but ambiguity between empty CMS content, invalid payload, and remote failure must not be hidden.

## B6-E — Project archive normalization and integrity

Normalize only public archive-safe data.

Requirements:

- immutable/readonly normalized output;
- deterministic source ordering unless canonical schema provides an explicit server ordering contract;
- validate positive project identity;
- validate required public title/URI according to existing normalization/security patterns;
- reject/null unsafe URLs instead of propagating unsafe schemes or credential-bearing values;
- normalize excerpts as summary text without unsafe HTML/script propagation;
- normalize featured image/media only through existing safe media conventions;
- treat duplicate project identities as invalid rather than silently collapsing unrelated nodes;
- omit malformed individual nodes with diagnostics when safe to do so, but do not fabricate replacement data;
- if the connection/payload itself is structurally unusable, return `invalid`;
- do not expose private/internal/raw analytics/options fields;
- respect any canonical restriction/publication signal exposed by the schema;
- do not invent missing project content or cross-site fallback content.

## B6-F — Site isolation / project scope

Project archive resolution must remain bound to the trusted WordPress site selected by `SiteKey`.

Rules:

- no cross-site project aggregation in B6;
- no arbitrary taxonomy slug parameter from callers;
- do not reuse B5 editorial Business Unit filtering unless the checked-in project schema and existing project architecture explicitly require it;
- Group and branch site project archives should query their own trusted endpoint/tenant;
- an empty archive is valid `empty` and becomes Step 2C.3D CMS-readiness evidence, not a reason to fetch another site's projects.

## B6-G — Cache/invalidation behavior

Inspect current cache-tag architecture and any existing project tags.

Requirements:

- reuse/extend existing project archive tags only where evidence requires;
- no unvalidated external input in cache tags/keys;
- no client-side cache;
- preserve site isolation and existing invalidation semantics;
- if no project-specific cache tag exists, add the narrowest architecture-consistent tag plus tests rather than a parallel system.

## Explicitly out of scope

- project single/detail operation (B7);
- project detail route/UI;
- project archive React grid/cards;
- search/filter UI;
- arbitrary cross-site/global project aggregation;
- Business Unit filtering unless project-specific schema/repository evidence requires it;
- newsroom/editorial changes;
- homepage/navigation changes;
- Draft Mode/preview implementation;
- SEO/Yoast;
- backend/WordPress runtime changes;
- live introspection/schema fetch;
- CMS content edits;
- dependency/lockfile upgrades;
- Vite warning cleanup;
- production deployment;
- merge to `main`.

## Expected affected areas

Exact filenames must follow repository evidence. Expected areas include:

- durable state files listed above;
- `frontend/src/queries/projects.graphql` (or existing canonical query filename);
- `frontend/src/queries/projects.ts` runtime bridge;
- `frontend/src/generated/graphql/{graphql,gql}.ts` from Codegen only;
- a project archive server/domain area under `frontend/src/lib/` consistent with current organization;
- cache-tag source/tests only if project archive needs a scoped existing-style tag;
- query-contract tests;
- focused project archive unit/contract tests.

Do not reorganize unrelated directories.

## Required tests

At minimum cover:

1. runtime project operation derives from generated `SiraProjectsDocument` (or verified generated equivalent);
2. operation validates against canonical checked-in schema;
3. operation uses the verified project archive connection and `projectDetails`, never `SiraProjectDetails`;
4. archive operation does not retain unnecessary gallery/statistics/detail overfetch unless schema/repository evidence explicitly proves an archive need;
5. bounded/validated cursor requests occur before transport;
6. valid archive page -> `ready`;
7. empty archive -> `empty` without fabricated/cross-site fallback;
8. remote GraphQL failure -> stable `remote-error`;
9. malformed connection/payload -> `invalid`;
10. duplicate/invalid project identities handled safely;
11. unsafe project/media URIs do not propagate;
12. source ordering and `hasNextPage/endCursor` are preserved correctly;
13. all existing B1-B5 query/brand/homepage/navigation/editorial contracts remain green;
14. durable-state test/evidence records accepted B5 before B6 runtime work if consistent with current test strategy.

## Validation

Run from `frontend/`:

- `pnpm schema:check`
- `pnpm codegen`
- verify generated output is deterministic (second run / generated diff gate)
- `pnpm lint`
- `pnpm typecheck`
- focused B6 tests
- `pnpm test:run`
- `pnpm build`
- `git diff --check`

Then inspect the complete diff and perform security/privacy review.

## Security / privacy gate

Before delivery verify:

- no secrets, auth headers, endpoint values, or environment contents committed;
- no Group-only coordinates in shared operation;
- no `SiraProjectDetails` introduction;
- no private/internal/raw project fields exposed;
- no unsafe project/media URLs propagated;
- no cross-site fallback/aggregation;
- no arbitrary caller-controlled tenant/taxonomy scope;
- no Client Components;
- no backend runtime changes;
- no dependency/lockfile churn;
- no live schema fetch/introspection.

## Delivery

Work only on:

`feature/2c3c-b6-project-archive-contract`

When all required local checks pass:

1. inspect complete diff/security scope;
2. commit scoped B6 changes;
3. push the branch;
4. open a **draft PR** to `main`;
5. wait for Frontend CI;
6. autonomously fix only in-scope failures and rerun gates;
7. do **not** merge the PR;
8. do **not** deploy production.

Return:

- objective completed;
- durable B5 reconciliation performed;
- exact canonical project archive coordinate verified;
- exact archive field set and why detail-heavy fields were kept/removed;
- pagination/order semantics;
- normalized project archive result states;
- files changed;
- generated GraphQL changes;
- focused test results;
- full regression count;
- schema/codegen result;
- lint/typecheck result;
- production build result;
- GitHub CI result;
- security/privacy review;
- warnings/deferred/CMS-readiness items;
- commit SHA;
- branch;
- PR number;
- rollback point;
- CURRENT PROJECT STATE.

Stop only for a genuine protected, external, or architecture decision requiring the owner.

## Acceptance criteria

B6 is ready for owner review when:

- durable state records B5 acceptance/merge before runtime work;
- archive schema coordinates are checked-in-schema-backed;
- handwritten project query ownership is replaced by Codegen/generated ownership;
- `ProjectDetails` is preserved and `SiraProjectDetails` is absent;
- archive payload is intentionally separated from B7 detail payload;
- server-only adapter has explicit empty/invalid/remote-error semantics;
- cursor pagination and site isolation are correct;
- security/privacy gates pass;
- all required local validation and Frontend CI are green;
- rollback is explicit;
- production remains unauthorized.