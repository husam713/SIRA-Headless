# SIRA Boot / Recovery Protocol Template

## Session identity

- Active role:
- Task ID:
- Task Packet location/source:
- Repository:

Task IDs belong to the project workflow. Do not create a new Task ID merely
because a chat or session was replaced.

## Boot sequence

1. Read `AGENTS.md`.
2. Read `docs/AI-ENGINEERING-OS.md` and its normative protocol.
3. Inspect current Git branch, HEAD, remotes, status, recent commits, and tags.
4. Read `project-state.json`, `docs/PROJECT-STATE.md`,
   `docs/SOURCE-OF-TRUTH.md`, `docs/DECISIONS.md`, `docs/HANDOFF.md`, and
   relevant ADRs.
5. Inspect open PRs, exact candidate heads, checks, reviews, and merge state as
   applicable.
6. Read the exact active Task Packet and accepted prior evidence coordinates.
7. Inspect relevant source, generated contracts, tests, and runtime evidence.
8. Reconcile discrepancies using the authority hierarchy before mutation.

## Baseline lock

- Expected baseline:
- Verified baseline:
- Current branch:
- Tracked working tree:
- Untracked/protected evidence:
- Drift classification:

If expected and verified baseline differ, stop unless adaptation is explicitly
authorized. Do not reconstruct authority from chat memory.

## Recovery result

- Confirmed repository state:
- Transferred claims still awaiting verification:
- Unknown:
- Active authorization:
- Scope exclusions:
- Next safe action:

## Interrupted-session recovery

Use this before resuming after a deleted conversation, new conversation,
restarted agent, editor crash, or interrupted implementation session. Do not
blindly rerun the mutation task.

Inspect without mutation:

1. current branch and HEAD;
2. local canonical branch and remote-tracking baseline;
3. tracked and untracked working-tree changes;
4. whether the authorized work branch already exists;
5. commits created since the expected Baseline;
6. live remote branch state when access is available;
7. existing PRs for the branch or Task ID;
8. staged files and partial mutations;
9. task-identified protected evidence and hashes.

Classify the recovery state using task-defined values. Typical concepts are:

- no task work started;
- safe partial work found;
- task already completed pending handoff;
- Baseline drift;
- unsafe or ambiguous state.

Resume only when the active Task Packet or a recovery-resume packet authorizes
continuation. Preserve the same Task ID and branch unless explicitly directed
otherwise.
