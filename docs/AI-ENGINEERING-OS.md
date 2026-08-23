# SIRA AI Engineering Operating System

## Purpose

Make the repository sufficient for another qualified AI agent or engineer to reconstruct the project without relying on the original conversation.

## Authority and information architecture

This file is the concise entry point and index. The single normative source
for terminology, evidence authority, roles, lifecycle gates, execution-profile
semantics, security, and artifact policy is
[`AI-ENGINEERING-OPERATING-PROTOCOL.md`](./AI-ENGINEERING-OPERATING-PROTOCOL.md).
If this overview conflicts with that protocol, the protocol governs.

Reusable resources:

- common project instructions: [`../templates/ai/PROJECT-INSTRUCTIONS.md`](../templates/ai/PROJECT-INSTRUCTIONS.md);
- boot/recovery: [`../templates/ai/BOOT-PROTOCOL.md`](../templates/ai/BOOT-PROTOCOL.md);
- Task Packet: [`../templates/ai/TASK-PACKET.md`](../templates/ai/TASK-PACKET.md);
- Evidence Envelope: [`../templates/ai/EVIDENCE-ENVELOPE.md`](../templates/ai/EVIDENCE-ENVELOPE.md);
- Handoff Packet: [`../templates/ai/HANDOFF-PACKET.md`](../templates/ai/HANDOFF-PACKET.md);
- role overlays: [`../templates/ai/ROLE-OVERLAYS/`](../templates/ai/ROLE-OVERLAYS/);
- machine-readable contracts: [`../schemas/ai/`](../schemas/ai/).

The current repository HEAD is always discovered from Git. Recorded commit
coordinates are baselines, candidates, accepted merges, state snapshots, or
historical provenance; they are never implicitly an eternally current HEAD.

## Operating model

```text
Owner objective / approved stage
        |
        v
Repository boot protocol
        |
        v
Evidence audit + baseline verification
        |
        v
Program Control selects IMPLEMENTATION profile
        |
        +--> LOCAL
        |
        +--> CLOUD_GITHUB
        |
        v
Agent implementation
        |
        v
Profile-appropriate validation + generated contracts
        |
        v
Diff/security review
        |
        v
Commit + push + pull request
        |
        v
CI / runtime evidence where applicable
        |
        v
Independent verification / owner gate
        |
        +--> approved -> update durable project state -> next separately authorized stage
        |
        +--> failed -> diagnose root cause -> smallest safe fix -> revalidate
```

## Implementation role and execution profiles

SIRA has one logical mutation-capable role: **IMPLEMENTATION**.

The role uses one of two execution profiles:

### `LOCAL`

Use when task correctness materially depends on local-only capabilities or
evidence such as the owner's/local repository filesystem state, working tree,
untracked or protected local evidence, `.local-reference/` assets, local
build/generation tooling not reproduced elsewhere, browser/runtime testing,
local debugging, filesystem-level inspection, or local WordPress/dev
interaction.

`LOCAL` is not a higher-authority role. Local evidence that is irrelevant to
task correctness is not itself a reason to require this profile.

### `CLOUD_GITHUB`

Use when the required implementation, evidence, validation, and mutation are
fully repository/GitHub-visible, such as bounded governance/documentation
changes or other repository-only work supported by available GitHub
capabilities.

A `CLOUD_GITHUB` implementation agent must classify local-only claims as
`REPORT_ONLY` or `NOT_VERIFIED_BY_THIS_AGENT`; it must never invent local
filesystem evidence.

### Selection policy

Program Control selects the least-complex execution profile that can satisfy
the task's required evidence, validation, security, and mutation requirements.
Do not ask the owner to choose an environment on every task. Ask only when both
profiles are materially viable and availability/preference matters, required
environment availability is unknown, or the task requirements do not determine
the correct profile.

The execution profile changes capabilities and evidence visibility, not
mutation authority, independent-review requirements, owner gates, or
canonicality.

## Fallback delivery and external-admin patterns

### Artifact delivery

If no direct mutation-capable implementation environment is available, produce
a complete patch/package/manifest/validation/merge guide rather than asking the
owner to reconstruct changes manually. Artifact delivery is a handoff pattern,
not a second implementation authority.

### External admin

For WordPress Admin, Hostinger, DNS, Vercel account settings, MFA, production
secrets, or other protected interfaces unavailable to the implementation
profile, return the minimum exact human action, then validate programmatically
afterward where possible.

## Durable memory model

- `AGENTS.md` — permanent AI operating rules.
- `project-state.json` — machine-readable current state.
- `docs/PROJECT-STATE.md` — human-readable current state.
- `docs/SOURCE-OF-TRUTH.md` — SIRA-specific source/state/history/conflict registry.
- `docs/DECISIONS.md` — approved ADRs and pending decisions.
- `docs/HANDOFF.md` — short entry point for a new session.
- `docs/ACCEPTANCE-GATES.md` — durable acceptance-gate policy and historical gate context, not the volatile current-state tracker.
- Git commits/tags/PRs — versioned implementation history.
- generated schemas/tests/CI — executable evidence.

Evidence precedence between these source types is governed exclusively by the
normative Operating Protocol.

Conversation history is never the canonical project database.

Chats are replaceable working sessions. Task IDs belong to the project
workflow and survive chat replacement.

## Autonomy level

Default engineering autonomy is **L3 — Engineering Agent**.

L3 autonomy operates only inside the explicit scope of the current Task Packet
or equivalent owner authorization; it does not create its own authority.

Allowed without per-command approval inside an approved stage:

- inspect source/history;
- create focused feature branches;
- edit files;
- run generators/tests/builds available to the selected profile;
- diagnose and fix failures within scope;
- review diffs;
- commit and push feature branches;
- create/update PRs;
- inspect CI.

Protected by explicit owner approval:

- merge into protected integration/default branch;
- production deployment/cutover;
- destructive database operations;
- DNS changes;
- production secrets;
- deletion of rollback assets/tags/history.

## Evidence-first anti-hallucination rule

Before an important claim, ask: what inspectable evidence proves it?

If evidence is absent, use `STRONGLY INFERRED` or `UNKNOWN` rather than inventing certainty.

If Git/project-state/conversation disagree, stop and reconcile the sources before implementation.

## Stage report format

Every substantial implementation stage should return:

1. STATUS
2. OBJECTIVE
3. BASELINE
4. SOURCE OF TRUTH
5. WHAT WAS IMPLEMENTED
6. ARCHITECTURE DECISIONS
7. FILES CHANGED
8. VALIDATION
9. SECURITY REVIEW
10. WARNINGS / DEFERRED ITEMS
11. GIT STATE / PR
12. ROLLBACK
13. ACCEPTANCE DECISION
14. CURRENT PROJECT STATE

Only give step-by-step commands when a human action is genuinely required.

## Enforcement boundary

This governance foundation defines human- and agent-readable contracts only.
Validator scripts, CI enforcement, pre-commit hooks, package scripts, and
automated merge gates require a future separately authorized task.
