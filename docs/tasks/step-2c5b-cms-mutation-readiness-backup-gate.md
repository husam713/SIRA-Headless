# Task — Step 2C.5B CMS Mutation Readiness & Backup Gate

## Objective

Prepare an evidence-backed, non-executable readiness package for the first future CMS Batch A window. Do not mutate WordPress, create backups/exports, restore, deploy, or begin Step 2C.5C.

## Baseline and branch

- Baseline: `main@f0d0974a75ac49a9c4fd88f0f229fa28a209acfd`
- Branch: `chore/2c5b-cms-mutation-readiness-gate`
- Latest accepted milestone: Step 2C.5A, merged PR #15

## Future scope only

- CMS-2C4-001 Group `name`, `primaryColor`, `secondaryColor`
- CMS-2C4-002 Healthcare `name`, `primaryColor`, `secondaryColor`, `accentColor`
- CMS-2C4-006 creation of `consulting`, `healthcare`, `lifestyle`, and `real-estate` terms on their independent branch tenants

Record assignments, Group taxonomy changes, deletion, and every other CMS action are excluded.

## Deliverables

- fresh five-tenant sanitized Batch A readiness artifact;
- A1–A15 future execution manifest, status `NOT_AUTHORIZED`;
- non-secret human backup evidence template;
- RB-001 through RB-009 Batch A readiness reconciliation;
- execution-ledger template with immediate CREATED/databaseId capture;
- durable audit report and project-state continuity;
- focused contract tests for scope, evidence semantics, rollback safety, tenant isolation, authorization, and protected gates.

## Evidence result

- Five tenants inspected read-only.
- CMS-2C4-001, CMS-2C4-002, and the four CMS-2C4-006 term scopes: `VALIDATED_UNCHANGED`.
- Expected branch slugs absent; zero equivalent collisions; untruncated.
- Group terms unchanged and not mutation targets.
- RB-001 and RB-009: UNKNOWN / NOT RUN.
- Exact live protected admin coordinates: UNKNOWN; repository candidates only `STRONGLY_INFERRED` while SOT-001 is open.
- Mutation readiness: `BLOCKED_BY_BACKUP_EVIDENCE`.
- Plan status: `OWNER_ACCEPTED_MERGED`.
- Operational outcome: `REQUIRES_HUMAN_ADMIN_ACTION`.

## Acceptance checks

- [x] Canonical baseline reconciled before branching.
- [x] Protected untracked review evidence preserved.
- [x] Fresh five-tenant read-only preflight captured without endpoints or credentials.
- [x] Exact identity and term contracts preserved.
- [x] RB-001 through RB-009 reconciled specifically for Batch A.
- [x] Backup and ledger templates contain no protected access material.
- [x] A1 through A15 defined but not executed.
- [x] Taxonomy rollback never implies automatic deletion.
- [x] Step 2C.5B acceptance and Batch A authorization remain separate.
- [x] Local validation complete: JSON, focused 34 tests, full 26 files / 252 tests, lint, typecheck, build, diff/security/scope checks.
- [x] Draft PR open.
- [ ] Corrected exact-head Frontend CI complete.
- [x] Owner acceptance of readiness plan granted without Batch A authorization.

## Hard stop

Stop before any WordPress write, backup/export/restore execution, deletion, backend/generated/UI/dependency change, deployment, Step 3, or Step 2C.5C. A later owner acceptance of this plan does not authorize Batch A.
