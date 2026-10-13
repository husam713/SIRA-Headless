# 08 — Project handover and decision log

**Task:** SIRA Digital premium website prototype (owner brief, in session, 2026-10-13).
**Branch:** `feat/digital-enterprise-prototype`, stacked on PR #81 (`feat/digital-masar`).
**Worktree:** `C:\Users\User\Downloads\SIRA-Headless-worktrees\digital-masar` (reused from Masar; it previously held `docs/handover-2026-10-12`, which is pushed and unchanged).
**Status at this commit (2026-10-14):** implementation complete and validated locally; documentation package and PR not yet done. This file is the resume point.

---

## 1. Resume here (next session)

1. `git -C <worktree> status` and `git log --oneline -3` — expect a clean tree on this branch.
2. Read this file, then `02_MARKET_AND_COMPETITOR_RESEARCH.md` (the only other document written so far).
3. Do the remaining steps in §5, in order.

Machine rules that cost time before (see auto-memory `machine-constraints`):

- Disk is ~1.7 GB free. Stop dev servers before a build; delete `frontend/.next` after `next dev` and before `next build`.
- `next dev` rewrites the untracked `frontend/next-env.d.ts` to point at `.next/dev/types`; after clearing `.next`, run `pnpm build` **before** `pnpm typecheck` (or `pnpm check:source` fails on that file alone).
- Git Bash rewrites a bare `/` argument into a Windows path: prefix Playwright scripts with `MSYS_NO_PATHCONV=1`.
- Shell commands above ~8 KB truncate; write long files with the file tool.
- Dev server: `pnpm dev --port 3030` → `http://digital.localhost:3030/` and `/ar/`. Production probe: `pnpm build && pnpm start --port 3031`.

## 2. What was built

**Direction ("Qayd" / القيد, evolved from Masar):** a company's work is documents moving along routes into one ledger. Lapis routes on cool paper, blue-black ink, deep-navy chapters where the system runs, three document-state colours used only on documents. IBM Plex Sans + IBM Plex Sans Arabic. One orchestrated motion moment (the hero route), all other motion answers a user action. Removed from Masar: canvas field, clock, spine, mono labels, uppercase eyebrows, arrows on buttons.

**Positioning (provisional):** ERPNext implementation plus automation, integration, reporting and support for organizations in Saudi Arabia; ZATCA, Arabic and hosting treated as requirements handled, not as the headline. No clients, figures, people, offices, partner status or dates anywhere.

**Routes (Digital tenant only):** `/` · `/services/` (Solutions) · `/erpnext/` · `/automation/` · `/industries/` · `/method/` · `/about/` · `/contact/` (discovery request) · CMS prose `/privacy/`, `/terms/` · Digital 404. EN and AR (`/ar/...`).

| Area | Files |
|---|---|
| Narrative EN/AR (one shape, per page) | `frontend/src/content/digital-site/{en,ar}/{common,catalogue,demos,pages,index}.ts`, `types.ts` |
| Illustrative sample data (language-neutral) | `content/digital-site/demo/{workflow,dashboard}.ts` |
| Pure logic | `lib/digital-site/{workflow,discovery,route-map,format,routes,hrefs,metadata}.ts` |
| Components | `components/digital-site/{primitives,route-map,diagrams,dashboard,tabs,workflow-simulator,discovery-composer,header,footer,glyphs,document}.tsx`, `sections/{hero,home}.tsx`, `pages/*.tsx` |
| Client components (3) | `tabs.tsx`, `workflow-simulator.tsx`, `discovery-composer.tsx` |
| Styles, fonts | `styles/digital-site.css` (rewritten, all selectors scoped), `styles/digital-fonts.ts` |
| Route wiring | `[section]/page.tsx` (registry-first for erpnext/automation/method), `industries/page.tsx` (Digital branch), `app/sitemap.ts` (Digital lists exactly its registry) |
| Tests | `tests/unit/digital-site/{content,document-gates,workflow,discovery,route-map}.test.ts` |

**Key interactions:** hero route animation with a no-script pause control (WCAG 2.2.2); solutions/modules/sectors tabs (ARIA, arrows follow reading direction); approval simulator (amount, category, urgency → route from `routeRequest()`, "Send the request" runs it to `PUR-ORD-2026-00087`); illustrative dashboard with "where this comes from" per figure; exclusive FAQ accordions; discovery form composing a brief live and posting through the existing `/api/contact/` pipeline.

## 3. Decisions and rationale

| Decision | Why |
|---|---|
| Build on PR #81 (stack), not on `main` | Masar's architecture (own document, typed bilingual narrative, scoping and claims tests) is exactly the content architecture the brief asks for |
| Evolve lapis identity instead of replacing it | Owner already authorised it; research found no reason to discard it; continuity with the SIRA line motif |
| IBM Plex Sans + Plex Sans Arabic | Specimen comparison (6 pairings): only pairing with equal voice and scale in both scripts |
| Demonstrations instead of claims | SIRA has no verified clients/figures; competitors lean on numbers; honest demos are the gap |
| Sample figures outside the narrative | Narrative is walked by the claims denylist; demo data is labelled "illustrative" and a test asserts the label renders |
| New pages via `[section]` registry | No change to the route tree the other five tenants share |
| Sitemap lists Digital's registry only | Fixes a #81 defect: it advertised `/news/` and editorial URLs that 404 on Digital |
| Contact form keeps the real pipeline | Production architecture; all QA used a mocked endpoint, nothing was sent to WordPress |

ADR: record as an **amendment to ADR-039 (PROPOSED)** in `docs/DECISIONS.md` — not yet written (§5).

## 4. Validation so far (local, 2026-10-13/14)

| Check | Status | Evidence |
|---|---|---|
| `pnpm build` | PASS | production build, all routes compiled |
| `pnpm lint` | PASS | clean |
| `pnpm typecheck` | PASS | clean (after build, see §1) |
| `pnpm test:run` | WARNING | 738/738 tests pass; `tests/unit/launch-gate.test.ts` fails to load on Windows (CRLF, known baseline, untouched) |
| Digital unit tests | PASS | 46/46 (`tests/unit/digital-site`) |
| Browser interaction QA (Playwright, dev server, `/api/contact/` mocked) | PASS | 22/22: tabs keyboard LTR/RTL, simulator route + run + reset, exclusive FAQ, hero pause, form validation/focus/payload/success, popover menu open/Escape, no page errors |
| Page sweep, 1440 px | PASS | 10 routes EN/AR: 200 (404 for unknown), one `h1`, 0 px overflow |
| Mobile 390 px, home EN/AR | PASS | 0 px overflow, vertical route map, mirrored Arabic |
| `scripts/qa-sweep.mjs` on production build | NOT RUN | next step |
| `scripts/measure-web-vitals.mjs` | NOT RUN | next step |
| Lighthouse | NOT RUN | not installed; vitals script is the equivalent |
| CI | NOT RUN | PR not opened |
| Owner review | NOT RUN | — |

Scripts used for screenshots and interaction QA live in the session scratchpad (`qa-shots.cjs`, `qa-interact.cjs`); recreate if needed — they are short Playwright scripts against `digital.localhost`.

## 5. Remaining steps (in order)

1. **Production QA:** `pnpm build && pnpm start --port 3031`; run `node scripts/qa-sweep.mjs http://localhost:3031 digital` and `node scripts/measure-web-vitals.mjs http://localhost:3031 digital`; record results. Check the CSS size impact (Digital sheet ships in every tenant's CSS — compare gzip size with Masar's 7 KB).
2. **Documents** in `docs/website-prototype/`: 01 executive summary, 03 strategy & IA, 04 design system, 05 implementation guide, 06 ERPNext/automation service blueprint, 07 QA & performance report, 09 content & approval register, 10 design review checklist; finalise this file (08).
3. **ADR-039 amendment** (PROPOSED) in `docs/DECISIONS.md`.
4. **Commit, push, PR** from `.github/pull_request_template.md`, base `feat/digital-masar` (stacked on #81). Do not merge.
5. Update auto-memory (`digital-masar-task` / new task note).

## 6. Owner decisions required

- Approve, amend or remove the provisional positioning, commitments, engagement models, method and FAQ answers (to be itemised in 09).
- Confirm SIRA Digital's actual service scope and any Frappe partner status before anything on the site implies it.
- Supply, if they exist: CR and VAT numbers, a contact email/WhatsApp, the Digital brand mark, the SIRA/SIRAH spelling.
- Verify with SIRA's technical team: the ZATCA Phase 2 app choice, payroll/WPS file support, in-Kingdom hosting options.
- Accept or reject ADR-039 (#81) and this amendment; merge is the owner's.

## 7. Known limitations

- Narrative lives in the repository (ADR-039); moving it to ACF is a later change.
- Digital CSS is still emitted in every tenant's bundle (scoped and inert); route-group isolation remains backlog.
- Share images (`public/digital/share-*.png`) still show the Masar design.
- The dev-only Next.js indicator appears in screenshots; it is not in production.
