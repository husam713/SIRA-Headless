# 08 — Project handover and decision log

**Task:** SIRA Digital premium website prototype (owner brief, in session, 2026-10-13).
**Branch:** `feat/digital-enterprise-prototype`, stacked on PR #81 (`feat/digital-masar`).
**Worktree:** `C:\Users\User\Downloads\SIRA-Headless-worktrees\digital-masar` (reused from Masar; it previously held `docs/handover-2026-10-12`, which is pushed and unchanged).
**Status (2026-10-14, second session):** implementation complete, production QA run, two accessibility defects fixed, documentation package 01–10 written, ADR-039 amendment recorded as PROPOSED, PR opened against `feat/digital-masar`. Awaiting owner review. This file is the resume point.

---

## 1. Resume here (next session)

1. `git -C <worktree> status` and `git log --oneline -3` — expect a clean tree on this branch.
2. Read this file and `01_EXECUTIVE_SUMMARY.md`; the other documents are referenced where needed.
3. Nothing in §5 is left for the agent. Next work starts from owner decisions (§6): content changes per `09`, then the follow-ups in §7.

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

ADR: recorded as an **amendment to ADR-039 (PROPOSED, 2026-10-14)** in `docs/DECISIONS.md`. No new ADR number: the decision (own document, repository narrative) is unchanged; identity, routes and the sitemap rule are amended.

## 4. Validation (local)

Full report: `07_QA_AND_PERFORMANCE_REPORT.md`. Second-session results are on the final tree.

| Check | Status | Evidence |
|---|---|---|
| `pnpm build` | PASS | 2026-10-14, final tree |
| `pnpm lint` | PASS | clean |
| `pnpm typecheck` | PASS | clean (after build, see §1) |
| `pnpm test:run` | WARNING | 738/738 tests pass; `tests/unit/launch-gate.test.ts` fails to load on Windows (CRLF, known baseline, untouched) |
| Digital unit tests | PASS | 46/46 (`tests/unit/digital-site`) |
| `scripts/qa-sweep.mjs` on production build | PASS | 16/16 after the touch-target fix (first run 12/16) |
| Touch targets, all 17 other routes at 390 px | PASS | 0 undersized |
| `scripts/measure-web-vitals.mjs` + per-route vitals | PASS | cold LCP 152–404 ms, CLS ≤ 0.001; `/news/` 404 by design |
| CSS size impact | WARNING | Digital sheet 8.76 KB gzip (Masar 7.06 KB), still bundled for every tenant — known limitation |
| Contrast | PASS | text ≥ 4.5:1 everywhere; pending marker raised to ≥ 3:1 |
| Browser interaction QA | NOT RUN | TRANSFERRED EVIDENCE: 22/22 in the first session (dev server, `/api/contact/` mocked); not re-run |
| Lighthouse, axe, screen reader | NOT RUN | not installed / manual |
| CI | NOT RUN | runs when the PR is opened; read the PR checks |
| Owner review | NOT RUN | `10_DESIGN_REVIEW_CHECKLIST.md` |

Defects fixed in the second session (CSS only): section "read more" links under 44 px on phones; `--dg-pending` marker at 2.85:1 (now `#bf7a12`). Details in 07 §3.

QA helper scripts (`small-targets.mjs`, `vitals-routes.mjs`; first session's `qa-shots.cjs`, `qa-interact.cjs`) lived in session scratchpads and are not committed.

## 5. Steps — all done

1. ~~Production QA~~ — done (07).
2. ~~Documents 01, 03–07, 09, 10; finalise 08~~ — done.
3. ~~ADR-039 amendment (PROPOSED)~~ — recorded in `docs/DECISIONS.md` under ADR-039.
4. ~~Commit, push, PR with base `feat/digital-masar`~~ — opened; **not merged** (owner).
5. ~~Auto-memory~~ — updated.

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
