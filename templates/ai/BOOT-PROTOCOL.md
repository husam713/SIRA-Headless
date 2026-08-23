# SIRA Boot / Recovery Protocol Template

## Session identity

- Active role:
- Task ID:
- Task Packet location/source:
- Repository:
- Execution profile: `LOCAL` | `CLOUD_GITHUB` | null
- Local evidence required: false

For mutation-capable work, the logical role is `IMPLEMENTATION`; the execution
profile selects environment/capabilities and does not change authority.

Task IDs belong to the project workflow. Do not create a new Task ID merely
because a chat or session was replaced.

## Boot sequence

1. Read `AGENTS.md`.
2. Read `docs/AI-ENGINEERING-OS.md` and its normative protocol.
3. Read the exact active Task Packet and identify the logical role, execution
   profile, and `localEvidenceRequired` value.
4. Inspect the current Git/GitHub baseline and task branch/candidate state
   appropriate to that profile.
5. If the profile is `LOCAL`, inspect current local branch, HEAD, remotes,
   tracked/untracked working tree, protected local evidence, recent commits,
   and tags as required by the task.
6. If the profile is `CLOUD_GITHUB`, inspect current GitHub default branch,
   exact baseline, task branch/PR state, candidate state, checks, and merge
   state; classify local-only facts as `REPORT_ONLY` or
   `NOT_VERIFIED_BY_THIS_AGENT`.
7. Read `project-state.json`, `docs/PROJECT-STATE.md`,
   `docs/SOURCE-OF-TRUTH.md`, `docs/DECISIONS.md`, `docs/HANDOFF.md`, and
   relevant ADRs.
8. Inspect open PRs, exact candidate heads, checks, reviews, and merge state as
   applicable.
9. Inspect accepted prior evidence coordinates and relevant source, generated
   contracts, tests, and runtime evidence.
10. Reconcile discrepancies using the normative authority hierarchy before
    mutation.

## Baseline lock

- Expected baseline:
- Verified baseline:
- Execution profile:
- Repository/task branch state:
- Candidate/PR state:
- Local current branch: `NOT APPLICABLE` / `NOT_VERIFIED_BY_THIS_AGENT` / value
- Local tracked working tree: `NOT APPLICABLE` / `NOT_VERIFIED_BY_THIS_AGENT` / value
- Local untracked/protected evidence: `NOT APPLICABLE` / `NOT_VERIFIED_BY_THIS_AGENT` / value
- Drift classification:

If expected and verified baseline differ, stop unless adaptation is explicitly
authorized. Do not reconstruct authority from chat memory.

For `CLOUD_GITHUB`, lack of unrelated local evidence is not a blocker unless
`localEvidenceRequired=true` or the task's correctness actually depends on that
evidence. Never fabricate local filesystem state.

## Recovery result

- Confirmed repository state:
- Transferred claims still awaiting verification:
- Report-only/local facts not verified by this agent:
- Unknown:
- Active authorization:
- Scope exclusions:
- Next safe action:

## Interrupted-session recovery

Use this before resuming after a deleted conversation, new conversation,
restarted agent, editor crash, or interrupted implementation session. Do not
blindly rerun the mutation task.

Inspect without mutation using the selected execution profile:

1. current authorized baseline and task/candidate coordinates;
2. whether the authorized work branch already exists;
3. commits created since the expected Baseline;
4. live remote branch/PR state when access is available;
5. existing PRs for the branch or Task ID;
6. staged/partial local mutations only when `LOCAL` evidence is available and
   relevant;
7. task-identified protected local evidence/hashes only when the selected
   profile can actually verify them.

Classify the recovery state using task-defined values. Typical concepts are:

- no task work started;
- safe partial work found;
- task already completed pending handoff;
- Baseline drift;
- unsafe or ambiguous state.

Resume only when the active Task Packet or a recovery-resume packet authorizes
continuation. Preserve the same Task ID and branch unless explicitly directed
otherwise.
