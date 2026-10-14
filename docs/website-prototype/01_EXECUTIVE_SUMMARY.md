# 01 — Executive summary

**For:** the SIRA owner. · **What:** a premium website prototype for SIRA Digital, built in the platform on branch `feat/digital-enterprise-prototype` (stacked on PR #81, "Masar"). · **Date:** 2026-10-14. · **Status:** complete and validated locally; awaiting your review. Nothing is deployed, nothing was written to WordPress, nothing is merged.

---

## What was built

A bilingual (English and Arabic) website for SIRA Digital as an **ERPNext implementation and business-automation company for organizations in Saudi Arabia**. Eight pages plus legal pages and a not-found page, in both languages:

Home · Solutions · ERPNext · Automation · Industries · Method · Company · Discovery request.

The design direction, **"Qayd"** (القيد — a ledger entry), evolves the lapis identity you authorised for Masar: a company's work shown as documents moving along routes into one ledger, drawn with the SIRA right-angle line, in IBM Plex Sans and IBM Plex Sans Arabic.

## The idea behind it

The market research (doc 02) found that every Saudi ERP competitor leads with ZATCA and with numbers — client counts, logos, partner badges. SIRA Digital has none of those it can verify, and the site may not invent them. So instead of claiming, the site **demonstrates and explains**:

- an **approval simulator** — change the amount or category of a purchase request and watch its route change, then send it through to a purchase order;
- an **illustrative management dashboard** — every figure says which ERPNext documents it comes from, and the whole view is labelled as sample data;
- a **five-stage method** with what the client receives and what is needed from them at each stage, and a list of "questions to ask any ERP partner — including us";
- a **discovery form** that turns four multiple-choice answers into a readable brief, live, in the visitor's language, and sends it through the existing contact pipeline.

No inspected competitor explains *how* an implementation runs in equal Arabic and English. That is the position the site takes.

## Quality

| Check | Result |
|---|---|
| Build, lint, typecheck | Pass |
| Tests | 738/738 pass (one test file fails to load on Windows on every branch — known, unrelated) |
| Phone, tablet, desktop, Arabic, reduced motion | 16/16 pass on the production build |
| Speed (local lab) | Largest content appears in 0.15–0.4 s; no layout shift |
| Accessibility | Text contrast AA or better throughout; keyboard and focus checked; two defects found and fixed in this session |

Details: doc 07.

## What it needs from you

1. **Approve the words.** Every positioning statement, commitment, service, engagement model and FAQ answer is provisional. Doc 09 lists them one per row for approve / amend / remove.
2. **Confirm what SIRA Digital actually offers** — service scope, Frappe partner status, the ZATCA e-invoicing app, payroll file support, in-Kingdom hosting. Doc 06 shows what each promise on the site would oblige the company to do.
3. **Supply what exists**: CR and VAT numbers, a contact email or WhatsApp, the Digital brand mark, the SIRA/SIRAH spelling.
4. **Review the design** with the checklist in doc 10 (about 45 minutes).
5. **Decide ADR-039 and its amendment** (in `docs/DECISIONS.md`), and whether to merge PR #81 and this PR. Merging is yours.

## Known limitations

- The site's text lives in the repository, not WordPress, because the Digital blog holds placeholder records from another company (ADR-039). It can move to the CMS later without redesign.
- Digital's stylesheet is downloaded by the other five sites too (about 9 KB compressed, inert there). Fixing it is a separate platform change.
- Social share images still show the previous design.

## The document set

| # | Document | For |
|---|---|---|
| 01 | Executive summary (this file) | Owner |
| 02 | Market and competitor research | Owner, strategy |
| 03 | Strategy and information architecture | Owner, content |
| 04 | Design system | Design, engineering |
| 05 | Implementation guide | Engineering |
| 06 | ERPNext and automation service blueprint | Owner, technical lead |
| 07 | QA and performance report | Engineering, owner |
| 08 | Project handover and decision log | Next session / maintainer |
| 09 | Content and approval register | Owner |
| 10 | Design review checklist | Owner, reviewers |
