# SIRA AI Engineering Operating Rules

This repository is the durable project memory for the SIRA Enterprise headless migration.
Conversation history is supporting context only and must never override repository or executable evidence.

## Session Boot Protocol

Boot is proportional to the task.

**Every session:** read this file, read `docs/STATE.md`, inspect Git state
(`git status`, recent log, current branch), and read the source, contracts, and
tests the task actually touches. Area-specific rules load automatically from
`.claude/rules/` in Claude Code; other agents read the matching file by hand.

**Full boot** — additionally `docs/AI-ENGINEERING-OS.md` and the normative
protocol, `project-state.json`, `docs/SOURCE-OF-TRUTH.md`, relevant
`docs/DECISIONS.md` entries, `docs/HANDOFF.md` (and the latest
`docs/handoff-log/` entry when resuming), and open PRs/CI — is required for governance or
durable-state changes, state reconciliation, interrupted-session recovery,
anything that touches a protected operation, and whenever `docs/STATE.md`
reports drift you must resolve. Use `templates/ai/BOOT-PROTOCOL.md`.

Reconcile discrepancies before modifying code. Never determine current project
state from conversation memory alone.

Claude Code does not load this file automatically; it loads `CLAUDE.md`. That
file is a platform-specific bootstrap adapter whose only job is to direct the
session here and into this boot protocol. It carries no authority of its own.
Agents that do not auto-load `CLAUDE.md` start from this file directly.

## Evidence Classification

Every material engineering claim must be classified mentally as one of:

- **CONFIRMED** — supported by inspectable repository, generated-contract, test, CI, or live evidence.
- **STRONGLY INFERRED** — supported by evidence but not directly proven; identify the evidence and limitation.
- **TRANSFERRED EVIDENCE** — reported by another session or agent and not yet independently verified in the current evidence context.
- **UNKNOWN** — not verified. Unknown is an acceptable engineering result and must not be converted into a guess.

Never claim a test passed, a stage was approved, a field exists, a deployment occurred, or a production setting is active without evidence.

## Evidence Authority

Evidence precedence between source types is governed exclusively by
`docs/AI-ENGINEERING-OPERATING-PROTOCOL.md`. This file does not define a
second hierarchy. Apply the protocol to the claim being evaluated and use
`docs/SOURCE-OF-TRUTH.md` for SIRA-specific source/state/conflict mapping.

## Architecture Locks

Preserve these established constraints unless newer evidence and an approved architecture decision supersede them:

- WordPress Multisite remains the editorial CMS.
- `sira-core` owns backend content/business architecture.
- WPGraphQL is the primary frontend API.
- One Next.js App Router application serves Group and all branches.
- Hostnames are resolved through a validated allowlisted site registry.
- Server Components are the default; Client Components are limited to required interaction.
- WordPress owns canonical identity/content data; frontend owns semantic presentation tokens.
- Bricks and `.dc.html` runtime code are not production headless dependencies.
- Consulting is the canonical branch GraphQL schema; Healthcare, Lifestyle, and Real Estate are exact peers.
- Group may remain a structural superset but shared frontend operations must use canonical shared fields only.
- The live project ACF type is `ProjectDetails`; do not introduce `SiraProjectDetails`.
- Use native WPGraphQL menus; do not create `siraNavigation`.
- Use native content connections; do not create `siraEditorialFeed` unless a future evidence-backed ADR explicitly changes this.
- Explicit Business Unit mapping: group -> null, consulting -> consulting, healthcare -> healthcare, lifestyle -> lifestyle, realestate -> real-estate.
- Missing CMS content/configuration must not be hidden with frontend hardcoding.

## Execution Model and Task Packet Authority

`DISCOVER -> AUDIT -> PLAN -> IMPLEMENT -> VALIDATE -> REVIEW -> COMMIT -> PUSH -> PR -> ACCEPTANCE GATE`

One logical mutation-capable role, `IMPLEMENTATION`, with execution profile
`LOCAL` or `CLOUD_GITHUB`. The profile changes capabilities and evidence
visibility, never authorization. Roles, profiles, profile selection, Task
Packet authority, baseline/drift policy, and scope discipline are defined once,
in `docs/AI-ENGINEERING-OPERATING-PROTOCOL.md`; this file does not restate
them. The rules that bite in practice:

- A substantial controlled mutation requires a Task Packet or an equivalent
  explicit owner instruction. Absence of authorization means do not mutate.
- Within an approved stage, work autonomously until the stage is complete or a
  real owner/external/protected decision is required. Do not turn the owner
  into the implementation agent.
- If the baseline, approved candidate, or scope has drifted, stop unless
  adaptation is explicitly authorized.
- Report unrelated defects; do not silently repair them. Stop with
  `BLOCKED_SCOPE_EXPANSION_REQUIRED` when required work exceeds the scope.
- Never self-approve a candidate or declare it canonical. Local success, CI, a
  Draft PR, and independent review are each distinct from owner acceptance.
- `CLOUD_GITHUB` classifies local-only facts as `REPORT_ONLY` or
  `NOT_VERIFIED_BY_THIS_AGENT`; it never invents local state.

## Git Rules

- Work on focused feature/fix/chore branches.
- Inspect the complete diff before commit.
- Run `git diff --check` locally when available; cloud-only profiles perform the closest repository-visible equivalent and report local command execution as not verified.
- Never commit secrets or temporary authorization material.
- Never expose credentials in Task Packets, Evidence Envelopes, Handoff Packets, logs, or artifacts; reference security-sensitive values symbolically.
- Generated files must be regenerated from their source contracts, not hand-edited.
- Feature branches may be committed and pushed by the engineering agent.
- Pull requests may be created/updated by the engineering agent.
- Do not merge the protected integration/default branch without explicit owner approval.
- Never force-push shared history or delete approved tags without explicit owner approval.
- Treat `.local-reference/` as reference-only unless a Task Packet explicitly authorizes a different use.
- Preserve task-identified protected local evidence: do not edit, stage, rename, delete, normalize, or commit it.

## Protected Operations

Require explicit owner approval before:

- merge into the protected integration/default branch;
- production deployment or cutover;
- destructive database operations;
- DNS changes;
- production secret rotation/configuration;
- deleting rollback assets or legacy production releases.

## External Admin Actions

For WordPress, Hostinger, DNS, GitHub settings, MFA, or other protected admin
interfaces unavailable to the agent, return a concise action card: SYSTEM ·
LOCATION · ACTION · EXPECTED VALUE · SECURITY NOTE · VALIDATION. Resume
automated validation after the human action.

## Validation Status Vocabulary

`PASS · FAIL · WARNING · DEFERRED · NOT RUN · BLOCKED · NOT APPLICABLE` — and
nothing else. `PASS` only for a check that actually ran against the stated
baseline.

## Stage Acceptance

A stage is not complete because code compiles. Acceptance requires the scoped
implementation, required tests/builds, warning classification, security
review, diff review, understood Git state, a rollback definition, and
documented remaining work. End each substantial stage report with a
`CURRENT PROJECT STATE` block. When a task changes durable state, update
`docs/STATE.md` and `project-state.json`; when a stage closes, append a dated
entry to `docs/handoff-log/`. Evidence Envelope and Handoff Packet templates
(`templates/ai/`) are for external handoff; in-repo PR work carries the same
facts in the PR body.
