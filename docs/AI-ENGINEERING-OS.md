# SIRA AI Engineering Execution Architecture

## Purpose

Make the repository sufficient for another qualified AI agent or engineer to reconstruct the project without relying on the original conversation.

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
Agent implementation
        |
        v
Local validation + generated contracts
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
Acceptance gate
        |
        +--> approved -> update durable project state -> next stage
        |
        +--> failed -> diagnose root cause -> smallest safe fix -> revalidate
```

## Execution modes

### Mode A — Agentic repository mode

Use when the agent has repository/IDE/terminal/Git access.

The agent should inspect, edit, generate, test, review, commit, push, and create/update PRs without turning the owner into the manual implementation agent.

### Mode B — Artifact delivery mode

Use only when direct repository modification is unavailable.

Produce a complete patch/package/manifest/validation/merge guide rather than asking the owner to reconstruct code manually.

### Mode C — External admin mode

Use for WordPress Admin, Hostinger, DNS, Vercel account settings, MFA, production secrets, or other protected interfaces unavailable to the agent.

Return the minimum exact human action, then validate programmatically afterward.

## Durable memory model

- `AGENTS.md` — permanent AI operating rules.
- `project-state.json` — machine-readable current state.
- `docs/PROJECT-STATE.md` — human-readable current state.
- `docs/SOURCE-OF-TRUTH.md` — conflict-resolution hierarchy and active source conflicts.
- `docs/DECISIONS.md` — approved ADRs and pending decisions.
- `docs/HANDOFF.md` — short entry point for a new session.
- `docs/ACCEPTANCE-GATES.md` — evidence required for acceptance.
- Git commits/tags/PRs — versioned implementation history.
- generated schemas/tests/CI — executable evidence.

Conversation history is never the canonical project database.

## Autonomy level

Default engineering autonomy is **L3 — Engineering Agent**.

Allowed without per-command approval inside an approved stage:

- inspect source/history;
- create focused feature branches;
- edit files;
- run generators/tests/builds;
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
