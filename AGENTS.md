# SIRA AI Engineering Operating Rules

This repository is the durable project memory for the SIRA Enterprise headless migration.
Conversation history is supporting context only and must never override repository or executable evidence.

## Session Boot Protocol

At the beginning of every engineering session:

1. Read this file.
2. Read `docs/AI-ENGINEERING-OS.md` and the normative protocol it identifies.
3. Read `project-state.json`.
4. Read `docs/PROJECT-STATE.md`.
5. Read `docs/SOURCE-OF-TRUTH.md`.
6. Read relevant entries in `docs/DECISIONS.md`.
7. Inspect Git state, current branch, recent commits, and approved tags.
8. Inspect relevant generated contracts and tests.
9. Reconcile discrepancies before modifying code.

Never determine current project state from conversation memory alone.

## Evidence Classification

Every material engineering claim must be classified mentally as one of:

- **CONFIRMED** — supported by inspectable repository, generated-contract, test, CI, or live evidence.
- **STRONGLY INFERRED** — supported by evidence but not directly proven; identify the evidence and limitation.
- **TRANSFERRED EVIDENCE** — reported by another session or agent and not yet independently verified in the current evidence context.
- **UNKNOWN** — not verified. Unknown is an acceptable engineering result and must not be converted into a guess.

Never claim a test passed, a stage was approved, a field exists, a deployment occurred, or a production setting is active without evidence.

## Trust Hierarchy

Use this order when sources conflict:

1. relevant executable/runtime/live evidence;
2. current Git repository state;
3. accepted merged commits and Pull Requests;
4. exact commit SHAs, ancestry, and CI evidence;
5. checked-in schemas, contracts, and generated artifacts;
6. approved ADRs and durable repository documentation;
7. verified external design/reference artifacts;
8. transferred reports from another AI conversation or agent;
9. conversation memory;
10. model inference — never authoritative.

A later verified artifact may supersede repository source for a subsystem when the repository has demonstrably not yet been reconciled. Such a conflict must be recorded explicitly in `docs/SOURCE-OF-TRUTH.md` and resolved before modifying that subsystem.

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

## Execution Model

Use:

DISCOVER -> AUDIT -> PLAN -> IMPLEMENT -> VALIDATE -> REVIEW -> COMMIT -> PUSH -> PR -> ACCEPTANCE GATE

Within an approved stage, work autonomously until the stage is complete or a real owner/external/protected decision is required.

Do not turn the owner into the implementation agent when the repository, terminal, tests, or Git tools can perform the work directly.

## Task Packet Authority and Scope

- A substantial controlled mutation requires an explicit Task Packet or equivalent owner-authorized scope.
- Authorization is bounded. Absence of authorization means do not mutate.
- Before mutation, record the expected baseline, verified baseline, current branch, and working-tree status.
- If the baseline, approved candidate, or scope has drifted, stop unless adaptation is explicitly authorized.
- Report unrelated defects; do not silently repair them. Stop with `BLOCKED_SCOPE_EXPANSION_REQUIRED` when required work exceeds the authorized scope.
- Never self-approve a candidate or declare it canonical. Local success, CI, a Draft PR, and independent review are distinct from owner acceptance and canonical merge state.

## Git Rules

- Work on focused feature/fix/chore branches.
- Inspect the complete diff before commit.
- Run `git diff --check` locally when available.
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

For WordPress, Hostinger, DNS, Vercel account settings, MFA, or other protected admin interfaces unavailable to the agent, return a concise action card containing:

- SYSTEM
- LOCATION
- ACTION
- EXPECTED VALUE
- SECURITY NOTE
- VALIDATION

Resume automated validation after the human action.

## Validation Status Vocabulary

Use only:

- PASS
- FAIL
- WARNING
- DEFERRED
- NOT RUN
- BLOCKED
- NOT APPLICABLE

Do not report PASS unless the relevant command/check actually ran against the stated baseline.

## Stage Acceptance

A stage is not complete merely because code compiles. Acceptance requires the scoped implementation, required tests/builds, warning classification, security review, diff review, understood Git state, rollback definition, and documented remaining work.

End each substantial stage report with a `CURRENT PROJECT STATE` block.

When a Task Packet requires formal transfer, return both an Evidence Envelope and a Handoff Packet using the repository templates. The normative terminology, role boundaries, and evidence workflow are defined in `docs/AI-ENGINEERING-OPERATING-PROTOCOL.md`.
