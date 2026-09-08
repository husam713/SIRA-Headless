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

- **Status:** Accepted by the owner after implementation, through the durable owner-decision comment on PR `#48` at `2026-09-02T03:17:53Z` (https://github.com/husam713/SIRA-Headless/pull/48#issuecomment-5503798684), recorded against merge `4f8c8d87`.
- **Previous status:** Proposed until 2026-09-02. Owner acceptance was recorded after the implementing increments were merged. That chronology is deliberate history and must not be rewritten as though acceptance preceded implementation or merge.
- **Relation to ADR-028:** ADR-029 implements ADR-028 §4 and §10. It does not supersede ADR-028, which remains the preceding canonical architecture decision.
- **Acceptance boundary:** this acceptance covers the architecture decision only. It is not owner acceptance of every PR `#47`/`#48` implementation detail; it does not establish responsive, RTL, reduced-motion, accessibility, or visual-regression completion (sequence items L-O of `docs/STEP-4-EXACT-DESIGN-FIDELITY-IMPLEMENTATION.md` section 20); it does not resolve `2C4-B07`, `2C4-B08`, `2C4-B09`, or `PREVIEW-AUTH-001`; and it does not authorize TP-STEP4-R1, Newsroom work, CB-2, CMS mutation, staging, deployment, DNS, or production cutover.
- **Context:** An audit of `feat/step-4-shared-shell` at `ce5dbe6` found the Step 4 code is CSS-led and has a correct Server/Client boundary, but has no shared layout primitive. `max-w-[82.5rem]` is hand-rolled 17 times with three drift variants; `--layout-container`, `--layout-reading-width`, and `--space-section` are declared in `frontend/src/styles/globals.css` with zero consumers while a contract test asserts only that the strings exist; and `subgrid`, size container queries, and intrinsic grids (`auto-fit`/`minmax()`) have zero occurrences. Only two breakpoints (`sm:`, `lg:`) are in use, so the 1024-1320px band renders identically to 2560px.
- **Decision:** Introduce shared Server-Component layout primitives (`PageContainer`, `PageGrid`, `Section`, `Prose`, `CardRail`) over a small semantic CSS layer in `globals.css` that owns the master grid, Subgrid card rails, section rhythm, reading widths, and full-/edge-bleed rules. Sections consume the primitives instead of re-declaring containers and grids.
- **Rule:** Subgrid and size container queries are expressed in the CSS layer, not as Tailwind arbitrary values. Container queries are scoped to components that must adapt to their own width — card rails, and Branch sections reused inside differently sized Group and Branch contexts — and must not be applied blanket-wise; viewport media queries remain correct for page-level chapter changes. The structural tokens become load-bearing, and their contract test must assert consumption rather than declaration.
- **Constraint:** Layout adaptation remains CSS-led. The audit confirmed zero JavaScript viewport measurement (`matchMedia` is used only for `prefers-reduced-motion`); this must not regress. Server Components remain the default.
- **Reference:** `frontend/prototypes/step-4-art-direction/` is retained as NON-PRODUCTION reference evidence. It already demonstrates the 12/8/4-column master grid, real `grid-template-columns: subgrid`, fluid gutter and section tokens, and logical properties throughout, and satisfies the `docs/SIRA-EDITORIAL-ARCHITECTURE-SPEC.md` §20 prototype gate.
- **Reason:** ADR-028 §4 requires an explicit reusable page grid, Subgrid where it materially improves alignment, and reading-width and bleed rules, and rejects a repeated `heading -> equal cards` rhythm as the default grammar. §10 requires art-directed responsive behavior rather than a simple desktop collapse. The current implementation satisfies none of these structurally, and each additional section built on the present pattern increases the cost of the correction.
- **Sequencing:** The primitives land before further page work. Newsroom route work is deliberately sequenced after the responsive foundation and its viewport/RTL/reduced-motion validation, because §7 requires the Newsroom to evolve away from a purely repetitive equal-card grid.
- **Scope:** This decision governs presentation composition only. It does not reopen the architecture locks in `docs/SIRA-EDITORIAL-ARCHITECTURE-SPEC.md` §21, and it does not authorize production deployment, DNS, cutover, CMS mutation, or media-origin, forms, or multilingual resolution (`2C4-B07`, `2C4-B08`, `2C4-B09` remain unresolved).

- **Implementation observation (recorded by `TP-STEP4-R0`, 2026-09-01):** the
  **Status above remains `Proposed` and is deliberately unchanged by this
  note.** However, the increments implementing this decision are merged to
  `main`: PR `#47` and PR `#48` at `4f8c8d87` introduced the primitives and
  adopted them across the shell and every homepage section. The decision is
  therefore implemented ahead of the owner acceptance its own Status requires.
  This is recorded as a discrepancy for the owner to resolve; a reconciliation
  task has no authority to grant the acceptance, and neither PR carries a
  recorded GitHub review. Resolving it requires an explicit owner decision to
  either accept ADR-029 or direct a different disposition of the merged work.

- **Acceptance resolution (recorded by `TP-ADR029-ACCEPTANCE-RECONCILIATION`,
  2026-09-02):** the discrepancy recorded above is resolved by owner acceptance,
  not by rewriting the record of it. The observation stands as written history:
  implementation and merge preceded acceptance. The owner accepted ADR-029 as
  the governing architecture decision in the PR `#48` comment cited in the
  Status line. The sentence above stating that neither PR carries a recorded
  GitHub review remains true of formal GitHub Review objects and is now
  qualified: PR `#48` carries an owner comment accepting the ADR-029
  architecture decision only. Owner acceptance of the PR `#47`/`#48`
  implementation detail is still absent, and L-O QA completion is still not
  established.

## ADR-030 — Pre-launch placeholder editorial is authorized, bounded, and gated

- **Status:** Approved by the owner on 2026-09-05, in the Newsroom design session, in response to a direct question about search-engine exposure.
- **Decision:** The engineering agent may CREATE clearly marked placeholder editorial records in the WordPress Multisite so the Newsroom can be demonstrated and reviewed before real content exists. The owner's stated intent is that an editor will later rewrite or replace them, and that SIRA's own content will be authored before launch.
- **Scope:** create-only, on the four editorial content types, on any of the five tenants. Every seeded record carries post meta `_sira_seed=1`.
- **Explicit non-expansion.** This ADR does not change `cmsMutationAuthorization`, `batchAMutationAuthorized`, `taxonomyDeletionAuthorized`, or the Step 2C.5B `BLOCKED_BY_BACKUP_EVIDENCE` readiness state. Those continue to gate destructive database work, Batch A, and taxonomy deletion, none of which has a verified recovery point: RB-001 backup evidence and RB-009 restore evidence both remain `UNKNOWN`. Unlocking placeholder creation must not quietly unlock deleting terms with no way back.
- **It also does not authorize** modifying or deleting any pre-existing record, backend/plugin/schema changes, staging provisioning, deployment, DNS, or cutover.
- **Expiry:** at production launch. This is a pre-launch convenience and is not a standing permission.
- **Two launch-blocking gates are opened by this decision**, both recorded in `project-state.json.openGates`:
  - `seedContentRemovalBeforeLaunch` — no `_sira_seed` record may exist at launch;
  - `searchEngineIndexingReenableBeforeLaunch` — read-only inspection on 2026-09-05 found `blog_public=1` on all five tenants, so WordPress invites indexing of its own permalinks regardless of the frontend's robots policy. Setting it to `0` is REQUIRED BEFORE any placeholder record is created, and returning it to `1` is required at launch or the real site will not be indexed. Neither has happened: the write was refused by the session's permission policy and is NOT RUN.
  `tools/verify-no-seed-content.mjs` checks both and exits non-zero, so this is a gate rather than a note someone has to remember.
- **Reason:** the live Group record holds nine real entries and the four branch records are effectively empty, which is too little content to review an editorial system against, and far too little to judge how it behaves at scale. The owner is the authorization authority for their own pre-launch site; the risk that actually needed managing was not the writing but the indexing, which the gates above address.
- **Residual risk the owner accepted:** several placeholder entries invent specifics around relationships that appear in SIRA's own design references (the OVAN Group partnership, the Rosina Diagnostic Center investment). Those sentences are fabrications about named third parties, not merely about SIRA, and must be rewritten rather than polished. The seed script emits that list.

## ADR-031 - Batch A executed against a verified recovery point

- **Status:** Approved by the owner on 2026-09-05 and executed on 2026-09-06. The owner authorized taking a WordPress backup and authorized Batch A in the same instruction.
- **Decision:** create the branch-local `sira_business_unit` terms that the ADR-014 mapping requires, on the four branch tenants, so a branch newsroom can resolve its own editorial feed at all.
- **Why this was blocked, and what unblocked it.** Step 2C.5B recorded `mutationReadiness=BLOCKED_BY_BACKUP_EVIDENCE` because RB-001 backup evidence and RB-009 restore evidence were both `UNKNOWN`. The blocker was never the taxonomy write; it was the absence of a recovery point. A full multisite database backup was therefore taken and verified BEFORE the first write, and its coordinates are recorded in `project-state.json` under `authorization.rb001BackupEvidence`.
- **What was done:**
  - created `consulting`, `real-estate` and `lifestyle`; `healthcare` already existed and was not rewritten;
  - assigned twelve pre-existing branch editorial records to their own tenant's term. No record's existing term was changed or removed;
  - Group's taxonomy was not touched, and `group -> null` was preserved: Group's own reporting is still the absence of a term.
- **What was deliberately NOT done:** no term was deleted, no pre-existing record's title or body was edited, and `taxonomyDeletionAuthorized` remains `false`. Batch A's historical scope explicitly excluded taxonomy deletion and this execution kept that exclusion.
- **RB-009 is still open.** A backup that has never been restored is evidence of a file, not evidence of recoverability. `openGates.rb009RestoreRehearsal` records that the dump has not been restored into a scratch database. Recoverability is `STRONGLY INFERRED` from the dump's integrity, not `CONFIRMED`.
- **Historical artifacts are unchanged.** The Step 2C.5B readiness, manifest, backup, rollback and ledger artifacts continue to record what was true when they were written. Only current project state moved, and `tests/contract/step-2c5b-cms-mutation-readiness.test.ts` now asserts the historical values on the artifacts and the current values on `project-state.json`, rather than requiring them to agree.

## ADR-032 - The GraphQL 403 is a client-network condition, not an architecture blocker

- **Status:** Recorded 2026-09-06 as a launch blocker; **CORRECTED 2026-09-06** after retesting. It is NOT a confirmed infrastructure blocker. A residual, unverified risk remains, described below.
- **What the first record got wrong.** It concluded that Hostinger's CDN blocks the WPGraphQL endpoint and therefore blocks the headless architecture. The measurement was real but the inference was too narrow: only `/graphql` had been tested from the client, so a host-wide condition was mistaken for an endpoint-specific one.
- **Corrected finding.** Retested on the same client with the owner reporting the VPN disabled, the **entire origin** answers 403, not the GraphQL endpoint:

  | Path | Result |
  | --- | --- |
  | `/` | 403 |
  | `/wp-json/` | 403 |
  | `/graphql` (GET and POST) | 403 |

  The responses carry `Server: hcdn` and an `x-hcdn-request-id`. The client egress resolves to **AS9009 M247 Europe SRL, Bucharest** - a hosting/VPN network whose ranges commercial VPN exits are routinely assigned from. Hostinger's bot protection challenges that class of address. The block therefore follows the CLIENT NETWORK, not the path, not the method, and not WPGraphQL.
- **Evidence WPGraphQL is healthy.** Issued from the origin over SSH, the production `SiraEditorialFeed` document returns HTTP 200 with correct data and resolves `siraBusinessUnits`. Nothing is wrong with the endpoint, the plugin, or the contract.
- **Do not change Hostinger CDN settings on this evidence.** The earlier record's remediation list is withdrawn. Weakening bot protection to satisfy a challenged VPN exit would trade real protection for a test convenience.
- **The residual risk, stated honestly.** This correction proves the failure is client-network specific. It does NOT prove that a Vercel server-side fetch will pass, because Vercel egress is also datacenter address space and datacenter ranges are exactly what the challenge targets. That has not been measured from Vercel and is `UNKNOWN`.
- **The one test that settles it:** deploy a preview and have it perform a single server-side GraphQL fetch, or issue one request from the deployment platform's egress. Until that runs, treat "server-side fetch from the hosting platform reaches WPGraphQL" as unverified rather than as either broken or working.
- **Downgraded, not deleted.** `openGates.cdnBlocksHeadlessGraphql` becomes `platformEgressReachabilityUnverified` and is no longer a launch blocker. It is a pre-deploy check.

## ADR-033 - SIRA Digital joins the platform as a company on its own Saudi domain

- **Status:** Owner decision, 2026-09-08. This is an owner-authorized topology expansion, not drift. A future agent that finds `sirahdigital.sa` in the registry must treat it as canonical.
- **Decision:** SIRA Digital is a first-class SIRA GROUP operating company inside the existing SIRA platform. It is a tenant of the same WordPress Multisite network, the same Next.js application, the same GraphQL contract, the same contact pipeline, and the same site registry. It is not a separate codebase and not a separate CMS.
- **What changed in the canonical topology.** The public production topology was `siratrgroup.com` plus four branch subdomains. It now also contains `sirahdigital.sa`, on a different apex and a different TLD. That is deliberate: SIRA Digital trades in the Saudi market and a `.sa` domain is a market decision, not a routing convenience.
- **Why the registry needed no new mechanism.** The hostname registry always matched whole hostnames and never a parent domain, so a company on its own apex resolves by exactly the same rule as a Group subdomain. Adding the key to `SITE_KEYS` made the compiler name every exhaustive map that had to grow. `tests/unit/site-registry.test.ts` now asserts that `sirahdigital.sa` is canonical, that `www.sirahdigital.sa` redirects to its OWN canonical host rather than to Group, and that `digital.siratrgroup.com` resolves to nothing.
- **ADR-014 is extended, not superseded.** The Business Unit mapping gains `digital -> digital`. This is the first company whose CMS slug and site key coincide; `realestate -> real-estate` remains the standing warning against deriving one mechanically from the other.
- **ADR-024 is superseded on one point only.** The canonical public production topology is no longer single-apex. Every other clause of ADR-024 stands, including that public-domain evidence must not be used to infer backend, GraphQL, media, staging, preview, cookie-domain, CORS or revalidation configuration.
- **Shared platform, distinct experience.** Digital reuses tenant resolution, the design-token infrastructure, accessibility primitives, the GraphQL transport, the contact pipeline, SEO and localization infrastructure, analytics and testing. It does NOT inherit the branch companies' page composition. Digital is the only company set on a dark ground, which took no fork of the shell: `paper` is the page ground and `ink` is the text on it, so inverting those two identity tokens and choosing the derived set for a dark ground is the entire mechanism.
- **The brand accent is SIRA GROUP's gold, not a new hue.** The four branch companies each own a hue and sit on light paper. Digital is the same gold on near-black: unmistakably a GROUP company, and the most distinct surface in the estate.
- **Enquiries stay on one backend.** The contact path is unchanged - browser, trusted Next.js route, WordPress endpoint, validation, private storage, Microsoft Graph. What changed is that recipients now resolve per tenant, because a network shares one `wp-config.php` and a single constant would route every company's enquiries to one inbox.
- **OPEN - the trading name spelling.** The registered domain is `sirahdigital.sa`; the repository's company convention is `SIRA <Company>`. This implementation uses **SIRA Digital**, following the convention already established by SIRA Consulting, SIRA Healthcare, SIRA Lifestyle and SIRA Real Estate. No prior canonical name for this company existed anywhere in the repository, so nothing was overridden. If the legal or trading name is `SIRAH DIGITAL`, it is two strings: `BASE_SITES.digital.name` in `frontend/src/config/sites.ts` and the `digital` preset name in `frontend/src/lib/brand/fallbacks.ts`, plus the WordPress preset. **This needs owner confirmation before launch.**
- **OPEN - the brand mark.** Digital currently uses the shared white SIRA mark, which is the correct mark for a GROUP company on a dark ground. A Digital-specific mark is an owner deliverable, not a placeholder for missing CMS data.
- **What this decision does NOT authorize:** creating the live WordPress site, changing DNS, provisioning a domain, deploying, cutting over, deleting anything, or any destructive database operation. Those remain protected. The WordPress site creation and domain mapping are external admin actions; the exact steps and the evidence needed are recorded in `docs/DIGITAL-TENANT-PROVISIONING.md`.

## Resolved decision records

### ADR-PENDING-002 — Backend source reconciliation

- **Status:** Resolved through PR `#18` and the PR `#19` post-merge state reconciliation.
- **Historical issue:** GitHub backend source appeared older than later verified live/backend evidence, so SOT-001 blocked new backend runtime implementation until reconciliation.
- **Current rule:** SOT-001 is CLOSED. New backend work still requires a separately authorized stage and current evidence; this closure does not authorize WordPress or CMS mutation.
