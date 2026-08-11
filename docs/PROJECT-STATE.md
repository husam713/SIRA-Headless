# SIRA Current Project State

Last reconstructed from repository evidence: 2026-08-11

## Current execution state

- **Current business stage:** Step 2C.3C — Typed Frontend Query Contracts
- **Current substage:** B1 — Generated Runtime Contract Bridge + Typed Brand Banners
- **Temporary integration/execution branch:** `step-2c3c-typed-query-contracts`
- **Business-code baseline:** `d59035d4ec2a97aa9524cf0b4788606745be245a`
- **Current execution head after governance bootstrap:** `c26b658b4dfafb82c04af42ca880e6894aefcf0d`
- **Latest approved business milestone:** Step 2C.3B
- **Latest approved tag:** `step-2c3b-approved`
- **Production deployment:** NOT AUTHORIZED

G0 — AI Engineering Governance Bootstrap was approved and merged through PR #1. The repository now contains the durable evidence-first governance layer (`AGENTS.md`, machine project state, source-of-truth rules, decisions, handoff instructions, acceptance gates, and PR template).

G0-C — GitHub Governance + CI is in progress on `chore/github-governance-ci`. Its purpose is to introduce real CI evidence and prepare a canonical `main` integration branch. No default-branch cutover has occurred yet.

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
- Step 2C.3A schema compatibility tooling
- Step 2C.3A approved tag at `d361272`
- Step 2C.3B verified live schema adoption and Codegen
- Step 2C.3B approved tag at `d59035d`
- G0 evidence-first AI engineering governance merged at `c26b658`

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

## GitHub governance target

G0-C proposes the following simple repository model:

- `main` — canonical protected integration branch containing the latest approved integrated project state;
- `feature/*`, `fix/*`, `chore/*` — focused implementation branches;
- approved tags — immutable milestone/rollback references;
- historical `step-*` branches — retained until the migration history is safely consolidated; do not delete them during G0-C.

A separate long-lived `develop` branch is not currently justified.

The repository default branch remains `step-2c2a-inventory` until the G0-C acceptance gate is approved and the GitHub repository setting is explicitly changed.

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

## Open source-of-truth conflict

### SOT-001 — backend repository freshness

**Status: OPEN / BLOCKING FOR NEW BACKEND RUNTIME CHANGES**

The current GitHub backend source contains the Step 1-era `BrandSchema.php` with legacy string banner fields. The verified live schema adopted in Step 2C.3B contains newer typed brand banner objects and other later contract work. Therefore the backend folder in GitHub cannot yet be assumed to be the latest cumulative backend implementation.

Do not modify backend runtime code until the latest verified cumulative backend source is reconciled into Git or an explicit decision establishes the correct backend source of truth.

This conflict does **not** block frontend Step 2C.3C work that is based on the already verified checked-in live schema.

## Open governance issues

- **GOV-001 — OPEN:** GitHub default branch is `step-2c2a-inventory`. G0-C proposes `main`; cutover has not happened yet.
- **GOV-002 — IN PROGRESS:** frontend GitHub Actions CI is being introduced. It remains unverified until a real workflow run completes.

## Owner/external decisions still protected

- merge into the governed integration/default branch;
- production merge/deployment;
- destructive WordPress changes;
- DNS/cutover;
- production secrets;
- branch protection/default-branch admin settings when not available to the engineering agent;
- multilingual production model;
- forms provider/storage/retention architecture.
