# SIRA Architecture Decision Register

This register consolidates durable decisions that should not be re-litigated by a new AI session without new evidence.

## ADR-001 — WordPress Multisite remains the editorial CMS

- **Status:** Approved
- **Reason:** Preserves site separation, editorial workflows, users, and content ownership.

## ADR-002 — `sira-core` owns backend content/business architecture

- **Status:** Approved
- **Reason:** Centralizes CPTs, taxonomies, structured fields, brand logic, privacy boundaries, and backend integrations.

## ADR-003 — WPGraphQL is the primary frontend API

- **Status:** Approved
- **Reason:** Provides a typed reusable API for the shared Next.js frontend.

## ADR-004 — One Next.js application serves all SIRA brands

- **Status:** Approved
- **Reason:** Avoids duplicated branch applications and keeps routing, data contracts, components, and deployment architecture shared.

## ADR-005 — Hostname resolution is allowlisted and site-aware

- **Status:** Approved
- **Reason:** Arbitrary Host input must never select WordPress endpoints or tenants.

## ADR-006 — Server Components are the default

- **Status:** Approved
- **Reason:** Keep WordPress credentials/server configuration out of browser code and minimize client JavaScript.

## ADR-007 — Bricks is not a production headless runtime dependency

- **Status:** Approved
- **Reason:** Presentation moves to Next.js; Bricks/legacy assets remain rollback/reference material until cutover acceptance.

## ADR-008 — WordPress owns identity data; frontend owns semantic presentation tokens

- **Status:** Approved
- **Reason:** Keeps canonical brand data editorial while avoiding CMS ownership of presentation semantics.

## ADR-009 — Consulting is the canonical branch GraphQL schema

- **Status:** Approved
- **Evidence:** Step 2C.3B live metadata records Consulting, Healthcare, Lifestyle, and Real Estate as exact schema peers with SHA-256 `32438736d4d73da267242d2ffe38a3e1c00844d10066d7bc098aad70bbf9f4f0`.

## ADR-010 — Group may remain a structural GraphQL superset

- **Status:** Approved
- **Evidence:** Group has a different live schema hash while remaining structurally compatible with the canonical branch contract.
- **Rule:** Group-only legacy fields/types must not enter shared branch operations.

## ADR-011 — The project ACF type is `ProjectDetails`

- **Status:** Approved
- **Rule:** Do not introduce `SiraProjectDetails`.

## ADR-012 — Use native WPGraphQL menus

- **Status:** Approved
- **Rule:** Do not create `RootQuery.siraNavigation`.
- **Reason:** Live schema already provides native menu support; missing configured menus are CMS readiness issues.

## ADR-013 — Use native WPGraphQL content connections for editorial feeds

- **Status:** Approved
- **Rule:** Do not create `RootQuery.siraEditorialFeed` unless a later evidence-backed ADR explicitly supersedes this.

## ADR-014 — Business Unit site mapping is explicit

- **Status:** Approved
- **Mapping:**
  - `group -> null`
  - `consulting -> consulting`
  - `healthcare -> healthcare`
  - `lifestyle -> lifestyle`
  - `realestate -> real-estate`
- **Rule:** Do not derive `real-estate` mechanically from `realestate`.

## ADR-015 — CMS readiness defects are fixed at their source

- **Status:** Approved
- **Rule:** Do not guess front pages, fabricate menus, or normalize incorrect CMS brand values in React simply to make the frontend appear complete.

## ADR-016 — Generated GraphQL types own frontend operation contracts after schema adoption

- **Status:** Approved
- **Flow:** canonical schema -> `.graphql` documents -> Codegen -> generated result/variable/document types -> runtime operation wrapper -> server adapter.
- **Rule:** Do not hand-edit generated GraphQL files or maintain duplicate handwritten query contracts unnecessarily.

## ADR-017 — Production design implementation remains gated

- **Status:** Approved
- **Sequence:** complete Step 2C.3C -> Step 2C.3D -> Step 2C.4 audit -> Step 3 -> Step 4 production components.

## ADR-018 — Production changes require explicit owner approval

- **Status:** Approved
- **Protected operations:** production deployment/cutover, destructive database changes, DNS, protected-branch merge policy changes, and production secret operations.

## ADR-019 — `main` is the canonical integration and default branch

- **Status:** Approved; supersedes `ADR-PENDING-001`.
- **Evidence:** G0-C established the GitHub default branch as `main`; repository governance records PR workflow, Frontend CI, and owner approval as compensating controls where plan-level branch protection is not enforced.
- **Rule:** Normal changes target `main` through Pull Requests and required CI. The engineering agent must not merge to `main` without explicit owner approval.

## ADR-020 — Production design uses three primary page systems

- **Status:** Approved through Step 2C.4 owner acceptance and PR `#14` merge.
- **Systems:** Group homepage, one reusable Branch Website System, and one reusable newsroom implementation.
- **Rule:** Consulting, Healthcare, Lifestyle, and Real Estate use one `BranchHomepage` component architecture and one data-contract shape, instantiated independently for four tenant websites. Each trusted site key resolves a distinct hostname, WordPress Multisite tenant, homepage record, menus, editorial content, projects, media, brand data, SEO/runtime state, and cache scope. It must not select duplicate component trees or hardcoded copy.
- **Evidence:** The four branch `.dc.html` files are selector-only wrappers around the same `Sira Branch` reference, and the canonical live schema exposes one reusable Branch homepage type without sharing tenant records.

## ADR-021 — Step 2C.4 reuses the existing canonical live data types

- **Status:** Approved through Step 2C.4 owner acceptance and PR `#14` merge.
- **Decision:** Expand generated frontend operations and adapters over the existing fixed `SiraHomepage`, native menus, native content connections, `ProjectDetails`, `CompanyDetails`, `InvestmentDetails`, `TestimonialDetails`, `PartnerDetails`, and typed banner contracts.
- **Rule:** Do not add `siraNavigation`, `siraEditorialFeed`, a flexible homepage builder, duplicate branch types, or site-key-specific GraphQL documents. If later evidence requires backend runtime work, SOT-001 must be reconciled first.

## ADR-022 — Approved `.dc.html` sources remain reference-only

- **Status:** Approved through Step 2C.4 owner acceptance and PR `#14` merge; reinforces ADR-007.
- **Rule:** Production must not ship or depend on `.dc.html`, `x-dc`, `dc-import`, `sc-for`, `sc-if`, `support.js`, `image-slot.js`, `deck-stage.js`, `DCLogic`, `style-hover`, or prototype template interpolation.
- **Reason:** Visual structure and interaction intent are portable; the prototype runtime is not a production headless dependency.

## ADR-023 — The Step 2C.4 CMS correction manifest is non-destructive and separately gated

- **Status:** Approved through Step 2C.4 owner acceptance and PR `#14` merge.
- **Rule:** Every manifest action remains `mutationAuthorized=false` until a fresh read-only preflight, recoverable export, named approval, and separately authorized execution window exist. Existing records are preserved; publication and technical validity do not establish launch authority.

## ADR-024 — Canonical public production domain topology

- **Status:** Approved by owner during Step 2C.4.
- **Decision:** The canonical public production apex is `siratrgroup.com`. Public site hostnames are `siratrgroup.com` for Group, `consulting.siratrgroup.com`, `healthcare.siratrgroup.com`, `lifestyle.siratrgroup.com`, and `realestate.siratrgroup.com`.
- **Scope:** This resolves canonical public domain selection and creates no new Step 2C.4 blocking gap. It does not establish a WordPress backend hostname, GraphQL endpoint hostname, media origin, staging hostname, Vercel preview hostname, cookie-domain policy, CORS policy, or revalidation origin; those require later repository or live configuration evidence.
- **Downstream rule:** Step 3 must use this public topology for canonical URL behavior while completing metadata, preview, `hreflang`, sitemap, redirect, and related SEO contracts. `2C4-B07` remains BLOCKING pending an approved media origin/delivery policy, and `2C4-B10` remains BLOCKING pending Step 3 implementation.

## ADR-028 — Step 4 art direction evolves through SIRA Editorial Architecture

- **Status:** Approved through explicit owner acceptance and merge of PR `#30` at `aaa88631c862d213f890d2991aa63fd26ce925e3`.
- **Previous candidate status:** Proposed on branch `docs/step-4-editorial-architecture-reconciliation` before owner acceptance and merge.
- **Decision:** Preserve the approved `.dc.html` design DNA and content/interaction intent while elevating production composition through `docs/SIRA-EDITORIAL-ARCHITECTURE-SPEC.md`: Editorial Fluidity + Architectural Modernism + Adaptive Modular Components + Modern Web Platform First.
- **Rule:** This ADR supersedes only conflicting visual-fidelity clauses that require immutable pixel/composition reproduction or prohibit all approved visual evolution. It does not supersede the Step 4 charter's architecture, data-contract, CMS ownership, accessibility, media, forms, SEO/preview, staging, validation, or production-authorization rules.
- **Branch invariant:** Consulting, Healthcare, Lifestyle, and Real Estate continue to use one shared `BranchHomepage` architecture; approved visual variation must occur through tokens, content, media, container-aware composition, and bounded component variants rather than duplicate React trees.
- **Platform policy:** Mature semantic HTML/CSS and native browser capabilities form the production foundation; evolving features such as View Transitions, scroll-driven animation, and Grid-Lanes/Masonry are progressive enhancement only; WebGL/Three.js/Canvas-primary UI and similarly heavy effects require explicit separate justification.
- **Reason:** The approved reference design is already strong, but the later audit identified material presentational gains from stronger master-grid architecture, Subgrid alignment, responsive art direction, and less repetitive equal-card composition. Broad Step 4 visual implementation has not yet started, making this the lowest-risk point for controlled reconciliation.

## ADR-029 — Step 4 responsive composition uses shared layout primitives

- **Status:** Proposed. Requires owner acceptance before the implementing increment proceeds.
- **Context:** An audit of `feat/step-4-shared-shell` at `ce5dbe6` found the Step 4 code is CSS-led and has a correct Server/Client boundary, but has no shared layout primitive. `max-w-[82.5rem]` is hand-rolled 17 times with three drift variants; `--layout-container`, `--layout-reading-width`, and `--space-section` are declared in `frontend/src/styles/globals.css` with zero consumers while a contract test asserts only that the strings exist; and `subgrid`, size container queries, and intrinsic grids (`auto-fit`/`minmax()`) have zero occurrences. Only two breakpoints (`sm:`, `lg:`) are in use, so the 1024-1320px band renders identically to 2560px.
- **Decision:** Introduce shared Server-Component layout primitives (`PageContainer`, `PageGrid`, `Section`, `Prose`, `CardRail`) over a small semantic CSS layer in `globals.css` that owns the master grid, Subgrid card rails, section rhythm, reading widths, and full-/edge-bleed rules. Sections consume the primitives instead of re-declaring containers and grids.
- **Rule:** Subgrid and size container queries are expressed in the CSS layer, not as Tailwind arbitrary values. Container queries are scoped to components that must adapt to their own width — card rails, and Branch sections reused inside differently sized Group and Branch contexts — and must not be applied blanket-wise; viewport media queries remain correct for page-level chapter changes. The structural tokens become load-bearing, and their contract test must assert consumption rather than declaration.
- **Constraint:** Layout adaptation remains CSS-led. The audit confirmed zero JavaScript viewport measurement (`matchMedia` is used only for `prefers-reduced-motion`); this must not regress. Server Components remain the default.
- **Reference:** `frontend/prototypes/step-4-art-direction/` is retained as NON-PRODUCTION reference evidence. It already demonstrates the 12/8/4-column master grid, real `grid-template-columns: subgrid`, fluid gutter and section tokens, and logical properties throughout, and satisfies the `docs/SIRA-EDITORIAL-ARCHITECTURE-SPEC.md` §20 prototype gate.
- **Reason:** ADR-028 §4 requires an explicit reusable page grid, Subgrid where it materially improves alignment, and reading-width and bleed rules, and rejects a repeated `heading -> equal cards` rhythm as the default grammar. §10 requires art-directed responsive behavior rather than a simple desktop collapse. The current implementation satisfies none of these structurally, and each additional section built on the present pattern increases the cost of the correction.
- **Sequencing:** The primitives land before further page work. Newsroom route work is deliberately sequenced after the responsive foundation and its viewport/RTL/reduced-motion validation, because §7 requires the Newsroom to evolve away from a purely repetitive equal-card grid.
- **Scope:** This decision governs presentation composition only. It does not reopen the architecture locks in `docs/SIRA-EDITORIAL-ARCHITECTURE-SPEC.md` §21, and it does not authorize production deployment, DNS, cutover, CMS mutation, or media-origin, forms, or multilingual resolution (`2C4-B07`, `2C4-B08`, `2C4-B09` remain unresolved).

## Resolved decision records

### ADR-PENDING-002 — Backend source reconciliation

- **Status:** Resolved through PR `#18` and the PR `#19` post-merge state reconciliation.
- **Historical issue:** GitHub backend source appeared older than later verified live/backend evidence, so SOT-001 blocked new backend runtime implementation until reconciliation.
- **Current rule:** SOT-001 is CLOSED. New backend work still requires a separately authorized stage and current evidence; this closure does not authorize WordPress or CMS mutation.
