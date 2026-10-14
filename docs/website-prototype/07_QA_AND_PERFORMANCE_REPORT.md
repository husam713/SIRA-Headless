# 07 — QA and performance report

**Task:** SIRA Digital premium website prototype · **Branch:** `feat/digital-enterprise-prototype` (stacked on PR #81) · **Runs:** 2026-10-13/14, Windows 10, Node 22, Next.js 16.2.12, Chromium via `playwright-core` · **Author:** Claude Code (implementation agent), for owner review.

Statuses follow `AGENTS.md`: **PASS** only for a command that ran in the stated session. Evidence carried over from the previous session (before the handover) is a check status of **NOT RUN** in this session, with the earlier result cited as **TRANSFERRED EVIDENCE**.

---

## 1. Summary

| Area | Result |
|---|---|
| Source checks (build, lint, typecheck) | PASS |
| Unit tests | 738/738 pass; one suite fails to **load** on Windows (known baseline, untouched) → WARNING |
| Responsive / RTL / reduced-motion sweep (production build) | PASS 16/16, after one fix (§3.1) |
| Touch targets on every route at 390 px | PASS (17 routes, 0 undersized) |
| Lab performance (production build, local) | Cold LCP 152–404 ms, CLS ≤ 0.001 on every measured route |
| Colour contrast | All text pairs ≥ 4.5:1; one non-text marker fixed to ≥ 3:1 (§3.2) |
| Browser interaction QA | NOT RUN this session; TRANSFERRED EVIDENCE: 22/22 in the first session (dev server) |
| CI, staging, owner review | NOT RUN (no PR yet / no deployment / pending) |

Two defects were found and fixed in this session; both are CSS-only (§3).

## 2. Source checks

Run from `frontend/` on the final tree (after the §3 fixes), in the order the handover requires (`.next` cleared, build before typecheck).

| Check | Command | Status | Evidence |
|---|---|---|---|
| Production build | `pnpm build` | PASS | all routes compiled; 61 static pages generated |
| Lint | `pnpm lint` | PASS | no findings |
| Typecheck | `pnpm typecheck` | PASS | no findings |
| Digital unit tests | `pnpm exec vitest run tests/unit/digital-site` | PASS | 5 files, 46/46 |
| Full unit suite | `pnpm test:run` | WARNING | 72/73 files, **738/738 tests pass**; `tests/unit/launch-gate.test.ts` fails to load (`SyntaxError: Invalid or unexpected token`, CRLF on Windows) — the same on every branch and on `main`, not touched here |

## 3. Defects found and fixed

### 3.1 Section "read more" links under 44 px on phones

- **Found by:** `node scripts/qa-sweep.mjs http://localhost:3031 digital` — first run 12/16: `FAIL — 3 targets < 44px` on `/` and `/ar/` at 390×844 (both motion modes).
- **Cause:** the links in a section head's aside (`How we implement ERPNext`, `Explore industries`, `Read the method`) were inline text, 22 px tall in English and 27 px in Arabic. The sweep counts them because `SectionHead` renders a semantic `<header>`.
- **Fix:** `.dg-head__aside .dg-link` becomes `inline-block` with `padding-block: 0.7rem` and an equal negative `margin-block`, so the hit area is ≥ 44 px while the text stays exactly where the reviewed layout put it. Same pattern the stylesheet already used for the form's privacy link.
- **Verified:** sweep 16/16; a per-route probe (scratchpad `small-targets.mjs`, same selector as the sweep) found 0 undersized targets on all 17 other EN/AR routes.

### 3.2 Pending marker below 3:1 (WCAG 1.4.11)

- **Found by:** contrast computation of every token pair the sheet uses (§6).
- **Cause:** `--dg-pending: #d18a1f` measured 2.85:1 on sheet white, 2.64:1 on paper and 2.50:1 on its own pending fill. It colours the *Urgent* switch's thumb and track border and the simulator's current-step marker — non-text state indicators, which need 3:1. (The existing test only forbids state colours as *text* colour.)
- **Fix:** `#bf7a12` — the lightest amber tested that clears 3:1 on all three surfaces (3.50 / 3.23 / 3.07). Ink text on the preview banner, which uses this fill, stays at 4.87:1.
- **Verified:** no other use of the old value in `src/` or `tests/`; full source checks re-run after the change (§2).

## 4. Responsive, RTL and motion sweep

`scripts/qa-sweep.mjs` on the **production** build (`pnpm build && pnpm start --port 3031`). For each viewport × motion preference it loads the page, scrolls end to end and checks: HTTP status, horizontal overflow, reveals left hidden, animations running under reduced motion, header settling, touch targets < 44 px on phones, a visible focus ring on the first Tab, and page errors.

| Path | 390×844 | 768×1024 | 1280×800 | 1920×1080 |
|---|---|---|---|---|
| `/` normal / reduce | PASS / PASS | PASS / PASS | PASS / PASS | PASS / PASS |
| `/ar/` normal / reduce | PASS / PASS | PASS / PASS | PASS / PASS | PASS / PASS |

**16/16 passed** (exit 0).

Status probes on the same server: `/`, `/erpnext/`, `/contact/`, `/ar/`, `/ar/contact/` → 200; `/nope/` → 404 (Digital not-found page).

## 5. Performance (lab, local)

Local production server, headless Chromium, no throttling. These numbers are for **regression comparison**, not field performance: TTFB is a loopback measurement and there is no CDN, network latency or CPU throttling. A Lighthouse run was NOT RUN (not installed); these scripts are the repository's equivalent.

### 5.1 Repository script

`node scripts/measure-web-vitals.mjs http://localhost:3031 digital`

| Path | Run | Status | TTFB ms | FCP ms | LCP ms | CLS | Requests | KB total | KB JS |
|---|---|---|---|---|---|---|---|---|---|
| `/` | cold | 200 | 26 | 240 | 240 | 0.000 | 19 | 433 | 160 |
| `/` | warm | 200 | 48 | 204 | 204 | 0.000 | 19 | 37 | 0 |
| `/news/` | cold | 404 | 61 | 172 | 172 | 0.000 | 18 | 7 | 0 |

The script measures the home page, the newsroom and an article. Digital has no newsroom by design (ADR-039: `/news/` answers 404), so the 404 row is the expected result and no article row exists.

### 5.2 Every Digital route (cold, fresh context per row)

Scratchpad script `vitals-routes.mjs` (same metrics, plus a full scroll before CLS is read).

| Path | 1440 LCP ms | 390 LCP ms | CLS (max) | Requests | KB total | KB JS |
|---|---|---|---|---|---|---|
| `/` | 256 | 240 | 0.000 | 19 | 433 | 160 |
| `/services/` | 256 | 252 | 0.000 | 18 | 404 | 150 |
| `/erpnext/` | 212 | 152 | 0.000 | 19 | 411 | 154 |
| `/automation/` | 212 | 152 | 0.000 | 19 | 407 | 154 |
| `/industries/` | 176 | 212 | 0.000 | 19 | 407 | 151 |
| `/method/` | 220 | 164 | 0.000 | 19 | 407 | 154 |
| `/about/` | 156 | 228 | 0.000 | 18 | 399 | 150 |
| `/contact/` | 204 | 240 | 0.000 | 19 | 405 | 156 |
| `/ar/` | 404 | 344 | 0.000 | 25 | 586 | 160 |
| `/ar/erpnext/` | 296 | 232 | 0.000 | 25 | 561 | 154 |
| `/ar/contact/` | 220 | 220 | 0.001 | 25 | 554 | 156 |

**Reading the numbers**

- LCP is the hero text on every page: there is no hero image or video, so the first paint is the largest paint.
- CLS is effectively zero, including after a full scroll: the route map and diagrams are server-rendered SVG with fixed geometry, and fonts use `display: swap` with metric fallbacks generated by `next/font`.
- Arabic pages cost **+6 requests and ≈ +150 KB**: the IBM Plex Sans Arabic subsets (three static weights). They are not preloaded and are fetched by `unicode-range` only when Arabic text appears, so English pages never download them. The cost is first-visit only (immutable cache headers).
- JavaScript is 150–160 KB transferred per route — the shared Next.js/React runtime plus three Client Components (tabs, workflow simulator, discovery composer). No dependency was added for this site.

### 5.3 CSS size impact on the other five tenants

Digital's stylesheet is still emitted in every tenant's CSS bundle (scoped, inert — a known limitation of the shared root layout; route-group isolation is backlog). Measured with the same method that produced ADR-039's 7 KB figure (Lightning CSS minify + gzip -9 of `digital-site.css`):

| Version | Minified | gzip |
|---|---|---|
| Masar (PR #81) | 36.2 KB | 7.06 KB |
| Qayd (this branch) | 46.1 KB | **8.76 KB** |
| Difference | +9.9 KB | **+1.70 KB (+24 %)** |

The built chunk that carries it (`.next/static/chunks/*.css`, 53.6 KB raw / 10.1 KB gzip) is loaded by Group's home page as well, confirming the bundling. Every rule is scoped to `html[data-site="digital"]` or a `.dg-` class, asserted by `document-gates.test.ts`, so it cannot style another tenant — it only costs bytes.

## 6. Accessibility

| Area | Status | Evidence |
|---|---|---|
| Text contrast | PASS | computed (WCAG relative luminance) for every text token pair: ink 15.73, ink-2 8.43, ink-3 5.55 (5.12 on mist), lapis links 7.67, white on lapis buttons 8.29, on-night 16.07 / 9.83 / 6.87, state chips 5.53–6.88 |
| Non-text contrast | PASS after §3.2 | pending marker 3.07–3.50; approved marker 4.63 on sheet |
| Focus visible | PASS | sweep: first Tab lands on a visible 2 px lapis outline, all 16 runs |
| Touch targets (phone) | PASS after §3.1 | sweep + per-route probe |
| Reduced motion | PASS | sweep: 0 running animations under `prefers-reduced-motion: reduce`; hero has a no-script pause control (WCAG 2.2.2) |
| One `h1` per page, landmarks | NOT RUN | TRANSFERRED EVIDENCE: previous session's page sweep, 10 routes EN/AR |
| Keyboard: tabs (arrows follow reading direction), FAQ, menu popover, form errors and focus | NOT RUN | TRANSFERRED EVIDENCE: previous session's interaction QA, 22/22 |
| Screen reader pass (NVDA/VoiceOver) | NOT RUN | recommended before launch |
| Automated axe audit | NOT RUN | not installed in this repository |

## 7. Interaction QA (transferred)

Recorded in the previous session against the dev server with `/api/contact/` **mocked** — no request reached WordPress. 22/22 checks passed: tabs keyboard LTR/RTL; simulator route, run and reset; exclusive FAQ; hero pause; form validation, focus on first error, payload shape and success state; popover menu open and Escape; no page errors. Page sweep at 1440 px: 10 routes EN/AR, one `h1`, 0 px overflow. Mobile 390 px home EN/AR: 0 px overflow, vertical route map, mirrored Arabic. The scripts (`qa-shots.cjs`, `qa-interact.cjs`) lived in that session's scratchpad and were not committed.

## 8. Not checked here

| Item | Status | Why / next step |
|---|---|---|
| Sitemap contents on a live host | NOT APPLICABLE | Indexing is off in this deployment: `robots.txt` is `Disallow: /` and `buildSitemap` fails closed (Group's sitemap is empty too). The Digital list is asserted by `document-gates.test.ts` |
| CMS prose pages (`/privacy/`, `/terms/`) with real content | NOT RUN | need the CMS; render path unchanged from #81 |
| Real form submission to `sira/v1/contact` | NOT RUN | deliberately not sent from QA; owner to test on staging |
| CI | NOT RUN | runs when the PR is opened |
| Field performance, CDN, Cloud Run cold start | NOT RUN | needs a deployment |
| Cross-browser (Safari, Firefox) | NOT RUN | Chromium only; the menu uses the native `popover` (Baseline 2024) |
| Owner visual review | NOT RUN | see `10_DESIGN_REVIEW_CHECKLIST.md` |
