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

## Open decision records

### ADR-PENDING-001 — Git integration/default branch policy

The current repository default branch is `step-2c2a-inventory`. A durable protected integration/default-branch model must be chosen after governance bootstrap review. Do not change the default branch implicitly.

### ADR-PENDING-002 — Backend source reconciliation

GitHub backend source appears older than later verified live/backend evidence. Resolve SOT-001 before new backend runtime implementation.
