# SIRA Current Project State

State snapshot last verified through canonical Git evidence: 2026-08-22

## Current authoritative state

- **Canonical integration/default branch:** `main`
- **Repository HEAD rule:** discover the current commit from Git; snapshot coordinates below are provenance and must not be treated as an eternally current HEAD
- **PR #31 reconciliation status:** OWNER ACCEPTED / MERGED
- **Latest accepted governance milestone:** Step 4 Editorial Architecture / ADR-028, owner accepted and merged through PR `#30`
- **Repository/frontend state:** Step 4 governance accepted; production visual implementation NOT STARTED
- **CMS mutation track:** Step 2C.5B remains the accepted readiness milestone and is `BLOCKED_BY_BACKUP_EVIDENCE`
- **Current owner-authorized task:** SIRA AI Engineering OS governance foundation (documentation, templates, and JSON Schemas only)
- **AI Engineering OS enforcement/product boundary:** validator and CI enforcement, product/runtime work, prototypes, and production UI are NOT AUTHORIZED
- **Subsequent authorization boundary:** no later task is authorized without a separately issued Program Control or owner authorization
- **Latest approved tag:** `step-2c3b-approved`
- **Prototype implementation:** NOT AUTHORIZED
- **Production deployment:** NOT AUTHORIZED

PR `#31` preserves three distinct coordinates: reconciliation starting
baseline `aaa88631c862d213f890d2991aa63fd26ce925e3`, accepted candidate
`daf7479114f4faba3fa736ee957e03a8d207d49e`, and reconciliation merge / state
verified-through coordinate `85b749da5a7769a48e67b22685db904607e0a388`.
These are immutable provenance facts; the current repository HEAD may advance
and must be verified from Git.

The historical Step 2C.5B business/CMS execution baseline is
`2bd4991f75a53ab9209e748499dcb8915769e3a6`. It is not the current Git `main`
head. The CMS mutation and repository/frontend tracks remain deliberately
separate.

## Accepted repository milestones after Step 2C.5B

| Milestone | Status | PR | Accepted head / merge |
| --- | --- | ---: | --- |
| Group staging-first governance (ADR-025) | OWNER ACCEPTED / MERGED | `#20` | `0e4cfc4c518e1ef002cdceb82cc264e907f50192` / `54b6c6696347a03217134af18bc50c675435e42d` |
| Step 3A host/discovery boundary | OWNER ACCEPTED / MERGED | `#21` | `279b7343be923c72452e8724722e91dd9c318912` / `05c2cccc298f0a89a11181d9c49230bd10dfd9e1` |
| Step 3B metadata/robots/sitemap | OWNER ACCEPTED / MERGED | `#22` | `1273542d475a60510d020fbca80654349cd2217b` / `bf986e9ac04733789ee0d0c4c675a9215ad59380` |
| Step 3C.1 preview authentication foundation | OWNER ACCEPTED / MERGED | `#23` | `83404dc2832038577e8e391007758d408b0138d5` / `ceea65c865d0bcaa107d11dc5a0a55f84d392f06` |
| Step 3C.2 signed Preview Entry / Draft Mode | OWNER ACCEPTED / MERGED | `#24` | `bd7a111ade17717412d8d57c9faf41581d735bc3` / `1c89dd7931f0c2d0876a69f08e2d000bf3913563` |
| WPGraphQL Application Password fixes | MERGED | `#25`, `#26` | `1c28511eaf64404ce7670bb2bc4b8a3912b3b2a2`, `024e58d679e94e655945c1a07e5bed07d9a62800` |
| Step 3D.1 structured-data ownership | OWNER ACCEPTED / MERGED | `#27` | `9423ba38546f67ebbf1ed3b5c9f3328ed39fbb19` / `269a28cd1db15666aebc9cbe2f73c8718997fc30` |
| Homepage Production Data Contract | OWNER ACCEPTED / MERGED | `#28` | `ed0bf65b3da3862d2a16c16fd62061344c83d802` / `54b301f64687e59aa01dbe2695aaed6ce45db4c9` |
| Step 4 Exact Design Fidelity Charter | OWNER ACCEPTED / MERGED | `#29` | `18ada36bd180ca8d088e411851b83d242ff4c7c9` / `e522c6c58cd57e2a757652adb740c9d1f154c81c` |
| Step 4 Editorial Architecture / ADR-028 | OWNER ACCEPTED / MERGED / CANONICAL | `#30` | `e37570f8e7a2b28eb0d55a903f79eb19687be9a3` / `aaa88631c862d213f890d2991aa63fd26ce925e3` |
| Post-PR30 durable-state reconciliation | OWNER ACCEPTED / MERGED | `#31` | `daf7479114f4faba3fa736ee957e03a8d207d49e` / `85b749da5a7769a48e67b22685db904607e0a388` |

Step 3D.2 is NOT STARTED. Step 3D.3 remains gated by unresolved `2C4-B09`.
Full Step 3D closure must not be claimed. `PREVIEW-AUTH-001` remains DEFERRED.

## Historical accepted milestones through Step 2C.5B

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

The Step 2C.5B readiness plan is owner accepted and merged through PR #16. Operational mutation readiness remains BLOCKED_BY_BACKUP_EVIDENCE and requires human administrator action. RB-001 network backup evidence and RB-009 restore validation evidence are UNKNOWN, and the exact current live administrative coordinates are not independently confirmed. PR #18 reconciled the repository backend to the independently verified LIVE Step 2C.2F source, so SOT-001 no longer makes the repository backend stale. However, repository source registration alone does not prove the effective live WordPress Admin route, capability, field coordinates, or taxonomy screen coordinates; those remain subject to human read-only confirmation. Plan acceptance and Batch A mutation authorization remain separate gates: step2c5bAccepted=true, batchAMutationAuthorized=false, and CMS mutation authorization remains NOT_GRANTED.

The owner-approved canonical public production apex is `siratrgroup.com`; the branch public hostnames are `consulting.siratrgroup.com`, `healthcare.siratrgroup.com`, `lifestyle.siratrgroup.com`, and `realestate.siratrgroup.com`. This decision applies only to public production hostnames. WordPress backend, GraphQL, media, staging, Vercel preview, cookie-domain, CORS, and revalidation origins/policies remain UNKNOWN until repository or live configuration evidence establishes them. Public-domain selection is resolved without changing the Step 2C.4 gap counts: 11 BLOCKING and 5 NONBLOCKING. `2C4-B07` and `2C4-B10` remain BLOCKING.

Required delivery flow:

`main` -> focused feature branch -> implementation -> local validation -> PR -> Frontend CI -> architecture/security/diff review -> owner approval -> merge.

Do not merge automatically.

## Resolved source-of-truth conflict

### SOT-001 — backend repository freshness

**Status: CLOSED**

The repository backend was independently audited against the immutable LIVE / Step 2C.2F sira-core artifact. The audit classified the Git repository backend as REPOSITORY_BACKEND_OLDER, with no repository-only newer runtime implementation.

PR #18 reconciled backend/ to that verified source. Implementation head 7869ae3530a8349980b01f31e3d749b292d2f63c was merged normally to main as 5a2d7855590de6fe0b12d5cf48777d7856c9f491. The verified artifact ZIP SHA-256 is 571bae5eb39032755dd1c9fe1cacc4113ee409da07826c008cd152698987c76f and its normalized source-tree SHA-256 is cb029a935d6d022ab2d6067e8951b04ba57562d9ff5f1609cc1e547622c826f4.

SOT-001 closure means only that the Git repository now contains the independently verified LIVE / Step 2C.2F backend source. It does not confirm current live WordPress Admin coordinates, backup readiness, restore readiness, CMS mutation authorization, Batch A authorization, production authorization, Step 2C.5C, Step 3, or deployment.

Known separate observation: backend source declares SiraProjectDetails while the accepted frontend/live GraphQL schema exposes ProjectDetails. The mechanism remains UNKNOWN and is not silently changed by this reconciliation.
## Current open gates and next owner gate

- `2C4-B07` media-origin policy: UNRESOLVED / DEFERRED.
- `2C4-B08` forms architecture: UNRESOLVED.
- `2C4-B09` multilingual architecture: UNRESOLVED.
- `PREVIEW-AUTH-001`: DEFERRED.
- External Group staging: NOT PROVISIONED / NOT AUTHORIZED.
- CMS mutation and Step 2C.5C: NOT AUTHORIZED; the human backup/admin evidence gate remains required.
- Step 4 prototype and production UI implementation: NOT AUTHORIZED / NOT STARTED.
- Production deployment, DNS, Group cutover, and legacy Group destruction: NOT AUTHORIZED.

PR `#31` current-state reconciliation is owner accepted and merged. The
post-merge wording correction is governance maintenance and grants no product
or implementation authority. The owner has separately authorized the SIRA AI
Engineering OS governance foundation limited to documentation, reusable
templates, and JSON Schemas. Validator or CI enforcement and product/runtime
work remain NOT AUTHORIZED. No subsequent task is authorized by this record;
Program Control or the owner must issue separate authorization. Prototype and
production UI increments remain NOT AUTHORIZED.

## Owner/external decisions still protected

- merge into `main`;
- production merge/deployment;
- destructive WordPress changes;
- DNS/cutover;
- production secrets;
- multilingual production model;
- forms provider/storage/retention architecture.
