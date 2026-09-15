# Reference forensics — sirahdigital.in

**Phase 1 — analysis only. No production implementation was created or changed.**

| Field | Value |
| --- | --- |
| Reference | `https://sirahdigital.in/` |
| Future SIRA domain | `https://sirahdigital.sa/` (Phase 2, not started) |
| Captured | 2026-09-07 / 2026-09-08 |
| Method | Chromium (Playwright `playwright-core` 1.62.1, Chromium 151.0.7922.34), instrumented before page scripts ran |
| Viewports | 390 · 768 · 1024 · 1280 · 1440 · 1920, plus a 20px continuous sweep from 320 to 1920 |
| Routes measured | 31 discovered, 10 measured in depth across all six viewports |
| Artifacts | `artifacts/reference-forensics/sirahdigital-in/` |

---

## STATUS

**COMPLETE — analysis only.** No SIRA production component, route, style, or CMS record was touched. Nothing was committed. No form, booking, or lead was submitted to the reference: every non-GET request to `sirahdigital.in` was aborted at the network layer during form testing.

Evidence classes used below follow `AGENTS.md`: **CONFIRMED** (directly observed at runtime or in the served asset), **STRONGLY INFERRED** (evidence supports it but does not prove it), **UNKNOWN**.

One route was deliberately **not** fetched: `/animations` is `Disallow`ed in `robots.txt`. Its existence is recorded; its content is `UNKNOWN`.

---

## 1. ROUTE INVENTORY

`sitemap.xml` lists 31 URLs; the crawl found exactly the same 31. There are no orphan routes reachable from navigation that the sitemap omits.

| # | Route | Purpose | Primary CTA | Notable interaction |
| --: | --- | --- | --- | --- |
| 1 | `/` | Positioning → product proof → trust → brand statement → conversion | Start an automation audit → `/contact` | 220svh sticky kinetic wordmark; 9-slide coverflow; client marquee |
| 2 | `/services` | Ten capabilities as one anchored long page | Book Free Consultation | 260px sticky index rail with scroll-spy; mobile sticky chip bar |
| 3 | `/products` | Own products + client software categories | Have a workflow worth automating? | 3D `rotateY` cylinder carousel; SVG arc navigation |
| 4 | `/industries` | Twelve industry entry points | Have a workflow worth automating? | Image-backed cards, lift-on-hover |
| 5–16 | `/industries/{healthcare, manufacturing, education, real-estate, retail-ecommerce, logistics, professional-services, hospitality-travel, human-resources, legal, construction, automotive}` | Industry detail | Consultation | Standard reveal only |
| 17 | `/products/aura-transcriber` | Product detail | "A read of your own calls…" | Standard reveal only |
| 18–21 | `/products/{analytics-agents, nusi, tnpsc-mentors, lexdraft}` | Product detail | Consultation | Standard reveal only |
| 22 | `/about` | Founder narrative, team, process, insights | Get in touch | Horizontal scroll-snap insights rail |
| 23–27 | `/jesheeba`, `/monisha`, `/salman`, `/samad`, `/aakash` | Individual profiles at the **site root**, not under `/team/` | "Want a system like these?" | `work-row` hover translate |
| 28 | `/contact` | Enquiry form + office + impact calculator | Continue to calendar → `/book` | Live-recalculating calculator |
| 29 | `/book` | Details + day + time slot | Confirm booking | Day rail + 25-slot grid (**defective, see §9**) |
| 30 | `/privacy` | Privacy policy | — | Prose column |
| 31 | `/terms` | Terms of service | — | Prose column |
| — | `/animations` | `Disallow`ed in robots.txt, not fetched | — | UNKNOWN |

**Architecture read.** Services are *not* separate routes — they are anchors (`#ai-agents`, `#chatbots-voice`, `#workflow-automation`, `#web-mobile-apps`, `#crm-erp`) on one page. Products and Industries *are* separate routes. Person profiles sit at the root namespace, which is a deliberate SEO/prominence choice and a namespace risk.

Full structured inventory: `data/route-inventory.json`.

---

## 2. GLOBAL DESIGN SYSTEM

### 2.1 Layout

| Value | Measurement | Behaviour |
| --- | --- | --- |
| Page container | `max-width: 1152px` (`max-w-6xl`) + `padding-inline: 24px` | Fixed cap, fluid below |
| Wide container | `max-width: 1280px` / `1400px` / `1440px` on specific sections | Fixed cap |
| Prose container | `max-width: 768px` (`max-w-3xl`); statements use `46ch` | Fixed cap |
| Viewport gutter (page) | `24px` constant at every audited width | Fixed |
| Viewport gutter (header, scrolled) | 20 / 38 / 51 / 64 / 72 / 80 px at 390 / 768 / 1024 / 1280 / 1440 / 1920 → **`clamp(20px, 5vw, 80px)`** | Fluid + clamped |
| Header height | 74px at rest, 98px scrolled (12px padding + 74px pill) — **constant at every width** | Fixed |
| Layout header offset | **72px** — `main` starts at y=72, heroes are `min-height: calc(100svh - 72px)` (verified exactly at all six viewports) | Fixed |
| Section rhythm | `py-16` → `py-[100px]`, `pt-20 pb-14` → `pt-28 pb-20`, `py-20 md:py-28` | Breakpoint-controlled at 768 |
| Grid gaps | 20px (cards), 24px (`lg:gap-6`), 28px (footer `lg:gap-7`), 32px (about process), 40px (product stage), 48→64px (services rail) | Breakpoint-controlled |
| Card radius | 12px (dropdown, inputs), 14px (industry card), 6px (coverflow frames), 20px (chat panel), 999px (buttons, chips, pill) | Fixed |
| Media ratio | 1:1.4 portrait (coverflow), 1.56:1 (industry cards), 1.6:1 (insight cards), 1:1 (team avatars, 128px) | Fixed |

The spatial logic is **fixed max-widths with fluid gutters**, not a fluid grid. Only the header gutter and the type scale are fluid; everything else is a capped container inside a constant 24px page gutter.

### 2.2 Typography

Two self-hosted variable faces, 2 files, ~80 KB total:

- `/fonts/satoshi.woff2` — **Satoshi**, weights 300–900
- `/fonts/zodiak.woff2` — **Zodiak Numerals** (100–900) and **Zodiak Text** (100–900)

The published stack is the most distinctive typographic decision on the site:

```
--font-sans:    "Zodiak Numerals", "Satoshi", system-ui, sans-serif
--font-display: "Zodiak Numerals", "Satoshi", system-ui, sans-serif
```

`Zodiak Numerals` is a **numerals-only subset placed first in the stack**, so every digit renders in Zodiak's classical display face while every letter falls through to Satoshi. The result is visible in the homepage product rail: `01 02 03 04 05` read as an editorial serif against a geometric sans. This is a one-line system decision producing a strong editorial signature. **CONFIRMED.**

**Fluid scale** (read from the served stylesheet, and matching every measured value):

| Token | Clamp | Range |
| --- | --- | --: |
| `text-fluid-xs` | `clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)` | 12 → 13 |
| `text-fluid-sm` | `clamp(0.875rem, 0.84rem + 0.2vw, 1rem)` | 14 → 16 |
| `text-fluid-base` | `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)` | 16 → 18 |
| `text-fluid-lg` | `clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem)` | 18 → 22 |
| `text-fluid-xl` | `clamp(1.375rem, 1.15rem + 1vw, 2rem)` | 22 → 32 |
| `text-fluid-2xl` | `clamp(1.875rem, 1.35rem + 2.4vw, 3.25rem)` | 30 → 52 |
| `text-fluid-3xl` | `clamp(2.25rem, 1.5rem + 3.6vw, 4.5rem)` | 36 → 72 |

**Measured rendered roles at 1440:**

| Role | Size / line-height | Weight | Tracking | Case | Colour |
| --- | --- | --: | --- | --- | --- |
| Hero H1 (home) | 54 / 53 (**0.98**) | 700 | −0.03em | sentence | `#fff` |
| Hero H1 (inner pages) | 56 / 57 | 700 | −0.03em | sentence | `#fff` |
| Display H2 (closing CTA) | 72 / 76 | 700 | −0.025em | sentence | `#fff` |
| Section H2 | 52 / 55–57 | 700 | −0.02 to −0.03em | sentence | `#fff` |
| Card H3 (products) | 28 / 30 | 700 | −0.02em | sentence | `#fff` |
| Category H3 (portfolio) | 44 / 53 | 600 | −0.025em | sentence | `#fff` |
| Industry card H2 | 22 / 28 | 600 | −0.015em | sentence | `#fff` |
| **Eyebrow** | 11 / 17 | 500 | **+0.32em** | UPPERCASE | `rgba(255,255,255,.38)` |
| Coverflow eyebrow | 11 | 600 | +0.22em | UPPERCASE | `rgba(203,213,225,.55)` |
| Body lead | 17–18 / 29 | 400 | 0 | sentence | `rgba(203,213,225,.7–.85)` |
| Body small | 14 / 23 | 400 | 0 | sentence | `rgba(255,255,255,.52)` |
| Navigation | 14 / 20 | 600 | 0 | sentence | `#94a3b8`, active `#fff` |
| Button | 15 / 15 (`0.9375rem`) | 600 | 0 | sentence | `#fff` |
| Kinetic wordmark | ~15vw → ~3.9vw | 900 | −0.045em | UPPERCASE | `#fff` |

**System rules the numbers reveal:**

1. Display leading is **sub-1.0** (0.98 on the H1, 0.84 on the wordmark). Section headings sit at 1.05–1.1. Body sits at **1.7**. That gap — very tight display, very open body — is most of the perceived quality.
2. Negative tracking scales with size: −0.015em at 22px, −0.02em at 28–52px, −0.03em at 54–56px, −0.045em at the wordmark.
3. Positive tracking is reserved for one role only: the 11px uppercase eyebrow at +0.32em. It is the site's punctuation mark between sections.
4. Text measure is controlled: body copy sits at **~50ch** in heroes, **~64ch** in leads, **~90ch** only in the one centred intro; statements are capped at `46ch`.
5. The largest type on the page (72px H2, 216px wordmark) is used for *brand statement*, never for information. Information tops out at 52–56px.

### 2.3 Colour and surface

Published tokens (`:root`) and measured rendered values differ — worth noting, because the token file is partly legacy:

| Token | Declared | Actually rendered |
| --- | --- | --- |
| `--space` | `#0b0e17` | body renders `#16142c` |
| `--space-deep` | `#070910` | deep panels `#0b091a` |
| `--space-raised` | `#111522` | raised panel `#14182a`, card panel `#1d1a38` |
| `--text` | `#fff` | `#fff` |
| `--muted` | `#94a3b8` | `#94a3b8` |
| `--brand-blue` / `-deep` | `#3b82f6` / `#2563eb` | used in the button gradient and focus ring |
| `--brand-violet` / `-deep` | `#8b5cf6` / `#7c3aed` | used in the button gradient |
| `--indigo`, `--purple`, `--cyan` | `#6366f1`, `#a855f7`, `#38bdf8` | accent gradient `#6366f1 → #22d3ee` |
| `--focus-ring` | `#60a5fa` | `outline: 2px solid #60a5fa; outline-offset: 3px` |

**Semantic roles are clear and consistent:**

- **Ground** — one near-black indigo (`#16142c`) for the whole site. There is no light mode.
- **Elevation** — expressed by *alpha over the ground plus a hairline*, not by a lighter grey. Header pill `rgba(22,20,44,.8)` + blur(24px); footer `rgba(16,14,32,.9)`; industry card `rgba(0,0,0,.28)`; dropdown `#0b0e17` at 95% + blur(24px).
- **Hairlines** — a disciplined white-alpha ladder: `.05 .06 .07 .09 .10 .12` at rest, `.14 .16 .22 .25` on hover/active. Borders never use a colour.
- **Text** — `#fff` → `#cbd5e1` → `#94a3b8`, plus a white-alpha ladder `.88 .74 .62 .55 .52 .46 .40 .38 .34` for de-emphasis. Text hierarchy is carried by **opacity**, not by hue.
- **Accent** — used sparingly and only for three jobs: the 1px gradient button border (`--brand-blue → --brand-violet`), progress/active indicators (`#6366f1 → #22d3ee`), and focus (`#60a5fa`). No accent-filled buttons anywhere.

**Density.** Measured document heights at 1440 (`data/density.md` has full start/end tables at all six viewports):

| Route | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
| --- | --: | --: | --: | --: | --: | --: |
| `/` | 6799 (8.1 screens) | 6783 (6.6) | 5535 (7.2) | 5166 (6.5) | **5483 (6.1)** | 6141 (5.7) |
| `/services` | 8873 (10.5) | 8181 (8.0) | 8036 (10.5) | 7422 (9.3) | **7573 (8.4)** | 7933 (7.3) |
| `/products` | 5025 (6.0) | 4864 (4.8) | 4808 (6.3) | 4951 (6.2) | **5293 (5.9)** | 5905 (5.5) |
| `/industries` | 5920 (7.0) | 3773 (3.7) | 2679 (3.5) | 2516 (3.1) | **2519 (2.8)** | 2519 (2.3) |
| `/about` | 6706 (7.9) | 5618 (5.5) | 4507 (5.9) | 4553 (5.7) | **4730 (5.3)** | 4889 (4.5) |
| `/contact` | 7011 (8.3) | 6088 (5.9) | 4648 (6.1) | 4675 (5.8) | **4679 (5.2)** | 4679 (4.3) |
| `/products/<slug>` | 6601 (7.8) | 5044 (4.9) | 4331 (5.6) | 4334 (5.4) | **4335 (4.8)** | 4335 (4.0) |
| `/industries/<slug>` | 3828 (4.5) | 2816 (2.8) | 2264 (2.9) | 2249 (2.8) | **2249 (2.5)** | 2249 (2.1) |

**How page length is controlled.** The homepage is only ~6 screens because five of its six sections are **under one screen tall** (0.45–0.92 screens each); the single long section is the deliberate 2.2-screen kinetic wordmark. Detail pages are capped at 4.8 screens by fixing content depth: a product detail page is hero + 3 cards + 4 outcome blocks + 3 data blocks + CTA, and no more. The footer is the biggest single mobile block at **1582px / 1.87 screens at 390**, versus 482px at 1440 — the six-column footer stacking is the largest source of mobile length.

---

## 3. PAGE-BY-PAGE STRUCTURE

### PAGE: Homepage (`/`, 1440×900, document 5483px)

```
01  Header (fixed, outside main)
02  Hero
03  Product rail
04  Trusted Across Industries + client marquee
05  Image flow (coverflow)
06  Kinetic wordmark (scroll-pinned)
07  Closing CTA
08  Footer
```

| # | Section | y → y | h | Composition |
| --: | --- | --- | --: | --- |
| 02 | Hero | 72 → 900 | 828 | `min-height: calc(100svh - 72px)`. Single 1152px container, `px-6`, content **left-aligned in the left ~40%**, vertically centred at ≥1024 and top-aligned below. Eyebrow (11px/+0.32em) → H1 (54/53, 4 lines) → body (17/29, ~50ch) → CTA row (`flex flex-wrap gap-x-10 gap-y-5`, primary pill 256×48 + ghost text link). Right half is the WebGL particle field, bleeding off the top and right edges. No background image, no card, no border. |
| 03 | Product rail | 900 → 1385 | 485 | `max-w-[1440px] px-6 pt-28 pb-20`. Eyebrow `[ Products ]`. **Five equal columns of 278.4px** separated by vertical hairlines (`border-left`), each: Zodiak numeral `01`–`05` (large, muted) → H3 28/30 → 3-line description 14/23 at 52% white → `→` arrow pinned bottom-left. Whole column is the link. No cards, no shadows, no images. |
| 04 | Trusted Across Industries | 1385 → 1828 | 443 | `py-[100px]`, container `max-w-[1400px] px-6`. Centred H2 52/57 + centred sub 16/27 (~90ch), then a full-bleed **client-name marquee**: 30 items, track 9994px, 60s linear, edge-masked 12%, each client set in its own wordmark styling. |
| 05 | Image flow | 1828 → 2616 | 788 | `py-28 [overflow-x:clip]`, container `max-w-[1400px] px-6`. Centred raised panel (390×564, `#1d1a38`, radius 6, `0 40px 90px -50px rgba(0,0,0,.9)`) holding a 298×418 (1:1.4) photo with an uppercase eyebrow above and a 2px indigo→cyan progress bar on the panel's bottom edge. Mirrored receding thumbnails at 77 / 55 / 39 px on both sides. Right rail: `01 / 09` counter (active white, total muted) over stacked circular ‹ › buttons. |
| 06 | Kinetic wordmark | 2616 → 4596 | 1980 | `height: 220svh`. Inside it a `position: sticky; top: 72px` stage of `calc(100svh - 72px)`. Centred: the wordmark (900 weight, uppercase, `scaleX(.92)`, `letter-spacing −.045em`, `line-height .84`) shrinking 216.7px → 56.3px as `--kt-p` runs 0 → 1, then a tagline (46ch, 62% white) and a `See what we build →` link fading up once `--kt-p > 0.62`. |
| 07 | Closing CTA | 4596 → 5001 | 405 | `min-h-[45vh]`, centred, `border-top: 1px rgba(255,255,255,.1)`, `max-w-3xl`. H2 72/76 + primary pill. |
| 08 | Footer | 5001 → 5483 | 482 | `rgba(16,14,32,.9)`, top hairline. Grid `1.5fr .9fr .9fr .9fr .9fr 1.15fr`, gap 28px, 1232px wide: brand + CTA + 5 social icons (32px circles, `border rgba(255,255,255,.1)`), then Company / Services / Products / Explore / Contact columns, then a legal row. 28 links. |

### PAGE: Services (`/services`, document 7573px)

```
01  Full-viewport hero (line-revealed display H1)
02  Sticky index rail (260px) + 10 anchored service blocks
03  Full-viewport closing CTA
04  Footer
```

- **02** is the whole page: `lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12 xl:gap-16`, container `max-w-[1280px] px-12`. The rail is a vertical list of `border-left: 2px` buttons with a mono index; the active item gets white text, an accent left border and heavier weight over 0.3s, driven by a scroll-spy. Below `md` the rail is replaced by a **`position: sticky; top: 72px` chip bar** with `bg-space/85 backdrop-blur-xl py-3`.
- Each service block: eyebrow → H2 52/55 → a 22/31 lead at 90% white → a "Current Challenge:" paragraph → capability detail. Content depth is what makes ten services feel substantial rather than like a grid of ten icons.
- **03** is `min-h-[100svh]`: an entire screen given to "Let us build yours." at 72/73 plus one 226×48 pill.

### PAGE: Products (`/products`, document 5293px)

```
01  Hero (max-w-[1100px], H1 56/57, sub 17/29 at 70%)
02  #products — 3D cylinder carousel, 5 products
03  #portfolio — SVG-arc product stage, 5 categories
04  Closing CTA
05  Footer
```

- **02** `portfolio-cylinder`: `perspective: 1100px`, 390px viewport, stage `--radius: 480px`, panels 460×292 placed by `rotateY(i·step) translateZ(480px) scale(s)`, inactive panels at `opacity: .04`.
- **03** `product-stage`: a 1100px grid with an SVG arc navigation — a 1.5px `rgba(255,255,255,.2)` track, a 3px gradient lead stroke with `drop-shadow(0 0 6px rgba(34,211,238,.45))`, and dots transitioning `fill`, `r` and `filter` over 0.42s; the active dot is `#22d3ee` with a 7px glow. Category headings are 44/53 at 600. Panel swaps run 0.17–0.26s out and 0.38s in.

### PAGE: Industries (`/industries`, document 2519px)

```
01  Hero (max-w-[1280px], H1 56/57, sub ~61ch)
02  12-card grid
03  Closing CTA band (border-top + border-bottom)
04  Footer
```

- **02** is `grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6`, cards 394.7×253.7, radius 14px, `background: rgba(0,0,0,.28)`, `border: 1px rgba(255,255,255,.07)`, a 392.7×251.7 (1.56:1) `object-fit: cover` image behind at low opacity, a 22/28 title, a one-line promise at 15/24, and a small "flow" strip of workflow steps. Whole card is the link.

### PAGE: About (`/about`, document 4730px)

```
01  Bleed hero (about-hero_bleed) — H1 64/66, two CTAs
02  Stat band — 4 columns
03  #team — 5-up person grid, 128px round avatars, links to root-level person routes
04  About statement — 30/45 pull-quote at 92% white, byline, 5 social circles
05  #process — "How we work", three columns: Automate / Simplify / Scale (H3 24/32 in cyan)
06  Insights rail — horizontal scroll-snap (snap-x mandatory), scrollWidth 2198 in a 1344 viewport, 604.8×378 (1.6:1) cards
07  Closing CTA band
08  Footer
```

The narrative order is **person → numbers → people → philosophy → method → proof → ask**. The stat band and the three-step process are the two structures worth reusing; the insights rail is the only horizontal scroller on the site.

### PAGE: Product detail (`/products/aura-transcriber`, document 4335px)

```
01  Hero (H1 + positioning line)
02  Three capability cards ("Nothing to install", "Tamil and English, code-switched", "Straight into your CRM")
03  "What you get" — four outcome blocks phrased as questions the buyer already has
04  "What that means for your data" — three blocks (isolation, recording announcement, retention/erasure) + an explicit "What it does not do"
05  Closing CTA
06  Footer
```

The **"what it does not do"** block is the strongest structural idea on the site: an explicit limits section inside a sales page. It buys more credibility than any testimonial.

### PAGE: Contact (`/contact`, document 4679px) — see §7.

### PAGE: Legal (`/privacy`, `/terms`)

```
01  Title band (max-w-6xl, pt-16 pb-4)
02  Prose column (max-w-3xl, py-16) — H2 sections, ~2000 characters
03  Footer
```

Seven H2s on privacy (What we collect / Analytics and cookies / How we use it / Who we share it with / How long we keep it / Your rights / Contact); six on terms. Short, plain, readable — not a wall.

---

## 4. MOTION INVENTORY

Full machine-readable inventory with from/to values, durations, easings, triggers, thresholds and reduced-motion behaviour: **`data/motion-inventory.json`**. Summary of the grammar:

### The four easings

| Easing | Value | Used for |
| --- | --- | --- |
| **House** (`.ease-brand`) | `cubic-bezier(0.22, 0.61, 0.36, 1)` | every reveal, every arrow, every accent transition |
| **Chrome** | `cubic-bezier(0.77, 0, 0.175, 1)` | header pill morph, mobile menu |
| **UI** | `cubic-bezier(0.4, 0, 0.2, 1)` | dropdowns, rail state, small colour changes |
| **Cinematic** | `cubic-bezier(0.45, 0, 0.25, 1)` | coverflow frames and caption |

### The duration ladder

`0.15s` micro-state → `0.22s` arrow nudge → `0.3s` button → `0.42s` SVG node → `0.5s` section fade / chrome morph → `0.64s` word → `0.7s` block → `0.76s` caption → `0.9s` display line → `1.0s` coverflow opacity → `1.6s` coverflow transform → `2.8s` autoplay → `60s` marquee.

### Key entries

| Element | Trigger | From → To | Duration | Easing | Evidence |
| --- | --- | --- | --- | --- | --- |
| Header pill | scrollY crosses 48–56px (≈50) | max-width 1280 → 1152, transparent → `rgba(22,20,44,.8)` + `blur(24px)` + hairline + shadow, padding 0 → 12px/clamp(20px,5vw,80px) | 0.5s | chrome | CONFIRMED |
| Hero blocks (home) | mount, ~1.43s after commit | `opacity 0, translateY 12/24/16/16px` → `1, 0` | 0.7s, stagger **0.12s** | house | CONFIRMED |
| Hero lines (services) | mount, ~1.19s after commit | `opacity 0, translateY 56px` → `1, 0` | 0.9s, delays 0.14 / 0.25 / 0.36 / 0.47 / 0.62 / 0.90 | house | CONFIRMED |
| Section reveal | **IO `threshold: 0.12`, `rootMargin: 0px 0px -8% 0px`** | `opacity 0, translateY 20px` → `1, 0` | 0.7s, stagger 0.12s | house | CONFIRMED |
| Word reveal | mount / reveal | `opacity 0, translateY` → `1, 0` | 0.64s, stagger 0.045–0.06s | house | CONFIRMED |
| Kinetic wordmark | scroll, `--kt-p` 0→1 across 1152px of runway | font-size 216.7 → 56.3px, translateY +13 → −13px, `scaleX(.92)` constant; footer opacity `(p − 0.62) × 2.7`, translateY `(1 − p) × 34px` | scroll-linked, **linear** | none (linear) | CONFIRMED |
| Coverflow | IO `rootMargin: 120px 0px`, then 2.8s autoplay, plus pointer steering | index n → n+1; widths 298/77/55/39 | transform 1.6s, opacity 1.0s | cinematic | CONFIRMED |
| Client marquee | always | `translateX 0 → −50%` | 60s linear infinite, **pauses on hover and focus-within** | linear | CONFIRMED |
| Nav dropdown | hover / focus | `opacity 0, translateY −4px, hidden` → `1, 0, visible`; chevron `rotate(180deg)` | 0.2s | UI | CONFIRMED |
| Mobile menu | `button[aria-label="Toggle menu"]` | header 74 → 475px; pill radius → rounded rect | 0.5s surface, 0.3s panel | chrome / UI | CONFIRMED |
| Primary button | hover (`@media (hover:hover)`) + `:focus-visible` | `translateY 0 → −2px`, bg `.04 → .08`, gradient hairline opacity `.9 → 1`, arrow `translateX 4px` | 0.3s / arrow 0.22s | ease | CONFIRMED |
| Product column | hover | title `translateY −2px`, arrow `translateX 6px` + colour `.46 → #fff` | 0.22s | house | CONFIRMED |
| Industry card | hover | `translateY −3px`, border `.07 → .16`, bg `.28 → .36`, media opacity → `.15` | — | — | CONFIRMED |
| Services rail | scroll-spy | inactive → active: colour, left border, weight; index colour 0.15s | 0.3s | UI | CONFIRMED |
| Product arc | active index | dot `rgba(255,255,255,.35)` → `#22d3ee` + 7px glow, plus `r` | 0.42s | house | CONFIRMED |
| Chat launcher | always | `launcher-radar` ×3 staggered 0 / 1.1 / 2.2s; `launcher-bob` | 3.3s / 4.5s infinite | house / ease-in-out | CONFIRMED |
| WebGL field | continuous | particle formation changes with scroll depth | — | — | presence CONFIRMED, per-section formation STRONGLY INFERRED |

### Reduced motion — the best-executed part of the site

Measured pair of instrumented runs: **47 animation/transition events with no preference, 25 with `reduce`, every one collapsed to `1e-06s`; zero running animations; zero elements left below opacity 1; document height 5483 → 4060 px.**

The implementation is two-layer:

1. A global kill switch: `*, ::before, ::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; scroll-behavior: auto !important }`.
2. Seven component blocks that give **structural** fallbacks rather than merely fast ones:
   - kinetic wordmark: `track { height: auto }`, `stage { --kt-p: 1; position: static; height: auto; padding: clamp(64px,12svh,140px) 0 }`, transforms removed, footer forced visible — the 220svh runway disappears entirely;
   - marquee: mask removed, track wraps to a centred multi-row list, duplicated clones `display: none`;
   - coverflow: frame transition and caption animation removed;
   - `.btn-primary { --btn-lift: 0px }`.

That is the difference between "respects the media query" and "designed a second, static version of the page".

---

## 5. TECHNOLOGY

### VERIFIED

| Fact | Evidence |
| --- | --- |
| **Next.js App Router** | `_next/static/chunks/app/(site)/…`, `products/[slug]`, `Vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch`, `self.__next_f` |
| **Vercel hosting** | `server: Vercel`, `x-vercel-cache: HIT`, `x-vercel-id: fra1::…` |
| **RSC prefetching** | 12 `?_rsc=…` fetches on the homepage, armed by an IntersectionObserver with `rootMargin: 200px` over 63 links |
| **Tailwind CSS v3** | `--tw-*` custom properties, arbitrary values (`min-h-[calc(100svh-72px)]`, `lg:grid-cols-[1.5fr_0.9fr…]`), custom theme names (`bg-space`, `text-brand-muted`, `ease-brand`, `text-fluid-*`) |
| **CSS Modules** | hashed classes `kinetic-wordmark_track__Ix3op`, `image-flow_stage__VVz_X`, `product-stage_dot__Hav2_` |
| **GSAP + ScrollTrigger + Observer** | `gsap.registerPlugin(ScrollTrigger)` and `gsap.registerPlugin(Observer)` string-present in chunks `84.e125f07…` and `c15bf2b0…`; `gsapVersions` array present |
| **three.js r163 + React Three Fiber + react-spring** | `WebGLRenderer`, `ShaderMaterial`, `BufferGeometry`, `"163"` in the 668 KB `b536a0f1…` chunk; `@react-three` and `react-spring` in `917.b6001fd…` |
| **`next/image`** | `/_next/image?url=…&w=384&q=75` |
| **Self-hosted variable fonts** | two `.woff2` files, three registered `FontFace` entries |
| **Microsoft Clarity** | `clarity.ms/tag/xxgqchsc0w`, three `k.clarity.ms/collect` beacons |
| **Native smooth scrolling** | `html { scroll-behavior: smooth }`; no `pin-spacer` element exists on any audited page |
| **Reduced-motion support** | seven `@media (prefers-reduced-motion: reduce)` blocks; 13 runtime `matchMedia` queries |
| **Hover gating** | eleven `@media (hover: hover)` blocks |
| **No GA/GTM** | `dataLayer` and `gtag` both `null` on `/`, `/services`, `/products`, `/contact` and `/book`; Clarity is the only analytics observed |

### LIKELY

- GSAP is present in the bundle but **no global is exposed** (`window.gsap` is `null`), so it is imported as a module. Which effects it drives is not proven: the header, reveals, coverflow and marquee are all demonstrably plain CSS transitions/keyframes, and the kinetic wordmark is `position: sticky` + a custom property. GSAP's observable footprint on the audited pages is therefore small — it may be doing only the particle/scroll plumbing, or be largely unused on these routes.
- The kinetic wordmark's rendered font size at ≥1024 exceeds the CSS `--kt-max` default, which is consistent with a script measuring the word and re-fitting it to `--kt-fill` (0.94) of the stage width.
- Total first-load JS is ~1.5 MB across 25 script requests, dominated by the 668 KB three.js chunk — the WebGL background is by far the most expensive thing on the page.

### UNKNOWN

- `/animations` — robots-disallowed, not fetched.
- Whether the WebGL render loop pauses under `prefers-reduced-motion`.
- Backend/CMS: no CMS fingerprint was observed. Content may be file-based in the repo; nothing proves a headless CMS.
- Form/booking backend: submissions were deliberately blocked, so the endpoint, provider and success UI are `UNKNOWN`.
- The calculator's formula. It was not reverse-engineered, per instruction.

---

## 6. RESPONSIVE

### Actual breakpoints (found by a 20px sweep from 320 to 1920, refined to 2px)

| Width | What changes | Source |
| --: | --- | --- |
| **560** | About stat band 1 → 2 columns | custom CSS-module query |
| **640** (`sm`) | Hero `pt-12 → pt-24` (48 → 96px); industry cards 1 → 2 columns; about team grid 2 → 3 columns | Tailwind `sm` |
| **720** | Home product rail 1 → 2 columns | **custom** module query |
| **768** (`md`) | Section rhythm steps up (`pt-20 → pt-28`, `py-16 → py-[100px]`); a header link becomes visible; services mobile chip bar disappears | Tailwind `md` |
| **1000** | About stat band 2 → 4 columns | **custom** module query |
| **1024** (`lg`) | **Desktop navigation appears** (2 → 19 visible links incl. dropdowns); mobile toggle `display: grid → none`; hero `pt-0` and `align-items: center`; industry cards 2 → 3; team grid 3 → 5; services becomes `260px 1fr` | Tailwind `lg` |
| **1160** | Home product rail 2 → **5 columns** | **custom** module query |
| **1280** (`xl`) | Services rail gap 48 → 64px | Tailwind `xl` |
| **1440** | Kinetic wordmark size tokens step up | custom |
| **1536** (`2xl`) | present in CSS, no observed effect on audited components | Tailwind `2xl` |

Below `768` the kinetic wordmark switches to a **stacked column** (`SIRAH` over `DIGITAL`), track drops from 220svh to 200svh, and its size tokens change to `--kt-max: 20 / --kt-min: 6.8`.

### Per-component behaviour at the six audited widths

| Component | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
| --- | --- | --- | --- | --- | --- | --- |
| Header height | 98 | 98 | 98 | 98 | 98 | 98 |
| Header gutter (scrolled) | 20 | 38 | 51 | 64 | 72 | 80 |
| Navigation | toggle | toggle | full | full | full | full |
| Hero H1 | 40 | 45 | 54 | 54 | 54 | 54 |
| Hero height | 772 | 952 | 696 | 728 | 828 | 1008 |
| Hero alignment | top | top | centre | centre | centre | centre |
| Product rail columns | 1 | 2 | 2 | 5 | 5 | 5 |
| Industry cards | 1 | 2 | 3 | 3 | 3 | 3 |
| Team grid | 2 | 3 | 5 | 5 | 5 | 5 |
| Services layout | stacked + sticky chips | stacked | rail 260+1fr | rail, gap 64 | rail | rail |
| Kinetic track | 200svh, stacked word | 220svh | 220svh | 220svh | 220svh | 220svh |
| Coverflow hero image | `clamp(130px, 50vw−26px, 250px)`, controls below | same | `clamp(190px, 42.3vw−105px, 300px)`, controls right | same | same | same |
| Section H2 | 31 | 40 | 46 | 52 | 52 | 52 |
| Closing CTA H2 | 38 | 52 | 61 | 70 | 72 | 72 |

**Intermediate widths behave well** — the type scale is continuous (the H1 changes by 1px roughly every 20–40px of viewport between 640 and 1020), and the containers cap rather than stretch. The one genuinely awkward band is **768–1023**, where the desktop navigation has not yet appeared but the layout is already wide: the home product rail sits at 2 columns of 360px, and the page is at its *longest* in absolute terms (6783px at 768 versus 5535px at 1024).

**Above 1440** nothing gains columns; the page simply gets taller (6141px at 1920 versus 5483px at 1440) because the viewport-height-driven sections (hero `100svh`, kinetic `220svh`) grow. Everything else is capped at 1152–1440px and centred.

---

## 7. CONTACT AND CALCULATOR

### 7.1 The conversion flow

```
any page → header CTA / hero CTA / section CTA / closing CTA / footer CTA / chat launcher
        → /contact  (qualify: who you are + what you want + free-text detail)
        → "Continue to calendar →"
        → /book     (confirm identity + pick a day + pick a time)
        → "Confirm booking"
```

Every page ends with the same closing CTA band, and every CTA in the site funnels to the same two-step flow. There is no second conversion path (no newsletter, no gated download other than the calculator's report button, no pricing page).

### 7.2 Contact form

| Aspect | Measured |
| --- | --- |
| Layout | `grid-cols-1 sm:grid-cols-2 gap-5` (20px); company and message span full width |
| Fields | `firstName*`, `lastName`, `email*`, `phone*` (labelled **WhatsApp number**), `company`, `message*` (textarea, 152px), `consent*` (checkbox), plus a hidden `website` honeypot with `autocomplete="off"` |
| Autocomplete | `given-name`, `family-name`, `email`, `tel`, `organization` — all correct |
| Field styling | 57px tall, radius 12px, `background rgba(255,255,255,.02)`, `border 1px rgba(255,255,255,.18)`, padding `24px 16px 8px` (a **floating-label** pattern), 15.2/22.8 |
| Focus | border → `rgba(59,130,246,.6)`, background → `.04`, `outline: 2px solid #60a5fa`, plus `box-shadow: 0 0 0 3px rgba(59,130,246,.12)` |
| Service selection | `<fieldset>` legend "Which product are you interested in? (optional)" with **seven 44px pill chips** (`aria-pressed`, radius 999px, `bg rgba(255,255,255,.02)`, `border rgba(255,255,255,.22)`, 14/21 at 500) — six products plus "Not sure yet" |
| Validation | **Native HTML5 constraint validation** (`noValidate = false`). Empty submit reports 5 invalid fields with browser messages and focuses `firstName`. No custom `[role="alert"]` error nodes appeared |
| Consent copy | Names the purposes, the **24-month** retention, "never sold or shared for anyone else's marketing", and an erasure route by email |
| Submit | **"Continue to calendar →"** — 225×48 pill; the form is explicitly step 1 of 2 |
| Surrounding content | An "Our office" panel with address, email and WhatsApp; below it the calculator |

The single best idea here is the **CTA label**. "Continue to calendar" tells the visitor exactly what the next screen is, which is why the two-step flow does not feel like an extra step.

### 7.3 Booking step (`/book`)

- Fieldset **"1 · Your details"** — the same five fields plus honeypot, but here as 49px placeholder-labelled inputs (`radius 12px`, `bg rgba(255,255,255,.05)`, `border rgba(255,255,255,.1)`) with `*` in the placeholder.
- Fieldset **"2 · Pick a time"** — a horizontal day rail with 36px circular ‹ › controls and 68×72 day cards (`Tue / 8 / Sep`); selected state `bg rgba(59,130,246,.15)` + `border #3b82f6`, radius 12. **Sundays are excluded** (Sat 12 → Mon 14). Then a time-slot grid of 25 buttons.
- Helper copy: "All times India Standard Time (IST)." and "We send your booking confirmation here, a reminder the day before, and the joining link an hour before the call."
- Submit: "Confirm booking", 48px pill.

**Defect — do not reproduce.** The 25-slot time grid renders as a **single non-wrapping row 2588px wide** at every audited width (390 → 1920) inside an 880px container, and is clipped by `body { overflow-x: hidden }`. Body `scrollWidth` measured 2524 / 2612 / 2684 / 2812 / 2892 / 3132 px at 390 / 640–768 / 1024 / 1280 / 1440 / 1920. Most time slots are unreachable. It is also the only page on the site with horizontal overflow. Screenshot: `screens/book--1440.png`.

### 7.4 Impact calculator (on `/contact`)

**Inputs**

| Control | Type | Range / options | Default | Helper |
| --- | --- | --- | --- | --- |
| Industry | `select` | 12 options (Healthcare, Real Estate, Manufacturing, Retail, Education, Finance, Hospitality, Construction, Professional Services, Automotive, Logistics, Technology) | `professional-services` | — |
| Business size | `select` | Startup / Small Business / Growing Business / Enterprise | `growing` | — |
| Team size | `range` | 5–1000, step 5 | 40 | "People whose work automation would touch" |
| Manual hours per week | `range` | 1–60, step 1 | 14 | "Repetitive work per person, per week" |
| Advanced assumptions | disclosure button | reveals derived volumes | collapsed | "Lead, call and document volumes are estimated from your team size — about 400 leads, 880 calls and 2,480 documents a month" (scales linearly with team size) |

**Outputs** — recalculated immediately on input; no count-up animation was observed.

| Metric | At defaults | At team 200 |
| --- | --- | --- |
| Estimated annual savings | `$204K` | `$1.0M` |
| Hours saved per year | `18.2Kh` | `90.4Kh` |
| First-year ROI | `509%` | `501%` |
| Payback period | `2.0 mo` | `2.0 mo` |
| Revenue opportunity | `$258K` | `$545K` |
| Lead response | `720× faster` | `720× faster` |
| Automation coverage | `68%` | `67%` |
| Productivity improvement | `+24.8%` | — |
| Manual hours per year | Today `29,440h` vs With Sirah `11,207h` | — |
| Potential savings over 12 months | `$462K`, plotted Month 1 → Month 12 | — |

Also present: a **"Recommended automations"** list keyed to the selections, a disclaimer **"Indicative estimate."**, an honesty line under the headline number (*"Realised cost avoidance — not the notional value of every freed hour"*), and a CTA **"Download the automation report →"**.

**Currency is USD** with compact notation (`$204K`, `$1.0M`), hours compacted (`18.2Kh`), percentages and months. On mobile the whole calculator stacks into a single column within the same `max-w-6xl` container.

The formula was **not** reverse-engineered, per instruction. The observable structure worth carrying forward is: *four inputs, one headline number, five supporting tiles, one before/after comparison, one 12-month projection, one recommendation list, one disclaimer, one CTA* — plus the two honesty devices (the "realised cost avoidance" qualifier and the disclosed assumptions), which are what make the number credible.

---

## 8. REUSABLE DESIGN PRINCIPLES

What actually makes this reference feel expensive, ranked by how much of the effect they carry:

1. **One ground colour, elevation by alpha and hairline.** No second background colour, no light cards, no coloured panels. Depth comes from `rgba()` over the ground plus a 5–12% white hairline plus `backdrop-filter`. This is why nothing looks like a template.
2. **Opacity as the type hierarchy.** Nine steps of white alpha do the work that a grey scale usually does. Colour is never used to rank text.
3. **Accent scarcity.** The blue→violet gradient appears only as a 1px button border; the indigo→cyan gradient only on progress and active indicators. No filled accent buttons anywhere.
4. **A single eyebrow token.** 11px, 500, `+0.32em`, uppercase, ~38% white. It appears once per section and is the only positive tracking in the system.
5. **Sub-1.0 display leading against 1.7 body leading.** The tension between the two is most of the perceived typographic quality.
6. **A numerals-only font in first position.** One line of CSS gives every digit on the site an editorial serif voice.
7. **One house easing everywhere.** `cubic-bezier(0.22, 0.61, 0.36, 1)` on essentially every reveal and nudge, with three narrowly-scoped exceptions. Consistency of easing reads as craft.
8. **Reveal restraint.** 20px translate, 0.7s, 120ms stagger, `threshold: 0.12`, `rootMargin: -8%` at the bottom. Big enough to notice, small enough not to fight scrolling. It fires once.
9. **Arrow micro-motion as the universal affordance.** Every link that goes somewhere has an arrow that translates 4–6px in 0.22s. It replaces underlines entirely.
10. **One expensive moment per page.** The homepage spends 2.2 screens on the kinetic wordmark and nothing else is over one screen. Services spends a whole `100svh` on four words. Restraint everywhere else pays for one memorable thing.
11. **Sticky index over pagination.** Ten services on one page with a scroll-spy rail feels more substantial than ten routes, and it keeps every service one anchor away from the nav.
12. **Depth of content per item.** Each service carries a "Current Challenge" narrative; each product detail carries a data-handling section *and* a "what it does not do" section. Substance, not more cards.
13. **Motion that pauses for the user.** The marquee stops on hover *and* focus-within; the coverflow follows the pointer. Ambient motion yields to intent.
14. **Hover gated behind `@media (hover: hover)`.** Touch devices never get a stuck hover state — eleven blocks of hover CSS are all gated.
15. **A visible, consistent focus ring.** `2px solid #60a5fa` at `outline-offset: 3px` (4px on pills) on every interactive element, plus a skip link.
16. **Reduced motion as a second design, not a switch.** Structural fallbacks that shorten the page by 26%.
17. **Two-step conversion with an honest label.** "Continue to calendar" beats "Submit" because it tells the visitor what happens next.
18. **A calculator that admits what it is.** The disclosed assumptions, the "realised cost avoidance" qualifier and "Indicative estimate." make the numbers more persuasive, not less.

### What to do differently

- The 668 KB three.js chunk for a decorative background is a heavy price on a marketing site, especially for mobile in-market users.
- `/book`'s slot grid is broken at every width (§7.3).
- The 768–1023 band is the weakest state: wide layout, mobile navigation, longest page.
- Person profiles occupying root-level paths (`/salman`) will collide with future content namespaces.

---

## 9. DO-NOT-COPY LIST

> ### AMENDED 2026-09-09 — the provenance premise below is wrong
>
> **This section was written in Phase 1 on the premise that `sirahdigital.in`
> belongs to a third party.** It does not. The owner stated at the start of the
> Phase 3 workstream that it is **their own company**, and that the Saudi entity
> gets its own team, figures and product line while layout and section order are
> matched. That answer is recorded in `docs/HANDOFF.md`, Phase 3, "What the
> owner authorized".
>
> The list below is preserved exactly as written, because it is what was true to
> the evidence available in Phase 1 and later work referred to it. It is no
> longer the operative guardrail. What follows is.
>
> #### Lifted, by explicit owner instruction
>
> - **The calculator's constants and outputs.** Phase 4 was instructed to
>   reproduce the reference's impact calculator *exactly* — every control, every
>   label, and the published figures themselves. `509%`, `2.0 mo`, `720×`,
>   `68%`, `$204K`, `$258K`, `$462K` and the 400 leads / 880 calls / 2,480
>   documents note are therefore **required**, not forbidden. The derivation is
>   in `CALCULATOR-MODEL.md` and the reproduction is asserted in
>   `frontend/tests/unit/calculator/model.test.ts`.
> - **Layout, section order and interaction patterns**, per "same final look
>   except the header, same motion where we can".
> - **The English copy of the calculator**, which is the owner's own writing and
>   is used verbatim, punctuation included.
>
> #### Still forbidden, and NOT because of provenance
>
> Common ownership of the two companies does not make these portable. Each has
> its own reason:
>
> - **Client names and wordmarks** (Fortune Innovatives, Interlock Bricks,
>   Stansford International School, B² Consultants, and the rest of the
>   marquee). These belong to *third parties*, not to the owner. Owning the
>   `.in` company grants nothing over its clients' marks, and a Saudi entity
>   listing clients it has not served is false regardless of who owns it.
> - **The "10,000+ businesses" claim and every volume or track-record figure
>   presented as fact.** These describe the Indian entity's history. Asserting
>   them for the Saudi entity would be untrue whoever owns both.
> - **Indian market specifics** — the Chennai address,
>   `support@sirahdigital.in`, `+91 97899 61631`, the WhatsApp link, INR/₹
>   pricing, IST scheduling, Tamil language claims, Indian regulatory
>   references, and TNPSC. Wrong for a Saudi market, not unlicensed.
> - **The `sirahdigital.in` domain** in any link, canonical, sitemap or
>   structured-data field. ADR-035 governs the hostname.
> - **Photography and third-party assets.** Licensing is granted per entity and
>   the Saudi entity's rights are `UNKNOWN`.
> - **Minified bundles, CSS-module class output and copied source.** Everything
>   in this report is a *measurement* to build against, not code to transplant.
>   That was never a provenance rule.
>
> #### Open, and the reason this amendment matters
>
> **Team member names, roles, biographies and the founder narrative.** Phase 1
> forbade them as a third party's data. That reason is gone; a different one is
> not. The Digital tenant's seeded `/about` currently carries five real named
> individuals from the `.in` entity, and its `h1` names the founder — see
> `QA-PASS.md` §5 and the Phase 5 handoff. These are identified real people, and
> whether they staff the Saudi entity is a fact about the business that only the
> owner can state. Nothing is deployed and the launch gate blocks the records,
> but this is an **open owner decision**, not a resolved one.
>
> **Anything that would misrepresent either company still applies.** The Saudi
> site is a different company in the SIRA GROUP and must read as one — that
> clause survives the correction intact, and is now the load-bearing one.

---

*Preserved below as originally written, under the superseded premise.*

This is a guardrail for Phase 2. None of the following may enter the SIRA Saudi implementation, in code, content, fixtures, seed data, screenshots, or design comps.

**Content and claims**
- Client names and any client wordmarks from the marquee (Fortune Innovatives, Interlock Bricks, Stansford International School, B² Consultants, and every other name in that track).
- The "10,000+ businesses" claim and every other volume, ROI, coverage or savings figure presented as fact.
- Calculator assumption constants and outputs (400 leads / 880 calls / 2,480 documents per 40 people; 509% ROI; 2.0 months payback; 720× lead response; 68% coverage; `$204K`, `$258K`, `$462K`, `$1.0M`).
- Testimonials, case-study narratives, and project claims on the person profiles.

**Identity and people**
- The Sirah Digital name, logo mark, wordmark lockup, and the "Ask Sirah AI" assistant branding.
- Team member names, roles, biographies, photographs (`/team/*.jpg`) and their profile routes.
- The founder narrative and the "Meet Our Brains" section heading.

**Products and proprietary naming**
- Aura Transcriber, Analytics Agents, NUSI, TNPSC Mentors, LexDraft — names, descriptions, feature lists and product copy. TNPSC in particular is an Indian state examination and has no Saudi analogue.

**Contact and market specifics**
- The Chennai office address, `support@sirahdigital.in`, `+91 97899 61631`, the WhatsApp link, and all social profile URLs.
- Indian market framing: INR/₹ pricing, IST scheduling, Tamil/English language claims, Indian regulatory references.

**Assets and code**
- Photography (`/carousel/*.jpg`, `/images/industries/*`, team portraits, insight card images).
- Minified JavaScript, CSS bundles, CSS-module class output, and any copied source. Everything in this report is a *measurement* to build against, not code to transplant.
- The `sirahdigital.in` domain in any link, canonical, sitemap or structured-data field.

**Anything that would impersonate the reference company.** The Saudi site is a different company in the SIRA GROUP and must read as one.

---

## 10. KSA ADAPTATION NOTES

Recorded only — nothing here is implemented in Phase 1.

**Language and RTL.** The reference is `lang="en"` with no `dir` attribute and no localisation layer. A Saudi site needs Arabic as a first-class locale, which materially affects several of the patterns above:

- The coverflow, the arc navigation and the cylinder carousel are all **directional**; their index order, arrow icons and pointer-steering mapping must mirror under `dir="rtl"`.
- Every `translateX` nudge (arrows at 4–6px, `work-row` at 3px) must flip sign in RTL. Prefer logical properties and `translate: inline-start` patterns over hard-coded X.
- The marquee direction must flip; the edge mask is symmetric so it survives.
- The sticky services rail sits on the left; in RTL it belongs on the right — use `grid-template-columns` with logical placement, not a fixed `260px 1fr`.
- The header pill's logo/nav/CTA order reverses.
- Arabic needs its own type stack. Satoshi has no Arabic coverage, and the "numerals-only first font" trick interacts with Arabic-Indic digits (`٠١٢٣`) — decide per locale whether digits are Latin or Arabic-Indic before adopting that stack.
- Arabic display type does not tolerate −0.03em tracking or 0.84 line-height. The tight-display / open-body contrast must be re-derived for Arabic rather than inherited.

**Currency and units.** The calculator is USD-only. The Saudi model must use **SAR** with correct formatting (`ر.س` / `SAR`), and the compact notation (`$204K`) needs an Arabic-aware equivalent. Hours, ROI and payback framing may carry over; the numbers must be our own transparent model, not theirs.

**Scheduling.** IST must become **AST (UTC+3)**. The reference excludes Sundays; a Saudi booking calendar excludes **Friday and Saturday** as the weekend, and should account for prayer times and Ramadan hours. The reference's day-rail pattern is reusable; its calendar rules are not.

**Contact behaviour.** WhatsApp-first is *more* appropriate in KSA than in India, so the "WhatsApp number" field label pattern transfers well. Phone input needs `+966` defaults and Saudi mobile validation. Consent copy must be re-drafted against **PDPL** (Saudi Personal Data Protection Law), not simply reused — the 24-month retention statement and the erasure route are a good structural model, the legal text is not.

**Market content.** Industries must be re-derived for the Saudi market (Vision 2030 sectors: energy, giga-projects, logistics, tourism, healthcare, fintech, government services), not translated from the Indian list. Services and products must be SIRA's own.

**SIRA GROUP affiliation.** The reference is a standalone company site with no group parent. The Saudi site needs a group relationship expressed in the header, footer and About narrative — that is net-new structure with no analogue in the reference.

**Architecture.** This repository's locks apply to any Phase 2 work inside it: WordPress Multisite as the editorial CMS, `sira-core` owning backend content architecture, WPGraphQL as the primary API, Server Components by default, and hostnames resolved through the validated site registry. The reference's Next.js App Router + Tailwind + CSS Modules shape is compatible with that; its three.js background and GSAP dependency are optional and should be treated as a separate, separately-authorized decision given the 668 KB cost. **Whether `sirahdigital.sa` is built inside this repository at all is an open owner decision — the canonical topology recorded in `project-state.json` covers `siratrgroup.com` and its four subdomains only, and does not include this domain.**

**Content model implied by the design** (architectural observation only — no WordPress change is proposed here):

| Structure | Repeatable | Relational | Notes |
| --- | --- | --- | --- |
| Service | yes (10) | → industries, → products | needs `anchor`, `eyebrow`, `title`, `lead`, `challenge`, `capability body`, `order` |
| Product | yes (5) | → industries, → services | needs `slug`, `summary`, `capability cards[3]`, `outcomes[4]`, `data handling[3]`, `limits`, `cta` |
| Industry | yes (12) | → services, → products | needs `slug`, `title`, `promise`, `card image`, `workflow steps[]`, `what we build[]`, `typical stack[]` |
| Person | yes (5) | → projects | root-level routing in the reference; **use a namespaced path instead** |
| Project / work item | yes | → person, → industry | `title`, `status`, `metric` |
| Insight / article | yes | → service, → industry | 1.6:1 image, title, excerpt |
| Stat | yes (4) | global | About stat band |
| Process step | yes (3) | global | Automate / Simplify / Scale |
| Client (marquee) | yes (~15) | global | name or logo; **ours must be real and consented** |
| Calculator config | global | → industry | industry multipliers, size bands, assumption constants |
| Site settings | global | — | nav tree with 2 dropdowns, footer 6 columns, socials, office, legal |
| Legal page | page-specific | — | privacy, terms |

---

## 11. ARTIFACTS

All under `artifacts/reference-forensics/sirahdigital-in/` (untracked; `.gitignore` in that directory excludes the PNGs).

| Path | Contents |
| --- | --- |
| `REPORT.md` | this report |
| `data/route-inventory.json` | structured route inventory |
| `data/motion-inventory.json` | structured motion inventory with from/to, durations, easings, triggers, thresholds |
| `data/routes.json` | crawl output: 31 routes with headings, sections, forms, metadata |
| `data/sitemap.json`, `data/robots.txt` | discovery evidence |
| `data/measure/<slug>--<vp>.json` | 57 measurement files (10 routes): geometry, computed styles, typography, colour inventory, grids, sticky elements |
| `data/density.md`, `data/density.json` | section start/end Y tables for 10 routes × 6 viewports |
| `data/breakpoints.json` | 81-sample width sweep with the derived change list |
| `data/tech-<route>.json` | network waterfall, globals, fonts, CSS custom properties, IO/WAAPI/transition instrumentation for 5 routes |
| `data/interactions.json` | header scroll states, hover deltas, focus ring, mobile menu open/close |
| `data/scroll-motion.json` | 31 scroll samples of the kinetic wordmark, coverflow and marquee |
| `data/reduced-motion.json` | matched no-preference vs reduce runs |
| `data/entrance-home.json`, `data/entrance-services.json` | timestamped entrance choreography |
| `data/forms.json` | contact and booking form structure, validation, focus, calculator controls and outputs |
| `screens/*.png` | 25 captures: full-page at 390 and 1440 for the measured routes, plus six homepage viewport frames at 1440 |
| `tools/*.mjs` | the nine capture scripts, re-runnable with `node tools/<script>.mjs` from the artifact directory |

**Re-running.** All scripts resolve `playwright-core` from `frontend/node_modules` and take route arguments. On Git Bash, prefix with `MSYS_NO_PATHCONV=1` so `/` route arguments are not converted to Windows paths.

---

## Evidence and scope statement

- **Execution profile:** `LOCAL` (browser/runtime evidence was required and is local-only).
- **Repository state at capture:** branch `feat/newsroom-ledger`, HEAD `be73fb5a2102622bd25b27f6fefaad966e86878f`. No commit, no branch, no PR was created by this work.
- **Mutation:** none to any production file. New untracked files exist only under `artifacts/reference-forensics/sirahdigital-in/`.
- **Reference safety:** every non-GET request to `sirahdigital.in` was aborted during form testing; no enquiry, booking, or lead was created. `/animations` was not fetched because `robots.txt` disallows it.
- **Not authorized by this audit:** any Phase 2 implementation, any WordPress/CMS change, any change to the SIRA production frontend, staging, deployment, DNS, or cutover.
