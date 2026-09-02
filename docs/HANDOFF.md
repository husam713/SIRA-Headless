# SIRA Engineering Handoff

Use this file when opening a new ChatGPT/Codex session or handing the project to another engineer.

## Read first

1. `/AGENTS.md`
2. `/docs/AI-ENGINEERING-OS.md`
3. `/docs/AI-ENGINEERING-OPERATING-PROTOCOL.md`
4. `/project-state.json`
5. `/docs/PROJECT-STATE.md`
6. `/docs/SOURCE-OF-TRUTH.md`
7. relevant entries in `/docs/DECISIONS.md`
8. `/docs/adr/ADR-025-GROUP-STAGING-FIRST.md`
9. `/docs/SIRA-EDITORIAL-ARCHITECTURE-SPEC.md`

Then reconcile them against Git before editing.

## Repository

- Repository: `husam713/SIRA-Headless`
- Canonical integration/default branch: `main`
- Current repository HEAD: verify from Git; do not infer it from a recorded state snapshot
- PR `#31` reconciliation starting baseline: `aaa88631c862d213f890d2991aa63fd26ce925e3`
- PR `#31` accepted candidate: `daf7479114f4faba3fa736ee957e03a8d207d49e`
- PR `#31` merge / state verified-through coordinate: `85b749da5a7769a48e67b22685db904607e0a388`
- PR `#31` reconciliation status: OWNER ACCEPTED / MERGED
- Latest accepted architecture milestone: Step 4 Responsive Composition Architecture / ADR-029, owner accepted after implementation on 2026-09-02 through the PR `#48` comment
- Preceding canonical architecture decision: Step 4 Editorial Architecture / ADR-028 through PR `#30`; ADR-029 implements ADR-028 §4 and §10 and does not supersede it
- AI Engineering OS Governance Foundation: PR `#33`, owner authorized, implementation completed, independently verified, merged, post-merge verified, canonical
- Governance Foundation candidate / merge provenance: `4c695a0e3c9950b5ec6ede35ca836c5532814cc1` / `009bbfdb64cb38b2ddacbb1e7b8884eb614c47aa`
- Acceptance-Gates current-state maintenance: PR `#34`, closed / post-merge verified / canonical
- Acceptance-Gates candidate / merge provenance: `3ca656a3eaa84fc076d1cd6fe4677a2e461cca68` / `86581d46b07a7b971cd2de44b476e1ac0b25bfee`
- Historical SOT-001 state-reconciliation merge: `e20858b055e556065e96623205fa0d5774ad81d6`
- Latest accepted CMS mutation-readiness milestone: Step 2C.5B
- Latest approved tag: `step-2c3b-approved`
- SOT-001 backend source conflict: CLOSED through PR #18/#19 reconciliation

All recorded merge SHAs above are historical/provenance coordinates. Discover
current HEAD from Git.

## AI Engineering OS execution model

There is one logical mutation-capable role:

`IMPLEMENTATION`

It uses one execution profile:

- `LOCAL`
- `CLOUD_GITHUB`

Program Control selects the least-complex profile that can satisfy the task's
required evidence, validation, security, and mutation requirements. Do not ask
the owner to choose an environment when those requirements already determine
the profile.

`LOCAL` is used when task correctness materially depends on local-only
filesystem/working-tree/protected evidence, local generation/debugging,
browser/runtime testing, or local dev-environment interaction.

`CLOUD_GITHUB` is sufficient when required implementation/evidence is fully
repository/GitHub-visible. A cloud implementation agent must classify local-only
facts as `REPORT_ONLY` or `NOT_VERIFIED_BY_THIS_AGENT` and must never fabricate
local state.

Execution profile does not change Task Packet authority, independent-review
requirements, owner gates, or Canonicality.

## Current state

Step 2C.5B is owner accepted and merged. Its CMS mutation track remains operationally `BLOCKED_BY_BACKUP_EVIDENCE`; CMS mutation authorization is `NOT_GRANTED`, Batch A mutation authorization is false, and RB-001/RB-009 execution evidence remains unavailable.

The repository/frontend track has accepted Step 3A, Step 3B, Step 3C.1,
Step 3C.2, and Step 3D.1. Step 3D.2 is NOT STARTED, Step 3D.3 remains gated
by `2C4-B09`, `PREVIEW-AUTH-001` remains DEFERRED, and full Step 3D closure
must not be claimed.

The Homepage Production Data Contract, Step 4 Exact Design Fidelity Charter,
and ADR-028 Editorial Architecture are recorded as owner accepted and merged.

Step 4 visual implementation is IN PROGRESS. It is not NOT STARTED. Git
evidence on `main`: Group homepage sections merged through PRs `#36`, `#38`,
`#40`, `#41`; the shared site header/mobile-menu/footer shell and the branch
homepage merged through PR `#44` at `1078155c`; the shared responsive layout
primitives merged through PRs `#47` and `#48` at `4f8c8d87`; and CMS/menu
enablement merged through PRs `#49`, `#50`, `#51`, `#52`, `#53`; durable-state
reconciliation and the alignment harness gate merged through PR `#55` at
`70bd8618`; and the `CLAUDE.md` bootstrap adapter through PR `#56` at
`dddf9b30`, with `main` at `dddf9b30` when this was reconciled. ADR-029, which
governs the responsive foundation, is owner accepted as of 2026-09-02 through
the PR `#48` comment; acceptance was recorded after implementation and merge,
covers the architecture decision only, and grants no downstream authority.
Prototype and production UI implementation are AUTHORIZED: `project-state.json` records
`authorization.prototypeImplementationAuthorized` and
`authorization.productionUiImplementationAuthorized` as `true`.

Newsroom visual/route work remains NOT STARTED. No newsroom route, component,
or query exists under `frontend/src`.

Acceptance evidence. It differs per pull request and must not be generalized.
For PRs `#44`, `#46`, `#47`, and `#49` through `#53` the merge commit is the
only acceptance-relevant artifact; the threads were inspected on 2026-09-02 and
carry no owner-acceptance artifact. PR `#48` carries an owner comment accepting
the ADR-029 architecture decision only, which explicitly does not accept every
PR `#47`/`#48` implementation detail and does not establish L-O QA completion.
PRs `#55` and `#56` carry owner-acceptance comments at their exact reviewed
candidate heads. Where this file or `docs/PROJECT-STATE.md` states owner
acceptance without such an artifact, that is asserted by a durable document and
is not independently verified. A merge is not by itself evidence of owner
acceptance.

The AI Engineering OS Governance Foundation is already canonical. Preserve its
owner authorization as the authorization dimension, while representing its
lifecycle separately as implementation completed, independent verification
passed, merged, post-merge verified, and canonical. Validator/CI enforcement
and AI Engineering OS product/runtime work remain NOT AUTHORIZED.

## New owner decision — Group staging first

The replacement public Group frontend for `siratrgroup.com` must be developed, integrated, QA'd, and owner-accepted on staging before production cutover.

Until a real staging hostname is human-confirmed, use only the placeholder `GROUP_STAGING_HOST`.

The accepted deployment model is the same Git commit and same Next.js application/site identity for staging and later production, with environment-specific hostname/configuration. Do not create a separate React implementation for staging.

The existing public Group site remains live during replacement development and remains the immediate rollback target through an owner-approved stabilization period. Do not destroy or uninstall it as a launch prerequisite.

This decision changes only Group public frontend implementation/cutover strategy. It does not rebuild WordPress Multisite, create a new database, redesign the four branch tenants, or authorize a separate staging CMS copy.

## Branch sites remain unchanged

Consulting, Healthcare, Lifestyle, and Real Estate remain independent WordPress Multisite tenants using the established shared React/Next.js implementation architecture. Group staging does not merge their pages, menus, content, media, SEO state, cache state, or editorial authority.

## Do not restart

Do not restart or redesign without newer repository evidence:

- WordPress Multisite architecture;
- `sira-core` backend ownership;
- WPGraphQL primary API;
- generated frontend contracts;
- Next.js App Router multi-brand foundation;
- hostname/site registry;
- tenant isolation;
- caching/revalidation architecture;
- Step 2C.3A/2C.3B schema compatibility/adoption;
- Step 2C.3C typed frontend contracts;
- Step 2C.3D content-readiness audit;
- Step 2C.4 production design/data-contract audit;
- Step 2C.5A/2C.5B historical CMS readiness evidence.

Historical Step 2C.5A/2C.5B artifacts remain historical and must not be rewritten to pretend the new staging decision existed when they were created.

## Non-durable terminology

Do not treat the following as project phases or as approved scope.

- **"Phase 3.5"** — Not a durable project phase. It appears only in the body
  text of GitHub pull request `#48`, written by the implementing agent, and is
  marked there "blocked on owner decision". It appears nowhere in this
  repository. Individual behaviors proposed under that label require
  traceability to an approved charter requirement or an explicit owner
  decision.
- **"Step 4 Phase 1-4"** — these labels exist only in commit subjects and two
  source comments. There is no Phase 0, and the numbering does not map onto any
  approved plan. The approved sequence is the A-to-O list in
  `docs/STEP-4-EXACT-DESIGN-FIDELITY-IMPLEMENTATION.md` section 20.

A behavior proposed in a pull request description has not been approved by
being merged alongside other work.

## Durable terminology — Layer C

**"Layer C" is durable architecture terminology, not a phase label.** It is
defined by the canonical ADR-028 editorial architecture specification:

- `docs/SIRA-EDITORIAL-ARCHITECTURE-SPEC.md` — "Layer C — Progressive premium
  enhancement";
- `docs/STEP-4-DESIGN-DIRECTION-RECONCILIATION.md` — the same definition, and
  the constraint below.

It means progressive premium enhancement.

Layer C must never be required for navigation, comprehension, accessibility,
forms, or core CTA behavior.

The existence of the Layer C category does not authorize implementing a
specific effect. Every specific effect still requires an approved Task Packet
or explicit owner-authorized scope.

## Acceptance evidence

Acceptance evidence is per pull request. Do not generalize it, and do not infer
owner acceptance from a merge, from GitHub state, from previous agent text, or
from the presence of an implementation in the repository.

- **No acceptance artifact — PRs `#44`, `#46`, `#47`, `#49`, `#50`, `#51`,
  `#52`, `#53`.** Threads inspected 2026-09-02. The merge commit is the only
  acceptance-relevant artifact. The owner comments on `#47`, `#49`, `#50`, and
  `#51` are supersession and findings-response notes, not acceptance.
- **Architecture acceptance only — PR `#48`.** An owner comment accepts the
  ADR-029 architecture decision. It explicitly does not accept every PR
  `#47`/`#48` implementation detail and does not establish responsive, RTL,
  reduced-motion, accessibility, or visual-regression (L-O) completion.
- **Candidate acceptance — PRs `#55`, `#56`.** Owner-acceptance comments at the
  exact reviewed candidate heads `ebece6d6` and `92538d93`.

A `recordedReviews` count of 0 states only that no formal GitHub Review object
was submitted. It does not establish absence of owner-acceptance evidence: pull
request conversation comments are durable acceptance evidence, as `#48`, `#55`,
and `#56` show. Review-object count and acceptance evidence are separate facts
and must be evaluated separately for each pull request.

This list is exact. Pull request `#45` is an unrelated open draft and is not
part of it.

## Architecture locks

- Consulting is the canonical branch GraphQL schema.
- Group may remain a structural superset.
- Frontend/shared GraphQL uses `ProjectDetails`.
- Use native WPGraphQL menus; do not create `siraNavigation`.
- Use native content connections; do not create `siraEditorialFeed` without a new evidence-backed ADR.
- Server Components by default.
- No Bricks or `.dc.html` runtime in production.
- Missing CMS data must not be hidden with frontend hardcoding.

Known separate observation: reconciled backend source declares `SiraProjectDetails` while the accepted frontend/live GraphQL schema exposes `ProjectDetails`; the mechanism remains UNKNOWN and must not be speculatively changed.

## RB-001 / RB-009 interpretation

Historical RB-001/RB-009 controls remain truthful evidence for direct production CMS/database mutation. They do not block repository engineering, Next.js implementation, Group frontend staging development, or staging QA.

Before final Group cutover, establish appropriate recovery controls for the actual cutover, including preservation of the legacy Group environment and an appropriate final recovery point where applicable. Do not mark historical RB requirements complete unless they actually occurred.

## Protected actions

Do not without explicit owner authorization:

- merge into `main`;
- provision external staging infrastructure;
- change production DNS/routing;
- replace `siratrgroup.com`;
- deploy production;
- destroy the legacy Group site;
- perform CMS/database mutations or destructive cleanup;
- delete taxonomy terms;
- rotate production secrets.

## Current next gate

PR `#31` reconciliation, PR `#33` AI Engineering OS Governance Foundation, and
PR `#34` Acceptance-Gates maintenance are accepted canonical governance
history. Their completion does not grant authority for a subsequent task.
Program Control or the owner must issue a new bounded authorization for any
later implementation or protected transition.

AI Engineering OS validator/CI enforcement, AI Engineering OS product/runtime
work, WordPress mutation, external staging, deployment, DNS, and production
cutover remain NOT AUTHORIZED. Prototype and production UI implementation are
no longer in this list: they are authorized, and Step 4 visual implementation
is in progress (see Current state). Owner acceptance of ADR-029 does not change
this list: it authorizes no subsequent task, and TP-STEP4-R1, Newsroom work, and
CB-2 each still require separate bounded authorization.

The AI Engineering OS validator/CI boundary in
`docs/AI-ENGINEERING-OS.md` concerns validators for the governance contracts
themselves. It does not cover frontend build, test, or layout-verification
tooling in `frontend/scripts`, which is ordinary frontend CI.

## Handoff completion format

Return:

- role and execution profile;
- branch;
- baseline;
- commit SHA;
- files changed;
- validations actually run and their results;
- local evidence limitations when using `CLOUD_GITHUB`;
- warnings/deferred checks;
- rollback point;
- unresolved source conflicts;
- next proposed stage;
- `CURRENT PROJECT STATE`.
