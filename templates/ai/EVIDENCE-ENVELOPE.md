# SIRA Evidence Envelope Template

Use with `schemas/ai/evidence-envelope.schema.json` when machine-readable
validation is required.

## Identity

- Schema version: 1.0
- Task ID:
- Parent Task ID: null
- Related Task IDs: []
- Source agent:
- Role:
- Repository:

## Evidence state

- Evidence Class: TRANSFERRED_EVIDENCE
- Acceptance State:
- Canonical: false
- Source result:
- Validation authority:

Evidence Class, Acceptance State, and Canonicality are independent. Do not infer
Canonicality from local success, CI, a Draft PR, or independent review.

## Baseline

- Expected:
- Verified:
- Status:

## Candidate

- Branch: null
- Head: null
- PR: null

## Gates

- Independently verified: null
- Owner accepted: null
- Merged to canonical main: null
- Runtime or production proven: null
- Next gate:

For these four observation fields, `true` means the condition is established
true, `false` means it is established false, and `null` means unknown, not
observed, not applicable to the current evidence source, or not yet
independently established. `Canonical` remains a required strict Boolean and
is never nullable.

## Notes

-
