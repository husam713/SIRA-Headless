# SIRA — current state (read this first)

One page. Facts here are verified against Git/GitHub on the date shown; anything
older is provenance. Machine-readable twin: `project-state.json`. Full history
and registries: `docs/HANDOFF.md`, `docs/SOURCE-OF-TRUTH.md`,
`docs/PROJECT-STATE.md`, `docs/DECISIONS.md`.

**Verified through:** 2026-09-16 · `main` @ `0dd08528` (merge of PR #73, 2026-09-16)

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
| Step 4 motion system (tokens, view transitions, header/menu states, form feedback, ticker pause) | merged on `main` — PR **#72** @ `1179c5dd`, 2026-09-16 | Git |
| Platform delivery: Data Cache key fix, `POST /api/revalidate/` receiver, tenant-scoped cache tags, outage → 500, retry, trace logs, per-tenant motion preset, `next/link` menus, edge policy (off) | merged on `main` — PR **#73** @ `0dd08528`, 2026-09-16; runbook `docs/PLATFORM-DELIVERY.md` | Git |
| Backend starter importer | PR **#45** (draft, 2026-08-28) — stale | GitHub |
| PR **#37** | Vercel bot; Vercel is no longer used — close when convenient | owner decision 2026-09-15 |
| Owner's local uncommitted work (Cloud Run Dockerfile, search-indexing switch, newsroom design pass, backend CI) | intentional, in the main checkout, not on any branch yet | owner statement 2026-09-15 |

## Durable-state carriers

The 2026-09-05 → 09-10 events — verified backup (RB-001), Batch A taxonomy
terms, placeholder editorial seeding (ADR-030/031), blog 6 provisioning
(ADR-033/034/035), and the live CMS-origin relocation to
`cms-<tenant>.siratrgroup.com` (ADR-036 / SOT-003) — are on `main` since PR
#68 (2026-09-15). Do not edit CMS origins or `SIRA_WP_*_GRAPHQL_URL` without
reading `docs/HANDOFF.md` section "CMS origin relocation — executed
2026-09-10". Group / blog 1 is still on the apex
(`openGates.groupCmsOriginRelocation` OPEN).

PRs #64, #65, #66 and #68 were merged on 2026-09-15 under an explicit owner
merge authorization given in-session; each head was brought up to date with
`main` by a GitHub branch update and re-checked green before merging. Merge
is not owner acceptance: no acceptance comment exists on those PRs, and
post-merge verification has not been performed.

PRs #72 and #73 were merged on 2026-09-16 under an explicit owner merge
authorization given in-session (#73 rebased onto `main` after #72; its merged
head `d590d7a0` is tree-identical to the reviewed candidate `7ac45f6e`).
Post-merge verification PASS on 2026-09-16: both heads are ancestors of
`0dd08528`, Frontend CI green on both `main` pushes, diff bounded to
`frontend/` and `docs/PLATFORM-DELIVERY.md`. No acceptance comment exists on
either PR. The revalidation receiver is merged but **not live**: it needs
`SIRA_NEXT_REVALIDATION_*` in the WordPress `wp-config.php`, a server cron,
and the Cloud Run env/flags listed in `docs/PLATFORM-DELIVERY.md`.

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

Owner actions from `docs/PLATFORM-DELIVERY.md` (wp-config constants, server
cron, Cloud Run flags, egress check) to make revalidation live; CDN decision
before enabling `SIRA_EDGE_CACHE_SMAXAGE_SECONDS`; then the remaining roadmap
(typography preset — spec §8 decision, sitemap content URLs, CDN purge) and
the Atlas production direction (owner design approval pending).

Phase 3 of the Claude Code adapter: state-carrier consolidation
(`project-state.json` / `PROJECT-STATE.md` / `HANDOFF.md` / `SOURCE-OF-TRUTH.md`
still describe #64–#66 as unmerged branches in places). Then close #37, decide
#45, and bring the owner's local uncommitted work onto a branch.
