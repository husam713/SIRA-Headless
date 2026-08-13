# Step 2C.3D WordPress Content Readiness Audit

## Executive summary

All five SIRA tenants were inspected independently on 2026-08-13 through their already-configured, read-only public WPGraphQL endpoints. The audit used only coordinates supported by the accepted B1–B7 operations and checked-in canonical schema. It stored no raw payload, endpoint, credential, private body, or unpublished sensitive record.

The audit produced 55 site/area classifications:

| Classification | Count |
| --- | ---: |
| READY | 18 |
| MISSING_CONTENT | 1 |
| MISSING_CONFIGURATION | 23 |
| DATA_CORRECTION_REQUIRED | 2 |
| EDITORIAL_ACTION | 3 |
| OWNER_DECISION | 8 |
| BLOCKED | 0 |

The historical readiness findings remain materially current: Group is the only configured static front page, no tenant exposes an assigned PRIMARY/FOOTER/LEGAL menu, and the Group/Healthcare brand identity discrepancies remain uncorrected. Group has meaningful published editorial/project records, but its homepage structure and project-card media are incomplete. Branch editorial/project collections are valid-empty; owner decisions are required before treating those empty states as missing launch content.

## Evidence and limits

- Accepted baseline: `main@4f306733b3e45bee4244688186e5ecae570fcb8b`.
- Safe machine evidence: `artifacts/step-2c3d/content-readiness.json`.
- Audit mechanism: `frontend/scripts/content-readiness-audit.mjs`.
- Mode: anonymous/public, read-only GraphQL metadata; no introspection.
- Result-bearing content connections report `truncated=false`; native menu assignment queries returned zero and the relevant Business Unit term collection is also untruncated.
- Public GraphQL proves published frontend readiness. Draft/private totals, private restriction counts, and WordPress-admin provenance remain unavailable without separate authorized admin/WP-CLI evidence. This does not prevent a deterministic correction plan for the public contracts.

## Five-site readiness matrix

| Site | Front page | Primary menu | Footer menu | Legal menu | Business Unit | Editorial | Projects | Brand | Announcement | Emergency | Media |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Group | MISSING_CONTENT | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | READY | READY | EDITORIAL_ACTION | DATA_CORRECTION_REQUIRED | READY | READY | EDITORIAL_ACTION |
| Consulting | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | OWNER_DECISION | OWNER_DECISION | READY | READY | READY | READY |
| Healthcare | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | OWNER_DECISION | OWNER_DECISION | DATA_CORRECTION_REQUIRED | READY | READY | EDITORIAL_ACTION |
| Lifestyle | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | OWNER_DECISION | OWNER_DECISION | READY | READY | READY | READY |
| Real Estate | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | OWNER_DECISION | OWNER_DECISION | READY | READY | READY | READY |

## Detailed findings

The machine-readable artifact contains one complete correction-manifest record per non-READY site/area cell. The following consolidates identical actions without losing tenant scope.

### Static front pages

- **Group — MISSING_CONTENT:** `showOnFront=page`, `pageOnFront=457`; published Page 457 resolves at `/`, is the front page, and has variant `group`. All four accepted Group hero fields are empty. Expected: approved structured Group homepage content. Owner: `EDITORIAL_ACTION`. Destructive: no. Mutation authorized: no. Verify by rerunning the accepted Homepage query.
- **Consulting, Healthcare, Lifestyle, Real Estate — MISSING_CONFIGURATION:** each reports `showOnFront=posts`, `pageOnFront=0`, and `page(id: "/", idType: URI)=null`. Expected: an approved published Branch homepage assigned as static front page. Owner: `CMS_ADMIN_ACTION` after editorial approval. Destructive: no. Mutation authorized: no. Verify through `readingSettings` and the accepted Homepage query.

### Native menus

- **All five sites — MISSING_CONFIGURATION:** PRIMARY, FOOTER, and LEGAL each return zero native assigned menus. Expected: exactly one approved usable native menu per logical location. Owner: `CMS_ADMIN_ACTION`, with editorial/owner approval of link structure and labels. Destructive: no. Mutation authorized: no. Verify using the accepted Navigation operation, including hierarchy and URL checks.

### Business Unit taxonomy

- **Group — READY:** the unfiltered root contract remains correct. Group exposes exact terms `consulting` (ID 60), `healthcare` (62), `lifestyle` (61), and `real-estate` (59). Each term has exactly one accepted editorial assignment, each a `SiraNewsItem`; the four assignments collectively account for the four items in the unfiltered accepted feed. No `realestate` slug drift exists.
- **Consulting, Healthcare, Lifestyle, Real Estate — MISSING_CONFIGURATION:** the exact mapped term lookup is null and the local term collection is empty on each branch. Expected exact slugs: `consulting`, `healthcare`, `lifestyle`, `real-estate`. Owner: `CMS_ADMIN_ACTION`. Destructive: no. Mutation authorized: no. Create exact terms and assign only relevant accepted editorial records; verify by querying the native term and its server-filtered `contentNodes` connection.

### Editorial content

- **Group — READY:** four published accepted-family items, all `SiraNewsItem`; titles, URIs, dates, and excerpts are usable; no restricted/unsafe item surfaced. The feed is correctly unfiltered. Featured media is absent on all four, but the accepted editorial contract treats it as optional.
- **All four branches — OWNER_DECISION:** each native root accepted-family feed is empty and untruncated. The exact server-filtered connection is not yet available because its required Business Unit term is missing; this is separately classified as `MISSING_CONFIGURATION`. The root empty state is technically valid, so the owner must decide whether each branch intentionally launches empty. If not, owner: `EDITORIAL_ACTION` after canonical Business Unit term creation. Verify through the accepted root and server-filtered feed operations.

### Projects

- **Group — EDITORIAL_ACTION:** three published projects; titles, URIs, excerpts, locations, statuses, rendered content, and related companies are usable. All three lack featured images and subtitles. Gallery/statistics are empty; whether those optional detail sections are needed is a later editorial/design choice. Owner: `EDITORIAL_ACTION`. Destructive: no. Mutation authorized: no. Verify through accepted Archive and Single operations.
- **All four branches — OWNER_DECISION:** zero public projects, untruncated. The empty archive is contract-valid. The owner must decide whether launch projects are required; if yes, commission editorial creation rather than frontend fallbacks. Mutation authorized: no.

### Brand identity

- **Group — DATA_CORRECTION_REQUIRED:** live `name="SIRA Global Logo"`, primary `#cccccc`, secondary `#5b5b5b`; approved repository identity is `SIRA GROUP`, primary/accent `#cca34b`, secondary `#172232`, paper `#f7f4ed`, ink `#20242b`. Owner: `CMS_ADMIN_ACTION`. Destructive: no. Mutation authorized: no. Verify exact `siraBrand` effective values.
- **Healthcare — DATA_CORRECTION_REQUIRED:** live `name="SIRA Health"`, primary `#1e73be`, secondary `#81d742`, accent `#8224e3`; approved repository identity is `SIRA Healthcare`, primary/accent `#2c6dad`, secondary `#12283f`, paper `#f3f7fb`, ink `#1f2932`. Owner: `CMS_ADMIN_ACTION`. Destructive: no. Mutation authorized: no. Verify exact `siraBrand` effective values.
- **Consulting, Lifestyle, Real Estate — READY:** key, name, tagline, and all five identity colors match the approved repository identity evidence. Missing remote logo/mark values are safely covered by accepted static presentation assets and are not classified as a CMS correctness failure.

### Announcement and emergency

- **All sites — READY:** null typed banners are valid by contract. Group, Consulting, Lifestyle, and Real Estate have null announcement/emergency values.
- **Healthcare — READY:** announcement is populated, structurally valid, `INFO`, has a safe link and revision key, and has no start/end bound (currently active). Emergency is null. No stale or malformed scheduled banner was found.

### Media

- **Group — EDITORIAL_ACTION:** the brand logo has safe dimensions/URL but lacks alt text; the brand mark is absent; all three published project cards lack featured images. Owner: `EDITORIAL_ACTION`. Destructive: no. Mutation authorized: no.
- **Healthcare — EDITORIAL_ACTION:** the brand mark has safe dimensions/URL but lacks alt text. Owner: `EDITORIAL_ACTION`. Destructive: no. Mutation authorized: no.
- **Consulting, Lifestyle, Real Estate — READY:** no live content currently requires media through the accepted published data contracts; no unsafe/restricted media surfaced.

## Action ownership

### CMS_ADMIN_ACTION

1. Correct Group and Healthcare canonical brand fields using approved repository evidence.
2. Create/select and assign approved static front pages for Consulting, Healthcare, Lifestyle, and Real Estate.
3. Create and assign PRIMARY, FOOTER, and LEGAL native menus on all five sites after link approval.
4. Create exact branch Business Unit terms and assign relevant accepted editorial records.

### EDITORIAL_ACTION

1. Supply and approve Group structured homepage content.
2. Supply Group project featured images, useful alt text, and subtitles.
3. Supply missing Group logo/mark accessibility/media data and Healthcare mark alt text.
4. Create branch editorial/project content only where owner launch decisions require it.

### OWNER_DECISION

1. Decide whether each branch intentionally launches with an empty editorial feed.
2. Decide whether each branch requires projects at launch.
3. Approve branch homepage content and native menu information architecture before CMS administration.

### FUTURE_FRONTEND_STAGE

- Gallery/statistics presentation requirements, rich HTML rendering/sanitization, image optimization, production design/components, preview, SEO, canonical-domain/redirect decisions, and deployment remain later governed stages.

### BLOCKED

- None for public CMS readiness planning.
- Admin-only draft/private totals and provenance were not inspected; they require separately authorized WordPress admin/WP-CLI evidence if the owner later requires them.

## Security and mutation record

- WordPress mutations: none.
- Backend changes: none.
- Runtime GraphQL/generated/adapters/domain/UI changes: none.
- Live introspection/schema fetch: none.
- Credentials/endpoints/private bodies persisted: none.
- Production deployment: none.
- `SOT-001`: OPEN.

## Audit conclusion

All five required tenants and all required public contract areas were inspected. Missing/incorrect CMS state is classified with deterministic non-destructive follow-up actions, and no unresolved evidence gap prevents planning. Step 2C.3D remains in progress pending owner review and separately authorized CMS corrections.

STEP_2C3D_AUDIT_READY_FOR_OWNER_REVIEW
