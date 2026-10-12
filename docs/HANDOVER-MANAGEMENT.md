# SIRA websites platform — handover summary for management

**Date:** 12 October 2026 · **Status:** live, with four decisions outstanding

---

## In brief

SIRA's six company websites now run on one modern platform, built between
3 August and 19 September 2026. Five of them — SIRA Group, Consulting,
Healthcare, Lifestyle and Real Estate — are **live on their own addresses in
English and Arabic**. The sixth, SIRA Digital, has a new site that is
**finished but not yet launched**. All six are **hidden from Google on
purpose** until management approves the final content. Four decisions,
listed below, are all that stand between this and a full public launch.

## What was delivered

- **One platform for six companies.** One website application serves every
  SIRA company, each with its own identity, from one content system. A fix or
  improvement made once reaches all six.
- **Arabic and English as equals.** Every site has a full Arabic edition, set
  right-to-left with typography designed for Arabic, not mirrored from English.
- **A new design.** The "Atlas" design across Group and the four companies,
  and a distinct new identity, "Masar", for SIRA Digital.
- **Content stays where editors know it.** Editors keep using WordPress;
  changes appear on the live site shortly after publishing, with no developer
  involved.
- **The SIRA Record.** A group newsroom with 34 bilingual news items.
- **Enquiries that cannot be lost.** Contact forms save every enquiry before
  sending it, then deliver it to the right company's inbox through the
  company's Microsoft 365. Each company's form offers only its own services.
- **Fast and secure by design.** Hosted on Google Cloud. Visitors never reach
  the content system directly. Sites are built to load quickly on phones.
- **Under control.** Every change was reviewed and tested before release:
  78 approved changes, about 700 automated checks. Every release is kept, so
  a previous version can be restored in minutes.

## Where each site stands

| Company | Address | Status |
|---|---|---|
| SIRA Group | siratrgroup.com | ✅ Live — hidden from search engines |
| SIRA Consulting | consulting.siratrgroup.com | ✅ Live — hidden from search engines |
| SIRA Healthcare | healthcare.siratrgroup.com | ✅ Live — hidden from search engines |
| SIRA Lifestyle | lifestyle.siratrgroup.com | ✅ Live — hidden from search engines |
| SIRA Real Estate | realestate.siratrgroup.com | ✅ Live — hidden from search engines |
| SIRA Digital | digital.siratrgroup.com (later sirahdigital.sa) | 🟡 Built, awaiting approval — this address currently shows no SIRA site |

## Decisions needed

| # | Decision | Recommendation | If it waits |
|---|---|---|---|
| 1 | **Approve the final content and open the sites to Google** | Review the news items flagged for confirmation (some name partners, figures and appointments that must be checked), then switch indexing on. It takes minutes and needs no new release. | The sites stay invisible in search results. |
| 2 | **Approve and launch the SIRA Digital site** | Approve. It is complete and tested in both languages. Launch takes about an hour of technical work after approval. | SIRA Digital has no website, and its address shows a technical page. |
| 3 | **Confirm SIRA Digital's name and logo** | Decide "SIRA Digital" or "SIRAH Digital" (the domain is sirahdigital.sa), and commission the Digital logo. Changing the name is a small change. | The site launches with an interim wordmark. |
| 4 | **Bring the accounts under company ownership** | Move the code repository from a personal GitHub account to a SIRA organisation account. Confirm SIRA owns the Google Cloud billing, the domains, the hosting and the Microsoft 365 app. | Continuity depends on individual accounts. |

## Risks

| Risk | Level | Mitigation |
|---|---|---|
| Unverified statements in news items go public when indexing turns on | Medium | Decision 1: an editor confirms the flagged items first |
| A database restore has never been rehearsed | Medium | Backups exist and are verified, but restoring one has never been tested. Schedule one restore drill. |
| SIRA Digital's content system still holds 94 placeholder entries | Low | The new Digital site does not display them. Clean them up before Digital publishes news or projects. |
| Key access held by individuals | Medium | Decision 4 |
| Old website retained during stabilisation | Low | The previous Group website is kept as a fallback. Retire it after an agreed stabilisation period. |

## Next 30 days (proposed)

1. **Week 1:** editorial review of the flagged items; decide Digital's name.
2. **Week 1–2:** launch SIRA Digital; turn search indexing on for all sites.
3. **Week 2–3:** transfer accounts to company ownership; run the restore drill.
4. **Week 4:** submit sitemaps to Google; review the first search and
   enquiry results.

## Running costs

The websites run on Google Cloud (billed to the SIRA project). The content
system stays on the existing WordPress hosting. Running costs were not part of
this handover and should be confirmed from the two billing accounts.

## Where the detail is

- Technical handover, for the engineering team: `docs/HANDOVER.md`
- SIRA Digital launch and continuation guide: `docs/DIGITAL-HANDOVER.md`
- Current status on one page: `docs/STATE.md`

All three are in the project repository, `husam713/SIRA-Headless` on GitHub.
