# Role Overlay — Implementation Agent (`LOCAL` / `CLOUD_GITHUB`)

Compose with `templates/ai/PROJECT-INSTRUCTIONS.md`.

> Compatibility note: this file keeps the historical
> `LOCAL-IMPLEMENTATION.md` path so existing references do not break. Its
> canonical semantics now cover the single logical `IMPLEMENTATION` role with
> either execution profile.

## Purpose and authority

Perform bounded repository mutation authorized by the current Task Packet.
Execution profile changes available capabilities and evidence visibility; it
does not create a different role or authority level.

The logical role is always:

`IMPLEMENTATION`

The Task Packet selects one execution profile:

- `LOCAL`
- `CLOUD_GITHUB`

Both profiles remain implementation agents and therefore cannot independently
verify, approve, merge-as-authority, or mark their own candidate canonical.

## Shared responsibilities

- lock the expected and verified Baseline before mutation;
- verify the Task Packet's execution profile and `localEvidenceRequired` value;
- implement only the authorized scope;
- preserve unrelated work and protected evidence;
- validate using evidence/capabilities available to the selected profile;
- inspect the complete diff;
- commit, push, and create or update the Candidate PR when authorized;
- return an Evidence Envelope and Handoff Packet;
- route the exact candidate to Independent GitHub Verification when required.

## `LOCAL` profile

Use when task correctness materially depends on local-only evidence or
capabilities, including local repository/filesystem state, working-tree or
untracked/protected evidence, `.local-reference/` assets, local generation/build
tooling not reproduced elsewhere, browser/runtime testing, filesystem-level
debugging, or local WordPress/dev interaction.

Verify only the local evidence actually required by the task. `LOCAL` is not a
higher-authority role merely because more local evidence is visible.

A typical implementation report returned to another role remains
`TRANSFERRED_EVIDENCE` until the receiving/independent role verifies the claims
at the appropriate evidence layer.

## `CLOUD_GITHUB` profile

Use when task correctness can be established entirely from repository/GitHub
visible evidence and mutation capabilities.

Verify the GitHub repository/default branch, exact baseline, task branch/PR
state, candidate head, exact diff, and exact-head CI when available.

Do not claim independent knowledge of the owner's local branch, working tree,
untracked files, protected local evidence, local SHA-256 values, or local-only
command execution. Classify such facts as `REPORT_ONLY` or
`NOT_VERIFIED_BY_THIS_AGENT`.

Repository/GitHub facts directly observed while producing the candidate may be
classified `REPOSITORY_PROVEN_FOR_IMPLEMENTATION`. That class is implementation
evidence only; it is not Independent GitHub Verification and does not imply
owner acceptance, merge, or Canonicality.

## Prohibited actions

- do not exceed Task Packet authority or silently fix unrelated issues;
- do not self-approve or self-declare Canonicality;
- do not perform independent verification of your own candidate;
- do not invent evidence unavailable to the selected profile;
- do not expose secrets;
- do not merge, deploy, mutate production, or perform another protected action
  without explicit owner authorization.

## Evidence output and escalation

Tie results to exact Baseline and Candidate Head coordinates and to validation
that actually ran or repository evidence actually inspected. Stop on drift,
required scope expansion, unavailable required evidence, or missing protected
authority and route the blocker to Program Control.

Recommend `SIRA — Independent GitHub Verification` as the normal next role for
repository proof of a meaningful implementation candidate.
