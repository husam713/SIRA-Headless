# SIRA Step 2C.2 — Targeted Homepage and Presentation Data Contract Planning

**Status:** Planning only. No WordPress, GraphQL, Next.js, database, or routing code is implemented in this stage.

## Objective

Define the smallest targeted backend and schema changes required to support the approved SIRA Group homepage, the shared branch homepage, newsroom data, navigation, banners, public investment presentation, testimonials, and partner cards without hardcoding CMS-owned editorial content in React.

## Affected files if implementation is later approved

Primary:

- `sira-core/src/Integrations/AcfIntegration.php`

Potential, only for approved requirements that ACF exposure alone cannot satisfy:

- `sira-core/src/Content/Taxonomies.php`
- `sira-core/src/Brand/BrandManager.php`
- `sira-core/src/GraphQL/BrandSchema.php`
- `sira-core/src/Plugin.php`
- `sira-core/src/GraphQL/EditorialFeedSchema.php` — new only if live WPGraphQL cannot provide the approved feed
- `sira-core/src/GraphQL/NavigationSchema.php` — new only if stable public menus cannot be achieved through normal WPGraphQL menu locations
- `sira-core/docs/GRAPHQL-SCHEMA.md`
- `sira-core/docs/PUBLIC-PRIVATE-VISIBILITY.md`
- `sira-core/docs/MIGRATION-DECISION-LOG.md`

No Step 2 frontend file should change during the backend implementation except the checked-in live schema snapshot and generated GraphQL types after backend acceptance.

## Risks

- Large ACF field groups can become difficult for editors if not divided into tabs and fixed groups.
- Changing field/type names after frontend adoption would create breaking GraphQL changes.
- ACF select fields do not necessarily produce the desired singular typed schema shape.
- ACF relationship/post-object fields resolve as GraphQL connections, even when a single object is selected.
- Public investments and testimonials need object-level privacy, not merely hidden sensitive subfields.
- WordPress menus are private to anonymous WPGraphQL requests unless assigned to menu locations or explicitly exposed.
- A cross-type editorial feed may require a custom connection if the live schema cannot filter and paginate the four editorial types consistently.
- Banner scheduling and dismissal require more data than the existing string fields.
- Multilingual fields should not be duplicated into “English” and “Arabic” subfields if a real translation system will own locale variants.

## Assumptions

- Step 1A–1G is the backend baseline.
- Step 2A–2C is the frontend baseline.
- ACF Pro and WPGraphQL for ACF remain the structured-field integration.
- Each WordPress Multisite site has its own GraphQL endpoint and its own front page.
- Homepage composition belongs to a revisioned WordPress Page.
- Brand identity remains in `siraBrand`.
- Presentation semantics, layout order, autoplay timing, responsive rules, and design tokens remain frontend-owned.
- The canonical public domain is `siratrgroup.com`.
- No multilingual plugin or custom translation model has yet been approved.

## Expected result after later implementation

- `Page.siraHomepage` supplies one fixed Group or Branch homepage contract.
- Group and branch homepage renderers consume relationships to existing CPTs rather than duplicated card copy.
- Company cards receive branch/status metadata.
- Public investment opportunities can be queried without exposing private investor or diligence data.
- Testimonials are publicly queryable only when publication and consent conditions pass.
- Partner cards receive approved external URLs and accessible logo metadata.
- Navigation is publicly queryable through a stable approved contract.
- Banners can be typed, scheduled, linked, and dismissed without removing the legacy string fields.
- The newsroom receives a stable, paginated, branch-filterable editorial feed.
- Existing Step 1 fields and Step 2C brand infrastructure remain backward compatible.

---

# 1. Architecture decisions

## 1.1 Homepage data belongs to the front-page Page

Use a PHP-registered ACF field group located on the WordPress front page and manually mapped to GraphQL type `Page`.

Proposed contract:

```graphql
type Page {
  siraHomepage: SiraHomepage
}
```

Reasons:

- supports revisions;
- supports draft, pending, scheduled, and revision previews;
- keeps page composition out of global brand options;
- avoids a page-builder JSON contract;
- allows Yoast or other page-level SEO fields to remain attached to the same node;
- keeps every Multisite site’s homepage editorially independent.

## 1.2 Use fixed fields, groups, and repeaters

Do not use ACF Flexible Content for this homepage.

Use:

- Group fields for section organization;
- repeaters for ordered metrics, focus areas, ticker entries, and hero slides;
- relationships/post objects for existing content entities;
- image fields for homepage-only overrides;
- link fields for approved CTAs;
- WYSIWYG only for editorial body copy that requires limited formatting.

The field order should mirror the approved design order.

## 1.3 One schema for all branch homepages

The same `SiraBranchHomepage` group is used for:

- Consulting
- Healthcare
- Lifestyle
- Real Estate

The frontend site key and `siraBrand` determine the active brand. The ACF contract supplies content, media, relationships, and approved section copy.

## 1.4 Reuse the Business Unit taxonomy for company branch classification

Do not introduce a duplicate `branchKey` ACF field on Company.

Targeted change:

```text
Attach sira_business_unit to sira_company
```

This lets the Group company portfolio and newsroom use the same canonical branch taxonomy. The frontend maps approved Business Unit term slugs to known SIRA site keys.

## 1.5 ACF radio/button group for singular controlled choices

Use ACF `radio` or `button_group` for singular choices such as:

- homepage variant;
- company operating status;
- banner severity.

Do not use a single-value ACF `select` when a singular GraphQL string is required.

## 1.6 Relationships remain connections

ACF relationship and post-object values should be queried as WPGraphQL for ACF connections:

```graphql
selectedProjects {
  nodes {
    ... on SiraProject {
      id
      title
    }
  }
}
```

The frontend adapters may enforce `max: 1` where only one node is valid.

---

# 2. Proposed ACF field groups

## 2.1 `group_sira_homepage`

### Group configuration

```text
Title: SIRA Homepage
GraphQL field: siraHomepage
GraphQL type: SiraHomepage
GraphQL parent type: Page
Location: Front Page
Show in GraphQL: true
```

### Top-level fields

| ACF field | GraphQL field | Type | Required | Notes |
|---|---|---|---|---|
| `sira_homepage_variant` | `variant` | radio | yes | `group` or `branch`; frontend verifies against site key |
| `sira_group_homepage` | `groupHomepage` | group | conditional | shown when variant is Group |
| `sira_branch_homepage` | `branchHomepage` | group | conditional | shown when variant is Branch |

Conceptual schema:

```graphql
type SiraHomepage {
  variant: String
  groupHomepage: SiraGroupHomepage
  branchHomepage: SiraBranchHomepage
}
```

The frontend treats the string as a validated union:

```ts
type HomepageVariant = "group" | "branch";
```

## 2.2 Reusable homepage primitives

### `SiraHomepageLink`

Use an ACF Link field.

Conceptual fields:

```graphql
type SiraHomepageLink {
  title: String
  url: String
  target: String
}
```

Frontend validation must:

- normalize internal WordPress URLs to the correct public Next.js hostname;
- reject unsafe protocols;
- add external-link behavior only where appropriate;
- never accept an arbitrary GraphQL endpoint or tenant selector.

### `SiraHomepageMetric`

Repeater row:

| Field | Type |
|---|---|
| `value` | text |
| `label` | text |
| `supportingText` | text, optional |

### `SiraHomepageSectionHeader`

Group:

| Field | Type |
|---|---|
| `eyebrow` | text |
| `heading` | text |
| `description` | textarea |
| `link` | link, optional |

These primitives are conceptual contracts; ACF may generate nested type names based on their path. Live introspection will determine exact generated nested type names before frontend codegen.

---

# 3. Group homepage contract

## 3.1 Hero

```text
groupHomepage.hero
├── headingBefore
├── headingHighlight
├── headingAfter
├── description
├── primaryCta
├── secondaryCta
└── slides[]
```

### Hero slide row

| Field | Type | Requirement |
|---|---|---|
| `relatedProject` | post object, `sira_project`, max 1 | optional |
| `relatedCompany` | post object, `sira_company`, max 1 | optional |
| `imageOverride` | image | optional |
| `mobileImageOverride` | image | optional |
| `businessUnit` | taxonomy, `sira_business_unit`, max 1 | required |
| `eyebrowOverride` | text | optional |
| `locationOverride` | text | optional |
| `titleOverride` | text | optional |
| `descriptionOverride` | textarea | optional |
| `primaryCtaOverride` | link | optional |
| `secondaryCtaOverride` | link | optional |
| `imageAltOverride` | text | optional |

Validation rule:

At least one related Project, related Company, or explicit image/title combination must exist.

Ordering is repeater order.

Frontend-owned:

- autoplay enabled/disabled;
- autoplay duration;
- transition duration;
- swipe threshold;
- reduced-motion behavior;
- image scrims;
- slide rail treatment.

## 3.2 Ticker

```text
groupHomepage.ticker
├── enabled
└── items[]
```

Ticker row:

- `label`
- `link`
- optional `businessUnit`

Do not store animation speed in WordPress.

## 3.3 Latest updates

```text
groupHomepage.latestUpdates
├── header
├── sourceMode
├── selectedItems
└── itemLimit
```

`sourceMode` values:

- `latest`
- `curated`

`selectedItems` may target:

- `sira_news`
- `sira_insight`
- `sira_article`
- `sira_press_release`

`itemLimit` should have a constrained editor range. The frontend still enforces its route/layout maximum.

## 3.4 Company portfolio

```text
groupHomepage.companies
├── header
└── selectedCompanies
```

Relationship target:

```text
sira_company
```

Card status and branch come from Company details and Business Unit taxonomy, not from homepage duplicate fields.

## 3.5 About and metrics

```text
groupHomepage.about
├── eyebrow
├── heading
├── body
├── cta
└── metrics[]
```

Use WYSIWYG for `body` only if limited approved formatting is required.

## 3.6 Investor section

```text
groupHomepage.investor
├── eyebrow
├── heading
├── body
├── metrics[]
├── selectedInvestments
├── primaryCta
├── onePagerDocument
├── formHeading
└── formDescription
```

Relationships:

- `selectedInvestments` → `sira_investment`
- `onePagerDocument` → `sira_document`, `sira_download`, or `sira_whitepaper`

Direct files remain hidden. The frontend CTA must use the future approved document-delivery endpoint.

## 3.7 Services, projects, insights, testimonials, partners

Each section contains:

- section header;
- ordered relationship list;
- optional section CTA.

Targets:

| Section | Target post types |
|---|---|
| Services | `sira_service` |
| Projects | `sira_project` |
| Insights | `sira_news`, `sira_insight`, `sira_article`, `sira_press_release` |
| Testimonials | `sira_testimonial` |
| Partners | `sira_partner` |

## 3.8 Contact section

```text
groupHomepage.contact
├── eyebrow
├── heading
├── description
├── formVariant
└── formContext
```

Contact addresses, email, phone, offices, and social profiles remain canonical in `siraBrand`.

No submission data is stored in homepage fields.

---

# 4. Shared branch homepage contract

```text
branchHomepage
├── hero
├── statistics
├── overview
├── focusAreas
├── projects
├── insights
├── contact
└── footer
```

## 4.1 Branch hero

| Field | Type |
|---|---|
| `eyebrow` | text |
| `region` | text |
| `headingBefore` | text |
| `headingHighlight` | text |
| `headingAfter` | text, optional |
| `description` | textarea |
| `image` | image |
| `mobileImage` | image, optional |
| `imageAlt` | text |
| `primaryCta` | link |
| `secondaryCta` | link |

The split title is explicit. The frontend must not derive highlighted words by string slicing.

## 4.2 Statistics

Ordered repeater of `SiraHomepageMetric`.

## 4.3 Overview

```text
overview
├── eyebrow
├── heading
├── body
└── cta
```

## 4.4 Focus areas

Ordered repeater:

- `title`
- `description`

Numbers are derived from order and localized in the frontend.

## 4.5 Projects

- section header;
- selected Projects relationship;
- archive CTA.

## 4.6 Insights

- section header;
- `sourceMode`;
- curated editorial relationship;
- item limit;
- archive CTA.

## 4.7 Contact

- section heading;
- description;
- form variant;
- optional form introduction.

Contact details remain in `siraBrand`.

## 4.8 Footer

- optional tagline override;
- Group-link label override only if translation requires it.

The Group URL comes from the trusted site registry, not an arbitrary CMS hostname.

---

# 5. Company data contract

## 5.1 Taxonomy relationship

Modify the existing Business Unit taxonomy registration to include:

```text
sira_company
```

This is a relationship correction, not a new taxonomy.

## 5.2 `group_sira_company_details`

```text
GraphQL field: companyDetails
GraphQL type: SiraCompanyDetails
Parent: SiraCompany
```

Fields:

| Field | GraphQL | Type |
|---|---|---|
| `sira_company_operating_status` | `operatingStatus` | radio: active, comingSoon, inactive |
| `sira_company_external_url` | `externalWebsiteUrl` | URL |
| `sira_company_short_descriptor` | `shortDescriptor` | text |
| `sira_company_card_image` | `cardImageOverride` | image |

Not needed:

- duplicate branch key;
- CSS color;
- CTA color;
- layout variant;
- arbitrary card HTML.

Publication rules:

- published Company records only;
- `inactive` may remain queryable but should not receive a primary public CTA;
- `comingSoon` cards may render without a single-page link if no public content exists.

---

# 6. Public investment contract

## 6.1 `group_sira_investment_details`

```text
GraphQL field: investmentDetails
GraphQL type: SiraInvestmentDetails
Parent: SiraInvestment
```

Fields:

| Field | GraphQL | Type |
|---|---|---|
| `sira_investment_public_display` | `publicDisplay` | true/false |
| `sira_investment_ticket_size` | `ticketSizeLabel` | text |
| `sira_investment_related_company` | `relatedCompany` | post object, Company |
| `sira_investment_related_project` | `relatedProject` | post object, Project |
| `sira_investment_one_pager` | `onePagerDocument` | post object, Document/Download/Whitepaper |

Reuse existing data:

- stage → `sira_investment_stage`
- market/region → country and region taxonomies
- sector → `sira_sector`
- summary → core excerpt
- body → core content

Privacy rules:

- only published Investments with `publicDisplay=true` may be returned anonymously;
- drafts/private records remain available only to authorized preview users;
- private `SiraInvestor` records are never used for public cards;
- no valuation, diligence, counterparty, or internal financial field is added to this public group.

Implementation must use WPGraphQL model privacy or equivalent object-level protection, not merely hide the ACF group.

---

# 7. Testimonial contract

## 7.1 `group_sira_testimonial_details`

```text
GraphQL field: testimonialDetails
GraphQL type: SiraTestimonialDetails
Parent: SiraTestimonial
```

Fields:

| Field | GraphQL | Type |
|---|---|---|
| `sira_testimonial_role` | `role` | text |
| `sira_testimonial_organization` | `organization` | text |
| `sira_testimonial_consent_approved` | `consentApproved` | true/false |
| `sira_testimonial_consent_recorded_at` | not public by default | date/time |
| `sira_testimonial_source_url` | `sourceUrl` | URL |

Publication rules:

- public anonymous access requires published status and `consentApproved=true`;
- consent timestamp is operational evidence and does not need public GraphQL exposure;
- withdrawal must cause immediate privacy and revalidation;
- homepage relationships must not bypass the model privacy check.

---

# 8. Partner contract

## 8.1 `group_sira_partner_details`

```text
GraphQL field: partnerDetails
GraphQL type: SiraPartnerDetails
Parent: SiraPartner
```

Fields:

| Field | GraphQL | Type |
|---|---|---|
| `sira_partner_website_url` | `websiteUrl` | URL |
| `sira_partner_relationship_label` | `relationshipLabel` | text |
| `sira_partner_logo_alt_override` | `logoAltOverride` | text |

Use featured image as the default partner logo.

---

# 9. Typed banner extension

## 9.1 Backward compatibility

Retain:

```graphql
announcementBanner: String
emergencyBanner: String
```

Add:

```graphql
announcement: SiraBrandBanner
emergency: SiraBrandBanner
```

Proposed type:

```graphql
enum SiraBrandBannerSeverity {
  INFO
  IMPORTANT
  URGENT
}

type SiraBrandBanner {
  message: String!
  severity: SiraBrandBannerSeverity!
  link: SiraBrandLink
  startsAt: String
  endsAt: String
  dismissible: Boolean!
  revisionKey: String!
}
```

Proposed options fields:

- message;
- severity;
- link;
- start date/time;
- end date/time;
- dismissible.

Resolver behavior:

- return `null` outside the approved schedule;
- generate `revisionKey` from public banner content and schedule;
- use UTC internally;
- never expose unpublished draft banner values to anonymous requests;
- retain legacy strings as fallback during migration.

This change is not required for homepage data implementation and can be implemented as a separately approved Step 2C.2 substage before the production header.

---

# 10. Navigation planning

## Preferred path

Use native WordPress menus and WPGraphQL when all of these pass:

1. menus are assigned to stable menu locations;
2. anonymous GraphQL can query them;
3. menu items preserve hierarchy;
4. internal WordPress URLs can be normalized safely;
5. the setup survives the headless theme/cutover plan.

Proposed locations:

```text
sira-primary
sira-footer-pages
sira-footer-companies
sira-footer-legal
```

Required per site and locale.

## Fallback path

If stable menu locations cannot survive the selected WordPress theme strategy, add a small curated `siraNavigation` GraphQL schema that resolves only explicitly approved menus.

Do not globally make every unassigned menu public.

Planning decision required before implementation:

- which WordPress theme remains active after Bricks;
- whether stable menu locations are registered by that theme or by `sira-core`;
- whether Arabic uses separate menus or translated menu objects.

---

# 11. Editorial feed planning

## Live-schema inspection first

The implementation stage must introspect whether the active WPGraphQL schema has a root connection capable of:

- querying News, Insights, Articles, and Press Releases together;
- filtering by Business Unit;
- ordering by publication date;
- cursor pagination;
- returning type discrimination;
- respecting publication/capability rules.

## If the live schema is sufficient

Use the native connection and add no backend field.

## If insufficient

Create:

```graphql
type RootQuery {
  siraEditorialFeed(
    first: Int
    after: String
    businessUnit: String
    kinds: [SiraEditorialKind!]
  ): SiraEditorialFeedConnection
}
```

The custom connection must:

- use WP_Query-compatible connection resolvers;
- use WPGraphQL loaders/models;
- avoid arbitrary meta queries;
- allow only four approved editorial post types;
- apply public status and capability rules;
- expose a typed ContentNode reference;
- support cache tags for every returned node and the archive.

No custom feed implementation is approved until live introspection proves it necessary.

---

# 12. Multilingual planning boundary

Do not add duplicated fields such as:

```text
heading_en
heading_ar
```

until the multilingual ownership model is approved.

Required decision options:

1. WPML-compatible GraphQL integration;
2. Polylang-compatible GraphQL integration;
3. separate translated Page/CPT records with custom relationships;
4. another explicitly approved model.

The homepage ACF field names remain language-neutral. Translation belongs to translated records or the approved translation layer.

Step 2C.2 implementation may proceed in English only on staging, but production Arabic acceptance requires:

- translated front pages;
- translated related content;
- translated menus;
- locale availability;
- alternate URL relationships;
- preview of the selected locale;
- canonical and hreflang policy.

---

# 13. Rich-text policy

Recommendation:

- use Page homepage WYSIWYG fields for approved page narrative;
- render through a dedicated sanitized rich-text component later;
- reserve `siraBrand.description` for short brand metadata and fallback copy;
- do not use `siraBrand.description` as the canonical homepage About body.

This avoids depending on the current Step 2C plain-text normalization for page-level rich content.

---

# 14. Proposed implementation split

## Step 2C.2A — Live schema and data inventory

Read-only against staging:

- inspect Page/front-page fields;
- inspect ACF generated types;
- inspect native menus and locations;
- inspect `contentNodes` or equivalent cross-type connections;
- inspect media shapes;
- record exact schema hashes for all five sites;
- inventory existing front pages and field values;
- inventory Business Unit terms;
- inventory public/private Investment and Testimonial records.

No source or database mutation.

## Step 2C.2B — Homepage and entity ACF fields

Modify only:

- `AcfIntegration.php`
- `Taxonomies.php` for Company ↔ Business Unit
- schema and visibility documentation

Add:

- SIRA Homepage
- Company Details
- Investment Details
- Testimonial Details
- Partner Details

No custom editorial or navigation resolver yet.

## Step 2C.2C — Visibility safeguards

Add object-level privacy for:

- Investments where `publicDisplay` is false;
- Testimonials where consent is false.

Validate anonymous and authenticated behavior.

## Step 2C.2D — Navigation decision

Either:

- document and validate native assigned menu locations; or
- implement one narrowly scoped curated navigation schema.

## Step 2C.2E — Editorial feed decision

Either:

- document and use native cross-type connection; or
- implement the targeted custom feed.

## Step 2C.2F — Typed banners

Optional before production header implementation, but required before scheduled/dismissible banners are accepted.

This split prevents a large unreviewable backend patch.

---

# 15. GraphQL naming reservation

Reserve these public names now:

```text
SiraHomepage
SiraGroupHomepage
SiraBranchHomepage
SiraCompanyDetails
SiraInvestmentDetails
SiraTestimonialDetails
SiraPartnerDetails
SiraBrandBanner
SiraBrandBannerSeverity
SiraBrandLink
SiraEditorialKind
SiraEditorialFeedConnection
```

Reserve these fields:

```text
Page.siraHomepage
SiraCompany.companyDetails
SiraInvestment.investmentDetails
SiraTestimonial.testimonialDetails
SiraPartner.partnerDetails
SiraBrand.announcement
SiraBrand.emergency
RootQuery.siraEditorialFeed
```

`RootQuery.siraEditorialFeed` is reserved but must not be registered unless native schema inspection fails.

---

# 16. Validation plan for later implementation

## Static

- PHP syntax
- WPCS/PHPCS
- unique ACF keys
- unique GraphQL field/type names
- no collision with existing Step 1 schema
- no `.dc.html` runtime terms
- no direct private file exposure

## Runtime schema

- `Page.siraHomepage`
- every nested homepage group
- every relationship connection
- Company, Investment, Testimonial, Partner details
- Business Unit connection on Company
- no duplicate type names
- schema equality across all five sites

## Data

- Group front page uses `variant=group`
- four branch front pages use `variant=branch`
- no branch site can consume another site’s homepage
- hero slide ordering is preserved
- missing optional relationships return null/empty safely
- no private Investment leaks
- no unapproved Testimonial leaks
- menus preserve parent/child order
- editorial feed paginates consistently

## Preview

- draft front page
- front-page revision
- draft related Project/Company
- scheduled editorial item
- authorized private Investment
- consent-disabled Testimonial remains hidden to unauthorized requests

## Revalidation

Expected tags include:

```text
homepage
post:page:<id>
post:sira_company:<id>
post:sira_project:<id>
post:sira_investment:<id>
post:sira_testimonial:<id>
post:sira_partner:<id>
taxonomy:sira_business_unit
navigation
brand:<siteKey>
```

The existing Step 1F webhook may need only tag mapping extensions, not a new delivery architecture.

---

# 17. Rollback planning

The later field implementation should not delete or rename current ACF fields.

Rollback should:

- remove the new field-group registrations;
- remove the Company ↔ Business Unit relationship addition;
- remove optional custom schema services;
- retain all stored ACF values in post meta;
- leave Step 1 and Step 2C operational;
- require no destructive database migration.

If editors begin entering new homepage data, code rollback will hide those fields but preserve their stored values for restoration.

---

# Approval decisions required before implementation

1. Approve front-page Page as the homepage data owner.
2. Approve fixed Group/Branch groups rather than Flexible Content.
3. Approve Business Unit taxonomy on Company instead of a duplicate branch field.
4. Approve the exact Group and Branch homepage sections.
5. Approve the reduced Company details group.
6. Approve the public Investment details and object-level privacy rule.
7. Approve Testimonial consent fields and object-level privacy rule.
8. Approve Partner details.
9. Approve native-menu-first strategy.
10. Approve live-schema-first editorial-feed strategy.
11. Approve typed banners as a separate optional substage.
12. Confirm the multilingual model may remain unresolved during English staging implementation.
13. Approve the Step 2C.2A–2C.2F implementation split.

No implementation should begin until these decisions are approved.
