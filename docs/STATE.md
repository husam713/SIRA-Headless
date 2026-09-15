# SIRA — current state (read this first)

One page. Facts here are verified against Git/GitHub on the date shown; anything
older is provenance. Machine-readable twin: `project-state.json`. Full history
and registries: `docs/HANDOFF.md`, `docs/SOURCE-OF-TRUTH.md`,
`docs/PROJECT-STATE.md`, `docs/DECISIONS.md`.

**Verified through:** 2026-09-15 · `main` @ `548ac4a0` (merge of PR #63, 2026-09-04)

## What this repo is

WordPress Multisite (6 tenants: Group, Consulting, Healthcare, Lifestyle, Real
Estate, Digital) → WPGraphQL → one Next.js 16 App Router app. Backend plugin in
`backend/`, frontend in `frontend/`, ops tooling in `tools/`. Rules per area
load automatically from `.claude/rules/` when you touch those paths.

## Where the work is

| Track | State | Evidence |
|---|---|---|
| Group + branch homepages, shared shell, layout primitives | merged on `main` (PRs #36–#63) | Git |
| SIRA Digital tenant (bilingual, pre-launch host) | PRs **#65** (draft) and **#66** (draft) — implemented, **not merged, not owner-accepted** | GitHub |
| Newsroom "The SIRA Record" | PR **#64** — implemented, **not merged, not owner-accepted** | GitHub |
| Backend starter importer | PR **#45** (draft, 2026-08-28) — stale | GitHub |
| PR **#37** | Vercel bot; Vercel is no longer used — close when convenient | owner decision 2026-09-15 |
| Owner's local uncommitted work (Cloud Run Dockerfile, search-indexing switch, newsroom design pass, backend CI) | intentional, in the main checkout, not on any branch yet | owner statement 2026-09-15 |

## Durable-state drift you must know about

The state carriers on `main` are dated **2026-09-03**. The events of 2026-09-05
→ 09-10 — verified backup (RB-001), Batch A taxonomy terms, placeholder
editorial seeding (ADR-030/031), blog 6 provisioning (ADR-033/034/035), and the
live CMS-origin relocation to `cms-<tenant>.siratrgroup.com` (ADR-036 /
SOT-003) — are recorded only on the **local, unpushed** branch
`docs/cms-origin-relocation-reconciliation` (10 commits ahead of `main`).
Until that branch is pushed and merged, treat those facts as
`TRANSFERRED EVIDENCE` here, and do not edit CMS origins or
`SIRA_WP_*_GRAPHQL_URL` without reading that branch's `docs/HANDOFF.md`
section "CMS origin relocation — executed 2026-09-10".

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

## Open gates

- **RB-009** restore rehearsal has never been performed — recoverability is inferred, not proven.
- **ADR-032**: Hostinger CDN returns 403 + bot challenge to server-side GraphQL fetches from unrecognised IPs; live captures go over SSH (`tools/capture-live-feed.mjs`). Launch blocker.
- `blog_public = 0` on the tenants and 37+ `_sira_seed=1` placeholder records: `node tools/verify-no-seed-content.mjs` must pass before launch.
- `2C4-B09` (Step 3D.3) and `PREVIEW-AUTH-001` remain deferred; full Step 3D closure must not be claimed.
- Deploy target is in transition (Vercel dropped; Cloud Run files exist locally, untracked).

## Next step

Push and merge `docs/cms-origin-relocation-reconciliation` (or fold it into
#66) so `main`'s carriers stop being a week behind; then decide the order of
#64 / #65 / #66. Phase 3 of the Claude Code adapter (state-carrier
consolidation) follows that merge.
