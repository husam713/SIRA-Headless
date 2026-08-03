# Step 2C — Brand and design-token system

## Objective

Connect the trusted site key to the curated `siraBrand` GraphQL field, render
the active brand variables on the server, and align the normalized semantic
tokens, typography, and local fallback assets with the approved SIRA designs.

## Scope retained

This stage does not build the header, hero, project cards, newsroom, footer, or
page-section component library. The existing Step 2 scaffold only demonstrates
that the infrastructure resolves and applies a brand.

## WordPress-owned identity contract

- `--brand-primary`
- `--brand-secondary`
- `--brand-accent`
- `--brand-paper`
- `--brand-ink`

Only six-digit hexadecimal values from the public `siraBrand` query are
accepted.

## Frontend-owned semantic contract

Required:

- `--brand-accent-bright`
- `--brand-on-accent`
- `--brand-paper-glass`
- `--brand-ink-soft`
- `--brand-ink-faint`
- `--brand-deep`
- `--brand-deep-card`
- `--brand-footer`
- `--brand-tint`
- `--brand-border`
- `--brand-shadow`

Additional design-source tokens:

- `--brand-on-accent-border`
- `--brand-deep-border`
- `--brand-hero-overlay-top`
- `--brand-hero-overlay-middle`
- `--brand-hero-overlay-bottom`

Editors do not manage these semantic values.

`--brand-on-accent` first evaluates the active paper and ink colors. If
neither reaches 4.5:1 against the active accent, the resolver uses whichever
of black or white has the stronger contrast. All other semantic tokens use the
approved Group or branch preset.

## Font contract

Lower-level `next/font` variables:

- `--font-newsreader`
- `--font-archivo`
- `--font-noto-kufi-arabic`

Semantic frontend variables:

- `--font-sira-display`
- `--font-sira-body`
- `--font-sira-interface`

English uses Newsreader for display and Archivo for body/interface. Arabic uses
Noto Kufi Arabic for all three semantic roles.

## Fallback asset map

- Group: `/brands/group/mark.png`
- Group full logo: `/brands/group/logo.png`
- Consulting: `/brands/consulting/mark.png`
- Healthcare: `/brands/healthcare/mark.png`
- Lifestyle: `/brands/lifestyle/mark.png`
- Real Estate: `/brands/realestate/mark.png`
- Dark-surface mark: `/brands/shared/mark-white.png`

## Failure behavior

- WordPress unavailable: site-specific fallback preset
- brand key mismatch: fail closed to requested site preset
- invalid color: replace only that color with the requested site preset
- invalid or non-HTTPS remote media: ignore it and retain local fallback
- diagnostics: safe identifiers only

## Deferred deliberately

- complete header and navigation
- hero and carousel behavior
- project and newsroom cards
- footer composition
- remote WordPress image allowlisting and `next/image`
- Arabic route and translation data model
- component-level color contrast audits
- banners and emergency interaction behavior
- animation and grain treatment
- forms
