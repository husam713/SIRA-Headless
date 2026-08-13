# Step 2C.3D WordPress Content Readiness Audit

## Executive summary

All five SIRA tenants were inspected independently on 2026-08-13 through already-configured, read-only public WPGraphQL endpoints. No raw payload, endpoint, credential, private body, or unpublished sensitive record was stored.

The public matrix represents launch readiness, not merely GraphQL validity. Owner clarification establishes that existing WordPress business/editorial records are not approved authoritative launch content. Published status and structurally valid data remain useful technical evidence, but do not establish editorial approval.

| Classification | Count |
| --- | ---: |
| READY | 17 |
| MISSING_CONTENT | 0 |
| MISSING_CONFIGURATION | 23 |
| DATA_CORRECTION_REQUIRED | 2 |
| EDITORIAL_ACTION | 13 |
| OWNER_DECISION | 0 |
| BLOCKED | 0 |

## Technical readiness and content authority

The artifact preserves three separate layers:

1. `technicalReadinessMatrix` derives contract/configuration quality from live summarized evidence.
2. `contentAuthority.matrix` records `APPROVED_LAUNCH_CONTENT`, `UNAPPROVED_EXISTING_CONTENT`, `NO_CONTENT`, or `NOT_APPLICABLE`.
3. `readinessMatrix` combines those layers into public launch readiness without erasing technical evidence.

Canonical repository brand identity is authoritative independently of editorial records. Structurally valid typed banners remain technically READY, but populated banner copy is not described as owner-approved unless separate approval evidence exists. Missing configuration remains configuration work and is not collapsed into editorial work.

## Evidence and limits

- Accepted baseline: `main@4f306733b3e45bee4244688186e5ecae570fcb8b`.
- Safe machine evidence: `artifacts/step-2c3d/content-readiness.json`.
- Audit mechanism: `frontend/scripts/content-readiness-audit.mjs`.
- Mode: anonymous/public read-only GraphQL metadata; no introspection.
- Result-bearing connections report `truncated=false`.
- Public GraphQL proves technical behavior seen by published frontend contracts. It does not prove editorial approval, draft/private totals, private restriction counts, or WordPress-admin provenance.
- Existing records are described only as existing but not approved as authoritative launch content. The audit does not assert that every record is test/demo content.

## Five-site launch-readiness matrix

| Site | Front page | Primary menu | Footer menu | Legal menu | Business Unit | Editorial | Projects | Brand | Announcement | Emergency | Media |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Group | EDITORIAL_ACTION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | READY | EDITORIAL_ACTION | EDITORIAL_ACTION | DATA_CORRECTION_REQUIRED | READY | READY | EDITORIAL_ACTION |
| Consulting | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | EDITORIAL_ACTION | EDITORIAL_ACTION | READY | READY | READY | READY |
| Healthcare | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | EDITORIAL_ACTION | EDITORIAL_ACTION | DATA_CORRECTION_REQUIRED | READY | READY | EDITORIAL_ACTION |
| Lifestyle | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | EDITORIAL_ACTION | EDITORIAL_ACTION | READY | READY | READY | READY |
| Real Estate | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | MISSING_CONFIGURATION | EDITORIAL_ACTION | EDITORIAL_ACTION | READY | READY | READY | READY |

## Detailed findings

### Static front pages

- **Group — EDITORIAL_ACTION:** technically, `showOnFront=page`, `pageOnFront=457`, and published Page 457 resolves correctly at `/` with variant `group`. Accepted hero content is absent and the existing page is not approved as authoritative launch content.
- **Consulting, Healthcare, Lifestyle, Real Estate — MISSING_CONFIGURATION:** each reports `showOnFront=posts`, `pageOnFront=0`, and no canonical `/` page. Approved branch homepage content is also absent, but static-front-page configuration remains the primary matrix defect.

### Native menus

- **All five sites — MISSING_CONFIGURATION:** PRIMARY, FOOTER, and LEGAL each return zero assigned native menus. Future menu labels/information architecture require approval in addition to technical assignment.

### Business Unit taxonomy

- **Group — READY:** the unfiltered root contract is structurally satisfied. Exact terms `consulting`, `healthcare`, `lifestyle`, and `real-estate` exist and each currently has one technically valid accepted editorial assignment. This does not approve the assigned records as launch content.
- **All branches — MISSING_CONFIGURATION:** the exact mapped local term is absent. Expected slugs remain `consulting`, `healthcare`, `lifestyle`, and `real-estate`.

### Editorial content

- **Group — EDITORIAL_ACTION:** four published `SiraNewsItem` records are technically valid and prove the unfiltered contract works. They are existing but not approved as authoritative launch content. Review, retain or replace editorially, and explicitly approve launch records; do not delete records in this increment.
- **All branches — EDITORIAL_ACTION:** native root feeds are technically valid-empty. Exact filtered connections remain unavailable until Business Unit terms exist. The owner resolved the previous decision: real launch editorial content has not been authored/approved.

### Projects

- **Group — EDITORIAL_ACTION:** three projects prove Archive/Single contract behavior. They are not approved authoritative launch content, and all three lack featured images and subtitles. Review, retain or replace editorially, explicitly approve launch projects, and complete presentation gaps.
- **All branches — EDITORIAL_ACTION:** public project archives are technically valid-empty. Authoritative launch project content has not been authored/approved.

### Brand identity

- **Group — DATA_CORRECTION_REQUIRED:** live identity differs from approved repository identity `SIRA GROUP` and approved colors.
- **Healthcare — DATA_CORRECTION_REQUIRED:** live identity differs from approved repository identity `SIRA Healthcare` and approved colors.
- **Consulting, Lifestyle, Real Estate — READY:** key, name, tagline, and identity colors match authoritative repository evidence.

### Announcement and emergency

- **All sites — technically READY:** null typed banners are contract-valid.
- **Healthcare:** its announcement is structurally valid, active, `INFO`, and has a safe link/revision key. Its copy is separately recorded as `UNAPPROVED_EXISTING_CONTENT`; technical READY does not imply launch-message approval.

### Media

- **Group — EDITORIAL_ACTION:** logo alt is missing, mark is absent, and all three existing projects lack featured images.
- **Healthcare — EDITORIAL_ACTION:** brand mark alt is missing.
- **Consulting, Lifestyle, Real Estate — READY:** no current public accepted-contract record requires additional remote media, and no unsafe/restricted media surfaced.

## Action ownership

### CMS_ADMIN_ACTION

1. Correct Group and Healthcare canonical brand fields using approved repository evidence.
2. Configure approved static front pages for Consulting, Healthcare, Lifestyle, and Real Estate after content approval.
3. Create and assign PRIMARY, FOOTER, and LEGAL menus after labels and information architecture are approved.
4. Create exact branch Business Unit terms and assign only reviewed content.

### EDITORIAL_ACTION

1. Author and explicitly approve Group structured homepage launch content.
2. Review existing Group editorial/project records; retain or replace them editorially and explicitly approve authoritative launch records.
3. Author and approve branch homepage, editorial, and project launch content.
4. Complete required project/media presentation and accessibility metadata.
5. Review populated banner copy separately from its typed technical validity.

### OWNER_DECISION

- None for whether editorial/project launch content is required: the owner clarified that authoritative launch content is not yet populated/approved.
- Subsequent approval of authored content and menu information architecture remains protected editorial/owner work.

### FUTURE_FRONTEND_STAGE

- Rich HTML rendering/sanitization, image optimization, production design/components, preview, SEO, canonical-domain/redirect decisions, and deployment remain later governed stages.

### BLOCKED

- None for public readiness planning.
- Admin-only draft/private totals and provenance remain unavailable without separately authorized admin/WP-CLI evidence.

## Cleanup boundary

No cleanup is authorized. No existing record was modified, deleted, or labelled definitively as test data. Any future cleanup requires a separate record-level manifest with identity, evidence, retain/review/delete recommendation, destructive flag, and separate owner approval.

## Security and mutation record

- WordPress mutations: none.
- Content deletion/cleanup: none.
- Backend changes: none.
- Runtime GraphQL/generated/adapters/domain/UI changes: none.
- Live introspection/schema fetch: none.
- Credentials/endpoints/private bodies persisted: none.
- Production deployment: none.
- `productionAuthorized`: false.
- `SOT-001`: OPEN.

## Audit conclusion

Technical GraphQL contracts are working, CMS configuration remains incomplete, and authoritative launch content is not yet populated/approved. Existing records remain preserved as technical evidence without being promoted to production authority. Step 2C.3D remains in progress pending independent review and separately authorized CMS/editorial work.

STEP_2C3D_CONTENT_AUTHORITY_READY_FOR_INDEPENDENT_REVIEW
