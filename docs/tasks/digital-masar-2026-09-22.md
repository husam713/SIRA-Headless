# SIRA Digital — "Masar": a new site for the technology company

**Task:** TP-DIGITAL-MASAR · **Role:** IMPLEMENTATION · **Profile:** LOCAL (localEvidenceRequired) · **Branch:** `feat/digital-masar` · **Worktree:** `SIRA-Headless-worktrees/digital-masar` · dev server port 3030, production probe port 3031 · **Date:** 2026-09-21 → 2026-09-22 · **Reference:** the owner's brief (in session, 2026-09-21); `https://sirahdigital.in/` as the bar for motion and interaction, not as a source of content.

## Authorization and scope

Owner instruction, in session, 2026-09-21: create an extraordinary website for SIRA Digital; a completely different palette and visual identity from ADR-033 is explicitly authorized; present the company honestly without inventing clients, achievements or results; Arabic and English as equal experiences; implementation, testing, committing, pushing the branch and opening a PR are authorized; merge and production deployment stay with the owner.

Explicitly not done: no merge, no deploy, no DNS, no CMS write (blog 6's 94 placeholder records are untouched, and no test submission was sent through the live contact endpoint — the form was exercised against a mocked `/api/contact/`), no change to the brand presets or `BrandManager.php`, no dependency added.

## Baseline

`main` @ `2cb12ca9` (PR #80). Worktree created from it; `.env.local` copied from the main checkout for the CMS origins.

## The direction

One idea carries the whole site: the SIRA mark is one continuous line that turns at right angles, and SIRA Digital routes the work. That line becomes a living system — a routing field that draws itself across the hero and bends around the pointer and the headline; a spine along the reading edge whose head travels with the scroll; a hand-drawn glyph per capability; the image the route arrives at on the closing chapter. In Arabic the entire system runs right to left.

- **Palette:** lapis on bone. Lapis `#1c34d8` (the pigment of Islamic geometric art) for the line and the deep chapters, bone `#f4f4ef` as paper, ink `#101216` for type, and one vermilion signal `#ff4d1f` reserved for what is live — the spine head, the active chip, the caret — never for text. Nothing from ADR-033's dark ground and Group gold remains; the sister companies' hues appear once, on the group tiles, as a fact about where this company sits.
- **Type:** two voices from one family. Archivo with its width axis, set semi-expanded, is the display voice; Archivo is the text; IBM Plex Mono is the instrument layer (indices, eyebrows, the clock); Noto Kufi Arabic carries both Arabic roles, with tracking neutralised, leading relaxed and Latin numerals (ADR-034).
- **Composition:** bone → lapis (the point of view, read by a moving light) → bone (six stations on a hairline schematic) → bone-2 (four stops on one route) → lapis (four commitments) → bone (the group) → lapis (the ask) → lapis-ink (footer).
- **The next step:** `/contact/` is a brief composer. The visitor picks what repeats and what would help; the page writes the sentence live, in the reader's language, and sends it with the form through the existing tenant-scoped pipeline. A person reads it; the page says so.

## What was built

| Area | Files | Notes |
|---|---|---|
| Narrative (EN/AR) | `frontend/src/content/digital-site/{types,en,ar,index}.ts` | Typed, one shape for both languages; Arabic written as business Arabic, not rendered from English |
| Routing field | `frontend/src/lib/digital-site/route-field.ts`, `components/digital-site/field/{static-field,live-field}.tsx` | Pure, seeded; the server renders a still as SVG, the client continues the same system on a canvas |
| Document | `components/digital-site/{document,header,footer,spine,clock,glyphs}.tsx`, `styles/digital-site.css`, `styles/digital-fonts.ts` | Own `<html>`; popover menu with no script; scroll-driven spine and reveals in CSS |
| Pages | `components/digital-site/pages/{home,services,about,contact,not-found,prose}.tsx`, `sections/*` | Home, What we build, Company, Start (brief composer), 404, CMS prose in the Digital voice |
| Brief composer | `components/digital-site/brief-composer.tsx`, `lib/digital-site/brief.ts` | Client island; pure sentence composition tested in both languages |
| Route branches | `app/(sites)/[siteKey]/{layout,page,not-found}.tsx`, `services`, `contact`, `about`, `[section]` (own pages); `work`, `industries`, `industries/[slug]`, `news`, `[section]/[slug]` (404 on Digital) | The layout branch sits before any CMS query; `resolveAtlasPage` already refuses Digital |
| Metadata and assets | `lib/digital-site/metadata.ts`, `public/digital/{icon.svg,share-en.png,share-ar.png}` | Canonical/hreflang/robots from the platform; titles, description, icon and share image Digital's own |
| Tests | `frontend/tests/unit/digital-site/{route-field,content,brief,document-gates}.test.ts` | 35 tests: algorithm invariants, EN/AR parity, a claims denylist, composer joins, CSS scoping and motion gates, route branches, client-island census |
| Decision record | `docs/DECISIONS.md` ADR-039 (PROPOSED) | Awaits the owner |

Removed: `services/digital-services.tsx` and `contact/digital-contact.tsx` (the ADR-033 route helpers these routes no longer dispatch to). Left on disk, unreferenced by Digital and still tested: `components/digital/*`, the `.digital-*` block in `globals.css`, and the CMS `digitalHomepage` branch in `page.tsx`.

## Claims an editor must confirm

The narrative describes capability and practice; none of it names a client, a figure, a person, an office or a date. Two kinds of sentence are nonetheless statements about how the company works and should be read by the owner before launch:

- The four stages under "How we work" (map, design, build, run) and "What happens next" on the contact page.
- The four commitments ("People stay in charge", "Systems explain themselves", "Arabic is not an afterthought", "Simple beats clever").

The Arabic company name follows the chrome (`سيرة الرقمية`); the Latin follows the registry (`SIRA Digital`). Both remain subject to the open spelling gate. The wordmark and the nesting-line glyph are interim, pending the Digital mark the owner owes under ADR-033.

## Validation

Run from `frontend/` on the worktree, against `main` @ `2cb12ca9` plus this branch.

| Check | Status | Evidence |
|---|---|---|
| `pnpm lint` | PASS | clean |
| `pnpm typecheck` | PASS | clean |
| `pnpm test:run` | WARNING | 727/727 tests pass; `tests/unit/launch-gate.test.ts` fails to *load* on Windows (CRLF, identical to `main`, loads on CI's Linux) |
| `pnpm build` | PASS | 61 static pages, all `(sites)` routes dynamic |
| `pnpm verify:layout` | PASS | 75/75 |
| `pnpm verify:fixtures` | PASS | 114/114 |
| `pnpm test:runtime-preview` | PASS | Step 3C.2 runtime verification |
| `node scripts/qa-sweep.mjs http://localhost:3031 digital` | PASS | 16/16 — 390/768/1280/1920 × normal/reduced motion × EN/AR: no overflow, targets ≥ 44px, header settles, first Tab focuses a visible ring |
| `node scripts/measure-web-vitals.mjs http://localhost:3031 digital` | PASS | `/` cold: TTFB 59 ms, FCP/LCP 580 ms, CLS 0.000, 23 requests; warm: FCP/LCP 348 ms |
| Brief composer, EN and AR (Playwright, `/api/contact/` mocked) | PASS | Sentence composes live; empty submit shows two field errors and posts nothing; a valid submit posts `{name,email,phone,service,message}` with the brief prepended and renders the received state |
| Popover menu, 390 px | PASS | Opens on the button, closes on Escape, EN and AR |
| Other tenants unchanged | PASS | Group `/` and `/services/` render the Atlas shell with `data-brand-key="group"`; no `dg-` markup; Digital pages contain no Atlas shell |
| CSS/JS cost | WARNING | Digital's sheet (36 KB raw / 7 KB gz) is emitted in every tenant's CSS by the bundler, scoped so it is inert there; Digital-owned client JS ≈ 20 KB gz on top of the platform's framework chunks |
| CI | NOT RUN | PR to be opened |
| Owner review of the direction | NOT RUN | ADR-039 is PROPOSED |

## Rollback

Revert the merge commit; nothing outside the repository was changed. `git diff main --stat` on the branch is the whole blast radius.

## Not done / observed outside scope

- `frontend/tests/unit/launch-gate.test.ts` cannot load on Windows because of CRLF line endings (pre-existing; not touched).
- The disk on the owner's machine reached 0 bytes free during this task; stopping the worktree's dev server and clearing its `.next` cache freed ~3.8 GB. No other worktree was touched.
- `SIRA_SEARCH_INDEXING` is off in production and `digital.localhost` is a deployment host, so every page above carries `noindex` by design.
