# SIRA Editorial Architecture

## Step 4 Art-Direction and Modern Web Platform Specification

**Status:** PROPOSED — requires owner acceptance and merge before it governs production UI implementation.

**Scope:** Presentation architecture only. This specification does not authorize WordPress mutation, backend changes, production deployment, DNS changes, staging provisioning, media-origin changes, multilingual routing, form submission architecture, or protected-branch merge.

**Repository baseline audited:** `main@e522c6c58cd57e2a757652adb740c9d1f154c81c`.

## 1. Design decision

The production visual direction is:

**Editorial Fluidity + Architectural Modernism + Adaptive Modular Components + Modern Web Platform First.**

The approved `.dc.html` design set remains the primary source of SIRA design DNA and interaction intent, but it is not an immutable pixel-level runtime blueprint. Production implementation may evolve composition where this specification explicitly permits it, while preserving the recognizable SIRA visual language.

The target is not a generic redesign. It is a controlled elevation of the approved SIRA design system.

## 2. Design-source provenance

The following approved references were re-verified against the Step 2C.4 audit:

| Reference | SHA-256 |
| --- | --- |
| `SIRA Group Homepage.dc.html` | `90d6b8268dc86a6f294d2d6ec4611a7712147b8c8d8915d37a593e6102c7b5df` |
| `Sira Branch.dc.html` | `f6f2b2ef2c10afbf230fc08ac635d4cb6aeb1585128cdfe4ada1999556b88bf4` |
| `Sira Consulting.dc.html` | `90c980f8d122624e4ad1806ccb526da1b1b76621989f6f2839fd603494716e6c` |
| `Sira Healthcare.dc.html` | `ea6d964ccb62038d3f2464cf18648f57c88ef02c891aa218f9d9ad4904ca036f` |
| `Sira Lifestyle.dc.html` | `670c2acd20ce0e54b1694f0e3c5d40242f179464b9f80d6114c9d98dc74181b0` |
| `Sira Real Estate.dc.html` | `67f552700ae741168dacaac60ee34e30245db4cb31f79fdf3d0e2a4584af2078` |
| `Sira News.dc.html` | `c49e5423f5921f85802a3df0012b5ef83e89fc0bc0f4acdfde84347d4aacc375` |

The `.dc.html` runtime and prototype helpers remain reference-only and must not enter production.

## 3. SIRA design DNA that must be preserved

Production UI must preserve the strongest approved characteristics:

- Newsreader as the Latin editorial/display voice;
- Archivo as the Latin body/interface voice;
- Noto Kufi Arabic as the Arabic body/interface/display baseline unless a later approved typography decision supersedes it;
- editorial serif headlines with selective italic emphasis;
- compact uppercase/tracked metadata and eyebrows;
- warm paper surfaces;
- deep navy/dark chapters;
- Group gold accent and branch-specific approved brand hues;
- thin rules and restrained borders;
- large, image-led heroes;
- cinematic but legible image overlays;
- strong whitespace and section breathing room;
- restrained radii and shadows;
- alternating light/dark rhythm;
- premium, quiet interaction rather than decorative motion overload.

Do not replace these with generic component-library defaults.

## 4. Architectural Modernism upgrade

The main visual enhancement over the prototype is stronger spatial architecture.

Production pages should use an explicit reusable page grid rather than relying mainly on repeated `auto-fit` card grids.

The design system should define:

- a reusable page container;
- a desktop master grid suitable for 12-column composition;
- section grids that can inherit or align to the master grid;
- Subgrid where it materially improves alignment;
- reading-width constraints for editorial copy;
- full-bleed and edge-bleed media rules;
- intentional asymmetry;
- controlled overlap only where it remains readable and responsive;
- modular composition rules for cards, lists, media fields, metrics, quotes, and feature stories.

A repeated `heading -> equal cards -> heading -> equal cards` rhythm is not the default production grammar.

## 5. Editorial Fluidity rules

Editorial expression should come from hierarchy and composition rather than heavy scripting.

Use:

- fluid typography with `clamp()`;
- large display scale where content supports it;
- image/copy counterpoint;
- varied section proportions;
- controlled whitespace;
- selective italic emphasis;
- strong pull quotes/testimonial treatment;
- editorial metadata and reading rhythm;
- light/dark chapter changes;
- image crops that are art-directed rather than mechanically uniform.

Do not use expressive typography as an excuse for poor readability, inaccessible contrast, or unstable layout.

## 6. Adaptive Modular component policy

There remains one shared `BranchHomepage` production architecture for Consulting, Healthcare, Lifestyle, and Real Estate.

A branch may vary through:

- approved brand tokens;
- content;
- media;
- container-aware composition;
- approved component variants;
- density and image emphasis where the same domain contract supports it.

A branch must not vary through four independent React trees or site-key-specific hardcoded page implementations.

The goal is one system with stronger vertical personality, not four separate websites.

## 7. Page-system direction

### Group homepage

Preserve the approved content hierarchy and data contract. The visual composition may be elevated through stronger grid relationships, editorial scaling, richer image fields, and more varied section composition.

The hero remains premium, image-led, and editorial. Carousel behavior is allowed only when justified by real content and accessibility requirements. Autoplay must not become a prerequisite for understanding the page.

### Branch homepage

Preserve the shared branch content sequence and one-system architecture. Strengthen vertical personality through layout treatment, image art direction, and typography rather than duplicate code.

### Newsroom

Preserve the large editorial masthead, filtering model, featured-story concept, article/archive system, metadata, and branch color signals. Evolve the layout away from a purely repetitive equal-card grid when content density and viewport size support a stronger editorial composition.

## 8. Typography

The existing production font infrastructure should be reused unless a separately approved typography decision changes it.

Rules:

- display headings: Newsreader for Latin;
- body/interface: Archivo for Latin;
- Arabic baseline: Noto Kufi Arabic;
- use `text-wrap: balance` for display headings where appropriate;
- use `text-wrap: pretty` selectively for editorial/body copy;
- avoid arbitrary letter-spacing on Arabic text;
- test Arabic shaping, punctuation, mixed-script strings, numerals, and headline wrapping on real content.

RTL-safe layout does not by itself guarantee good Arabic typography.

## 9. Color and semantic-token policy

WordPress continues to own canonical brand identity. The frontend continues to own semantic presentation tokens.

Accessibility-critical foreground/background combinations must be deterministic and pre-validated.

Do not use `contrast-color()` as the accessibility authority.

`color-mix()` may be used for non-critical derived tints, borders, hover surfaces, and decorative states where fallbacks and contrast remain safe.

## 10. Responsive and container-aware design

Responsive behavior must be art-directed rather than a simple desktop collapse.

Use mature platform capabilities first:

- Grid;
- Flexbox;
- Subgrid;
- size container queries;
- fluid sizing;
- logical properties;
- `aspect-ratio`;
- intrinsic layout.

Avoid JavaScript viewport-width checks for normal layout adaptation.

Validate at minimum:

- wide desktop;
- desktop/laptop;
- tablet;
- mobile landscape;
- mobile portrait;
- English LTR;
- Arabic RTL shell/content samples;
- reduced-motion mode.

## 11. Modern Web Platform policy

### Layer A — Production foundation

May define core architecture:

- semantic HTML;
- CSS Grid;
- Flexbox;
- Subgrid;
- size container queries;
- CSS custom properties;
- logical properties;
- `clamp()`, `min()`, `max()`, `minmax()`;
- `aspect-ratio`;
- variable-font capabilities where supported by the chosen font files;
- `text-wrap: balance`;
- native CSS nesting;
- cascade layers where they improve CSS governance;
- `prefers-reduced-motion`;
- Next.js App Router;
- React Server Components by default;
- the smallest necessary Client Components.

### Layer B — Modern production capabilities

Use selectively when semantics and browser support are appropriate:

- Popover API;
- `<dialog>`;
- scoped `:has()` selectors;
- `text-wrap: pretty`;
- CSS Anchor Positioning;
- `anchor-scope`;
- `@starting-style`;
- `transition-behavior`;
- `color-mix()`;
- `content-visibility` where measured and beneficial.

Layer B features must not replace correct semantic HTML.

### Layer C — Progressive premium enhancement

The page must remain complete and usable without these:

- View Transitions;
- scroll-driven animation;
- Grid-Lanes/native Masonry;
- Speculation Rules;
- emerging intrinsic-size animation capabilities;
- newer platform features whose support floor is still evolving.

Feature support must be re-checked against primary browser/framework documentation at implementation time.

### Layer D — Special case only

Require explicit design and engineering justification:

- WebGL;
- Three.js;
- Canvas-based primary UI;
- persistent 3D environments;
- physics systems;
- scroll hijacking;
- custom cursors;
- continuous GPU-heavy decorative effects.

These are not default SIRA design-system capabilities.

## 12. Motion

Motion should support hierarchy, continuity, and feedback.

Prefer:

1. mature CSS transitions;
2. native platform behavior;
3. a very small client interaction layer;
4. Layer C effects only as enhancement.

Core navigation, comprehension, forms, CTAs, and content discovery must not depend on animation.

Reduced-motion mode must remain visually complete.

## 13. Navigation and shell

Navigation remains backed by the accepted native WPGraphQL menu contract.

The production shell may use a refined sticky/transparent/overlay treatment where it remains readable and accessible.

If mega-menu or contextual overlay behavior is introduced, use semantic navigation first and native overlay/positioning capabilities where suitable before adding third-party UI infrastructure.

Do not fabricate missing menu assignments in React.

## 14. Accessibility

Target WCAG 2.2 AA.

Required principles include:

- semantic landmarks;
- correct heading hierarchy;
- keyboard-operable navigation and controls;
- visible focus;
- deterministic accessible color pairs;
- reduced-motion handling;
- labelled carousel controls if a carousel exists;
- accessible form labels and errors;
- no hover-only critical information;
- usable 320px layout floor;
- LTR and RTL testing.

Accessibility may override exact prototype behavior. Document intentional deviations.

## 15. Performance

Performance is measured, not assumed from technology choice.

Favor server-rendered editorial content and small client islands, but validate actual behavior through production builds, browser profiling, Lighthouse/field data when available, image/LCP checks, bundle analysis where necessary, and real-device testing.

Do not introduce a large animation or interaction dependency merely to reproduce decorative prototype behavior.

## 16. Media

The design may define art direction, aspect ratios, crops, focal behavior, and responsive sizes now.

`2C4-B07` still governs production remote-media origin/delivery authorization. Do not invent a remote-media allowlist or production image origin under this specification.

Use separate mobile imagery only where the existing data contract provides it or a later approved CMS change adds an evidence-backed need.

## 17. Forms

Visual form treatment may be designed and prototyped.

`2C4-B08` continues to block the final submission architecture. Do not select a provider, endpoint, storage model, retention policy, consent model, or abuse-protection strategy through visual implementation work.

## 18. Multilingual and RTL

The design system must be RTL-capable from the beginning.

`2C4-B09` continues to block final multilingual route ownership and `hreflang` activation. Do not invent locale routes or translated-record ownership.

Design/prototype work may and should validate Arabic/RTL rendering using representative non-authoritative sample content.

## 19. Visual acceptance

The `.dc` design set remains a comparison reference, but production acceptance is against this specification plus preserved SIRA design DNA.

Differences should be classified as:

- `DNA_PRESERVED_COMPOSITION_EVOLVED`;
- `MATCHED_REFERENCE`;
- `INTENTIONAL_ACCESSIBILITY_DEVIATION`;
- `CMS_CONTENT_DIFFERENCE`;
- `MEDIA_DIFFERENCE`;
- `RESPONSIVE_ART_DIRECTION`;
- `BUG`.

A composition change is not a bug merely because it differs from `.dc` when it follows this approved specification.

## 20. Prototype gate before broad Step 4 UI implementation

Before broad component/page implementation, create and review three focused browser-level prototypes:

1. production shell/header/navigation behavior;
2. Group hero plus one following editorial section;
3. one representative Branch or Newsroom editorial composition.

Prototype using the real production architecture where practical, but keep scope bounded and reversible.

Validate the three archetypes at mobile, tablet, desktop, RTL shell/content sample, keyboard navigation, and reduced motion.

Do not interpret prototype approval as production deployment authorization.

## 21. Architecture locks remain unchanged

This design specification does not reopen:

- WordPress Multisite;
- `sira-core` ownership;
- WPGraphQL;
- GraphQL Codegen;
- generated operation contracts;
- hostname/site registry;
- tenant isolation;
- published cache/revalidation architecture;
- Draft Mode/preview boundaries;
- Next.js App Router;
- Server Components by default;
- native WPGraphQL navigation;
- native editorial connections;
- one shared BranchHomepage architecture;
- Vercel deployment model;
- protected production operations.

## 22. Final design principle

**Preserve the approved SIRA identity. Strengthen its editorial hierarchy and architectural composition. Use the modern web platform as the default implementation medium. Add progressive effects only when they enhance rather than define the experience.**
