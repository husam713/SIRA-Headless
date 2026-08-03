# Step 2C.2A source-verified baseline

This baseline records only what is supported by the approved source artifacts
and prior accepted stages. It is not a substitute for the live output.

## Backend contract already approved

- 28 SIRA custom post types are registered for WPGraphQL.
- 10 SIRA taxonomies are registered for WPGraphQL.
- `RootQuery.siraBrand` is the curated public brand contract.
- Project ACF data is exposed as `projectDetails`.
- People ACF data is exposed as `personDetails`.
- Document metadata is exposed as `documentDetails`.
- person email, direct document files, raw ACF options, analytics identifiers,
  and protected legacy `_sira_*` meta are not public contracts.
- `SiraInvestor` is not publicly queryable.
- `sira_business_unit` currently classifies editorial/service/job content; the
  planned Company relationship has not been implemented.
- no `Page.siraHomepage` contract has been implemented.
- no `SiraCompany.companyDetails` contract has been implemented.
- no `SiraInvestment.investmentDetails` contract has been implemented.
- no `SiraTestimonial.testimonialDetails` contract has been implemented.
- no `SiraPartner.partnerDetails` contract has been implemented.
- no typed `SiraBrand.announcement` or `SiraBrand.emergency` object has been
  implemented.
- `RootQuery.siraEditorialFeed` is reserved in planning only and must not be
  assumed to exist.

## Frontend contract already approved

- production hostnames are allowlisted under `siratrgroup.com`;
- one trusted `SiteKey` selects one server-only GraphQL endpoint;
- published and preview GraphQL transports are separated;
- the live schema snapshot is intentionally not fabricated;
- the five identity colors are WordPress-owned;
- semantic presentation tokens and fallback assets are frontend-owned;
- `siraBrand.key` must match the requested site key;
- the current diagnostic layout is not the production component library.

## Live questions this inventory must answer

1. Are all five schemas identical?
2. Is public or authenticated introspection enabled?
3. Does each endpoint expose the required SIRA root fields and types?
4. Does each site have exactly one configured static front page?
5. What active theme and menu locations exist on each site?
6. Which menus are assigned and publicly queryable?
7. Does the live schema expose a usable cross-type `contentNodes` connection?
8. What exact Business Unit term slugs exist?
9. Are the current ACF field groups mapped exactly as expected?
10. Do any live records already contain proposed public-display or consent meta?
11. Are plugin versions aligned across the network?
12. Does `siraBrand.key` match each endpoint's intended site key?

No live result should be inferred from source code alone.
