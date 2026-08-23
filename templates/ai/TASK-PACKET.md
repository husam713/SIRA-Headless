# SIRA Task Packet Template

> AUTHORIZATION IS EXPLICIT. ABSENCE OF AUTHORIZATION = DO NOT MUTATE.

Use with `schemas/ai/task-packet.schema.json` when machine-readable validation
is required.

## Identity

- Schema version: 1.0
- Task ID:
- Parent Task ID: null
- Related Task IDs: []
- Issued by:
- Target role:
- Execution profile: null
- Local evidence required: false
- Task type:
- Repository:

For mutation-capable work, the canonical logical role is `IMPLEMENTATION`,
even when `Target role` names a profile-specific agent. Set `executionProfile`
to `LOCAL` or `CLOUD_GITHUB`. The profile selects the execution
environment/capabilities; it does not change authorization, independent-review
requirements, owner gates, or Canonicality. For non-implementation tasks,
`executionProfile` may be null.

Program Control selects the least-complex implementation profile that can
satisfy the task's required evidence, validation, security, and mutation
requirements. Ask the owner about environment only when requirements or
availability do not determine the correct profile.

## Purpose

State the bounded outcome.

## Input evidence

- Evidence source/class:
- Accepted coordinates:
- Known limitations:

## Expected baseline

- Branch:
- Commit:
- Environment-appropriate state expectation:
- Local working-tree expectation: `NOT APPLICABLE` when `localEvidenceRequired=false` and the selected profile does not expose local state

## Authorization

- Explicitly granted: false
- Authorization text:
- Allowed actions:
- Protected actions separately authorized:

Authorization remains distinct from implementation, independent verification,
acceptance, merge state, and Canonicality.

## Scope

- Included:
- Deliverables:
- Candidate requirements:

## Scope exclusions

-

## Stop conditions

- Baseline drift:
- Candidate drift:
- Scope expansion required:
- Missing authority/external dependency:
- Required local evidence unavailable:

## Validation requirements

-

State validation requirements in terms of evidence required for task
correctness. Do not require `LOCAL` merely because extra local evidence exists
if that evidence is irrelevant to the task.

## Result contract

- Required Evidence Envelope fields:
- Required Handoff Packet fields:
- Allowed final classifications:

## Next gate

- Owner gate:
- Recommended next role:
