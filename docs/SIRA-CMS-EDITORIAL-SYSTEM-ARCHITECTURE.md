# SIRA CMS — Durable Editorial System Architecture

**Status:** PROPOSED / NOT AUTHORIZED FOR IMPLEMENTATION
**Type:** architecture + staged Task Packets + gap matrix
**Prepared against:** live read-only CMS evidence, 2026-08-31

This document designs the SIRA CMS as a durable editorial system. It contains
**no invented SIRA business content, imagery, legal text, or Arabic
translations**. Every content value it proposes is a Draft-only brief or a
structural default. Nothing here is authorized to execute.

---

## 1. Why this exists

Step 4 delivered a responsive frontend that renders real WordPress data. The
frontend is no longer the constraint — the editorial system is. Today a future
employee cannot create, review, translate, and publish SIRA content from
WordPress alone, because parts of the model, the menu architecture, the roles,
and the workflow do not yet exist.

The intended outcome is that all five sites are **content-ready**: every
required page, section, image slot, menu, contact detail, SEO field, legal link,
and editorial module is represented in WordPress and editable without touching
code, Next.js, GraphQL, or Bricks.

### Ownership model (restated as the spine of this design)

| Layer | Owns | Must never own |
|---|---|---|
| **WordPress** | canonical editorial content, media, menus, SEO values | presentation, layout, tokens |
| **`sira-core`** | content models, validation, GraphQL contracts, menu locations, business rules | copy, imagery, brand colour as content |
| **SIRA Headless theme** | editor/fallback support only | any public frontend rendering |
| **Next.js** | all public presentation | canonical content |

This restates ADR-002, ADR-004, ADR-006, ADR-007, ADR-008. Nothing here changes them.

---

## 2. Measured current state (evidence, 2026-08-31)

Read live and read-only from the five GraphQL endpoints and the Group REST API.
Evidence, not estimates.

### 2.1 Homepage section content — TP-1 measured, all five sites

Every section field queried against the checked-in schema's real field names.
`fieldGroupName` excluded (always present, meaningless for content presence).

| Site | variant | Sections filled | Missing |
|---|---|---|---|
| **Group** | `group` | **12 of 12** | none |
| **Consulting** | `branch` | **8 of 8** | none |
| **Lifestyle** | `branch` | **8 of 8** | none |
| **Real Estate** | `branch` | **8 of 8** | none |
| **Healthcare** | `branch` | **2 of 8** | `branchContact`, `branchInsights`, `branchProjects`, `footer`, `overview`, `statistics`, `focusAreas` |

**This corrects the provisional reading in an earlier draft of this document.**
An earlier pass sampled only `overview` among branch sections and concluded the
branch sites carried "2-3 of ~8". They do not. Three of four branch sites are
**content-complete** — including the statistics and focus-area repeaters,
which do resolve (G4 withdrawn).

Two consequences:

1. **Healthcare is the only real branch content gap.** It is missing seven
   sections the other three branches have filled. Content work should target
   Healthcare specifically, not "the branch sites" generally.
2. **G5 is more serious than recorded.** `footer` is *filled* on Consulting,
   Lifestyle, and Real Estate — and the frontend normalizes then discards it.
   Editors have already entered content that is being silently thrown away.
   This is not a trust risk in future; it is live data loss now.

### 2.2 Pages

| Site | Pages | Front page | Notes |
|---|---|---|---|
| Group | **12** | `Home` set | real pages incl. `/newsroom/`, `/healthcare/`, `/real-estate/`, `/our-services/`, two PET-CT pages |
| Consulting | **2** | `Home` set | `/` + `/sample-page/` (WordPress default) |
| Healthcare | **2** | `Home` set | `/` + `/sample-page/` |
| Lifestyle | **2** | `Home` set | `/` + `/sample-page/` |
| Real Estate | **2** | `Home` set | `/` + `/sample-page/` |

Each branch site still carries the stock `Sample Page`. No branch site has a
legal page, contact page, or newsroom.

### 2.3 Menus — the blocking structural defect

| Probe | Result |
|---|---|
| Menus existing in WordPress (Group, via REST) | **4** — `Main Navigation`, `Primary English`, `Primary Menu`, `Services English` |
| Locations assigned to those menus | **none** — all `locations: []` |
| Registered nav-menu locations | **zero** |
| Menus visible via WPGraphQL (all five sites) | **0** |
| `register_nav_menus()` in `sira-core` | **absent** |
| Active theme | **Bricks** (excluded from production by ADR-007) |

WPGraphQL only exposes menus **assigned to a registered location**. With zero
locations registered, four real menus are invisible to the frontend on every
site. The frontend behaves correctly — `normalize-navigation.ts` returns
`menu-unassigned` and renders nothing rather than inventing items (ADR-015).

**This is a backend code gap, not a content gap.** No amount of editing in
wp-admin can fix it.

### 2.4 Brand identity inconsistency

Site titles read `SIRA GROUP`, `SIRA Consulting`, `SIRA healthcare`,
`SIRA lifestyle`, `SIRA realestate` — three casing conventions. Matches the
already-recorded `CMS-2C4-001` / `CMS-2C4-002` identity actions.

### 2.5 Known model defects carried forward

- ~~**ACF repeaters do not resolve over WPGraphQL.**~~ **Withdrawn.** They do
  resolve. Live-verified 2026-08-31: Consulting, Lifestyle and Real Estate each
  return 4 statistics and 3 focus areas. The claim originated in a stale comment
  in `normalize-homepage.ts`, now corrected. Healthcare returns null only
  because the content was never authored.
- **Field-group flattening.** Every section is its own top-level field group,
  because WPGraphQL for ACF cannot resolve fields inside a `group` nested in
  another group's `fields` array. Any new model must respect this.
- **`branch.footer` overrides are normalized then discarded** — an editor
  filling `taglineOverride` / `groupLinkLabelOverride` sees no effect.

---

## 3. Gap summary

| # | Gap | Class | Blocks |
|---|---|---|---|
| G1 | No registered nav-menu locations | **backend code** | all navigation, mobile menu |
| G2 | **Healthcare only** — 2 of 8 sections; other branches are **8 of 8** | content | Healthcare launch |
| G3 | No legal pages on any site | content + model | compliance, footer links |
| ~~G4~~ | ~~ACF repeaters unresolvable~~ **WITHDRAWN — not a defect.** Repeaters resolve and carry real content on three sites; the claim came from a stale code comment. Verified 2026-08-31. | — | — |
| G5 | `branch.footer` filled on 3 sites, normalized then **discarded** | frontend wiring | **live data loss** |
| G6 | No editorial roles/workflow defined | process | safe delegation |
| G7 | No media governance (alt, focal, rights) | model + process | accessibility, licensing |
| G8 | No SEO field ownership | model | search, social |
| G9 | Arabic/RTL unreachable (`defaultLocale: "en"`, no locale routing) | **architecture decision** | bilingual launch |
| G10 | Stock `Sample Page` on 4 sites | content hygiene | professionalism |
| G11 | Brand title casing inconsistent | content | brand integrity |
| G12 | No backup/restore evidence (RB-001, RB-009) | **operational** | every mutation |

---

## 4. Workstream designs

### WS1 — Content model and editorial fields

**Principle:** the model largely works for Group already. The task is to make it
*legible and complete*, not to redesign it.

Each homepage section should expose a consistent quartet — `eyebrow`, `heading`,
`description`, `link` — plus section-specific structure. That pattern already
exists; it needs documenting, labelling in wp-admin with editor-facing help
text, and validating.

**Required additions:**
- **Legal page model** — a `Legal Document` template with `documentType`
  (privacy / terms / cookies / imprint), `effectiveDate`, `lastReviewed`.
- **Contact detail model** — the contact section is currently a form shell with
  hardcoded English labels, and `group-investor.tsx` hardcodes investor
  categories and dollar ticket bands. Those are business data and belong in the
  CMS.
- ~~**Repeater replacement for G4**~~ — **removed.** G4 is withdrawn: the
  repeaters resolve and carry real content. Do **not** migrate stats or focus
  areas off ACF repeaters; there is nothing to fix, and doing so would discard
  authored content on three sites for no benefit.

Every field gets a label and description written for a non-technical employee,
not a developer.

### WS2 — Per-site content matrix

§2.1–2.2 is the baseline. Completion per site:

| Requirement | Group | Consulting | Healthcare | Lifestyle | Real Estate |
|---|---|---|---|---|---|
| Homepage hero | ✅ | ✅ | ✅ | ✅ | ✅ |
| Homepage body sections | ✅ 12/12 | ✅ **8/8** | ❌ **2/8** | ✅ **8/8** | ✅ **8/8** |
| Stats band | n/a | ✅ 4 rows | ❌ unauthored | ✅ 4 rows | ✅ 4 rows |
| Focus areas | n/a | ✅ 3 rows | ❌ unauthored | ✅ 3 rows | ✅ 3 rows |
| Footer overrides | n/a | ⚠ filled, **discarded G5** | ❌ empty | ⚠ filled, **discarded G5** | ⚠ filled, **discarded G5** |
| Primary menu | ❌ G1 | ❌ G1 | ❌ G1 | ❌ G1 | ❌ G1 |
| Footer menu | ❌ G1 | ❌ G1 | ❌ G1 | ❌ G1 | ❌ G1 |
| Legal menu + pages | ❌ | ❌ | ❌ | ❌ | ❌ |
| Site tagline (SEO description) | ✅ | ❌ empty | ❌ empty | ❌ empty | ❌ empty |
| `Sample Page` removed | n/a | ❌ | ❌ | ❌ | ❌ |
| Arabic content | ❌ G9 | ❌ G9 | ❌ G9 | ❌ G9 | ❌ G9 |

**TP-1 complete.** All five sites measured. Remaining unmeasured: per-page SEO
title/description overrides and social share images — WPGraphQL exposes no `seo`
field on `Page` in the checked-in schema, so those are either unmanaged or live
in a plugin not exposed to GraphQL. Confirming which is a TP-5 input.

### WS3 — Media workflow

**Sizes** derive from the frontend's actual usage, not invention: hero uses
`<picture>` with a `max-width: 767px` mobile source; card media is `16/10`;
insight cards `16/11`; partner logos cap at `10rem`.

**Required per media item:**
- `alt` text — **mandatory**, enforced at upload
- focal point — needed because every card uses `object-fit: cover`
- caption and credit
- **usage rights**: owner, licence, expiry, territory
- `missingMedia` status flag so the matrix reports honestly

**Blocked by `2C4-B07`** (media origin/delivery, UNRESOLVED). Until it resolves,
images ship as plain `<img>` with no `sizes` and no `next/image`. Governance can
be designed now; delivery cannot.

### WS4 — Native menu architecture

**Register exactly three locations** in `sira-core` — never in a theme, so they
survive dropping Bricks:

| Location | Purpose | Owner |
|---|---|---|
| `PRIMARY` | main header navigation | site editor |
| `FOOTER` | footer column links | site editor |
| `LEGAL` | privacy / terms / cookies | reviewer only |

These three are exactly what the frontend already queries — no new contract.

**Anchor contract.** The Group header expects in-page anchors that exist today:
`#companies`, `#investors`, `#projects`, `#insights`, `#contact`. Five sections
still lack ids (`about`, `services`, `partners`, `testimonials`,
`latest-updates`); a menu item pointing at those silently does nothing. Adding
those ids is small frontend work and belongs with WS4.

**Which existing menu maps to `PRIMARY` is an owner decision.** Three candidates
exist and their contents must be read first. Not guessing.

**Nested items.** Both navs currently drop `item.children` silently. Either
support one level of nesting or validate against it — silent omission is the
worst option.

### WS5 — SEO and editorial workflow

Per page: title, meta description, canonical override, social share image,
`noindex` toggle, redirect-from. Defaults derive from content; overrides are
explicit. Legal pages get `noindex: false` and a review date.

Canonical rules already exist (ADR-024: `siratrgroup.com` apex + four branch
subdomains). Redirects need a managed table — none exists today.

### WS6 — Roles and permissions

| Role | Create | Edit own | Edit others | Publish | Menus | Media | Settings |
|---|---|---|---|---|---|---|---|
| Author | ✅ | ✅ | — | — | — | upload | — |
| Editor | ✅ | ✅ | ✅ | — | ✅ | ✅ | — |
| Reviewer | — | — | comment | ✅ | — | — | — |
| Publisher | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Administrator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

`Reviewer` and `Publisher` are **new custom roles**; WordPress ships neither.
Legal content should be publishable only by `Publisher`+.

### WS7 — Draft / review / publish workflow

`Draft → In Review → Approved → Published`, with scheduled publishing and an
audit trail (who changed what, when). Requires an editorial-workflow capability
in `sira-core` or a vetted plugin — **a build-vs-adopt decision for the owner.**

Preview already works: signed Preview Entry + Draft Mode (Step 3C.2) is live, so
reviewers can see unpublished content on the real frontend today.

### WS8 — Multilingual: a separate decision gate

**This is `2C4-B09` and must not be bundled into any other workstream.**

Current state: `LocaleCode = "en" | "ar"` exists in types; all five sites are
`defaultLocale: "en"`; there is no locale route, switcher, or `hreflang`; the
frontend can only emit `dir="ltr"`. RTL *styling* is implemented and verified
(`verify:layout` 75/75, both directions) — the styling is ready, the content
architecture is not.

Three viable models, each with different editorial consequences:
1. **Separate site per locale** (multisite pattern already in use)
2. **Translation plugin** (WPML/Polylang) with WPGraphQL support
3. **Per-field translation** in `sira-core`

**Owner decision required before any Arabic content is created.** No Arabic text
will be authored here.

### WS9 — SIRA Headless companion theme

A minimal theme whose only jobs: satisfy WordPress's theme requirement, provide
editor-only admin styling, host editorial help text, and render a plain fallback
if anyone reaches WordPress directly. **It must never serve the public
frontend** (ADR-007).

Menu-location registration deliberately goes in `sira-core`, **not** here, so it
survives theme changes.

### WS10 — Seed tooling (structural defaults only)

A WP-CLI command in `sira-core` that is **idempotent, dry-run by default,
per-site, audit-logging, and incapable of overwriting or deleting existing
content**. It seeds only menu location assignments, empty Draft page skeletons,
and role definitions. It never writes editorial copy.

Flags: `--dry-run` (default), `--site=<key>`, `--report=<path>`,
`--no-overwrite` (enforced, not optional).

### WS11 — Handover guide

A written guide for a non-technical employee: where content lives, how to edit
each homepage section, how to add media with alt text and rights, how to manage
menus, the review workflow, how to preview safely, and what never to touch. Plus
a per-site launch checklist derived from the WS2 matrix.

---

## 5. Staged Task Packets

Each is a separate authorization, PR, and acceptance gate.

| # | Packet | Track | Depends on | Mutates CMS? |
|---|---|---|---|---|
| **TP-1** | ~~Read-only CMS content audit~~ **DONE 2026-08-31** — see §2.1 | audit | — | **no** |
| **TP-2** | Register `PRIMARY`/`FOOTER`/`LEGAL` in `sira-core`; regenerate schema | backend | — | no (code) |
| **TP-3** | Add missing section anchor ids; wire `branch.footer` overrides (G5) | frontend | — | no |
| ~~**TP-4**~~ | ~~Repeater-resolution spike~~ **DONE / NO WORK NEEDED 2026-08-31** — repeaters resolve; G4 withdrawn | spike | — | **no** |
| **TP-5** | Content model additions — legal, contact, media governance fields | backend | — | no (code) |
| **TP-6** | Roles + editorial workflow | backend | — | no (code) |
| **TP-7** | Companion theme | backend | TP-2 | no |
| **TP-8** | Seed tooling, dry-run only | backend | TP-2, TP-6 | **dry-run only** |
| **TP-9** | Menu assignment execution | **CMS mutation** | TP-2, TP-8, **RB-001 + RB-009** | **yes** |
| **TP-10** | Draft content briefs per site | **CMS mutation** | TP-5, TP-9 | **yes** |
| **TP-11** | Multilingual decision | **owner decision** | — | no |
| **TP-12** | Handover guide | docs | TP-1…TP-10 | no |

TP-1 through TP-8 mutate **no** CMS content and need no backup evidence. TP-9
and TP-10 are the only mutating packets, gated behind backup and restore
evidence.

## 6. PR boundaries

One PR per Task Packet, against `main`, never combined:

- `docs/` — TP-1 audit output, TP-12 handover
- `backend/` — TP-2, TP-5, TP-6, TP-7, TP-8 (each separately; TP-4 closed, no work)
- `frontend/` — TP-3 only
- **no PR** — TP-9, TP-10 (execution packets with their own approval record)

Generated GraphQL output is regenerated, never hand-edited. Schema changes from
TP-2 require a codegen refresh in the same PR.

## 7. Authorization state

Nothing here is authorized. Current recorded state:

```
cmsMutationAuthorization   = NOT_GRANTED
batchAMutationAuthorized   = False
backupCreationAuthorized   = False
restoreExecutionAuthorized = False
RB-001 (backup evidence)   = UNKNOWN
RB-009 (restore evidence)  = UNKNOWN
```

`SOT-001`'s closure additionally requires new backend work to carry its own
authorized stage. TP-2 and TP-5…TP-8 each need one (TP-4 is closed).

**Recommended order:** ~~TP-1~~ (done) → **TP-2** (unblocks all navigation) →
~~TP-3~~ (done, PR #50) → ~~TP-4~~ (closed, no work) → TP-5. Nothing mutating
until backup and restore evidence exists.
