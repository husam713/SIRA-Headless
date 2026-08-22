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

## Current authoritative repository baseline

- Repository: `husam713/SIRA-Headless`
- Canonical integration/default branch: `main`
- Repository HEAD rule: obtain the current commit from Git; recorded snapshot coordinates are provenance, not an eternally current HEAD
- PR `#31` reconciliation status: OWNER ACCEPTED / MERGED
- PR `#31` reconciliation starting baseline: `aaa88631c862d213f890d2991aa63fd26ce925e3`
- PR `#31` accepted candidate: `daf7479114f4faba3fa736ee957e03a8d207d49e`
- PR `#31` merge / state verified-through coordinate: `85b749da5a7769a48e67b22685db904607e0a388`
- Latest accepted governance milestone: Step 4 Editorial Architecture / ADR-028
- Accepted PR / candidate head / merge: `#30` / `e37570f8e7a2b28eb0d55a903f79eb19687be9a3` / `aaa88631c862d213f890d2991aa63fd26ce925e3`
- Historical CMS mutation-readiness baseline: Step 2C.5B at `2bd4991f75a53ab9209e748499dcb8915769e3a6`
- Approved tag: `step-2c3b-approved`
- Checked-in canonical live schema: `frontend/schema/wpgraphql.graphql`
- Group audit schema: `frontend/schema/wpgraphql.group.graphql`
- Metadata: `frontend/schema/wpgraphql.meta.json`
- Compatibility evidence: `frontend/schema/wpgraphql.compatibility.json`

The canonical live metadata records Consulting as canonical, four exact branch
peers, and Group as a structural superset. Repository history after the
Step 2C.5B business baseline proves accepted Step 3A, Step 3B, Step 3C.1,
Step 3C.2, Step 3D.1, the Homepage Production Data Contract, the Step 4 Exact
Design Fidelity Charter, and ADR-028. Step 3D.2 is NOT STARTED, Step 3D.3 is
gated by `2C4-B09`, and full Step 3D closure must not be claimed. Step 4 visual
implementation is NOT STARTED and no prototype or production UI increment is
authorized.

The separate Step 2C.5B CMS readiness plan remains
`BLOCKED_BY_BACKUP_EVIDENCE`; CMS mutation authorization is `NOT_GRANTED`,
Batch A mutation authorization is false, and no backup, export, restore,
taxonomy deletion, CMS mutation, Step 2C.5C, or deployment is authorized.

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

PR `#31` current-state reconciliation is owner accepted and merged. No
subsequent governance or implementation task is authorized by that merge. The
owner has separately authorized the SIRA AI Engineering OS governance
foundation limited to documentation, reusable templates, and JSON Schemas.
Validator or CI enforcement and product/runtime work remain NOT AUTHORIZED.
Program Control or the owner must separately authorize any later task.
Prototype and production UI implementation also remain NOT AUTHORIZED.

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
