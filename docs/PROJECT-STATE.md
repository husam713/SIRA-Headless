# SIRA Current Project State

Last reconciled from repository and GitHub evidence: 2026-08-11

## Current execution state

- **Current business stage:** Step 2C.3C — Typed Frontend Query Contracts
- **Current substage:** B7 — Project Single Contract
- **Canonical integration/default branch:** `main`
- **Business-code baseline:** `a116fea3514af457a54a0df1d5f4e86e4badbeba`
- **Current governed integration head:** `a116fea3514af457a54a0df1d5f4e86e4badbeba`
- **Latest approved business milestone:** Step 2C.3C-B6
- **Latest approved tag:** `step-2c3b-approved`
- **Production deployment:** NOT AUTHORIZED

G0 — AI Engineering Governance Bootstrap is complete and merged at `c26b658b4dfafb82c04af42ca880e6894aefcf0d`.

G0-C — GitHub Governance + CI is complete and merged at `e2a0d425cd7fe435981427d9be33a6e6f9d8f436`. The repository default branch is now `main`, and `main` is the canonical integration branch.

Step 2C.3C-B1 is owner accepted and merged through PR `#5` at `ace3d058a688dbe1a483b5a1f60f742bfe85cc5b`. Its implementation head is `d0b0d7fae5aa0870487335e066e51d56010e2137`, and Frontend CI run #5 passed.

Step 2C.3C-B2 is owner accepted and merged through PR `#6` at `5efc1ef7b1a49418aaa4258ed250cc6f9541474c`. Its implementation head is `63d4bac028f6760bd57e522bd4a5f88622c797eb`, and Frontend CI run #7 passed.

Step 2C.3C-B3 is owner accepted and merged through PR `#7` at `2653a66f8c6a469be9412e173abd4f6216725e9b`. Its implementation head is `0e35146a41941c3d400fb8aa55e4a19b6c6791dd`, and Frontend CI run #9 passed.

Step 2C.3C-B4 is owner accepted and merged through PR `#8` at `684bce5b51f977e078029870b085a15b2204ad60`. Its implementation head is `e31ce8e793601266be4ae8064ebb0f5fa74c2e81`, and Frontend CI run #11 passed.

Step 2C.3C-B5 is owner accepted and merged through PR `#9` at `00022da346777ce67acc92b0c53c07627e1d85e3`. Its implementation head is `9fec2ea30c36cab62c1af4f576429bea3ea42628`, and Frontend CI run #13 passed.

Step 2C.3C-B6 is owner accepted and merged through PR `#10` at `a116fea3514af457a54a0df1d5f4e86e4badbeba`. Its implementation head is `f392cfbb022e1928011ff2b28f7955b9e9acb6b0`, Frontend CI run #15 passed, and the accepted full regression was 20 files / 158 tests PASS.

## GitHub governance status

- **GOV-001 — CLOSED:** repository default branch is `main`.
- **GOV-002 — CLOSED:** frontend GitHub Actions CI is installed and successful workflow evidence exists from G0-C.
- **GOV-003 — WARNING:** a `main` branch protection rule is configured, but GitHub reports it is **not enforced** for this private repository under the current plan.

Compensating controls for GOV-003:

- normal changes arrive through Pull Requests;
- frontend-impacting changes must pass Frontend CI;
- the engineering agent must not directly merge to `main`;
- owner approval is required before merge;
- force-push, branch deletion, production deployment, DNS, and destructive operations remain protected by project policy.

The lack of platform enforcement is a documented GitHub-plan limitation, not a blocker for Step 2C.3C.

## Completed / established

- WordPress Multisite headless architecture
- `sira-core` Step 1 headless refactor baseline
- 28 SIRA CPTs and 10 taxonomies in the backend contract
- curated `siraBrand` GraphQL architecture
- Next.js App Router multi-brand foundation
- validated hostname/site registry
- server-only published and preview GraphQL transports
- Step 2C brand/design-token infrastructure
- five-site live GraphQL inventory
- Step 2C.3A schema compatibility tooling and approved tag at `d361272`
- Step 2C.3B verified live schema adoption and Codegen
- Step 2C.3B approved tag at `d59035d`
- Step 2C.3C-B1 generated runtime brand contract bridge and typed banner query contract
- Step 2C.3C-B1 owner acceptance, Frontend CI, and merge through PR `#5` at `ace3d058`
- Step 2C.3C-B2 canonical homepage contract/server adapter and typed brand banner server normalization
- Step 2C.3C-B2 owner acceptance, Frontend CI, and merge through PR `#6` at `5efc1ef`
- Step 2C.3C-B3 native WPGraphQL navigation and stable primary/footer/legal server contracts
- Step 2C.3C-B3 owner acceptance, Frontend CI, and merge through PR `#7` at `2653a66`
- Step 2C.3C-B4 native WPGraphQL editorial feed and stable cursor-paginated server contract
- Step 2C.3C-B4 owner acceptance, Frontend CI, and merge through PR `#8` at `684bce5`
- Step 2C.3C-B5 site-aware server-side Business Unit filtering with stable cursor pagination
- Step 2C.3C-B5 owner acceptance, Frontend CI, and merge through PR `#9` at `00022da`
- Step 2C.3C-B6 generated project archive contract with safe site-isolated normalization
- Step 2C.3C-B6 owner acceptance, Frontend CI, and merge through PR `#10` at `a116fea`
- G0 evidence-first AI engineering governance
- G0-C GitHub governance and executable Frontend CI
- canonical/default branch cutover to `main`

## Verified live schema policy

The checked-in live schema metadata records:

- Consulting is the deterministic canonical branch.
- Consulting, Healthcare, Lifestyle, and Real Estate have exact schema equality.
- Canonical SHA-256: `32438736d4d73da267242d2ffe38a3e1c00844d10066d7bc098aad70bbf9f4f0`.
- Group audit SHA-256: `9469ebc4fbea5e55982661ca58e31de5b592fc8a9e6f0a31efd9bf000bf49971`.
- Group is allowed to remain a structural superset.
- Shared Codegen consumes only `frontend/schema/wpgraphql.graphql`.

## Locked data-contract decisions

- Use `ProjectDetails`; do not introduce `SiraProjectDetails`.
- Use native WPGraphQL menus; do not add `siraNavigation`.
- Use native content connections; do not add `siraEditorialFeed` unless a future evidence-backed ADR explicitly supersedes this decision.
- Explicit Business Unit mapping:
  - `group -> null`
  - `consulting -> consulting`
  - `healthcare -> healthcare`
  - `lifestyle -> lifestyle`
  - `realestate -> real-estate`
- Missing front-page/menu/brand content must be fixed at the CMS source rather than hidden with React hardcoding.

## Step 2C.3C required scope

Before Step 2C.3C can be accepted, the typed frontend contract layer must cover:

1. homepage;
2. native WordPress navigation;
3. footer/legal navigation;
4. unfiltered newsroom/editorial feed;
5. Group Business Unit filtering;
6. project archive;
7. project single;
8. typed announcement banner;
9. typed emergency banner.

Production visual components remain out of scope for this stage.

## Current B7 execution policy

Step 2C.3C-B7 branches from governed `main` at the accepted B6 merge and implements only the generated, native single-project contract. It must use a canonical schema-backed route locator, preserve the lightweight B6 archive, bound detail connections, enforce trusted site isolation, and return explicit ready/not-found/invalid/remote-error states without restricted-data leakage or cross-site fallback.

Required delivery flow:

`main` -> focused feature branch -> implementation -> local validation -> PR -> Frontend CI -> architecture/security/diff review -> owner approval -> merge.

Do not merge automatically.

## Open source-of-truth conflict

### SOT-001 — backend repository freshness

**Status: OPEN / BLOCKING FOR NEW BACKEND RUNTIME CHANGES**

The current GitHub backend source contains Step 1-era material that is not yet proven to be the latest cumulative backend implementation, while the verified live schema adopted in Step 2C.3B contains later contract work.

Do not modify backend runtime code until the latest verified cumulative backend source is reconciled into Git or an explicit evidence-backed decision establishes the correct backend source of truth.

This conflict does **not** block frontend Step 2C.3C work that is based on the already verified checked-in live schema.

## Next stages

After Step 2C.3C approval:

1. **Step 2C.3D — WordPress Content Readiness**
   - branch front pages;
   - menus;
   - Group/Healthcare brand correction;
   - structured homepage content readiness.
2. **Step 2C.4 — Production Design & Data Contract Audit**
   - preserve and update the earlier approved Step 2C.1 audit using live schema evidence.
3. **Step 3 — Preview / SEO / Discovery**
4. **Step 4 — Production Component Implementation**

## Owner/external decisions still protected

- merge into `main`;
- production merge/deployment;
- destructive WordPress changes;
- DNS/cutover;
- production secrets;
- multilingual production model;
- forms provider/storage/retention architecture.
