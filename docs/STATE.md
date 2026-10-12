# SIRA — current state (read this first)

One page. Facts here are verified against Git/GitHub on the date shown; anything
older is provenance. Machine-readable twin: `project-state.json`. Handover entry
point: `docs/HANDOVER.md`. Full history and registries: `docs/HANDOFF.md`,
`docs/SOURCE-OF-TRUTH.md`, `docs/PROJECT-STATE.md`, `docs/DECISIONS.md`.

**Verified through:** 2026-10-12 · `main` @ `2cb12ca9` (merge of PR #80, 2026-09-19)

## What this repo is

WordPress Multisite (6 tenants: Group, Consulting, Healthcare, Lifestyle, Real
Estate, Digital) → WPGraphQL → one Next.js 16 App Router app. Backend plugin in
`backend/`, frontend in `frontend/`, ops tooling in `tools/`. Rules per area
load automatically from `.claude/rules/` when you touch those paths.

## Where the work is

| Track | State | Evidence |
|---|---|---|
| Group + branch homepages, shell, newsroom, Atlas pages, Arabic edition (ADR-037), Digital tenant (ADR-033/034) | merged on `main` (PRs #36–#78) | Git |
| Launch: Group on `cms-group`, frontend on Cloud Run, apex to DNS (ADR-038) | merged on `main` — PR **#79**, 2026-09-18 | Git |
| Contact form: tenant-scoped services, optional phone | merged on `main` — PR **#80** @ `2cb12ca9`, 2026-09-19 | Git |
| SIRA Digital "Masar" site (ADR-039, PROPOSED) | open — PR **#81**, CI green, mergeable; awaits the owner's merge | GitHub |
| Production | Cloud Run `sira-frontend` (europe-west1) rev `00009-dvr` serves `main` @ `2cb12ca9` on the apex and the four company subdomains; apex DNS has moved; `digital.siratrgroup.com` is still on the WordPress host | gcloud, DNS, HTTP probe 2026-10-12 |
| Search indexing | OFF (`SIRA_SEARCH_INDEXING=off`) until the owner's final review | live `robots.txt` 2026-10-12 |
| Release tags | `release/2026-09-19-production` (live), `release/2026-09-18-production` | Git |
| Repository cleanup | unmerged branch tips and stashes archived as `archive/*` tags, 2026-10-12, before merged and superseded branches were removed | Git |

## Durable-state carriers

The CMS-origin relocation to `cms-<tenant>.siratrgroup.com` (ADR-036 /
SOT-003) and Group's move to `cms-group.siratrgroup.com` (ADR-038) are
executed. Do not edit CMS origins or `SIRA_WP_*_GRAPHQL_URL` without reading
ADR-038 and `docs/HANDOFF.md` section "CMS origin relocation — executed
2026-09-10". Merge is not owner acceptance; no per-PR acceptance comments
exist for PRs #64–#80.

## Authorized / not authorized (owner)

- **Not authorized** without an explicit owner instruction at the time: merge
  into `main`; production deployment or cutover; DNS/vhost changes; production
  secrets; destructive CMS/database operations; taxonomy deletion; deleting
  rollback branches/tags (`step-*`, `release/*`, `archive/*`).
- GitHub enforces part of this: rulesets on `main` (PR + `frontend` check
  required, no force-push, no delete) and on `step-*` branches/tags (immutable).

## Open gates

- **PR #81 / ADR-039** — the owner merges or declines; after acceptance, retire
  the ADR-033 composition and move `digital.siratrgroup.com` to Cloud Run.
- **Search indexing** — `SIRA_SEARCH_INDEXING=on` after the editorial claims in
  `docs/tasks/atlas-launch-2026-09-18.md` are confirmed.
- **Digital content** — blog 6 still carries 94 placeholder records
  (`node tools/verify-no-seed-content.mjs`); blogs 1–5 are clean.
- **Brand gates** — SIRA/SIRAH spelling; Digital brand mark.
- **RB-009** restore rehearsal has never been performed — recoverability is inferred, not proven.
- **ADR-032**: Hostinger CDN blocks server-side GraphQL from unrecognised IPs; it does not affect Cloud Run (ADR-038) but still affects local live captures (use `tools/capture-live-feed.mjs`).
- `PREVIEW-AUTH-001` remains deferred; full Step 3D closure must not be claimed.

## Next step

The owner's decisions above, in order: PR #81, then the indexing switch.
Everything else is in `docs/HANDOVER.md`.
