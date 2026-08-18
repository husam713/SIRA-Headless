# Group Staging Source of Truth

This record supplements `docs/SOURCE-OF-TRUTH.md` for the owner decision approved on 2026-08-18. If older current-state prose conflicts with this record after commit, use `project-state.json`, ADR-025, and Git evidence until the older prose is reconciled.

## Repository baseline

- Repository: `husam713/SIRA-Headless`
- Canonical branch: `main`
- Canonical `main` at reconciliation start: `e20858b055e556065e96623205fa0d5774ad81d6`
- That commit merged PR #19 and closed the durable SOT-001 backend discrepancy.

## Business milestone versus current repository head

Step 2C.5B remains the latest accepted **business/CMS mutation-readiness milestone**. Its accepted merge is `2bd4991f75a53ab9209e748499dcb8915769e3a6`.

That SHA is not the current Git `main` head. Later repository reconciliation work merged PR #18 and PR #19, producing the current reconciliation baseline `e20858b055e556065e96623205fa0d5774ad81d6` without authorizing CMS mutation or production deployment.

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

Next existing-roadmap stage: **Step 3 — Preview / SEO / Discovery**.

After Step 3 acceptance, Step 4 production component implementation may proceed and the Group frontend must target staging first.

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
