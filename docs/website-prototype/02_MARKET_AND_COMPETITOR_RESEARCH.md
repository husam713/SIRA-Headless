# 02 — Market and competitor research

**Task:** SIRA Digital premium website prototype · **Branch:** `feat/digital-enterprise-prototype` (stacked on PR #81) · **Research date:** 2026-10-13 · **Researcher:** Claude Code (implementation agent), for owner review.

Evidence classes follow `AGENTS.md`: **CONFIRMED** (directly observed, or read on the primary source), **STRONGLY INFERRED** (evidence supports it, not proven), **TRANSFERRED EVIDENCE** (reported by a secondary source, not verified here), **UNKNOWN**. Every figure in this document is about the *market*, never about SIRA Digital. Nothing here may be published on the website as a SIRA claim.

---

## 1. Method

| Step | What was done | Limits |
|---|---|---|
| Desk research | 30+ web searches; primary sources opened where reachable (ZATCA, Frappe docs, Frappe newsletter, W3C) | Several government sites (SDAIA) reject automated fetches; their content is cited through law-firm summaries and marked TRANSFERRED |
| Website inspection | 13 reference sites loaded in headless Chromium (Playwright `playwright-core` 1.62.1, Chromium 151) at **1440×900** and **390×844**; first screen, three scroll depths, mobile first screen, plus measured facts (fonts, sizes, colours, request count, transfer, horizontal overflow). Script: session scratchpad `capture-refs.cjs`; GET only, no form submitted | The capture machine's egress is geolocated inconsistently: `erpnext.com` redirected to Frappe's **Saudi Arabic** page, `stripe.com` served its **Dutch** edition. `odoo.com` reset the connection twice (not inspected). Celonis rendered an empty hero for 9 s in headless Chromium |
| Reading | Masar (PR #81) and the earlier `sirahdigital.in` forensics report in `artifacts/reference-forensics/` | — |

Screenshots were reviewed visually by the agent; they are not committed (they are third-party material). They can be regenerated with the capture script.

---

## 2. Saudi market findings

### 2.1 Regulation that shapes ERP demand

| Finding | Class | Source |
|---|---|---|
| E-invoicing ("FATOORA") was introduced in two phases: Phase 1 on **4 Dec 2021**, Phase 2 from **1 Jan 2023** | CONFIRMED | ZATCA E-Invoicing page [S1] |
| "Taxpayers may choose any e-invoicing solution provider as long as it is compliant with the e-invoicing requirements." There is no single "approved software" list a business must buy from — vendor pages that say otherwise overstate it | CONFIRMED | ZATCA E-Invoicing page [S1] |
| Phase 2 ("integration") is rolled out in **waves**. Standard tax invoices (B2B) are **cleared** by ZATCA before they are shared with the buyer; simplified invoices (B2C) are **reported**; Phase 2 tax invoices are submitted as XML; devices/solutions ("EGS units") are onboarded through the Fatoora portal | TRANSFERRED (ZATCA guideline PDFs seen in search results, not opened) | [S2] |
| **Wave 25**: resident taxpayers with taxable turnover above **SAR 187,500** in 2022–2025 must prepare to integrate by **1 Feb 2027** (criteria published 24 Jul 2026). Wave 24 (above SAR 375,000) had a 30 Jun 2026 deadline | TRANSFERRED (EY tax alert) | [S3] |
| Personal Data Protection Law (PDPL) in force 14 Sep 2023; one-year compliance window ended 14 Sep 2024; SDAIA also issued DPO, controller-registry and transfer rules | TRANSFERRED (law-firm summaries; SDAIA site blocks automated fetch) | [S4] [S5] |
| NCA **ECC-2:2024** replaces ECC-1:2018; mandatory baseline for government bodies and critical-infrastructure operators; explicit in-country hosting control moved to the National Data Management Office (SDAIA) | TRANSFERRED | [S6] |
| CST **Cloud Computing Services Provisioning Regulations** (v4 effective 10 Oct 2023) classify providers (Qualifying, A, B, C); government data may not leave the Kingdom | TRANSFERRED | [S7] [S8] |
| E-Commerce Law (2019) requires *e-stores* to display the provider's name, address, commercial registration and VAT number | TRANSFERRED | [S9] |
| Payroll: Mudad (wage protection) and GOSI reconciliation are part of every Saudi payroll; sources found are vendor pages only | TRANSFERRED (vendor) — **verify with MHRSD/GOSI before any claim** | [S10] |

**What it means:** Phase 2 e-invoicing now reaches businesses far smaller than the first waves, on a published timetable. That is a dated, legitimate reason for an SME or mid-market company to replace spreadsheets or an un-integrated accounting tool *this year*. It is also the space every competitor already shouts about (see §3), so SIRA should treat ZATCA as a *requirement it handles*, not as its headline.

### 2.2 The ERPNext ecosystem in Saudi Arabia

| Finding | Class | Source |
|---|---|---|
| ERPNext, Frappe Framework and Frappe HR **v16** were released on **12 Jan 2026** | CONFIRMED | Frappe Times, Jan 2026 [S11] |
| ERPNext workflows: states, transitions, roles and conditions (e.g. `doc.grand_total <= 100000`) override Save/Submit; "With workflows you can rewrite how a particular process/workflow is approved in ERPNext." | CONFIRMED | ERPNext docs, Workflows [S12] |
| "Frappe framework generates REST API for all of your DocTypes out of the box" — token, OAuth and session auth; `/api/resource` and `/api/method` | CONFIRMED | Frappe docs, REST API [S13] |
| Frappe runs a dedicated Saudi page (EN and AR). It claims ZATCA compliance, recognition by the Digital Government Authority, 200+ partners worldwide; lists Saudi partners — **Silver:** Go-Live Solutions KSA, LavaLoon; **Bronze:** Accurate Systems, Prestige Saudi Company Ltd, InstaTech — and Saudi marketplace apps (ZATCA Phase-2 e-invoicing, KSA Compliance, Frappe Zakat, Payroll LavaDo, a WhatsApp connector) | CONFIRMED that Frappe *says* this; the DGA recognition could not be found on any DGA source (UNKNOWN) | [S14] [S15] |
| The **Arabic** Saudi page is served with `lang="en"` and `dir="ltr"`; its punctuation visibly misorders around Latin words, and its statistics use Arabic-Indic digits | CONFIRMED (observed) | capture [S15] |
| Hosting in the Kingdom: the Arabic Saudi page states Frappe Cloud hosting is available in Jeddah; Frappe Cloud's own server page lists Bahrain and UAE but no Saudi location | CONFIRMED that the two pages **conflict** | [S15] [S16] |
| Open-source Phase-2 app by ERPGulf exists (community forum thread); commercial "build-to-order" ZATCA, GOSI and Mudad apps are sold by third parties | TRANSFERRED | [S17] [S18] |
| Saudi partners in the directory are small: typically 1–3 certified ERPNext experts each; several directory pages carry boilerplate text copied from another company | TRANSFERRED (search summaries of directory pages) | [S19] |

### 2.3 Market size and SME base — directional only

| Finding | Class | Source |
|---|---|---|
| Saudi ERP software market estimates **disagree by a factor of four**: ~US$108 m (Statista, 2024) vs ~US$417 m (Grand View, 2024) vs ~US$472 m (Precedence, 2025); the two larger estimates both project mid-teens annual growth | TRANSFERRED; low reliability (paywalled commercial reports) | [S20] |
| ~1.7 m active commercial registrations after Q2 2025 (Monsha'at SME Monitor, as reported by the press) | TRANSFERRED | [S21] |
| Academic studies of Saudi SMEs: ERP use is driven by management support, user satisfaction and training; cost and customisation time are the main barriers | TRANSFERRED (abstracts in search results, not opened) | [S22] |

**Do not publish any of these figures.** They support the strategy (a large, compliance-pressured SME base; adoption depends on training and leadership), not the site.

### 2.4 Buyer expectations and local trust signals (observed across the references)

- **Compliance first** — every Saudi ERP or accounting vendor inspected leads with ZATCA (Qoyod's hero alert pill, Sendan's "ZATCA e-Invoicing Setup", LavaLoon's "Comply"). CONFIRMED (observed).
- **Scale and logos** — Elm, LavaLoon, Qoyod and Frappe lead with large numbers and customer names. SIRA Digital has none it can use (ADR-039). CONFIRMED (observed).
- **Partner badges** — "Frappe Silver Partner", "PMM Level 4" (LavaLoon). SIRA's partner status is UNKNOWN; nothing may be shown until the owner supplies it.
- **Arabic parity** — the strongest local site (Elm) is Arabic-first with true RTL mirroring and **Latin digits inside Arabic** (the platform's ADR-034 rule matches). The vendor whose Arabic page is LTR shows exactly the failure to avoid. CONFIRMED (observed).
- **WhatsApp as a contact channel** — common on Saudi B2B sites (Sendan's floating button); the usage figures found are vendor marketing and conflict. Hypothesis, and SIRA has no verified number to show.
- **Registration details (CR, VAT number) in the footer** — a legal requirement for e-stores and a common local trust marker; recommended for SIRA once the owner supplies them. Hypothesis for B2B, sourced for e-commerce [S9].

---

## 3. Competitor analysis

| Company | Positioning (observed) | Strengths | Weaknesses / what SIRA should not copy |
|---|---|---|---|
| **LavaLoon** — lavaloon.com | "Integrate. Comply. Grow." Frappe & ERPNext partner, Saudi Arabia & Egypt; own products (LavaSell, KSA Compliance, LavaMCS, LavaCard, LavaHub); "Connected operations at Hajj scale" | The most credible direct competitor: product IP, Frappe Silver badge, named clients, a regional story | Generic dark-hero tech aesthetic (Space Grotesk at 115 px, orange gradient, three-pillar card grid); scale claims ("3M+", "No.1") that SIRA can neither match nor should imitate |
| **Sendan Technology** — sendantech.com | Multi-vendor ERP integrator (ERPNext, Odoo, SAP, NetSuite, Dynamics); city × industry × service landing pages | Clear buyer-fear structure: licensing cost, migration risk, vendor lock-in, Arabic UI — each answered | Template look (Poppins, pastel blobs, fanned fake screenshots with a stock person, WhatsApp float); self-reported "120+ implementations", "500+ Saudi enterprises"; programmatic SEO pages |
| **Qoyod** — qoyod.com | Saudi cloud accounting; "The trusted way to get compliant e-invoicing" | Polished, Arabic/Latin custom type (LamaSans), urgency pill, trust row (uptime, support, certification, rating), product UI as proof, sector pages | SaaS product, not an implementation partner; its trust row relies on figures SIRA does not have |
| **Frappe** — frappe.io / ERPNext | The vendor: open source, "The only ERP you'll ever need" | Editorial calm (serif display, table-of-contents home, almost no colour); honest product breadth | Its Saudi Arabic page is LTR; partner directory quality is uneven |
| **Elm** — elm.sa | Saudi enterprise digital-solutions group | Arabic-first, correct RTL, Latin digits, confident scale | Stats-led credibility, stock imagery cards, 2.9 MB first load with video |
| Go-Live Solutions KSA, Accurate Systems, Prestige Saudi, InstaTech | Frappe directory listings | — | Websites not inspected (directory only) |

**Gap the research shows:** no inspected Saudi ERPNext partner explains *how* an implementation runs, *what* the buyer receives at each stage, or *what the finished system does* — in equal Arabic and English, without leaning on numbers. That is the position SIRA can occupy honestly today.

---

## 4. Reference website analysis

Observed facts are measured values from the capture (font family, size and weight of the `h1`, letter-spacing, page height at 1440 px, requests and transferred kilobytes at capture time, horizontal overflow at 390 px). Interpretation is marked *(interpretation)*.

| # | Reference | Category | Observed | Interpretation — learn / avoid | Idea adapted for SIRA (not copied) |
|---|---|---|---|---|---|
| 1 | frappe.io | ERP vendor | Serif display (Newsreader on the ERPNext page), Inter text; homepage is a numbered table of contents (I. Products, II. Services…); left icon rail; 18 requests | *Learn:* enterprise software can be calm and editorial. *Avoid:* the inner-scroll app shell hides the page from normal scrolling | Numbered index rows for services instead of card grids |
| 2 | frappe.io/erpnext/saudiarabia(ar) | ERP vendor, Saudi | `lang="en"`, `dir="ltr"` on an Arabic page; Arabic-Indic digits; badges (ISO 27001, SSL, GDPR); 3.2 MB | *Avoid:* the exact RTL failure the brief warns about | Per-locale `<html lang dir>`, logical CSS, Latin digits (ADR-034) |
| 3 | lavaloon.com | Saudi ERPNext partner | Space Grotesk 115 px/600, −0.06 em; dark hero, mono eyebrow, stats row, client tiles, partner badges | *Learn:* a partner can have product IP. *Avoid:* claims-led hero, three-pillar card grid | A mono "record" eyebrow; capability shown as system behaviour, not numbers |
| 4 | sendantech.com/en-SA/erpnext | Saudi multi-ERP integrator | Poppins 48 px/600; gradient blobs; fanned UI screenshots; 81 requests, 1.3 MB | *Learn:* the four buyer fears. *Avoid:* fake screenshots with people and dollar figures | Answer the same fears in the FAQ and method, honestly |
| 5 | qoyod.com | Saudi SaaS | LamaSans 64 px/800, −1.5 px; navy `#0b143a`; alert pill; trust row; 35 sections | *Learn:* compliance urgency, sector entry points, product proof. *Avoid:* very long page, unverifiable trust row | A dated, sourced compliance note (no countdown); sector explorer |
| 6 | elm.sa | Saudi enterprise | `lang="ar-SA" dir="rtl"`; custom Arabic face 96 px; Latin digits in Arabic; purple gradient; video; 2.9 MB | *Learn:* Arabic-first craft. *Avoid:* stock-image principle cards | Arabic as the reference edition, not a translation |
| 7 | workato.com | Enterprise automation | Besley serif 56 px/600; Figtree 20 px text; navy; flow lines with travelling shapes; hairline accordion beside a product panel | *Learn:* process as a moving line; accordion + panel. *Avoid:* logo-wall credibility | Documents moving along SIRA's right-angle route |
| 8 | celonis.com | Process intelligence | Poppins 80 px/400 grey, −3 px; two hero videos; hero empty after 9 s in headless Chromium | *Avoid:* video-dependent first screen (perceived performance) | Server-rendered SVG hero, visible at first paint |
| 9 | thoughtworks.com | Premium consultancy | Bitter serif 48 px/700, two-tone headline; video hero; cookie banner over the fold; 4.1 MB, 5 canvases | *Learn:* two-tone headline. *Avoid:* heavy, generic AI imagery | Two-tone headline: claim in ink, qualification in muted ink |
| 10 | linear.app | SaaS interaction design | Inter Variable 64 px/510, −0.022 em; near-black `rgb(8,9,10)`; product UI rendered in HTML with real-looking IDs and activity; hero needs > 3.5 s to appear | *Learn:* the product *is* the hero; precise type. *Avoid:* entrance animation that delays content | A code-rendered "record" with reference numbers and an activity trail |
| 11 | stripe.com (NL edition served) | Financial infrastructure | Söhne 44 px/300, two-tone; WebGL gradient (2 canvases); a live counter; logo row; 1.5 MB | *Learn:* restraint in type weight; a single live number. *Avoid:* WebGL decoration | One live element only (the route), no WebGL |
| 12 | vercel.com | Developer platform | Geist 64 px/400, −0.06 em; `#fafafa`; the brand mark is the hero image; 966 KB | *Learn:* extreme restraint, one idea per screen | Hero with one diagram and one sentence |
| 13 | odoo.com | ERP competitor | Not inspected — connection reset twice from this environment | UNKNOWN | — |

All twelve inspected sites had **0 px horizontal overflow at 390 px** (CONFIRMED).

---

## 5. Opportunities and gaps

1. **Explain the implementation, not the software.** Competitors sell ERPNext's features; nobody inspected shows the buyer the route from first meeting to a running system, with deliverables per stage. *(interpretation, from §3)*
2. **Show the system working, honestly.** An interactive approval workflow and an *illustrative* management view, clearly labelled as sample data, demonstrate competence without inventing clients. *(interpretation)*
3. **Arabic as a first-class edition.** Even Frappe's own Arabic page is LTR. A correctly mirrored, business-Arabic site is a visible difference. *(observed gap)*
4. **Compliance as a handled requirement.** ZATCA Phase 2 is the market's loudest message; SIRA should handle it plainly (what it is, what the system must do, what SIRA verifies) and move on to operations. *(interpretation)*
5. **Ownership and exit.** Open source means no licence fees and no vendor lock-in — a real ERPNext property, and the fear Sendan's page names. SIRA can make "you own the system and its documentation" a commitment (owner approval required). *(hypothesis)*
6. **The group as context.** SIRA GROUP operates companies in consulting, healthcare, lifestyle and real estate (CONFIRMED in the site registry). Presenting Digital as "the technology company inside an operating group" is honest; claiming implementations inside the group is **not** (UNKNOWN).

## 6. Evidence versus hypotheses

| Statement used in strategy | Status |
|---|---|
| Phase 2 e-invoicing applies in waves, now reaching small taxpayers | TRANSFERRED (EY) on top of CONFIRMED phase dates (ZATCA) |
| Businesses may use any compliant e-invoicing solution | CONFIRMED (ZATCA) |
| ERPNext supports configurable approval workflows and a full REST API | CONFIRMED (Frappe docs) |
| ERPNext can be made ZATCA Phase 2 compliant through marketplace/community apps | TRANSFERRED — SIRA must test the chosen app before claiming it |
| In-Kingdom hosting is available for ERPNext | CONFIRMED that sources conflict; private cloud in KSA is a hypothesis to price |
| Saudi buyers expect Arabic parity and Latin digits | CONFIRMED (observed on Elm) for the digit rule; parity is a hypothesis |
| Saudi B2B buyers prefer WhatsApp contact | Hypothesis (vendor sources only) |
| Mid-market buyers fear licence cost, migration risk and lock-in | STRONGLY INFERRED (competitor messaging + academic barriers) |
| SIRA Digital is a Frappe partner / has delivered ERPNext projects | **UNKNOWN — must not be stated** |

## 7. Implications for the SIRA Digital website

- Position on **operations** (one record across finance, procurement, inventory, HR and approvals), with ERPNext as the engine and ZATCA, Arabic and hosting as requirements handled — not as the headline.
- Replace scale claims with **demonstrations** (workflow simulator, illustrative dashboard) and **transparency** (method, deliverables, a partner checklist the buyer can use on anyone).
- Make the Arabic edition the reference: `dir="rtl"`, logical properties, mirrored diagrams, Latin digits, business Arabic.
- Keep the first screen server-rendered and light: no video, no WebGL, no stock people.
- Reserve slots — rendered only when supplied — for the facts SIRA does not have yet: partner status, CR and VAT numbers, a WhatsApp number, client stories.

---

## 8. Source register

Accessed 2026-10-13 unless stated. Reliability: **A** official/primary, **B** reputable secondary (law firm, Big Four, vendor docs about its own product), **C** vendor marketing or press, **D** commercial estimate / unverified.

| # | Source | URL | Learned | Rel. | Effect on the site |
|---|---|---|---|---|---|
| S1 | ZATCA — E-Invoicing (FATOORA) | https://zatca.gov.sa/en/E-Invoicing/Pages/default.aspx | Two phases (4 Dec 2021; 1 Jan 2023); any compliant provider may be used | A | ZATCA framed as a requirement SIRA handles; no "approved" wording |
| S2 | ZATCA — Detailed Guidelines / Technical Guidelines (PDF) | https://zatca.gov.sa/en/E-Invoicing/Introduction/Guidelines/Documents/E-Invoicing_Detailed__Guideline.pdf | Clearance vs reporting, XML, onboarding (seen in search results) | A (not opened) | FAQ answer wording |
| S3 | EY Global Tax Alert — Wave 25, 10 Aug 2026 | https://globaltaxnews.ey.com/news/2026-1705-saudi-arabia-announces-25th-wave-of-phase-2-e-invoicing-integration | SAR 187,500 threshold; prepare by 1 Feb 2027 | B | Strategy (timing); not published as a number |
| S4 | Clyde & Co — PDPL Implementing Regulations | https://www.clydeco.com/en/insights/2023/09/saudi-arabia-issues-implementing-regulations | In force 14 Sep 2023; one-year window | B | Privacy note on the discovery form |
| S5 | SDAIA — Laws and regulations | https://sdaia.gov.sa/en/SDAIA/about/Pages/RegulationsAndPolicies.aspx | Official home of PDPL texts (fetch rejected) | A (blocked) | Cited for owner/legal verification |
| S6 | Clyde & Co — ECC-2:2024 | https://www.clydeco.com/en/insights/2025/01/saudi-arabia-essential-cybersecurity-controls | ECC-2 scope; localisation moved to NDMO | B | Hosting and governance FAQ (hedged) |
| S7 | Chambers — Cloud Computing 2026, Saudi Arabia | https://practiceguides.chambers.com/practice-guides/cloud-computing-2026/saudi-arabia/trends-and-developments | CST cloud regulations v4 (10 Oct 2023) | B | Hosting options copy |
| S8 | Baker McKenzie — data localisation, Saudi Arabia | https://resourcehub.bakermckenzie.com/en/resources/global-data-and-cyber-handbook/emea/saudi-arabia/topics/data-localization-and-regulation-of-non-personal-data | Government data stays in-Kingdom | B | Hosting options copy |
| S9 | Al Tamimi — E-Commerce Law | https://tamimi.com/law-update-articles/add-to-cart-new-e-commerce-law-in-saudi-arabia | Disclosure of CR / VAT number for e-stores | B | Footer slot for registration details |
| S10 | Mudad / GOSI explainers (vendor) | https://www.cercli.com/resources/mudad-ksa | Mudad WPS and GOSI reconciliation | C | Payroll copy hedged; verify officially |
| S11 | Frappe Times — January 2026 | https://frappe.io/times/january-2026 | v16 released 12 Jan 2026 | A | "Current stable release" wording |
| S12 | ERPNext docs — Workflows | https://docs.frappe.io/erpnext/workflows | States, transitions, roles, conditions | A | Workflow simulator logic and labels |
| S13 | Frappe docs — REST API | https://docs.frappe.io/framework/user/en/api/rest | Auto REST for every DocType; auth methods | A | Integration copy |
| S14 | Frappe — ERPNext Saudi Arabia (EN) | https://frappe.io/erpnext/saudiarabia | Saudi claims, partner list, Saudi apps | B (vendor about itself) | Competitive context; DGA claim **not** repeated |
| S15 | Frappe — ERPNext Saudi Arabia (AR), via erpnext.com redirect | https://frappe.io/erpnext/saudiarabiaar | LTR Arabic page; Jeddah hosting statement | B | RTL quality bar; hosting claim not repeated |
| S16 | Frappe Cloud — servers | https://frappe.io/cloud/servers | Regions incl. Bahrain, UAE; no Saudi region listed | B | Hosting options hedged |
| S17 | Frappe forum — ERPGulf ZATCA Phase-2 app | https://discuss.frappe.io/t/released-saudi-e-invoicing-zatca-phase-2-app-for-erpnext-as-per-latest-regulations-from-zatca/116356 | Open-source Phase-2 app exists | C | Blueprint: evaluate apps before committing |
| S18 | ECOSIRE app pages (ZATCA, GOSI/Mudad) | https://ecosire.com/apps/erpnext/erpnext-ksa-gosi-mudad-payroll | Commercial Saudi apps for ERPNext | C | Blueprint only |
| S19 | Frappe partner directory — Saudi listings | https://frappe.io/partners/saudi-arabia/accurate-systems | Small certified teams; boilerplate errors | B/C (seen in search results) | Competitive gap |
| S20 | Precedence / Grand View / Statista (search results) | https://www.precedenceresearch.com/databook/saudi-arabia-enterprise-resource-planning-software-market | Market estimates diverge ×4 | D | Not used on the site |
| S21 | Zawya — Monsha'at SME Monitor Q2 2025 | https://www.zawya.com/en/economy/gcc/monshaat-report-saudi-commercial-registrations-hit-17mln-hxxoyd1b | ~1.7 m registrations | C | Strategy only |
| S22 | KFUPM / SDL repositories — Saudi SME ERP adoption | https://pure.kfupm.edu.sa/en/publications/erp-implementation-trends-and-practices-in-saudi-arabia/ | Management support, training as success factors | B (abstract) | Method stresses training and sponsorship |
| S23 | W3C — Structural markup and right-to-left text in HTML | https://www.w3.org/International/questions/qa-html-dir | `dir` on `html`, logical CSS, `dir="auto"`, `bdi` | A | RTL engineering rules |
| S24 | Inspected reference sites (12) | see §4 | Visual and interaction patterns | A (direct observation) | Design direction (04_DESIGN_SYSTEM.md) |
| S25 | Masar (PR #81) and `artifacts/reference-forensics/sirahdigital-in/REPORT.md` | repository | Existing architecture, claims policy, name collision with an unrelated "Sirah Digital" in India | A | Content denylist kept; name gate kept open |
