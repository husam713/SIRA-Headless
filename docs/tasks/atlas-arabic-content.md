# Atlas Arabic edition — Group and the four companies

**Task:** TP-ATLAS-ARABIC · **Role:** IMPLEMENTATION · **Profile:** `LOCAL`
(`localEvidenceRequired: true` — live WordPress over SSH, browser QA against
the live CMS) · **Branch:** `feat/atlas-arabic` (on `feat/atlas-production-site`,
PR #77) · **Date:** 2026-09-17/18 · **Decision:** ADR-037

## Authorization

Owner instruction, in-session, 2026-09-17 16:50 ("ابدأ العربية") after the
question "is the Arabic edition ready?" was answered "no — Digital only", and
again 2026-09-18 ("ابدأ") after the recovery report. The first session did
two hours of read-only investigation and dropped (`ECONNRESET`, 18:45) before
writing anything; this task is the whole implementation.

This authorizes: Arabic content and menu writes on blogs 1–5, frontend work on
the locale routes, `localeRoutesApproved: true` on the five tenants, a backup
before the first write. It does **not** authorize merge to `main`, deployment,
DNS, backend/plugin changes, the newsroom, or any destructive database
operation — none was performed.

## Baseline and backup

- Repository baseline: `feat/atlas-production-site` @ `a0dd3ca3` (PR #77, CI
  green, `MERGEABLE`), itself on `main` @ `0dd08528`.
- Backup, taken and verified before the first write:
  `~/sira-backups/sira-multisite-db-20260917T202219Z-pre-arabic.sql.gz`
  (7.7 MB, `gzip -t` OK, 156 `CREATE TABLE` = 156 live tables, "Dump
  completed" marker present). `wp db export` is unavailable on this host
  (`proc_open` disabled); `mysqldump` with the credentials read through
  `wp config get` is the working method, as on 2026-09-17.

## What was written

Mechanism: [`tools/seed/atlas-seed-ar.php`](../../tools/seed/atlas-seed-ar.php)
driven by [`tools/seed/atlas-seed.ar.json`](../../tools/seed/atlas-seed.ar.json),
`wp eval-file … [dry-run] --url=<tenant>` once per tenant, dry run first.
Idempotent on slug (+ parent for pages) and menu name. ADR-034's model:
`sira_locale = ar`, `sira_translation_of` = the English twin, `ar-` slug
prefix on custom post types, pages under the `ar` page, the `ar` page as the
Arabic homepage. A translation borrows its twin's featured image, gallery,
business unit, `menu_order` and dates — no media was imported or changed.
The Arabic homepage is a copy of the English homepage's post meta (both the
values and ACF's `_field => key` references, so it is editable in the admin)
with every id list re-pointed at the translations, then the authored Arabic
laid over it by meta name.

| Tenant | Home | Pages | Services | Projects | Other | Menus |
|---|---|---|---|---|---|---|
| Group (1) | `ar` (id 1832), 96 authored values | our-services, our-projects, contact-us, investors | 4 | 6 | 4 companies, 3 investments, 3 testimonials | primary_ar, footer_ar |
| Consulting (2) | `ar`, 46 values | 3 | 4 | 3 | — | primary_ar, footer_ar |
| Healthcare (3) | `ar`, 46 values | 3 | 4 | 3 | 1 company (Rosina) | primary_ar, footer_ar |
| Real Estate (4) | `ar`, 46 values | 3 | 4 | 3 | — | primary_ar, footer_ar |
| Lifestyle (5) | `ar`, 46 values | 3 | 4 | 3 | — | primary_ar, footer_ar |

Digital (blog 6), the newsroom content types, the English records and the
brand options were not touched. Existing `primary` / `footer` menu
assignments were kept; the `_ar` locations were added beside them.

### Decisions recorded here

1. **No `_sira_seed` marker**, as for the English Atlas content: production
   content, reviewed by the owner.
2. **The Arabic menus link to the Atlas pages** (`/ar/projects/`,
   `/ar/contact/`, `/ar/investors/`) where the English menus still link to
   homepage anchors (`/#projects`). Both work; the English menus predate the
   Atlas pages and were left as the owner accepted them.
3. **Brand options — closed 2026-09-18.** The brand options gained
   `sira_brand_tagline_ar` / `sira_brand_address_ar`, and each office row
   `name_ar`, `address_ar` and `business_unit`; the four plugin files were
   linted and installed on the origin (rollback copies `*.bak-20260918T042026Z`
   and `BrandSchema.php.bak-20260918T044806Z`), the schema recaptured over
   SSH, and `getBrand(siteKey, "ar")` folds the Arabic columns in. The seeds
   write them. WPGraphQL Smart Cache served a stale response until purged;
   both seeds now purge it at the end.
4. **The newsroom is English-only.** Arabic pages list its items as written,
   with Arabic kickers (kind, dateline, desk). The Group homepage's
   latest-updates and insights chapters therefore show English headlines.
5. **A re-run overwrites editor edits on the Arabic homepage** (the meta copy
   is repeated), by design: the payload is the source until the owner
   takes the content over in the admin. Edit the JSON, not the admin, while
   the seed is still the source.

### Specifics an editor must confirm or rewrite

The Arabic is a translation of the English Atlas content, so every claim
listed in `docs/tasks/atlas-production-content.md` ("Specifics an editor must
confirm or rewrite") stands here in Arabic too. Terminology chosen here and
easy to change in one place (`atlas-seed.ar.json`, `frontend/src/lib/i18n/locale.ts`):

- Brand names: مجموعة سيرة · سيرة للاستشارات · سيرة للرعاية الصحية ·
  سيرة العقارية (site name) / سيرة للتطوير العقاري والاستشارات (company
  record) · سيرة لايف ستايل · سيرة الرقمية.
- Project names: سيرة برايم · مركز روزينا للتشخيص · مركز التصوير PET-CT ·
  المساكن الساحلية · منصة الضيافة.
- Business units: العقارات · الرعاية الصحية · أسلوب الحياة · الاستشارات.
- Statuses: قيد التطوير · قيد التشغيل · مخطط · مرحلة التأسيس · مفهوم ·
  قيد الدراسة · قيد التنفيذ.
- Numerals stay Latin throughout (ADR-034).

## Frontend changes in the same branch

- `localeRoutesApproved: true` on Group, Consulting, Healthcare, Lifestyle,
  Real Estate (`config/sites.ts`); tests that pinned the gate now assert the
  new state, and the single-locale sitemap case keeps a derived registry.
- `lib/i18n/record-href.ts`: `publicRecordHref` (`/projects/ar-x/` →
  `/ar/projects/x/`), `recordHrefLocale`, `recordUrisForLocale`.
- Project archive: `siraLocale` in the query, `locale` on each item,
  `getProjectArchiveForLocale` (filter with Digital's fallback rule),
  `getProjectSingleForLocale` (translation first). Sitemap lists the
  default-locale archive and lets `buildSitemap` expand per locale.
- Homepage normalizer localizes record hrefs; investor items use their
  related project's public href directly.
- Chrome gains `generalEnquiry`, `getInTouch`, `investorRelations`,
  `howItWorks`, `contact`, `editorialKinds`, `readMore`, `siteNames`,
  `businessUnits`, `companyStatus`; `localizeUnitLabel` and
  `localizeCompanyStatus` read them. `ContactForm` takes `locale`.
  `GroupContact`, `GroupInsights`, `GroupLatestUpdates`, `GroupInvestor`,
  `GroupProjects`, `GroupCompanies`, `InsightRows` take `locale`;
  `formatContentDate` takes it; every cross-site link keeps the language.

## Validation (branch head, Windows, live CMS)

| Check | Status |
|---|---|
| `tsc --noEmit`, `eslint .` | PASS |
| `vitest run` | PASS 687/687 — `launch-gate.test.ts` fails to load (known Windows CRLF defect, PR #70) |
| `next build` | PASS (with the dev server stopped: a running `next dev` in the same worktree leaves `.next/dev/types` that the build's type check collides with — a tooling condition, not a source defect) |
| `git diff --check` | PASS |
| GraphQL, Group `/ar/`: variant, hero, slides → Arabic projects, companies/projects/services/investments/testimonials → translations, `/ar/our-services/` with inherited featured image | PASS |
| Seed dry-run then write, 5 tenants | PASS, no warnings; 21 + 8 + 9 + 8 + 8 translations linked |
| Browser 1440 px, Group: `/ar/`, `/ar/services/`, `/ar/projects/`, `/ar/projects/sira-prime/`, `/ar/investors/`, `/ar/contact/` | PASS — RTL, Arabic type, filters, accordion, drawer label, closing, footer |
| Browser 1440 px: Consulting, Healthcare, Real Estate, Lifestyle `/ar/`; Healthcare `/ar/projects/regional-network-expansion/` | PASS |
| Browser 390 px: Group `/ar/`, Lifestyle `/ar/services/` | PASS |
| Remaining English on Arabic pages | newsroom headlines (decision 4); the Group mobile hero's interim image carries baked-in English text (owner replaces images). The office list, tagline and address are Arabic since 2026-09-18 (decision 3) |
| CI | NOT RUN (PR to be opened) |

## Rollback

- Frontend: revert the branch commits.
- WordPress: restore `sira-multisite-db-20260917T202219Z-pre-arabic.sql.gz`,
  or delete the Arabic records only — every one has `sira_locale = ar` and a
  slug beginning `ar-` (custom post types) or the `ar` page as ancestor
  (pages); the ten menus are named `<Tenant> Arabic Primary Ar` / `… Footer Ar`.
  No media was added, so nothing in `uploads/` changes either way.

## Next gate

Owner review of the Arabic content on the running branch
(`<tenant>.localhost:3010/ar/` from this worktree), then independent
verification and the merge decision for PR #77 and this branch's PR. Launch
still needs the open gates in `docs/STATE.md`.
