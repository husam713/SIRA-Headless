# Step 2C.3C-B4 — Native Editorial / Newsroom Feed Contract

## Status

APPROVED FOR IMPLEMENTATION on `feature/2c3c-b4-editorial-feed-contract`.

## Objective

Complete the next focused Step 2C.3C frontend contract increment by:

1. reconciling durable repository state after the accepted/merged B3 milestone;
2. adding the canonical native WPGraphQL editorial/newsroom feed operation using the existing native content connection architecture;
3. adding a generated runtime bridge and server-only adapter with explicit pagination/result semantics;
4. normalizing public editorial items into a stable immutable frontend contract without inventing a custom `siraEditorialFeed` API;
5. preserving existing GraphQL transport, cache, hostname/site-registry, generated-contract, security, and server-only architecture.

This B4 increment is the **unfiltered editorial/newsroom feed contract only**. Group Business Unit filtering is intentionally deferred to B5 so the base native content contract is proven first.

No production newsroom React components are part of B4.

## Baseline evidence

- Canonical integration/default branch: `main`.
- B3 PR: `#7` — owner accepted and merged.
- B3 merge commit on `main`: `2653a66f8c6a469be9412e173abd4f6216725e9b`.
- B3 implementation head: `0e35146a41941c3d400fb8aa55e4a19b6c6791dd`.
- B3 Frontend CI run #9: PASS.
- Full regression at B3: 17 files / 121 tests PASS.
- Verified canonical schema source: `frontend/schema/wpgraphql.graphql`.
- Group audit schema remains structural-superset evidence only.
- Shared Codegen consumes `frontend/schema/wpgraphql.graphql` and `frontend/src/queries/**/*.graphql`.
- ADR-013 requires native WPGraphQL content connections and forbids a custom `RootQuery.siraEditorialFeed` unless a later evidence-backed ADR supersedes it.
- `docs/PROJECT-STATE.md` records unfiltered newsroom/editorial feed as a remaining Step 2C.3C acceptance requirement.

Read before editing:

- `AGENTS.md`
- `project-state.json`
- `docs/PROJECT-STATE.md`
- `docs/SOURCE-OF-TRUTH.md`
- `docs/DECISIONS.md`
- `docs/tasks/step-2c3c-b3.md`
- existing GraphQL client/cache/site-registry/query source and tests
- the checked-in canonical GraphQL schema coordinates for native `contentNodes`, connection filters, pagination, common content-node interfaces, media/date/URI fields, and any schema-backed editorial content types

## Mandatory pre-implementation reconciliation

Repository evidence now supersedes durable state recorded before the B3 merge. Reconcile durable state **before modifying B4 runtime/business code**.

At minimum inspect and update as required:

- `project-state.json`
- `docs/PROJECT-STATE.md`
- `docs/SOURCE-OF-TRUTH.md`

Required corrections:

- record B3 as owner accepted and merged through PR `#7` at `2653a66f8c6a469be9412e173abd4f6216725e9b`;
- record B3 implementation head `0e35146a41941c3d400fb8aa55e4a19b6c6791dd` and Frontend CI run #9 PASS;
- set current Step 2C.3C substage to B4;
- set current governed frontend baseline/head to the accepted B3 merge commit where appropriate;
- keep canonical/default branch as `main`;
- keep `SOT-001` OPEN and blocking for new backend runtime changes;
- do not claim WordPress content readiness, backend reconciliation, staging, or production deployment occurred.

Do not create a new ADR unless implementation discovers a genuinely new durable architecture decision. Existing ADR-013 already locks native editorial content connections.

## Confirmed architecture locks

- WordPress Multisite remains the editorial CMS.
- `sira-core` remains the backend business/content owner.
- WPGraphQL is the primary frontend API.
- One Next.js App Router application serves Group and all branches.
- Server Components/server-only data access remain the default.
- Existing published/preview GraphQL clients remain authoritative; do not create a second transport.
- Existing cache-tag and hostname/site-registry architecture remains authoritative.
- Consulting is the canonical shared schema; shared operations must not use Group-only coordinates.
- Generated GraphQL types/documents own operation contracts (`ADR-016`).
- Use native WPGraphQL content connections (`ADR-013`). Do not create or use `siraEditorialFeed`.
- Group Business Unit filtering belongs to B5 and must not be silently mixed into this unfiltered B4 contract.
- Missing CMS content/configuration is a CMS readiness result (`ADR-015`), not permission to fabricate editorial cards in frontend source.
- No Bricks or `.dc.html` runtime dependency.
- No Client Component should be introduced by this data-contract increment.
- Production visual components remain gated by ADR-017.

## B4-A — Verify the native editorial/content connection

Inspect `frontend/schema/wpgraphql.graphql` first. Do not infer field names or content-type unions from conversation memory, old WordPress conventions, or generic WPGraphQL knowledge.

Determine from the checked-in canonical schema:

- the exact native root connection to use for the unfiltered editorial feed (expected architecture: native `contentNodes`, but the operation must follow actual checked-in schema evidence);
- exact pagination argument names and `pageInfo` fields;
- exact common public node fields supported across the connection;
- exact schema-backed way to discriminate returned content types (`__typename`, `contentTypeName`, or another verified field);
- exact public publication/date/URI/title/excerpt/media coordinates that are common or safely queried with inline fragments;
- whether the canonical schema supports deterministic ordering/filtering required for a newsroom feed.

If repository/schema evidence does not support a stable editorial ordering or a safe content-type inclusion policy, do not guess. Implement the strongest evidence-backed unfiltered native contract possible and surface the unresolved requirement explicitly for owner/architecture review only if necessary.

Do **not** run live introspection or `schema:fetch` in B4.

## B4-B — Canonical GraphQL operation

Create a minimal production `.graphql` document under the existing `frontend/src/queries/` convention.

Requirements:

- use only native canonical WPGraphQL content-connection coordinates;
- do not add or reference `siraEditorialFeed`;
- do not use Group-only fields;
- include cursor pagination (`first` + `after`, or exact canonical equivalent) rather than an unbounded query;
- capture `pageInfo` required for deterministic server pagination;
- query stable common identity/routing/editorial metadata supported by the canonical schema;
- use inline fragments only for evidence-backed fields needed to normalize heterogeneous editorial content safely;
- avoid fetching full post bodies/content HTML when archive/feed cards do not need it;
- avoid private/internal analytics/raw options fields;
- avoid querying arbitrary content types merely because they exist if the schema/repository clearly distinguishes editorial/public newsroom types;
- do not hardcode Business Unit filtering in B4.

### Unfiltered feed rule

B4 must establish a reusable **unfiltered** editorial contract. Do not apply the ADR-014 Business Unit site mapping in this increment. B5 will build the Group Business Unit filtering layer on top of the accepted B4 contract using schema/repository evidence.

## B4-C — Generated runtime bridge

Follow the established ownership flow:

`canonical .graphql document -> Codegen -> generated result/variable/document types -> GraphQLOperation wrapper -> existing published GraphQL client -> server-only adapter`

Requirements:

- no handwritten duplicate GraphQL result interfaces when Codegen owns them;
- no duplicate embedded operation string when the generated document can provide `.toString()`;
- preserve existing `GraphQLOperation` / `defineGraphQLOperation` conventions;
- no new GraphQL transport or endpoint-resolution path;
- preserve trusted `SiteKey` / site registry isolation;
- generated files must be produced by Codegen only and never hand-edited.

## B4-D — Stable editorial server contract

Create or extend the appropriate server-only library area after inspecting current repository organization.

Use an explicit result model rather than ambiguous `null` behavior. The contract should distinguish at minimum:

- `ready` / resolved feed page;
- empty feed with no public editorial nodes;
- invalid/unsupported payload shape;
- remote/GraphQL failure.

A valid empty feed is not a remote error and must not fabricate content.

The normalized feed contract should preserve, where supported and valid by the canonical schema:

- stable node identity;
- canonical typename/content-type discriminator;
- title/label suitable for an archive card;
- safe URI/path for internal routing;
- excerpt/summary where available and safe;
- publication date and/or modified date where supported;
- featured image/media metadata only if canonical schema supports a stable public shape;
- cursor pagination (`hasNextPage`, `endCursor` or verified equivalent);
- immutable readonly structures.

Do not normalize full rich-text body HTML into the archive contract unless repository evidence proves it is required.

## B4-E — Normalization safety and integrity

Requirements:

- reject/omit nodes with invalid or non-positive stable database identity if identity is numeric;
- normalize/trim titles and excerpts conservatively without inventing text;
- do not fabricate hrefs when URI/path is missing or unsafe;
- reject unsafe routing schemes/credential-bearing URLs if an absolute URL appears in a verified field;
- preserve deterministic source order from the GraphQL connection unless the canonical query specifies an evidence-backed server ordering;
- detect duplicate node IDs in a single page and treat the payload as invalid or safely diagnose according to the chosen stable contract;
- treat a missing `pageInfo`/cursor shape required by the generated contract as invalid, not as end-of-feed guesswork;
- no exposure of restricted/private node fields or raw backend options;
- no browser-side GraphQL access.

## B4-F — Cache / server behavior

- Reuse the existing published GraphQL client and server-only boundary.
- Reuse an existing editorial/news/content cache tag if already present.
- If a narrowly scoped new cache tag is genuinely required, extend the existing cache-tag architecture and its tests rather than creating a parallel mechanism.
- Do not implement client-side infinite scrolling or fetching in B4.
- Do not implement Draft Mode/editorial preview behavior in B4 unless the existing server adapter pattern requires only passive compatibility with the current preview transport. Full preview behavior remains a later stage.
- Preserve safe logging: no endpoint credentials, bearer tokens, headers, or sensitive raw payloads.

## Expected affected areas

Exact filenames must be determined by inspecting the current repository. Expected areas include:

- `frontend/src/queries/` — editorial/newsroom `.graphql` source and runtime wrapper;
- `frontend/src/generated/graphql/` — Codegen output only;
- `frontend/src/lib/...` — server-only editorial/newsroom types/normalizer/getter/export surface;
- existing cache-tag source/tests only if a new scoped tag is truly needed;
- existing query-contract tests and new focused editorial unit tests;
- durable state files listed above.

Do not reorganize unrelated directories.

## Out of scope

- Group Business Unit filtering (B5);
- project archive/single contracts (later Step 2C.3C increment);
- newsroom React UI/cards/grids;
- client-side pagination/infinite-scroll behavior;
- homepage visual sections;
- navigation/footer UI;
- SEO/Yoast;
- Draft Mode implementation;
- WordPress content creation/correction;
- backend runtime changes;
- live introspection or `schema:fetch`;
- dependency upgrades / Vite warning cleanup;
- GitHub Actions maintenance unless B4 is blocked by it;
- production deployment;
- merge to `main`.

## Security / privacy requirements

- no credentials, tokens, authorization headers, `.env` values, or production secrets in source/generated/docs output;
- no arbitrary Host/endpoint resolution changes;
- no unpublished/private content expansion;
- no Group-only shared coordinates;
- no unsafe link propagation;
- no raw analytics/internal options fields;
- no hidden fallback editorial content hardcoded in frontend source;
- no Client Component or browser-side GraphQL access introduced;
- no secrets in logs or PR description.

## Required focused evidence

Add focused tests covering at minimum:

1. runtime editorial operation derives from the generated Codegen document;
2. operation validates against the canonical shared schema;
3. operation uses the native content connection and does not reference `siraEditorialFeed`;
4. cursor pagination variables/`pageInfo` are generated and stable;
5. B4 operation is explicitly unfiltered by Business Unit;
6. empty native content collection resolves as a valid empty feed, not fabricated content;
7. heterogeneous supported editorial node types normalize to a stable discriminator contract;
8. duplicate/invalid node identity handling;
9. title/excerpt/URI normalization without invented data;
10. safe routing/link handling for any relevant URI/path/URL field;
11. deterministic item ordering;
12. pagination output normalization;
13. remote GraphQL failure maps to a stable server result;
14. existing brand/homepage/navigation/projects/cache/site-registry tests remain intact.

Prefer existing testing conventions rather than adding a new framework.

## Validation gate

Run from `frontend/` after implementation:

1. `pnpm schema:check`
2. `pnpm codegen`
3. verify generated GraphQL output is deterministic / clean after a second generation as appropriate
4. `pnpm lint`
5. `pnpm typecheck`
6. focused B4 contract/unit tests
7. `pnpm test:run`
8. `pnpm build`
9. `git diff --check`

Review the complete repository diff for:

- only B4/state/task scope changes;
- generated files changed only because source `.graphql` documents changed;
- no secrets;
- no Group-only coordinates;
- no `siraEditorialFeed` custom contract;
- no duplicate GraphQL contract ownership;
- no Business Unit filter mixed into the unfiltered B4 operation;
- no hardcoded editorial fallback content;
- no unintended Client Components;
- no backend/dependency/lockfile changes unless explicitly justified and approved.

## Git / PR delivery

When all required checks pass:

- keep all work on `feature/2c3c-b4-editorial-feed-contract`;
- commit scoped changes;
- push the branch;
- open a **draft Pull Request** to `main` using the SIRA evidence template;
- include the exact canonical native connection used, supported editorial node discriminators/types, pagination semantics, focused/full test counts, CI result, warnings/deferred items, security review, rollback point, and current project state;
- do not merge the PR;
- do not deploy production.

The engineering agent may fix failures autonomously when the fix is strictly inside B4 scope. Stop only for a genuine protected/external/architecture decision.

## Acceptance gate

B4 is ready for owner review only when:

- durable state records accepted B3 before B4 runtime changes;
- editorial operation is canonical-schema-backed and Codegen-generated;
- native WPGraphQL content connection is used with no custom `siraEditorialFeed`;
- B4 remains unfiltered by Business Unit;
- pagination semantics are explicit and deterministic;
- normalized editorial items expose only stable public feed-card data;
- empty/invalid/remote states are explicit and do not fabricate CMS content;
- server-only/site-isolated/cache architecture is preserved;
- schema check and Codegen pass;
- generated output is deterministic;
- lint/typecheck pass;
- focused tests pass;
- full regression passes;
- production build passes;
- complete diff/security review passes;
- GitHub Frontend CI passes on the PR;
- rollback point is explicit.

End the implementation report with `CURRENT PROJECT STATE`.
