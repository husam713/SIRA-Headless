# SIRA Digital — handover and continuation guide

**As of:** 2026-10-12 · `main` @ `2cb12ca9` · PR #81 (`feat/digital-masar` @
`7378c2fc`) open, CI green, mergeable.

**Audience:** whoever picks SIRA Digital up next, us included. It covers where
Digital stands, what is already built, and the exact steps to launch it and
keep going. The platform-wide handover is [`HANDOVER.md`](HANDOVER.md).

---

## 1. Where Digital stands — in one table

| Layer | State (verified 2026-10-12) |
|---|---|
| Company | SIRA Digital — a SIRA GROUP technology company for the Saudi market (ADR-033) |
| WordPress | blog 6, origin `cms-digital.siratrgroup.com` (ADR-036); answers 200; holds **94 placeholder records**, including people and figures from another company |
| Code on `main` | the first Digital composition (ADR-033: dark ground, Group gold, `components/digital/*`), bilingual (ADR-034) — built, tested, but **never publicly served** |
| New site "Masar" | **PR #81**, complete and green, not merged — lapis on bone, repository-owned narrative (ADR-039, PROPOSED) |
| Public host | `digital.siratrgroup.com` — **DNS still points at the WordPress host**, which redirects visitors to a WordPress sign-up page. The Cloud Run domain mapping already exists and was Ready with its certificate on 2026-09-12 |
| Planned host | `sirahdigital.sa` (+ `www`) — registered in the site registry as *planned*; not active (ADR-035) |
| Search indexing | off for the whole estate; the switch is **one switch for all six tenants** |

**Bottom line:** Digital has no public site today. Everything needed to give it
one is built; the remaining steps are owner decisions plus about an hour of
deploy and DNS work (§5).

## 2. The decisions that govern Digital

| ADR | What it says | Status |
|---|---|---|
| ADR-033 | Digital is a first-class SIRA company in the same CMS, app and contact pipeline; its intended domain is `sirahdigital.sa` | accepted (visual direction superseded by 039 if accepted) |
| ADR-034 | English and Arabic from one WordPress site; `sira_locale` / `sira_translation_of`; Arabic typography rules | accepted |
| ADR-035 | launch on `digital.siratrgroup.com`; move to `sirahdigital.sa` by configuration, not migration | accepted |
| ADR-036 | Digital's CMS moved to `cms-digital.siratrgroup.com`, freeing the public host | executed 2026-09-10 |
| ADR-039 | Digital renders its own document, "Masar", from a narrative versioned in the repository | **PROPOSED** — PR #81 |

Still open from ADR-033: the trading-name spelling (**SIRA Digital** vs
**SIRAH Digital** — the domain is `sirahdigital.sa`) and a Digital-specific
brand mark (the wordmark and line glyph in Masar are interim).

## 3. What "Masar" is

**Idea.** The SIRA mark is one continuous line turning at right angles; SIRA
Digital routes the work. That line is the whole visual system: a routing field
that draws itself across the hero and bends around the pointer, a spine along
the reading edge that follows the scroll, one glyph per capability, and the
image the route arrives at. In Arabic the entire system runs right to left.

**Identity.** Lapis `#1c34d8` on bone `#f4f4ef`, ink `#101216` for type, one
vermilion `#ff4d1f` reserved for live states. Archivo (width axis) for display
and text, IBM Plex Mono for the instrument layer, Noto Kufi Arabic for Arabic.

**Pages.** `/` (home), `/services/` (what we build), `/about/` (company),
`/contact/` (a brief composer: the visitor picks what repeats and what would
help, the page writes the brief live in their language and sends it through
the normal contact pipeline), CMS prose pages (`/privacy/`, `/terms/`) in the
Digital voice, and a Digital 404. `/work/`, `/industries/`, the newsroom and
Atlas-only routes answer 404 on Digital until real content exists.

**Content source.** The narrative lives in the repository
(`frontend/src/content/digital-site/{en,ar}.ts`), typed so both languages share
one shape, because blog 6 holds placeholder records that must not be shown as
fact. It describes capability and practice only — no clients, numbers, people,
offices, certifications or dates — and a test forbids adding them. Legal
pages and enquiries still come from WordPress.

**Engineering.** Server-rendered first: the routing field is drawn as SVG on
the server and continued on a canvas in the browser; it never starts under
reduced motion and pauses off-screen. Motion is CSS-first (scroll-driven
animations behind `@supports` and `prefers-reduced-motion`), the mobile menu is
a native popover. Three small client components (live field, brief composer,
footer clock); no new dependency.

**Measured (2026-09-22, local production build).** 727/727 tests; lint,
typecheck, build PASS; QA sweep 16/16 (390–1920 px × motion × EN/AR); home
cold LCP 580 ms, CLS 0.000. Screenshots: `artifacts/digital-masar/*.png` on
the PR branch.

## 4. Where the files are

On PR #81's branch until it merges, then on `main`:

| Area | Files |
|---|---|
| Narrative EN/AR | `frontend/src/content/digital-site/{types,en,ar,index}.ts` |
| Document shell | `frontend/src/components/digital-site/{document,header,footer,spine,clock,glyphs}.tsx` |
| Routing field | `frontend/src/lib/digital-site/route-field.ts`, `components/digital-site/field/{static-field,live-field}.tsx` |
| Pages and sections | `components/digital-site/pages/*`, `components/digital-site/sections/*` |
| Brief composer | `components/digital-site/brief-composer.tsx`, `lib/digital-site/brief.ts` |
| Metadata, routes | `lib/digital-site/{metadata,routes,hrefs}.ts`; tenant branch in `app/(sites)/[siteKey]/layout.tsx` |
| Styles, fonts | `frontend/src/styles/digital-site.css`, `styles/digital-fonts.ts` |
| Assets | `frontend/public/digital/{icon.svg,share-en.png,share-ar.png}` |
| Tests | `frontend/tests/unit/digital-site/{route-field,content,brief,document-gates}.test.ts` |
| Decision | `docs/DECISIONS.md` ADR-039 |
| Task record | `docs/tasks/digital-masar-2026-09-22.md` |
| Registry | `frontend/src/config/sites.ts` (`digital`: canonical, planned hostnames) |

## 5. Launch plan

Steps marked **owner** are protected operations — they need an explicit owner
instruction at the time.

| # | Step | Who | How / done when |
|---|---|---|---|
| 1 | Review Masar | owner | screenshots in PR #81, or run it locally (§8) |
| 2 | Decide the spelling and confirm the interim mark | owner | if SIRAH: two strings — `BASE_SITES.digital.name` in `sites.ts` and the `digital` preset in `lib/brand/fallbacks.ts`, plus the WordPress preset |
| 3 | Merge PR #81 | owner | merge commit on `main` |
| 4 | Mark ADR-039 accepted | engineer | edit the status line in `docs/DECISIONS.md`; update `docs/STATE.md` |
| 5 | Check blog 6's legal pages | editor | `/privacy/` and `/terms/` exist in EN and AR and are real text, not placeholders — they render on the public site |
| 6 | Verify locally against production settings | engineer | `pnpm build && pnpm start`, open `digital.localhost` in EN and AR, run the QA sweep (§8) |
| 7 | Deploy | owner | build and deploy `main` ([HANDOVER §8](HANDOVER.md#8-deploy-and-roll-back)); tag `release/<date>-production`. This is safe for the other five tenants: Masar's code is scoped to Digital and was checked against Group |
| 8 | Point DNS | owner | at the DNS panel: remove the Hostinger A record for `digital`, add `digital CNAME ghs.googlehosted.com.`; wait for the certificate (minutes to an hour) |
| 9 | Smoke test | engineer | `https://digital.siratrgroup.com/` and `/ar/` return 200 from Google Frontend; services, about, contact, privacy, terms render; 404 routes 404 |
| 10 | Real enquiry test | owner | one test submission EN and AR; confirm it is stored in WordPress and reaches the Digital inbox |
| 11 | Indexing | owner | Digital follows the estate-wide `SIRA_SEARCH_INDEXING` switch — if the other sites are indexed when Digital goes live, Digital is indexed at once, so do 5–10 first |

**Rollback:** remove the DNS record (the site disappears; nothing else
changes) or route Cloud Run traffic to the previous revision. Reverting the
#81 merge commit restores the ADR-033 composition.

## 6. Moving to `sirahdigital.sa` (later)

The move is configuration, not a migration (ADR-035):

1. Cloud Run domain mappings for `sirahdigital.sa` and `www.sirahdigital.sa`
   (`gcloud beta run domain-mappings create --service sira-frontend --domain
   sirahdigital.sa --region europe-west1`) — owner.
2. DNS at the `.sa` registrar: the A/AAAA records Google prints for the apex,
   `www CNAME ghs.googlehosted.com.` — owner.
3. Set `SIRA_CANONICAL_HOSTNAMES_JSON={"digital":"sirahdigital.sa"}` on the
   service. `sirahdigital.sa` becomes canonical with its `www` alias;
   `digital.siratrgroup.com` becomes a redirect alias, so no indexed URL is
   orphaned. No rebuild.
4. Microsoft 365: if enquiries should come from or go to a `@sirahdigital.sa`
   mailbox, update the Digital recipient in `wp-config.php`.
5. Search Console: add the new property and submit its sitemap.

A promotion target must already be declared in the registry, so a typo fails
loudly instead of repointing the company.

## 7. After Masar is accepted — clean-up and backlog

**Retire the ADR-033 composition** (dead code once Masar is live). Confirm
each with `git grep` before deleting:

- `frontend/src/components/digital/*` (including `impact-calculator.tsx`) and
  `frontend/src/lib/calculator/*` if nothing else imports it;
- the `.digital-*` block in `frontend/src/app/globals.css`;
- the `digitalHomepage` branch in `app/(sites)/[siteKey]/page.tsx` and Digital
  references in `about/page.tsx` and `industries/[slug]/page.tsx`;
- `frontend/tests/unit/digital/*` and `tests/unit/calculator/*`.

Then run `pnpm check:source`.

**Engineering backlog**

- Move the Digital document behind its own route group so `digital-site.css`
  (~7 KB gzipped) stops shipping inside every tenant's CSS.
- A per-tenant indexing switch, so Digital can be indexed (or held back)
  independently of the other five sites.
- Move the narrative into an ACF field group when editors should own it —
  ADR-039 was written so that changes the source, not the components.

**Content backlog (owner / editors)**

- Clean blog 6: remove or replace the 94 placeholder records
  (`node tools/verify-no-seed-content.mjs` lists them). Deleting CMS content is
  a protected operation — back up first.
- Real work: case studies for `/work/`, industries, news — each route turns on
  when its content exists.
- Confirm the sentences that describe how the company works: the four stages
  under "How we work" and the four commitments (listed in the task record).
- The Digital brand mark.

## 8. Resume work locally

```sh
cd SIRA-Headless
git fetch origin
git switch feat/digital-masar        # or main, once #81 has merged
cd frontend
pnpm install --frozen-lockfile
# .env.local: the SIRA_WP_* values (copy from the main checkout), plus
#   SIRA_EXTRA_HOSTS_JSON={"digital":["digital.localhost"]}
pnpm dev --port 3030                 # http://digital.localhost:3030  and  /ar/
```

| Check | Command |
|---|---|
| Digital tests | `npx vitest run tests/unit/digital-site` |
| Everything | `pnpm check:source` |
| Browser sweep | `pnpm build && pnpm start --port 3031`, then `node scripts/qa-sweep.mjs http://localhost:3031 digital` |
| Web vitals | `node scripts/measure-web-vitals.mjs http://localhost:3031 digital` |

Masar lives only in Git: on `origin/feat/digital-masar` and PR #81 until it
merges, on `main` afterwards. Nothing about it is stored in WordPress.

## 9. Things to know before touching it

- The narrative is deliberately free of claims; `tests/unit/digital-site/content.test.ts`
  carries a denylist that fails the test suite if clients, figures or dates are added.
  Real facts belong in the CMS, verified, not in this file.
- English and Arabic must keep the same shape — a test enforces it. Write the
  Arabic as business Arabic, not a translation of the English.
- `document-gates.test.ts` checks that every Digital CSS rule is scoped to
  `html[data-site="digital"]` or a `.dg-` class, that motion is gated, and how
  many client islands exist. Keep it green; it is what keeps Digital from
  leaking into the other five sites.
- The public hostname and the CMS origin are independent by design
  (`tests/contract/digital-tenant-topology.test.ts`). Never derive one from
  the other.
