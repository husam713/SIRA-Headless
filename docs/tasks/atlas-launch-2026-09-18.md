# Atlas launch pass — 2026-09-18 (running record)

**Task:** TP-ATLAS-LAUNCH · **Role:** IMPLEMENTATION · **Profile:** `LOCAL` ·
**Branch:** `feat/atlas-arabic` (PR #78, on PR #77) · **Worktree:**
`SIRA-Headless-worktrees/atlas-arabic` · dev server port 3010.

## Authorization (owner, in-session, 2026-09-18, Arabic)

"Do everything you can, I agree to everything": review and finish the
newsroom (the owner's image-led design, ported from their main checkout, is
the one wanted; check headline sizes — suspected inner-HTML), write final
English bodies for every entry that lacks one, remove every placeholder /
seed marker, write and translate Arabic newsroom content, deploy to Cloud Run
(GCP project `project-9ccb9553-1ed5-4945-88a`; the four company subdomains
were already deployed by the owner with indexing off; the Group apex is not
yet pointed and the Bricks WordPress still holds the apex URL), review with
the code-review plugin and **merge** (#77 then #78) — explicitly authorized —
confirm WordPress SEO settings, and tell the owner when to add the Group DNS
(they verify the domain, copy the Cloud Run records into Hostinger, wait for
the certificate). Indexing stays off until the owner's final human review;
the owner flips it via the robots switch.

## Done so far today (all on the branch, CONFIRMED)

- Arabic edition of Atlas on blogs 1–5 (ADR-037), `docs/tasks/atlas-arabic-content.md`.
- Owner's newsroom design + Cloud Run Dockerfile + `SIRA_SEARCH_INDEXING`
  switch brought onto the branch (commit `297ba727`).
- Menus and homepage links lead to the Atlas pages; branch homepages gained a
  curated services chapter (backend + content, EN/AR); offices carry Arabic
  columns and a business unit (coloured numbers); brand Arabic tagline/address.
  Backend files installed on the origin with rollback copies
  `*.bak-20260918T042026Z` / `BrandSchema.php.bak-20260918T044806Z`.
- Prototype motion ported (subagent; `docs/tasks/atlas-motion-port.md`), merged.
- WPGraphQL Smart Cache: both seeds purge it; a WP-CLI write is otherwise
  served stale.

## Newsroom inventory (live, 2026-09-18)

Group (blog 1): 29 entries; 21 carry `_sira_seed=1`; 8 pre-Atlas records
without the marker. Bodies exist (1.3–2.3 KB) on 11 insight/article records;
the rest are headline + summary only (body=1) or a short blurb (<100 chars).
Companies: consulting 7 (2 trashed-slug leftovers), healthcare 8, real estate
7, lifestyle 6 — same mix. The seed marker must go, every entry needs a final
English body, and every entry needs an Arabic twin.

## Plan (in order)

1. Backend: `sira_locale` / `sira_translation_of` on the four editorial types
   (locale field group location + GraphQL types); install; recapture schema.
2. Frontend: `/ar/news/` and the article route resolve translations first,
   fall back to English; feed filtered by locale with the Digital fallback rule.
3. Content: `tools/seed/newsroom-final.json` (+ `.ar.json`) with a final
   English body for all entries and Arabic twins; a seed that upserts by slug,
   strips `_sira_seed`, and purges caches. Then `node tools/verify-no-seed-content.mjs`.
4. Newsroom design review at 1440/390 (headline scale, inner-HTML sizing).
5. Code review (plugin) → merge #77 → #78 into `main`.
6. Deploy: `gcloud` on this machine; inspect the existing services; build and
   deploy the new image from `main`; Group apex: relocate blog 1's CMS origin
   per the plan in `docs/tasks/` (branch `docs/cms-origin-relocation-reconciliation`,
   commit `b7ecda7f`), then give the owner the DNS records.
7. WordPress SEO settings check.
