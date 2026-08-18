# Step 3 — Preview / SEO / Discovery

## Status

**Authorized for repository/frontend engineering.**

Canonical start baseline: `main@54b6c6696347a03217134af18bc50c675435e42d`.

This stage does not authorize WordPress mutation, Batch A, Step 2C.5C, external staging provisioning, production deployment, DNS changes, Group production cutover, destruction of the legacy Group site, or production CMS/database operations.

## Repository-derived scope

Step 2C.4 established `2C4-B10` as the missing SEO/preview architecture blocking production release. Current repository evidence decomposes Step 3 into four reviewable increments:

1. **Step 3A — Host / Discovery Boundary**
   - preserve the approved production canonical topology;
   - distinguish permanent redirect aliases from environment deployment hosts;
   - allow a future human-confirmed Group staging hostname to serve the Group tenant without redirecting to production;
   - keep environment hosts out of canonical SEO ownership;
   - remove invented staging hostnames from repository examples/tests.
2. **Step 3B — Canonical Metadata / Robots / Sitemap**
   - replace generic static metadata with tenant-aware `generateMetadata()` contracts;
   - generate canonical public URLs only from the approved production topology;
   - define noindex behavior for non-production deployment/preview environments;
   - implement tenant-isolated `robots.txt` and sitemap discovery boundaries;
   - define Open Graph/Twitter metadata from evidence-backed fields only.
3. **Step 3C — Authenticated Draft Preview Entry / Exit**
   - implement Draft Mode entry only after the repository proves the WordPress authentication mechanism for unpublished content;
   - validate tenant, post type, post identifier, and destination server-side;
   - prevent open redirects and cross-tenant preview routing;
   - use server-only secrets and `no-store` preview data access;
   - implement safe preview exit and preview-state clearing.
4. **Step 3D — Structured Data / Redirect / Hreflang Closure**
   - establish headless JSON-LD ownership and prevent duplicate Organization/Article/schema output;
   - define evidence-valid schema types by route family;
   - complete legacy redirect policy, pagination canonical policy, branch filter index policy, and locale/hreflang behavior after the multilingual route model is approved.

## Current preview architecture

Confirmed repository capabilities:

- `frontend/src/lib/graphql/preview-client.ts` is server-only.
- Preview GraphQL requests use `cache: "no-store"`.
- Preview GraphQL requests can send a Bearer authorization header to the tenant-specific WordPress GraphQL endpoint.
- Shared GraphQL tracing records endpoint hostname, site key, operation name, duration, outcome, and HTTP status; it does not log authorization values.
- Shared GraphQL transport rejects upstream redirects with `redirect: "error"`.

Not yet implemented/evidenced:

- no Next.js Draft Mode entry route;
- no preview exit route;
- no repository-proven WordPress mechanism that issues or validates the preview Bearer credential;
- no signed WordPress-to-Next preview redirect contract;
- no unpublished-content preview query contract tied to the editor flow.

`SIRA_WP_PREVIEW_BEARER_TOKEN` remains only a reserved example variable. It must not be treated as an approved authentication architecture until backend/live evidence proves how it is provisioned and authorized.

The backend HMAC revalidation webhook is a separate cache-invalidation mechanism and must not be silently repurposed as preview authentication.

## Current SEO / discovery architecture

- Canonical production hosts are already approved and hardcoded in the tenant registry.
- Current site layout metadata is generic static `SIRA Enterprise` metadata; page-system `generateMetadata()` orchestration is absent.
- The checked-in live WPGraphQL contract contains no evidenced Yoast/SEO field integration. Do not query unproven Yoast fields.
- `backend/src/Schema/OrganizationSchema.php` is a WordPress-rendered compatibility fallback, disabled by default in headless mode and suppressed when Yoast or Rank Math is active. Step 3 must preserve it while preventing duplicate headless JSON-LD.
- No complete repository-owned sitemap/robots/canonical/hreflang policy is implemented yet.

## Canonical public topology

The production canonical topology remains:

- Group: `siratrgroup.com`
- Consulting: `consulting.siratrgroup.com`
- Healthcare: `healthcare.siratrgroup.com`
- Lifestyle: `lifestyle.siratrgroup.com`
- Real Estate: `realestate.siratrgroup.com`

These are canonical public production hosts only. They do not establish WordPress, GraphQL, media, staging, Vercel preview, cookie, CORS, or revalidation origins.

## Group staging constraint

Until a real Group staging hostname is human-confirmed, use only the symbolic label:

`GROUP_STAGING_HOST`

Do not persist an invented staging DNS name in repository configuration, tests, documentation, or metadata.

After a hostname is confirmed, it may be registered as a **deployment hostname** for the Group tenant. A deployment hostname maps to the same Group application/site identity but does not become the public canonical URL and does not redirect to production merely because it is noncanonical.

The same accepted Next.js implementation/commit must serve staging and later production through environment-specific configuration.

## Branch tenant safety

Consulting, Healthcare, Lifestyle, and Real Estate remain independent tenants. Host resolution, WordPress endpoint selection, editorial state, preview authorization, metadata, canonical URLs, discovery output, and cache behavior must remain site-key scoped.

No Step 3 implementation may collapse branch behavior into Group behavior or allow one tenant's hostname/preview input to select another tenant's CMS endpoint.

## Security invariants

Step 3 implementation must preserve these invariants:

- arbitrary Host input never selects a tenant;
- unknown hosts fail closed;
- direct internal tenant routes remain inaccessible publicly;
- only explicit redirect aliases may redirect to canonical production hosts;
- deployment hosts must be explicitly allowlisted server-side;
- preview secrets remain server-only and never enter client JavaScript or logs;
- preview data is never shared-cacheable;
- preview destinations are same-origin/internal allowlisted paths only;
- tenant, post type, post identifier, and preview destination are validated before preview state is enabled;
- unpublished content requires authenticated server-side WordPress access;
- preview exit clears Draft Mode state safely.

## Known unresolved decisions / dependencies

- exact WordPress preview authentication mechanism: **UNKNOWN**;
- actual Group staging hostname: **UNKNOWN / HUMAN_CONFIRMATION_REQUIRED**;
- Vercel preview hostname policy: **UNKNOWN**;
- WordPress/GraphQL/media origins for production deployment: **UNKNOWN**;
- multilingual ownership and final locale route model (`2C4-B09`): **UNRESOLVED**;
- remote media allowlist/delivery policy (`2C4-B07`): **BLOCKING production images**;
- legacy redirect inventory and final redirect map: **not yet established**.

These unknowns do not block Step 3A. They gate later Step 3 increments where the missing decision is material.

## Step 3A acceptance boundary

Step 3A is complete only when:

- production canonical hosts are unchanged;
- permanent aliases remain canonical redirects;
- environment deployment hosts resolve to exactly one tenant without redirecting to production;
- duplicate/cross-tenant host registrations fail closed;
- unknown hosts and exposed internal tenant paths fail closed;
- repository examples contain no invented staging domain;
- `GROUP_STAGING_HOST` remains symbolic only;
- focused hostname/proxy tests, full regression, lint, typecheck, production build, and exact-head CI pass;
- production/CMS authorization gates remain unchanged.
