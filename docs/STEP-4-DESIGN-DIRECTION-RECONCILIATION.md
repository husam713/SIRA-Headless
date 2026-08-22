# Step 4 — Design Direction Reconciliation

**Status:** PROPOSED — owner review required before merge.

**Branch:** `docs/step-4-editorial-architecture-reconciliation`

**Audited baseline:** `main@e522c6c58cd57e2a757652adb740c9d1f154c81c`

## Purpose

This document records the reconciliation between the already-approved Step 4 Exact Design Fidelity Charter and the later architecture-aware 2026 design study.

The goal is to prevent avoidable presentation-layer rework before broad Step 4 visual implementation begins.

## Decision under review

The recommended outcome is:

**REVISE STEP 4 BEFORE IMPLEMENTATION.**

This is not a backend, API, framework, or deployment redesign.

The `.dc.html` references remain the primary SIRA design-DNA and interaction references, while the production art direction is elevated through the separately proposed `docs/SIRA-EDITORIAL-ARCHITECTURE-SPEC.md`.

## Why revision is needed

The current Step 4 charter correctly protects the project from generic redesign drift, but it also states that the `.dc.html` design set is the canonical visual/interaction source and prohibits modernizing, simplifying, restyling, or reinterpreting it without explicit owner approval.

That rule became stricter than the original Step 2C.4 framing, which treated the `.dc.html` sources as visual and interaction references whose runtime mechanisms were not production dependencies.

The later design audit found that the approved reference set is already strong in editorial typography, premium tonal rhythm, whitespace, image-led heroes, brand differentiation, and modular branch architecture. The largest remaining opportunity is stronger architectural composition: reusable master grids, Subgrid alignment, more intentional asymmetry, richer section-to-section rhythm, and less dependence on repeated equal-card `auto-fit` layouts.

Because Step 4 visual implementation is still not broadly implemented, this is the lowest-risk point to reconcile the charter.

## What remains locked

This proposed reconciliation does not reopen the following decisions:

- WordPress Multisite remains the CMS;
- `sira-core` remains backend content/business architecture;
- WPGraphQL remains the primary frontend API;
- one Next.js App Router application serves all SIRA tenants;
- allowlisted hostname/site resolution remains authoritative;
- GraphQL Codegen/generated contracts remain authoritative;
- Server Components remain the default;
- Client Components remain interaction-specific;
- Consulting remains the canonical branch GraphQL schema peer baseline;
- Group may remain a structural schema superset;
- native WPGraphQL menus remain the navigation contract;
- native content connections remain the editorial contract;
- no `siraNavigation` or `siraEditorialFeed` parallel API is introduced;
- one shared `BranchHomepage` architecture serves Consulting, Healthcare, Lifestyle, and Real Estate;
- tenant isolation, cache/revalidation, preview, SEO, and production authorization boundaries remain intact;
- `.dc.html` runtime helpers remain forbidden from production.

## Visual governance change

If this reconciliation is accepted, the effective visual priority becomes:

1. approved SIRA design DNA;
2. `SIRA-EDITORIAL-ARCHITECTURE-SPEC.md`;
3. approved content hierarchy/data contracts;
4. accessibility and responsive behavior;
5. `.dc.html` reference-level fidelity where it does not conflict with the new specification.

The `.dc.html` references continue to protect against generic UI drift, but an intentional composition change that follows the Editorial Architecture specification is no longer automatically classified as a visual regression.

## Design direction

The proposed production direction is:

**Editorial Fluidity + Architectural Modernism + Adaptive Modular Components + Modern Web Platform First.**

This preserves the strongest existing DNA:

- Newsreader editorial display typography;
- Archivo interface/body typography;
- Noto Kufi Arabic baseline;
- warm paper/deep navy rhythm;
- Group gold and approved branch hues;
- large image-led heroes;
- italic editorial emphasis;
- thin rules and restrained geometry;
- compact uppercase metadata;
- generous whitespace;
- premium restrained motion.

The main enhancement is stronger composition, not a new brand identity.

## Modern Web Platform policy

The proposed design specification separates technology into four layers:

- **Layer A — Production foundation:** semantic HTML, Grid, Flexbox, Subgrid, size container queries, custom properties, logical properties, fluid CSS, RSC/server-first rendering.
- **Layer B — Modern production capabilities:** Popover, `<dialog>`, scoped `:has()`, Anchor Positioning, `@starting-style`, `color-mix()`, selective `content-visibility`.
- **Layer C — Progressive premium enhancement:** View Transitions, scroll-driven animation, Grid-Lanes/native Masonry, Speculation Rules, and newer evolving platform capabilities.
- **Layer D — Special case only:** WebGL, Three.js, Canvas-primary UI, persistent 3D, scroll hijacking, custom cursors, continuous heavy effects.

Layer C must never be required for navigation, comprehension, accessibility, forms, or core CTA behavior.

## Reference verification

The supplied Step 4 design ZIP was independently checked against the approved Step 2C.4 reference hashes. The seven design references match the recorded approved hashes exactly.

This means the decision is being made against the approved design set, not a modified or substitute copy.

## Existing implementation compatibility

The current repository already supports much of the target direction:

- Next.js 16 / React 19 server-first architecture;
- WordPress-driven brand identity mapped into frontend semantic CSS variables;
- Newsreader / Archivo / Noto Kufi Arabic via `next/font`;
- fluid `clamp()` spacing/type foundations;
- `text-wrap: balance` and `text-wrap: pretty`;
- reduced-motion handling;
- RTL direction support;
- typed Group/Branch homepage domain contracts;
- native navigation contract;
- server-only cached GraphQL transport.

No framework migration is justified by the art-direction change.

## Rework risk if reconciliation is delayed

Beginning broad exact-fidelity UI implementation before this decision is accepted creates medium-high presentation rework risk, especially in:

- master-grid/layout primitives;
- repetitive card systems;
- Group hero composition;
- Branch section composition;
- Newsroom layout;
- responsive behavior;
- navigation presentation;
- motion implementation.

GraphQL, backend, tenant, caching, SEO, and core data-contract work have low rework risk and remain reusable.

## Required next gate

If owner accepts this reconciliation:

1. merge this documentation-only PR;
2. treat `SIRA-EDITORIAL-ARCHITECTURE-SPEC.md` as the art-direction target for future authorized Step 4 increments;
3. create a separately authorized prototype increment covering only:
   - production shell/header/navigation;
   - Group hero plus one following editorial section;
   - one representative Branch or Newsroom composition;
4. validate mobile/tablet/desktop, keyboard, reduced motion, and RTL sample rendering;
5. obtain owner visual acceptance before broad reusable component implementation.

If owner rejects this reconciliation, the existing Exact Design Fidelity Charter remains authoritative and Step 4 should proceed against the `.dc.html` references without reinterpretation.

## Unresolved gates

This reconciliation does not resolve or authorize:

- `2C4-B07` media origin/delivery;
- `2C4-B08` forms architecture;
- `2C4-B09` multilingual ownership/route model;
- `PREVIEW-AUTH-001`;
- external Group staging;
- production deployment/cutover.

These retain their existing ownership and gating semantics.

## Durable-state warning

At the audited baseline, `project-state.json`, `docs/PROJECT-STATE.md`, and parts of `docs/SOURCE-OF-TRUTH.md` still describe an older Step 2C.5B governed baseline even though `main` has progressed through later accepted Step 3/Step 4 documentation and data-contract work.

This documentation drift should be reconciled in a dedicated state-reconciliation increment before broad Step 4 application-code changes. This proposal does not silently rewrite historical acceptance records.

## Proposed final decision

**Preserve the approved `.dc` design DNA and all existing SIRA application architecture, but replace exact pixel/composition fidelity as the governing visual objective with controlled fidelity to the approved SIRA Editorial Architecture specification.**
