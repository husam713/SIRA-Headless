---
paths:
  - "docs/**"
  - "project-state.json"
  - "AGENTS.md"
  - "CLAUDE.md"
  - "templates/**"
  - "schemas/**"
  - ".claude/**"
---

# Governance and durable state

## Where facts live

- **Current state:** `docs/STATE.md` (one page, human) and `project-state.json` (machine). When a task changes durable state — a merge accepted, a gate opened or closed, an authorization granted — update these two and nothing else.
- **Decisions:** `docs/DECISIONS.md`, one `## ADR-0NN` section per decision; `docs/adr/` holds the three long-form ADRs. A proposed ADR is not approved until the owner says so.
- **Registry and history:** `docs/SOURCE-OF-TRUTH.md` (registry), `docs/HANDOFF.md` (one-page resume pointer), `docs/handoff-log/` (dated, append-only), `docs/history/` (STEP documents, step task packets, the retired `PROJECT-STATE.md`), `docs/tasks/*`, `artifacts/**`. These are provenance. Do not add new copies of coordinates to them, never edit `docs/history/**` or an existing `docs/handoff-log/` entry, and never rewrite a historical record to match a later decision.
- **Rules of engagement:** `AGENTS.md` (operating rules), `docs/AI-ENGINEERING-OPERATING-PROTOCOL.md` (normative, on demand). `CLAUDE.md` and `.claude/**` are the Claude Code adapter; when they disagree with `AGENTS.md` or the protocol, the latter wins and the adapter is what gets fixed.

## Writing about state

- Discover HEAD from Git. A recorded SHA is a baseline, candidate, merge, or snapshot — say which.
- Use only `PASS · FAIL · WARNING · DEFERRED · NOT RUN · BLOCKED · NOT APPLICABLE` for checks, and `CONFIRMED · STRONGLY INFERRED · TRANSFERRED EVIDENCE · UNKNOWN` for claims. `PASS` means the command ran against the stated baseline.
- A merge is not owner acceptance; CI green is not owner acceptance; a Draft PR is not acceptance. Acceptance evidence is per PR (an owner comment at the reviewed head).
- Never write a credential, Application Password, HMAC secret, bypass token, or query string into any document. Endpoints appear as `scheme://host/path` at most.

## Editing this adapter

`.claude/settings.json` deny/ask lists mirror the Protected Operations in `AGENTS.md`; change both or neither. Keep `CLAUDE.md` under 60 lines — link, do not restate.
