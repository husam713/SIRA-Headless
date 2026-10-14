# 10 — Design review checklist

**For:** the SIRA owner (and any reviewer they invite) walking through the prototype before accepting it. · **Branch:** `feat/digital-enterprise-prototype` · **Time:** about 45 minutes for both languages.

**Setup:** from `frontend/`, `pnpm build && pnpm start --port 3031`, then open `http://digital.localhost:3031/` and `http://digital.localhost:3031/ar/`. Review on a laptop **and** a phone-width window (about 390 px; browser dev tools → device toolbar). The contact form posts to the real `/api/contact/` pipeline — do not submit it locally unless you mean to send an enquiry to the CMS.

Mark each line ✓ (accept), ✎ (change — note what), or ✗ (reject). Content wording is approved separately in `09_CONTENT_AND_APPROVAL_REGISTER.md`; this list is about **how it looks and behaves**.

---

## 1. Overall direction

- [ ] The site reads as an enterprise systems company: calm, precise, not a startup landing page.
- [ ] The "Qayd" idea is legible: documents moving along a route into one ledger (hero, home's system chapter, method).
- [ ] Lapis on cool paper with deep-navy chapters feels like SIRA and sits well beside the Group site.
- [ ] Nothing looks like a claim the company cannot support: no logos, numbers, stock people or fake screenshots.
- [ ] The "Illustrative: sample data, not a client" labels are clear enough without being apologetic.

## 2. Home (`/`)

- [ ] **Hero:** headline and lede understood in five seconds; the two buttons are obvious; the route animation is pleasant, not distracting; the pause control works.
- [ ] **Problem:** the six disconnected tools diagram and the "what happens / what it costs" rows describe your buyers' reality.
- [ ] **What we do:** the five solution tabs switch with mouse and with arrow keys.
- [ ] **ERPNext:** module map and Saudi requirements are readable at a glance.
- [ ] **The system running (night chapter):** change the amount, category and *Urgent* — the route changes; "Send the request" runs it to a purchase order; *Reset* works. Each dashboard figure's "Where this comes from" opens.
- [ ] **Industries, method, commitments, FAQ:** the FAQ opens one answer at a time.
- [ ] **Closing:** the three steps and the discovery button.

## 3. Inner pages

| Page | Look for | ✓ ✎ ✗ |
|---|---|---|
| Solutions `/services/` | Five lines of work as an index + detail; four ways to start | |
| ERPNext `/erpnext/` | Module tabs show documents per module; three hosting options; "Already on ERPNext?" | |
| Automation `/automation/` | Six patterns; simulator; integration hub; "What stays with people" two-column | |
| Industries `/industries/` | Sector tabs each show a document route; function before/after table | |
| Method `/method/` | Five stages with "you receive / we need from you / how it closes"; the partner checklist | |
| Company `/about/` | Principles; SIRA GROUP companies link to their sites | |
| Contact `/contact/` | Choosing answers builds the brief live beside the questions (below them under 1024 px); errors appear in place and focus the first one | |
| 404 (`/anything/`) | Branded, lists the pages that exist | |
| Privacy / Terms | Render from WordPress in Digital's design (needs CMS content) | |

## 4. Arabic (`/ar/…`)

- [ ] Every page mirrors: navigation, diagrams, the route map, tabs (arrow keys follow reading direction), the simulator.
- [ ] Arabic type (IBM Plex Sans Arabic) has the same weight and presence as the English.
- [ ] Digits are Latin inside Arabic text, as across the SIRA sites.
- [ ] The Arabic reads as business Arabic written for the reader, not a translation (native reviewer: 09 L1).
- [ ] The language switch keeps you on the same page.

## 5. Phone width (about 390 px)

- [ ] Header collapses to *Menu*; the menu opens full screen and closes with *Close* and Escape.
- [ ] The hero route map turns vertical.
- [ ] No sideways scrolling on any page.
- [ ] Buttons and links are comfortable to tap.
- [ ] Simulator, dashboard and the contact form remain usable.

## 6. Accessibility spot checks

- [ ] Press Tab from the top of a page: a "Skip to content" link appears first, then a visible blue focus ring moves through the page.
- [ ] With the OS set to reduce motion (Windows: Settings → Accessibility → Visual effects → Animation effects off), the hero is still and nothing animates.
- [ ] Zoom the browser to 200 %: text reflows, nothing overlaps.

## 7. Before acceptance

- [ ] Owner decisions in `08_PROJECT_HANDOVER.md` §6 are taken.
- [ ] `09_CONTENT_AND_APPROVAL_REGISTER.md` has a decision on every row.
- [ ] ADR-039 and its amendment in `docs/DECISIONS.md` are accepted, amended or rejected.
- [ ] Share images regenerated in the Qayd design.
- [ ] The footer's "Prototype for review" line is removed only after the register is complete.
