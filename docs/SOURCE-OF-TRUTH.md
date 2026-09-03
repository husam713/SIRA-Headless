# SIRA Source of Truth

This file is the SIRA project-specific source, state, and conflict registry. It
identifies authoritative source locations, durable state carriers, historical
evidence, and known conflict coordinates.

Evidence precedence between source types is governed exclusively by the
[SIRA AI Engineering Operating Protocol](./AI-ENGINEERING-OPERATING-PROTOCOL.md).
If this file and the Operating Protocol appear to disagree about evidence
precedence, the Operating Protocol governs the precedence model. This registry
applies that model to SIRA-specific evidence; it does not define a separate
hierarchy.

A later verified artifact may temporarily supersede repository source for a
specific subsystem only as permitted by the Operating Protocol. Such a
discrepancy must be recorded here and reconciled before new changes are made
to that subsystem.

## Agent instruction sources

- `AGENTS.md` — the engineering operating rules, and the entry point for agents
  that do not auto-load a platform-specific file.
- `docs/AI-ENGINEERING-OPERATING-PROTOCOL.md` — the normative protocol
  identified by `docs/AI-ENGINEERING-OS.md`. It alone governs evidence
  precedence.
- `templates/ai/BOOT-PROTOCOL.md` — the boot/recovery sequence.
- `CLAUDE.md` — **a platform-specific bootstrap adapter, not a source of
  authority.** Claude Code auto-loads `CLAUDE.md` and does not auto-load
  `AGENTS.md`, so this file exists solely to direct such a session into
  `AGENTS.md` and the boot protocol above. It defines no protocol and grants no
  authorization. If it conflicts with any document in this registry, that
  document governs and `CLAUDE.md` is corrected.

## Current authoritative repository baseline

- Repository: `husam713/SIRA-Headless`
- Canonical integration/default branch: `main`
- Repository HEAD rule: obtain the current commit from Git; recorded snapshot coordinates are provenance, not an eternally current HEAD
- PR `#31` reconciliation status: OWNER ACCEPTED / MERGED
- PR `#31` reconciliation starting baseline: `aaa88631c862d213f890d2991aa63fd26ce925e3`
- PR `#31` accepted candidate: `daf7479114f4faba3fa736ee957e03a8d207d49e`
- PR `#31` merge / state verified-through coordinate: `85b749da5a7769a48e67b22685db904607e0a388`
- Latest accepted architecture milestone: Step 4 Responsive Composition Architecture / ADR-029, owner accepted after implementation on 2026-09-02 through the PR `#48` comment, recorded against merge `4f8c8d87`
- Preceding canonical architecture decision: Step 4 Editorial Architecture / ADR-028; ADR-029 implements ADR-028 §4 and §10 and does not supersede it
- Latest accepted product/design governance milestone: Step 4 Editorial Architecture / ADR-028
- Accepted PR / candidate head / merge: `#30` / `e37570f8e7a2b28eb0d55a903f79eb19687be9a3` / `aaa88631c862d213f890d2991aa63fd26ce925e3`
- AI Engineering OS Governance Foundation: PR `#33`, authorization `OWNER_AUTHORIZED`, implementation complete, independent verification passed, merge complete, post-merge verified, canonical
- Governance Foundation candidate / canonical merge provenance: `4c695a0e3c9950b5ec6ede35ca836c5532814cc1` / `009bbfdb64cb38b2ddacbb1e7b8884eb614c47aa`
- Acceptance-Gates current-state maintenance: PR `#34`, closed / post-merge verified / canonical
- Acceptance-Gates candidate / canonical merge provenance: `3ca656a3eaa84fc076d1cd6fe4677a2e461cca68` / `86581d46b07a7b971cd2de44b476e1ac0b25bfee`
- Historical CMS mutation-readiness baseline: Step 2C.5B at `2bd4991f75a53ab9209e748499dcb8915769e3a6`
- Approved tag: `step-2c3b-approved`
- Checked-in canonical live schema: `frontend/schema/wpgraphql.graphql`
- Group audit schema: `frontend/schema/wpgraphql.group.graphql`
- Metadata: `frontend/schema/wpgraphql.meta.json`
- Compatibility evidence: `frontend/schema/wpgraphql.compatibility.json`

The PR `#33` and PR `#34` SHAs above are historical/provenance coordinates.
They do not represent an eternally current repository HEAD. Current HEAD is
always discovered from Git.

The canonical live metadata records Consulting as canonical, four exact branch
peers, and Group as a structural superset. Repository history after the
Step 2C.5B business baseline proves accepted Step 3A, Step 3B, Step 3C.1,
Step 3C.2, Step 3D.1, the Homepage Production Data Contract, the Step 4 Exact
Design Fidelity Charter, and ADR-028. Step 3D.2 is NOT STARTED, Step 3D.3 is
gated by `2C4-B09`, and full Step 3D closure must not be claimed. Step 4 visual
implementation is IN PROGRESS. The Group homepage hero, Latest Updates,
Companies, Investor Relations, and About sections merged through PRs `#36`,
`#38`, `#40`, and `#41`. The shared shell, remaining Group sections, and the
branch homepage merged through PR `#44` at `1078155c`. Shared responsive layout
primitives reached `main` through PRs `#47` and `#48`. CMS and menu enablement
reached `main` through PRs `#49` to `#53`. Durable-state reconciliation and the
alignment harness gate reached `main` through PR `#55` at `70bd8618`, and the
`CLAUDE.md` bootstrap adapter through PR `#56` at `dddf9b30`. ADR-029 owner
acceptance was recorded through PR `#57` at `4da63260`, and tolerance of partial
GraphQL homepage data, with the homepage fixture harness, through PR `#58` at
`e829696e`. Step 4 sequence items G to J, the branch variant validation for
Healthcare, Consulting, Lifestyle and Real Estate against the shared
BranchHomepage, reached `main` through PR `#59` at `e3920919`, together with the
per-viewport visual capture tooling. Newsroom route work remains NOT STARTED.

Acceptance evidence differs per pull request and must not be generalized. For
PRs `#44`, `#46`, `#47`, and `#49` to `#53`, the conversation threads were
inspected on 2026-09-02 and carry no owner-acceptance artifact, so the merge
commit is the only acceptance-relevant artifact. PR `#48` carries an owner
comment accepting the ADR-029 architecture decision only; that comment
explicitly does not accept every PR `#47`/`#48` implementation detail and does
not establish L-O responsive, RTL, reduced-motion, accessibility, or
visual-regression completion. PRs `#55`, `#56`, `#57`, `#58`, and `#59` carry
owner-acceptance comments at their exact reviewed candidate heads. PR `#57`
additionally records independent read-only verification G3 APPROVE and a passing
Frontend CI run at its accepted head `87ca6b8c`; PR `#58` is accepted at
`23b4af88` and its acceptance explicitly does not establish production visual
acceptance, live CMS validation, `verify:alignment`, or L-O QA. PR `#59` is
accepted at `219ed48c`, covers G to J branch variant validation only, and
records an independent review returning APPROVE with Frontend CI run
33701056508 passing at that head. None of them authorizes any follow-on task. A merge alone is still not
evidence of owner acceptance, and a `recordedReviews` count of 0 states only
that no formal GitHub Review object was submitted — it does not establish
absence of acceptance evidence. See the per-pull-request record in
`project-state.json` and the historical SOT-002 record below, which is preserved
as written and describes what was open at the time it was made.

The separate Step 2C.5B CMS readiness plan remains
`BLOCKED_BY_BACKUP_EVIDENCE`; CMS mutation authorization is `NOT_GRANTED`,
Batch A mutation authorization is false, and no backup, export, restore,
taxonomy deletion, CMS mutation, Step 2C.5C, or deployment is authorized.

## Current AI Engineering OS governance state

The AI Engineering OS Governance Foundation is canonical governance history.
Its dimensions are intentionally separate:

- authorization state: `OWNER_AUTHORIZED`;
- implementation state: completed;
- independent verification: passed;
- merge state: merged;
- post-merge verification: passed;
- Canonicality: true.

Authorization is preserved as a distinct fact and must not be used as shorthand
for the Foundation's full current lifecycle state.

The canonical implementation model is one logical role, `IMPLEMENTATION`, with
execution profile `LOCAL` or `CLOUD_GITHUB`. Program Control selects the
least-complex profile that can satisfy the task's required evidence,
validation, security, and mutation requirements. Profile names do not create a
second authority hierarchy; the normative evidence and role semantics remain
exclusively in `docs/AI-ENGINEERING-OPERATING-PROTOCOL.md`.

Validator/CI enforcement and AI Engineering OS product/runtime work remain
`NOT_AUTHORIZED`. No accepted governance merge automatically authorizes a
subsequent task.

## Current CMS mutation-track evidence authority

Step 2C.5B uses fresh read-only public GraphQL evidence derived through the trusted SiteKey registry, accepted Step 2C.5A artifacts, and repository evidence for planning only. The fresh 2026-08-15 preflight inspected all five tenants and found the bounded Batch A coordinates `VALIDATED_UNCHANGED`: Group and Healthcare identities retain their accepted current values; the four exact branch-local Business Unit terms remain absent without collision or truncation; Group terms remain non-targets and match the accepted baseline.

Candidate WordPress Admin coordinates recorded in the repository backend are now based on the reconciled verified LIVE / Step 2C.2F source after PR #18. They remain source-derived candidates rather than independently confirmed effective live administrative coordinates: exact protected live routes, capabilities, field coordinates, and taxonomy-screen coordinates remain UNKNOWN until human read-only confirmation. RB-001 backup evidence and RB-009 restore evidence also remain UNKNOWN. The Step 2C.5B readiness plan is owner accepted and merged through PR #16, while the operational package status remains REQUIRES_HUMAN_ADMIN_ACTION and mutation readiness remains BLOCKED_BY_BACKUP_EVIDENCE. step2c5bAccepted=true does not authorize Batch A: batchAMutationAuthorized=false, CMS mutation authorization is NOT_GRANTED, and no CMS mutation, backup/export/restore execution, deletion, Step 2C.5C, production UI, or deployment is authorized.

## Current Step 4 design governance

PR `#29` and merge `e522c6c58cd57e2a757652adb740c9d1f154c81c`
established the owner-accepted Step 4 Exact Design Fidelity Charter. PR `#30`
and merge `aaa88631c862d213f890d2991aa63fd26ce925e3` then approved ADR-028 and the
SIRA Editorial Architecture specification.

The charter remains authoritative for application architecture, CMS and data
ownership, tenant isolation, Server/Client boundaries, accessibility, RTL,
media, forms, SEO/preview, staging, validation, production authorization, and
incremental owner gates. ADR-028 supersedes only conflicting visual,
art-direction, composition, and literal-fidelity constraints. The seven
approved `.dc.html` files remain design evidence, SIRA design DNA, and
visual/interaction references; they are not production runtime dependencies.

ADR-029 is the current accepted architecture decision for Step 4 responsive
composition and shared layout primitives. The owner accepted it on 2026-09-02
through the PR `#48` comment, after the implementing increments merged through
PRs `#47` and `#48` at `4f8c8d87`; that chronology is preserved history. The
acceptance covers the architecture decision only: it does not accept every
implementation detail of those PRs, does not establish L-O QA completion, and
does not supersede ADR-028, which it implements at §4 and §10.

Current presentation direction is approved `.dc` design DNA plus Editorial
Fluidity, stronger Architectural Modernism, Adaptive Modular Components, and
Modern Web Platform First. This governance acceptance does not authorize a
prototype, production UI implementation, staging, deployment, DNS, or cutover.

## Current unresolved gates

- `2C4-B07` media origin/delivery: UNRESOLVED / DEFERRED.
- `2C4-B08` forms architecture: UNRESOLVED.
- `2C4-B09` multilingual architecture: UNRESOLVED.
- `PREVIEW-AUTH-001`: DEFERRED.
- External Group staging: NOT PROVISIONED / NOT AUTHORIZED.
- Production deployment, DNS, Group cutover, and legacy Group destruction: NOT AUTHORIZED.
- CMS mutation and Step 2C.5C: NOT AUTHORIZED.

PR `#31` current-state reconciliation, PR `#33` AI Engineering OS Governance
Foundation, and PR `#34` Acceptance-Gates maintenance are accepted canonical
governance history. None of those merges grants authority for a later task.
Program Control or the owner must separately authorize subsequent mutation,
validator/CI enforcement, product/runtime work, prototype or production UI,
WordPress mutation, external staging, deployment, DNS, or production cutover.

## Canonical public production topology

The owner-approved public production apex is `siratrgroup.com`. The authoritative public hostname mapping is Group -> `siratrgroup.com`, Consulting -> `consulting.siratrgroup.com`, Healthcare -> `healthcare.siratrgroup.com`, Lifestyle -> `lifestyle.siratrgroup.com`, and Real Estate -> `realestate.siratrgroup.com`.

This is public-domain evidence only. It must not be used to infer WordPress backend, GraphQL endpoint, media origin, staging, Vercel preview, cookie-domain, CORS, or revalidation configuration. Those remain UNKNOWN until repository or live configuration evidence establishes them. Each branch hostname represents an independent WordPress Multisite tenant website and independent content/runtime/cache scope; only the tested React/Next.js `BranchHomepage` architecture is shared.

## Current backend source status

### SOT-001 — CLOSED

The backend source-of-truth conflict has been resolved.

Independent reconciliation evidence established that the previously checked-in backend was REPOSITORY_BACKEND_OLDER than the currently installed LIVE sira-core source. The owner-exported LIVE plugin was an exact content match for the preserved Step 2C.2F artifact.

PR #18 reconciled backend/ to the verified source:

- implementation head: 7869ae3530a8349980b01f31e3d749b292d2f63c
- merge commit: 5a2d7855590de6fe0b12d5cf48777d7856c9f491
- artifact ZIP SHA-256: 571bae5eb39032755dd1c9fe1cacc4113ee409da07826c008cd152698987c76f
- normalized tree SHA-256: cb029a935d6d022ab2d6067e8951b04ba57562d9ff5f1609cc1e547622c826f4
- WordPress mutation during reconciliation: false

The repository backend is therefore authoritative for the verified LIVE / Step 2C.2F source baseline.

This closure removes only the SOT-001 backend-freshness blocker. Backend work still requires normal stage authorization and review. This closure does not establish exact effective live WordPress Admin coordinates and does not change mutationReadiness=BLOCKED_BY_BACKUP_EVIDENCE, CMS mutation authorization, Batch A authorization, backup/export/restore authorization, production authorization, Step 2C.5C status, Step 3 status, or deployment status.

Known separate observation: backend source declares SiraProjectDetails while the accepted frontend/live GraphQL schema exposes ProjectDetails. The mechanism remains UNKNOWN; no speculative backend change is authorized by this closure.

## Current frontend implementation status

### SOT-002 — durable-state implementation drift

**Status: CLOSED**

The durable-state carriers asserted that Step 4 visual implementation was NOT
STARTED and that no prototype or production UI increment was authorized. Git
evidence disproved this on all three counts:

- `main` contains owner-accepted merged Group homepage sections through PR `#36`
  (`59f74f72016585bc34809deb6e23a48ae098b207`), PR `#38`
  (`41fe34b47e2ce6141ebc282300689d4787bf473a`), PR `#40`
  (`24f016ada7bfc35aadb722b44a16074e95a789cb`), and PR `#41`
  (`ce8c22925127e51a036a19ef469ff06db88ee62e`);
- PR `#44` carries a further open, unaccepted increment implementing the shared
  site shell, the remaining Group sections, and the branch homepage;
- an art-direction prototype exists under `frontend/prototypes/step-4-art-direction/`.

Per the conflict protocol, repository/Git evidence governs implementation state.
The carriers are reconciled to Git. No contract-locked CMS-track coordinate was
changed: `currentStage`, `currentSubstage`, `executionBranch`,
`executionBaseline`, `latestAcceptedIncrement`, `latestRepositoryReconciliation`,
`groupStagingStrategy`, and the Step 2C.5B authorization flags are untouched, and
the full contract suite passes unchanged.

This closure records implementation history only. It does not authorize merge of
PR `#44`, production deployment, DNS, Group cutover, CMS mutation, or any
subsequent increment. The prototype remains NON-PRODUCTION reference evidence.

## Historical / reference-only sources

The following are migration archaeology/reference material unless explicitly re-promoted after verification:

- original `sira-enterprise-wordpress-bundle.zip`;
- original `sira-core.zip`;
- original `sira-bricks-child.zip`;
- legacy Bricks exports and `.dc.html` runtime files;
- early setup/recovery conversation transcripts.

They may explain intent and history but must not override later verified Git/live evidence.

## Conflict protocol

When sources conflict:

1. stop changes to the affected subsystem;
2. identify both sources and their stage/timestamp/evidence level;
3. classify each claim as CONFIRMED, STRONGLY INFERRED, or UNKNOWN;
4. apply the Operating Protocol's normative evidence-authority hierarchy;
5. record the decision in `docs/DECISIONS.md` if architectural;
6. update this file and `PROJECT-STATE.md` after reconciliation;
7. preserve rollback evidence.
