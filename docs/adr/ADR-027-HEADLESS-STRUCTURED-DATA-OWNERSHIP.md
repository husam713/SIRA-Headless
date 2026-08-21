# ADR-027 — Headless Structured Data Ownership

- **Status:** Owner-authorized and implemented for Step 3D.1; pending PR review
- **Date:** 2026-08-21
- **Scope:** Current executable tenant homepage route only

## Decision

The public Next.js application owns structured data for the headless public
sites. On the current executable homepage route it emits only:

- `Organization`;
- `WebSite`.

Both schema objects are built from the trusted `SiteKey`, approved canonical
production hostname registry, and that tenant's resolved brand contract.
Arbitrary request hosts never establish structured-data identity.

`backend/src/Schema/OrganizationSchema.php` remains a compatibility fallback
for WordPress-rendered pages. It remains disabled by default in headless mode
and must not become a competing public schema owner.

## Canonical and environment behavior

Canonical production hosts emit canonical production identity.

Explicitly allowlisted deployment hosts may render the same structured data,
but every identity URL still points to the tenant's approved production
canonical origin. Existing metadata and proxy controls continue to make those
hosts noindex.

Redirect aliases continue to redirect to the canonical production host.
Unknown hosts continue to fail closed. Neither class can select a different
tenant or become schema identity.

## Safety and tenant isolation

The structured-data builder rejects a resolved brand whose `siteKey` or brand
key does not match the requested trusted tenant. Optional properties are
omitted when absent, and social-profile values are emitted only when they are
valid public HTTP(S) URLs without credentials.

One reusable serializer escapes `<`, `>`, `&`, U+2028, and U+2029 before JSON
is inserted into an `application/ld+json` script. This prevents CMS text from
terminating the script element while preserving valid JSON values.

## Deferred schema and SEO policy

No current executable content route and complete data contract supports
`Article`, `NewsArticle`, `Project`, `Service`, `Event`, `JobPosting`,
`FAQPage`, `Person`, or `LocalBusiness` schema. They are intentionally absent.
`SearchAction` is absent because there is no executable public search route.

Step 3D.1 creates no localized route or alternate URL. No `hreflang` is
emitted until the multilingual route model is approved.

Legacy redirect inventory, pagination grammar, and Business Unit filter route
policy remain outside this decision.

## Consequences

- Headless public schema ownership is singular and explicit.
- The WordPress compatibility fallback remains unchanged and default-off.
- Deployment environments preserve production canonical identity without
  becoming indexable.
- Future schema types must be added only with an executable route and a
  complete evidence-valid data contract.
