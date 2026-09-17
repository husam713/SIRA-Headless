# Atlas production content — Group and the four companies

**Task:** TP-ATLAS-CONTENT · **Role:** IMPLEMENTATION · **Profile:** `LOCAL`
(`localEvidenceRequired: true` — live WordPress over SSH, browser QA against
the live CMS) · **Branch:** `feat/atlas-production-site` · **Date:** 2026-09-17

## Authorization

Owner instruction, given in-session on 2026-09-17 (Arabic, paraphrased):

> Build the final production phase: every page created in SIRA Atlas, with
> the same design, motion and content. Go into WordPress and add the content
> and images yourself — sample images are fine, I will replace them later.
> Change server settings if you need to; take a backup before you start. Do
> not touch the newsroom design that is merged on `main`. Do not label the
> content as trial. Give me the image specifications afterwards — size, and
> whether any slot has a phone-specific image.

This authorizes: WordPress content and media writes on blogs 1–5 (not Digital,
blog 6), frontend work on the Atlas routes, and a backup before the first
write. It does **not** authorize merge to `main`, deployment, DNS, cutover,
`blog_public`, taxonomy deletion or any destructive database operation — none
was performed.

## Baseline and backup

- Repository baseline: `main` @ `0dd08528` (PR #73); branch head before this
  task `e5d0092c` (PR #75's `8315d1cb` + `feat/platform-roadmap`).
- Backup, taken and verified before the first content write:
  `~/sira-backups/sira-multisite-db-20260917T155150Z.sql.gz` (7.6 MB, `gzip -t`
  OK, 156 `CREATE TABLE` = 156 live tables). An uploads archive from the same
  morning exists beside it (`sira-uploads-20260917T034804Z.tar.gz`); no upload
  was modified or deleted by this task, only added.
- One write preceded that dump by minutes: the first "dry run" of the seed was
  not dry (a scoping defect, fixed before anything else ran) and it copied the
  missing hero-slide file, wrote the Group office locations and updated the
  `our-services` page. The earlier verified dump
  `sira-multisite-db-20260917T034804Z.sql.gz` predates all writes.

## What was written

Mechanism: [`tools/seed/atlas-seed.php`](../../tools/seed/atlas-seed.php)
driven by [`tools/seed/atlas-seed.json`](../../tools/seed/atlas-seed.json),
run once per tenant with `wp eval-file … --url=<tenant>` after a `dry-run`
pass. Idempotent on slug / media key. Content authored from the approved Atlas
prototype (`frontend/prototypes/sira-atlas/data.js`, PR #75).

| Tenant | Pages (intro + hero + body) | Services | Projects | Other |
|---|---|---|---|---|
| Group (1) | our-services, our-projects, contact-us updated; **investors created** | 4 rewritten (dek, coverage list, image, business unit, order) | 3 updated, **3 created** (PET-CT Imaging Center, Istanbul Financial District Advisory, Coastal Residences) — subtitle, location, status, body, gallery, statistics, related company, business unit, date | 4 office locations; investment `diagnostic-network-expansion` → PET-CT project; testimonial `testimonial1` filled; hero slide 1 file repaired (was 404) |
| Consulting (2) | 3 created | 4 created | 3 created | 2 offices |
| Healthcare (3) | 3 created | 4 created | 3 updated (were empty shells) | 2 offices |
| Real Estate (4) | 3 created | 4 created | 3 updated (were empty shells) | 2 offices |
| Lifestyle (5) | 3 created | 4 created | 3 updated (were empty shells) | 2 offices |

Digital (blog 6) and the newsroom content types were not touched.

### Decisions recorded here

1. **No `_sira_seed` marker.** The owner asked for production content, not
   placeholder. `tools/verify-no-seed-content.mjs` therefore does not count
   these records; the owner's review replaces the launch gate for them.
2. **Step 2C.3C archive contract amended** (owner decision, this session): the
   project archive query now carries `date`, the project's business unit and
   its one related company (each bounded to one). Gallery, statistics and the
   rendered body stay out of the archive. `tests/contract/query-contracts.test.ts`
   and `step-2c3c-closure.test.ts` say why.
3. **Interim photography.** 16 images imported from Wikimedia Commons (13 CC0,
   two CC BY-SA, one CC BY) plus SIRA's own existing files reused across
   tenants. Every imported attachment carries the source page, author and
   licence in its caption/description and `_sira_atlas_media=<key>` so it can
   be found and replaced. The CC BY / BY-SA ones need the credit kept or the
   image replaced before launch: `hero-contact`, `istanbul-bosphorus`,
   `pet-scanner`.

### Specifics an editor must confirm or rewrite

The prototype invented these and they are now on the pages. They read as
fact; treat each as a claim to verify:

- Sira Prime: 64 villas, 9.2 ha, handover Q1 2028, pre-sales opened Q2 2026.
- Rosina: 30,000+ scans a year, +42 % YoY, PET-CT wing since July 2026, opened 2021.
- PET-CT Imaging Center: second East African city, regional cyclotron partner, 2027.
- Coastal Residences: 38 units, adjoining Sira Prime, 2028.
- Consulting mandates: "East Africa Market-Entry Programme", "Gulf Capital
  Structuring Mandate" — entirely authored here; the advisory mandate's
  corridor and scope likewise.
- Healthcare "Regional Network Expansion": three cities over five years.
- Real Estate "Mixed-Use Concept": European-side site, design competition 2027.
- Lifestyle "Leisure Destinations": Aegean and Red Sea sites, first opening 2027.
- Testimonial "Selin Kaya, Principal, family office" — authored quote, no
  third party named.
- Office locations (Paris investor relations, Riyadh, Levent head office).

## Frontend changes in the same branch

- Query contracts reconciled (above); `relatedProject` gets truncation
  evidence; homepage bound count 17 → 18.
- Plain-text normalisers decode WordPress entities (`&#8217;` was rendering
  literally in project excerpts).
- `lib/atlas/metadata.ts`: Atlas routes stop double-branding the `<title>`
  (the tenant layout already applies `%s | Brand`), strip highlight marks from
  titles, and send their own title, description and hero to Open Graph and
  Twitter. **Reported, not repaired:** `about`, `industries`, `work`,
  `[section]` and `[section]/[slug]` have the same double-brand title.

## Validation (branch head, Windows, live CMS)

| Check | Status |
|---|---|
| `tsc --noEmit`, `eslint .` | PASS |
| `vitest run` | PASS 679/679 — `launch-gate.test.ts` fails to load (known Windows CRLF defect, PR #70) |
| `next build` | PASS |
| `git diff --check` | PASS |
| Browser, 1440 px: Group `/`, `/services/`, `/projects/`, `/investors/`, `/contact/`, 3 project pages; each company `/services/`, `/projects/`, `/contact/`, 2 project pages | PASS — content, photography, filters, accordions, closings render |
| Browser, 390 px: `/investors/`, Lifestyle `/services/`, Real Estate project page | PASS |
| `<title>`, description, canonical, `og:image`, `twitter:card` on 5 routes | PASS after the metadata fix |
| Live hero slide 1 file (`…/2026/04/SIRAPRIME_Katalog-R2.jpg`) | 200, sizes regenerated |
| CI | NOT RUN (PR opened) |

## Image specifications for the owner

All slots take one landscape image and crop it with `object-fit: cover`
centred, so keep the subject in the middle third. JPEG quality 80 or WebP;
WordPress generates the smaller sizes.

| Slot | Where | Rendered ratio | Supply | Target file size | Phone-specific? |
|---|---|---|---|---|---|
| Page hero | `/services/`, `/projects/`, `/investors/`, `/contact/` featured image | full-bleed, 56–74 % of the viewport height | 2400 × 1350 | ≤ 400 KB | No — same image, cropped tighter; keep subject central |
| Homepage hero slide | Group homepage slides; branch homepage hero | full viewport | 2560 × 1440 | ≤ 500 KB | **Yes, optional** — `mobile_image` override, 1080 × 1920 portrait |
| Project card | project ledger, homepage projects | 4 : 3 (first Group card 16 : 10) | 1600 × 1200 | ≤ 250 KB | No |
| Project gallery | project page, 3 per row | 4 : 3; every third image spans the row at 21 : 9 | 1600 × 1200; third image 2400 × 1030 | ≤ 300 KB | No |
| Service figure | services accordion | 4 : 3 | 1200 × 900 | ≤ 200 KB | No |
| Next-project band | bottom of a project page (that project's featured image) | full-bleed, 50 % of the viewport | same file as the project card | — | No |
| Company card | homepage house of companies | 4 : 3 | 1600 × 1200 | ≤ 250 KB | No |
| Open Graph / social | every page (its featured image) | 1.91 : 1 crop by the platform | ≥ 1200 × 630 | — | No |

## Rollback

- Frontend: revert the branch commits.
- WordPress: restore `sira-multisite-db-20260917T155150Z.sql.gz`; the imported
  media files are additive and can be deleted by `_sira_atlas_media` meta
  (`wp post list --post_type=attachment --meta_key=_sira_atlas_media`).

## Next gate

Owner review of the content and photography on the running branch, then the
usual independent verification and merge decision for the PR. Launch still
needs the open gates in `docs/STATE.md` (RB-009, ADR-032 egress,
`blog_public`, seed removal for the newsroom).
