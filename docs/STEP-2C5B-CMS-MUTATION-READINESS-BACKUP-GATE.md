# Step 2C.5B — CMS Mutation Readiness & Backup Gate

## Status

**OWNER ACCEPTED / PENDING MERGE**

The owner has accepted the Step 2C.5B readiness plan. Future Batch A mutation authorization is not granted or ready: mutation readiness remains `BLOCKED_BY_BACKUP_EVIDENCE`, network backup and restore evidence are UNKNOWN, and exact live administrative mutation coordinates are not confirmed.

## Scope and authority

- Baseline: `main@f0d0974a75ac49a9c4fd88f0f229fa28a209acfd`
- Latest accepted milestone: Step 2C.5A, PR #15, accepted head `bb6cca02bd97524182e2d53628c5ea9567228ee4`, merge `f0d0974a75ac49a9c4fd88f0f229fa28a209acfd`, Frontend CI #32 PASS.
- Mode: read-only five-tenant CMS preflight, rollback/backup readiness verification, and exact future Batch A planning.
- CMS mutation authorization: `NOT_GRANTED`.
- Batch A mutation authorization: `false`.
- Step 2C.5B plan accepted: `true`.
- Taxonomy deletion authorization: `false`.
- Production authorization: `false`.
- SOT-001: `OPEN`.

Owner acceptance changes only `step2c5bAccepted=true`. It does not set `batchAMutationAuthorized`; a new explicit authorization for a named manifest and same-window evidence package is required.

## Future Batch A boundary

Only these future actions are represented:

1. CMS-2C4-001 — Group identity: change `name`, `primaryColor`, and `secondaryColor` only.
2. CMS-2C4-002 — Healthcare identity: change `name`, `primaryColor`, `secondaryColor`, and `accentColor` only.
3. CMS-2C4-006 — create one exact tenant-local Business Unit term on each branch tenant only.

Business Unit record assignments, Group taxonomy mutation, existing-term edits, taxonomy deletion, content work, pages, menus, media, announcements, backend/schema changes, GraphQL mutations, WP-CLI writes, and direct production commands are excluded.

## Fresh five-tenant preflight

The established read-only audit ran on `2026-08-15T01:34:02.496Z` through the trusted SiteKey registry. It inspected Group, Consulting, Healthcare, Lifestyle, and Real Estate. It persisted no endpoint values, authorization headers, cookies, credentials, or raw protected payloads.

| Scope | Current result | Evidence | Drift |
| --- | --- | --- | --- |
| Group identity | Exact accepted current identity | CONFIRMED / `VALIDATED_UNCHANGED` | None |
| Healthcare identity | Exact accepted current identity | CONFIRMED / `VALIDATED_UNCHANGED` | None |
| Consulting term | `consulting` absent; 0 equivalent collisions; untruncated | CONFIRMED / `VALIDATED_UNCHANGED` | None |
| Healthcare term | `healthcare` absent; 0 equivalent collisions; untruncated | CONFIRMED / `VALIDATED_UNCHANGED` | None |
| Lifestyle term | `lifestyle` absent; 0 equivalent collisions; untruncated | CONFIRMED / `VALIDATED_UNCHANGED` | None |
| Real Estate term | `real-estate` absent; 0 equivalent collisions; untruncated | CONFIRMED / `VALIDATED_UNCHANGED` | None |
| Group terms | Four accepted baseline terms unchanged and untruncated | CONFIRMED / non-target | None |

An observed approved target state without a recorded authorized mutation window is not treated as success. It is recorded as `CHANGED_AS_EXPECTED`, flagged as unexpected, and makes the gate `BLOCKED_BY_DRIFT` pending investigation. For a tenant-local term, `CHANGED_AS_EXPECTED` additionally requires exactly one exact-name/exact-slug term with `totalAssignedObjectCount=0`; any assignment is `DRIFT_DETECTED` and blocks Batch A. Missing required evidence produces `EVIDENCE_UNKNOWN` / `EVIDENCE_BLOCKED`, never readiness.

## Identity before and future expected state

### Group — CMS-2C4-001

| Coordinate | Current | Future approved | Mutation scope |
| --- | --- | --- | --- |
| key | `group` | `group` | Not affected |
| name | `SIRA Global Logo` | `SIRA GROUP` | Affected |
| tagline | `Shaping a smarter future.` | unchanged | Not affected |
| primary | `#cccccc` | `#cca34b` | Affected |
| secondary | `#5b5b5b` | `#172232` | Affected |
| accent | `#cca34b` | unchanged | Not affected |
| paper | `#f7f4ed` | unchanged | Not affected |
| ink | `#20242b` | unchanged | Not affected |

Logo, mark, contacts, values, offices, announcement, and emergency are not affected.

### Healthcare — CMS-2C4-002

| Coordinate | Current | Future approved | Mutation scope |
| --- | --- | --- | --- |
| key | `healthcare` | `healthcare` | Not affected |
| name | `SIRA Health` | `SIRA Healthcare` | Affected |
| tagline | `Advancing diagnostic and healthcare infrastructure.` | unchanged | Not affected |
| primary | `#1e73be` | `#2c6dad` | Affected |
| secondary | `#81d742` | `#12283f` | Affected |
| accent | `#8224e3` | `#2c6dad` | Affected |
| paper | `#f3f7fb` | unchanged | Not affected |
| ink | `#1f2932` | unchanged | Not affected |

Logo, mark, contacts, values, offices, announcement, and emergency are not affected.

## Administrative coordinate evidence

The safest candidate mechanism is WordPress Admin UI, classified `STRONGLY_INFERRED` for both action families. Fresh public evidence confirms the readable output contract. The repository records an ACF SIRA Options screen and tenant-local `sira_business_unit` registration, but the backend tree is not authoritative for current runtime administration while SOT-001 is open.

Accordingly:

- candidate brand coordinate: affected tenant admin → SIRA Options → SIRA Brand & Global Contacts;
- candidate term coordinate: affected tenant admin → tenant-local Sira Business Unit taxonomy;
- exact current live route, capability, screen, and field coordinates: `UNKNOWN`;
- mutation readiness per action: `NOT_READY_FOR_MUTATION_AUTHORIZATION`.

No mutation API, GraphQL write, SQL, REST write, WP-CLI command, or immediately executable production command was created.

## RB-001 through RB-009

| ID | Batch A result | Blocking | Required next evidence |
| --- | --- | --- | --- |
| RB-001 | `UNKNOWN` / NOT RUN | Yes | Human-admin network backup identifier, scope, timestamp, retention, responsibility, restore eligibility, validation |
| RB-002 | Sanitized tenant before-state required; export mechanism undecided | Yes | Group/Healthcare option evidence and four-tenant taxonomy evidence; WXR is supplemental only |
| RB-003 | `NOT_APPLICABLE_TO_BATCH_A_RECORD_MUTATION` | No | Reconfirm zero term assignments; no record IDs fabricated |
| RB-004 | Public values captured; protected live coordinates UNKNOWN | Yes | Confirm exact Group/Healthcare option fields without saving |
| RB-005 | `NOT_APPLICABLE_TO_BATCH_A` | No | Global requirement retained for later menu work |
| RB-006 | Public absence/collision/truncation evidence captured | Same-window recheck | Capture every future created tenant-local databaseId immediately |
| RB-007 | `NOT_APPLICABLE_TO_BATCH_A` | No | Global requirement retained for later media work |
| RB-008 | Ledger schema defined, not executed | No | Complete it during a separately authorized window |
| RB-009 | `UNKNOWN` / NOT RUN | Yes | Human restore-eligibility/validation evidence; no rehearsal in this stage |

A WXR export cannot replace the network-level recovery point because option values and taxonomy configuration are not fully protected by WXR. Step 2C.5B did not create a backup, export, or restore.

## Future execution sequence

The non-executable manifest defines A1 through A15 under one canonical gate order:

1. obtain and validate the approved network recovery point within the owner-approved maximum age;
2. validate applicable RB evidence;
3. run the fresh same-window Batch A preflight and compare exact values;
4. stop on drift, UNKNOWN, collision, or truncation;
5. obtain explicit owner Batch A mutation authorization for that exact manifest/window;
6. begin the first write, with immediate read-only verification after every write;
7. complete full five-tenant Batch A verification;
8. finalize the execution ledger and stop.

Each future mutation operation records exact affected and excluded fields, required RB evidence, success/failure predicates, stop conditions, rollback rules, and ledger fields. The manifest status is `NOT_AUTHORIZED`.

## Rollback rules

- Prefer bounded field reversal from captured before-state when separately authorized.
- A network recovery action requires its own incident/restore authorization.
- No taxonomy deletion is authorized by Step 2C.5B or Batch A.
- If a created-term reversal would require deletion: stop; capture the exact created databaseId; prove same-batch provenance; prove zero unexpected assignments; request explicit rollback/deletion authorization.
- Never delete an existing term and never reuse a databaseId across tenants.

## Same-window gate

Immediately before any future authorized Batch A mutation:

1. obtain and validate the approved network-level recovery point and backup evidence within the owner-approved maximum age for the mutation window;
2. validate every applicable RB requirement;
3. run fresh Batch-A-specific five-tenant read-only evidence in the same window;
4. compare exact current values with this accepted baseline;
5. stop on drift, UNKNOWN evidence, collision, truncation, or an unexplained approved target state;
6. obtain explicit owner Batch A mutation authorization for that exact window and manifest;
7. begin the first write only after authorization is recorded;
8. perform immediate read-only verification after every write.

No long-lived preflight automatically authorizes a later mutation.

## Human administrator action cards

### Backup and restore evidence

- **SYSTEM:** Approved WordPress Multisite hosting/infrastructure control plane
- **LOCATION:** Protected backup administration area; do not disclose private paths
- **ACTION:** Provide the non-secret RB-001 and RB-009 fields in the evidence template; do not restore
- **EXPECTED VALUE:** Identifiable current network recovery point, retained for the approved period, with documented restore eligibility/validation
- **SECURITY NOTE:** Do not commit credentials, private storage URLs, database passwords, tokens, SSH material, or raw protected payloads
- **VALIDATION:** Independent reviewer confirms every required field and that the recovery point covers the intended future window

### Live admin-coordinate confirmation

- **SYSTEM:** WordPress Multisite administration
- **LOCATION:** Group, Healthcare, Consulting, Lifestyle, and Real Estate tenant admin areas
- **ACTION:** Read-only confirm the exact brand-option and tenant-local taxonomy screens, capabilities, field coordinates, and current values; do not save or create
- **EXPECTED VALUE:** Exact tenant-isolated coordinates matching the manifest and fresh public evidence
- **SECURITY NOTE:** Do not expose admin URLs, cookies, credentials, nonces, or private hostnames
- **VALIDATION:** Record only sanitized coordinate labels/keys and evidence classification; rerun public read-only checks

## Protected-boundary result

- WordPress / GraphQL / database / WP-CLI mutation: false
- Backup / export / restore execution: false
- Content / taxonomy deletion: false
- Backend runtime / generated GraphQL / production UI / dependencies / lockfiles: unchanged
- Deployment: false
- Step 3: not started
- Step 2C.5C: not started
- Production authorization: false
- SOT-001: OPEN

## CURRENT PROJECT STATE

- **Stage:** Step 2C.5B — CMS Mutation Readiness & Backup Gate
- **Plan status:** OWNER ACCEPTED / PENDING MERGE
- **Mutation readiness:** BLOCKED BY BACKUP EVIDENCE
- **Baseline:** `main@f0d0974a75ac49a9c4fd88f0f229fa28a209acfd`
- **Tenants:** 5/5 fresh read-only evidence; no Batch A drift
- **Step 2C.5B accepted:** true
- **CMS mutation authorization:** NOT GRANTED
- **Batch A mutation authorization:** false
- **Taxonomy deletion authorization:** false
- **Backup creation:** NOT AUTHORIZED / NOT EXECUTED
- **Restore:** NOT AUTHORIZED / NOT EXECUTED
- **Step 2C.5C:** NOT STARTED
- **Production authorization:** false
- **SOT-001:** OPEN
- **Next gate:** correction verification and separate merge authorization; human backup/admin evidence remains required before any separate mutation request
