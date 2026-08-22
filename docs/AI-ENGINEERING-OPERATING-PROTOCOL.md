# SIRA AI Engineering Operating Protocol

## Status and authority

This is the normative protocol for controlled AI-assisted engineering in the
SIRA repository. `docs/AI-ENGINEERING-OS.md` is its concise overview and index;
`AGENTS.md` is the implementation-agent entry point. Templates and JSON
Schemas implement this protocol but do not supersede it.

The protocol governs project workflow. It does not change SIRA application,
CMS, authentication, deployment, or product architecture. Automated
validation or CI enforcement is outside the governance-foundation scope and
requires separate owner authorization.

## Core principles

1. Repository evidence, not chat memory, carries durable project state.
2. Authorization is explicit and bounded. Absence of authorization means do
   not mutate.
3. Evidence Class, Acceptance State, and Canonicality are separate dimensions.
4. Current repository HEAD is discovered from Git.
5. Unknown is preferable to invented certainty.
6. Normalize the present and preserve the past.
7. An implementation agent cannot approve itself or declare its own candidate
   canonical.
8. Security-sensitive values are referenced symbolically and never embedded in
   governance evidence.

## Normative terminology

- **Task Packet:** the bounded work authorization and result contract for a
  substantial controlled task.
- **Evidence Envelope:** the source agent's structured claim about its result,
  evidence level, acceptance state, canonicality, and next gate.
- **Handoff Packet:** the operational transfer record for the next role or
  session.
- **Artifact Manifest:** the machine-readable inventory and hashes for an
  evidence-carrying package.
- **Evidence Class:** how directly a claim has been proven.
- **Acceptance State:** where work is in its review/approval lifecycle.
- **Canonical:** a separate boolean indicating whether the result belongs to
  accepted canonical repository state.
- **Owner Gate:** the explicit decision required before a protected transition.
- **Baseline:** the exact state against which work or review is authorized.
- **Candidate Head:** the exact proposed commit under review.
- **Independent Verification:** evidence inspection performed without treating
  the source agent's report as proof.
- **Report Only:** a finding recorded without promotion to proven repository or
  runtime fact.
- **Unknown:** a fact not established by the available evidence.

Aliases may be used only when a document defines the mapping to these terms.

## Evidence authority hierarchy

When sources conflict, use this order for the claim being evaluated:

1. relevant executable, runtime, or live evidence;
2. current Git repository state;
3. accepted merged commits and Pull Requests;
4. exact commit SHAs, ancestry, and CI evidence;
5. checked-in schemas, contracts, and generated artifacts;
6. approved ADRs and durable repository documentation;
7. verified external design or reference artifacts;
8. transferred reports from another AI conversation or agent;
9. conversation memory;
10. model inference.

Higher authority overrides lower authority. A lower source can identify a
question but cannot overrule stronger evidence. Cross-conversation claims are
not automatically trusted.

## Claim and evidence classification

Working claims use:

- **CONFIRMED:** directly supported by inspectable evidence in the current
  context;
- **STRONGLY_INFERRED:** evidence supports the claim but does not directly prove
  it; the limitation must be stated;
- **TRANSFERRED_EVIDENCE:** another session or agent reported the claim and it
  has not yet been independently verified here;
- **UNKNOWN:** available evidence does not establish the claim.

Formal Evidence Envelopes use an extensible `evidenceClass` string. Standard
classes are:

- `TRANSFERRED_EVIDENCE` for a Local Implementation Agent report, including one
  with passing local checks;
- `REPOSITORY_PROVEN` after independent repository/GitHub verification;
- `RUNTIME_PROVEN` after relevant live or runtime verification;
- `UNKNOWN` when the evidence cannot establish the result.

Passing tests do not by themselves promote transferred evidence to repository
or runtime proof.

## Acceptance, evidence, and canonicality

Acceptance State is intentionally extensible. Common lifecycle concepts
include `PROPOSED`, `AUTHORIZED_NOT_STARTED`,
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`, `READY_FOR_OWNER`, `OWNER_ACCEPTED`,
`MERGE_EXECUTED_PENDING_POST_MERGE_VERIFICATION`, `POST_MERGE_VERIFIED`,
`MERGED_CANONICAL`, `REJECTED`, and `BLOCKED`.

Core invariants:

- Draft PR does not mean accepted.
- CI PASS does not mean owner accepted.
- Proposed ADR does not mean approved.
- Implementation output does not mean canonical repository state.
- Independent review does not grant owner merge authorization.
- A required post-merge verification gate must complete before claiming the
  corresponding fully verified state.
- `canonical` remains an explicit boolean; it is never inferred from another
  field.

## Operating roles

### Program Control & Owner Decision Hub

Purpose: sequence project work and preserve decision authority.

Responsibilities:

- issue Task Packets;
- normalize transferred evidence;
- choose the next gate;
- preserve scope and authorization boundaries;
- request independent verification and owner decisions;
- advance durable canonical state only after required evidence.

It must not assume another conversation is canonical, bypass required
verification, or silently grant implementation/deployment authority.

### Independent GitHub Verification

Default mode: read-only.

Responsibilities:

- inspect repository and GitHub evidence independently;
- verify exact base, head, ancestry, changed files, diff, and exact-head CI;
- verify governance consistency;
- distinguish Report Only from Repository Proven findings;
- return the result to Program Control.

It must not implement fixes, merge without distinct authorization, or create
new architecture decisions.

### Domain / Design Governance

Default result: Proposed.

Responsibilities:

- perform research and domain analysis;
- prepare architecture/design options, trade-offs, constraints, and proposals;
- identify decisions requiring owner gates.

It must not silently implement application code, declare proposals canonical,
or override accepted architecture without authorization. A SIRA example is
`SIRA — Editorial Architecture & Design Governance`.

### Local Implementation Agent

Responsibilities:

- mutate the repository only within explicit authorization;
- baseline-lock before change;
- preserve scope and protected evidence;
- validate, review, commit, push, and create/update a PR as authorized;
- return an Evidence Envelope and Handoff Packet.

It must not exceed the Task Packet, self-approve, self-declare canonicality,
silently fix unrelated defects, or expose credentials.

Role-specific overlays live under `templates/ai/ROLE-OVERLAYS/` and compose
with the common Project Instructions.

## Controlled workflow

Use:

`DISCOVER → AUDIT → PLAN → IMPLEMENT → VALIDATE → REVIEW → COMMIT → PUSH → PR → INDEPENDENT VERIFICATION → OWNER GATE → POST-MERGE VERIFICATION`

A Task Packet may stop earlier or omit inapplicable steps. A terminal task
boundary never grants authority for the next task.

## Owner gates and post-merge verification

Explicit owner authorization is required for protected transitions including
merge to the canonical branch, production deployment or cutover, destructive
data operations, DNS changes, production-secret operations, and deletion of
rollback evidence. Authorization for one exact base, Candidate Head, scope, or
PR does not transfer to a changed candidate or another task.

When a Task Packet requires post-merge verification, verify the merge SHA,
parents, ancestry, effective scope, canonical branch synchronization, and
protected evidence before claiming the specified post-merge Acceptance State.
The merge action itself does not authorize the next task.

## Task Packet authority

Substantial controlled work requires a Task Packet or an equivalent explicit
owner instruction. The packet records identity, purpose, input evidence,
expected baseline, allowed scope, exclusions, stop conditions, validation,
candidate requirements, result contract, and next gate.

Rules:

- authorization must be affirmative and specific;
- absence of authorization means do not mutate;
- protected actions require explicit owner language;
- a changed base, head, or scope invalidates candidate-specific authorization;
- Task IDs belong to project workflow, not to chat lifetime;
- trivial read-only Q&A does not require a Task Packet.

Use `templates/ai/TASK-PACKET.md` and
`schemas/ai/task-packet.schema.json`.

## Baseline and drift policy

Before mutation, record:

- expected baseline;
- verified baseline;
- current branch;
- tracked and untracked working-tree status.

If expected and actual baseline differ, stop with a classification such as
`BLOCKED_BASELINE_DRIFT` unless adaptation is explicitly authorized. Do not
silently rebase, merge newer main, substitute a candidate, or review a changed
head as though it were approved.

## Scope discipline

A Task Packet grants bounded authority. Unrelated defects are reported, not
silently repaired. If the authorized result cannot be valid without additional
mutation, stop before that mutation and return
`BLOCKED_SCOPE_EXPANSION_REQUIRED` with exact evidence.

Both Task Packet and Handoff Packet record scope exclusions. Generated files,
tests, documentation, or configuration are not automatically in scope merely
because they are adjacent to the requested change.

## Current-HEAD model

Current repository HEAD is obtained from Git at review/runtime time. A durable
recorded SHA must declare its semantics, such as:

- reconciliation starting baseline;
- candidate head;
- accepted merge;
- state verified-through snapshot;
- historical provenance.

No recorded snapshot SHA implicitly means eternally current `main`. Advancing
Git after a snapshot does not make that snapshot false.

## Boot and chat recovery

Chats are replaceable working sessions, not durable project memory. A new or
recovered session boots from repository evidence and the current Task Packet;
it does not reconstruct authority from memory.

At minimum inspect, as applicable:

1. current Git branch, HEAD, status, remotes, recent commits, and tags;
2. `AGENTS.md` and this protocol;
3. `project-state.json`;
4. `docs/PROJECT-STATE.md`;
5. `docs/SOURCE-OF-TRUTH.md`;
6. `docs/DECISIONS.md` and relevant ADRs;
7. `docs/HANDOFF.md`;
8. open PRs and exact-head CI;
9. the exact current Task Packet;
10. accepted prior evidence coordinates.

Use `templates/ai/BOOT-PROTOCOL.md`.

## Security policy

- Do not request secrets unless the authorized task genuinely requires them.
- Do not paste or commit credentials, Application Passwords, HMAC secrets, API
  keys, tokens, cookies, or private endpoints in evidence artifacts.
- Reference sensitive configuration symbolically.
- Run a credential scan appropriate to changed scope and report only sanitized
  results.
- Preserve server-only boundaries.

SIRA authentication domains remain separate:

- public anonymous WPGraphQL;
- HMAC revalidation;
- Preview Entry HMAC;
- WordPress Application Password for server-only editor preview;
- future investor authentication.

This protocol does not alter their application architecture.

## Evidence Envelope

The Evidence Envelope records who is making a claim, which task and repository
it covers, its Evidence Class, Acceptance State, Canonicality, baseline,
candidate, validation authority, verification/acceptance/merge state, source
result, next gate, and notes.

Canonicality is never inferred from local success, CI, Draft PR, or independent
review. Use `templates/ai/EVIDENCE-ENVELOPE.md` and
`schemas/ai/evidence-envelope.schema.json`.

## Handoff Packet

The Handoff Packet provides the next role with baseline, inputs, actions,
changed files, candidate coordinates, validation, confirmed/inferred/report-
only/unknown findings, unresolved gates, exclusions, artifacts, next owner
gate, recommended next agent, and final classification.

Use `templates/ai/HANDOFF-PACKET.md` and
`schemas/ai/handoff-packet.schema.json`.

## Artifact policy

An artifact is an evidence carrier. A ZIP, file, patch, or package does not
become canonical by existing.

- Small normal implementation → branch, commit, PR; no ZIP required.
- Important milestone → Git plus concise machine-readable evidence where
  useful.
- External handoff → ZIP or patch plus Artifact Manifest and SHA-256 when
  appropriate.
- Release → tag plus release artifact.
- Design reference → local/reference evidence plus verified hashes; never a
  production runtime dependency without separate authorization.

Do not store giant raw CI logs in Git. Record concise results, workflow/run
IDs, exact SHAs, and relevant hashes; GitHub retains full workflow logs.

Artifact Manifests use `schemas/ai/artifact-manifest.schema.json` and record
producer, repository, baseline, candidate head, creation time, file path,
SHA-256, optional size, validation, evidence class, acceptance state,
canonicality, and notes.

## No retroactive history rewrite

Normalize the present and preserve the past. Do not rewrite accepted Git
history or require retroactive Evidence Envelopes for every historical task,
PR, artifact, or lost conversation. Historical evidence remains valid at the
level the available evidence can prove. A future milestone ledger may be
proposed separately; it is not part of this foundation.

## SIRA protected state

This governance protocol does not authorize or change:

- Step 3D.2 or Step 3D.3 implementation;
- full Step 3D closure;
- Step 4 visual implementation;
- prototypes or production UI;
- B07, B08, B09, or PREVIEW-AUTH-001 work;
- WordPress/CMS mutation;
- external staging, deployment, DNS, cutover, or legacy destruction;
- AI Engineering OS validator or CI enforcement;
- AI Engineering OS product/runtime work.

Those require separately issued Program Control or owner authorization.

## Validation and evidence status

Use only these validation statuses:

- `PASS`
- `FAIL`
- `WARNING`
- `DEFERRED`
- `NOT RUN`
- `BLOCKED`
- `NOT APPLICABLE`

Report `PASS` only for a check that actually ran against the stated baseline.
Keep full logs in their execution system and durable reports concise.

## Resource index

- Overview: `docs/AI-ENGINEERING-OS.md`
- Repository agent rules: `AGENTS.md`
- Project Instructions: `templates/ai/PROJECT-INSTRUCTIONS.md`
- Boot Protocol: `templates/ai/BOOT-PROTOCOL.md`
- Task Packet: `templates/ai/TASK-PACKET.md`
- Evidence Envelope: `templates/ai/EVIDENCE-ENVELOPE.md`
- Handoff Packet: `templates/ai/HANDOFF-PACKET.md`
- Role overlays: `templates/ai/ROLE-OVERLAYS/`
- JSON Schemas: `schemas/ai/`
