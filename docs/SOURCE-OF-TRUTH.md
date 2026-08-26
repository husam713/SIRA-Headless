# SIRA Source of Truth

This file is the SIRA project-specific conflict registry and precedence rule set. It does not restate current status — that lives only in [`project-state.json`](../project-state.json) (see [`PROJECT-STATE.md`](./PROJECT-STATE.md) for a human index).

Evidence precedence between source types is governed exclusively by the
[SIRA AI Engineering Operating Protocol](./AI-ENGINEERING-OPERATING-PROTOCOL.md).
If this file and the Operating Protocol appear to disagree about evidence
precedence, the Operating Protocol governs. This registry applies that model
to SIRA-specific evidence; it does not define a separate hierarchy.

A later verified artifact may temporarily supersede repository source for a
specific subsystem only as permitted by the Operating Protocol. Such a
discrepancy must be recorded here and reconciled before new changes are made
to that subsystem.

## Canonical checked-in artifacts

- Checked-in canonical live schema: `frontend/schema/wpgraphql.graphql`
- Group audit schema: `frontend/schema/wpgraphql.group.graphql`
- Metadata: `frontend/schema/wpgraphql.meta.json`
- Compatibility evidence: `frontend/schema/wpgraphql.compatibility.json`

The canonical live metadata records Consulting as the canonical branch schema, Healthcare/Lifestyle/Real Estate as exact peers, and Group as a structural superset. See ADR-009/ADR-010 in `docs/DECISIONS.md`.

## Known conflicts

### SOT-001 — backend repository freshness — CLOSED

Independent reconciliation evidence established that the previously checked-in
backend was `REPOSITORY_BACKEND_OLDER` than the currently installed LIVE
sira-core source. PR #18 reconciled `backend/` to the verified source
(implementation head `7869ae3530a8349980b01f31e3d749b292d2f63c`, merge
`5a2d7855590de6fe0b12d5cf48777d7856c9f491`, artifact ZIP SHA-256
`571bae5eb39032755dd1c9fe1cacc4113ee409da07826c008cd152698987c76f`).

This closure removes only the backend source-freshness blocker; it does not by
itself authorize any new backend/CMS/production change.

**Open observation (not a blocker, just unresolved):** backend source declares
`SiraProjectDetails` while the accepted frontend/live GraphQL schema exposes
`ProjectDetails`. The mechanism is UNKNOWN. Do not speculatively reconcile
this without new evidence.

## Historical / reference-only sources

The following are migration archaeology/reference material unless explicitly re-promoted after verification:

- original `sira-enterprise-wordpress-bundle.zip`;
- original `sira-core.zip`;
- original `sira-bricks-child.zip`;
- legacy Bricks exports and `.dc.html` runtime files;
- early setup/recovery conversation transcripts.

They may explain intent and history but must not override later verified Git/live evidence.

## Conflict protocol

When sources conflict:

1. stop changes to the affected subsystem;
2. identify both sources and their stage/timestamp/evidence level;
3. classify each claim as CONFIRMED, STRONGLY INFERRED, TRANSFERRED EVIDENCE, or UNKNOWN;
4. apply the Operating Protocol's normative evidence-authority hierarchy;
5. record the decision in `docs/DECISIONS.md` if architectural;
6. update `project-state.json` after reconciliation, in the same commit as the fix;
7. preserve rollback evidence.
