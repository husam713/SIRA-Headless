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

## Outcome (2026-09-18, end of pass)

| Step | Status |
|---|---|
| Newsroom: locale on the four editorial types (backend installed, rollback `PresentationFields.php.bak-20260918T081812Z`), `/ar/news/`, translation-first article route, feed fallback rule | PASS |
| Newsroom content: 34 unique entries final in English (11 bodies kept, 23 written), all with Arabic twins, photographs from each tenant's pool, seed markers removed, four junk records trashed, one slug renamed | PASS — `verify-no-seed-content`: blogs 1–5 clean |
| Newsroom design review: lead headline capped at 4rem; chrome localized; placeholder caveat removed | PASS |
| Code review (plugin, medium): 7 findings, all fixed and pinned (`e0efa529`) | PASS |
| Merge: #77 then #78 into `main` (`ed781fdc`), CI green on both | PASS |
| Build + deploy: Cloud Build image `nextjs:ed781fdc`, Cloud Run `sira-frontend` rev `00006-ts6`; smoke test on the four subdomains + run.app in both languages | PASS |
| Blog 1 relocation to `cms-group` + sunrise mapping (ADR-038) | PASS — see ADR-038 for the evidence |
| Apex domain mappings `siratrgroup.com`, `www.siratrgroup.com` | CREATED — waiting for DNS |
| SEO audit of a live page: title, description, canonical, `hreflang` ×3, Open Graph, JSON-LD; robots `noindex` while the switch is off; sitemap empty by the same switch | PASS |
| WordPress SEO (Yoast, network-active) | NOT APPLICABLE to the public site — the frontend owns SEO; `blog_public=0` stays on every `cms-*` origin |

### Claims an editor must confirm (invented specifics in the final newsroom)

The same list as `docs/tasks/atlas-production-content.md`, plus: the OVAN
partnership's "three districts" and quote; the PET-CT wing's isotope
partnership and published turnaround times; the consulting mandate's
"European healthcare operator" client and "third mandate"; the four senior
appointments; the 2025 portfolio review's "no position exited"; the Group CIO
appointment; the referral agreement's three practices and specialties; every
Arabic rendering of a proper noun (سيرة برايم، روزينا، OVAN).

### DNS hand-over (owner)

`siratrgroup.com` — A: 216.239.32.21, 216.239.34.21, 216.239.36.21,
216.239.38.21; AAAA: 2001:4860:4802:32::15, 2001:4860:4802:34::15,
2001:4860:4802:36::15, 2001:4860:4802:38::15. `www.siratrgroup.com` — CNAME
`ghs.googlehosted.com.`. Remove the Hostinger A/CNAME records for those two
names first. Google issues the certificate once the records resolve.
