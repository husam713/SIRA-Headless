# 06 — ERPNext and automation service blueprint

**For:** the SIRA Digital owner and technical lead, to decide what the website may promise. · **Status:** PROVISIONAL. This is a proposed operating model *derived from what the prototype says*. Every row is either something SIRA must be able to do the day the site goes live, or a statement to remove from the site (`09_CONTENT_AND_APPROVAL_REGISTER.md`).

Evidence classes as in `02_MARKET_AND_COMPETITOR_RESEARCH.md`. Platform facts about ERPNext rest on Frappe's documentation (CONFIRMED there); everything about SIRA's capacity is **UNKNOWN** until the owner confirms it.

---

## 1. Why a blueprint

A website that explains *how* an implementation runs (03 §1) creates obligations a claims-led site does not: if the method page says "rehearsed on a copy and reconciled with your accountant", every engagement must do that. This document lists those obligations so they can be accepted, resourced or deleted **before** launch.

## 2. Service lines

| Line | The site promises | Operational requirement | Verify |
|---|---|---|---|
| ERPNext implementation | Process mapping, fit-gap, modules/roles/permissions, chart of accounts, VAT and e-invoicing setup, migration, bilingual training | Functional consultants for finance, buying/stock and HR; a technical consultant for setup and data; Arabic-speaking trainers | Team size and skills (UNKNOWN) |
| Workflow automation | Approval chains with limits and delegation, escalation, document capture, scheduled reports, notifications | ERPNext Workflow, Assignment Rules, Notifications, Auto Repeat, scheduled jobs (CONFIRMED platform features); document capture needs an OCR/IDP component | Which capture tool, its data residency, its cost |
| Integration and APIs | Banks, e-commerce, POS, payroll/HR, e-invoicing and government platforms, custom APIs; monitoring and error handling | Frappe REST API and webhooks (CONFIRMED); an integration log and alerting convention; per-bank file formats | Which banks/platforms SIRA has actually connected |
| Reporting and dashboards | Management, financial, VAT, inventory/purchasing/sales views by role, alerts | ERPNext reports, Query/Script Reports, Dashboards and Number Cards (CONFIRMED) | — |
| Support and improvement | Agreed response times, monitoring, backups, security updates, version upgrades, improvements, regular reviews | A support desk, an SLA, an upgrade procedure, backup/restore tested | Response times are **not stated on the site** on purpose — define before publishing any |

## 3. Engagement models

| Model | Site wording (summary) | Proposed shape | Owner decision |
|---|---|---|---|
| Discovery | Short, fixed engagement → scope and plan "you can use with us or without us" | Fixed fee, fixed duration, deliverables of stage 1 (§4); the client keeps the documents | Price and duration; confirm the "without us" promise |
| Phased implementation | Finance + one operational area first, then planned phases, each with its own go-live | Phase 1 = Accounting + Buying or Stock; later phases add Selling, HR/payroll, Projects, Manufacturing | Commercial model per phase |
| Review and recovery | Review an ERPNext system that underperforms, fix what matters, bring it up to date | Health check (configuration, permissions, data quality, customisations, version) → remediation plan | Willingness to take over unknown code |
| Run and support | Ongoing support for a live system, "ours or another partner's" | Monthly retainer, SLA tiers, upgrade window | SLA tiers and hours |

## 4. Method — what each stage obliges

| Stage | Deliverables promised | Client inputs requested | Gate | Internal artefacts needed |
|---|---|---|---|---|
| 1 Discover | Current-process maps; prioritised phased scope; first plan with stages and dates | Management sponsor; time with department leads; sample documents and reports | Client approves scope and plan | Interview guide, process-map template, system/data inventory sheet, scope template |
| 2 Design | Solution design document; workflow and approval matrix; data migration plan | Policy and approval-limit decisions; accountant's review of chart of accounts | Client signs off design | SDD template, approval-matrix template, Saudi chart-of-accounts starting point, numbering conventions, bilingual print-format set |
| 3 Build | Configured test system; documented customisations; reconciled migration rehearsal | Key users at demos; clean master data | Key users accept test system | Environment procedure (test vs production), customisation register, migration scripts and reconciliation checklist |
| 4 Launch | Trained users and role guides; completed go-live checklist; running system with live data | Testers per department; agreed cutover window | Client confirms go-live | UAT script library, role guides in Arabic and English, Fatoora onboarding runbook, cutover checklist, rollback plan |
| 5 Run | Support with agreed response times; regular usage reviews; improvement backlog the client controls | A client system owner; user feedback | Reviewed at agreed intervals | Ticketing, SLA, review template, upgrade runbook |

**Roles promised on every engagement:** client sponsor, client system owner, client key users (one per department), SIRA implementation lead (single point of contact), SIRA consultants and developers.

## 5. Saudi requirements workstream

| Requirement | Site wording | What must be true before publishing | Class today |
|---|---|---|---|
| ZATCA Phase 2 e-invoicing | "through a tested e-invoicing app … cleared or reported through the Fatoora platform … onboarded together with you" | SIRA has chosen, installed and tested one Phase 2 app end to end on the sandbox (clearance for standard invoices, reporting for simplified, credit/debit notes, onboarding of the EGS unit) | ERPNext app availability TRANSFERRED (02 S17/S18); SIRA testing **UNKNOWN** |
| VAT | Tax templates, VAT on invoices, return figures | Standard ERPNext + KSA regional setup; a VAT return report reviewed by an accountant | Platform CONFIRMED |
| Arabic | Arabic interface RTL; bilingual print formats; role training in Arabic | A reviewed Arabic translation of used screens; print formats for invoice (with QR), quotation, PO, delivery note | Platform RTL CONFIRMED; translation quality per screen UNKNOWN |
| Payroll | "Salary structures … set up for Saudi payroll, with the files your wage-protection process needs prepared and checked with your HR team" | Frappe HR salary structures for GOSI deductions and allowances; a tested WPS/Mudad export | **Verify with MHRSD/GOSI and the app vendor** (02 S10, vendor sources only) |
| Data and hosting | Managed cloud; private cloud in the Kingdom; on-premise | A priced option for each; a named in-Kingdom provider; a hosting decision record template per client | Frappe Cloud regions conflict (02 §2.2); in-Kingdom private cloud is a hypothesis to price |
| Personal data | Roles and permissions so each person sees what their work requires; help documenting processing and storage | A PDPL processing-record template; role-permission baseline | Law TRANSFERRED (02 S4); legal review recommended |

Standing rule (stated on the ERPNext page): *at the start of every engagement, re-confirm current ZATCA, payroll and data rules.* This needs an owner (a named person) and a checklist.

## 6. Automation boundary

The site commits to a line between system and person. Keep it in every design document:

| The system does | A person decides |
|---|---|
| Routing, reminders, escalation | Approvals that need judgment |
| Matching, calculating, posting | Exceptions and disputes |
| Collecting the data a decision needs | Anything committing the company to a third party |
| Recording who did what, and when | Changes to the rules themselves |

## 7. The demonstrations and how they map to real work

| Demo | Mirrors | Note for sales conversations |
|---|---|---|
| Approval simulator (`lib/digital-site/workflow.ts`) | An ERPNext Workflow on Material Request: states owned by roles, transitions guarded by conditions (`doc.grand_total >= 25000` → quotations; `>= 100000` → general manager; category asset → finance), Purchase Order created on final approval; escalation hours per role | Thresholds and hours are invented (`demo/workflow.ts`). In an engagement they come from stage 2's approval matrix. Two behaviours are not standard ERPNext and need a server script, scheduled job or app — confirm the mechanism before demonstrating them as real: time-based escalation, and creating the Purchase Order automatically on the final approval |
| Management dashboard (`dashboard.tsx`, `demo/dashboard.ts`) | Number Cards and charts on Bank Reconciliation, Sales Invoice, Payment Entry, Stock Ledger, Material Request, E-invoice log | Every figure belongs to a fictional "Example Trading Co."; the "where this comes from" lists name real ERPNext doctypes |
| Discovery composer | Stage 1's intake | The composed brief arrives in the enquiry message; use it as the first discovery agenda |

## 8. Decisions to take before launch

1. Confirm or cut each service line (§2) and engagement model (§3).
2. Name the ZATCA Phase 2 app and record its test evidence; otherwise soften the ZATCA wording to "we evaluate and test an app with you".
3. Verify payroll/WPS file support, or remove the wage-protection sentence.
4. Price the three hosting options and name the in-Kingdom provider, or remove "Private cloud in the Kingdom".
5. Define support response times internally (the site deliberately states none).
6. Decide whether "take over support from another partner" and "review and recovery" are offered.
7. Confirm Frappe partner status before anything implies it (nothing does today).
