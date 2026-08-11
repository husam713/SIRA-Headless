# Step 2C.3C-B5 — Business Unit Filtering Contract

## Status

APPROVED FOR IMPLEMENTATION on `feature/2c3c-b5-business-unit-filtering`.

## Objective

Complete the next focused Step 2C.3C frontend contract increment by:

1. reconciling durable repository state after the accepted/merged B4 milestone;
2. verifying the canonical WPGraphQL Business Unit taxonomy/filter coordinates from the checked-in schema;
3. extending the accepted B4 native editorial feed with evidence-backed, **server-side Business Unit filtering** while preserving cursor pagination correctness;
4. centralizing the locked `SiteKey -> Business Unit` mapping from ADR-014 so Group remains unfiltered and branch sites use their exact mapped taxonomy slug;
5. preserving the accepted B4 query/result normalization, generated-contract ownership, site isolation, cache architecture, security boundaries, and no-fabrication rules.

B5 is a **data-contract/filtering increment only**. No newsroom UI, filter tabs, Client Components, or production visual implementation belongs here.

## Baseline evidence

- Canonical integration/default branch: `main`.
- B4 PR: `#8` — owner accepted and merged.
- B4 merge commit on `main`: `684bce5b51f977e078029870b085a15b2204ad60`.
- B4 implementation head: `e31ce8e793601266be4ae8064ebb0f5fa74c2e81`.
- B4 state reconciliation commit: `3391aad98df1ea217f4e1ea3ef5f36e7c4e93c50`.
- B4 Frontend CI run #11: PASS.
- Full regression at B4: 18 files / 133 tests PASS.
- Accepted B4 native connection: `RootQuery.contentNodes(first, after, where)`.
- Accepted B4 editorial content types: `SIRA_NEWS`, `SIRA_INSIGHT`, `SIRA_ARTICLE`, `SIRA_PRESS_RELEASE`.
- Accepted B4 ordering: `DATE DESC`.
- Accepted B4 discriminators: `SiraNewsItem`, `SiraInsight`, `SiraArticle`, `SiraPressRelease`.
- Accepted B4 result states: `ready`, `empty`, `invalid`, `remote-error`.
- Verified canonical schema source: `frontend/schema/wpgraphql.graphql`.
- Shared Codegen consumes `frontend/schema/wpgraphql.graphql` and `frontend/src/queries/**/*.graphql`.
- ADR-013 requires native WPGraphQL content connections and forbids a custom `RootQuery.siraEditorialFeed`.
- ADR-014 locks the Business Unit site mapping.
- ADR-015 requires CMS defects to be fixed at source instead of hidden by frontend fabrication.
- ADR-016 gives generated GraphQL types/documents ownership of frontend operation contracts.

Read before editing:

- `AGENTS.md`
- `project-state.json`
- `docs/PROJECT-STATE.md`
- `docs/SOURCE-OF-TRUTH.md`
- `docs/DECISIONS.md`
- `docs/tasks/step-2c3c-b4.md`
- `docs/tasks/step-2c3c-b5.md`
- `frontend/src/queries/editorial-feed.graphql`
- `frontend/src/queries/editorial-feed.ts`
- `frontend/src/lib/editorial/*`
- existing cache/site-registry/GraphQL-client code and tests
- the checked-in canonical schema coordinates for the Business Unit taxonomy and filtering inputs/connections

## Mandatory pre-implementation reconciliation

Repository evidence now supersedes durable state recorded before the B4 merge. Reconcile durable state **before modifying B5 runtime/business code**.

At minimum inspect and update as required:

- `project-state.json`
- `docs/PROJECT-STATE.md`
- `docs/SOURCE-OF-TRUTH.md`

Required corrections:

- record B4 as owner accepted and merged through PR `#8` at `684bce5b51f977e078029870b085a15b2204ad60`;
- record B4 implementation head `e31ce8e793601266be4ae8064ebb0f5fa74c2e81` and Frontend CI run #11 PASS;
- set current Step 2C.3C substage to B5;
- set current governed frontend baseline/head to the accepted B4 merge commit where appropriate;
- keep canonical/default branch as `main`;
- keep `SOT-001` OPEN and blocking for new backend runtime changes;
- do not claim WordPress content readiness, backend reconciliation, staging, or production deployment occurred.

Do not create a new ADR unless implementation discovers a genuinely new durable architecture decision. ADR-014 already locks the site-to-Business-Unit mapping.

## Confirmed architecture locks

- WordPress Multisite remains the editorial CMS.
- `sira-core` remains the backend business/content owner.
- WPGraphQL remains the primary frontend API.
- One Next.js App Router application serves Group and all branches.
- Server Components/server-only data access remain the default.
- Existing published/preview GraphQL clients remain authoritative; do not create a second transport.
- Existing cache-tag and hostname/site-registry architecture remains authoritative.
- Consulting is the canonical shared schema; shared operations must not use Group-only coordinates.
- Generated GraphQL types/documents own operation contracts (`ADR-016`).
- Use native WPGraphQL content connections (`ADR-013`). Do not create or use `siraEditorialFeed`.
- Preserve the accepted B4 editorial types, ordering, pagination, normalization, and result-state semantics unless schema evidence requires a narrowly scoped compatible change.
- Business Unit filtering must happen **server-side in GraphQL** when pagination is involved. Do not fetch a page and then remove nonmatching Business Units in JavaScript, because that corrupts page size/cursor semantics.
- Missing/misassigned Business Unit taxonomy terms/content remain CMS-readiness issues (`ADR-015`), not permission to fabricate matches.
- No Bricks or `.dc.html` runtime dependency.
- No Client Component should be introduced by this data-contract increment.
- Production visual components remain gated by ADR-017.

## B5-A — Locked site-to-Business-Unit semantics

ADR-014 is authoritative:

| `SiteKey` | Business Unit taxonomy slug |
|---|---|
| `group` | `null` |
| `consulting` | `consulting` |
| `healthcare` | `healthcare` |
| `lifestyle` | `lifestyle` |
| `realestate` | `real-estate` |

Rules:

- `group -> null` means the default Group editorial feed remains **unfiltered by Business Unit**.
- Branch sites must use the exact mapped taxonomy slug.
- Do not derive `real-estate` mechanically from `realestate`.
- Do not infer taxonomy slugs from hostnames, display labels, brand names, or URL paths.
- Centralize this mapping in one evidence-backed frontend server/domain location; do not duplicate string mappings across query callers.
- The mapping output should be immutable/readonly and exhaustively typed against `SiteKey`.

### Group-filter UI clarification

B5 establishes the **site-aware default filtering contract** above. If repository evidence separately indicates that the Group newsroom later needs user-selectable Business Unit tabs/filters, do not silently implement presentation/filter-selection behavior here. Record it as a later UI/product contract requirement unless the existing repository already contains an approved server contract for it.

## B5-B — Verify canonical taxonomy/filter schema coordinates

Inspect `frontend/schema/wpgraphql.graphql` before editing the B4 operation. Do not infer taxonomy input names from generic WPGraphQL knowledge or conversation memory.

Determine from the checked-in canonical schema:

- exact Business Unit taxonomy GraphQL name(s);
- exact term identifier accepted by content connection filtering (slug, ID, database ID, taxonomy query input, or another verified coordinate);
- exact `RootQuery.contentNodes(... where: ...)` input coordinate capable of filtering the accepted heterogeneous editorial content types;
- whether that filter is valid for all four B4 editorial types;
- whether an optional/null filter variable has defined semantics that truly means “no Business Unit filter”;
- whether a native taxonomy relation/operator is required;
- whether filtering changes any ordering or pagination constraints;
- whether any relevant coordinate exists only in Group’s schema superset (if so, it cannot be used in the shared B5 contract).

Do **not** run live introspection or `schema:fetch` in B5.

### Blocking rule

If the canonical shared schema does **not** support a server-side Business Unit filter for the heterogeneous B4 `contentNodes` connection, do not emulate it by post-filtering paginated results in application code and do not switch to Group-only schema fields.

Instead:

1. preserve B4 intact;
2. document the exact missing canonical schema capability;
3. stop B5 as `BLOCKED_ARCHITECTURE_DECISION` with evidence;
4. do not modify backend runtime because `SOT-001` remains open.

This is preferable to shipping incorrect pagination semantics.

## B5-C — GraphQL operation design

Extend the accepted B4 operation only after the canonical schema confirms the native filter mechanism.

Requirements:

- preserve `contentNodes` as the native root connection;
- preserve accepted editorial content type inclusion;
- preserve `DATE DESC` ordering unless canonical filter semantics require an evidence-backed compatible adjustment;
- preserve cursor pagination (`first`, `after`, `hasNextPage`, `endCursor`);
- add the minimum generated variable/input required for Business Unit filtering;
- no Group-only fields;
- no custom `siraEditorialFeed`;
- no private/raw analytics/options fields;
- no full-content body expansion;
- no hardcoded branch query documents per site unless the schema makes a single optional-variable operation impossible.

### One-operation vs two-operation rule

Prefer a single generated operation **only if** the canonical schema proves that a null/omitted Business Unit variable safely means no taxonomy filter for Group.

If GraphQL input semantics make optional filtering impossible in one document, a minimal second generated operation for the filtered branch case is acceptable only when:

- both operations remain native `contentNodes` operations;
- duplication is minimized with schema-valid GraphQL fragments where appropriate;
- Group continues using the accepted unfiltered B4 operation;
- branch sites use the filtered operation;
- both operations are generated by Codegen and tested;
- pagination/order/result normalization remain identical.

Do not embed handwritten query strings.

## B5-D — Site-aware server adapter behavior

The public server API should accept the trusted `SiteKey` and pagination request, resolve the Business Unit mapping internally, and execute the correct native GraphQL contract.

Expected default behavior:

```text
group      -> unfiltered editorial feed
consulting -> Business Unit slug consulting
healthcare -> Business Unit slug healthcare
lifestyle  -> Business Unit slug lifestyle
realestate -> Business Unit slug real-estate
```

Requirements:

- callers must not be able to provide an arbitrary taxonomy slug that bypasses site isolation in the default site-aware API;
- do not accept arbitrary Host-derived Business Unit values;
- preserve B4 page-size validation and opaque cursor validation;
- preserve B4 `ready`, `empty`, `invalid`, `remote-error` semantics;
- empty filtered results are valid `empty`, not errors and not fallback to unfiltered content;
- branch filter failures must not silently retry unfiltered content;
- no cross-branch fallback;
- no browser-side filtering or GraphQL access.

If lower-level test helpers accept an explicit filter input, keep them internal/non-public and typed to evidence-backed values where practical.

## B5-E — Taxonomy correctness / payload integrity

If the canonical operation can return Business Unit term data and it is useful for integrity validation without excessive payload cost, Codex may include the minimum schema-backed taxonomy discriminator required to verify the returned node belongs to the expected term.

However:

- do not add term data merely for display/UI in B5;
- do not invent taxonomy labels;
- do not require redundant client-side membership filtering after a correctly filtered server query;
- do not reject Group items simply because Group is intentionally unfiltered;
- do not expose private/internal taxonomy metadata.

If server-side GraphQL filtering is sufficient and the returned payload does not need term data for a stable contract, keep B4 item shape unchanged.

## B5-F — Cache / invalidation behavior

Inspect the existing cache tag architecture and B4 editorial cache tags before changing anything.

Requirements:

- preserve existing editorial/post-type archive invalidation tags;
- if Business Unit taxonomy assignment changes are already covered by existing revalidation rules, do not add redundant tags;
- if a narrowly scoped taxonomy cache tag is genuinely required by existing architecture, extend the existing cache-tag system and tests rather than creating a parallel cache mechanism;
- do not introduce arbitrary cache keys containing unvalidated external input;
- no client-side cache layer.

## B5-G — Generated contract ownership

Preserve:

`canonical .graphql document -> Codegen -> generated result/variable/document types -> GraphQLOperation wrapper -> existing published GraphQL client -> server-only adapter`

Rules:

- never hand-edit `frontend/src/generated/graphql/*`;
- no handwritten duplicate result interfaces when generated types own them;
- no duplicate embedded operation strings;
- no second GraphQL transport;
- no endpoint-resolution changes.

## Expected affected areas

Exact filenames must be determined by inspecting the current repository. Expected areas include:

- durable state files listed above;
- `frontend/src/queries/editorial-feed.graphql` and its runtime bridge, or a narrowly scoped additional generated filtered operation if schema semantics require it;
- `frontend/src/generated/graphql/` — Codegen output only;
- `frontend/src/lib/editorial/*` — site-aware Business Unit resolver/adapter adjustments;
- existing site/domain mapping location if the repository already has a better canonical home for ADR-014 mapping;
- cache-tag source/tests only if evidence requires a new scoped taxonomy tag;
- query-contract tests;
- focused editorial/Business Unit tests.

Do not reorganize unrelated directories.

## Out of scope

- project archive contract;
- project single contract;
- user-selectable newsroom filter UI/tabs;
- newsroom React cards/grids;
- Client Components;
- client-side pagination/infinite scrolling;
- homepage/navigation visual implementation;
- SEO/Yoast;
- Draft Mode implementation;
- WordPress taxonomy/content edits;
- backend runtime changes;
- live introspection or `schema:fetch`;
- dependency upgrades;
- Vite warning cleanup;
- GitHub Actions maintenance unless B5 is blocked by it;
- production deployment;
- merge to `main`.

## Security / privacy requirements

- no credentials, tokens, authorization headers, `.env` values, or production secrets in source/generated/docs output;
- no arbitrary Host/endpoint resolution changes;
- no arbitrary user-provided Business Unit slug in the default site-aware server API;
- no unpublished/private content expansion;
- no Group-only shared coordinates;
- no unsafe link propagation;
- no raw analytics/internal options fields;
- no unfiltered branch fallback when a branch filter fails or returns empty;
- no hardcoded editorial fallback content;
- no Client Component or browser-side GraphQL access;
- no secrets in logs or PR description.

## Required focused evidence

Add focused tests covering at minimum:

1. durable state records accepted/merged B4 before B5 runtime edits;
2. exact ADR-014 mapping for all five `SiteKey` values;
3. explicit assertion that `realestate -> real-estate` is not mechanically derived;
4. `group -> null` executes the accepted unfiltered semantics;
5. each branch executes the exact mapped Business Unit filter;
6. operation/filter validates against the canonical shared schema;
7. no Group-only coordinate is used;
8. no `siraEditorialFeed` custom root is introduced;
9. accepted four editorial content types remain intact;
10. `DATE DESC` remains intact;
11. cursor pagination remains intact and is not post-filtered in JavaScript;
12. branch `empty` remains empty and does not fall back to Group/unfiltered data;
13. invalid pagination is rejected before transport;
14. remote GraphQL failures remain stable `remote-error` results;
15. B4 item normalization/output shape remains compatible unless evidence-backed schema requirements justify a scoped change;
16. existing brand/homepage/navigation/editorial/projects/cache/site-registry tests remain intact.

If a single optional-filter operation is used, add explicit tests proving Group sends/omits the variable exactly as canonical schema semantics require.

If two generated operations are required, add explicit tests proving Group uses only the unfiltered operation and branch sites use only the filtered operation.

## Validation gate

Run from `frontend/` after implementation:

1. `pnpm schema:check`
2. `pnpm codegen`
3. verify generated GraphQL output is deterministic / clean after a second generation as appropriate
4. `pnpm lint`
5. `pnpm typecheck`
6. focused B5 contract/unit tests
7. `pnpm test:run`
8. `pnpm build`
9. `git diff --check`

Review the complete repository diff for:

- only B5/state/task scope changes;
- generated files changed only because canonical `.graphql` source changed;
- no secrets;
- no Group-only coordinates;
- no `siraEditorialFeed` custom contract;
- no Business Unit mapping duplication;
- no mechanical `realestate -> real-estate` derivation;
- no post-fetch JavaScript filtering of a paginated feed;
- no unfiltered fallback for branch sites;
- no hardcoded CMS fallback content;
- no unintended Client Components;
- no backend/dependency/lockfile changes unless explicitly justified and approved.

## Git / PR delivery

When all required checks pass:

- keep all work on `feature/2c3c-b5-business-unit-filtering`;
- commit scoped changes;
- push the branch;
- open a **draft Pull Request** to `main` using the SIRA evidence template;
- include the exact canonical taxonomy/filter coordinate used;
- include the exact site-to-Business-Unit mapping behavior;
- state whether one generated operation or two generated operations were required and why;
- include pagination preservation evidence;
- include focused/full test counts, CI result, warnings/deferred items, security review, rollback point, and current project state;
- do not merge the PR;
- do not deploy production.

The engineering agent may fix failures autonomously when the fix is strictly inside B5 scope. Stop only for a genuine protected/external/architecture decision.

## Acceptance gate

B5 is ready for owner review only when:

- durable state records accepted B4 before B5 runtime changes;
- canonical shared schema proves the native Business Unit filter mechanism;
- filtering occurs server-side in GraphQL and preserves pagination correctness;
- ADR-014 mapping is centralized and exact;
- Group remains intentionally unfiltered by default;
- each branch uses its exact mapped Business Unit slug;
- `realestate -> real-estate` is explicit;
- no unfiltered branch fallback exists;
- no Group-only schema coordinate is used;
- B4 editorial type/order/result contracts remain stable;
- schema check and Codegen pass;
- generated output is deterministic;
- lint/typecheck pass;
- focused tests pass;
- full regression passes;
- production build passes;
- complete diff/security review passes;
- GitHub Frontend CI passes on the PR;
- rollback point is explicit.

If the canonical schema cannot provide server-side Business Unit filtering for the B4 heterogeneous connection, the correct B5 result is a documented `BLOCKED_ARCHITECTURE_DECISION`, not a pagination-compromising workaround.

End the implementation report with `CURRENT PROJECT STATE`.
