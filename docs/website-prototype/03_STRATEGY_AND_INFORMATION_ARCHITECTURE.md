# 03 — Strategy and information architecture

**Task:** SIRA Digital premium website prototype · **Branch:** `feat/digital-enterprise-prototype` (stacked on PR #81) · **Basis:** `02_MARKET_AND_COMPETITOR_RESEARCH.md` · **Status:** PROVISIONAL — every positioning statement here awaits owner approval (`09_CONTENT_AND_APPROVAL_REGISTER.md`).

---

## 1. Positioning

**One sentence (provisional):** SIRA Digital implements ERPNext and automates the work around it — purchasing, inventory, sales, finance, HR and approvals — for organizations in Saudi Arabia, in Arabic and English.

**What the site argues, in order:**

1. *The problem is fragmentation, not missing software.* Most companies run on several tools and a spreadsheet; every number becomes a negotiation.
2. *One system of record fixes it.* ERPNext puts every department in one database, so a purchase, a delivery and a payment are one trail.
3. *Saudi requirements are handled, not headlined.* ZATCA Phase 2, Arabic, payroll and hosting appear as requirements dealt with during setup — the research found every competitor already shouting about ZATCA (02 §2.4).
4. *Here is how it goes live.* Five stages, each ending in a review, with what the buyer receives and what is needed from them.
5. *You can hold us to this.* Ownership, Arabic designed not translated, people decide, nothing undocumented, training until it is used.

**What the site never says** (ADR-039 and the claims test): client names, project counts, figures about SIRA, people, offices, partner status, certifications or dates. Demonstrations replace claims; sample data is labelled "Illustrative" in the rendered page and a test asserts it.

**Why this position is available** (02 §3): no inspected Saudi ERPNext partner explains *how* an implementation runs or *what the finished system does*, in equal Arabic and English, without leaning on numbers. SIRA has no verified numbers; it can occupy the explanation honestly.

## 2. Audiences

| Audience | Arrives wanting to know | Where the site answers |
|---|---|---|
| Owner / general manager of an SME or mid-market company | Will this fix the mess, what will it cost, how long, what is the risk | Home (problem, commitments, FAQ), Method, Contact |
| Finance manager | VAT, ZATCA e-invoicing, month-end close, migration of balances | ERPNext (Saudi requirements, migration), dashboard demo, FAQ |
| Operations / procurement | Approvals, stock, purchasing discipline | Automation, approval simulator, Industries |
| IT lead | Hosting, data residency, integrations, who owns the code | ERPNext (hosting, Frappe), Automation (integrations), Method (partner checklist) |
| Company already on ERPNext | Can you fix or take over our system | ERPNext ("Already on ERPNext?"), Services ("Review and recovery", "Run and support") |

## 3. Messaging hierarchy

| Level | Message | Where |
|---|---|---|
| Promise | "From request to ledger, one system." | Home hero |
| Proof by demonstration | Approval simulator; illustrative management view with "where this comes from" per figure | Home "the system running", Automation |
| Proof by transparency | Five-stage method with deliverables and gates; "Questions to ask any ERP partner — including us" | Method, Home |
| Reassurance | Five commitments; FAQ on ZATCA, Arabic, hosting, phasing, timeline, cost, migration | Home, ERPNext, Automation |
| Single action | "Request a discovery call" | Header button, every page's closing, Contact |

## 4. Site map

Digital tenant only. Every page exists in English (`/…`) and Arabic (`/ar/…`). The registry is `frontend/src/lib/digital-site/routes.ts`; router, sitemap and tests read the same list.

```
/                     Home
├── /services/        Solutions        (five lines of work, four ways to start)
├── /erpnext/         ERPNext          (why, modules, Saudi requirements, migration, hosting, Frappe, existing systems)
├── /automation/      Automation       (six patterns, simulator, integration hub, what stays with people)
├── /industries/      Industries       (seven sectors, seven functions before/after, group sectors)
├── /method/          Method           (five stages, roles, partner checklist)
├── /about/           Company          (why, how, principles, SIRA GROUP)
├── /contact/         Discovery request (composer + form, what happens next)
├── /privacy/ /terms/ CMS prose, in Digital's document
└── 404               Digital not-found, listing the pages that exist
```

Not on Digital (answer 404): `/news/` and editorial routes, `/work/`, `/projects/`, industry detail pages, investor relations. They exist for other tenants; on Digital they would render placeholder records.

**Primary navigation:** Solutions · ERPNext · Automation · Industries · Method · Company, plus the language switch and the "Request a discovery call" button. On phones the six items move into a native `popover` menu.

**Footer:** solutions list, pages, SIRA GROUP companies, legal (Privacy, Terms), and the line "Prototype for review. Content is provisional until approved." (to remove at launch).

## 5. Page anatomy

Each page is a sequence of sections on alternating tones (paper / sheet / mist / night). Every page ends with the shared closing ("Start with a discovery call", three steps) and, on subpages, related pages.

| Page | Sections, in order |
|---|---|
| Home | Hero (route map: purchase and sale documents posting to one ledger) → Problem (six disconnected tools; what happens / what it costs) → What we do (five solutions, tabbed) → ERPNext (module map on one database; Saudi requirements) → The system running (approval simulator; illustrative management dashboard) → Where it applies (sectors) → How a system goes live (five stages) → What you can hold us to (five commitments) → Questions buyers ask first (8 FAQs) → Closing |
| Solutions | Intro → Lines of work (index + detail: includes, outcome, where it fits) → Ways to start (Discovery, Phased implementation, Review and recovery, Run and support) → Not sure where to start? → Closing |
| ERPNext | Intro → Why ERPNext (4) → Modules (10, tabbed, with their documents) → Saudi requirements (5, with a caution that rules are re-confirmed per engagement) → Coming from somewhere else (4 sources) → Where it runs (3 hosting options) → When the standard is not enough (Frappe) → Already on ERPNext? → FAQ (5) → Closing |
| Automation | Intro → What we automate (6 patterns) → Approval simulator → What we connect (hub: finance, commerce, government, people, workplace) → What stays with people (system does / a person decides) → FAQ (4) → Closing |
| Industries | Intro → By sector (7, tabbed: where it breaks, modules, the route of documents, typical connections) → By function (7, before/after) → Sectors we see from inside the group → Closing |
| Method | Intro → Five stages (activities, deliverables, what we need from you, how it closes) → Who does what (5 roles) → Questions to ask any ERP partner (7, with our answer) → Closing |
| Company | Intro → Why it exists / How it works → Principles (5) → Part of SIRA GROUP (links to the five sister sites) → Closing |
| Contact | Intro → Discovery composer (situation, areas, size, timing → live brief) + details form → What happens next (3 steps) |

## 6. Conversion path

There is one conversion: a **discovery request**. The form does not ask the visitor to describe a solution; it asks four multiple-choice questions (where are you today, what should the system cover first, how many users, when) and composes a readable brief from the answers, live, in the visitor's language. The visitor sees exactly the text SIRA will read. Name and email are required; company, phone and a free message are optional. The request travels the existing `/api/contact/` → WordPress `sira/v1/contact` pipeline (rate-limited, honeypot) — no new backend.

Secondary paths lead *into* the conversion, never away from it: the hero's "Try the approval example" anchors to the simulator; every section's "read more" link leads deeper into the site; every page closes on the same three-step discovery invitation.

## 7. Arabic edition

- Same shape as English, enforced by a test (`content.test.ts`): a section cannot exist in one language only.
- `<html lang="ar" dir="rtl">` per locale; layout written in logical properties; diagrams and the route map mirror; tab arrow keys follow reading direction.
- Latin digits inside Arabic (ADR-034), matching the strongest local reference (Elm) and avoiding the failure observed on Frappe's own Saudi page (LTR Arabic, Arabic-Indic digits).
- Business Arabic, not a translation of English sentences; document names follow ERPNext's Arabic vocabulary where it exists. **Needs a native reviewer before launch** (09).

## 8. Search and sharing

- Per-page `<title>` and description from the narrative (`common.ts → meta.pages`), canonical URL and `hreflang` pairs for EN/AR (`lib/digital-site/metadata.ts`).
- Sitemap lists exactly the registry, per locale, and fails closed while deployment-wide indexing is off (07 §8).
- Open Graph images (`public/digital/share-*.png`) still show the Masar design — to regenerate before launch.
- No structured data beyond what the platform already emits; `Organization` details (CR, VAT, address) wait for the owner.

## 9. Reserved for facts SIRA does not have yet

Slots designed in the strategy but **not rendered** until the owner supplies verified content: Frappe partner status, commercial registration and VAT numbers (footer), a WhatsApp number, client stories or case studies, a team page, the Digital brand mark and the SIRA/SIRAH spelling. Each is listed with its owner decision in `09_CONTENT_AND_APPROVAL_REGISTER.md`.
