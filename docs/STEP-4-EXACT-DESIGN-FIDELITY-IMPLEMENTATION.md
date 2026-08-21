# SIRA — Exact Design Fidelity Production Implementation

## Step 4 Master Implementation Charter

**Role:** Durable design and implementation governance for separately
authorized Step 4 increments.

This charter defines how future Step 4 work must be designed, implemented,
validated, and reviewed. It does not record implementation completion and does
not itself authorize application code, WordPress, staging, deployment, DNS,
production cutover, or merge operations.

Current gate at the canonical baseline
`main@54b301f64687e59aa01dbe2695aaed6ce45db4c9`:

- Step 3D.1: OWNER ACCEPTED / MERGED;
- Step 3D.2: NOT STARTED;
- Step 3D.3: GATED by unresolved `2C4-B09`;
- `PREVIEW-AUTH-001`: DEFERRED;
- Step 4 scope discovery: COMPLETE;
- Homepage Production Data Contract Expansion: OWNER ACCEPTED / MERGED via
  PR `#28`;
- `2C4-B01`: CLOSED only to the extent proven by accepted PR `#28`;
- Step 4 visual implementation: NOT STARTED;
- Shared Production Shell: NOT STARTED;
- `GroupHomepage` visual composition: NOT STARTED;
- `BranchHomepage` visual composition: NOT STARTED;
- `NewsroomPage` route implementation: NOT STARTED;
- `2C4-B07` media-origin policy: UNRESOLVED;
- `2C4-B08` forms architecture: UNRESOLVED;
- `2C4-B09` multilingual architecture: UNRESOLVED;
- external Group staging: NOT PROVISIONED / NOT AUTHORIZED;
- production cutover: NOT AUTHORIZED.

Future Step 4 PRs may cite this file as their governing charter, but every
increment still requires its own explicit scope and owner authorization.

You are continuing the existing SIRA Headless Platform from the current
repository-authoritative state.

This is NOT a redesign project.

The owner has explicitly approved the supplied SIRA `.dc.html` design set as
the **canonical visual and interaction reference** for the production frontend.

Your objective is to reproduce the approved design with the highest practical
visual fidelity while implementing it natively inside the existing production
Next.js architecture.

========================================================
1. PRIMARY DESIGN DECISION
========================================================

The supplied design must be treated as:

VISUAL SOURCE OF TRUTH
+
INTERACTION SOURCE OF TRUTH

but NOT:

PRODUCTION RUNTIME SOURCE.

The goal is:

APPROVED .dc DESIGN
→ native React / Next.js implementation
→ real WPGraphQL data
→ current SIRA tokens/contracts
→ production-quality frontend

Do not redesign the site merely because another implementation would be
simpler.

Do not substitute a generic corporate template.

Do not modernize, simplify, restyle, or reinterpret the approved interface
without explicit owner approval.

Target the closest practical visual reproduction.

========================================================
2. APPROVED DESIGN SOURCES
========================================================

Inspect the repository and locate the canonical copies of:

- `SIRA Group Homepage.dc.html`
- `Sira Branch.dc.html`
- `Sira Consulting.dc.html`
- `Sira Healthcare.dc.html`
- `Sira Lifestyle.dc.html`
- `Sira Real Estate.dc.html`
- `Sira News.dc.html`

The selector files:

- Consulting
- Healthcare
- Lifestyle
- Real Estate

must remain conceptually one shared branch design.

Also inspect any design reference assets required to understand the intended
appearance.

Do not ask the owner to re-upload files already present and readable.

Before implementation, verify the files/hashes against the existing
Step 2C.4 design audit.

========================================================
3. PROTOTYPE RUNTIME MUST NOT ENTER PRODUCTION
========================================================

The following are prototype implementation mechanisms only:

- `.dc.html`
- `<x-dc>`
- `<dc-import>`
- `<x-import>`
- `<sc-for>`
- `<sc-if>`
- `DCLogic`
- `support.js`
- `image-slot.js`
- `deck-stage.js`
- `style-hover`
- template interpolation such as `{{ ... }}`

Do NOT ship or reproduce these dependencies in the production frontend.

Translate their visible behavior into native production architecture.

For example:

`sc-for`
→ typed React rendering over WPGraphQL data.

`sc-if`
→ normal typed conditional rendering.

`style-hover`
→ Tailwind/CSS hover/focus states.

`DCLogic`
→ Server Component data composition or the smallest necessary Client
Component.

`image-slot`
→ real approved WordPress media using the established Next.js image
architecture.

========================================================
4. NO ARCHITECTURE REGRESSION
========================================================

Preserve the existing approved SIRA architecture:

- WordPress Multisite remains the CMS.
- `sira-core` remains the backend business/content plugin.
- WPGraphQL remains the content API.
- one Next.js App Router application serves all SIRA sites.
- current hostname/site registry remains authoritative.
- current generated GraphQL contracts remain authoritative.
- current cache/revalidation architecture remains authoritative.
- Server Components remain the default.
- Client Components must be limited to genuine browser interaction.
- branch tenants remain independent.
- Group may remain a schema structural superset where already approved.
- native WPGraphQL navigation remains the navigation contract.
- native editorial content connections remain the editorial contract.
- do not create `siraNavigation`.
- do not create `siraEditorialFeed`.
- do not create a parallel CMS schema merely to match prototype arrays.

========================================================
5. THREE PRIMARY PAGE SYSTEMS
========================================================

When separately authorized, implement the approved design as three main
reusable production systems. The systems below are target architecture, not a
claim that their production implementations already exist.

--------------------------------------------------------
A. GROUP HOMEPAGE
--------------------------------------------------------

Route:

Group `/`

Production orchestrator:

`GroupHomepage`

Reproduce the approved design order:

1. emergency / announcement banner stack where active;
2. sticky Group header;
3. Group hero carousel;
4. hero/project ticker;
5. latest updates;
6. companies portfolio;
7. about / metrics;
8. investor section;
9. services;
10. projects;
11. insights;
12. testimonials;
13. partners;
14. contact;
15. Group footer.

Do not remove an approved section merely because current CMS content is
missing.

Use the established empty-state/content-readiness policy instead.

--------------------------------------------------------
B. SHARED BRANCH HOMEPAGE
--------------------------------------------------------

Use ONE shared:

`BranchHomepage`

for:

- Consulting
- Healthcare
- Lifestyle
- Real Estate

Do NOT create four separate React component trees.

The trusted site key may select:

- brand tokens;
- WordPress tenant;
- content;
- media;
- navigation;
- metadata.

It must NOT select an entirely separate implementation.

Reproduce the approved branch design:

1. banner stack;
2. sticky branch header;
3. static full-width hero;
4. branch statistics bar;
5. overview / focus areas;
6. projects;
7. insights;
8. contact;
9. branch footer.

Preserve the visual distinctions between brands through the approved SIRA
brand tokens.

--------------------------------------------------------
C. SHARED NEWSROOM
--------------------------------------------------------

Use one:

`NewsroomPage`

Reproduce:

- newsroom heading;
- Business Unit/site filters;
- optional featured article;
- article grid;
- branch color indicators;
- pagination;
- empty state;
- shared site shell/footer.

Use the accepted native editorial GraphQL architecture instead of the
hardcoded prototype article array.

========================================================
6. VISUAL FIDELITY REQUIREMENT
========================================================

The target is HIGH FIDELITY.

Preserve where technically and accessibility-safe:

- overall composition;
- section order;
- visual hierarchy;
- proportions;
- whitespace;
- max widths;
- grid relationships;
- typography scale;
- line height;
- letter spacing;
- accent lines;
- borders;
- cards;
- overlays;
- gradients;
- dark/light section rhythm;
- image aspect ratios;
- button dimensions;
- sticky header behavior;
- hero proportions;
- hero overlay strength;
- responsive scaling;
- hover states;
- entrance motion;
- section transitions;
- brand-colored accents.

Do not approximate with generic Tailwind component-library defaults.

Do not replace the design with shadcn-style generic cards/buttons unless the
result is visually indistinguishable from the approved design.

========================================================
7. TYPOGRAPHY
========================================================

The approved prototype visibly uses:

- `Newsreader` for editorial/display typography;
- `Archivo` for interface/body typography;
- Arabic-compatible typography where required by the current project
  architecture.

Inspect the repository's current approved typography/token implementation
before changing font loading.

Preserve the intended:

- serif display hierarchy;
- italic emphasis in hero headings;
- uppercase tracked labels;
- restrained sans-serif body/interface copy.

Do not load duplicate font systems if equivalent approved infrastructure
already exists.

========================================================
8. COLORS / TOKENS
========================================================

Do not hardcode prototype brand colors throughout components.

Map the approved visual values to the existing SIRA design-token architecture.

Components must consume stable tokens such as the project's approved
equivalents of:

- brand primary;
- brand secondary;
- brand accent;
- paper;
- ink;
- muted ink;
- borders;
- deep backgrounds;
- contrast text.

If an exact prototype color has no approved token:

1. identify it;
2. determine whether it is a neutral visual-system token or a brand token;
3. propose the smallest token addition;
4. do not create a second design system.

========================================================
9. GROUP HERO
========================================================

Reproduce the approved Group hero experience closely.

Include, where supported by approved data:

- full-bleed imagery;
- dark gradient overlay;
- large editorial heading;
- italic highlighted phrase;
- project/brand label;
- slide index;
- featured slide rail;
- previous/next controls;
- timed progress;
- supporting text;
- CTA treatment;
- ticker;
- entrance animations.

The production hero must also support:

- keyboard operation;
- touch/swipe where appropriate;
- pause on user interaction;
- reduced motion;
- accessible control labels;
- no autoplay behavior that violates accessibility requirements.

Use a Server Component wrapper and the smallest practical Client Component for
carousel controls.

========================================================
10. RESPONSIVE FIDELITY
========================================================

The prototype's fluid sizing intent must be preserved.

Validate at minimum:

- wide desktop;
- desktop;
- laptop;
- tablet;
- mobile landscape;
- mobile portrait.

Do not mechanically copy prototype JavaScript width checks.

Translate them into production responsive layout behavior.

Avoid horizontal overflow.

Preserve content hierarchy rather than merely shrinking desktop layout.

========================================================
11. RTL / ARABIC
========================================================

Preserve the visual design in both:

- English LTR;
- Arabic RTL.

Use logical CSS properties.

Mirror only direction-sensitive layout behavior.

Do not mirror:

- logos;
- photographs;
- non-directional decorative assets.

Validate:

- hero;
- navigation;
- cards;
- arrows;
- tickers;
- statistics;
- filters;
- forms;
- footer.

Use the approved project locale/RTL architecture rather than prototype-only
toggle logic once the multilingual ownership and route model is resolved.

These are future implementation and validation requirements, not a claim that
Arabic routes already exist. `2C4-B09` remains unresolved: do not invent
`/ar/`, `/en/`, locale parameters, translated records, canonical alternates,
or `hreflang` activation under this charter alone.

========================================================
12. MOTION
========================================================

Reproduce the character of the approved motion:

- rise/fade entrances;
- subtle hero image zoom;
- card lift;
- controlled hover transitions;
- carousel transitions;
- ticker movement.

Do not copy prototype animation code blindly.

Respect:

`prefers-reduced-motion`.

Reduced-motion mode must remain visually complete and usable.

========================================================
13. CONTENT OWNERSHIP
========================================================

Prototype text/arrays are NOT automatically production content.

Do not hardcode prototype:

- projects;
- companies;
- news;
- statistics;
- investor metrics;
- testimonials;
- partner records;
- branch copy

unless repository evidence explicitly identifies them as approved static
interface content.

Production editorial data must come from the established WordPress/WPGraphQL
contracts.

If a design section has no approved CMS data:

do not invent it.

Use the project's approved content-readiness / empty-section behavior and
report the gap.

========================================================
14. MEDIA
========================================================

Replace `image-slot` placeholders with the established WordPress media
architecture.

This does not approve a production remote-media origin or `next/image`
allowlist. `2C4-B07` remains a separate blocking media delivery/origin policy
decision. Preserve the data/media boundary without guessing remote origins.

Do not reuse placeholder photos as production assets merely because they
appear in the prototype.

For every major image classify:

- approved production asset;
- existing WordPress media;
- design-reference-only asset;
- missing / owner selection required.

Maintain:

- crop intent;
- aspect ratio;
- subject framing;
- responsive sizes;
- alt text;
- LCP treatment.

========================================================
15. FORMS
========================================================

The visual appearance of contact/investor forms should match the approved
design.

The prototype form implementation is NOT the production form architecture.

Functional submission may use only a secure headless forms architecture after
that architecture is explicitly approved. `2C4-B08` remains unresolved; this
charter does not select a provider, endpoint, storage model, retention policy,
consent workflow, or abuse-protection design.

If the production forms backend is not ready:

implement the visual boundary only if the current stage permits it, and keep
submission disabled/blocked according to repository state.

Never simulate a successful production submission.

========================================================
16. ACCESSIBILITY OVERRIDES VISUAL COPYING WHEN NECESSARY
========================================================

Target WCAG 2.2 AA.

Preserve appearance while correcting prototype limitations such as:

- focus visibility;
- keyboard navigation;
- semantic headings;
- button/link semantics;
- mobile navigation;
- carousel controls;
- form labels;
- reduced motion;
- contrast;
- accessible status announcements.

If exact prototype behavior conflicts with accessibility:

preserve visual fidelity but use the accessible production behavior.

Document the deviation.

========================================================
17. SEO / PREVIEW / DISCOVERY
========================================================

Preserve all accepted Step 3 architecture.

At the charter baseline, Step 3D.1 is owner accepted and merged, Step 3D.2 has
not started, Step 3D.3 remains gated by `2C4-B09`, and
`PREVIEW-AUTH-001` remains deferred. Preserve implemented Step 3 behavior, but
do not treat unfinished Step 3 work as complete or reopen deferred preview
authentication work through a visual implementation increment.

The visual implementation must not regress:

- metadata;
- canonical URLs;
- robots behavior;
- staging noindex;
- preview;
- Draft Mode;
- JSON-LD ownership;
- sitemaps;
- redirects;
- hostname security.

Design implementation may consume these systems but must not replace them.

========================================================
18. GROUP STAGING-FIRST RULE
========================================================

The production-quality Group implementation must first target the approved
Group staging workflow.

Until a real hostname is owner-confirmed, use only:

`GROUP_STAGING_HOST`

Never invent a staging hostname.

The desired model remains:

same Next.js code
+
same accepted Git commit
+
environment-specific hostname/configuration.

Do not create a staging-only React fork.

Do not change DNS or production routing.

External staging provisioning remains separately authorized and is not
granted by this charter.

========================================================
19. VISUAL COMPARISON / ACCEPTANCE
========================================================

For every implemented page/major section:

render the production implementation at controlled viewport sizes and compare
it against the approved design reference.

Where tooling permits, create visual-regression evidence.

Classify differences as:

MATCHED
INTENTIONAL_ACCESSIBILITY_DEVIATION
CMS_CONTENT_DIFFERENCE
MEDIA_DIFFERENCE
RESPONSIVE_INTERPRETATION
BUG

Do not label a design as visually accepted while unexplained differences
remain.

Prioritize visual fidelity in:

1. typography;
2. spacing;
3. layout;
4. section proportions;
5. colors;
6. imagery/crop;
7. interaction;
8. motion.

========================================================
20. IMPLEMENTATION SEQUENCE
========================================================

Do NOT build the whole site in one uncontrolled change.

Use this sequence:

A. Design-source verification + visual fidelity specification

B. Shared design primitives/tokens if genuinely required

C. Shared shell/header/navigation/footer

D. Group hero

E. Remaining Group homepage sections

F. Shared BranchHomepage

G. Healthcare variant validation

H. Consulting variant validation

I. Lifestyle variant validation

J. Real Estate variant validation

K. Shared NewsroomPage

L. Responsive QA

M. RTL QA

N. Accessibility QA

O. visual regression/fidelity acceptance

Each meaningful increment must use:

branch
→ implementation
→ focused tests
→ regression
→ lint
→ typecheck
→ build
→ visual review
→ Draft PR
→ exact-head CI
→ owner gate.

Do not merge automatically.

========================================================
21. FIRST TASK WHEN THIS PROMPT IS ACTIVATED
========================================================

Do NOT immediately write the whole frontend.

First:

1. reconstruct current project state from the repository;
2. verify the accepted Step 3 portions and unresolved gates, then verify that
   the specific proposed Step 4 increment is explicitly authorized;
3. locate and hash the approved design references;
4. compare them against the existing Step 2C.4 design audit;
5. inspect the current production frontend components;
6. identify which approved visual patterns already exist;
7. identify exact design gaps;
8. produce a visual-fidelity implementation matrix.

For each section return:

DESIGN SOURCE

PRODUCTION COMPONENT

SERVER / CLIENT

DATA SOURCE

TOKEN SOURCE

MEDIA SOURCE

INTERACTIONS

RESPONSIVE RULE

RTL RULE

ACCESSIBILITY ADJUSTMENT

CURRENT STATUS

IMPLEMENTATION GAP

Then propose the smallest first implementation increment.

If the specific Step 4 increment is not yet authorized:

STOP after the fidelity plan.

Do not implement prematurely.

========================================================
22. PROTECTED ACTIONS
========================================================

Do not:

- modify production WordPress;
- execute Step 2C.5C;
- authorize Batch A;
- modify DNS;
- provision external staging without owner approval;
- deploy production;
- destroy legacy Group;
- merge into main without owner approval.

========================================================
23. FINAL GOAL
========================================================

A user comparing the approved design reference with the finished production
site should perceive them as the **same SIRA design system and page design**,
not as a reinterpretation.

Differences should exist only when required by:

- real CMS content;
- real production media;
- responsive adaptation;
- accessibility;
- security;
- SEO;
- production architecture.

All such deviations must be deliberate and documented.
