# Step 2C.3C-B3 — Native Navigation + Footer/Legal Contracts

## Status

APPROVED FOR IMPLEMENTATION on `feature/2c3c-b3-navigation-contracts`.

## Objective

Complete the next focused Step 2C.3C frontend contract increment by:

1. reconciling durable repository state after the accepted/merged B2 milestone;
2. adding the canonical native WPGraphQL menu operation/runtime bridge;
3. adding a server-only navigation adapter with stable primary/footer/legal contract semantics;
4. normalizing native menu items safely into a deterministic frontend tree/collection contract;
5. preserving existing GraphQL transport, cache, hostname/site-registry, generated-contract, security, and server-only architecture.

No production navigation/header/footer React components are part of B3.

## Baseline evidence

- Canonical integration/default branch: `main`.
- B2 PR: `#6` — owner accepted and merged.
- B2 merge commit on `main`: `5efc1ef7b1a49418aaa4258ed250cc6f9541474c`.
- B2 implementation head: `63d4bac028f6760bd57e522bd4a5f88622c797eb`.
- B2 Frontend CI run #7: PASS.
- Full regression at B2: 16 files / 106 tests PASS.
- Verified canonical schema source: `frontend/schema/wpgraphql.graphql`.
- Group audit schema remains structural-superset evidence only.
- Shared Codegen consumes `frontend/schema/wpgraphql.graphql` and `frontend/src/queries/**/*.graphql`.
- ADR-012 requires native WPGraphQL menus and forbids a custom `siraNavigation` root field.
- Earlier verified live inventory showed native menu data empty across the five sites; missing menu content/configuration therefore belongs to Step 2C.3D CMS readiness and must not be hidden by frontend hardcoding.

Read before editing:

- `AGENTS.md`
- `project-state.json`
- `docs/PROJECT-STATE.md`
- `docs/SOURCE-OF-TRUTH.md`
- `docs/DECISIONS.md`
- `docs/tasks/step-2c3c-b2.md`
- relevant GraphQL client/cache/site-registry/query source and tests
- the checked-in canonical GraphQL schema menu/root/menu-item coordinates

## Mandatory pre-implementation reconciliation

Repository evidence now supersedes the state recorded before B2 merge. Reconcile durable state **before modifying B3 runtime/business code**.

At minimum inspect and update as required:

- `project-state.json`
- `docs/PROJECT-STATE.md`
- `docs/SOURCE-OF-TRUTH.md`

Required corrections:

- record B2 as owner accepted and merged through PR `#6` at `5efc1ef7b1a49418aaa4258ed250cc6f9541474c`;
- record B2 implementation head `63d4bac028f6760bd57e522bd4a5f88622c797eb` and Frontend CI run #7 PASS;
- set current Step 2C.3C substage to B3;
- set current governed frontend baseline/head to the accepted B2 merge commit where appropriate;
- keep canonical/default branch as `main`;
- keep `SOT-001` OPEN and blocking for new backend runtime changes;
- do not claim WordPress menu content readiness, backend reconciliation, staging, or production deployment occurred.

Do not create a new ADR unless implementation discovers a genuinely new durable architecture decision. Existing ADR-012 already locks native WPGraphQL menus.

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
- Use native WPGraphQL menus (`ADR-012`). Do not create `siraNavigation`.
- Missing menus/menu assignments are CMS readiness defects (`ADR-015`), not permission to hardcode navigation in React or TypeScript.
- No Bricks or `.dc.html` runtime dependency.
- No Client Component should be introduced by this data-contract increment.
- Production visual components remain gated by ADR-017.

## B3-A — Canonical native menu operation

Inspect `frontend/schema/wpgraphql.graphql` first and use the **actual verified canonical menu/root/menu-item fields and enum values**. Do not infer coordinates from memory and do not run live introspection or `schema:fetch`.

Create the minimal production menu GraphQL document under the existing `frontend/src/queries/` convention.

Requirements:

- use only native WPGraphQL menu/root/menu-item coordinates present in the canonical shared schema;
- do not introduce or reference `siraNavigation`;
- do not use Group-only schema coordinates;
- query only fields needed to identify menus, identify their native locations/roles where supported, construct deterministic hierarchy/order, and build safe links;
- prefer schema-backed menu identity/location metadata over names guessed in frontend code;
- do not select "the first menu" as a fallback;
- do not fabricate primary/footer/legal items when menus are missing;
- avoid indiscriminate over-fetching of connected content nodes unless a stable contract demonstrably requires them.

### Menu identity / role rule

Determine the native menu-role mechanism from repository/schema evidence.

- If the canonical schema exposes usable location enum values or equivalent native role metadata and repository evidence supports the intended primary/footer/legal mapping, use that evidence-backed mechanism.
- If exact role identifiers are not supported by versioned evidence, **do not invent menu names/slugs/location constants** merely to make the adapter return data.
- In that case, implement the native typed menu collection safely and represent unresolved/missing logical scope as an explicit CMS-readiness result; document the exact evidence/configuration required for Step 2C.3D.
- Stop for owner/architecture input only if completing a stable logical contract genuinely requires a new product/architecture decision that cannot be derived from schema/repository evidence.

## B3-B — Generated runtime bridge

Follow the established flow:

`canonical .graphql document -> Codegen -> generated result/variable/document types -> GraphQLOperation wrapper -> existing published GraphQL client -> server-only adapter`

Requirements:

- no handwritten duplicate GraphQL result interfaces when Codegen owns them;
- no duplicate embedded operation string when the generated document can provide `.toString()`;
- preserve existing `GraphQLOperation` / `defineGraphQLOperation` conventions;
- no new GraphQL transport or endpoint resolution path;
- preserve per-site isolation through the trusted `SiteKey`/site registry boundary.

## B3-C — Stable navigation server contract

Create or extend the appropriate server-only library area after inspecting current repository organization.

The normalized domain contract must support the three required logical scopes:

- `primary`
- `footer`
- `legal`

Use an explicit resolution model rather than ambiguous `null` behavior. The exact shape may follow existing homepage conventions, but it must distinguish at minimum:

- scope/menu ready;
- scope/menu missing or unassigned (CMS readiness);
- invalid native menu/menu-item data;
- remote/GraphQL failure.

A missing menu is **not** a remote error and must not trigger fabricated fallback links.

The contract must remain useful when current live menu collections are empty so Step 2C.3D can fix content/configuration without a frontend rewrite.

## B3-D — Native menu item normalization

Normalize native menu items into a stable immutable frontend contract.

At minimum preserve, where verified by the canonical schema and valid:

- stable item identity;
- label;
- safe href/path information;
- target when supported;
- parent/child hierarchy or deterministic equivalent;
- native order when supported/required;
- children as a stable readonly structure.

Safety and integrity requirements:

- reject/null unsafe schemes such as `javascript:`, `data:`, `vbscript:` or malformed values;
- reject protocol-relative links such as `//attacker.example/...` unless an existing approved URL policy explicitly allows them;
- do not propagate credential-bearing URLs;
- allow valid site-relative paths and HTTP(S) URLs according to existing public URL normalization policy;
- prefer a verified native `path` for internal routing when the schema supplies one rather than inventing URL rewriting;
- do not silently rewrite WordPress origins to guessed production domains;
- only allow known targets such as `_self` / `_blank` when target is exposed; normalize other values safely;
- detect/handle duplicate IDs, orphaned parent references, self-parenting/cycles, or otherwise invalid hierarchy without infinite recursion;
- preserve deterministic sibling order;
- do not execute or preserve menu-item CSS classes as a source of presentation/business behavior unless an existing approved contract requires them.

If a malformed item can be safely omitted while retaining a valid menu, do so with diagnostics; if the menu hierarchy cannot be trusted, return an explicit invalid result rather than fabricating structure.

## B3-E — Cache / server behavior

- Reuse the existing published GraphQL client and server-only boundary.
- Reuse existing site cache tags and any existing navigation/menu invalidation tags.
- If a narrowly scoped new cache tag is truly required, extend the existing cache-tag architecture and tests instead of inventing a parallel system.
- Do not implement client-side menu fetching.
- Do not implement Draft Mode, menu editing preview, or authentication changes in B3.
- Preserve safe logging: no endpoint credentials, bearer tokens, headers, or sensitive raw payloads.

## Expected affected areas

Exact filenames must be determined after inspecting the current repository. Expected areas include:

- `frontend/src/queries/` — native menu `.graphql` source and runtime wrapper;
- `frontend/src/generated/graphql/` — Codegen output only;
- `frontend/src/lib/...` — server-only navigation types/normalizer/getter/export surface;
- existing cache-tag code/tests only if a menu/navigation tag extension is actually needed;
- relevant contract and unit tests;
- durable state files listed above.

Do not reorganize unrelated directories.

## Out of scope

- header/navigation React UI;
- mobile menu interactions;
- footer React UI;
- banner UI/dismissal logic;
- homepage visual sections;
- newsroom/editorial feed;
- Group Business Unit filtering;
- project archive/single contract refactor;
- SEO/Yoast;
- Draft Mode implementation;
- WordPress menu creation/assignment/content correction;
- backend runtime changes;
- live introspection or `schema:fetch`;
- dependency upgrades / Vite warning cleanup;
- GitHub Actions maintenance unless B3 is blocked by it;
- production deployment;
- merge to `main`.

## Security / privacy requirements

- no credentials, tokens, authorization headers, `.env` values, or production secrets in source/generated/docs output;
- no arbitrary Host/endpoint resolution changes;
- no private/unpublished content expansion;
- no Group-only shared coordinates;
- no unsafe link propagation;
- no hidden CMS fallback data hardcoded in frontend source;
- no Client Component or browser-side GraphQL access introduced;
- no secrets in logs or PR description.

## Required focused evidence

Add focused tests covering at minimum:

1. runtime menu operation derives from generated Codegen document;
2. operation validates against the canonical shared schema;
3. operation uses native WPGraphQL menu coordinates and does not reference `siraNavigation`;
4. no first-menu/name/slug fallback is used without evidence;
5. primary/footer/legal logical scope semantics are explicit;
6. empty/missing menu data is represented as CMS-readiness/missing, not fabricated content;
7. deterministic hierarchy/order normalization;
8. orphan/self-parent/cycle or equivalent invalid hierarchy handling;
9. safe site-relative link handling;
10. safe HTTP(S) external link handling;
11. unsafe/malformed/credential-bearing URL handling;
12. target normalization;
13. remote GraphQL failure maps to a stable server result;
14. existing homepage, brand/banner, project, cache, and site-registry contracts remain intact.

Prefer extending existing testing conventions rather than adding a new test framework.

## Validation gate

Run from `frontend/` after implementation:

1. `pnpm schema:check`
2. `pnpm codegen`
3. verify generated GraphQL output is deterministic / clean after a second generation as appropriate
4. `pnpm lint`
5. `pnpm typecheck`
6. focused B3 contract/unit tests
7. `pnpm test:run`
8. `pnpm build`
9. `git diff --check`

Review the complete repository diff for:

- only B3/state/task scope changes;
- generated files changed only because source `.graphql` documents changed;
- no secrets;
- no Group-only coordinates;
- no `siraNavigation` custom contract;
- no duplicate GraphQL contract ownership;
- no guessed hardcoded menus/links that hide CMS readiness defects;
- no unintended Client Components;
- no backend/dependency/lockfile changes unless explicitly justified and approved.

## Git / PR delivery

When all required checks pass:

- keep all work on `feature/2c3c-b3-navigation-contracts`;
- commit scoped changes;
- push the branch;
- open a **draft Pull Request** to `main` using the SIRA evidence template;
- include exact focused/full test counts, CI result, warnings/deferred items, security review, rollback point, and current project state;
- do not merge the PR;
- do not deploy production.

The engineering agent may fix failures autonomously when the fix is strictly inside B3 scope. Stop only for a genuine protected/external/architecture decision.

## Acceptance gate

B3 is ready for owner review only when:

- durable state records accepted B2 before B3 runtime changes;
- menu operation is canonical-schema-backed and Codegen-generated;
- native WPGraphQL menus are used with no custom `siraNavigation`;
- primary/footer/legal logical contract semantics are stable and do not fabricate missing CMS content;
- menu hierarchy and links are normalized safely and deterministically;
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
