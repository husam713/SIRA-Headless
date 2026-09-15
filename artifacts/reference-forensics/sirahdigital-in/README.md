# Reference forensics — sirahdigital.in

Phase 1 audit evidence for a future `sirahdigital.sa` build. **Reference-only. Not a production dependency, not a runtime input, not committed.**

Start with **[`REPORT.md`](./REPORT.md)** — the full forensic report.

## What this is

A measured study of a public reference site: layout, typography, colour, motion, interaction, responsive behaviour, information architecture and conversion flow. Everything here is a *measurement* taken from a real browser, so a later implementation is built to numbers rather than to impressions.

It contains no source code from the reference. Client names, imagery, product names and factual claims are listed in `REPORT.md` §9 as out of bounds. **§9 carries a 2026-09-09 amendment**: it was written on the premise that the reference belongs to a third party, and the owner has since confirmed it is their own company. Read the amendment first — several of its prohibitions are lifted, several stand for reasons that were never about provenance, and one is an open owner decision.

## Layout

```
REPORT.md                       the forensic report
data/
  route-inventory.json          31 routes: purpose, sections, CTA, notable interaction
  motion-inventory.json         every animation: trigger, from/to, duration, easing, threshold
  routes.json                   crawl output with headings, sections, forms, metadata
  sitemap.json, robots.txt      discovery evidence
  measure/<slug>--<vp>.json     57 files: geometry, computed styles, colour inventory, grids
  density.md / density.json     section start/end Y tables, 10 routes x 6 viewports
  breakpoints.json              81-sample width sweep, 320-1920, with derived change list
  tech-<route>.json             network, globals, fonts, CSS custom properties, instrumentation
  interactions.json             header scroll states, hover deltas, focus ring, mobile menu
  scroll-motion.json            31 scroll samples of the scroll-linked sections
  reduced-motion.json           matched no-preference vs reduce runs
  entrance-<route>.json         timestamped entrance choreography
  forms.json                    contact + booking structure, validation, calculator
screens/                        25 PNG captures (git-ignored)
tools/                          9 re-runnable capture scripts
```

## Re-running a capture

From this directory. Scripts resolve `playwright-core` from `frontend/node_modules`; on Git Bash prefix with `MSYS_NO_PATHCONV=1` so a `/` route argument is not rewritten as a Windows path.

```sh
MSYS_NO_PATHCONV=1 node tools/01-discover.mjs
MSYS_NO_PATHCONV=1 node tools/02-tech.mjs / /services /contact
MSYS_NO_PATHCONV=1 node tools/03-measure.mjs / --shots 390,1440
MSYS_NO_PATHCONV=1 node tools/04-interactions.mjs
MSYS_NO_PATHCONV=1 node tools/05-scroll-motion.mjs
MSYS_NO_PATHCONV=1 node tools/06-forms.mjs
MSYS_NO_PATHCONV=1 node tools/07-breakpoints.mjs /
MSYS_NO_PATHCONV=1 node tools/08-entrance.mjs / /services
MSYS_NO_PATHCONV=1 node tools/09-density.mjs
MSYS_NO_PATHCONV=1 node tools/summarise.mjs home 1440
```

`06-forms.mjs` aborts every non-GET request to the reference origin, so it cannot create an enquiry, booking or lead. `01-discover.mjs` honours `robots.txt`: `/animations` is disallowed and is not fetched.
