# SIRA Digital — final visual-fidelity / motion-refinement pass

Measured 2026-09-08 on branch `feat/sirahdigital-sa`, in Chromium, against the
live CMS (blog 6) through the development SSH transport. Reference figures are
from `REPORT.md` §2 and `data/density.md`, captured from `sirahdigital.in` in
Phase 1. Per-capture JSON is in `data/ours-<route>--<viewport>.json`.

"Before" is the branch head `fbf57c53`. Nothing in this pass changed content,
the CMS, or any query.

---

## 1. The header stopped lying about its own height

`--layout-header-offset` is the anchor scroll offset, the sticky top for every
rail and index, and the subtrahend in every `100svh - header` band. It declared
80px. The header rendered **67px** at `>=lg` and **77px** below it, where a 44px
touch target sets the floor.

| | before | after |
| --- | --- | --- |
| Header, `>=1024` | 67px | **80px** |
| Header, `<1024` | 77px | **80px** |
| `--layout-header-offset` | 80px | 80px (unchanged) |

The header now carries `min-block-size: var(--layout-header-offset)`, so the
token sets the box and the padding only sets a floor beneath it. Measured at
80px on every route, at all six viewports, in both languages.

This is shared chrome: the other five tenants gain 13px of header at `>=lg` and
3px below it. Nothing else about the header changed.

### The same token was also being counted twice

`html` carries `scroll-padding-block-start: var(--layout-header-offset)`, and
three routes additionally asked their anchor targets for
`scroll-margin-top: calc(var(--layout-header-offset) + 2rem)`. Scroll margin
adds to scroll padding rather than replacing it, so an anchored block landed a
whole extra header down the page.

| | before | after |
| --- | --- | --- |
| `/services#<service>` landing | 192px from the top | **112px** |
| `/work#<entry>` landing | 192px | **112px** |
| `/industries#<sector>` landing | 192px | **112px** |

112px is 80px of header plus 32px of breathing room, which is what the code
meant to ask for. Verified under `prefers-reduced-motion: reduce` so the reveal
transform could not distort the measurement.

---

## 2. `/services` density

The lead item. A service body is a six-part record — the problem, what changes,
what the system does, what it connects to, where a person stays in the loop,
what it is for — stored by the CMS as `<h2>label</h2><p>value</p>` pairs and
rendered through `record-prose`.

Two things were wrong, and neither of them was the content:

1. **`record-prose` styles an article.** Its `h2` is 34px, which is right for a
   section heading and wrong for a two-word label sitting under the service's
   own 52px title. Six of them cost about 925px per service and inverted the
   hierarchy.
2. **The measure cap was fighting the track.** The content column is 1000px at
   1440 while `max-w-[62ch]` holds the prose at 568px — **43% of the column was
   empty ground** beside every paragraph of every service.

`.digital-spec` gives the labels the site's own label scale and flows the pairs
into two columns from `xl`, where the track is wide enough to divide. Below
`xl` it stays one column: the track is 608px at 1024, and two columns there
would be 28 characters each.

### Document height, `/services`

| viewport | before | after | reference |
| ---: | ---: | ---: | ---: |
| 390 | 13321 (15.78 screens) | **11589 (13.73)** | 8873 (10.5) |
| 768 | 11380 (11.11) | **9860 (9.63)** | 8181 (8.0) |
| 1024 | 10872 (14.16) | **9123 (11.88)** | 8036 (10.5) |
| 1280 | 11282 (14.10) | **7164 (8.96)** | 7422 (9.3) |
| 1440 | 11459 (12.73) | **6930 (7.70)** | 7573 (8.4) |
| 1920 | 11666 (10.80) | **7137 (6.61)** | 7933 (7.3) |

Arabic tracks it: `/ar/services` at 1440 went from 10907 (12.12 screens) to
**6781 (7.53)**.

Per service at 1440 the body fell from 925px to 399px, and the whole block from
about 1150px to 555-640px.

### The residual gap below `xl` is content shape, not layout

At 390 the page is still 31% longer than the reference, and no amount of
spacing work closes that, because the two pages are not carrying the same
thing:

| | ours | reference |
| --- | ---: | ---: |
| Services on the page | 8 | 10 |
| Authored blocks per service | 6 | about 3 |
| Screens per service at 390 | 1.72 | 1.05 |
| **Screens per authored block** | **0.29** | **0.35** |

Per unit of content the page is now denser than the reference. Shortening it
further below `xl` means publishing fewer fields per service, which is an
editorial decision rather than a fidelity defect. Recorded, not taken.

---

## 3. The services index now says where you are

The reference drives its rail from a scroll-spy (`REPORT.md` §4: the active
entry takes colour and an accent left border over 0.3s, its numeral over
0.15s). Ours was a list of links.

It is implemented in CSS alone. Each service block publishes a named view
timeline, the grid puts those names in `timeline-scope`, and each rail entry
animates against its own block's timeline. No Client Component, so the
architecture lock holds and the page stays a Server Component.
`view-timeline-inset` shrinks the timeline's scrollport to a narrow band just
under the header, which is what turns "in view" into "at the reading line".

The animation drives one registered custom property rather than the colours
themselves. An animation outranks every author declaration in the cascade, so
animating `border-color` directly would have killed `:hover` and
`:focus-visible` on the same entry for the life of the page.

Verified at 1440, English and Arabic, normal and reduced motion. Exactly one
entry is active at any position:

| scrollY | 900 | 2200 | 4000 | 6000 |
| --- | --- | --- | --- | --- |
| active entry | 01 | 03 | 06 | none (past the last block) |

It is deliberately **not** gated on reduced motion. Nothing moves: it swaps two
colours to say which section is being read, and that is orientation on a page
seven screens long.

---

## 4. `/contact` opened on an L-shaped hole

The intro track was 940px holding 440px of text, so the page opened with dead
width beside the headline and dead height under the contact details. Closed
without inventing a business fact: a wider form track (26rem to 30rem), type
that uses the measure it is given, and details pushed to the foot of the column
so they baseline with the bottom of the form.

The detail list also drops to a single column when there is only one entry.
`brand.email` is null for this tenant, and halving the track for one entry
wrapped a single line of opening hours into two.

**Open, and not a layout problem:** with no `brand.email` the contact page
offers no direct address at all, and the header's contact CTA is suppressed for
the same reason. That is missing CMS data, recorded rather than papered over.

---

## 5. Motion audit

Method taken from the Phase 1 instrumented runs: load, scroll the whole
document, then count what is still animating and what is still invisible.
1440, live CMS.

| route | animations | running at rest | scroll-driven | infinite | left below opacity 1 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 13 | 1 | 12 | 1 (marquee) | **0** |
| `/services` | 18 | 0 | 18 | 0 | **0** |
| `/contact` | 2 | 0 | 2 | 0 | **0** |
| `/work` | 7 | 0 | 7 | 0 | **0** |
| `/industries` | 10 | 0 | 10 | 0 | **0** |

Under `prefers-reduced-motion: reduce` every route reports **zero animations of
any kind**, and the homepage becomes a structurally shorter document rather
than a fast version of a long one:

| | normal | reduce | change |
| --- | ---: | ---: | ---: |
| ours, `/` | 5352 | 3784 | **-29%** |
| reference, `/` | 5483 | 4060 | -26% |

The one infinite animation is the client marquee, which pauses on hover and on
`focus-within`.

---

## 6. Coverage

74 captures: 12 routes plus `/privacy` and `/ar/privacy`, at 390 / 768 / 1024 /
1280 / 1440 / 1920, English and Arabic.

- Horizontal overflow: **0 on every one**.
- HTTP status: 200 on every one.
- Brand source: live WordPress on every one.

Captures that came back with a failed query were re-run until clean and are not
recorded as measurements. The development transport is an SSH proxy that spawns
a shell per request and times out under a sweep this size; the application's
partial-data path then renders a shell with an empty list, which measures as a
short page rather than as an error.

---

## 7. Not done, and why

- **The header pill morph.** The reference condenses its header on scroll:
  transparent and full width, then a 1152px glass pill at scrollY around 50,
  over 0.5s. That is shared chrome for all six tenants and a change of art
  direction, not a fidelity correction to Digital. It needs an owner decision.
- **The full-screen closing CTA.** The reference gives a whole `100svh` to its
  closing line. `PageClosingCta` is shared and is `min-h-[45svh]`. Same reason.
- **The button lift.** The reference lifts its primary button 2px on hover and
  nudges its arrow 4px. `CtaLink` is shared. Same reason.
- **Heading levels inside a service body.** The CMS emits the six labels as
  `<h2>`, which makes them siblings of the service title rather than parts of
  it. This pass changed how they look, not what they are; correcting it means
  changing what the seeder writes, and the handoff says not to re-seed.
