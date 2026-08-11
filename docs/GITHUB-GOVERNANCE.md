# SIRA GitHub Governance

## Status

G0-C — GitHub Governance + CI

**Status: COMPLETE / MERGED**

Merged integration commit:

`e2a0d425cd7fe435981427d9be33a6e6f9d8f436`

The repository default branch is now `main`, and `main` is the canonical integration branch.

## Canonical branch model

- `main` — canonical integration branch containing the latest approved integrated project state.
- `feature/*` — scoped feature work.
- `fix/*` — scoped defect correction.
- `chore/*` — tooling, governance, documentation, and maintenance work.
- approved tags — immutable milestone and rollback references.
- historical `step-*` branches — retained during migration-history consolidation; do not delete them without a separately approved cleanup stage.

A separate long-lived `develop` branch is not justified at the current project size and stage.

## Pull request policy

All normal changes to `main` should arrive through a Pull Request.

Every PR must record:

- stage and objective;
- baseline;
- in-scope and out-of-scope changes;
- architecture/security impact;
- validation evidence;
- warnings/deferred checks;
- rollback point;
- acceptance state.

The repository PR template is the default evidence form.

## Branch protection status

A branch protection rule is configured for `main`.

GitHub currently reports that the rule is **not enforced** for this private repository under the current plan. This is a platform/account-plan limitation and must not be represented as active enforcement.

Current status:

- rule configured: YES;
- rule enforced: NO;
- reason: GitHub plan limitation for this private repository;
- upgrade required for current SIRA development: NO.

Compensating project controls:

- use Pull Requests for normal changes to `main`;
- require Frontend CI for frontend-impacting changes;
- require owner approval before merge;
- engineering agents must not directly merge to `main` without explicit owner approval;
- do not force-push shared history;
- do not delete `main`, approved tags, or rollback branches without explicit owner approval;
- merging source code does not authorize production deployment.

If the GitHub plan changes later, enforce equivalent repository rules at the platform level and record the change as governance evidence.

## CI policy

`.github/workflows/frontend-ci.yml` is the executable evidence gate for the current frontend migration stage.

It intentionally uses only checked-in/offline schema artifacts and does not perform live WordPress introspection or use WordPress credentials.

Required frontend CI sequence:

1. install the pinned pnpm/Node toolchain;
2. `pnpm install --frozen-lockfile`;
3. `pnpm schema:check`;
4. `pnpm codegen`;
5. verify generated GraphQL files remain deterministic;
6. `pnpm lint`;
7. `pnpm typecheck`;
8. `pnpm test:run`;
9. `pnpm build`.

No CI step may require a WordPress Application Password, schema authorization token, or other production credential.

G0-C produced successful Frontend CI evidence before merge.

## Backend CI boundary

SOT-001 remains open: the GitHub `backend/` tree is not yet proven to be the latest cumulative backend source. Do not add or interpret backend CI as production acceptance until that source is reconciled.

Existing backend static validation remains useful historical/source evidence, but new backend runtime work is blocked by SOT-001.

## Completed G0-C cutover

The approved cutover completed these governance changes:

1. G0-C was merged into the active integration history;
2. `main` was established at the accepted integrated state;
3. the repository default branch was changed to `main`;
4. a `main` branch protection rule was configured;
5. platform enforcement was found unavailable under the current GitHub plan and is documented as GOV-003;
6. Frontend CI was installed and validated;
7. historical stage branches and approved tags were retained.

The remaining closeout action is to keep durable project-state files synchronized with this evidence.

## Step 2C.3C working model

New Step 2C.3C implementation work branches from `main` using focused branches such as:

- `feature/2c3c-b1-brand-contract`;
- later focused `feature/*` branches for homepage, navigation, editorial, and project contracts as approved.

Expected flow:

`main` -> feature branch -> implementation -> validation -> PR -> Frontend CI -> review -> owner approval -> merge.

## Protected operations

Require explicit owner approval before:

- merging feature/governance PRs into `main`;
- force pushing or rewriting shared history;
- deleting approved tags or historical rollback branches;
- production deployment/cutover;
- DNS or production secret changes;
- destructive WordPress/database operations.

## Rollback

Historical stage branches and approved tags remain rollback evidence. Never delete rollback references during the same operation that changes integration governance or deploys a milestone.
