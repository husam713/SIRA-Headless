# SIRA Current Project State

Last reconciled from repository, GitHub, and fresh read-only CMS evidence: 2026-08-15

## Current execution state

- **Current business stage:** Step 2C.5B — CMS Mutation Readiness & Backup Gate
- **Current substage:** 2C.5B-CMS-MUTATION-READINESS-BACKUP-GATE — Read-Only Preflight and Exact Future Batch A Planning
- **Current stage status:** OWNER ACCEPTED / MERGED
- **Canonical integration/default branch:** `main`
- **Business-code baseline:** `2bd4991f75a53ab9209e748499dcb8915769e3a6`
- **Current governed integration head:** `2bd4991f75a53ab9209e748499dcb8915769e3a6`
- **Latest approved business milestone:** Step 2C.5B
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

Step 2C.3C-B7 is owner accepted and merged through PR `#11` at `73f41e88a5d1016e2cdd586991765d992a513416`. Its implementation head is `851b85b3d685ae1304466dc5baecadc87bcd1b90`, Frontend CI run #17 passed on that exact head, and the accepted full regression was 21 files / 174 tests PASS. No production deployment or WordPress/backend change occurred.

Step 2C.3C cumulative closure is owner accepted and merged through PR `#12` at `4f306733b3e45bee4244688186e5ecae570fcb8b` using a normal merge commit. Its accepted closure head is `847b0c3f067d9af4f00591c3554a7a693a646017`, Frontend CI run #21 passed on that exact head, and the accepted full regression was 22 files / 183 tests PASS. No production deployment or WordPress/backend change occurred.

Step 2C.3D Content Readiness is owner accepted and merged through PR `#13` at `1cfab49f113acca5a1866e225f8b5b64a5fcb926`. Its accepted correction/head is `73bec8e671a53c1abb5396ed945785162b71b5da`, Frontend CI run #25 passed on that exact head, and the accepted full regression was 23 files / 196 tests PASS. The audit inspected all five tenants read-only, kept existing editorial/project records non-authoritative without explicit approval, and recorded no WordPress mutation, deletion, backend change, production UI change, or deployment.

Step 2C.4 Production Design & Data Contract Audit is owner accepted and merged through PR `#14` at `710eec3cf90e1a7d707860f9ee73d0abf283019c`. Its accepted correction/head is `a4d8945bf5b83e304b1b0fb434eb7441ea243849`, Frontend CI run #29 passed on that exact head, and the accepted full regression was 24 files / 204 tests PASS. It approved the reusable page architecture, independent branch-tenant invariant, canonical public production topology, 11 BLOCKING / 5 NONBLOCKING design/data gaps, and a non-destructive 15-action CMS correction manifest. No WordPress mutation, deployment, backend runtime change, generated GraphQL change, or production UI implementation occurred.

Step 2C.5A CMS Preflight & Remediation Plan is owner accepted and merged through PR `#15` at `f0d0974a75ac49a9c4fd88f0f229fa28a209acfd` using a normal two-parent merge. Its accepted correction/head is `bb6cca02bd97524182e2d53628c5ea9567228ee4`, Frontend CI run #32 passed on that exact head, and the accepted full regression was 25 files / 218 tests PASS. It revalidated all five tenants, retained 12 BLOCKING / 3 DEFERRED / 0 DESTRUCTIVE / 0 AUTHORIZED CMS actions, and defined non-executed remediation and rollback plans. No WordPress mutation, backup/export/restore execution, deletion, backend change, production UI work, Step 3, or deployment occurred.

Step 2C.5B CMS Mutation Readiness & Backup Gate is owner accepted and merged through PR `#16` at `2bd4991f75a53ab9209e748499dcb8915769e3a6` using a normal two-parent merge. Its accepted correction/head is `4afad259dd4c184de5b61ca51f91fcde7222cbf2`, Frontend CI run #35 passed on that exact head, and the accepted full regression was 26 files / 252 tests PASS. The plan remains operationally `BLOCKED_BY_BACKUP_EVIDENCE`; CMS and Batch A mutation authorization remain closed. No WordPress mutation, backup/export/restore execution, taxonomy deletion, backend change, production UI work, Step 2C.5C, Step 3, or deployment occurred.

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
- Step 2C.3C-B7 generated native project-single contract with bounded detail relationships
- Step 2C.3C-B7 owner acceptance, Frontend CI, and merge through PR `#11` at `73f41e8`
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

## Current Step 2C.5B readiness policy

Step 2C.5A is accepted and merged. Step 2C.5B prepares—but does not authorize or execute—the first future mutation window. Its Batch A scope is only CMS-2C4-001 Group identity, CMS-2C4-002 Healthcare identity, and CMS-2C4-006 creation of four exact tenant-local Business Unit terms. Business Unit assignments, Group taxonomy mutation, taxonomy deletion, backup/export/restore execution, content mutation, backend work, production UI, Step 3, Step 2C.5C, and deployment are excluded.

Fresh read-only evidence on 2026-08-15 inspected 5/5 tenants. Both identity actions and all four term scopes remain `VALIDATED_UNCHANGED`; the expected branch terms are absent with zero equivalent collisions and untruncated connections; Group terms match the accepted Step 2C.5A baseline and remain non-targets. No Batch A drift was detected.

The Step 2C.5B readiness plan is owner accepted and merged through PR `#16`. Operational mutation readiness remains `BLOCKED_BY_BACKUP_EVIDENCE` and requires human administrator action. RB-001 network backup evidence and RB-009 restore validation evidence are UNKNOWN, and the exact current live administrative coordinates are not independently confirmed. The repository backend provides only `STRONGLY_INFERRED` candidate WordPress Admin coordinates because SOT-001 keeps that runtime tree non-authoritative. Plan acceptance and Batch A mutation authorization remain separate gates: `step2c5bAccepted=true`, `batchAMutationAuthorized=false`, and CMS mutation authorization remains `NOT_GRANTED`.

The owner-approved canonical public production apex is `siratrgroup.com`; the branch public hostnames are `consulting.siratrgroup.com`, `healthcare.siratrgroup.com`, `lifestyle.siratrgroup.com`, and `realestate.siratrgroup.com`. This decision applies only to public production hostnames. WordPress backend, GraphQL, media, staging, Vercel preview, cookie-domain, CORS, and revalidation origins/policies remain UNKNOWN until repository or live configuration evidence establishes them. Public-domain selection is resolved without changing the Step 2C.4 gap counts: 11 BLOCKING and 5 NONBLOCKING. `2C4-B07` and `2C4-B10` remain BLOCKING.

Required delivery flow:

`main` -> focused feature branch -> implementation -> local validation -> PR -> Frontend CI -> architecture/security/diff review -> owner approval -> merge.

Do not merge automatically.

## Open source-of-truth conflict

### SOT-001 — backend repository freshness

**Status: OPEN / BLOCKING FOR NEW BACKEND RUNTIME CHANGES**

The current GitHub backend source contains Step 1-era material that is not yet proven to be the latest cumulative backend implementation, while the verified live schema adopted in Step 2C.3B contains later contract work.

Do not modify backend runtime code until the latest verified cumulative backend source is reconciled into Git or an explicit evidence-backed decision establishes the correct backend source of truth.

This conflict does **not** block the read-only Step 2C.5B preflight and readiness planning based on verified live public evidence. It prevents candidate backend/admin registration coordinates from being treated as confirmed live mutation coordinates and blocks any new backend runtime correction; newly discovered schema defects must be marked `BLOCKED_BY_SOT_001`.

## Next stages

After Step 2C.5B owner acceptance of the readiness plan:

1. **Human backup/admin evidence gate**
   - provide RB-001/RB-002/RB-009 evidence and confirm exact live admin coordinates without saving;
   - rerun the same-window read-only Batch A preflight and stop on drift.
2. **Step 2C.5C — separately authorized Batch A execution**
   - may begin only after a new explicit mutation authorization identifies the exact manifest, operator, evidence package, and window;
   - preserve every existing record and prohibit taxonomy deletion unless separately authorized.
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
