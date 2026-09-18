# SIRA — current state (read this first)

One page. Facts here are verified against Git/GitHub on the date shown; anything
older is provenance. Machine-readable twin: `project-state.json`. Full history
and registries: `docs/HANDOFF.md`, `docs/SOURCE-OF-TRUTH.md`,
`docs/PROJECT-STATE.md`, `docs/DECISIONS.md`.

**Verified through:** 2026-09-18 · `main` @ `ed781fdc` (merge of PR #78, 2026-09-18)

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
| Backend starter importer | PR **#45** (draft, 2026-08-28) — stale | GitHub |
| PR **#37** | Vercel bot; Vercel is no longer used — close when convenient | owner decision 2026-09-15 |
| Atlas inner pages + production content (EN) | merged on `main` — PR **#77**, 2026-09-18 | Git |
| Atlas Arabic edition (ADR-037), owner's newsroom, final newsroom content EN/AR, prototype motion, Cloud Run deployment | merged on `main` — PR **#78** @ `ed781fdc`, 2026-09-18 | Git, `docs/tasks/atlas-launch-2026-09-18.md` |
| Production | Cloud Run `sira-frontend` (europe-west1) serves `main` @ `ed781fdc` on the four company subdomains; `siratrgroup.com` mapped, waiting for the owner's DNS (ADR-038) | gcloud, ADR-038 |
| Owner's local uncommitted work (Cloud Run Dockerfile, search-indexing switch, newsroom design pass, backend CI) | intentional, in the main checkout, not on any branch yet | owner statement 2026-09-15 |

## Durable-state carriers

The 2026-09-05 → 09-10 events — verified backup (RB-001), Batch A taxonomy
terms, placeholder editorial seeding (ADR-030/031), blog 6 provisioning
(ADR-033/034/035), and the live CMS-origin relocation to
`cms-<tenant>.siratrgroup.com` (ADR-036 / SOT-003) — are on `main` since PR
#68 (2026-09-15). Do not edit CMS origins or `SIRA_WP_*_GRAPHQL_URL` without
reading `docs/HANDOFF.md` section "CMS origin relocation — executed
2026-09-10". Group / blog 1 moved to `cms-group.siratrgroup.com` on 2026-09-18
(ADR-038); the apex still answers through a sunrise mapping until DNS moves.

PRs #64, #65, #66 and #68 were merged on 2026-09-15 under an explicit owner
merge authorization given in-session; each head was brought up to date with
`main` by a GitHub branch update and re-checked green before merging. Merge
is not owner acceptance: no acceptance comment exists on those PRs, and
post-merge verification has not been performed.

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
- `node tools/verify-no-seed-content.mjs`: the five Atlas tenants are clean (2026-09-18); Digital still carries 94 placeholder records. `blog_public = 0` stays on every `cms-*` origin by design — the public site's indexing is the frontend's `SIRA_SEARCH_INDEXING` switch, off until the owner's final review.
- `2C4-B09` is decided for every tenant (ADR-034 Digital, ADR-037 the other five, 2026-09-18) on branch `feat/atlas-arabic`; `PREVIEW-AUTH-001` remains deferred and full Step 3D closure must not be claimed.
- Deploy target is Cloud Run (ADR-038); Dockerfile and `.gcloudignore` are on `main`.

## Next step

Phase 3 of the Claude Code adapter: state-carrier consolidation
(`project-state.json` / `PROJECT-STATE.md` / `HANDOFF.md` / `SOURCE-OF-TRUTH.md`
still describe #64–#66 as unmerged branches in places). Then close #37, decide
#45, and bring the owner's local uncommitted work onto a branch.
