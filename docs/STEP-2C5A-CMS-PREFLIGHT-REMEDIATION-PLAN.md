# Step 2C.5A — CMS Preflight & Remediation Plan

## Status

**READY FOR INDEPENDENT REVIEW**

This stage is a query-only CMS preflight and repository planning increment. It does not authorize or perform WordPress mutation, export, restore, content deletion, backend work, production UI work, Step 3, deployment, or merge.

## Baseline and evidence

- Canonical baseline: `main@710eec3cf90e1a7d707860f9ee73d0abf283019c`
- Latest accepted milestone: Step 2C.4, PR `#14`
- Accepted Step 2C.4 head: `a4d8945bf5b83e304b1b0fb434eb7441ea243849`
- Accepted Step 2C.4 CI: Frontend CI `#29` PASS
- Fresh audit timestamp: `2026-08-14T13:14:26.743Z`
- Tenants inspected: Group, Consulting, Healthcare, Lifestyle, Real Estate — 5/5
- Prior evidence: `artifacts/step-2c3d/content-readiness.json`
- Accepted correction source: `artifacts/step-2c4/cms-correction-manifest.json`
- Fresh evidence: `artifacts/step-2c5a/cms-preflight.json`
- Exact future specifications: `artifacts/step-2c5a/remediation-batches.json`
- Rollback preconditions: `artifacts/step-2c5a/rollback-preconditions.json`

The audit reused the trusted SiteKey-to-endpoint registry and sent anonymous GraphQL query operations only. Endpoint values, authorization headers, cookies, credentials, raw payloads, and unpublished bodies were not persisted. The public endpoints are runtime inputs, not durable evidence of backend, media, staging, preview, cookie, CORS, or revalidation origin policy.

## Five-tenant preflight

The five branch/site identities remain independent WordPress Multisite tenants. The reusable Branch Website System is shared implementation architecture only; it does not imply shared pages, records, menus, media, authority, SEO state, or cache scope.

| Tenant | Front page | Menus | Local Business Unit | Editorial | Projects | Brand / banners | Authority conclusion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Group | Page `457`, `/`, published, `group`; structured display copy unpopulated | PRIMARY/FOOTER/LEGAL unassigned | Not applicable locally; four Group filtering terms remain present | 4 published SIRA News Items | 3 published Projects; all lack featured image and subtitle | Group identity still needs the accepted correction; logo alt absent; no banners | Existing homepage, editorial, projects, and related records are not approved as authoritative launch content |
| Consulting | `showOnFront=posts`, `pageOnFront=0`, no root Page | All three unassigned | Exact local `consulting` term absent | 0 | 0 | Accepted identity evidence remains technically valid; no banners | No homepage/editorial/project content; brand alone has accepted launch authority |
| Healthcare | `showOnFront=posts`, `pageOnFront=0`, no root Page | All three unassigned | Exact local `healthcare` term absent | 0 | 0 | Accepted identity correction still required; mark alt absent; announcement remains technically valid but unapproved | Existing brand/announcement are not approved as authoritative launch content |
| Lifestyle | `showOnFront=posts`, `pageOnFront=0`, no root Page | All three unassigned | Exact local `lifestyle` term absent | 0 | 0 | Identity technically valid; no banners | No homepage/editorial/project content; brand alone has accepted launch authority |
| Real Estate | `showOnFront=posts`, `pageOnFront=0`, no root Page | All three unassigned | Exact local `real-estate` term absent | 0 | 0 | Identity technically valid; no banners | No homepage/editorial/project content; brand alone has accepted launch authority |

The branch front-page failures remain configuration failures, separately classified from editorial work. No site-key hardcoding is introduced. The Group remains an unfiltered root for editorial/projects, while branch filtering still requires tenant-local exact Business Unit terms and assignments.

## Drift assessment

**CONFIRMED: no drift detected in previously observable public coordinates.**

- 5 tenants compared.
- 55 readiness coordinates compared.
- Readiness matrix matches Step 2C.3D.
- Technical readiness matrix matches Step 2C.3D.
- Exact sanitized public site summaries match Step 2C.3D.
- The expanded Group related-entity detail is a new public baseline and is therefore `NOT_COMPARABLE_NEW_PUBLIC_BASELINE`, not evidence of drift.
- Draft/private totals, administrative provenance, and protected settings remain UNKNOWN because anonymous public GraphQL does not expose them.

## Current CMS readiness

| Classification | Count |
| --- | ---: |
| READY | 17 |
| MISSING_CONTENT | 0 |
| MISSING_CONFIGURATION | 23 |
| DATA_CORRECTION_REQUIRED | 2 |
| EDITORIAL_ACTION | 13 |
| OWNER_DECISION | 0 |
| BLOCKED | 0 |

Content authority remains a separate layer with exactly four values:

- `APPROVED_LAUNCH_CONTENT`
- `UNAPPROVED_EXISTING_CONTENT`
- `NO_CONTENT`
- `NOT_APPLICABLE`

A technically valid or published record is never promoted to `APPROVED_LAUNCH_CONTENT` without explicit authority evidence. Existing records are preserved and described as “existing but not approved as authoritative launch content.”

## Structured homepage and Group related-entity evidence

The Group root Page and fixed homepage groups are queryable, but the required public display copy remains absent. Existing non-display configuration values are not authority evidence and cannot supply invented launch content.

| Family | Published records returned | Truncated | Authority | Current gaps |
| --- | ---: | --- | --- | --- |
| Companies | 4 | false | UNAPPROVED_EXISTING_CONTENT | Short descriptor and card/featured media absent |
| Services | 3 | false | UNAPPROVED_EXISTING_CONTENT | Existing `Service` / `serviceItem` contract is queryable; featured media alt text absent |
| Investments | 0 | false | NO_CONTENT | Authoritative content absent |
| Testimonials | 0 | false | NO_CONTENT | Authoritative content absent |
| Partners | 0 | false | NO_CONTENT | Authoritative content absent |
| Documents | 0 | false | NO_CONTENT | Public-document authority and records absent |

This confirms the CMS-2C4-010 Services expectation without inventing a new GraphQL type or field. The future frontend contract remains a bounded adapter over the existing live `Service` content contract.

## Fifteen-action reconciliation

The accepted classifications remain unchanged: **12 BLOCKING, 3 DEFERRED, 0 DESTRUCTIVE, 0 AUTHORIZED**. Every item below is `currentAuthorization=false` and `destructive=false`. Full field-level targets, exclusions, before-state evidence, rollback, validation, failure, and stop conditions are normative in `remediation-batches.json`.

| Action | Fresh evidence / required future action | Owner | Prerequisite gate | Proposed batch |
| --- | --- | --- | --- | --- |
| CMS-2C4-001 | Group brand remains `SIRA Global Logo`, primary `#cccccc`, secondary `#5b5b5b`; later correct only the three accepted identity fields | CMS admin | Mutation authorization and rollback evidence | A |
| CMS-2C4-002 | Healthcare name remains `SIRA HEALTH`; later correct only the accepted name field | CMS admin | Mutation authorization and rollback evidence | A |
| CMS-2C4-003 | Group root exists but structured display copy is absent and no launch authority exists; later populate only approved homepage content | Editorial + CMS admin | Approved copy/media and record-level authority | C |
| CMS-2C4-004 | Four branches remain posts mode with no root Page; later create/approve independent tenant-local homepages and configure Reading Settings | Editorial/owner + CMS admin | Four approved local records, content, and mutation window | B |
| CMS-2C4-005 | All 15 native menu locations remain unassigned; later create/assign tenant-local PRIMARY, FOOTER, LEGAL menus | IA/owner + CMS admin | Approved labels, hierarchy, destinations, targets, legal links, locale policy | B |
| CMS-2C4-006 | Exact branch-local terms remain absent; later term creation is deterministic, record assignments are editorially gated | CMS admin + editorial | Mutation window; assignment list approved separately | A term creation / C assignments |
| CMS-2C4-007 | Four Group editorial records remain valid but unapproved; later preserve and review each record | Editorial | Explicit record-level launch authority | C |
| CMS-2C4-008 | Three Group projects remain valid but unapproved and lack image/subtitle; later review records and populate approved media/subtitles | Editorial + CMS admin | Approved project disposition/copy/media | C |
| CMS-2C4-009 | Branch editorial/projects remain absent; later author approved tenant-local launch records | Editorial | Final approved content, media, and assignments | C |
| CMS-2C4-010 | Companies 4, Services 3, other four families 0; later review/preserve existing records and author only approved missing launch content | Editorial + CMS admin | Authority, final copy/media, public document policy | C |
| CMS-2C4-011 | Group logo and Healthcare mark still lack alt; later write approved alt or mark decorative as applicable | Accessibility/editorial + CMS admin | Approved accessibility decision and wording | C |
| CMS-2C4-012 | Healthcare announcement remains technically valid but unapproved; later retain/change/unpublish only after owner disposition | Owner/security + CMS admin | Explicit announcement decision and mutation authorization | C |
| CMS-2C4-013 | Forms remain deferred | Owner/security/architecture | Provider, consent, retention, abuse, routing decisions | E |
| CMS-2C4-014 | Localization remains deferred | Owner/editorial/architecture | Locale ownership, translation authority, routing model | E |
| CMS-2C4-015 | SEO/preview remains deferred | Step 3 owner/architecture | Accepted Step 3 metadata, preview, hreflang, sitemap, redirect contracts | E |

If a future preflight discovers a backend/schema defect that existing accepted fields/settings cannot solve, that item must be marked `BLOCKED_BY_SOT_001`; no PHP, schema registration, WPGraphQL field, or ACF runtime correction is authorized here.

## Proposed remediation batches

### Batch A — Deterministic CMS Configuration

Proposed scope: CMS-2C4-001, CMS-2C4-002, and CMS-2C4-006 term creation only. These operations have exact current/expected values or exact tenant-local slugs. They still require separate batch-level mutation authorization, a named administrator and rollback operator, applicable RB-001–RB-009 evidence, and a same-window drift check. Record assignments and accessibility wording are excluded.

### Batch B — Independent Front Page and Navigation Configuration

Proposed scope: CMS-2C4-004 and CMS-2C4-005. This remains blocked until all four independent tenant homepage records/content and all fifteen tenant-local menu structures are approved. Database IDs and before-state option/menu assignments must be captured before any setting changes.

### Batch C — Authoritative Launch Content and Accessibility

Proposed scope: CMS-2C4-003, CMS-2C4-006 reviewed assignments, and CMS-2C4-007 through CMS-2C4-012. This remains blocked by record-level editorial authority, approved final copy/media, approved accessibility decisions, the Healthcare announcement disposition, and a separately authorized mutation window. It must preserve all existing records.

### Batch D — Post-remediation read-only verification

After each separately authorized mutation batch, rerun the five-tenant preflight, compare every affected coordinate with captured before/expected state, require zero truncation and safe links/media, prove tenant isolation and exact term slugs, keep technical readiness separate from content authority, and detect any unplanned changes. Failure or UNKNOWN evidence stops advancement.

### Batch E — Deferred architecture-dependent work

CMS-2C4-013 through CMS-2C4-015 stay deferred. No guessed CMS values may be populated from prototype dictionaries or unimplemented contracts.

## Rollback and export preconditions

No export, backup, or restore was performed or claimed in Step 2C.5A. Before a future mutation window:

1. A human administrator must provide a recoverable host-managed network-level WordPress Multisite database backup. A tenant WXR export is insufficient for options, Reading Settings, menu-location assignments, taxonomy/ACF options, and attachment metadata.
2. Each affected tenant must also have a supplemental content export when records, terms, menus, or relationships are in scope.
3. Capture per-record before-state for every changed Page, editorial record, Project, related entity, banner, and attachment.
4. Capture option/settings before-state for brand, Reading Settings, and ACF options.
5. Capture every existing menu/database ID, item hierarchy, safe destination summary, and location assignment.
6. Capture exact taxonomy term slugs/database IDs/counts and reviewed record assignments.
7. Capture attachment database IDs, alt text, dimensions, restriction state, and source-safety result.
8. Maintain an execution ledger of all changed relationships and every created object database ID.
9. Validate restore capability before production cutover using a documented host-appropriate restore check or rehearsal.

Backup/export identifiers, timestamps, checksums, retention windows, responsible administrators, and restore eligibility may be recorded in a protected execution ledger. Private storage paths, credentials, tokens, cookies, and endpoints must not be committed.

## Owner, editorial, CMS admin, and human admin actions

- Deterministic CMS admin after authorization: CMS-2C4-001, CMS-2C4-002, CMS-2C4-006 term creation only.
- CMS admin blocked by editorial/IA: CMS-2C4-004, CMS-2C4-005, CMS-2C4-006 record assignments.
- Editorial authority required: CMS-2C4-003, CMS-2C4-007, CMS-2C4-008, CMS-2C4-009, CMS-2C4-010, CMS-2C4-011.
- Owner/security/architecture required: CMS-2C4-012 through CMS-2C4-015.
- Human admin action: backup/export availability, protected storage ownership, and restore validation.

## Blockers and warnings

- CMS mutation authorization: **NOT GRANTED**.
- Content authority: no homepage/editorial/project/related record is promoted without explicit approval.
- SOT-001: **OPEN**; any new backend/schema correction is `BLOCKED_BY_SOT_001`.
- Admin-private state: UNKNOWN; anonymous public GraphQL cannot prove draft/private totals or administrative provenance.
- Backup/export existence and private storage location: UNKNOWN and not claimed.
- WordPress/backend, GraphQL, media, staging, preview, cookie, CORS, and revalidation origins/policies remain uninferred.
- Canonical public production apex remains the approved `siratrgroup.com`, with four independent public branch hostnames.

## Authorization and boundary confirmation

- WordPress mutation occurred: false
- Content deletion occurred: false
- Backend runtime changes: false
- Generated GraphQL changes: false
- Production UI changes: false
- Dependencies/lockfiles changed: false
- Deployment: false
- Production authorization: false
- SOT-001: OPEN
- Next gate: OWNER ACCEPTANCE

## CURRENT PROJECT STATE

- **Stage:** Step 2C.5A — CMS Preflight & Remediation Plan
- **Status:** READY FOR INDEPENDENT REVIEW
- **Baseline:** `main@710eec3cf90e1a7d707860f9ee73d0abf283019c`
- **Tenant evidence:** 5/5 inspected; no drift in previously observable public coordinates
- **Accepted CMS action counts:** 12 BLOCKING / 3 DEFERRED / 0 DESTRUCTIVE / 0 AUTHORIZED
- **CMS mutation authorization:** NOT GRANTED
- **Production authorization:** false
- **SOT-001:** OPEN
- **Next action:** independent review and owner acceptance decision; do not begin Step 2C.5B
