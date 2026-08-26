# SIRA Engineering Handoff

Use this file when opening a new session — Claude, ChatGPT/Codex, or a human engineer — to continue this project.

## Read first, in order

1. `/AGENTS.md` — operating rules, protected-actions list, architecture locks.
2. `/project-state.json` — the only hand-maintained current-state file. Read `currentTask` and `protectedGates`.
3. Run `git log -1` and `git status` — confirm the actual current HEAD/branch. `project-state.json`'s `repositoryHead` is a snapshot, not a live value; if it's stale, that's expected — verify from Git, don't treat the mismatch as an error to fix before doing anything else.
4. `/docs/DECISIONS.md` — the ADR register. Skim headers; read in full only the ADRs relevant to the task at hand.
5. `/docs/SOURCE-OF-TRUTH.md` — only if you suspect a source conflict (repo vs. live vs. a prior claim).

Do not read every file in `docs/` every session — most of it is historical (`docs/STEP-*.md`) and only needs opening when a task specifically references that step.

## Repository

- Repository: `husam713/SIRA-Headless`
- Canonical integration/default branch: `main`
- Current HEAD: verify from Git, always — never infer from a doc snapshot.

## Execution model

One mutation-capable role, **IMPLEMENTATION**, in one of two execution profiles:

- `LOCAL` — task correctness depends on local filesystem/working-tree/runtime evidence.
- `CLOUD_GITHUB` — required evidence is fully repository/GitHub-visible; local-only claims must be classified `REPORT_ONLY` or `NOT_VERIFIED_BY_THIS_AGENT`.

Program Control picks the least-complex profile that satisfies the task's evidence/validation/security/mutation needs. Execution profile changes capabilities, not authorization.

## What actually needs owner approval

The exhaustive list is `project-state.json` → `protectedGates`. Everything else — branching, implementing, testing, committing, pushing a feature branch, opening a PR — is default-authorized ordinary engineering work under AGENTS.md and does not need a fresh per-task authorization ritual. Do not invent additional gates beyond that list; if a new kind of irreversible/high-risk action comes up, add it to `protectedGates` explicitly rather than blocking work on an implicit one.

## Do not restart without new evidence

- WordPress Multisite architecture; `sira-core` backend ownership; WPGraphQL as primary API; the Next.js App Router multi-brand foundation; the hostname/site registry; tenant isolation; caching/revalidation architecture; the generated frontend contract layer.

Full rationale for each of these is in `docs/DECISIONS.md`.

## Handoff completion format

When closing out a substantial piece of work, report:

- role and execution profile;
- branch and commit SHA;
- files changed;
- validations actually run and their results;
- local evidence limitations when using `CLOUD_GITHUB`;
- warnings/deferred checks;
- rollback point;
- next proposed step.

Then update `project-state.json` (`currentTask`, and `milestoneHistory` if a milestone closed) in the same commit.
