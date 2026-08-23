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
4. Authorization State is distinct from implementation, independent
   verification, acceptance, merge state, and Canonicality.
5. Current repository HEAD is discovered from Git.
6. Unknown is preferable to invented certainty.
7. Normalize the present and preserve the past.
8. There is one logical mutation-capable role, `IMPLEMENTATION`; its execution
   profile changes capabilities/evidence visibility but not authority.
9. An implementation agent cannot approve itself or declare its own candidate
   canonical.
10. Security-sensitive values are referenced symbolically and never embedded
    in governance evidence.

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
- **Authorization State:** whether the owner/Program Control has granted the
  bounded authority needed for a task or protected transition.
- **Acceptance State:** where work is in its review/approval lifecycle.
- **Canonical:** a separate boolean indicating whether the result belongs to
  accepted canonical repository state.
- **Execution Profile:** the environment/capability context used by the logical
  `IMPLEMENTATION` role. Canonical profiles are `LOCAL` and `CLOUD_GITHUB`.
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

Execution-profile names do not change this hierarchy. `LOCAL` is not inherently
higher-authority than `CLOUD_GITHUB`, and `CLOUD_GITHUB` is not inherently
higher-authority than `LOCAL`. Evidence quality depends on the claim and the
source that proves it.

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

- `TRANSFERRED_EVIDENCE` for evidence reported from another execution context
  that the receiving role has not independently inspected, including typical
  LOCAL implementation reports;
- `REPOSITORY_PROVEN_FOR_IMPLEMENTATION` for repository/GitHub facts directly
  observed by a `CLOUD_GITHUB` implementation agent while producing its own
  candidate. This class does **not** mean independent verification, owner
  acceptance, merge, or canonicality;
- `REPOSITORY_PROVEN` after independent repository/GitHub verification;
- `RUNTIME_PROVEN` after relevant live or runtime verification;
- `UNKNOWN` when the evidence cannot establish the result.

Passing tests do not by themselves promote transferred evidence to repository
or runtime proof. An implementation agent's direct repository observations do
not substitute for the separate Independent GitHub Verification role when that
gate is required.

## Authorization, acceptance, merge state, and canonicality

Authorization State is not Acceptance State. Owner authorization permits a
bounded task or transition; it does not say the implementation is complete,
reviewed, accepted, merged, post-merge verified, or canonical.

Acceptance State is intentionally extensible. Common lifecycle concepts
include `PROPOSED`, `AUTHORIZED_NOT_STARTED`,
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`, `READY_FOR_OWNER`, `OWNER_ACCEPTED`,
`MERGE_EXECUTED_PENDING_POST_MERGE_VERIFICATION`, `POST_MERGE_VERIFIED`,
`MERGED_CANONICAL`, `REJECTED`, and `BLOCKED`.

Merge state and post-merge verification may be represented separately when a
durable state carrier needs that precision. `canonical` remains an explicit
boolean and is never inferred from authorization, implementation, CI,
acceptance, or merge state.

Core invariants:

- Owner authorization does not mean implementation completed.
- Draft PR does not mean accepted.
- CI PASS does not mean owner accepted.
- Proposed ADR does not mean approved.
- Implementation output does not mean canonical repository state.
- Independent review does not grant owner merge authorization.
- Merge does not by itself prove required post-merge verification.
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
- select the least-complex `IMPLEMENTATION` execution profile that can satisfy
  the task's required evidence, validation, security, and mutation needs;
- request owner environment input only when both profiles are materially viable
  and availability/preference matters, required environment availability is
  unknown, or the task requirements do not determine the correct profile;
- request independent verification and owner decisions;
- advance durable canonical state only after required evidence.

It must not assume another conversation is canonical, bypass required
verification, silently grant implementation/deployment authority, or ask the
owner to choose an execution environment when the task requirements already
determine the appropriate profile.

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

### Implementation Agent

Logical role: `IMPLEMENTATION`.

Responsibilities shared by both execution profiles:

- mutate only within explicit Task Packet authority;
- baseline-lock before change;
- preserve scope and protected evidence;
- validate using the evidence/capabilities available to the selected profile;
- review, commit, push, and create/update a PR as authorized;
- return an Evidence Envelope and Handoff Packet;
- stop on unapproved baseline drift, required scope expansion, or missing
  protected authority;
- never perform independent verification of its own candidate;
- never self-approve or self-declare canonicality.

It must not exceed the Task Packet, silently fix unrelated defects, expose
credentials, or treat execution-profile capabilities as additional authority.

#### Execution profiles and selection

An implementation Task Packet identifies:

- `executionProfile`: `LOCAL` or `CLOUD_GITHUB`;
- `localEvidenceRequired`: Boolean.

Program Control selects the least-complex profile capable of satisfying the
task's evidence, validation, security, and mutation requirements. Additional
evidence that is irrelevant to task correctness is not itself a reason to
require `LOCAL`.

`LOCAL` is appropriate or required when task correctness materially depends on
capabilities such as:

- owner's/local repository filesystem state;
- local tracked/untracked working-tree state;
- protected local evidence or `.local-reference/` assets;
- local generation/build tooling not reproduced by GitHub CI;
- browser/runtime testing or local debugging;
- filesystem-level inspection;
- local WordPress/dev environment interaction;
- another task-specific local-only evidence source.

`CLOUD_GITHUB` is sufficient when all required implementation and evidence are
repository/GitHub-visible, including bounded documentation/governance work,
repository-only configuration changes where separately authorized, branch /
commit / PR work, and other tasks whose required validation is available
through GitHub.

A `CLOUD_GITHUB` implementation agent must explicitly classify local-only facts
as `REPORT_ONLY` or `NOT_VERIFIED_BY_THIS_AGENT`. It must never fabricate local
filesystem state, local SHA-256 values, local command execution, or protected
local evidence.

Role-specific overlays live under `templates/ai/ROLE-OVERLAYS/` and compose
with the common Project Instructions. The existing
`templates/ai/ROLE-OVERLAYS/LOCAL-IMPLEMENTATION.md` filename is retained as a
compatibility path, but its canonical semantics cover the single
`IMPLEMENTATION` role and both execution profiles.

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

For `IMPLEMENTATION` tasks it also records the execution profile and whether
local evidence is required. The profile selects the environment/capabilities;
it does not grant mutation authority or alter owner/independent-review gates.

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

Before mutation, every implementation profile records:

- expected baseline;
- verified baseline;
- selected execution profile;
- task branch / candidate state relevant to the environment.

`LOCAL` additionally records the local current branch and the tracked,
untracked, and protected working-tree/evidence state required by the task.

`CLOUD_GITHUB` verifies the GitHub repository/default branch, exact baseline,
expected task branch/PR state, and repository-visible candidate state. Local
branch, working tree, untracked files, protected local evidence, local SHA-256
values, and local-only command execution are `REPORT_ONLY` or
`NOT_VERIFIED_BY_THIS_AGENT` unless independently established by a source the
profile can actually inspect.

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

1. active role, execution profile, and `localEvidenceRequired` value;
2. current Git/GitHub baseline, branch/candidate state, and local working-tree
   state only when available/required by the selected profile;
3. `AGENTS.md` and this protocol;
4. `project-state.json`;
5. `docs/PROJECT-STATE.md`;
6. `docs/SOURCE-OF-TRUTH.md`;
7. `docs/DECISIONS.md` and relevant ADRs;
8. `docs/HANDOFF.md`;
9. open PRs and exact-head CI;
10. the exact current Task Packet;
11. accepted prior evidence coordinates;
12. relevant source, contracts, tests, and runtime evidence.

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

Canonicality is never inferred from local success, repository-visible
implementation evidence, CI, Draft PR, or independent review. Use
`templates/ai/EVIDENCE-ENVELOPE.md` and
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
