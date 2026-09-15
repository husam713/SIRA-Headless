# SIRA Engineering Handoff — resume pointer

One page. This file tells a new session or engineer where to start; it is not
the log. The dated, append-only handoff log lives in `docs/handoff-log/` and is
never rewritten. Everything below is verified against Git on the date shown.

**Verified through:** 2026-09-15 · `main` @ `8e34efef`

## Read first

1. `docs/STATE.md` — current state, open gates, what is and is not authorized.
2. `git status`, `git log --oneline -10`, `gh pr list` — HEAD comes from Git;
   every SHA in a document is a baseline, candidate, merge, or snapshot.
3. `AGENTS.md`, then only the files your task touches. Full boot
   (`templates/ai/BOOT-PROTOCOL.md`) for governance, recovery, or protected work.

## Repository

- Repository `husam713/SIRA-Headless`; canonical branch `main`; rulesets on
  `main` and `step-*` (see `docs/GITHUB-GOVERNANCE.md`).
- Latest approved tag: `step-2c3b-approved`. Approved `step-*` tags and
  branches are immutable.
- Historical SOT-001 state-reconciliation merge:
  `e20858b055e556065e96623205fa0d5774ad81d6` (provenance).
- Machine state: `project-state.json`. Registry: `docs/SOURCE-OF-TRUTH.md`.
  Decisions: `docs/DECISIONS.md` (+ `docs/adr/`). History: `docs/history/`.

## Where the last session left things (2026-09-15)

- PRs #64 (Newsroom), #65/#66 (SIRA Digital), #68 (CMS-origin reconciliation,
  ADR-036 / SOT-003) and #69 (STATE.md) are merged on `main`. Merge is not
  owner acceptance; no acceptance artifact exists on those PRs.
- Post-merge verification of that chain: PR #70 (independently verified
  2026-09-15, VERIFIED WITH WARNINGS; findings fixed at `054a03a5`).
- Phase 3 of the Claude Code adapter (this consolidation):
  `docs/tasks/TP-P3-STATE-CONSOLIDATION.md`.
- Group / blog 1 CMS-origin relocation is deferred to the production cutover:
  `docs/tasks/group-production-cutover-plan.md` (plan only, nothing authorized).
- Before touching CMS origins or `SIRA_WP_*_GRAPHQL_URL`, read the log entry
  "CMS origin relocation — executed 2026-09-10" in
  `docs/handoff-log/2026-09-10-handoff-through-cms-origin-relocation.md`.

## Durable rulings that survive every handoff

- **Group staging first (ADR-025).** `siratrgroup.com` keeps serving the live
  legacy Group site until cutover and is the immediate rollback target. Until a
  real staging hostname is human-confirmed, use only the placeholder
  `GROUP_STAGING_HOST`. See `docs/GROUP-STAGING-SOURCE-OF-TRUTH.md`.
- **Do not restart** the Multisite/`sira-core`/WPGraphQL/App Router foundation,
  the site registry, tenant isolation, caching/revalidation, or the accepted
  Step 2C.3–2C.5 contracts without newer repository evidence and an ADR.
- Historical Step 2C.5A/2C.5B artifacts remain historical and must not be
  rewritten to pretend the new staging decision existed when they were created.
- **RB-001 / RB-009.** RB-001 backup evidence exists; RB-009 restore has never
  been rehearsed. These controls govern direct production CMS/database
  mutation; they do not block repository or staging work. Do not mark an RB
  requirement complete unless it actually occurred.
- Bricks and `.dc.html` are not production headless dependencies.

## Protected actions (owner decides every time)

Merge into `main`; production deployment or cutover; DNS/vhosts; production
secrets; destructive CMS/database operations, including taxonomy deletion;
deleting rollback branches, tags, or legacy releases; architecture changes
that need an ADR. Full list and semantics: `AGENTS.md` § Protected Operations.

## Handoff completion format

Role and profile · branch · baseline · commit SHA · files changed · validations
actually run with results (`PASS · FAIL · WARNING · DEFERRED · NOT RUN ·
BLOCKED · NOT APPLICABLE`) · local-evidence limits for `CLOUD_GITHUB` ·
warnings/deferred · rollback point · unresolved source conflicts · next
proposed stage · `CURRENT PROJECT STATE`. Append the dated entry to
`docs/handoff-log/` when a stage closes; update `docs/STATE.md` and
`project-state.json` when durable state changes.
