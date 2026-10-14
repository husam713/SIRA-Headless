# 05 — Implementation guide

**For:** engineers maintaining or extending the SIRA Digital site in this repository. · **Branch:** `feat/digital-enterprise-prototype` (stacked on PR #81) · **Decision record:** ADR-039 and its amendment in `docs/DECISIONS.md`.

Read `.claude/rules/frontend.md` for the platform rules; this guide covers only what is specific to Digital.

---

## 1. How Digital is served

The platform is one Next.js 16 App Router app serving six tenants by hostname. Digital differs from the other five in one way: **it renders its own `<html>` document from a narrative versioned in the repository**, instead of composing CMS records.

```
request (digital.* host)
  └─ proxy → /[siteKey=digital]/…
       └─ app/(sites)/[siteKey]/layout.tsx
            └─ if site.key === "digital": dynamic import components/digital-site/document.tsx
                 (own <html lang dir data-site="digital">, Plex fonts, header, footer)
                 — branches BEFORE any brand, navigation or homepage CMS query
       └─ page routes
            ├─ [siteKey]/page.tsx              → DigitalHome
            ├─ services/, industries/, about/, contact/  → Digital branch inside each shared route
            ├─ [section]/page.tsx              → registry-first: erpnext | automation | method
            │                                    (before it would ask the CMS for a page of that slug)
            ├─ [section]/page.tsx (privacy, terms) → CMS prose rendered in Digital's document
            └─ news, work, projects, industry detail, investors → notFoundOnDigital() → 404
```

Arabic is the same tree under the locale prefix (`/ar/…`), resolved by the platform's locale routing.

## 2. File map

| Concern | Path (under `frontend/src/`) |
|---|---|
| Narrative types (one shape for both languages) | `content/digital-site/types.ts` |
| English / Arabic narrative | `content/digital-site/{en,ar}/{common,catalogue,demos,pages}.ts`, assembled in `{en,ar}/index.ts` |
| Loader | `content/digital-site/index.ts` → `getDigitalSiteContent(locale)` |
| Illustrative sample data (language-neutral) | `content/digital-site/demo/{workflow,dashboard}.ts` |
| Route registry | `lib/digital-site/routes.ts` (`DIGITAL_ROUTES`, `DIGITAL_SECTION_PAGES`, `DIGITAL_PROSE_PATHS`, `notFoundOnDigital`) |
| Pure logic | `lib/digital-site/workflow.ts` (approval rules), `discovery.ts` (form brief), `route-map.ts` (hero geometry), `format.ts` (numbers/currency), `hrefs.ts` (locale links), `metadata.ts` (title, canonical, hreflang, OG) |
| Document, chrome | `components/digital-site/{document,header,footer,glyphs}.tsx` |
| Building blocks | `components/digital-site/{primitives,diagrams,route-map,dashboard}.tsx` |
| Client Components (the only three) | `components/digital-site/{tabs,workflow-simulator,discovery-composer}.tsx` |
| Pages | `components/digital-site/pages/*.tsx`, home sections in `sections/{hero,home}.tsx` |
| Styles, fonts | `styles/digital-site.css`, `styles/digital-fonts.ts` |
| Sitemap branch | `app/sitemap.ts` |
| Tests | `tests/unit/digital-site/{content,document-gates,workflow,discovery,route-map}.test.ts` |

## 3. Editing content

1. Change the **English** string in the right part file (`pages.ts` for a page, `catalogue.ts` for shared lists, `common.ts` for chrome and metadata, `demos.ts` for the demonstrations).
2. Make the **same** change in the Arabic file. Shape, keys, indices and hrefs must match; the test reports the first difference by path.
3. Run `pnpm exec vitest run tests/unit/digital-site`.

The content tests will refuse:

- a string present in one language only, or an empty string;
- Latin text in the Arabic edition (except shared keys and the language-switch label) or Arabic text in English (except the name echo);
- Arabic-Indic digits in either edition;
- **claims the owner has not supplied** — patterns for counts ("120+ projects", "10 years"), percentages, awards, certifications, testimonials, city names of offices, and names belonging to the unrelated company that shares the name;
- a link to a route Digital does not serve, or a reference to a module/question key that does not exist.

When the owner approves a real claim (a partner badge, a CR number), it needs both a content change **and** a deliberate change to the denylist in `content.test.ts`, reviewed in the same PR.

Sample figures (dashboard, simulator thresholds) live in `demo/*.ts`, outside the narrative, and are always rendered with the "Illustrative" label (asserted by `document-gates.test.ts`).

## 4. Adding a page

1. Add the key to `DigitalPageKey` and the narrative type in `types.ts`; add the page's text to both `pages.ts` files and its `meta.pages` entry to both `common.ts` files.
2. Add the path to `DIGITAL_ROUTES`. If the slug has no static route in the shared tree, also add it to `DIGITAL_SECTION_PAGES` — `[section]/page.tsx` will serve it before asking the CMS, so the shared route tree is not touched.
3. Write `components/digital-site/pages/<page>.tsx` from `PageIntro`, `Section`, `SectionHead`, `Closing`, `Related`.
4. Add it to the navigation in `common.ts` if it belongs there.
5. The sitemap picks it up from the registry; the document-gates test asserts the page is rendered on its route and listed in the sitemap.

## 5. Styling rules

- Every selector starts with `html[data-site="digital"]` or a `.dg-` class (test: *scopes every selector to the Digital document*). The sheet is bundled into every tenant's CSS; scoping is what keeps it inert there.
- Read **role** tokens (`--dg-text`, `--dg-surface`, `--dg-accent`), not palette tokens, inside components, so tones keep working.
- Logical properties only. Mirror direction-dependent transforms with `:dir(rtl)` / `[dir="rtl"]` where a transform cannot be logical.
- New motion: inside `@media (prefers-reduced-motion: no-preference)`; scroll-driven motion additionally inside `@supports (animation-timeline: view())`; hover inside `@media (hover: hover)`. The tests check all three.
- State colours on markers only; text uses the `*-fg` tokens.

## 6. Client JavaScript

Three islands, asserted by a test that lists every `"use client"` file under `components/digital-site/`:

| Island | Why it needs the client |
|---|---|
| `tabs.tsx` | roving focus and arrow keys that follow reading direction |
| `workflow-simulator.tsx` | live re-routing from `routeRequest()` and the timed run |
| `discovery-composer.tsx` | live brief, validation, `fetch` to `/api/contact/` |

The header menu (native `popover`), the FAQ (`<details name>`), the hero pause (checkbox + `:has()`) and every diagram need no script. Adding a fourth island means changing that test on purpose.

## 7. The discovery form

`discovery-composer.tsx` posts JSON to the platform's existing `/api/contact/` route, which validates, rate-limits and forwards to the tenant's WordPress `sira/v1/contact` endpoint. Mapping (pure functions in `lib/digital-site/discovery.ts`, tested):

| Endpoint field | Value |
|---|---|
| `service` | first chosen area's label, else the situation's label, else "Discovery call"; ≤ 80 characters |
| `message` | composed brief + "Company: …" line + the visitor's free text, separated by blank lines |
| name, email, phone | as entered (phone optional) |
| `company_website` (honeypot) | hidden field; when filled, the route answers success and forwards nothing, so a bot learns nothing |

No backend change. Before launch, confirm blog 6 (Digital) receives and routes these enquiries (07 §8).

## 8. Running it

From `frontend/`:

| Task | Command |
|---|---|
| Dev server | `pnpm dev --port 3030` → `http://digital.localhost:3030/` and `/ar/` |
| Production probe | `pnpm build && pnpm start --port 3031` |
| Digital tests | `pnpm exec vitest run tests/unit/digital-site` |
| Full source gate | `pnpm check:source` (lint, typecheck, tests, build) |
| Responsive/RTL/motion sweep | `node scripts/qa-sweep.mjs http://localhost:3031 digital` |
| Lab vitals | `node scripts/measure-web-vitals.mjs http://localhost:3031 digital` |

Windows notes: delete `frontend/.next` between `next dev` and `next build`; after clearing it, run `pnpm build` before `pnpm typecheck` (`next dev` points the untracked `next-env.d.ts` at `.next/dev/types`); prefix Playwright scripts with `MSYS_NO_PATHCONV=1` in Git Bash; `tests/unit/launch-gate.test.ts` fails to load on Windows on every branch (CRLF) and is not a regression.

## 9. Moving the narrative to the CMS later

ADR-039 keeps the narrative in the repository because blog 6 holds placeholder records belonging to another company. When the owner has clean content, the migration is a source change, not a component change: an ACF group (or options page) per language returning the `DigitalSiteContent` shape, a mapper in `lib/digital-site/`, and `getDigitalSiteContent` reading it with the repository narrative as the fallback. The content tests then move to a contract test on the mapper's output.

## 10. Known limitations

- Digital CSS ships in every tenant's bundle (+8.76 KB gzip; 07 §5.3). Fix: a route group with its own root layout for Digital — a platform change needing its own ADR.
- Share images (`public/digital/share-*.png`) show the Masar design.
- The ADR-033 composition (`components/digital/*`, `.digital-*` CSS, the CMS `digitalHomepage` branch) is still on disk and unreachable for Digital; retire it after ADR-039 is accepted.
