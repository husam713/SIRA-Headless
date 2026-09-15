# SIRA Headless — Claude Code adapter

SIRA Enterprise is migrating six WordPress Multisite tenants to a headless stack:
WordPress (`backend/` `sira-core` plugin) → WPGraphQL → one Next.js 16 App
Router app (`frontend/`) serving every brand. This file only points Claude Code
at the project; the engineering rules are `AGENTS.md`, and the normative
protocol is `docs/AI-ENGINEERING-OPERATING-PROTOCOL.md`. If this file ever
disagrees with them, they win and this file is what gets fixed.

## Map

| Path | What | Rules load from |
|---|---|---|
| `frontend/src/` | app routes, components, `lib/`, `config/` (site + endpoint registries), `queries/` (hand-written GraphQL) | `.claude/rules/frontend.md` |
| `frontend/src/generated/`, `frontend/schema/` | **generated** contracts — never hand-edit, never read whole | `.claude/rules/graphql.md` |
| `frontend/tests/{unit,contract,harness}` | Vitest; contract tests guard durable decisions | frontend.md |
| `backend/` | `sira-core` plugin + mu-plugins, PHP 8.3 / WPCS | `.claude/rules/backend.md` |
| `tools/` | SSH-based read-only CMS tooling, ADR-030 seeder, launch gate | backend.md |
| `docs/`, `project-state.json` | state, ADRs, task packets, history | `.claude/rules/governance.md` |
| `artifacts/`, `.local-reference/`, `frontend/prototypes/` | evidence and design references — not context, not production | — |

## Start of every session

1. Read `docs/STATE.md` (one page). Run `git status` and `git log --oneline -5`.
2. Read only the files the task needs; the matching rules file loads by itself.
   For a wide search, use an Explore agent instead of reading everything.
3. Full boot (`templates/ai/BOOT-PROTOCOL.md`: protocol, `project-state.json`,
   `docs/SOURCE-OF-TRUTH.md`, `docs/DECISIONS.md`, `docs/HANDOFF.md`, open PRs)
   only for governance, state reconciliation, recovery, or protected-operation
   tasks — not for ordinary engineering.

## How to work here

- Inside an owner-authorized task, act: investigate, branch, edit, run the
  validation named in the rules file, review your own diff, commit, push the
  feature branch, open the PR from `.github/pull_request_template.md`. Do not
  ask whether to read a file, run a test, or create a branch.
- Ask only when repository evidence cannot settle a choice that changes the
  outcome, or when the next action is on the stop list.
- Unrelated defects: report in the PR, do not fix. Work that needs an
  out-of-scope change: stop and say `BLOCKED_SCOPE_EXPANSION_REQUIRED`.
- Stop list (owner decides, every time): merge into `main`; deploy or cutover;
  DNS/vhosts; secrets; destructive CMS/database operations; deleting rollback
  branches/tags; architecture changes that need an ADR. `.claude/settings.json`
  denies the command shapes; GitHub rulesets block the rest.
- Claims: `CONFIRMED` · `STRONGLY INFERRED` · `TRANSFERRED EVIDENCE` · `UNKNOWN`.
  Checks: `PASS · FAIL · WARNING · DEFERRED · NOT RUN · BLOCKED · NOT APPLICABLE`;
  `PASS` only for a command that ran. Similar names are separate claims.
- A merge is not owner acceptance. Snapshot SHAs in documents are history;
  HEAD comes from Git. Auto-memory is local to this machine, never project state.
- Never print or commit credentials, Application Passwords, HMAC secrets,
  bypass tokens, cookies, or URL query strings; endpoints as `scheme://host/path`.
