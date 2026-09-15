# Task Packet — TP-P3-STATE-CONSOLIDATION

> AUTHORIZATION IS EXPLICIT. ABSENCE OF AUTHORIZATION = DO NOT MUTATE.

## Identity

- Schema version: 1.0
- Task ID: TP-P3-STATE-CONSOLIDATION
- Parent Task ID: null
- Related Task IDs: [PR #67 (Phases 1+2 of the Claude Code adapter), PR #68, PR #69, PR #70]
- Issued by: owner instruction "Start Phase 3" (2026-09-15, in-session), against the
  Phase 3 definition recorded in the PR #67 body ("state-carrier consolidation:
  `HANDOFF.md` split, `docs/history/`, deduplication, `AGENTS.md` trim beyond the
  boot section") and `docs/STATE.md` § Next step
- Target role: IMPLEMENTATION
- Execution profile: LOCAL (the branch is built in a scratch worktree; the owner's
  checkout carries protected uncommitted work that this task must not touch)
- Local evidence required: false
- Task type: governance / durable-state consolidation
- Repository: husam713/SIRA-Headless

## Purpose

Make the durable state carriers small, current and non-duplicated after the
2026-09-15 stack merge, without losing any historical record:

1. `docs/STATE.md` stays the one-page first read and is refreshed.
2. `docs/HANDOFF.md` becomes a ≤ 1-page resume pointer; its append-only phase log
   moves, whole and unedited, to `docs/handoff-log/`.
3. Historical STEP documents and step task packets move under `docs/history/`
   with `git mv` (history preserved), plus a README that maps old paths to new.
4. The hand-maintained `docs/PROJECT-STATE.md` is retired into `docs/history/`;
   `project-state.json` is the single machine carrier, `docs/STATE.md` the human one.
5. `project-state.json` is brought current for facts the merges changed
   (newsroom, Digital tenant, branch protection, merged increments, carrier
   pointers). Keys asserted by `frontend/tests/contract/*` are not restructured.
6. The role / execution-profile semantics restated across `AGENTS.md`,
   `docs/AI-ENGINEERING-OS.md`, `docs/SOURCE-OF-TRUTH.md`, `HANDOFF.md`,
   `BOOT-PROTOCOL.md` collapse to one definition in the protocol plus links.
7. `templates/ai/BOOT-PROTOCOL.md` becomes a recovery checklist; `AGENTS.md` is
   trimmed beyond its boot section to the rules the protocol does not already own.
8. Living documents that link to moved files are updated; historical evidence
   records (`MANIFEST.json`, `*-CHANGED-FILES.json`, `*-LOCAL-VALIDATION.json`,
   backend STEP reports) are left byte-identical.
9. PR #37 (Vercel bot) is closed per the owner decision already recorded in
   `docs/STATE.md`.

## Input evidence

- Evidence source/class: `origin/main` @ `8e34efef` (REPOSITORY_PROVEN, post-merge
  verified in PR #70 and independently verified 2026-09-15); PR #67 body; audit
  plan §K/§M (local, supporting context only).
- Accepted coordinates: merges `4a999bb0`, `8723f960`, `e0ef2f74`, `db090be6`,
  `8e34efef`.
- Known limitations: no owner-acceptance artifact exists on PRs #64–#69; this task
  records merges, not acceptance.

## Expected baseline

- Branch: `docs/phase-3-state-consolidation`, stacked on
  `docs/post-merge-verification-2026-09-15` @ `054a03a5` (PR #70)
- Commit: `054a03a5`
- Environment-appropriate state expectation: `origin/main` @ `8e34efef`; PR #70 open
- Local working-tree expectation: the owner's checkout on
  `docs/cms-origin-relocation-reconciliation` @ `b7ecda7f` with its 32 uncommitted
  entries is protected and untouched; all work happens in a scratch worktree.

## Authorization

- Explicitly granted: true
- Authorization text: "Start Phase 3" (owner, 2026-09-15)
- Allowed actions: edit/move/create files under `docs/`, `templates/ai/`,
  `AGENTS.md`, `.claude/rules/governance.md`, `.github/pull_request_template.md`,
  `project-state.json`, and the two test/comment path references in
  `frontend/tests/` that a moved file requires; commit; push the branch; open a PR;
  close PR #37.
- Protected actions separately authorized: none. No merge into `main`.

## Scope

### In scope
As listed under Purpose.

### Explicitly out of scope
- Any change to `frontend/src`, `backend/`, `tools/`, generated contracts.
- Restructuring `project-state.json` keys that contract tests assert
  (`executionBaseline`, `executionHead`, `latestRepositoryReconciliation`,
  `authorization.*`, `openGates.*`, `knownConflicts`, `parallelTracks`,
  `groupStagingStrategy`, `canonicalPublicProductionTopology`, `businessUnit`,
  `productionAuthorized`). Splitting history out of the JSON is DEFERRED.
- Editing the normative content of `docs/AI-ENGINEERING-OPERATING-PROTOCOL.md`
  (path references only).
- The CRLF `.gitattributes` defect (reported in PR #70), PR #45, the owner's local
  uncommitted work streams, the still-installed Vercel GitHub app.
- Rewriting any historical record to match a later decision.

## Stop conditions
- A contract test would need a semantic (not path) change → stop,
  `BLOCKED_SCOPE_EXPANSION_REQUIRED`.
- A historical file would need content edits → stop, report.

## Validation
- `git diff --check` on every commit.
- All relative Markdown links in living docs resolve (scripted check).
- `project-state.json` parses; `pnpm exec vitest run` (full suite) green on the
  branch head in a clean worktree; `pnpm lint`, `pnpm typecheck`.
- Rename detection: `git log --follow` reaches pre-move history for a sample of
  moved files.

## Result contract
PR against `docs/post-merge-verification-2026-09-15` (stacked on #70), body from
`.github/pull_request_template.md`; this packet linked; Evidence Envelope and
Handoff Packet not required (in-repo PR work; protocol § Artifact policy).

## Next gate
Owner merge decision for #70 then this PR. Merge is not acceptance.
