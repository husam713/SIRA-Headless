# SIRA GraphQL Schema Contract

This document records the Step 1 GraphQL contract. GraphQL type and field
names are treated as versioned API names and should not be renamed after the
Next.js application adopts them without a planned breaking-schema migration.

## Content types

| WordPress post type | GraphQL singular | GraphQL plural | Access recommendation | Archive | Frontend route |
|---|---|---|---|---:|---|
| `sira_company` | `SiraCompany` | `SiraCompanies` | Published public content | Yes | `/companies/{slug}/` |
| `sira_project` | `SiraProject` | `SiraProjects` | Published public content | Yes | `/projects/{slug}/` |
| `sira_investment` | `SiraInvestment` | `SiraInvestments` | Published records; field review required | Yes | `/investments/{slug}/` |
| `sira_portfolio` | `SiraPortfolioItem` | `SiraPortfolioItems` | Published records; field review required | Yes | `/portfolio/{slug}/` |
| `sira_news` | `SiraNewsItem` | `SiraNewsItems` | Published public content | Yes | `/news/{slug}/` |
| `sira_insight` | `SiraInsight` | `SiraInsights` | Published public content | Yes | `/insights/{slug}/` |
| `sira_article` | `SiraArticle` | `SiraArticles` | Published public content | Yes | `/articles/{slug}/` |
| `sira_event` | `SiraEvent` | `SiraEvents` | Published public content | Yes | `/events/{slug}/` |
| `sira_leadership` | `SiraLeadershipProfile` | `SiraLeadershipProfiles` | Published biography fields only | Yes | `/leadership/{slug}/` |
| `sira_executive` | `SiraExecutive` | `SiraExecutives` | Published biography fields only | Yes | `/executives/{slug}/` |
| `sira_board_member` | `SiraBoardMember` | `SiraBoardMembers` | Published biography fields only | Yes | `/board/{slug}/` |
| `sira_partner` | `SiraPartner` | `SiraPartners` | Published public content | Yes | `/partners/{slug}/` |
| `sira_investor` | `SiraInvestor` | `SiraInvestors` | Authenticated only | No | `—` |
| `sira_download` | `SiraDownload` | `SiraDownloads` | Published records; file policy required | Yes | `/downloads/{slug}/` |
| `sira_media_item` | `SiraMediaItem` | `SiraMediaItems` | Approved published records only | Yes | `/media/{slug}/` |
| `sira_case_study` | `SiraCaseStudy` | `SiraCaseStudies` | Published public content | Yes | `/case-studies/{slug}/` |
| `sira_service` | `SiraService` | `SiraServices` | Published public content | Yes | `/services/{slug}/` |
| `sira_office` | `SiraOffice` | `SiraOffices` | Published public content | Yes | `/offices/{slug}/` |
| `sira_testimonial` | `SiraTestimonial` | `SiraTestimonials` | Published and consent-approved only | Yes | `/testimonials/{slug}/` |
| `sira_career` | `SiraCareerArea` | `SiraCareerAreas` | Published public content | Yes | `/careers/{slug}/` |
| `sira_job` | `SiraJob` | `SiraJobs` | Public vacancy content only | Yes | `/jobs/{slug}/` |
| `sira_csr` | `SiraCsrInitiative` | `SiraCsrInitiatives` | Published public content | Yes | `/csr/{slug}/` |
| `sira_award` | `SiraAward` | `SiraAwards` | Published public content | Yes | `/awards/{slug}/` |
| `sira_faq` | `SiraFaq` | `SiraFaqs` | Published public content | Yes | `/faqs/{slug}/` |
| `sira_resource` | `SiraResource` | `SiraResources` | Published public content | Yes | `/resources/{slug}/` |
| `sira_document` | `SiraDocument` | `SiraDocuments` | Published records; file policy required | Yes | `/documents/{slug}/` |
| `sira_press_release` | `SiraPressRelease` | `SiraPressReleases` | Published public content | Yes | `/press-releases/{slug}/` |
| `sira_whitepaper` | `SiraWhitepaper` | `SiraWhitepapers` | Public page; file policy required | Yes | `/whitepapers/{slug}/` |

## Taxonomies

| WordPress taxonomy | GraphQL singular | GraphQL plural | Rewrite slug | Hierarchical | Connected post types |
|---|---|---|---|---:|---|
| `sira_industry` | `SiraIndustry` | `SiraIndustries` | `industry` | Yes | `sira_company`, `sira_project`, `sira_investment`, `sira_case_study` |
| `sira_country` | `SiraCountry` | `SiraCountries` | `country` | Yes | `sira_company`, `sira_project`, `sira_investment`, `sira_office`, `sira_event` |
| `sira_business_unit` | `SiraBusinessUnit` | `SiraBusinessUnits` | `business-unit` | Yes | `sira_project`, `sira_news`, `sira_insight`, `sira_article`, `sira_service`, `sira_job`, `sira_press_release` |
| `sira_investment_stage` | `SiraInvestmentStage` | `SiraInvestmentStages` | `investment-stage` | Yes | `sira_investment`, `sira_portfolio` |
| `sira_sector` | `SiraSector` | `SiraSectors` | `sector` | Yes | `sira_project`, `sira_investment`, `sira_portfolio`, `sira_insight` |
| `sira_project_status` | `SiraProjectStatus` | `SiraProjectStatuses` | `project-status` | Yes | `sira_project` |
| `sira_office_region` | `SiraOfficeRegion` | `SiraOfficeRegions` | `office-region` | Yes | `sira_office` |
| `sira_department` | `SiraDepartment` | `SiraDepartments` | `department` | Yes | `sira_job`, `sira_career`, `sira_leadership`, `sira_executive` |
| `sira_region` | `SiraRegion` | `SiraRegions` | `region` | Yes | `sira_company`, `sira_project`, `sira_investment`, `sira_event`, `sira_office` |
| `sira_resource_category` | `SiraResourceCategory` | `SiraResourceCategories` | `resource-category` | Yes | `sira_download`, `sira_document`, `sira_whitepaper`, `sira_resource` |

## Curated brand root field

```graphql
type RootQuery {
  siraBrand: SiraBrand!
}
```

Public fields include identity, design tokens, approved contact details,
approved social profiles, values, offices, announcement text, emergency text,
and typed logo/mark data.

The schema intentionally excludes:

- analytics identifiers;
- raw WordPress options;
- network option arrays;
- ACF field-reference metadata;
- arbitrary internal settings;
- webhook and preview secrets.

## ACF content groups

- `SiraProject.projectDetails`
- `SiraLeadershipProfile.personDetails`
- `SiraExecutive.personDetails`
- `SiraBoardMember.personDetails`
- `SiraDocument.documentDetails`
- `SiraDownload.documentDetails`
- `SiraWhitepaper.documentDetails`

Person email and direct document-file fields are deliberately absent from the
public schema. The project relationship and gallery fields remain typed
connections. Repeater rows remain typed objects.

## Legacy metadata

The protected `_sira_*` metadata registrations are retained only for migration
compatibility. They are not a public GraphQL or REST contract.

## Validation

Use:

```bash
wp eval-file   wp-content/plugins/sira-core/tools/validation/validate-runtime.php
```

Run the operations in:

```text
tools/validation/graphql-validation.graphql
```

against every Multisite site's GraphQL endpoint.
