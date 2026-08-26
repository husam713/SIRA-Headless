# SIRA Current Project State

**Do not hand-maintain state facts in this file.** The single source of truth for current status is [`project-state.json`](../project-state.json). This file exists only as a short human-readable index into it, so a reader doesn't have to parse JSON.

## Where to look

| Question | Answer lives in |
| --- | --- |
| What is Claude/Codex/any agent working on right now? | `project-state.json` → `currentTask` |
| What actually requires my explicit approval before proceeding? | `project-state.json` → `protectedGates` (this is the exhaustive list — nothing outside it needs a fresh authorization ritual) |
| Is the CMS mutation track unblocked yet? | `project-state.json` → `cmsMutationTrack` |
| What's the real current Git HEAD? | Run `git log -1` — never trust a recorded snapshot across a session gap |
| What architectural decisions are locked in? | [`docs/DECISIONS.md`](./DECISIONS.md) (ADR register) and `AGENTS.md` → Architecture Locks |
| What historical evidence backs a past milestone? | The relevant `docs/STEP-*.md` file or the PR itself — not this file |
| Durable conflict/source-precedence rules | [`docs/SOURCE-OF-TRUTH.md`](./SOURCE-OF-TRUTH.md) |
| Acceptance-gate mechanics (Gate A–F definitions) | [`docs/ACCEPTANCE-GATES.md`](./ACCEPTANCE-GATES.md) |

## Update rule

Any change that makes `project-state.json` stale must update it **in the same commit**. This file should almost never need editing — if you find yourself restating a status fact here instead of in `project-state.json`, stop and put it there instead.
