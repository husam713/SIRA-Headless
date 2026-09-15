# SIRA Boot / Recovery Checklist

Use for full boot (governance or durable-state changes, state reconciliation,
interrupted-session recovery, anything touching a protected operation) and
whenever `docs/STATE.md` reports drift you must resolve. Ordinary engineering
boots with `docs/STATE.md` + Git + the files the task touches (`AGENTS.md`
§ Session Boot Protocol). Terminology, roles, profiles, and evidence authority
are defined in `docs/AI-ENGINEERING-OPERATING-PROTOCOL.md`; this checklist
applies them and adds nothing.

## 1. Identity (fill in)

- Task ID (belongs to the project workflow; never minted because a chat was replaced):
- Task Packet location:
- Logical role: `IMPLEMENTATION` | `INDEPENDENT_GITHUB_VERIFICATION` | `PROGRAM_CONTROL` | `DOMAIN_GOVERNANCE`
- Execution profile: `LOCAL` | `CLOUD_GITHUB` | null
- `localEvidenceRequired`: true | false

## 2. Boot — in this order, tick each

- [ ] `AGENTS.md`
- [ ] `docs/STATE.md`
- [ ] `docs/AI-ENGINEERING-OS.md` → the normative protocol
- [ ] the exact active Task Packet (role, profile, `localEvidenceRequired`)
- [ ] Git/GitHub baseline for that profile:
  - `LOCAL`: current branch, HEAD, remotes, tracked/untracked working tree,
    protected local evidence, recent commits, tags
  - `CLOUD_GITHUB`: default branch, exact baseline, task branch/PR state,
    candidate state, checks, merge state; local-only facts are `REPORT_ONLY`
    or `NOT_VERIFIED_BY_THIS_AGENT`
- [ ] `project-state.json`
- [ ] `docs/SOURCE-OF-TRUTH.md`
- [ ] relevant `docs/DECISIONS.md` entries / `docs/adr/`
- [ ] `docs/HANDOFF.md`, and the latest `docs/handoff-log/` entry when resuming
- [ ] open PRs: exact candidate heads, checks, reviews, merge state
- [ ] accepted prior evidence coordinates; relevant source, generated
      contracts, tests, runtime evidence
- [ ] reconcile discrepancies by the protocol's authority hierarchy **before**
      any mutation

Never skip an item silently; report `WARNING` or `BLOCKED` naming the missing
or conflicting source. Never state that boot completed when it did not.

## 3. Baseline lock (record before mutating)

| Field | Value |
|---|---|
| Expected baseline | |
| Verified baseline | |
| Execution profile | |
| Task branch / candidate state | |
| Local current branch | `NOT APPLICABLE` / `NOT_VERIFIED_BY_THIS_AGENT` / value |
| Local tracked working tree | same |
| Local untracked / protected evidence | same |
| Drift classification | none / `BLOCKED_BASELINE_DRIFT` |

Expected ≠ verified → stop unless adaptation is explicitly authorized. Never
reconstruct authority from chat memory. For `CLOUD_GITHUB`, missing unrelated
local evidence is not a blocker unless `localEvidenceRequired=true` or task
correctness depends on it; never fabricate local state.

## 4. Interrupted-session recovery (before resuming any mutation task)

Inspect, without mutating, using the selected profile:

- [ ] authorized baseline and task/candidate coordinates
- [ ] does the authorized work branch already exist?
- [ ] commits since the expected baseline
- [ ] live remote branch / PR state; existing PRs for the branch or Task ID
- [ ] staged/partial local mutations (`LOCAL` only, when relevant)
- [ ] task-identified protected local evidence/hashes (only if the profile can verify them)

Classify: no task work started · safe partial work found · task already
completed pending handoff · baseline drift · unsafe or ambiguous state. Resume
only when the active Task Packet or a recovery-resume packet authorizes it;
keep the same Task ID and branch unless directed otherwise.

## 5. Recovery result (report)

Confirmed repository state · transferred claims awaiting verification ·
report-only/local facts not verified by this agent · unknown · active
authorization · scope exclusions · next safe action.
