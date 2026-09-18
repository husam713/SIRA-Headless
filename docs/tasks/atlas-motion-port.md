# Atlas motion port — the prototype's choreography in production

**Task:** TP-ATLAS-MOTION · **Role:** IMPLEMENTATION · **Profile:** `LOCAL`
(`localEvidenceRequired: true` — browser QA against the dev server, live CMS
read-only) · **Branch:** worktree of `feat/atlas-arabic` @ `fd3d61de` ·
**Date:** 2026-09-18 · **Reference:** `frontend/prototypes/sira-atlas/`
(`design/creative-prototype-atlas` @ `8786d314`)

## Authorization and scope

Owner instruction, in-session, 2026-09-18: port the motion language of the
approved static prototype into the production Next.js frontend. Frontend
only; no WordPress, SSH, push, PR, merge, deployment or DNS. Content, copy,
data fetching, routing, the newsroom (`src/components/record/*`,
`src/components/editorial/*`, `src/lib/editorial/*`, `/news`) and every
test's intent are unchanged. The Digital tenant's compositions are touched
only where the shared reveal change required a mechanical rename.

## The problem

Production revealed sections with a scroll-driven CSS animation
(`animation-timeline: view()`, linear, 20px, range-based) gated on
`html[data-motion="cinematic"]`. It was more restrained than the prototype
and did not run at all in a browser without scroll-driven animations. The
prototype uses an IntersectionObserver that adds `.in`: opacity 0 → 1 and a
28px rise over 700ms on `cubic-bezier(0.22, 1, 0.36, 1)`, delayed
`--d × 90ms` inside `[data-stagger]` groups, threshold 0.12, root margin
`0 0 -8% 0`, with `fade` and `clip` variants — plus the hero entrance and
swap, the Ken Burns push, the dwell bar, the scroll cue, the counting
numbers, the filter re-deal, the drawer, and the small hover gestures.

## What was built

- **`src/components/motion/reveal-choreography.tsx`** (new, Client
  Component, mounted once in `src/app/(sites)/[siteKey]/layout.tsx`). On
  mount it writes `js` and — unless the reader asked for reduced motion, the
  tenant is `data-motion="quiet"`, or there is no `IntersectionObserver` —
  `motion` to `<html>`; assigns `--d` (0..8) inside every `[data-stagger]`
  group by nearest group; observes `[data-reveal], .reveal` (both hooks) and
  adds `.in` on entry; re-scans on route change (`usePathname`) and on DOM
  mutation. Nothing can stay invisible: the hidden state exists only on
  `html.js.motion`; an element already above the viewport is shown at once;
  an element whose class attribute React rewrites after it arrived is put
  back to `.in` immediately (class mutations are observed); and the marker
  `is-ready` is written to every `.atlas-hero` / `.atlas-page-hero` a frame
  after mount, which is what releases the entrance.
- **`src/styles/globals.css`** — the Atlas layer now carries the prototype's
  tokens (`--t-fast/base/slow/cine`, `--ease-cine`, `--reveal-y`; `--ease-out`
  reused) and a "Reveal choreography" block. The arrival is a keyframe
  animation that fills `backwards` only, so a revealed element keeps its own
  `transition` and `opacity` afterwards (an insight row's hover nudge, the
  archive's filter fade); the old scroll-driven `.reveal` block in the
  Digital layer and its `--reveal-offset` / `--reveal-distance` are gone.
  The hero arrival is the prototype's transition model on `.is-ready`; the
  slide tag has the `is-swapping` drop; the dwell bar is `.atlas-hero__bar`
  driven by `--dwell` and paused by `.is-paused`; the Ken Burns push is
  1.04 → 1.12 over 8s on `--ease-cine`; the scroll cue runs on `html.motion`
  and is hidden under reduced motion; the parallax band no longer needs the
  `cinematic` preset. New: `.arrow` (nudge, RTL-mirrored), `.textlink` (rule
  drawn from the leading edge), `.btn-solid` (accent shadow on hover), the
  filter re-deal on `.atlas-projects > *`, and the drawer's slide OUT
  (`transition-behavior: allow-discrete` + `@starting-style`, the mobile
  menu's mechanism).
- **`src/components/homepage/count-up.tsx`** — decimals are counted to the
  places they were written with, grouping is kept, and the `data-motion`
  gate is gone (reduced motion is the only gate). Already used by the group
  about metrics, the investor metrics, the branch stats band and the
  investors page.
- **`src/components/homepage/group-hero-carousel.tsx`** — dwell 7000ms
  (prototype); the slide tag follows the photograph 340ms later with
  `is-swapping` (0ms under reduced motion); the pointer resting on the
  selector holds the rotation and the bar; the bar is paused, not
  unmounted. Pause button, keyboard and `aria-current` unchanged.
- **`src/components/atlas/project-archive-grid.tsx`** — choosing a chip adds
  `is-filtering` for 260ms (0 under reduced motion), then changes the set;
  filtered-out cards are `hidden` (attribute, not class, so `.in` survives)
  and the visible ones are re-numbered from zero. **`project-card.tsx`**
  sets `--d` = `index % 6` and takes `hidden`.
- Stagger groups (`data-stagger`) and per-item `reveal` where the prototype
  staggers: `SectionHead` (eyebrow → display → lead/action), the group
  about column and stats, the investor metrics and opportunities (homepage
  and investors page), the project grids, capability cells, gallery
  figures, prose paragraphs, insight rows (both components), city list,
  service rows (homepage and services page), the closing, the branch
  overview column and focus-area ledger, the branch stats band, the next
  project, the contact column. Whole bands (`.atlas-house`, the quote
  stage, the project aside, the contact form) are `data-reveal="fade"`.
- **`src/components/homepage/cta-link.tsx`** — `solid` lifts (`btn-solid`);
  `ghost-*` are the prototype's text links (`textlink`) and carry the
  decorative arrow. Solid CTAs in the closing, the investor pack triggers
  and the project aside carry `btn-solid` / `.arrow`.
- Digital (`src/components/digital/*`, `industries`, `work`,
  `digital-services`): the inline `--reveal-offset: N%` became `--d: N`
  (the property the new system reads) — a mechanical rename, nothing else.

## Inventory

| # | Prototype motion (`app.js` / `styles.css`) | Production before | Production after | Status |
|---|---|---|---|---|
| 1 | Reveal: IO adds `.in`; opacity 0→1 + 28px rise, 700ms, `--ease-out`, delay `--d×90ms`, threshold 0.12, rootMargin `0 0 -8% 0` | Weaker: scroll-driven `animation-timeline: view()`, linear, 20px, gated on `data-motion="cinematic"`; absent where unsupported | Ported: `reveal-choreography.tsx` + "Reveal choreography" CSS; `.reveal` and `data-reveal` both honoured | PORTED |
| 2 | `data-reveal="fade"` (no rise) / `"clip"` (clip-path wipe) | Lacked | Ported (`fade` used on the house, quotes, aside, form; `clip` available) | PORTED |
| 3 | `[data-stagger]` auto-assigns `--d` 0..8 | Lacked (per-component `--reveal-offset` %) | Ported, nearest group wins; components may pre-set `--d` | PORTED |
| 4 | Gate `html.js.motion`; no JS ⇒ visible; reduced motion ⇒ visible | Gate `html[data-motion]` + `@supports` | Ported; reduced motion is the only gate (a `quiet` tenant would also opt out; none exists) | PORTED |
| 5 | Count-up on `[data-count]` at 60%, 1400ms ease-out cubic, prefix/suffix, decimals | Had (integers only, `data-motion` gate) | Decimals kept, gate removed | PORTED |
| 6 | Hero entrance `is-ready`: copy rises staggered; lines from `translateY(110%)` 150/250/350ms; lead 550; actions 700 | Weaker: CSS keyframes on `.atlas-arrive`, 450ms, gated on preset | Ported as the transition model on `.is-ready`, prototype timings, `html.js.motion` gate | PORTED |
| 7 | Slide swap `is-swapping`: words leave up, arrive with the new frame | Lacked (tag changed instantly) | Ported for the slide tag; the headline is CMS-constant in production, so it does not swap | PORTED (adapted) |
| 8 | Ken Burns `hero-zoom` 1.04→1.12, 8s, `--ease-cine` | Had (1→1.14, 7.5s, ease-out) | Prototype values | PORTED |
| 9 | Index bar progress tied to `--dwell`, paused on hover / pause | Had (width keyframe; unmounted on pause; no hover pause) | `--dwell` 7000ms, `is-paused` play-state, hover on the selector holds it | PORTED |
| 10 | Scroll cue | Had, gated on preset | Gated on `html.motion`; hidden under reduced motion | PORTED |
| 11 | The house: hovered panel takes the room (`--cols` 2.4fr), picture sharpens, summary unfolds | Had (flex-grow 2.4, same gestures) | Unchanged; band now `data-reveal="fade"` | HAD |
| 12 | Services: plus rotation, summary nudge, body opens, one open at a time | Had (`name=` exclusive) | Rows now arrive one after another | HAD |
| 13 | Testimonials rotation, 6.5s, dots | Had (`QuoteRotator`) | Unchanged | HAD |
| 14 | Project filters: `is-filtering` 260ms, grid fades out/in, cards re-staggered `k % 6` | Weaker: CSS existed, component re-rendered the list with no choreography | Ported (`hidden` attribute, re-numbered `--d`) | PORTED |
| 15 | Textlink rule scaleX from inline-start + arrow nudge, RTL-mirrored | Weaker: decoration colour fade, no arrow | Ported (`.textlink`, `.arrow`) | PORTED |
| 16 | Button hover lift (accent shadow) / active settle | Had settle; lacked shadow | `.btn-solid` shadow | PORTED |
| 17 | Mega menu fade/rise | Had | Unchanged | HAD |
| 18 | Mobile menu links staggered by `--i` | Had | Unchanged | HAD |
| 19 | Drawer slide-in / slide-out 700ms `--ease-cine` | Weaker: slide-in only, closed at once | Slide-out added (allow-discrete) | PORTED |
| 20 | Places band parallax (scroll-driven) | Had, gated on preset | Gate removed (`@supports` + reduced motion remain) | HAD |
| 21 | Header solidifies on scroll | Had (scroll timeline + fallback) | Unchanged | HAD |
| 22 | View-transition handoff: card image → next page's hero (`view-transition-name: project-hero`, cross-document) | Lacked | Not ported — see below | SKIPPED |

### Why the view transition was skipped

The prototype is a multi-page app, so `@view-transition { navigation: auto }`
and a `viewTransitionName` set on the clicked card's image are enough. In
production the card is a `next/link` (client-side navigation), where the
cross-document mechanism does not apply. The in-app alternative would be
React's `<ViewTransition>`:

- Next 16.2.12 declares `experimental.viewTransition` in its config schema,
  but no runtime module under `next/dist` (outside the compiled React
  bundles) reads it — `grep -rl viewTransition node_modules/next/dist`
  returns only `config-schema.js` and `config-shared.js`.
- `<ViewTransition>` exists only in Next's bundled React canary
  (`next/dist/compiled/react`). The app's own `react@19.2.8` exports no
  `ViewTransition`, and the Vitest suite renders components with that
  package, so a component importing it would not load under test.

Changing the card to a plain anchor would change routing behaviour, which is
out of scope. Revisit when the flag has a runtime and the stable React the
tests use exports the component.

## Validation

Run from `frontend/` on the worktree, after the changes:

| Check | Result |
|---|---|
| `pnpm typecheck` | PASS |
| `pnpm eslint .` | PASS (0 problems) |
| `pnpm vitest run` | PASS — 67 files, 687 tests; the one file that fails to LOAD (`tests/unit/launch-gate.test.ts`, CRLF on Windows) fails identically on the untouched baseline |
| `pnpm next build` | PASS (compiled, TypeScript, 61 static pages) |
| Browser QA (`playwright-core`, headless Chromium, 1440×900, dev server on 3020) | PASS on `group.localhost:3020/`, `/projects/`, `/projects/sira-prime/`, `/investors/`, `/ar/`, `consulting.localhost:3020/` |

Per page after a full scroll: `<html>` carries `js motion`; every
`[data-reveal]/.reveal` element has `.in` (47/47, 10/10, 13/13, 18/18,
47/47, 22/22); none is at opacity 0; every stagger group has `--d` on every
child; count-ups ran (mid-animation samples differ from the final text, the
final text equals the server-rendered value); every hero is `is-ready`; the
dwell bar animates `hero-progress` and the active slide `hero-zoom`. The
archive filter added `is-filtering` on click and re-dealt 2 shown / 4 hidden
cards with `--d` 0, 1, all `.in`, opacity 1. Extra checks: the slide tag
carried `is-swapping` during the beat and showed the next slide's words
after it; hovering the selector paused the bar; the drawer slid in and,
on Escape, slid out (`display: grid` during the exit, `none` after); in
Arabic the arrows compute `scaleX(-1)`; under `prefers-reduced-motion:
reduce` the document carries `js` only, no reveal is hidden, the hero copy
is at opacity 1 and the figure is its final text. No console errors on the
second run; the first run logged one "Failed to load resource: 404" on the
two homepages that did not reproduce and had no 4xx response on re-check.

Evidence screenshots (full page, after the scroll), in the session
scratchpad: `evidence/group_localhost_3020_.png`,
`evidence/group_localhost_3020_projects_.png`,
`evidence/group_localhost_3020_projects_sira_prime_.png`,
`evidence/group_localhost_3020_investors_.png`,
`evidence/group_localhost_3020_ar_.png`,
`evidence/consulting_localhost_3020_.png`.

## Not done / observed outside scope

- `tools/seed/newsroom-seed.json` shows as modified in the worktree with an
  empty diff (an `autocrlf` artefact); not staged.
- The transient 404 on first load of the two homepages (see above) was not
  investigated; it is most likely a dev-server chunk on first compile.
