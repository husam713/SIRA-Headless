# Group Staging Source of Truth

This record preserves the Group staging-first owner decision approved on
2026-08-18. Its repository-baseline section is historical. For current project
state use `project-state.json`, `docs/PROJECT-STATE.md`,
`docs/SOURCE-OF-TRUTH.md`, ADR-025, and canonical Git evidence.

## Repository baseline

- Repository: `husam713/SIRA-Headless`
- Canonical branch: `main`
- Canonical `main` at reconciliation start: `e20858b055e556065e96623205fa0d5774ad81d6`
- That commit merged PR #19 and closed the durable SOT-001 backend discrepancy.

## Business milestone versus current repository head

Step 2C.5B remains the latest accepted **business/CMS mutation-readiness milestone**. Its accepted merge is `2bd4991f75a53ab9209e748499dcb8915769e3a6`.

That SHA was not the Git `main` head at this decision's reconciliation. Later
repository work merged PR #18 and PR #19, producing the then-current
reconciliation baseline `e20858b055e556065e96623205fa0d5774ad81d6`
without authorizing CMS mutation or production deployment. The current
post-PR30 baseline is recorded in the primary current-state files.

Therefore do not treat `2bd4991...` as the current repository HEAD.

## Current execution tracks

### CMS mutation track

- Step 2C.5B: accepted/merged.
- Operational status: `BLOCKED_BY_BACKUP_EVIDENCE`.
- CMS mutation authorization: `NOT_GRANTED`.
- Batch A authorization: false.
- RB-001/RB-009 historical evidence remains truthful and incomplete where not actually executed.

### Repository/frontend track

May proceed without production WordPress mutation.

Step 3A, Step 3B, Step 3C.1, Step 3C.2, and Step 3D.1 are accepted and
merged. Step 3D.2 is NOT STARTED and Step 3D.3 remains gated by `2C4-B09`.

Step 4 design governance and its homepage data contract are accepted. Visual
implementation is NOT STARTED and no prototype or production UI increment is
authorized. Any later authorized Group frontend implementation must still
target staging first.

## Group staging decision

- Scope: Group public frontend only.
- Placeholder staging hostname: `GROUP_STAGING_HOST` until human-confirmed.
- Production hostname: `siratrgroup.com`.
- Same application and accepted Git commit should serve staging and later production through environment-specific hostname/configuration.
- Existing public Group site remains live during build and is preserved as the immediate rollback target.
- No separate staging CMS is assumed.
- Branch-site architecture remains unchanged.

## Not authorized

- external staging provisioning;
- DNS/routing changes;
- production deployment;
- replacement of `siratrgroup.com`;
- production CMS/database mutation;
- taxonomy deletion;
- destruction of the legacy Group environment;
- automatic merge to `main`.

## Historical evidence rule

Do not rewrite Step 2C.5A/2C.5B historical artifacts to make them appear to include this later owner decision. Current durable-state records may reference the new decision while historical evidence remains unchanged.
