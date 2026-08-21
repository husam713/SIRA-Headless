# Step 3D.1 — Headless Structured Data Ownership + Current-Route SEO Policy

## Status

**IMPLEMENTED / LOCAL VALIDATION PASS / DRAFT PR #27 / PENDING OWNER REVIEW**

Authorized baseline:
`main@024e58d679e94e655945c1a07e5bed07d9a62800`.

This increment is repository/frontend-only. It does not authorize or perform
WordPress mutation, backend deployment, production deployment, staging
provisioning, DNS changes, production cutover, or protected-branch merge.

## Pre-implementation audit

- Current executable public content route family: the tenant homepage at `/`.
- Other executable route handlers: health, Preview Entry/Exit, `robots.txt`,
  and `sitemap.xml`; none establishes a public content-detail schema family.
- Existing frontend JSON-LD before this increment: none.
- WordPress schema ownership: `OrganizationSchema.php` is a default-off
  compatibility fallback and is also suppressed when Yoast or Rank Math owns
  WordPress-rendered output.
- Canonical authority: `frontend/src/lib/seo/canonical.ts`, backed by the
  allowlisted tenant registry in `frontend/src/config/sites.ts`.
- Host classes: canonical production, redirect alias, explicitly allowlisted
  deployment, and unknown/fail-closed.
- Existing metadata behavior: deployment or otherwise noncanonical contexts
  retain production canonical URLs but are noindex; redirects and unknown
  hosts retain their existing proxy/discovery behavior.
- Evidence-valid schema types for the current route: `Organization` and
  `WebSite` only.

No evidence materially contradicted the Step 3 discovery report.

## Implementation

`frontend/src/lib/seo/structured-data.tsx` provides:

- typed `Organization` and `WebSite` builders;
- explicit tenant/brand identity matching;
- canonical URL construction through the existing trusted helper;
- omission of absent optional properties;
- public HTTP(S) validation for social-profile URLs;
- one reusable JSON-LD serializer and server-rendered script component.

The tenant layout emits the two schema objects from the same resolved brand
used by metadata and the visible tenant shell. No Client Component or browser
credential is involved.

JSON serialization escapes HTML-significant characters and Unicode line
separators before insertion into the script context. Parsed JSON retains the
original values.

## Current-route SEO boundaries

- `hreflang`: not emitted; no approved locale route exists.
- Legacy redirects: unchanged; Step 3D.2 not started.
- Pagination: no route grammar invented.
- Business Unit filters: no route or canonical policy invented.
- SearchAction: omitted because no public search route exists.
- PREVIEW-AUTH-001: deferred and not reopened.
- WordPress Organization compatibility fallback: unchanged.

## Local validation

- Focused SEO tests: **PASS**, 4 files / 35 tests.
- Full regression: **PASS**, 38 files / 345 tests.
- Typecheck: **PASS**.
- Lint: **PASS**.
- Production build: **PASS**.
- GraphQL schema/static verification: **PASS**.
- GraphQL code generation determinism: **PASS**.
- Existing Draft Mode runtime verification: **PASS**.

Production build emitted expected WordPress configuration fallback warnings
because external WordPress runtime configuration was unavailable. It still
compiled, typechecked, generated every route, and completed successfully.

Draft PR #27 is the review gate. GitHub's Frontend CI check on the current PR
head is the authoritative exact-head CI evidence.

## Rollback

Revert the focused Step 3D.1 commit. No WordPress, database, DNS, external
staging, or production rollback is required because none is modified.

## CURRENT PROJECT STATE

- **Step 3D.1:** IMPLEMENTED / LOCAL VALIDATION PASS / DRAFT PR #27 / PENDING
  OWNER REVIEW.
- **Step 3D.2:** NOT STARTED; no legacy redirect inventory or map implemented.
- **Step 3D.3:** GATED by unresolved multilingual route model `2C4-B09`; no
  `hreflang` activation.
- **PREVIEW-AUTH-001:** DEFERRED; not reopened.
- **Full Step 3D:** NOT CLOSED.
- **WordPress/backend mutation:** none.
- **Deployment/DNS/cutover:** not authorized and not performed.
