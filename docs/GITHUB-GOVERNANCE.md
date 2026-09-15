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

Historical: a classic branch protection rule was configured while the
repository was private and was reported as not enforced under that plan.

Current (2026-09-15, repository public, owner is admin): three **repository
rulesets** are active and were verified through the GitHub API:

- `SIRA main — PR + CI required, no force-push, no delete` — targets the default
  branch: deletion blocked, non-fast-forward blocked, pull request required
  (0 approvals — the owner is the only human and cannot approve their own PR;
  the merge click is the owner gate), required status check `frontend`
  (GitHub Actions) with strict up-to-date policy; no bypass actors.
- `SIRA rollback branches — immutable step-* history` — `refs/heads/step-*`:
  deletion, non-fast-forward, and update blocked.
- `SIRA approved tags — immutable step-*-approved` — `refs/tags/step-*`: same.

Because the engineering agent operates under the owner's GitHub token, GitHub
cannot distinguish the two; "the agent must not merge" therefore remains a
client-side deny rule in `.claude/settings.json` plus the owner instruction,
not a platform control.

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

Since 2026-09-15 the workflow runs on every pull request so that the required
`frontend` status always reports. The whitespace check runs unconditionally;
steps 1–9 and the layout/fixture/Draft-Mode verifiers run only when the pull
request changes `frontend/**` or the workflow file. Pushes to `main` and manual
dispatches always run the full sequence. `.github/workflows/backend-ci.yml`
lints `backend/**` (`php -l`, `phpcs`) on pull requests touching it; it is not
a required status.

No CI step may require a WordPress Application Password, schema authorization token, or other production credential.

G0-C produced successful Frontend CI evidence before merge.

## Backend CI boundary

SOT-001 is closed. PR #18 reconciled the GitHub backend tree to the independently verified LIVE / Step 2C.2F sira-core source.

Backend static/runtime validation may now be used as repository source and contract evidence for that reconciled baseline. It must not be interpreted as production acceptance, live administrative-coordinate confirmation, CMS mutation authorization, or deployment authorization.

Any future backend runtime change still requires the normal branch, validation, PR, CI, independent review, and owner-authorization workflow.
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
