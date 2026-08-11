# Step 2C.3C-B2 — Homepage Contract + Typed Brand Banner Server Adapter

## Status

APPROVED FOR IMPLEMENTATION on `feature/2c3c-b2-homepage-brand-adapter`.

## Objective

Complete the next focused Step 2C.3C contract increment by:

1. reconciling durable repository state after the accepted/merged B1 milestone;
2. adding the canonical typed homepage GraphQL operation/runtime bridge/server adapter;
3. completing the server-side normalization contract for the typed announcement/emergency banners introduced in B1;
4. preserving all existing GraphQL transport, cache, hostname/site-registry, security, and server-only architecture.

No production visual components are part of B2.

## Baseline evidence

- Canonical integration/default branch: `main`.
- B1 PR: `#5` — merged and owner accepted.
- B1 merge commit on `main`: `ace3d058a688dbe1a483b5a1f60f742bfe85cc5b`.
- B1 implementation head: `d0b0d7fae5aa0870487335e066e51d56010e2137`.
- B1 Frontend CI run #5: PASS.
- Full regression at B1: 15 files / 92 tests PASS.
- Verified canonical schema source: `frontend/schema/wpgraphql.graphql`.
- Group audit schema remains structural-superset evidence only.
- Shared Codegen consumes `frontend/schema/wpgraphql.graphql` and `frontend/src/queries/**/*.graphql`.

Read before editing:

- `AGENTS.md`
- `project-state.json`
- `docs/PROJECT-STATE.md`
- `docs/SOURCE-OF-TRUTH.md`
- `docs/DECISIONS.md`
- `docs/tasks/step-2c3c-b1.md`
- relevant query/client/cache/site-registry/brand source and tests

## Mandatory pre-implementation reconciliation

Repository evidence now supersedes stale durable state in several places. Reconcile these files **before modifying business/runtime code**:

- `project-state.json`
- `docs/PROJECT-STATE.md`
- `docs/SOURCE-OF-TRUTH.md`
- `docs/DECISIONS.md`

Required corrections:

- record B1 as accepted and merged at `ace3d058a688dbe1a483b5a1f60f742bfe85cc5b`;
- set current Step 2C.3C substage to B2;
- set canonical/current frontend integration branch to `main`;
- set current governed frontend baseline/head to the B1 merge commit where appropriate;
- update the frontend source-of-truth section so it no longer names the historical `step-2c3c-typed-query-contracts` branch as current;
- resolve/supersede stale `ADR-PENDING-001` because G0-C already established `main` as canonical/default branch with PR + CI + owner-approval governance;
- keep `SOT-001` / backend source reconciliation OPEN and blocking for new backend runtime changes;
- do not claim production deployment or backend reconciliation occurred.

Commit the reconciliation before the first B2 runtime/code change if practical so the history proves the evidence-first sequence.

## Confirmed architecture locks

- WordPress Multisite remains the editorial CMS.
- `sira-core` remains the backend business/content owner.
- WPGraphQL is the primary frontend API.
- One Next.js App Router app serves Group and all branches.
- Server Components/server-only data access remain the default.
- Existing published/preview GraphQL clients remain authoritative; do not create a second transport.
- Existing cache-tag helper and site registry remain authoritative; extend only when necessary and tested.
- Consulting is the canonical shared schema; shared operations must not use Group-only coordinates.
- Use generated GraphQL types/documents as runtime contract ownership (`ADR-016`).
- Use native WPGraphQL menus later; do not create `siraNavigation`.
- Use native content connections later; do not create `siraEditorialFeed`.
- Use `ProjectDetails`; do not introduce `SiraProjectDetails`.
- Missing CMS content/configuration must not be hidden with React hardcoding.
- No Bricks or `.dc.html` runtime dependency.
- No Client Component should be introduced by this data-contract increment.

## B2-A — Canonical homepage operation

Inspect the checked-in canonical schema first and use the **actual verified canonical fields/types**. Do not infer field names from conversation memory.

Create the minimal production homepage GraphQL document under the existing `frontend/src/queries/` convention.

Required contract behavior:

- resolve the configured site homepage through the verified root/page lookup supported by the canonical schema;
- prefer URI `/` resolution when supported by the checked-in canonical schema;
- do not select the first Page;
- do not guess `/home`;
- do not substitute another Page when the homepage is missing;
- do not parse legacy Bricks content as a fallback;
- preserve typed `siraHomepage` structured data and its verified Group/Branch variant model;
- query only fields needed to establish a stable server adapter contract; avoid indiscriminate over-fetching of the entire ACF tree;
- use canonical shared fields only.

If the schema does not support the previously expected lookup shape, stop guessing: document the verified alternative from the checked-in schema and implement that.

## B2-B — Homepage runtime bridge and server adapter

Follow the existing approved flow:

`canonical .graphql document -> Codegen -> generated result/variable/document types -> GraphQLOperation wrapper -> existing published/preview client boundary -> server-only adapter`

Requirements:

- no handwritten duplicate GraphQL result interfaces when Codegen owns them;
- no duplicate embedded GraphQL operation string when the generated document can provide `.toString()`;
- preserve existing `GraphQLOperation` / `defineGraphQLOperation` conventions;
- adapter must be server-only or only reachable through existing server-only data boundaries;
- adapter output must normalize WPGraphQL connection/ACF shapes into a deliberately stable frontend data contract;
- distinguish at minimum:
  - configured homepage;
  - homepage not configured/not found;
  - remote/GraphQL failure;
  - invalid/unsupported homepage data shape;
- a missing `/` page is a CMS readiness result for Step 2C.3D, not permission to fabricate frontend content;
- use existing cache-tag conventions and site isolation; do not invent a parallel cache architecture;
- preserve preview compatibility without implementing full Draft Mode in B2.

## B2-C — Typed brand banner server normalization

B1 added typed `announcement` and `emergency` fields to the generated `SiraBrand` operation while retaining legacy string fields.

Complete the server-side brand contract so normalized brand data can expose the typed public banner payload safely.

Inspect and update the existing brand types/normalizer rather than creating a parallel brand system.

The normalized typed banner contract should preserve the verified public fields where valid:

- `message`
- `severity`
- optional `link` (`label`, `url`, `target`)
- `startsAt`
- `endsAt`
- `dismissible`
- `revisionKey`

Requirements:

- typed announcement/emergency may legitimately be `null`;
- retain legacy `announcementBanner` and `emergencyBanner` strings for backward compatibility during migration;
- normalize text lengths and URL safety consistently with existing brand normalization practices;
- reject or null unsafe banner links rather than passing malformed/non-approved schemes through;
- preserve typed severity from the generated contract; do not convert to arbitrary CMS CSS/color classes;
- do not implement banner UI, dismissal persistence, client state, scheduling timers, or animation in B2;
- do not silently reinterpret backend schedule semantics; preserve server-provided fields for later presentation logic.

## Expected affected areas

Exact filenames must be determined by inspecting the current repository before editing. Expected areas include:

- `frontend/src/queries/` — homepage `.graphql` source and runtime wrapper;
- `frontend/src/generated/graphql/` — Codegen output only;
- `frontend/src/lib/...` — server-only homepage adapter using existing architecture;
- `frontend/src/lib/brand/types.ts`;
- `frontend/src/lib/brand/normalize-brand.ts`;
- relevant focused/unit/contract tests;
- durable state files listed above.

Do not reorganize unrelated directories in B2.

## Out of scope

- native navigation implementation;
- footer/legal navigation;
- newsroom/editorial feed;
- Group Business Unit filtering;
- project archive/single refactor;
- production homepage React sections;
- banner UI/client dismissal behavior;
- Draft Mode/preview authentication implementation;
- SEO/Yoast integration;
- WordPress/backend runtime changes;
- live introspection or `schema:fetch`;
- CMS content correction;
- dependency upgrades or Vite warning cleanup;
- GitHub Actions maintenance unless B2 is blocked by it;
- production deployment;
- merge to `main`.

## Security/privacy requirements

- no credentials, authorization headers, tokens, or `.env` values in source/generated/docs output;
- no internal/private analytics/raw options in shared operations;
- no unpublished/private content expansion;
- no arbitrary Host/endpoint resolution changes;
- no Group-only shared schema coordinates;
- no unsafe banner URL propagation;
- no secrets in logs or PR description.

## Required tests

Add focused evidence for the new behavior, including at minimum:

1. homepage runtime operation derives from generated Codegen document;
2. homepage operation contains only approved canonical coordinates;
3. missing homepage is represented explicitly and does not fabricate another page;
4. homepage adapter normalizes the verified Group/Branch variant safely;
5. typed announcement normalization;
6. typed emergency normalization;
7. nullable banner behavior;
8. unsafe/malformed banner link handling;
9. legacy banner strings remain available;
10. existing brand/query/project contracts remain intact.

Prefer extending the current testing conventions instead of creating a new test framework.

## Validation gate

Run from `frontend/` after implementation:

1. `pnpm schema:check`
2. `pnpm codegen`
3. verify generated output is deterministic / clean after a second generation as appropriate
4. `pnpm lint`
5. `pnpm typecheck`
6. focused B2 contract/unit tests
7. `pnpm test:run`
8. `pnpm build`
9. `git diff --check`

Review the complete repository diff for:

- only B2/state/task scope changes;
- generated files changed only because source `.graphql` documents changed;
- no secrets;
- no Group-only coordinates;
- no duplicate GraphQL contract ownership;
- no frontend hardcoded CMS substitutes;
- no unintended Client Components;
- no dependency/lockfile changes unless explicitly justified and approved.

## Git / PR delivery

When all required checks pass:

- keep all work on `feature/2c3c-b2-homepage-brand-adapter`;
- commit scoped changes;
- push the branch;
- open a **draft Pull Request** to `main` using the SIRA evidence template;
- include exact test counts, CI result, warnings, rollback point, security review, and current project state;
- do not merge the PR;
- do not deploy production.

The engineering agent may fix failures autonomously when the fix is strictly inside B2 scope. Stop only for a genuine protected/external/architectural decision.

## Acceptance gate

B2 is ready for owner review only when:

- durable state has been reconciled first;
- homepage source operation is schema-backed and Codegen-generated;
- homepage server adapter has explicit missing/error semantics and no fabricated fallback;
- typed brand banner server normalization is complete and tested;
- schema check and Codegen pass;
- generated output is deterministic;
- lint/typecheck pass;
- focused tests pass;
- full regression passes;
- production build passes;
- final diff/security review passes;
- GitHub Frontend CI passes on the PR;
- rollback point is explicit.

End the implementation report with `CURRENT PROJECT STATE`.
