# SIRA Source of Truth

This file defines which evidence wins when project sources disagree.

## Trust order

1. **Executable/live evidence** relevant to the claim: runtime checks, live GraphQL/schema evidence, CI/test output.
2. **Current versioned repository source** for a subsystem, provided it has been reconciled with newer approved artifacts.
3. **Approved Git commits and tags.**
4. **Generated contracts** such as GraphQL schema snapshots and generated TypeScript types.
5. **Machine-readable validation artifacts** and approved decision records.
6. **Project-state documentation.**
7. **Approved specifications/design references.**
8. **Historical migration bundles and legacy source.**
9. **Conversation history.**
10. **Model inference** — never authoritative.

A later verified artifact may temporarily supersede repository source for a specific subsystem when Git is demonstrably stale. Such a discrepancy must be recorded here and reconciled before new changes are made to that subsystem.

## Current authoritative frontend baseline

- Repository: `husam713/SIRA-Headless`
- Canonical integration/default branch: `main`
- Current governed frontend baseline/head: `2bd4991f75a53ab9209e748499dcb8915769e3a6`
- Latest accepted increment: Step 2C.5B CMS Mutation Readiness & Backup Gate
- Audit PR / correction head / merge: `#16` / `4afad259dd4c184de5b61ca51f91fcde7222cbf2` / `2bd4991f75a53ab9209e748499dcb8915769e3a6`
- Approved tag: `step-2c3b-approved`
- Checked-in canonical live schema: `frontend/schema/wpgraphql.graphql`
- Group audit schema: `frontend/schema/wpgraphql.group.graphql`
- Metadata: `frontend/schema/wpgraphql.meta.json`
- Compatibility evidence: `frontend/schema/wpgraphql.compatibility.json`

The canonical live metadata records Consulting as canonical, four exact branch peers, and Group as a structural superset. Step 2C.5B Frontend CI run #35 passed on correction/head `4afad259dd4c184de5b61ca51f91fcde7222cbf2`, and the full 26-file / 252-test regression passed before owner acceptance and merge. The accepted readiness plan remains `BLOCKED_BY_BACKUP_EVIDENCE`; CMS mutation authorization is `NOT_GRANTED`, Batch A mutation authorization is false, and no backup, export, restore, taxonomy deletion, CMS mutation, Step 2C.5C, Step 3, or deployment is authorized.

## Current Step 2C.5B evidence authority

Step 2C.5B uses fresh read-only public GraphQL evidence derived through the trusted SiteKey registry, accepted Step 2C.5A artifacts, and repository evidence for planning only. The fresh 2026-08-15 preflight inspected all five tenants and found the bounded Batch A coordinates `VALIDATED_UNCHANGED`: Group and Healthcare identities retain their accepted current values; the four exact branch-local Business Unit terms remain absent without collision or truncation; Group terms remain non-targets and match the accepted baseline.

Candidate WordPress Admin coordinates recorded in the stale backend tree are `STRONGLY_INFERRED`, not confirmed live administrative coordinates, because SOT-001 is OPEN. RB-001 backup evidence, RB-009 restore evidence, and exact protected live admin coordinates remain UNKNOWN. The Step 2C.5B readiness plan is owner accepted and merged through PR `#16`, while the operational package status remains `REQUIRES_HUMAN_ADMIN_ACTION` and mutation readiness remains `BLOCKED_BY_BACKUP_EVIDENCE`. `step2c5bAccepted=true` does not authorize Batch A: `batchAMutationAuthorized=false`, CMS mutation authorization is `NOT_GRANTED`, and no CMS mutation, backup/export/restore execution, deletion, backend change, production UI, Step 3, Step 2C.5C, or deployment is authorized.

## Canonical public production topology

The owner-approved public production apex is `siratrgroup.com`. The authoritative public hostname mapping is Group -> `siratrgroup.com`, Consulting -> `consulting.siratrgroup.com`, Healthcare -> `healthcare.siratrgroup.com`, Lifestyle -> `lifestyle.siratrgroup.com`, and Real Estate -> `realestate.siratrgroup.com`.

This is public-domain evidence only. It must not be used to infer WordPress backend, GraphQL endpoint, media origin, staging, Vercel preview, cookie-domain, CORS, or revalidation configuration. Those remain UNKNOWN until repository or live configuration evidence establishes them. Each branch hostname represents an independent WordPress Multisite tenant website and independent content/runtime/cache scope; only the tested React/Next.js `BranchHomepage` architecture is shared.

## Current backend source status

### SOT-001 — OPEN CONFLICT

The `backend/` tree in GitHub is not yet proven to be the latest cumulative backend implementation.

Evidence of conflict:

- GitHub `backend/src/GraphQL/BrandSchema.php` exposes legacy `announcementBanner` and `emergencyBanner` string fields.
- The verified live schema adopted by the frontend contains newer typed announcement/emergency banner objects.
- Project recovery evidence records later Step 2C.2 backend work after the Step 1 baseline.

Policy until reconciled:

- **Do not make new backend runtime changes from the current GitHub backend tree.**
- Use the checked-in verified live schema as authoritative for frontend Step 2C.3C contracts.
- Recover/identify the latest cumulative backend source and compare it against `backend/` before any backend implementation stage.
- Never silently merge historical `sira-core.zip` or the original enterprise bundle over newer verified code.

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
4. prefer the latest verified authoritative source;
5. record the decision in `docs/DECISIONS.md` if architectural;
6. update this file and `PROJECT-STATE.md` after reconciliation;
7. preserve rollback evidence.
