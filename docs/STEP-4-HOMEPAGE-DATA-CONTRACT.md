# Step 4 — Homepage Production Data Contract Expansion

Status: IMPLEMENTED — PENDING OWNER REVIEW

Baseline: `main@269a28cd1db15666aebc9cbe2f73c8718997fc30`

This is the first controlled implementation increment of Step 4 — Production Component Implementation. It closes only the frontend portion of `2C4-B01` by expanding the existing typed homepage operation and server normalization boundary. Step 4 as a whole is not complete, and no GroupHomepage or BranchHomepage visual implementation is included.

## Contract implemented

- One `SiraHomepage` operation continues to serve Group and all four independent branch tenants.
- Group data now covers the fixed schema-backed hero/slides, ticker, latest updates, companies, about/metrics, investor presentation, services, projects, insights, testimonials, partners, and contact groups.
- Branch data now covers the fixed schema-backed hero, statistics, overview, focus areas, projects, insights, contact, and footer presentation groups.
- Banner data remains in the established typed brand operation and is intentionally not duplicated.
- Native navigation, editorial feeds, project archives, and project-single operations remain unchanged.

## Query and normalization decisions

Homepage relationships use intentionally smaller card fragments rather than duplicating the mature archive/detail operations. The homepage fragments request only identity, public restriction signals, card copy, safe media metadata, and the detail fields required by the approved page systems.

All relationship limits come from the checked-in `PresentationFields.php` field definitions:

| Relationship | Bound |
| --- | ---: |
| hero project/company/business unit, ticker business unit, one-pager | 1 |
| selected investments | 6 |
| selected testimonials | 8 |
| companies, services, projects, editorial selections | 12 |
| partners | 24 |

Every relationship selects `pageInfo.hasNextPage`. A result that reports another page is not exposed as a partial list; its normalized selection is `invalid` with `relationship-truncated`. Null and empty optional relationships remain explicit empty states.

The normalized domain model rejects restricted nodes and malformed restriction signals. Investments require `publicDisplay=true`, and testimonials require `consentApproved=true`. It preserves safe media URL, alt text, width, and height only; remote image-origin policy remains outside this increment. One-pager records expose public document metadata only and do not query file-delivery fields.

The canonical schema contains no `ServiceDetails` or equivalent service presentation field group. Service homepage cards therefore use only the proven common content-node fields and featured media. No backend field was added or inferred.

Tenant ownership remains at the trusted `SiteKey` transport boundary: the same site key selects both the WordPress endpoint/blog mapping and the normalized result identity. The homepage schema does not expose a tenant identity field that could independently distinguish one branch payload from another, so no speculative payload field or cross-tenant fallback was introduced. Tests assert all five registry keys map to their own GraphQL/blog configuration and that Group/Branch variants cannot cross the variant boundary.

## Explicitly unchanged boundaries

- visual homepage components and current page scaffold;
- application routes;
- WordPress content/configuration and `sira-core`;
- backend GraphQL schema;
- native navigation;
- form submission architecture;
- media-origin authorization and `next.config.ts`;
- multilingual routing and hreflang;
- PREVIEW-AUTH-001;
- Step 3D.2, Step 3D.3, B04, B07, B08, and B09;
- deployment, staging, DNS, and production cutover.

## Durable state

Step 4 discovery is complete. The homepage production data-contract increment is implemented on a feature branch and awaits owner review, exact-head CI, and an explicit owner merge decision. Visual component implementation remains NOT STARTED. This record must not be interpreted as Step 4 acceptance or completion.
