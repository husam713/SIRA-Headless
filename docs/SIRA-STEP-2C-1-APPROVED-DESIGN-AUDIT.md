# SIRA Step 2C.1 — Approved Design Audit and Data Contract

**Status:** Read-only checkpoint. Step 2C architecture and artifacts are provisionally approved. The original Step 2D is blocked until this audit is approved.

## Objective

Preserve the approved SIRA visual and interaction design while defining the production page systems, section inventory, reusable React component map, and targeted WordPress/WPGraphQL data contract needed for a conventional Next.js App Router implementation.

This checkpoint does not implement the production component library and does not alter WordPress, `sira-core`, the Step 2C frontend, DNS, or Vercel configuration.

## Sources audited

- `SIRA Group Homepage.dc.html`
- `Sira Branch.dc.html`
- `Sira Consulting.dc.html`
- `Sira Healthcare.dc.html`
- `Sira Lifestyle.dc.html`
- `Sira Real Estate.dc.html`
- `Sira News.dc.html`
- supplied SIRA full logo and branch marks
- cumulative Step 2C source and documentation
- cumulative Step 1 `sira-core` package:
  - `docs/GRAPHQL-SCHEMA.md`
  - `docs/PUBLIC-PRIVATE-VISIBILITY.md`
  - `src/Content/PostTypes.php`
  - `src/Content/Taxonomies.php`
  - `src/Integrations/AcfIntegration.php`
  - `src/GraphQL/BrandSchema.php`
  - `src/Brand/BrandManager.php`

The `.dc.html` files and their supporting JavaScript are approved visual and behavioral references only. No proprietary runtime, custom elements, interpolation syntax, or generated React is part of the production proposal.

---

# Executive findings

1. **There are three approved visual page systems, not seven independent implementations.**
   - Group homepage.
   - One shared branch homepage with four data variants.
   - Group newsroom/archive with branch filtering.
   The Consulting, Healthcare, Lifestyle, and Real Estate files are thin selectors for the shared branch design.

2. **Step 2C is structurally compatible with the approved design.**
   Its five WordPress-owned colors, semantic preset tokens, fonts, local marks, server-rendered document variables, and cross-site fallback behavior can remain unchanged for this audit.

3. **The current backend is content-rich but homepage-poor.**
   It provides 28 GraphQL-enabled post types, 10 taxonomies, a curated `siraBrand`, typed project details, typed people details, and typed document metadata. It does not provide the structured composition data required to reproduce the approved Group and branch homepages without hardcoding editorial content.

4. **A targeted homepage contract is required.**
   Add one explicit typed homepage ACF group to the designated WordPress front page on each site. Do not use flexible content, arbitrary section builders, or ACF options for the page body. A Page-based contract preserves revisions, publication status, preview, and editorial history.

5. **The branch sites must share one renderer and one contract.**
   The branch key controls brand tokens and data selection; it must not select different React page implementations.

6. **The Group newsroom needs a canonical editorial-feed decision.**
   The backend has separate News, Insight, Article, and Press Release types. The design presents one combined “News & Insights” experience. The live schema must first be checked for a stable cross-type `contentNodes` query. If unavailable or unsuitable for cursor pagination, add one targeted typed `siraEditorialFeed` connection.

7. **Public investor presentation and private investor leads are separate domains.**
   Public opportunity cards may use approved published `sira_investment` records after a field allowlist is added. Investor inquiry submissions must never be stored in or exposed through the public investor CPT.

8. **Several small targeted field groups are missing.**
   Company branch/domain data, public investment opportunity fields, testimonial consent/role, and partner URL/logo metadata are not represented by the current public GraphQL contract.

9. **Multilingual content remains a blocking data decision.**
   The prototype contains English and Arabic dictionaries and flips direction. Production requires genuine translated records, localized menus, localized URLs, canonical/hreflang relationships, and locale-aware previews.

10. **The original Step 2D should remain blocked.**
    Routing and production component work should start only after the homepage, editorial feed, navigation, forms, multilingual, and public opportunity contracts are approved.

---

# Current Step 2C acceptance status

Step 2C remains provisionally approved. These checks are open:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test:brand`
- `pnpm test:run`
- `pnpm build`
- live `siraBrand` validation for all five sites
- verification that CSS variables render on the document root
- fallback tests when WordPress is unavailable
- cross-site brand-key mismatch tests
- invalid-color normalization tests
- English LTR runtime checks
- Arabic RTL runtime checks
- font loading checks
- browser validation of the `oklch()` semantic token strategy

These checks do not block this read-only audit but remain mandatory before final Step 2C production acceptance.

---

# Deliverable 1 — Page-system inventory

## A. Approved primary page systems

| Page system | Purpose and route | Site/brand | WordPress source | Shared layout and approved sections | SEO and preview | Multilingual/RTL | Contract status |
|---|---|---|---|---|---|---|---|
| Group homepage | Corporate landing page at `/` | Group | `siraBrand`, front-page homepage contract, selected Companies, Projects, Services, editorial items, Investments, Testimonials, Partners | Group header; interactive hero carousel; ticker; latest updates; companies; about/metrics; investors; services; projects; insights; testimonials; partners; contact; Group footer | Home title/description, canonical, OG image, Organization/WebSite schema; draft front-page preview and related-item preview | `/` English and `/ar/` Arabic recommended; true translated content, logical properties, mirrored controls | **Missing targeted homepage data contract** |
| Shared branch homepage | Branch landing page at `/` on each branch hostname | Consulting, Healthcare, Lifestyle, Real Estate | `siraBrand`, front-page branch contract, selected Projects and editorial items | Branch header; static branch hero; statistics bar; overview/focus; projects; insights; contact; branch footer | Brand-specific title/description, canonical hostname, OG image, Organization/LocalBusiness subtype only when valid; draft preview | Same component for all branches and locales; Arabic heading split must be editorial, not string slicing | **Missing targeted homepage data contract** |
| Consulting variant | `consulting.siratrgroup.com/` | Consulting | Shared branch contract with `siteKey=consulting` | No unique component tree; purple tokens and Consulting data | Consulting canonical/OG metadata | Shared locale model | **Data variant only** |
| Healthcare variant | `healthcare.siratrgroup.com/` | Healthcare | Shared branch contract with `siteKey=healthcare` | No unique component tree; blue tokens and Healthcare data | Healthcare canonical/OG metadata | Shared locale model | **Data variant only** |
| Lifestyle variant | `lifestyle.siratrgroup.com/` | Lifestyle | Shared branch contract with `siteKey=lifestyle` | No unique component tree; green tokens and Lifestyle data | Lifestyle canonical/OG metadata | Shared locale model | **Data variant only** |
| Real Estate variant | `realestate.siratrgroup.com/` | Real Estate | Shared branch contract with `siteKey=realestate` | No unique component tree; brown tokens and Real Estate data | Real Estate canonical/OG metadata | Shared locale model | **Data variant only** |
| Group newsroom | `/news/` | Group | Combined approved editorial feed from News, Insights, Articles, and Press Releases; business-unit taxonomy; featured images | Newsroom shell; heading; filter links; featured item; grid; pagination; empty state; Group footer | CollectionPage schema, canonical pagination, indexable archive, item OG data | Localized archive labels and taxonomy terms | **Unified feed decision missing** |
| Group branch-filtered news view | `/news/[businessUnit]/` recommended | Group | Same editorial feed filtered by `sira_business_unit` | Same newsroom renderer; selected filter reflected in URL | Canonical indexable filter pages only for approved branches; other filters may be noindex | Localized filter slugs need an approved strategy | **Taxonomy exists; route/query contract pending** |
| Branch newsroom | `/news/` on each branch hostname | Branch site | Site-local editorial feed; optional content-kind filters | Same newsroom renderer with branch branding; no duplicated branch page | Branch canonical; archive metadata from homepage/SEO source | Shared locale model | **Renderer shared; feed decision pending** |

## B. Core public archive and single systems

All routes below come from the current Step 1 GraphQL contract. They should be implemented through shared archive/single families, not 28 bespoke page implementations.

| Content family | Archive and single route | Source and filters | Page system | SEO/preview/RTL |
|---|---|---|---|---|
| Companies | `/companies/`, `/companies/[slug]/` | `SiraCompanies`; industry, country, region; proposed company details | Corporate entity archive and company profile | Organization/Corporation metadata where valid; drafts use no-store; translated taxonomy labels |
| Projects | `/projects/`, `/projects/[slug]/` | `SiraProjects`; industry, country, business unit, sector, project status, region; `projectDetails` | Filterable project archive and project single with hero, summary, stats, gallery, related company | Project/CreativeWork schema only when justified; preview required; RTL gallery controls |
| Services | `/services/`, `/services/[slug]/` | `SiraServices`; business unit; core title/excerpt/content | Service archive and service detail | Service schema where valid; preview required |
| Insights | `/insights/`, `/insights/[slug]/` | `SiraInsights`; business unit, sector | Editorial archive and article renderer | Article schema, author/date, canonical; preview required |
| News | `/news/`, `/news/[slug]/` | `SiraNewsItems`; business unit | News archive/feed and article renderer | NewsArticle schema; preview required |
| Articles | `/articles/`, `/articles/[slug]/` | `SiraArticles`; business unit | Editorial archive and article renderer | Article schema; preview required |
| Press releases | `/press-releases/`, `/press-releases/[slug]/` | `SiraPressReleases`; business unit | Editorial archive and press-release renderer | NewsArticle/PressRelease presentation; preview required |
| Events | `/events/`, `/events/[slug]/` | `SiraEvents`; country, region | Event archive and event detail | Event schema, dates/venue needed if not in core model; preview required |
| Case studies | `/case-studies/`, `/case-studies/[slug]/` | `SiraCaseStudies`; industry | Case-study archive and long-form case-study detail | Article/CaseStudy metadata; preview required |
| Leadership | `/leadership/`, `/leadership/[slug]/` | `SiraLeadershipProfiles`; department; `personDetails` | People directory and profile | Person schema; public role/LinkedIn only; no personal email |
| Executives | `/executives/`, `/executives/[slug]/` | `SiraExecutives`; department; `personDetails` | Shared people renderer with executive label | Same controls as leadership |
| Board | `/board/`, `/board/[slug]/` | `SiraBoardMembers`; `personDetails` | Shared people renderer with board label | Same controls as leadership |
| Partners | `/partners/`, `/partners/[slug]/` | `SiraPartners`; proposed partner details | Partner grid and profile or outbound link | Organization metadata; preview required |
| Testimonials | `/testimonials/`, `/testimonials/[slug]/` | `SiraTestimonials`; proposed consent/role details | Testimonial archive/profile; homepage consumes selected items | Index only consent-approved records; preview required |
| Offices | `/offices/`, `/offices/[slug]/` | `SiraOffices`; country, office region, region | Office directory and office page | Place/LocalBusiness metadata when valid; localized address handling |
| Career areas | `/careers/`, `/careers/[slug]/` | `SiraCareerAreas`; department | Careers landing and category detail | Preview required |
| Jobs | `/jobs/`, `/jobs/[slug]/` | `SiraJobs`; business unit, department | Vacancy archive and job detail | JobPosting schema; application data remains private |
| CSR | `/csr/`, `/csr/[slug]/` | `SiraCsrInitiatives` | Initiative archive and detail | Article/project-like metadata |
| Awards | `/awards/`, `/awards/[slug]/` | `SiraAwards` | Awards archive and detail | Award metadata where valid |
| FAQs | `/faqs/`, `/faqs/[slug]/` | `SiraFaqs` | FAQ archive and optional detail | FAQPage schema only when visible content matches |
| Resources | `/resources/`, `/resources/[slug]/` | `SiraResources`; resource category | Resource archive and detail | File/link policy dependent |
| Documents | `/documents/`, `/documents/[slug]/` | `SiraDocuments`; `documentDetails`; resource category | Document metadata archive/detail | Direct file remains hidden until approved delivery policy |
| Downloads | `/downloads/`, `/downloads/[slug]/` | `SiraDownloads`; `documentDetails`; resource category | Download metadata archive/detail | Same file controls |
| Whitepapers | `/whitepapers/`, `/whitepapers/[slug]/` | `SiraWhitepapers`; `documentDetails`; resource category | Whitepaper landing/detail | Gated or public file policy required |
| Media items | `/media/`, `/media/[slug]/` | `SiraMediaItems` | Rights-approved media archive/detail | Rights, credit, alt text, direct URL policy |
| Investments | `/investments/`, `/investments/[slug]/` | `SiraInvestments`; industry, country, stage, sector, region; proposed public fields | Conditional public opportunities archive/detail | Explicit public-display flag and field allowlist; preview required |
| Portfolio | `/portfolio/`, `/portfolio/[slug]/` | `SiraPortfolioItems`; stage, sector | Conditional portfolio archive/detail | Confidential fields must remain absent |
| Investors | **No public route** | `SiraInvestors` authenticated only | Private operational/admin use only | Never expose anonymous archive/node data |

## C. Renderer families

The 28 post types should collapse into these production renderer families:

1. `CorporateEntityArchive` / `CorporateEntitySingle`
2. `ProjectArchive` / `ProjectSingle`
3. `EditorialArchive` / `EditorialSingle`
4. `PeopleArchive` / `PersonSingle`
5. `OpportunityArchive` / `OpportunitySingle`
6. `ResourceArchive` / `ResourceSingle`
7. `EventArchive` / `EventSingle`
8. `JobArchive` / `JobSingle`
9. `GenericInitiativeArchive` / `GenericInitiativeSingle`

Each route remains explicit in the App Router; the renderer and query adapters are shared.

---

# Deliverable 2 — Complete section and interaction inventory

## Status legend

- **P** — visible and approved in a prototype.
- **M** — required or inferred from migration/content-model requirements.
- **C** — supported by the current backend contract.
- **G** — current contract or frontend-plan gap.
- **D** — implementation intentionally deferred after this checkpoint.

| Section or interaction | Evidence/status | Production disposition | Data readiness |
|---|---|---|---|
| Sticky global header | P: Group, Branch, Newsroom | Preserve sticky translucent paper surface and border | Navigation contract pending |
| Group full logo | P | Use local Group full logo fallback; prefer approved WP media when valid | C via `siraBrand.logo` + local asset |
| Branch mark and brand name | P | Shared branch identity lockup; adjacent text supplies accessible name | C via `siraBrand` + local marks |
| Desktop navigation | P | Server-rendered menu links; active state may use route/section observer enhancement | WordPress menu query needs confirmation |
| Mobile navigation drawer | P: Group only | Must exist for Group and branch production headers; focus trap, Escape, scroll lock, focus return | G for branch prototype and menu contract |
| Language/direction switcher | P: Group | Replace direction toggle with locale links to genuine translated routes | G: multilingual backend decision |
| Primary header CTA | P | CMS label/URL from homepage contract or menu metadata | G: homepage contract |
| Announcement banner | M, C as text | Add above header; visible only when populated | C text-only; typed link/timing/severity gap |
| Emergency banner | M, C as text | Highest-priority alert; must not rely on color alone | C text-only; typed link/timing/severity gap |
| Group hero carousel | P | Preserve multi-slide full-bleed visual system | G: homepage hero-slide contract |
| Branch hero | P | Preserve static branch hero and split heading | G: homepage branch contract |
| Hero image | P | `next/image`, responsive crops, meaningful alt or decorative handling | Project/featured media partly C; homepage selection G |
| Hero eyebrow | P | Editorial text plus branch/location context | G |
| Split hero heading | P | Explicit before/highlight/after fields; never split strings algorithmically | G |
| Highlighted/italic hero text | P | Newsreader italic for Latin; Arabic uses approved Kufi emphasis without forced Latin italic | G content; token C |
| Hero description | P | Editorial field | G |
| Hero CTAs | P | Typed internal/external links with labels | G |
| Hero slide counter | P: Group | Client carousel output; localized numerals optional later | Data derives from slides |
| Hero slide rail | P: Group | Interactive tab/list representation with active state | Data derives from slides |
| Previous/next controls | P: Group | Real buttons with accessible names and keyboard support | Data derives from slides |
| Hero progress indicator | P: Group | Progress tied to autoplay; paused state reflected | Client behavior G |
| Touch swipe | P: Group | Preserve with pointer/touch-safe threshold and RTL direction | Client behavior G |
| Hover pause | P: Group | Preserve | Client behavior G |
| Focus pause | Required accessibility enhancement | Pause while keyboard focus is within carousel | Missing in prototype; production requirement |
| Keyboard carousel operation | Required accessibility enhancement | Arrow/Home/End or tabbed slide controls; avoid keyboard trap | Missing in prototype |
| Reduced-motion carousel | D | Disable autoplay/zoom/progress animation; retain manual controls | Token foundation C |
| Announcement ticker/news marquee | P: Group | Preserve visual ticker; pause control and reduced-motion static wrapping required | Homepage ticker content G |
| Latest updates | P: Group | Query latest or curated editorial items; branch-colored rail | Editorial data C; unified feed G |
| Company portfolio grid | P: Group | Selected Company posts, four branch identities | Company type C; branch/domain/status fields G |
| Company cards | P | Image, status, branch tag, number, title, excerpt, destination | Partial C |
| Company status badges | P | Controlled enum, not arbitrary styling strings | G |
| About section | P: Group | Brand/group narrative plus CTA | Brand fields partially C; page-specific heading/CTA G |
| Statistics/metrics | P: Group and Branch | Site-level curated metrics; not project statistics | G homepage contract |
| Investor section | P: Group | Public metrics, approved opportunities, CTA/form | Investment type C but public fields G |
| Investor metrics | P | Curated aggregate metrics only | G homepage contract |
| Investor opportunity cards | P | Published `sira_investment` records with explicit public flag | G targeted ACF |
| Investor CTA/download | P | Approved document relation and gated/public delivery policy | Document metadata C; file policy G |
| Investor inquiry form | P | Private form service/API; consent, spam, retention, audit | G; must not use public GraphQL |
| Services section | P: Group | Selected Service posts; card number derived from order | Service core content C; selection/copy G |
| Project grid | P: Group and Branch | Selected or archive projects | C |
| Project cards | P | Featured image, status, location, title, excerpt, branch accent | Mostly C |
| Project status | P | Use `sira_project_status` taxonomy as canonical filter; ACF status may remain display text only | C but duplicated sources require policy |
| Project location | P | Display label from `projectDetails.location`; filter from country/region taxonomies | C |
| Project filters | M/content-model | Server-addressable filter URLs/forms; optional client enhancement | Taxonomies C; frontend D |
| Branch overview | P | Sticky copy column plus focus list | G homepage contract |
| Branch focus areas | P | Ordered title/copy repeater | G homepage contract |
| Branch statistics bar | P | Ordered site-level metrics | G homepage contract |
| Branch projects | P | Curated Project relationships | Project source C; selection G |
| Insights/news grid | P: Group and Branch | Curated editorial relationships or latest feed | Content types C; unified feed G |
| Article cards | P | Image, branch/type, date, title, excerpt, destination | Core editorial fields C |
| Branch-filtered articles | P: Newsroom concept | Filter by `sira_business_unit` and site | Taxonomy C |
| Contact CTA | P: Group and Branch | Page-specific heading/copy plus brand contact details | Brand contacts C; section copy G |
| Contact details | P | Email, phone, offices; links validated | C via `siraBrand` |
| Contact form | P | Private form endpoint with accessible validation and consent | G |
| Contact success state | P | Announced with `role=status`; server-confirmed, not optimistic only | G |
| Newsroom heading | P | Archive editorial fields | G archive settings or homepage contract |
| Newsroom filters | P | Real links or GET form; selected filter in URL | Taxonomy C |
| Featured article | P | First curated/latest item; not a hardcoded array index without empty handling | Feed G |
| Newsroom article grid | P | Paginated editorial cards | Feed G |
| Empty newsroom state | P | Preserve explicit empty message and recovery link | Frontend D |
| Testimonials | P: Group | Selected consent-approved testimonial records | CPT C; role/consent fields G |
| Partner logo grid | P: Group | Selected Partner records with logo alt/URL | CPT C; details G |
| Global footer | P: Group and Newsroom | Group logo, description, HQ, page/company/connect columns, rights | Brand contacts/social C; menus/legal G |
| Branch footer | P | White mark, branch name/tagline, Group link, rights | Brand/local assets C |
| Legal links | M | Footer legal menu: privacy, terms, cookies, accessibility | G |
| Social links | P placeholders/M | Render approved `siraBrand.socialProfiles` only | C |
| Office information | P/M | Use `siraBrand.officeLocations`; optionally Office CPT for directory | C |
| White mark on dark surfaces | P | Use `/brands/shared/mark-white.png` fallback | C |
| Scroll-linked active navigation | P: Group logic | Optional progressive enhancement; route pages must work without it | Client behavior D |
| Scroll reveal animation | P: Group logic | Preserve subtle reveal; content visible without JS; disabled for reduced motion | D |
| Hero zoom/parallax/grain | P | Preserve only after performance and reduced-motion validation | D |
| Loading states | M | Route skeletons must mirror major layout blocks without fake content | D |
| Empty states | P/M | Explicit for newsroom and all query-driven grids | D |
| Error states | M | Controlled section/page errors; never leak GraphQL response bodies | Existing GraphQL error model C; UI D |

No approved section should be removed. Features that are not visible in the prototype but are required by the content model remain separate route systems rather than being inserted into the approved homepages.

---

# Deliverable 3 — Reusable component map

## Proposed directory boundary

```text
src/components/
├── shell/
│   ├── site-header.tsx
│   ├── group-header.tsx
│   ├── branch-header.tsx
│   ├── mobile-navigation.tsx
│   ├── locale-switcher.tsx
│   ├── banner-stack.tsx
│   ├── site-footer.tsx
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
│   ├── branch-statistics-bar.tsx
│   ├── branch-overview-section.tsx
│   ├── service-grid-section.tsx
│   ├── project-grid-section.tsx
│   ├── editorial-grid-section.tsx
│   ├── testimonial-section.tsx
│   ├── partner-logo-grid.tsx
│   └── contact-section.tsx
├── newsroom/
│   ├── newsroom-header.tsx
│   ├── newsroom-filters.tsx
│   ├── featured-article.tsx
│   └── editorial-archive-grid.tsx
├── cards/
│   ├── company-card.tsx
│   ├── project-card.tsx
│   ├── service-card.tsx
│   ├── article-card.tsx
│   ├── opportunity-card.tsx
│   ├── person-card.tsx
│   └── resource-card.tsx
├── forms/
│   ├── contact-form.client.tsx
│   └── investor-inquiry-form.client.tsx
├── archive/
│   ├── archive-header.tsx
│   ├── archive-filters.tsx
│   ├── archive-pagination.tsx
│   └── archive-empty-state.tsx
└── content/
    ├── editorial-single.tsx
    ├── project-single.tsx
    ├── company-single.tsx
    ├── person-single.tsx
    └── resource-single.tsx
```

## Component specifications

| Component | Classification/location | Required props and GraphQL dependency | Variations and responsive/RTL behavior | Accessibility, motion, states, tests |
|---|---|---|---|---|
| `GroupHomepage` | Server; `homepage/group-homepage.tsx`; page-specific orchestrator | `brand`, `navigation`, `hero`, `ticker`, `updates`, `companies`, `about`, `investor`, `services`, `projects`, `insights`, `testimonials`, `partners`, `contact`, `footer`; composes fragments but owns no query | Group layout only; ordered approved sections; logical spacing | Integration snapshot per locale/site; verifies no omitted section; section-level error boundaries |
| `BranchHomepage` | Server; shared orchestrator | `brand`, `navigation`, `hero`, `statistics`, `overview`, `focusAreas`, `projects`, `insights`, `contact`, `footer` | Same component for four branches; brand tokens only; desktop two-column overview, tablet stacks, mobile single column; RTL mirrors inline alignment | Contract test runs all four site keys and both directions; no branch-specific JSX conditions except data/layout enum |
| `SiteHeader` | Server shell selecting Group/Branch presentation | Brand asset, menu, CTA, locale alternatives, banners | Sticky; tablet collapses nav; mobile delegates to drawer; RTL order uses logical layout | Skip link, landmarks, current page, logo naming; no JS required for desktop |
| `MobileNavigation` | Client; `shell/mobile-navigation.tsx` | Menu items, CTA, label strings | Drawer opens from inline end; width constrained on mobile/tablet; RTL automatically changes side | Dialog semantics, focus trap, Escape, focus return, body scroll lock; no entrance motion under reduced motion; keyboard/Playwright tests |
| `LocaleSwitcher` | Server links, optional small client enhancement | Current locale and translated alternate URLs | No direction-only toggle; hides unavailable translation | `hreflang`, language names, current state; route tests |
| `BannerStack` | Server; optional dismissible child client | Typed announcement/emergency objects | Emergency before announcement; full-width; branch tokens | `role=alert` only for urgent updates; dismissal persisted only when allowed; empty renders nothing |
| `GroupHero` | Server wrapper + `HeroCarousel` Client | Homepage heading fields and `HeroSlideFragment[]` | Full bleed; rail moves below content on tablet; compact rail/dots on mobile; RTL reverses directional semantics, not data order | Heading hierarchy, alt policy, CTA links; fallback first slide if client JS fails |
| `HeroCarousel` | Client | Slides, interval, labels, initial index, locale direction | Autoplay desktop/mobile unless reduced motion; swipe threshold; manual controls | Pause on hover and focus, visible pause control recommended, keyboard controls, live-region restraint, no auto-advance under reduced motion; unit + Playwright |
| `BranchHero` | Server | Branch hero fields and media fragment | Static full-bleed hero; responsive typography; RTL explicit heading segments | No forced carousel; image alt; animation content-visible by default |
| `AnnouncementTicker` | Server markup/CSS; client only if explicit pause state needed | Ordered ticker items | Wrap/static list under reduced motion or narrow screens; RTL direction reviewed separately | Pause control if continuously moving; content must remain readable without animation |
| `LatestUpdatesSection` | Server | Editorial-card fragment list and section copy | Three columns desktop, two tablet, one mobile; inline-start rail follows RTL | Empty hides section or approved empty state; query failure controlled; card link tests |
| `CompanyPortfolioSection` / `CompanyCard` | Server | Company card fragment with branch key, status, featured image, excerpt, destination | Four-card responsive grid; branch accent border/status; number derived from order | Entire card link with accessible name; Coming Soon must not link to unavailable route; image/alt tests |
| `AboutMetricsSection` | Server | Section copy, CTA, metric rows | Two-column desktop; stacked mobile; metrics 2×2 then single as needed; RTL logical alignment | Numbers and labels remain paired; empty metrics do not leave blank grid |
| `InvestorSection` | Server; form child Client | Public metric rows, opportunity fragment list, approved document relation, inquiry-form config | Dark surface; opportunities grid; form stacks below intro on tablet/mobile | No private investor records; public flag required; form labels/errors/consent; security and privacy tests |
| `InvestorInquiryForm` | Client | Field config, action endpoint, CSRF/anti-spam config, localized labels | Responsive fields; RTL field order natural | Server validation, pending/success/error states, `aria-describedby`, retention consent; mutation/e2e tests |
| `ServiceGridSection` / `ServiceCard` | Server | Service fragment list and section copy | Three columns desktop; number derived from order; single column mobile | Cards remain readable without hover; empty state |
| `ProjectGridSection` / `ProjectCard` | Server | Project card fragment including featured image and `projectDetails`; taxonomy terms | Three columns desktop, two tablet, one mobile; branch accent badges | Status taxonomy policy, image alt, full-card link; missing image fallback; fragment contract tests |
| `ProjectFilters` | Server GET form/links; optional Client enhancement | Taxonomy option fragments and current search params | Horizontal/wrapped desktop; disclosure on mobile; RTL logical ordering | URL-addressable, keyboard usable, clear-all control, count announcements; route/query tests |
| `BranchStatisticsBar` | Server | Ordered homepage metric rows | Four columns desktop; two tablet; one/two mobile; inline borders logical | High contrast via `--brand-on-accent`; no color-only meaning |
| `BranchOverviewSection` | Server | Overview copy and focus-area rows | Sticky copy desktop; normal flow tablet/mobile; RTL start alignment | Ordered list semantics for focus areas; no sticky overlap |
| `EditorialGridSection` / `ArticleCard` | Server | Unified editorial-card adapter fragment | Three columns desktop, two tablet, one mobile; branch/type accents | Date `<time>`, article type/branch exposed textually; missing image fallback |
| `TestimonialsSection` | Server | Consent-approved testimonial fragments | Two columns desktop, single mobile | `figure`, `blockquote`, `figcaption`; no decorative quote announced |
| `PartnerLogoGrid` | Server | Partner logo/URL fragment | Grayscale/neutral treatment only if approved; responsive logo row/grid | Meaningful logo alt, external-link labeling; missing logo omitted |
| `ContactSection` | Server; form child Client | Page copy, `siraBrand` contacts/offices, form config | Dark split layout desktop; stacked tablet/mobile; RTL logical alignment | Links for email/phone; form labels; no optimistic success without server result |
| `ContactForm` | Client | Config and private endpoint | Field set differs Group vs branch through props, not duplicated component | Validation, spam protection, success/error focus, `role=status`; e2e tests |
| `NewsroomHeader` | Server | Archive title, description, active filter, filter options | Large display heading; filters wrap; mobile scroll/wrap without hidden controls | One H1, filter navigation label |
| `NewsroomFilters` | Server links/GET form | Business-unit and kind terms | Selected state uses `aria-current`; branch colors | Indexable URLs where approved; keyboard and canonical tests |
| `FeaturedArticle` | Server | Editorial-card fragment with larger image | Two-column desktop; stacked mobile; RTL image/text order approved per design | Entire link accessible, image alt, absent item removes block |
| `EditorialArchiveGrid` | Server | Paginated editorial connection | Three/two/one columns | Empty and error states; pagination landmark |
| `GroupFooter` | Server | Brand, footer menus, legal menu, companies menu, social links, office summary | Four columns desktop; two tablet; one mobile; RTL column reading order | Footer landmark, accessible logo, external-link labels |
| `BranchFooter` | Server | Brand, white mark, tagline, Group URL, legal links | Simplified approved branch composition; stacked mobile | White-mark decorative handling; Group link explicit |
| `ContentArchivePage` | Server shared family | Adapter-provided connection, filters, metadata | Content-specific card and filter config | Loading/empty/error/pagination contract tests |
| `EditorialSingle` | Server | Editorial single fragment, SEO, related items | Reading-width body, optional media | Semantic article, dates, headings, safe rich text, preview |
| `ProjectSingle` | Server | Project core, details, taxonomies, gallery, related company | Hero, overview, statistics, gallery, related content | Gallery keyboard/RTL; missing fields collapse |
| `CompanySingle` | Server | Company core, details, related projects/services/people | Corporate profile | Organization metadata; external site safety |
| `PersonSingle` | Server | Person core and public `personDetails` | Shared people renderer | No email; Person metadata; accessible portrait |
| `ResourceSingle` | Server | Resource/document metadata; delivery policy result | Metadata page plus approved action | Never reveal hidden direct file URLs |

## Proposed branch component contract

```tsx
<BranchHomepage
  brand={brand}
  navigation={navigation}
  hero={hero}
  statistics={statistics}
  overview={overview}
  focusAreas={focusAreas}
  projects={projects}
  insights={insights}
  contact={contact}
  footer={footer}
/>
```

This is a data contract illustration only. It is not production implementation.

---

# Deliverable 4 — Targeted data-contract audit

Although the checkpoint explicitly names three deliverables, a data-contract decision is necessary before routing or components can begin.

## A. Existing fields that are sufficient

### Brand

`RootQuery.siraBrand` already provides:

- name, key, tagline
- five identity colors
- logo and mark
- email, phone, address
- description, mission, vision
- values
- office locations
- social profiles
- announcement text
- emergency text

### Projects

`SiraProject.projectDetails` provides:

- subtitle
- location
- status
- related company
- gallery
- statistics

Core WPGraphQL fields provide title, content, excerpt, slug, URI, dates, featured image, and taxonomy connections.

### People

`personDetails` provides public role, LinkedIn, and Company relationship. Email is correctly absent.

### Documents

`documentDetails` provides version and publication date. Direct files are correctly absent until the delivery policy is approved.

### Filters

The current taxonomies support:

- industry
- country
- business unit
- investment stage
- sector
- project status
- office region
- department
- region
- resource category

## B. Targeted homepage contract

### Recommendation

Add a versioned ACF field group to the designated front-page `page` on each site:

```text
GraphQL field: siraHomepage
GraphQL type:  SiraHomepage
Location:      WordPress front page
```

Use explicit subgroups and fixed section order. Do not use flexible content.

### Why a Page, not ACF options

- WordPress revisions
- draft/pending/scheduled status
- authenticated preview
- editorial history
- standard permalink and SEO integration
- no coupling of page body to global brand options

### Proposed top-level shape

```text
SiraHomepage
├── variant: GROUP | BRANCH
├── groupHomepage: SiraGroupHomepage
└── branchHomepage: SiraBranchHomepage
```

Only the matching subgroup is populated for a site.

### Group homepage fields

```text
SiraGroupHomepage
├── hero
│   ├── headingBefore
│   ├── headingHighlight
│   ├── headingAfter
│   ├── description
│   ├── primaryCta
│   ├── secondaryCta
│   └── slides[]
├── tickerItems[]
├── latestUpdatesSection
├── companySection
├── aboutSection
├── investorSection
├── serviceSection
├── projectSection
├── insightSection
├── testimonialSection
├── partnerSection
└── contactSection
```

Relationships should point to existing CPT records wherever the item is a Company, Project, Service, editorial item, Investment, Testimonial, Partner, or Document. Copy fields should be used only for section-level headings, CTA labels, and design-specific overrides.

### Branch homepage fields

```text
SiraBranchHomepage
├── hero
│   ├── eyebrow
│   ├── headingBefore
│   ├── headingHighlight
│   ├── headingAfter
│   ├── description
│   ├── image
│   ├── primaryCta
│   └── secondaryCta
├── statistics[]
├── overview
├── focusAreas[]
├── selectedProjects[]
├── selectedEditorialItems[]
├── contactSection
└── footerTaglineOverride
```

## C. Homepage hero-slide type

```text
SiraHomepageHeroSlide
├── relatedProject: SiraProject
├── relatedCompany: SiraCompany
├── imageOverride: MediaItem
├── branchKey
├── eyebrowOverride
├── locationOverride
├── titleOverride
└── accessibleImageAltOverride
```

At least one relation or an explicit image/title combination is required. The frontend derives branch colors from `branchKey`; editors do not enter CSS colors.

## D. Company detail gap

The Group company cards require data not guaranteed by core post fields.

Targeted field group:

```text
SiraCompany.companyDetails
├── branchKey
├── operatingStatus: ACTIVE | COMING_SOON | INACTIVE
├── externalWebsiteUrl
├── shortDescriptor
└── cardImageOverride
```

Featured image remains the default card image. The external URL must be allowlisted against the site registry for SIRA branch links.

## E. Public investment opportunity gap

Do not expose `SiraInvestor`.

Targeted fields on `SiraInvestment`:

```text
SiraInvestment.investmentDetails
├── publicDisplay
├── stageLabel
├── ticketSizeLabel
├── marketLabel
├── summary
├── relatedCompany
├── relatedProject
└── onePagerDocument
```

The resolver must return the public detail object only for published records with `publicDisplay=true`. Confidential valuation, counterparties, diligence, and internal notes remain absent.

## F. Testimonial gap

Targeted fields:

```text
SiraTestimonial.testimonialDetails
├── role
├── organization
├── consentApproved
├── consentRecordedAt
└── sourceUrl
```

Anonymous queries must return only published, consent-approved items. Withdrawal must be operationally supported.

## G. Partner gap

Targeted fields:

```text
SiraPartner.partnerDetails
├── websiteUrl
├── relationshipLabel
└── logoAltOverride
```

The featured image can remain the logo.

## H. Editorial feed gap

The approved newsroom merges multiple editorial types.

Decision sequence:

1. Inspect the live schema for a stable `contentNodes` connection that can:
   - include News, Insights, Articles, and Press Releases;
   - order consistently by publication date;
   - filter by business unit;
   - support cursor pagination;
   - preserve type discrimination.

2. If all conditions pass, use that existing connection.

3. Otherwise add one targeted custom connection:

```text
RootQuery.siraEditorialFeed
├── nodes: [SiraEditorialFeedItem]
├── pageInfo
└── filters: businessUnit, contentKind
```

Each node should expose a typed content-node reference rather than duplicated arbitrary JSON.

## I. Navigation contract

Use WordPress menus as editorial navigation data if the live WPGraphQL schema exposes them reliably.

Required menu identifiers per site/locale:

- `primary`
- `footer-pages`
- `footer-companies`
- `footer-legal`

Avoid theme-template coupling. If theme locations are unstable during headless cutover, resolve by explicit menu slug stored in the site registry or a small curated site setting.

## J. Banner contract incompatibility

Current `siraBrand` exposes banner strings. Production accessible banners may need:

```text
message
severity
linkLabel
linkUrl
startsAt
endsAt
dismissible
revisionKey
```

Recommendation: retain the current string fields for compatibility and add typed `announcement` and `emergency` objects in a focused backward-compatible backend patch before banner implementation.

## K. Project status source policy

Two status sources currently exist:

- `projectDetails.status` text
- `sira_project_status` taxonomy

Policy:

- taxonomy term is canonical for filtering and machine state;
- display text may come from the taxonomy label;
- the ACF status field may remain temporarily for legacy display but must not diverge;
- a later migration can deprecate the duplicate text field after data reconciliation.

Location follows a similar split:

- `projectDetails.location` is the human display label;
- country/region taxonomies are canonical filters.

## L. Rich-text normalization incompatibility

`BrandManager` permits sanitized HTML in brand description. Current Step 2C normalizes it through a plain-text-oriented function.

Before production use of that field, choose one:

1. expose and render a dedicated sanitized rich-text type; or
2. make the public brand description plain text; or
3. use the new homepage content group for page narrative and reserve brand description for metadata.

Recommendation: option 3 for homepage content, while documenting the `siraBrand.description` rendering rule separately.

## M. Forms contract

The prototype forms are visual only. Production requires private endpoints for:

- general contact
- branch partnership/contact
- investor inquiry
- future job application/newsletter forms

Required properties:

- server-side schema validation
- CSRF/origin controls
- rate limiting
- honeypot and/or approved bot protection
- consent capture
- retention policy
- restricted operational storage
- audit trail without sensitive log payloads
- localized errors and success states

Do not use public GraphQL mutations or public CPTs for submissions.

## N. Multilingual contract

A production decision is required for:

- translation ownership in WordPress
- translation relationships
- `/ar/` URL policy
- localized menus
- localized taxonomy names/slugs
- localized homepage fields
- localized SEO and social metadata
- canonical and `hreflang`
- previewing a specific translation
- fallback behavior when a translation is absent

The prototype’s in-memory English/Arabic dictionary is not a production data model.

---

# Compatibility findings for current Step 2C

## No immediate architecture change required

The following can remain:

- trusted `siteKey`
- server-only GraphQL endpoint selection
- published/preview client separation
- five WordPress-owned identity colors
- frontend semantic tokens
- local fallback asset map
- `next/font` family selection
- server-rendered variables on `<html>`
- cross-site brand-key fallback
- invalid-color normalization

## Documented issues to resolve before production components

1. Live Step 2C acceptance checks remain open.
2. Rich-text handling for `siraBrand.description` is undefined.
3. Remote media host allowlisting is not implemented.
4. Locale selection still uses site default locale rather than a route locale.
5. Banner strings are too limited for scheduled, linked, dismissible alerts.
6. Homepage composition does not exist in GraphQL.
7. Unified editorial feed behavior is unresolved.
8. Navigation menu identifiers are unresolved.
9. Form submission architecture is unresolved.
10. Project status has duplicate text/taxonomy sources.

---

# Approval gates before the original Step 2D

Approve these decisions first:

1. Front-page ACF contract using fixed Group/Branch subgroups.
2. Company detail field group.
3. Public Investment detail field group and privacy controls.
4. Testimonial and Partner detail field groups.
5. Editorial-feed strategy after live-schema inspection.
6. Navigation menu identifiers.
7. Typed banner extension or acceptance of text-only banners.
8. Form provider/storage/retention policy.
9. Multilingual WordPress integration and `/ar/` policy.
10. Project-status canonical-source policy.
11. Rich-text handling policy.

No production component implementation should start until these are approved or explicitly deferred with a documented fallback.
