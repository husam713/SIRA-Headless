# 09 — Content and approval register

**For:** the SIRA owner, to approve, amend or remove every provisional statement on the SIRA Digital prototype. · **Branch:** `feat/digital-enterprise-prototype` · **Narrative files:** `frontend/src/content/digital-site/{en,ar}/*.ts` (the `Where` column gives the key path; the Arabic edition has the same path).

**How to use it:** mark each row **A** (approve as written), **M** (amend — write the change), or **R** (remove). A row approved here is still not a verified claim: rows marked *Needs evidence* may only stay if the evidence in the last column is produced. The footer line "Prototype for review. Content is provisional until approved." comes off only when every row has a decision.

**Basis codes:** **PLATFORM** — a property of ERPNext/Frappe, CONFIRMED in Frappe's docs · **REG** — a regulatory fact, class as in 02 · **SIRA** — about SIRA Digital's own practice or capacity, UNKNOWN until the owner confirms · **DEMO** — invented sample, always labelled.

---

## 1. Positioning and identity

| ID | Statement (summary) | Where | Basis | Needs evidence | Decision |
|---|---|---|---|---|---|
| P1 | "From request to ledger, one system." (hero promise) | `pages.home.hero.title` | SIRA | — | |
| P2 | Implements ERPNext and automates purchasing, inventory, sales, finance, HR and approvals, for organizations in Saudi Arabia, in Arabic and English, ready for ZATCA e-invoicing, hosted where policies require | `pages.home.hero.lede`, `common.meta.pages.home` | SIRA | Service scope (06 §2) | |
| P3 | Tagline "Business systems for organizations in Saudi Arabia." | `common.brand.tagline` | SIRA | — | |
| P4 | "The technology company of SIRA GROUP" | `pages.about.intro` | SIRA | Confirm corporate relationship wording | |
| P5 | Name "SIRA Digital" and Arabic echo «سيرة الرقمية» | `common.brand` | SIRA | **SIRA/SIRAH spelling gate (ADR-033) still open** | |
| P6 | Typographic wordmark and route glyph are interim | `glyphs.tsx` | — | **Digital brand mark from the owner** | |
| P7 | Problem framing: "five systems and a spreadsheet"; six symptoms (chat approvals, double typing, stock counted, month-end, bolted-on e-invoicing, competing reports) | `pages.home.problem` | SIRA (rhetorical; "five" is not a statistic) | — | |
| P8 | "Why it exists" / "How it works" paragraphs (start from processes, prefer standard to custom, document every change, Arabic and English with equal care) | `pages.about.sections` | SIRA | — | |

## 2. Commitments and principles — strongest promises on the site

| ID | Statement | Where | Basis | Needs evidence | Decision |
|---|---|---|---|---|---|
| C1 | "You own the system." Instance, data, configuration and documentation belong to the client; no licence to renew | `pages.home.commitments.items[ownership]`, `about.principles[ownership]`, `method.checklist[ownership]` | PLATFORM (licence) + SIRA (contract terms) | **Contract terms must match** | |
| C2 | "Arabic is designed, not translated." Screens, print formats and training in Arabic from day one | `home.commitments[arabic]`, `about.principles[arabic]` | SIRA | Arabic-capable trainers; print-format set | |
| C3 | "People decide, the system records." | `home.commitments[people]`, `about.principles[people]`, `automation.boundaries` | SIRA | — | |
| C4 | "Nothing undocumented." Every customisation written down and handed over | `home.commitments[documented]` | SIRA | Customisation register practice (06 §4) | |
| C5 | "Training until it is used." Stay through first closes, first audits | `home.commitments[adoption]` | SIRA | Capacity for post-go-live presence | |
| C6 | "Standard before custom" | `about.principles[standard]`, `method.checklist[standard]` | SIRA | — | |
| C7 | "Plain answers" on scope, cost and risk | `about.principles[plain]` | SIRA | — | |
| C8 | Exit: "You leave with full documentation and access. Nothing about the system depends on us." | `method.checklist[exit]` | SIRA | Contract terms | |

## 3. Services and engagement models

| ID | Statement | Where | Basis | Needs evidence | Decision |
|---|---|---|---|---|---|
| S1 | ERPNext implementation — includes list and outcome | `catalogue.solutions[erp]` | SIRA | 06 §2 | |
| S2 | Workflow automation — incl. document capture from email and scans | `catalogue.solutions[automation]`, `automation.patterns[capture]` | SIRA | Capture tool chosen (06 §2) | |
| S3 | Integration and APIs — banks, e-commerce/POS, payroll/HR, e-invoicing and government platforms, custom APIs, monitoring | `catalogue.solutions[integration]`, `automation.integrations` | PLATFORM (API) + SIRA | Which integrations SIRA has built | |
| S4 | Reporting and dashboards | `catalogue.solutions[reporting]` | PLATFORM + SIRA | — | |
| S5 | Support and improvement — "agreed response times", monitoring, backups, upgrades | `catalogue.solutions[support]`, `phases[run]` | SIRA | SLA defined internally (no times published) | |
| S6 | Supports systems "ours or another partner's"; takes over support from another partner | `catalogue.solutions[support].fits`, `services.engagements[care]`, `erpnext.existing`, `questions[existing]` | SIRA | Decision 06 §8.6 | |
| S7 | Engagement: Discovery — fixed, ends in a scope "you can use with us or without us" | `services.engagements[discovery]` | SIRA | Price/duration; keep the "without us" promise? | |
| S8 | Engagement: Phased implementation | `services.engagements[phased]`, `questions[phasing]` | SIRA | — | |
| S9 | Engagement: Review and recovery | `services.engagements[recovery]` | SIRA | Decision 06 §8.6 | |
| S10 | Engagement: Run and support | `services.engagements[care]` | SIRA | — | |
| S11 | Frappe custom work: custom documents, portals, mobile-friendly screens, industry applications | `erpnext.frappe` | PLATFORM + SIRA | Frappe development capacity | |
| S12 | Migration from spreadsheets, accounting software, another ERP, older ERPNext — rehearsed on a copy, reconciled with the client's accountant | `erpnext.migration`, `questions[migration]`, `method.checklist[data]` | SIRA | Migration practice | |

## 4. Method

| ID | Statement | Where | Basis | Needs evidence | Decision |
|---|---|---|---|---|---|
| M1 | Five stages, always in order, each ending in a review | `method.intro`, `home.method` | SIRA | — | |
| M2 | Per-stage activities, deliverables, client inputs and gates | `catalogue.phases` | SIRA | Templates exist (06 §4) | |
| M3 | Five roles on every engagement, incl. "Our implementation lead — single point of contact" | `method.roles` | SIRA | Staffing | |
| M4 | Partner checklist answers (ownership, customisation, data, training language, e-invoicing, exit, after go-live) | `method.checklist` | SIRA | See C1, C8, R2 | |
| M5 | "Close support through the first month-end close" | `phases[run]`, `questions[afterlaunch]` | SIRA | Capacity | |

## 5. Saudi requirements and regulatory wording

| ID | Statement | Where | Basis | Needs evidence | Decision |
|---|---|---|---|---|---|
| R1 | ZATCA lets businesses use any compliant solution | `questions[zatca]` | REG — CONFIRMED (ZATCA S1) | — | |
| R2 | Phase 2 through a **tested** e-invoicing app; invoices cryptographically stamped, cleared or reported via Fatoora; onboarded with the client | `requirements[einvoicing]`, `questions[zatca]`, `method.checklist[einvoicing]`, `phases[launch]` | REG TRANSFERRED + SIRA | **Named app and SIRA's sandbox test (06 §5)** | |
| R3 | VAT templates and return figures | `requirements[vat]` | PLATFORM | — | |
| R4 | Arabic interface, RTL, bilingual print formats | `requirements[language]`, `questions[arabic]` | PLATFORM + SIRA | Translation review | |
| R5 | Saudi payroll; wage-protection files "prepared and checked with your HR team" | `requirements[payroll]`, `automation.integrations[government]` | TRANSFERRED (vendor sources) | **Verify WPS/Mudad support** | |
| R6 | Hosting: managed cloud; private cloud **in the Kingdom**; on-premise | `erpnext.hosting`, `requirements[hosting]`, `questions[hosting]` | Sources conflict (02 §2.2) | **Named provider and price** | |
| R7 | Data residency rules for government and regulated sectors; "we design the hosting to meet them" | `questions[hosting]` | REG TRANSFERRED (S6–S8) | Legal review | |
| R8 | PDPL applies to employee and customer records; roles/permissions; help documenting processing | `questions[privacy]` | REG TRANSFERRED (S4) | Legal review | |
| R9 | "At the start of every engagement we confirm the current ZATCA, payroll and data rules" | `erpnext.saudi.caution` | SIRA | A named owner for this check | |
| R10 | ERPNext properties: open source/no licence fee; one database; extensible without core changes; REST API for every record type; webhooks and scheduled jobs | `erpnext.why`, `questions[integrations]`, `questions[cost]` | PLATFORM — CONFIRMED (S12, S13) | — | |

## 6. Industries and the group

| ID | Statement | Where | Basis | Needs evidence | Decision |
|---|---|---|---|---|---|
| G1 | Seven sectors with typical pains, modules, document routes and connections | `catalogue.sectors` | SIRA (generic, no client claims) | — | |
| G2 | Healthcare: "We work on the business side, not on clinical records" | `sectors[healthcare].summary` | SIRA | Confirm the boundary | |
| G3 | Group operates companies in consulting, healthcare, lifestyle and real estate — "the sectors where SIRA Digital proposes to start" | `industries.group`, `about.group` | Site registry CONFIRMED; the "start" intent SIRA | Owner confirms the intent; **do not imply implementations inside the group** | |
| G4 | Before/after per function | `catalogue.functions` | SIRA (generic) | — | |

## 7. Questions with time and cost answers

| ID | Statement | Where | Basis | Decision |
|---|---|---|---|---|
| F1 | Timeline "depends on…"; plan with stages and dates after discovery | `questions[timeline]` | SIRA — deliberately no duration | |
| F2 | Cost: no licence fee; pay for implementation, hosting, support; "priced by scope rather than by user" | `questions[cost]` | PLATFORM + SIRA (pricing model) | |
| F3 | Discovery reply: "A person reads every request and replies by email" | `contact.intro`, `contact.form.successBody`, `contact.after` | SIRA | **Who reads blog 6 enquiries** | |
| F4 | Privacy note: "Your details are used only to reply to this request." | `contact.form.privacyNote` | SIRA | Must match the `/privacy/` page in WordPress | |

## 8. Demonstrations (always labelled "Illustrative")

| ID | Item | Where | Basis | Decision |
|---|---|---|---|---|
| D1 | Approval policy thresholds SAR 25,000 / 100,000, escalation 24/48 h (urgent 12/24 h) | `demo/workflow.ts` | DEMO | |
| D2 | References `MAT-MR-2026-00142`, `PUR-ORD-2026-00087` (ERPNext naming series) | `demo/workflow.ts` | DEMO | |
| D3 | Dashboard for "Example Trading Co. (fictional)": cash, overdue receivables, approvals waiting, reorder items, gross margin, twelve weeks of sales, ageing, e-invoice responses | `demo/dashboard.ts`, `demos.dashboard` | DEMO | |
| D4 | Dashboard title "What the general manager opens on Sunday morning" (Saudi working week) | `demos.dashboard.title` | DEMO | |

## 9. Facts the site is designed to show but does not have

Nothing below renders today. Supply any of them and a follow-up change adds the slot and a matching exception in the claims test.

| ID | Fact | Where it would appear | Status |
|---|---|---|---|
| X1 | Frappe partner status (if any) | Company, ERPNext, footer | UNKNOWN — must not be implied |
| X2 | Commercial registration and VAT numbers | Footer | Owner to supply |
| X3 | Contact email, phone, WhatsApp number | Contact, footer | Owner to supply; WhatsApp preference is a hypothesis (02 §2.4) |
| X4 | Office address | Contact, footer | Owner to supply (city names are on the denylist until then) |
| X5 | Client stories / case studies with permission | New page or home section | None available |
| X6 | Team and leadership | Company | Not requested |
| X7 | Digital brand mark; SIRA/SIRAH spelling | Header, footer, share images | ADR-033 gates open |
| X8 | Share images in the Qayd design | `public/digital/share-*.png` | To regenerate |

## 10. Arabic edition

| ID | Item | Decision |
|---|---|---|
| L1 | Arabic narrative reviewed by a native business-Arabic reader (terminology for ERPNext documents, tone, the name echo) | |
| L2 | Arabic legal pages (`/ar/privacy/`, `/ar/terms/`) exist in WordPress and match F4 | |
