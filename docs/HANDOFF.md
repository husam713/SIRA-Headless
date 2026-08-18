# SIRA Engineering Handoff

Use this file when opening a new ChatGPT/Codex session or handing the project to another engineer.

## Read first

1. `/AGENTS.md`
2. `/project-state.json`
3. `/docs/PROJECT-STATE.md`
4. `/docs/SOURCE-OF-TRUTH.md`
5. relevant entries in `/docs/DECISIONS.md`
6. `/docs/adr/ADR-025-GROUP-STAGING-FIRST.md`

Then reconcile them against Git before editing.

## Repository

- Repository: `husam713/SIRA-Headless`
- Canonical integration/default branch: `main`
- Canonical main at this reconciliation: `e20858b055e556065e96623205fa0d5774ad81d6`
- Latest approved business milestone: Step 2C.5B
- Latest approved tag: `step-2c3b-approved`
- SOT-001 backend source conflict: CLOSED through PR #18/#19 reconciliation

## Current state

Step 2C.5B is owner accepted and merged. Its CMS mutation track remains operationally `BLOCKED_BY_BACKUP_EVIDENCE`; CMS mutation authorization is `NOT_GRANTED`, Batch A mutation authorization is false, and RB-001/RB-009 execution evidence remains unavailable.

The repository/frontend track may proceed without production WordPress mutation. The next existing-roadmap engineering stage is **Step 3 — Preview / SEO / Discovery**.

## New owner decision — Group staging first

The replacement public Group frontend for `siratrgroup.com` must be developed, integrated, QA'd, and owner-accepted on staging before production cutover.

Until a real staging hostname is human-confirmed, use only the placeholder `GROUP_STAGING_HOST`.

The accepted deployment model is the same Git commit and same Next.js application/site identity for staging and later production, with environment-specific hostname/configuration. Do not create a separate React implementation for staging.

The existing public Group site remains live during replacement development and remains the immediate rollback target through an owner-approved stabilization period. Do not destroy or uninstall it as a launch prerequisite.

This decision changes only Group public frontend implementation/cutover strategy. It does not rebuild WordPress Multisite, create a new database, redesign the four branch tenants, or authorize a separate staging CMS copy.

## Branch sites remain unchanged

Consulting, Healthcare, Lifestyle, and Real Estate remain independent WordPress Multisite tenants using the established shared React/Next.js implementation architecture. Group staging does not merge their pages, menus, content, media, SEO state, cache state, or editorial authority.

## Do not restart

Do not restart or redesign without newer repository evidence:

- WordPress Multisite architecture;
- `sira-core` backend ownership;
- WPGraphQL primary API;
- generated frontend contracts;
- Next.js App Router multi-brand foundation;
- hostname/site registry;
- tenant isolation;
- caching/revalidation architecture;
- Step 2C.3A/2C.3B schema compatibility/adoption;
- Step 2C.3C typed frontend contracts;
- Step 2C.3D content-readiness audit;
- Step 2C.4 production design/data-contract audit;
- Step 2C.5A/2C.5B historical CMS readiness evidence.

Historical Step 2C.5A/2C.5B artifacts remain historical and must not be rewritten to pretend the new staging decision existed when they were created.

## Architecture locks

- Consulting is the canonical branch GraphQL schema.
- Group may remain a structural superset.
- Frontend/shared GraphQL uses `ProjectDetails`.
- Use native WPGraphQL menus; do not create `siraNavigation`.
- Use native content connections; do not create `siraEditorialFeed` without a new evidence-backed ADR.
- Server Components by default.
- No Bricks or `.dc.html` runtime in production.
- Missing CMS data must not be hidden with frontend hardcoding.

Known separate observation: reconciled backend source declares `SiraProjectDetails` while the accepted frontend/live GraphQL schema exposes `ProjectDetails`; the mechanism remains UNKNOWN and must not be speculatively changed.

## RB-001 / RB-009 interpretation

Historical RB-001/RB-009 controls remain truthful evidence for direct production CMS/database mutation. They do not block repository engineering, Next.js implementation, Group frontend staging development, or staging QA.

Before final Group cutover, establish appropriate recovery controls for the actual cutover, including preservation of the legacy Group environment and an appropriate final recovery point where applicable. Do not mark historical RB requirements complete unless they actually occurred.

## Protected actions

Do not without explicit owner authorization:

- merge into `main`;
- provision external staging infrastructure;
- change production DNS/routing;
- replace `siratrgroup.com`;
- deploy production;
- destroy the legacy Group site;
- perform CMS/database mutations or destructive cleanup;
- delete taxonomy terms;
- rotate production secrets.

## Safe work now

Repository-only Step 3 engineering may proceed. Step 4 production component implementation may follow its normal acceptance gate and target Group staging first. Production WordPress mutation is not implied or authorized by either stage.

## Handoff completion format

Return:

- branch;
- baseline;
- commit SHA;
- files changed;
- validations actually run and their results;
- warnings/deferred checks;
- rollback point;
- unresolved source conflicts;
- next proposed stage;
- `CURRENT PROJECT STATE`.
