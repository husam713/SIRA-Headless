# SIRA Engineering Handoff

Use this file when opening a new ChatGPT/Codex session or handing the project to another engineer.

## Read first

1. `/AGENTS.md`
2. `/project-state.json`
3. `/docs/PROJECT-STATE.md`
4. `/docs/SOURCE-OF-TRUTH.md`
5. relevant entries in `/docs/DECISIONS.md`
6. `/docs/adr/ADR-025-GROUP-STAGING-FIRST.md`
7. `/docs/SIRA-EDITORIAL-ARCHITECTURE-SPEC.md`

Then reconcile them against Git before editing.

## Repository

- Repository: `husam713/SIRA-Headless`
- Canonical integration/default branch: `main`
- Current repository HEAD: verify from Git; do not infer it from a recorded state snapshot
- PR `#31` reconciliation starting baseline: `aaa88631c862d213f890d2991aa63fd26ce925e3`
- PR `#31` accepted candidate: `daf7479114f4faba3fa736ee957e03a8d207d49e`
- PR `#31` merge / state verified-through coordinate: `85b749da5a7769a48e67b22685db904607e0a388`
- PR `#31` reconciliation status: OWNER ACCEPTED / MERGED
- Latest accepted governance milestone: Step 4 Editorial Architecture / ADR-028 through PR `#30`
- Historical SOT-001 state-reconciliation merge: `e20858b055e556065e96623205fa0d5774ad81d6`
- Latest accepted CMS mutation-readiness milestone: Step 2C.5B
- Latest approved tag: `step-2c3b-approved`
- SOT-001 backend source conflict: CLOSED through PR #18/#19 reconciliation

## Current state

Step 2C.5B is owner accepted and merged. Its CMS mutation track remains operationally `BLOCKED_BY_BACKUP_EVIDENCE`; CMS mutation authorization is `NOT_GRANTED`, Batch A mutation authorization is false, and RB-001/RB-009 execution evidence remains unavailable.

The repository/frontend track has accepted Step 3A, Step 3B, Step 3C.1,
Step 3C.2, and Step 3D.1. Step 3D.2 is NOT STARTED, Step 3D.3 remains gated
by `2C4-B09`, `PREVIEW-AUTH-001` remains DEFERRED, and full Step 3D closure
must not be claimed.

The Homepage Production Data Contract, Step 4 Exact Design Fidelity Charter,
and ADR-028 Editorial Architecture are owner accepted and merged. Step 4
visual implementation, the shared production shell, Group/Branch homepage
composition, and Newsroom visual/route work are NOT STARTED. Prototype and
production UI implementation are NOT AUTHORIZED.

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

## Current next gate

PR `#31` reconciliation was owner accepted and merged. Independent post-merge
verification proved the merge and identified the durable-state wording issue
corrected by this governance maintenance. No substantive next-stage task is
automatically authorized; Program Control or the owner must issue separate
authorization. The SIRA AI Engineering Operating System, prototypes, and
production UI remain NOT AUTHORIZED, as do WordPress mutation, external
staging, deployment, DNS, and production cutover.

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
