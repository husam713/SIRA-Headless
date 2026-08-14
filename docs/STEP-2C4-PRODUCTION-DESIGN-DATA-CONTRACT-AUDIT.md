# Step 2C.4 — Production Design & Data Contract Audit

## Status and boundary

**Status:** Audit complete; pending independent review and explicit owner acceptance.

**Baseline:** `main@1cfab49f113acca5a1866e225f8b5b64a5fcb926` — accepted Step 2C.3D merge through PR #13, correction head `73bec8e671a53c1abb5396ed945785162b71b5da`, Frontend CI #25 PASS, and 23 files / 196 tests PASS.

This is a read-only design and architecture checkpoint. It changes durable documentation, machine-readable audit evidence, and contract tests only. It does not modify WordPress, backend runtime GraphQL, generated GraphQL output, dependencies, production UI, deployment configuration, DNS, or production state. `SOT-001` remains OPEN and `productionAuthorized` remains false.

The owner has approved `siratrgroup.com` as the canonical public production apex. The public topology is Group at `siratrgroup.com`, Consulting at `consulting.siratrgroup.com`, Healthcare at `healthcare.siratrgroup.com`, Lifestyle at `lifestyle.siratrgroup.com`, and Real Estate at `realestate.siratrgroup.com`. This resolves public-domain selection without creating a new gap. It does not establish WordPress backend, GraphQL endpoint, media origin, staging, Vercel preview, cookie-domain, CORS, or revalidation configuration; those remain evidence-gated.

## Evidence classification

- **CONFIRMED:** Repository source, checked-in canonical schema, generated contracts, Step 2C.3D artifact, executable tests, directly inspected design-source files, Git history, and GitHub evidence.
- **STRONGLY INFERRED:** Responsive intent where the prototypes use fluid CSS or a JavaScript 860px switch without a complete device matrix. Production behavior below makes this inference explicit and testable.
- **UNKNOWN:** Current WordPress population/authority for Companies, Services, Investments, Testimonials, Partners, Documents, translated records, private form infrastructure, and SEO plugin data. These are not guessed.

## Sources inspected

The two discovered copies of the approved design set are byte-identical. The audit records only filenames and SHA-256 hashes; local absolute paths are not persisted.

| Source | SHA-256 | Production role |
| --- | --- | --- |
| `SIRA Group Homepage.dc.html` | `90d6b8268dc86a6f294d2d6ec4611a7712147b8c8d8915d37a593e6102c7b5df` | Group homepage visual and interaction reference |
| `Sira Branch.dc.html` | `f6f2b2ef2c10afbf230fc08ac635d4cb6aeb1585128cdfe4ada1999556b88bf4` | Reusable Branch Website System reference |
| `Sira Consulting.dc.html` | `90c980f8d122624e4ad1806ccb526da1b1b76621989f6f2839fd603494716e6c` | Selector-only wrapper demonstrating a Consulting tenant instance |
| `Sira Healthcare.dc.html` | `ea6d964ccb62038d3f2464cf18648f57c88ef02c891aa218f9d9ad4904ca036f` | Selector-only wrapper demonstrating a Healthcare tenant instance |
| `Sira Lifestyle.dc.html` | `670c2acd20ce0e54b1694f0e3c5d40242f179464b9f80d6114c9d98dc74181b0` | Selector-only wrapper demonstrating a Lifestyle tenant instance |
| `Sira Real Estate.dc.html` | `67f552700ae741168dacaac60ee34e30245db4cb31f79fdf3d0e2a4584af2078` | Selector-only wrapper demonstrating a Real Estate tenant instance |
| `Sira News.dc.html` | `c49e5423f5921f85802a3df0012b5ef83e89fc0bc0f4acdfde84347d4aacc375` | Newsroom visual and filter-state reference |

The `.dc.html` runtime is prototype-only. Production must not ship or depend on `.dc.html`, `x-dc`, `dc-import`, `sc-for`, `sc-if`, `support.js`, `image-slot.js`, `deck-stage.js`, `DCLogic`, `style-hover`, or template interpolation.

## Executive conclusion

The approved design resolves into three primary page systems:

1. `GroupHomepage` for the Group root.
2. One reusable Branch Website System: a shared `BranchHomepage` component architecture independently instantiated for Consulting, Healthcare, Lifestyle, and Real Estate tenant websites.
3. One reusable `NewsroomPage` implementation instantiated with independent tenant content and runtime scope.

Shared implementation never means shared content or one physical webpage. The invariant is the same tested component architecture with a different trusted `SiteKey`, tenant dataset, hostname, and CMS records for each branch. Each branch owns its homepage, menus, editorial content, projects, media, brand data, SEO/runtime state, and cache scope.

The canonical live schema is substantially more complete than the earlier Step 2C.1 audit could prove. It already contains the full fixed Group/Branch `SiraHomepage` hierarchy, `CompanyDetails`, `InvestmentDetails`, `TestimonialDetails`, `PartnerDetails`, typed announcement/emergency objects, native WPGraphQL menus, and a usable native `contentNodes` editorial feed. No new `siraNavigation`, `siraEditorialFeed`, alternate homepage builder, or branch-specific schema is justified.

The blocking gap is the bridge from those existing live types to full generated frontend operations/adapters plus authoritative CMS population. The current homepage operation intentionally reads only variant and hero text. Production composition, forms, localization, media delivery, metadata/preview, and approved launch content are not ready.

---

# 1. Page systems

## 1.1 Group homepage

- **Route:** Group `/`.
- **Orchestrator:** Server Component `GroupHomepage`.
- **Approved order:** banner stack, Group header, hero carousel, ticker, latest updates, companies, about/metrics, investor section, services, projects, insights, testimonials, partners, contact, Group footer.
- **Data:** one complete generated homepage operation composed from bounded fragments; `siraBrand`, native navigation, and page `siraHomepage.groupHomepage` remain separate typed inputs.
- **Current state:** live schema exists; frontend operation is partial; Group Page 457 is configured but launch content is unapproved and hero fields are empty.

## 1.2 Reusable Branch Website System

- **Independent public sites:** Consulting at `consulting.siratrgroup.com`, Healthcare at `healthcare.siratrgroup.com`, Lifestyle at `lifestyle.siratrgroup.com`, and Real Estate at `realestate.siratrgroup.com`; each resolves its own `/` homepage.
- **Orchestrator:** one shared Server Component architecture, `BranchHomepage`, instantiated independently per trusted tenant.
- **Approved order:** banner stack, branch header, static branch hero, statistics, overview/focus areas, projects, insights, contact, branch footer.
- **Invariant:** each trusted site key selects only that tenant's brand/data inputs. It must not select a separate component tree, GraphQL document, markup fork, hardcoded copy, or another tenant's CMS records.
- **Isolation:** hostname, WordPress tenant, homepage record, menus, editorial content, projects, media, brand data, SEO/runtime state, and cache scope are independent for every branch site.
- **Current state:** complete live Branch homepage schema exists; frontend operation is partial; all four static front pages and authoritative branch content are absent.

Illustrative future component contract:

```tsx
<BranchHomepage
  brand={brand}
  navigation={navigation}
  homepage={homepage}
  projects={projects}
  editorial={editorial}
  footer={footer}
/>
```

This is an architecture contract, not implementation in this stage.

## 1.3 Reusable newsroom system

- **Routes:** `/news/` and an owner-approved Business Unit filter route such as `/news/[businessUnit]/`.
- **Orchestrator:** reusable Server Component `NewsroomPage`, instantiated with the current trusted site's independent content and runtime scope.
- **Approved sections:** site header, archive heading, filters, optional featured article, cursor-paginated grid, pagination, empty state, footer.
- **Contract:** the accepted native `contentNodes` and Business Unit `contentNodes` operations already merge News, Insights, Articles, and Press Releases in date order with type discrimination and cursor pagination.
- **Decision:** do not add `siraEditorialFeed`.

## 1.4 Secondary route families

Later production route work should share renderer families rather than create 28 bespoke layouts:

- Corporate entity archive/single.
- Project archive/single.
- Editorial archive/single.
- People archive/single.
- Opportunity archive/single.
- Resource archive/single.
- Event archive/single.
- Job archive/single.
- Generic initiative archive/single.

These families are NONBLOCKING for the three approved primary systems unless owner route priority promotes one.

---

# 2. Approved section inventory and mapping

| Page system | Approved section | Proposed production component | Rendering | Existing contract | Gap |
| --- | --- | --- | --- | --- | --- |
| Shared shell | Emergency + announcement | `BannerStack` | Server; optional dismiss child | Typed `siraBrand.emergency` and `announcement` READY | Healthcare copy authority unresolved |
| Group | Sticky header | `GroupHeader` via `SiteHeader` | Server | Brand + native PRIMARY menu | Menu absent; mobile drawer client island |
| Branch | Sticky header | `BranchHeader` via `SiteHeader` | Server | Brand + native PRIMARY menu | Menus absent; branch prototype lacks production mobile behavior |
| Group | Hero carousel | `GroupHero` + `HeroCarousel` | Server wrapper + Client controls | Full live hero/slides fields exist | Full operation/adapter and approved slides absent |
| Branch | Static hero | `BranchHero` | Server | Full hero images, split heading, CTAs exist | Full operation/adapter and approved content absent |
| Group | Ticker | `AnnouncementTicker` | Server; Client pause only if moving | Live ticker group exists | Approved items and motion decision absent |
| Group | Latest updates | `LatestUpdatesSection` | Server | Homepage selection fields + native editorial feed | Full fragment/adapter and authority absent |
| Group | Companies | `CompanyPortfolioSection` / `CompanyCard` | Server | Selection fields + `CompanyDetails` exist | Record readiness/authority unknown; frontend fragment absent |
| Group | About and metrics | `AboutMetricsSection` | Server | Heading/body/link/metric fields exist | Approved content absent |
| Group | Investor | `InvestorSection` | Server; form child Client | Homepage investor fields + `InvestmentDetails.publicDisplay` exist | Record readiness unknown; form and delivery policy blocked |
| Group | Services | `ServiceGridSection` / `ServiceCard` | Server | Selection fields and Service content exist | Fragment/adapter and approved selection absent |
| Group/Branch | Projects | `ProjectGridSection` / `ProjectCard` | Server | Generated archive/single core contracts exist | Homepage selections not queried; authority/content gaps |
| Branch | Statistics | `BranchStatisticsBar` | Server | Repeater fields exist | Approved content absent |
| Branch | Overview/focus areas | `BranchOverviewSection` | Server | Group and repeater fields exist | Approved content absent |
| Group/Branch | Insights | `EditorialGridSection` / `ArticleCard` | Server | Homepage selection + native feed types exist | Homepage fragments and authority absent |
| Group | Testimonials | `TestimonialsSection` | Server | Selection + `consentApproved` details exist | Record readiness/authority unknown |
| Group | Partners | `PartnerLogoGrid` | Server | Selection + partner details exist | Record/media readiness unknown |
| Group/Branch | Contact | `ContactSection` | Server; form child Client | Page copy, brand contact, form variant/context exist | Private form architecture blocked |
| Newsroom | Heading/filters | `NewsroomHeader` / `NewsroomFilters` | Server links/GET form | Editorial feed + Business Unit mapping exist | IA, route/canonical policy, branch terms |
| Newsroom | Featured/grid/pagination | `FeaturedArticle` / `EditorialArchiveGrid` | Server | Generated cursor-paginated editorial adapter exists | Approved content and final routes |
| Shared shell | Footer | `GroupFooter` / `BranchFooter` | Server | Brand + FOOTER + LEGAL menus | Menus and approved legal IA absent |

No approved section is removed. A section with no approved content must render its documented empty disposition; it must not be filled from prototype arrays or frontend hardcoding.

---

# 3. Reusable React architecture

```text
src/components/
├── shell/
│   ├── site-header.tsx
│   ├── group-header.tsx
│   ├── branch-header.tsx
│   ├── mobile-navigation.client.tsx
│   ├── locale-switcher.tsx
│   ├── banner-stack.tsx
│   ├── group-footer.tsx
│   └── branch-footer.tsx
├── homepage/
│   ├── group-homepage.tsx
│   ├── branch-homepage.tsx
│   ├── group-hero.tsx
│   ├── hero-carousel.client.tsx
│   ├── branch-hero.tsx
│   ├── announcement-ticker.tsx
│   ├── latest-updates-section.tsx
│   ├── company-portfolio-section.tsx
│   ├── about-metrics-section.tsx
│   ├── investor-section.tsx
│   ├── service-grid-section.tsx
│   ├── project-grid-section.tsx
│   ├── branch-statistics-bar.tsx
│   ├── branch-overview-section.tsx
│   ├── editorial-grid-section.tsx
│   ├── testimonials-section.tsx
│   ├── partner-logo-grid.tsx
│   └── contact-section.tsx
├── newsroom/
│   ├── newsroom-page.tsx
│   ├── newsroom-header.tsx
│   ├── newsroom-filters.tsx
│   ├── featured-article.tsx
│   └── editorial-archive-grid.tsx
├── cards/
│   ├── company-card.tsx
│   ├── project-card.tsx
│   ├── service-card.tsx
│   ├── article-card.tsx
│   └── opportunity-card.tsx
├── forms/
│   ├── contact-form.client.tsx
│   └── investor-inquiry-form.client.tsx
└── states/
    ├── section-loading.tsx
    ├── section-empty.tsx
    └── section-error.tsx
```

Directory names are proposed Step 4 boundaries, not files created by this audit.

## Server/Client boundary

Server Components own data fetching, validation adapters, section composition, cards, links, images, metadata inputs, and initial state. Client Components are limited to behavior that requires browser state:

- `MobileNavigation`: dialog state, focus trap, Escape, scroll lock, and focus return.
- `HeroCarousel`: active slide, manual controls, autoplay/pause state, swipe, and direction-aware controls.
- `ContactForm` and `InvestorInquiryForm`: field state and server-confirmed submission feedback.
- Optional ticker pause control only when continuous movement is approved.

Scroll-reveal, active-section highlighting, filter drawers, and other polish remain optional progressive enhancements. Content and navigation must work without them.

---

# 4. GraphQL and data-contract mapping

## 4.1 Existing accepted contracts

| Area | Canonical live contract | Current frontend state | Step 2C.4 disposition |
| --- | --- | --- | --- |
| Brand | `SiraBrand`, typed banners, media, contacts, values, offices, social | Generated, normalized, tokenized | Reuse; correct Group/Healthcare CMS identity |
| Homepage | Complete fixed `SiraHomepageGroupHomepage` and `SiraHomepageBranchHomepage` hierarchy | Generated query/adapter reads only variant and hero text | Expand in Step 4 with bounded fragments; no schema invention |
| Navigation | Native PRIMARY, FOOTER, LEGAL menus | Generated bounded query and safe hierarchy normalizer | Reuse; configure CMS menus |
| Editorial | Native `contentNodes` plus Business Unit connection | Generated four-type cursor feed and site mapping | Reuse; do not add custom feed |
| Projects | Archive and single with `ProjectDetails`, gallery, statistics, related company | Generated bounded adapters | Reuse; add homepage selection fragments and later filter terms |
| Companies | `CompanyDetails` with status, descriptor, destination, image override | No production query/adapter | Add generated fragment in Step 4 |
| Investments | `publicDisplay`, ticket label, company/project/document relationships | No production query/adapter | Add strict public fragment; never query `SiraInvestor` |
| Testimonials | `consentApproved`, role, organization, source | No production query/adapter | Add consent-gated public fragment |
| Partners | URL, relationship label, logo-alt override | No production query/adapter | Add safe public fragment |

## 4.2 Homepage operation rules

The Step 4 homepage operation should:

- query only the matching fixed Group/Branch shape required by the reusable page system and current trusted tenant;
- use fragments for link, media, company card, project card, editorial card, opportunity, testimonial, partner, and document metadata;
- cap every relationship and include `pageInfo.hasNextPage` so silent truncation is invalid;
- validate every returned typename and restriction signal;
- normalize links, dates, plain text/rich text, media dimensions, alt text, and relationship identity server-side;
- preserve `not-found`, `invalid`, `remote-error`, and section-empty distinctions;
- never use `siteKey` to hardcode copy, records, or a different branch query document.

## 4.3 Remaining data requirements

- Full generated homepage operation and stable server domain types.
- Homepage-related entity fragments/adapters.
- Approved form registry and private submission service.
- Approved locale/translation ownership and relationships.
- Approved SEO/preview contract in Step 3.
- Approved CMS record population from the correction manifest.
- Remote media host allowlist and image transformation/caching policy.

No confirmed core design section currently requires a new GraphQL type. If later evidence proves a backend field is missing, `SOT-001` blocks implementation until backend source is reconciled.

---

# 5. Design tokens and typography

## 5.1 Token ownership

WordPress continues to own canonical identity values: primary, secondary, accent, paper, and ink. The frontend continues to derive semantic tokens: accent-bright, on-accent, glass, soft/faint ink, deep surfaces, tint, borders, shadows, and hero overlays.

Structural tokens remain frontend-owned:

- container and reading width;
- section spacing and responsive gutters;
- focus ring width/offset;
- radii, elevation, motion duration/easing, and layering introduced in Step 4;
- typography scale and line-height.

Prototype color literals are evidence for semantic intent, not values to paste into component JSX. Components consume semantic classes/variables and must pass contrast checks for each brand.

## 5.2 Typography

- Archivo: Latin body and interface.
- Newsreader: Latin display/editorial headings, including approved italic emphasis.
- Noto Kufi Arabic: Arabic body, interface, and display.
- Arabic emphasis must not force a Latin italic treatment.
- `next/font` remains the loading mechanism; prototype Google Font links are not copied.
- Display sizes use fluid `clamp()` within tested bounds; body copy retains readable line length and line height.

---

# 6. Responsive behavior

The prototypes use fluid grids and an 860px JavaScript switch. Production must express layout in CSS and test content-driven transitions rather than copy that runtime breakpoint.

Required validation widths:

- 320px narrow mobile baseline;
- 390px common mobile;
- 768px tablet;
- 1024px compact desktop/tablet landscape;
- 1440px desktop;
- wide layout constrained by the existing 82.5rem container.

Key behavior:

- headers collapse to an accessible mobile drawer;
- Group hero rail moves below/condenses without hiding manual controls;
- grids move from three/four columns to two and then one;
- branch overview sticky copy returns to normal flow before overlap risk;
- forms stack without changing semantic field order;
- filter controls wrap or use an accessible disclosure rather than horizontal clipping;
- footer columns preserve logical reading order;
- images use art-directed desktop/mobile fields when supplied and safe responsive fallbacks otherwise.

---

# 7. English LTR and Arabic RTL

The current foundation confirms fonts, `dir`, and logical token support, but `BrandDocument` uses the site default locale and no route locale exists. Therefore Arabic production routing is BLOCKING for Arabic launch.

Production rules:

- use real locale routes and translated records, never a direction-only toggle;
- use logical properties and preserve semantic DOM order;
- mirror directional controls and drawer origin, not content chronology;
- keep carousel data order stable while mapping previous/next to locale direction;
- use explicit heading segments from CMS; never slice English or Arabic strings algorithmically;
- localize labels, validation errors, dates, taxonomy names, metadata, and alternate links;
- specify canonical and `hreflang` in Step 3;
- define missing-translation fallback before implementation.

The prototype in-memory English/Arabic dictionary is not a content model and must not be imported.

---

# 8. Accessibility

Minimum production acceptance:

- one H1 per page and ordered section headings;
- skip link and semantic header/nav/main/footer landmarks;
- accessible brand lockups without duplicated logo/adjacent text names;
- keyboard-visible focus using brand-safe contrast;
- mobile navigation dialog with focus trap, Escape, scroll lock, and focus return;
- carousel manual controls, pause on hover and focus, keyboard support, restrained announcements, and no autoplay under reduced motion;
- ticker pause control if content moves continuously;
- links and buttons distinguishable without color or hover;
- full-card links have unique accessible names;
- meaningful image alt, explicitly decorative images, and no guessed alt text;
- dates use `<time>`; testimonials use `figure`, `blockquote`, and `figcaption`;
- forms use explicit labels, descriptions, error association, pending state, success/error focus, and server-confirmed status;
- empty and error states explain recovery without leaking GraphQL details;
- automated accessibility checks plus keyboard, screen-reader, zoom/reflow, and contrast review across all five brands and both directions.

---

# 9. Interactions, motion, and reduced motion

Approved interaction intent:

- Group hero manual previous/next and slide selection;
- optional autoplay with hover/focus pause, explicit pause control, and touch swipe;
- mobile navigation open/close;
- newsroom filters represented in URLs;
- form pending/success/error flows;
- subtle card hover and reveal motion;
- optional active-section highlighting.

Production rules:

- functionality cannot depend on hover, animation, or JavaScript-only content creation;
- animate transform/opacity only unless evidence justifies otherwise;
- avoid layout-shifting parallax and continuous main-thread scroll work;
- use `IntersectionObserver` only as progressive enhancement;
- respect `prefers-reduced-motion` from first render;
- reduced motion disables carousel autoplay, zoom, parallax, ticker translation, reveal transitions, and drawer entrance motion while preserving all content and manual controls;
- grain and decorative effects remain NONBLOCKING and may be omitted after performance review.

---

# 10. Media requirements

- Use `next/image` only after an exact CMS media host allowlist is approved in `next.config.ts`.
- Require safe HTTPS URLs, valid dimensions, restriction checks, and appropriate alt policy.
- Use the homepage desktop/mobile image fields for art direction where available.
- Prefer CMS media; keep approved local brand marks as controlled fallbacks.
- Do not load prototype placeholder services, embedded data-image helpers, or direct design-source assets.
- Prioritize the LCP hero image and lazy-load below-fold media.
- Define crop/focal-point behavior before content entry.
- Group projects require featured images and subtitles; Group logo and Healthcare mark require accessibility decisions.
- Public document download requires a separate delivery policy; direct hidden file URLs remain protected.

Remote media delivery is BLOCKING because the current Next configuration has no remote image pattern.

---

# 11. Navigation and information architecture

The production shell uses native menus only:

- `PRIMARY`
- `FOOTER`
- `LEGAL`

All five tenants currently have zero assignments for all three locations, producing 15 required assignments. The owner must approve labels, hierarchy, route destinations, external targets, locale variants, legal pages, and the Group/branch cross-link model.

Home section anchors are progressive conveniences, not substitutes for real routes. News filters must be links or GET forms with stable URLs and `aria-current`. A mobile drawer consumes the same normalized menu tree as desktop navigation.

---

# 12. Loading, empty, error, and not-found states

The scaffold already provides generic route loading, error, global error, and not-found components. Production states must be page-system aware:

| State | Required behavior |
| --- | --- |
| Loading | Skeletons match major stable blocks, avoid fake copy, reserve media space, and honor reduced motion |
| Empty curated section | Omit only when omission is approved; otherwise show the defined editorial recovery state |
| Empty newsroom/archive | Explain no results, retain filters, and offer clear/reset navigation |
| Invalid CMS contract | Controlled unavailable state plus server diagnostic identifier; no hardcoded replacement content |
| Remote GraphQL failure | Section or page boundary based on criticality; no raw response/error leakage |
| Missing front page | Not-found/configuration state; never substitute a posts index or fabricated homepage |
| Missing image | Approved aspect-ratio fallback without invented alt text |
| Form pending | Disable duplicate submission and announce progress |
| Form success/error | Server-confirmed status, focus management, retry path, and no optimistic-only success |

Critical shell/homepage failures may fail the page. Noncritical below-fold relationship failures may use section boundaries only when omission does not misrepresent launch content.

---

# 13. SEO and preview implications

Current metadata is generic static SIRA Enterprise copy. Preview transport exists, but no preview route or page-system metadata orchestration exists.

Step 3 must define and validate:

- canonical host and path generation from the approved `siratrgroup.com` public topology;
- locale routes and `hreflang`;
- title, description, Open Graph/Twitter images, robots, and pagination metadata;
- Organization/WebSite and only evidence-valid Article, NewsArticle, Project, Service, Event, JobPosting, FAQ, Person, or LocalBusiness structured data;
- draft preview entry, authentication, no-store behavior, preview banners, and exit flow;
- branch filter canonical/noindex policy;
- redirect and domain policy.

The public hostname decision is resolved. Step 3 still owns canonical metadata, preview, `hreflang`, sitemap, redirect, and related SEO behavior, so `2C4-B10` remains BLOCKING. The approved public domains do not identify the WordPress backend, GraphQL endpoint, media origin, staging host, Vercel preview host, cookie-domain requirements, CORS rules, or revalidation endpoint origins. `2C4-B07` therefore also remains BLOCKING until the exact approved media delivery/origin policy is established.

SEO/preview is BLOCKING for production release but does not authorize Step 3 implementation in this stage.

---

# 14. Performance implications

- Preserve Server Components for all noninteractive sections.
- Fetch bounded fragments and relationships; fail on silent truncation.
- Avoid one monolithic client homepage bundle.
- Parallelize independent server data while preserving critical error semantics.
- Use cache tags already established for brand, homepage, navigation, editorial, and projects.
- Avoid client-side refetch of server-rendered content.
- Use responsive images, correct `sizes`, hero priority only for the active LCP candidate, and lazy loading below fold.
- Retain `next/font`; avoid prototype font/CDN scripts.
- Limit carousel DOM/media preload and pause offscreen work.
- Use CSS for responsive layout and reduced motion; avoid resize-state rendering copied from prototypes.
- Establish performance budgets and inspect LCP, CLS, INP, JavaScript, font, image, and cache behavior before Step 4 acceptance.

---

# 15. Blocking gaps

| ID | Gap | Blocks | Owner |
| --- | --- | --- | --- |
| 2C4-B01 | Full homepage generated operation/adapters absent | Production homepage composition | Future frontend stage |
| 2C4-B02 | No editorial/project record has launch authority | Populated launch systems | Editorial |
| 2C4-B03 | Four branch static front pages absent | Branch homepages | CMS admin |
| 2C4-B04 | Fifteen menu assignments absent | Production shell/IA | CMS admin + owner IA approval |
| 2C4-B05 | Four exact branch Business Unit terms absent | Branch filtering | CMS admin |
| 2C4-B06 | Group/Healthcare brand identity incorrect | Canonical identity | CMS admin |
| 2C4-B07 | Remote media allowlist/delivery policy absent | Production images | Future frontend stage |
| 2C4-B08 | Private forms architecture undecided | Functional forms | Owner/security |
| 2C4-B09 | Multilingual ownership and route model undecided | Arabic launch | Owner |
| 2C4-B10 | SEO/preview architecture absent | Production release | Step 3 |
| 2C4-B11 | SOT-001 open | Any new backend runtime correction | Backend reconciliation |

These gaps do not block completion of this read-only audit. They block the stated downstream capability.

# 16. Nonblocking gaps

| ID | Gap | Safe disposition |
| --- | --- | --- |
| 2C4-N01 | Reveal, parallax, grain, autoplay polish | Defer while preserving content/manual controls |
| 2C4-N02 | Scroll-linked active section | Optional progressive enhancement |
| 2C4-N03 | Client-enhanced filter drawer/live counts | Start with server links/GET form |
| 2C4-N04 | Localized numerals and decorative RTL motion | Follow core semantic RTL |
| 2C4-N05 | Secondary archive/single renderer families | Deliver incrementally by owner priority |

---

# 17. CMS correction manifest

The exact proposed non-destructive execution plan is stored at `artifacts/step-2c4/cms-correction-manifest.json`.

It contains:

- exact Group and Healthcare approved brand identity values;
- Group Page 457 fixed Group homepage population requirements;
- one identical BranchHomepage contract shape independently populated in the four branch tenant front-page records;
- 15 native menu assignments;
- four exact branch Business Unit terms;
- record-level editorial/project review without deletion;
- Group project media/subtitle corrections;
- read-only inventory and approval requirements for homepage Companies, Services, Investments, Testimonials, Partners, and Documents;
- Group logo and Healthcare mark accessibility corrections;
- Healthcare announcement authority review;
- deferred form, multilingual, and SEO actions that must not be guessed.

Every action is `mutationAuthorized=false`, `destructive=false`, and dependent on owner acceptance plus a fresh read-only preflight. WordPress was not changed in this audit.

---

# 18. Validation and acceptance gate

Required before this branch can be accepted:

1. JSON parse and Step 2C.4 contract tests.
2. Prototype runtime exclusion tests.
3. `pnpm lint`.
4. `pnpm typecheck`.
5. `pnpm test:run`.
6. `pnpm build`.
7. `git diff --check`.
8. Scope review confirming no backend/runtime GraphQL/generated/dependency/lockfile/production UI changes.
9. Security review confirming no endpoint, credential, private payload, WordPress mutation, deletion, or deployment.
10. Draft PR and Frontend CI on the exact branch head.
11. Independent design/data-contract review.
12. Explicit owner acceptance before merge or any CMS/production implementation.

## Rollback

This branch is documentation, machine evidence, and tests only. Rollback is a normal revert of the focused audit commit. No WordPress or production rollback is required because neither is modified.

## CURRENT PROJECT STATE

- **Stage:** Step 2C.4 — Production Design & Data Contract Audit.
- **Status:** AUDIT COMPLETE / PENDING OWNER ACCEPTANCE.
- **Canonical accepted baseline:** `main@1cfab49f113acca5a1866e225f8b5b64a5fcb926`.
- **Canonical public production apex:** `siratrgroup.com` (owner approved; public hostnames only).
- **SOT-001:** OPEN.
- **WordPress mutation:** none.
- **Backend runtime change:** none.
- **Production UI implementation:** not started.
- **Deployment:** not authorized and not performed.
- **Next gate:** draft PR validation, independent review, and explicit owner acceptance.
