# SIRA — Claude Code Bootstrap Adapter

This file exists because Claude Code loads `CLAUDE.md` automatically and does
not load `AGENTS.md` automatically. It is a **platform-specific bootstrap
adapter**, nothing more.

It defines no protocol, grants no authorization, and changes no architecture,
evidence, acceptance, merge, or protected-operation rule. Where this file and
any governing document appear to differ, **the governing document wins** and
this file is the thing that is wrong.

## Authority

1. `AGENTS.md` — the engineering operating rules for this repository.
2. `docs/AI-ENGINEERING-OPERATING-PROTOCOL.md` — the normative protocol,
   identified by `docs/AI-ENGINEERING-OS.md`. It alone governs evidence
   precedence.
3. `docs/SOURCE-OF-TRUTH.md` — SIRA-specific source, state, and conflict
   registry.

## Start every session here

Before answering any substantive engineering question, making any material
engineering claim, or performing any mutation:

1. **Read `AGENTS.md` in full.**
2. **Read `templates/ai/BOOT-PROTOCOL.md` in full**, then **execute every
   applicable item of its boot sequence, in the order that file defines.**

Do not restate that sequence from memory — read it. It is versioned and this
file is not a copy of it. Reading `AGENTS.md` alone is not a completed boot.

The boot cannot silently skip any of these:

- `docs/AI-ENGINEERING-OS.md`
- `docs/AI-ENGINEERING-OPERATING-PROTOCOL.md`
- `project-state.json`
- `docs/PROJECT-STATE.md`
- `docs/SOURCE-OF-TRUTH.md`
- relevant entries in `docs/DECISIONS.md`
- `docs/HANDOFF.md`
- the applicable Git/GitHub and task evidence

Inspecting Git early is fine, but it does not replace the remaining items and
does not end the boot.

If a required boot source is missing, unreadable, or contradicts another, report
`WARNING` or `BLOCKED` and say which source and which conflict. Never proceed
silently, and never state that boot completed when it did not.

## Non-negotiable while working here

- **Conversation history and Claude auto-memory are supporting context only.**
  They never override repository or executable evidence. Auto-memory is local to
  one machine and is not shared with CI, other agents, or the owner; never cite
  it as project state.
- **Do not mutate the repository without an owner-approved Task Packet.**
  Authorization is bounded: absence of authorization means do not mutate.
- **Do not merge the protected default branch, deploy, change DNS, rotate
  secrets, or alter protected settings** without explicit owner approval. A
  merge performed by someone else is not evidence that you were authorized.
- **A merge is not evidence of owner acceptance.** Authorization, implementation,
  verification, acceptance, and merge are separate dimensions.
- Report unrelated defects; do not silently repair them. Stop with
  `BLOCKED_SCOPE_EXPANSION_REQUIRED` when required work exceeds the authorized
  scope.

## Vocabularies

Use only the validation vocabulary defined in `AGENTS.md`:
`PASS` · `FAIL` · `WARNING` · `DEFERRED` · `NOT RUN` · `BLOCKED` ·
`NOT APPLICABLE`.

Classify every material claim as `CONFIRMED` · `STRONGLY INFERRED` ·
`TRANSFERRED EVIDENCE` · `UNKNOWN`. `UNKNOWN` is an acceptable result and must
never be converted into a guess.

Do not report `PASS` unless the check actually ran against the stated baseline.

## Evidence discipline

- **Never generalize a verified search result to a term you did not search.**
  Verifying that term A is absent says nothing about term B. Search each term,
  or report it as `UNKNOWN`.
- **Similar names are separate claims.** Do not transfer behaviour, history,
  test results, or failure mechanisms between similarly named scripts,
  commands, phases, PRs, fields, or artifacts. Verify the exact identifier you
  are describing.
- Snapshot coordinates in durable state files are historical provenance. Always
  rediscover the current HEAD from Git.
- When a task changes durable project state, update only the carriers that
  change actually affects, preserve historical records, and never claim a
  document is current without repository and Git evidence.

## Diagnostics and secrets

During **local** troubleshooting you may show a sanitized endpoint as
`scheme://hostname/path`, plus site key, environment-variable name, blog ID,
HTTP status, response time, and whether GraphQL returned data or errors. Replace
any query string with `?[REDACTED]`.

Never print URL query parameters, URL userinfo, usernames, Application
Passwords, `Authorization` headers, cookies, tokens, preview secrets, or
deployment bypass secrets, and never dump a complete environment file. Redact
sanitized endpoints and blog IDs out of PR bodies, CI logs, evidence artifacts,
and anything committed.
