# Group / blog-1 CMS origin relocation + production cutover — plan

Status: **PLAN ONLY. Nothing here is authorized.** Each protected step below
needs explicit owner approval at the moment of execution, and the whole
exercise needs its own Task Packet. This document is the deferred half of
ADR-036 / SOT-003.

## The core constraint — why Group is not a standalone WordPress move

The five branch tenants could be relocated to `cms-<tenant>.siratrgroup.com`
in isolation because each was pre-launch, headless-ready, and nobody visited
its subdomain directly. **Group is the opposite:**

- Blog 1 **is** the live `siratrgroup.com` site. It currently renders a real
  legacy Bricks marketing site to visitors. ADR-025 (Group Staging First)
  requires that site kept live as the rollback target through an
  owner-approved stabilization period.
- The instant WordPress stops claiming `siratrgroup.com`, any request still
  routed there by DNS gets a hard "no site found" response. There is **no
  safe intermediate state** — the WordPress-side relocation and the apex DNS
  repoint must happen back-to-back in one coordinated window.
- Therefore the Group CMS-origin move only makes sense **as step one of the
  production cutover**, with the replacement Next.js frontend already staged,
  QA'd, owner-accepted, and ready to take the apex immediately.

If the owner ever wants Group's headless backend reachable at
`cms-group.siratrgroup.com` *before* the production cutover, the only
non-disruptive way is additive domain mapping (`sunrise.php` or a plugin) so
blog 1 answers on both hostnames at once. That is a separate, medium-risk
infrastructure change and is out of scope for this plan. Note that
`siratrgroup.com/graphql` is currently reachable from a developer machine, so
there is no active problem forcing this.

## What blog 1 has that a branch tenant did not

From the SSH reconnaissance during the branch-tenant migration:

- **Main-site identity is spread across a file and a network row, neither with
  a dry run:**
  - `wp-config.php` → `DOMAIN_CURRENT_SITE = 'siratrgroup.com'`
    (`PATH_CURRENT_SITE = '/'` stays; `COOKIE_DOMAIN` is dynamic —
    `$_SERVER['HTTP_HOST']` — and needs no edit).
  - `wp_site` (network row, id 1). `wp_update_site()` updates `wp_blogs`, not
    `wp_site`. Whether a safe core wrapper covers the network row on this
    WordPress 7.0.4 must be confirmed; if not, a single backed-up, rehearsed
    `UPDATE` on that one row is a deliberate, documented deviation from the
    no-raw-SQL norm the branch tenants held to.
  - `wp_sitemeta` may hold plugin/network options embedding the old host.
- **Blog 1's content is in UNPREFIXED tables** (`wp_posts`, `wp_options`,
  `wp_postmeta`, `wp_terms`, `wp_termmeta`, `wp_term_taxonomy`,
  `wp_term_relationships`, `wp_comments`, `wp_commentmeta`, `wp_links`, plus
  `wp_actionscheduler_*` ×4, `wp_yoast_*` ×6, `wp_litespeed_url*` ×2,
  `wp_wpvibe_*` ×2, `wp_admin_columns`, `wp_jet_post_types`,
  `wp_jet_taxonomies`, `wp_hostinger_reach_*` ×3 — 30 tables total per the
  recon), sitting directly next to the **8 network-shared tables that must
  never be touched**: `wp_users`, `wp_usermeta`, `wp_blogs`, `wp_blogmeta`,
  `wp_site`, `wp_sitemeta`, `wp_signups`, `wp_registration_log`.
- **The branch-tenant search-replace technique does NOT transfer.**
  `wp_<N>_* --all-tables-with-prefix` worked because every branch table shared
  a `wp_<N>_` prefix. For blog 1, `--all-tables-with-prefix wp_` would match
  **all 156 tables** including every other tenant's and the shared ones. Blog 1
  requires an **explicit, enumerated table list** — the ~30 unprefixed
  blog-1 tables named individually — never a prefix glob.
- `wp_jet_*` and `wp_hostinger_reach_*` are unprefixed and conventionally
  blog 1's, but may hold network-wide plugin data. Their contents must be
  inspected before they are included in any replacement.
- **Network Admin is reachable only through the main site's current domain.**
  If DNS, `DOMAIN_CURRENT_SITE`, `wp_site`, and `wp_blogs` row 1 are not all
  changed in the same tight window, there is a window where Network Admin —
  and management of **all six tenants** — is unreachable.
- Blog 1 holds its own copy of the Bricks `bricks_global_settings` /
  `myTemplatesWhitelist` (15 keys, 3 stale hostname entries). Per `AGENTS.md`
  Bricks is not a production headless dependency, so the standing decision is
  to document it, not maintain it — confirm at execution time.
- **`guid` is preserved** for Group, exactly like tenants 2–5: it is a live
  site. Search-replace runs with `--skip-columns=guid`, and criterion 1
  becomes "zero old-host occurrences in the enumerated blog-1 tables outside
  `guid`".

## Prerequisites — all must be true before the cutover window

| # | Prerequisite | Owner action / gate |
| --- | --- | --- |
| A | **Deployment platform chosen** (Vercel or Cloud Run). Determines the exact apex DNS record types (Vercel: `A`/`ALIAS` to anycast for apex, `CNAME` for `www`; Cloud Run: static `A`/`AAAA` via a Global HTTPS Load Balancer for apex). | Owner decision |
| B | **Group frontend staged and accepted (ADR-025).** A real `GROUP_STAGING_HOST` is human-confirmed; the Group frontend is deployed there, integrated against the live `cms-*` GraphQL origins, QA'd, and owner-accepted. `GROUP_STAGING_HOST` is still only a placeholder. | Owner confirms hostname; owner acceptance on staging |
| C | **`platformEgressReachabilityUnverified` closed.** One server-side GraphQL fetch from the chosen deployment platform's egress to a `cms-` host returns a non-403 GraphQL response (ADR-032). If it 403s, resolve first — hPanel CDN allowlist for the platform's egress ranges, or a CDN rule exempting the `cms-` hosts — and re-test. | Test from a preview deploy |
| D | **Group frontend production-readiness assessment.** A written comparison: does the Next.js Group frontend cover everything the live Bricks site serves — every page, every form, any dynamic or authenticated feature? Gaps are cutover blockers. | Owner sign-off |
| E | **RB-009 closed.** The scratch database (created 2026-09-10) is used to actually restore the latest full-network dump and the restore is verified intact. | — |
| F | **Main-site recon complete.** Confirmed on the live origin, read-only: the exact `wp_site` update mechanism on WP 7.0.4; the contents of `wp_jet_*` and `wp_hostinger_reach_*` (blog-1-scoped or network-wide); whether a `sunrise.php` exists; the apex registrar, current `A`/`www` records and their TTLs; a full inventory of what the Bricks apex actually serves; and that `cms-group.siratrgroup.com` has a vhost (doc root `= /home/u847585804/domains/siratrgroup.com/public_html`) and a valid SSL certificate. | — |
| G | **`cms-group.siratrgroup.com` created in hPanel**, same doc root as the branch `cms-*` hosts, SSL issued. | Owner action (hPanel) |
| H | **Task Packet issued** authorizing the cutover, naming the execution profile, the rollback definition, and the stabilization period. | Program Control / owner |

## Rehearsal — against the restored scratch database, before any live action

Because there is only one `wp_site` row and one blog-id-1 in the live install,
this step **cannot** be rehearsed in place on `staging.siratrgroup.com` (which
the recon found is a separate single-site install on its own database). Rehearse
against the isolated restored copy from prerequisite E:

1. In the scratch copy only: edit its `wp-config.php` `DOMAIN_CURRENT_SITE`;
   update its `wp_site` row; run `wp_update_site()` / `update_blog_option()`
   for blog 1; run the enumerated-table `search-replace` (blog-1 tables only,
   never the 8 shared, `--skip-columns=guid`, all four string forms); handle
   `bricks_global_settings` per the standing decision.
2. Validate in the scratch copy: Network Admin loads; every one of the six
   tenants still resolves to the right site; `infer_brand_key()` returns
   `group` on `cms-group.siratrgroup.com` and the correct key for each other
   tenant; `siraBrand` over GraphQL returns SIRA GROUP identity for group and
   no Group fallback for the others.
3. Only when that rehearsal is clean, schedule the live window.

## The cutover window — tight, coordinated, one sitting

**Before the window:** lower the apex `A` / `www` DNS TTL to 60–300s at least
one full old-TTL period ahead, so a rollback repoint propagates fast. Take a
fresh full-network `mysqldump` (direct binary — `proc_open` is disabled),
verified: exit 0, `gzip -t`, table count equal to live, completion marker
present. Confirm the legacy Bricks site is preserved and is the documented
rollback target (ADR-025) — it is **not** deleted.

In the window, in order, with owner "go" before each protected step:

1. `wp-config.php` → `DOMAIN_CURRENT_SITE = 'cms-group.siratrgroup.com'`
   (timestamped `.bak-*` copy first; `sed`, not an interactive editor).
2. `wp_site` row (id 1) → `cms-group.siratrgroup.com`, and `wp_sitemeta`
   entries carrying the old host — via a core wrapper if one exists on 7.0.4,
   otherwise a single backed-up scoped `UPDATE` (documented deviation).
3. `wp_update_site(1, …)` for the `wp_blogs` row, and `update_blog_option()`
   for blog 1's `siteurl` / `home` in the unprefixed `wp_options` →
   `https://cms-group.siratrgroup.com`.
4. `search-replace` across the **enumerated blog-1 tables only** — never a
   prefix glob — old host → `https://cms-group.siratrgroup.com`, both `http`
   and `https` forms plus their JSON-escaped forms, `--skip-columns=guid`,
   `--precise --report-changed-only`. `wp_jet_*` / `wp_hostinger_reach_*`
   included only if prerequisite F confirmed them blog-1-scoped. Every
   dry-run count reconciled against an independent SQL row count before
   writing.
5. `bricks_global_settings` / `myTemplatesWhitelist` — per the standing
   `AGENTS.md` decision (document, do not maintain), unless the owner directs
   otherwise.
6. Cache flush.
7. **DNS (protected — owner executes):** repoint `siratrgroup.com` (apex) and
   `www.siratrgroup.com` from the Hostinger WordPress origin to the chosen
   deployment platform, using that platform's required record types for an
   apex.
8. The Next.js frontend now serves the apex. The legacy Bricks Group site
   travels with blog 1 and remains reachable at `cms-group.siratrgroup.com`
   as the immediate rollback content target.

**Verify, and report before anything else:**

- Apex serves the Next.js Group frontend over HTTPS; `www` redirects to the
  bare apex.
- `cms-group.siratrgroup.com` serves the legacy Bricks site and `/graphql`.
- Network Admin loads at `cms-group.siratrgroup.com/wp-admin/network/`.
- All six tenants resolve to the right site; rows 2–6 of `wp_blogs`
  unchanged.
- `infer_brand_key()` on `cms-group.siratrgroup.com` → `group`; `siraBrand`
  over GraphQL → SIRA GROUP identity; no tenant shows a Group fallback.
- Zero old-host occurrences in the enumerated blog-1 tables outside `guid`.

## Rollback

- **Steps 1–6 (WordPress side):** restore `wp-config.php` from its `.bak-*`;
  restore the full-network dump taken at the top of the window (not a
  selective reversal — the `wp_site` / shared-table risk makes a full restore
  the safe choice). DNS is untouched at this point, so nothing public breaks
  from this rollback alone.
- **Step 7 (DNS):** revert the apex / `www` records to the Hostinger origin.
  Fast because the TTL was pre-lowered. The legacy Bricks site is back at the
  apex.
- The legacy Group environment must not be destroyed or uninstalled before or
  during the stabilization period — it is the rollback target (ADR-025).

## Post-cutover

- **Stabilization period** (ADR-025): the legacy Bricks site stays reachable
  (at `cms-group.siratrgroup.com`) as the rollback target until the owner
  ends the period.
- Update every deployment environment: `SIRA_WP_GROUP_GRAPHQL_URL` →
  `https://cms-group.siratrgroup.com/graphql`. Update `frontend/.env.example`
  and `frontend/.env.local`.
- Repo reconciliation: `openGates.groupCmsOriginRelocation` → CLOSED;
  `authorization` and topology carriers updated; an ADR (or an ADR-036
  amendment) recording the executed Group cutover; `docs/handoff-log/` and
  `docs/SOURCE-OF-TRUTH.md`. `canonicalPublicProductionTopology.apex` is
  contract-locked as `siratrgroup.com` and does **not** change — the public
  apex is still `siratrgroup.com`; only what serves it changes.
- Bring the main site's `bricks_global_settings` whitelist current or retire
  it, per whatever the owner decided at step 5.

## Open questions for the owner

1. Deployment platform: Vercel or Cloud Run? (Prerequisite A — gates the DNS
   record design.)
2. The real `GROUP_STAGING_HOST` value.
3. Is the Next.js Group frontend considered complete enough to replace the
   Bricks site, or is there a defined gap list first? (Prerequisite D.)
4. `bricks_global_settings` on the main site: bring current, or retire with
   the Bricks tooling?
5. Stabilization-period length before the legacy Bricks site can be retired.
