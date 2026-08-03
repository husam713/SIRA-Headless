# Step 2C design-source audit

## Sources inspected

- `SIRA Group Homepage.dc.html`
- `Sira Branch.dc.html`
- `Sira Consulting.dc.html`
- `Sira Healthcare.dc.html`
- `Sira Lifestyle.dc.html`
- `Sira Real Estate.dc.html`
- `Sira News.dc.html`
- supplied PNG logo and mark assets

The `.dc.html` and JavaScript files are visual references only.

## Source-derived palette

The shared branch prototype defines:

- accent: `oklch(0.56 0.13 <hue>)`
- accent bright: `oklch(0.72 0.14 <hue>)`
- paper: `oklch(0.98 0.005 90)`
- paper glass: `oklch(0.98 0.005 90 / 0.9)`
- ink: `oklch(0.2 0.02 260)`
- ink soft: `oklch(0.44 0.015 260)`
- ink faint: `oklch(0.55 0.01 260)`
- tint: `oklch(0.965 0.012 <hue>)`
- border: `oklch(0.88 0.01 90)`
- shadow: `oklch(0.4 0.06 <hue> / 0.4)`
- deep: `oklch(0.17 0.045 <hue>)`
- deep card: `oklch(0.21 0.05 <hue>)`
- deep border: `oklch(0.3 0.04 <hue>)`
- footer: `oklch(0.14 0.04 <hue>)`

Approved branch hues:

- Consulting: 300
- Healthcare: 235
- Lifestyle: 165
- Real Estate: 45

The Group prototype uses its own neutral navy system and a gold highlight.

## Source-derived typography

- Newsreader: display and editorial headings
- Archivo: Latin body and interface text
- Noto Kufi Arabic: Arabic body, interface, and display text

The prototype Google Fonts links are not migrated. Next.js `next/font` performs
the production loading and self-hosting behavior.

## Asset verification

- marks: 285 × 274 PNG
- full Group logo: 768 × 290 PNG
- transparent backgrounds retained
- exact uploaded files copied into `public/brands`

## Runtime exclusions

The frontend does not ship or depend on:

- `.dc.html`
- `support.js`
- `deck-stage.js`
- `image-slot.js`
- `DCLogic`
- `<x-dc>`
- `<dc-import>`
- `<sc-for>`
- `<sc-if>`
- `style-hover`
- prototype interpolation syntax
