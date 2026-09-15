# Task — Step 2C.5A CMS Preflight & Remediation Plan

## Objective

Revalidate all five WordPress Multisite tenants against the accepted Step 2C.4 correction manifest and produce exact, non-destructive future remediation batches without mutating WordPress.

## Baseline

- Branch: `main`
- Commit: `710eec3cf90e1a7d707860f9ee73d0abf283019c`
- Latest accepted stage: Step 2C.4
- PR #14 accepted head: `a4d8945bf5b83e304b1b0fb434eb7441ea243849`
- PR #14 merge: `710eec3cf90e1a7d707860f9ee73d0abf283019c`
- Frontend CI: #29 PASS
- Regression: 24 files / 204 tests PASS

## In scope

- Anonymous/public query-only GraphQL preflight for Group, Consulting, Healthcare, Lifestyle, and Real Estate.
- Comparison with Step 2C.3D evidence and all fifteen accepted Step 2C.4 manifest actions.
- Structured homepage group population evidence.
- Group Companies, Services, Investments, Testimonials, Partners, and Documents public inventory.
- Content-authority preservation using the accepted vocabulary.
- Proposed controlled execution batches, action-level specifications, rollback/export preconditions, and post-change verification.
- Durable evidence, focused contract tests, draft PR, and exact-head CI.

## Out of scope

- Any WordPress mutation, export, restore, content authoring, publication change, menu/term assignment, cleanup, or deletion.
- Backend runtime PHP, WPGraphQL/ACF schema, generated GraphQL, dependencies, lockfiles, or production UI changes.
- SOT-001 resolution, Step 3, deployment, DNS, Vercel, or protected origin configuration.
- Merge to `main`.

## Deliverables

- `docs/STEP-2C5A-CMS-PREFLIGHT-REMEDIATION-PLAN.md`
- `artifacts/step-2c5a/cms-preflight.json`
- `artifacts/step-2c5a/remediation-batches.json`
- `artifacts/step-2c5a/rollback-preconditions.json`
- `frontend/scripts/cms-preflight-audit.mjs`
- `frontend/tests/contract/step-2c5a-cms-preflight.test.ts`
- Reconciled project-state and source-of-truth records.

## Acceptance

- Exactly five independent tenants are inspected read-only.
- Previously observable drift is explicit; new evidence baselines are not mislabelled as drift.
- All fifteen accepted actions retain their 12 BLOCKING / 3 DEFERRED / 0 DESTRUCTIVE / 0 AUTHORIZED classifications.
- Every action has an exact future execution spec and remains unauthorized.
- Rollback requirements are defined but no export, backup, or restore is claimed.
- No endpoint, credential, authorization header, cookie, private body, or raw response is persisted.
- Required local validation and exact-head Frontend CI pass.
- Draft PR remains unmerged at the owner acceptance gate.

## Rollback

Revert the focused repository commit. WordPress rollback is not applicable because Step 2C.5A performs no CMS mutation.
