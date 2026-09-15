# SIRA — current state (read this first)

One page. Facts here are verified against Git/GitHub on the date shown; anything
older is provenance. Machine-readable twin: `project-state.json` — these two are
the only current-state carriers. Resume pointer: `docs/HANDOFF.md`; dated log:
`docs/handoff-log/`; registry: `docs/SOURCE-OF-TRUTH.md`; decisions:
`docs/DECISIONS.md`; everything historical: `docs/history/`.

**Verified through:** 2026-09-15 · `main` @ `8e34efef` (merge of PR #69, 2026-09-15)

## What this repo is

WordPress Multisite (6 tenants: Group, Consulting, Healthcare, Lifestyle, Real
Estate, Digital) → WPGraphQL → one Next.js 16 App Router app. Backend plugin in
`backend/`, frontend in `frontend/`, ops tooling in `tools/`. Rules per area
load automatically from `.claude/rules/` when you touch those paths.

## Where the work is

| Track | State | Evidence |
|---|---|---|
| Group + branch homepages, shared shell, layout primitives | merged on `main` (PRs #36–#63) | Git |
| Newsroom "The SIRA Record" | merged on `main` — PR **#64** @ `4a999bb0`, 2026-09-15 | Git |
| SIRA Digital tenant (bilingual, pre-launch host) | merged on `main` — PRs **#65** @ `8723f960`, **#66** @ `e0ef2f74`, 2026-09-15 | Git |
| CMS-origin relocation reconciliation (ADR-036 / SOT-003) + Group cutover plan | merged on `main` — PR **#68** @ `db090be6`, 2026-09-15 | Git |
| Post-merge verification record + Phase 3 state-carrier consolidation | PRs **#70** and **#71** (stacked) — open, not merged | GitHub |
| Backend starter importer | PR **#45** (draft, 2026-08-28) — stale | GitHub |
| PR **#37** | closed 2026-09-15 per owner decision; the Vercel GitHub app itself is still installed and posts checks on every PR (GOV-004) | GitHub |
| Owner's local uncommitted work (Cloud Run Dockerfile, search-indexing switch, newsroom design pass, backend CI) | intentional, in the main checkout, not on any branch yet | owner statement 2026-09-15 |

## Durable-state carriers

The 2026-09-05 → 09-10 events — verified backup (RB-001), Batch A taxonomy
terms, placeholder editorial seeding (ADR-030/031), blog 6 provisioning
(ADR-033/034/035), and the live CMS-origin relocation to
`cms-<tenant>.siratrgroup.com` (ADR-036 / SOT-003) — are on `main` since PR
#68 (2026-09-15). Do not edit CMS origins or `SIRA_WP_*_GRAPHQL_URL` without
reading "CMS origin relocation — executed 2026-09-10" in
`docs/handoff-log/2026-09-10-handoff-through-cms-origin-relocation.md`. Group / blog 1 is still on the apex
(`openGates.groupCmsOriginRelocation` OPEN).

PRs #64, #65, #66, #68 and #69 were merged on 2026-09-15 under an explicit
owner merge authorization given in-session; each head was brought up to date
with `main` (GitHub "Update branch" for #64/#65/#66/#68; a local
`git merge origin/main` pushed by the session for #69) and re-checked green
before merging.
Post-merge verification ran the same day (owner-instructed, by the merging
session — not the independent-verification role): merge SHAs, parents and
first-parent chain `4a999bb0 → 8723f960 → e0ef2f74 → db090be6 → 8e34efef`
confirmed; every merged head is an ancestor of `main`; each merge commit's
tree equals its CI-checked head; the five branch-update merges equal the
clean `merge-tree` of their parents (no hand-resolved content); `main`'s
tree equals the clean merge of `8cb642d8` + `b7ecda7f` plus `docs/STATE.md`
only; credential scan of the effective diff clean (the one hit is the env-var
name `SIRA_WP_DIGITAL_PREVIEW_APPLICATION_PASSWORD`); `step-2c3a/b-approved`
tags and all source branches intact; `main` rulesets intact; Frontend/Backend
CI green on every `main` push that touched their paths; and on a clean
worktree of `8e34efef`: lint PASS, typecheck PASS, 61 files / 658 tests PASS.
Merge is still not owner acceptance: no acceptance comment exists on those
PRs.

Defect found by that run, reported not fixed: `tests/unit/launch-gate.test.ts`
imports `tools/verify-no-seed-content.mjs`, whose shebang line breaks Vitest
when a Windows clone with `core.autocrlf=true` writes the file as CRLF
(`SyntaxError: Invalid or unexpected token`). LF on disk and Linux CI are
unaffected. Candidate fix: a `.gitattributes` rule pinning `tools/*.mjs` to
`eol=lf`.

## Authorized / not authorized (owner)

- **Authorized:** prototype and production UI implementation (Step 4); Claude
  Code native configuration and CI path split (this document's PR, 2026-09-15).
- **Not authorized** (each needs an explicit owner instruction at the time):
  merge into `main`; production deployment or cutover; DNS/vhost changes;
  production secrets; external staging provisioning; destructive CMS/database
  operations; taxonomy deletion; deleting rollback branches/tags; AI Engineering
  OS validator/runtime work beyond this adapter.
- GitHub now enforces part of this: rulesets on `main` (PR + `frontend` check
  required, no force-push, no delete) and on `step-*` branches/tags (immutable).
- Phase 3 of the Claude Code adapter (state-carrier consolidation) was
  authorized by "Start Phase 3" on 2026-09-15: `docs/tasks/TP-P3-STATE-CONSOLIDATION.md`.

## Open gates

- **RB-009** restore rehearsal has never been performed — recoverability is inferred, not proven.
- **ADR-032**: Hostinger CDN returns 403 + bot challenge to server-side GraphQL fetches from unrecognised IPs; live captures go over SSH (`tools/capture-live-feed.mjs`). Launch blocker.
- `blog_public = 0` on the tenants and 37+ `_sira_seed=1` placeholder records: `node tools/verify-no-seed-content.mjs` must pass before launch.
- `2C4-B09` (Step 3D.3) and `PREVIEW-AUTH-001` remain deferred; full Step 3D closure must not be claimed.
- Deploy target is in transition (Vercel dropped; Cloud Run files exist locally, untracked).
- `tests/unit/launch-gate.test.ts` fails on a Windows `autocrlf=true` clone (CRLF shebang in `tools/verify-no-seed-content.mjs`); fix is a `.gitattributes` `eol=lf` rule, not yet authorized.

## Next step

Owner merge decision on #70 then #71 (Phase 3). After that: decide #45; bring
the owner's four local uncommitted work streams onto branches (owner confirms
authorship first); the CRLF `.gitattributes` fix; uninstall the Vercel GitHub
app (external admin); Phase 4 — trial the adapter on two or three real tasks.
