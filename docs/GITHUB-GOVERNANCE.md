# SIRA GitHub Governance

## Status

G0-C — GitHub Governance + CI

This document defines the target repository workflow. It does not by itself change GitHub repository settings.

## Canonical branch model

Target model after G0-C acceptance:

- `main` — canonical integration branch containing the latest approved integrated project state.
- `feature/*` — scoped feature work.
- `fix/*` — scoped defect correction.
- `chore/*` — tooling, governance, documentation, and maintenance work.
- approved tags — immutable milestone and rollback references.
- historical `step-*` branches — retained during migration-history consolidation; do not delete them as part of G0-C.

A separate long-lived `develop` branch is not justified at the current project size and stage.

## Current transitional state

At the start of G0-C:

- repository default branch: `step-2c2a-inventory`;
- current integration/execution branch: `step-2c3c-typed-query-contracts`;
- current execution head after G0: `c26b658b4dfafb82c04af42ca880e6894aefcf0d`;
- latest approved business tag: `step-2c3b-approved` at `d59035d4ec2a97aa9524cf0b4788606745be245a`.

The default branch must not be changed until G0-C is accepted.

## Pull request policy

All normal changes to the canonical branch should arrive through a Pull Request.

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

## Target branch protection

After `main` exists and becomes the repository default, configure protection/rules so that `main`:

- requires a Pull Request before merge;
- requires the frontend CI check for frontend-impacting changes;
- blocks force pushes;
- blocks branch deletion;
- keeps administrator bypass available only for deliberate recovery when required;
- does not enable automatic production deployment merely because a PR merged.

If GitHub plan/settings make a specific protection control unavailable, record that limitation rather than pretending it is active.

## CI policy

`.github/workflows/frontend-ci.yml` is the initial executable evidence gate for the current frontend migration stage.

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

## Backend CI boundary

SOT-001 remains open: the GitHub `backend/` tree is not yet proven to be the latest cumulative backend source. Do not add or interpret backend CI as production acceptance until that source is reconciled.

Existing backend static validation remains useful historical/source evidence, but new backend runtime work is blocked by SOT-001.

## G0-C cutover sequence

After this governance/CI PR is validated and explicitly approved:

1. merge G0-C into `step-2c3c-typed-query-contracts`;
2. create/move `main` to that accepted integrated commit;
3. change the GitHub default branch from `step-2c2a-inventory` to `main`;
4. configure branch protection/rules for `main`;
5. synchronize `project-state.json` and `docs/PROJECT-STATE.md` so `main` is the canonical integration branch;
6. branch Step 2C.3C-B1 implementation work from the governed `main` state;
7. retain old stage branches/tags until migration cleanup is separately approved.

## Protected operations

Require explicit owner approval before:

- merging G0-C or later feature PRs into the canonical integration branch;
- force pushing or rewriting shared history;
- deleting approved tags or historical rollback branches;
- production deployment/cutover;
- DNS or production secret changes.

## Rollback

Before default-branch cutover, rollback is simply to close G0-C without merge.

After cutover, the previous integration history remains reachable through the historical branches and approved tags. Never delete those rollback references during the same operation that establishes `main`.
