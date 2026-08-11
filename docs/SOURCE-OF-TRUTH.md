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
- Current governed frontend baseline/head: `ace3d058a688dbe1a483b5a1f60f742bfe85cc5b`
- Latest accepted increment: Step 2C.3C-B1
- B1 PR / implementation / merge: `#5` / `d0b0d7fae5aa0870487335e066e51d56010e2137` / `ace3d058a688dbe1a483b5a1f60f742bfe85cc5b`
- Approved tag: `step-2c3b-approved`
- Checked-in canonical live schema: `frontend/schema/wpgraphql.graphql`
- Group audit schema: `frontend/schema/wpgraphql.group.graphql`
- Metadata: `frontend/schema/wpgraphql.meta.json`
- Compatibility evidence: `frontend/schema/wpgraphql.compatibility.json`

The canonical live metadata records Consulting as canonical, four exact branch peers, and Group as a structural superset. B1 Frontend CI run #5 passed before owner acceptance and merge.

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
