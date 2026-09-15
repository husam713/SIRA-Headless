# docs/history — historical records (read-only)

Moved here on 2026-09-15 by TP-P3-STATE-CONSOLIDATION with `git mv`, so
`git log --follow <new path>` reaches each file's full history. Nothing in this
directory is current state and nothing here is edited to match a later decision:
these files say what was true, and accepted, at the time they were written.
Current state lives in `docs/STATE.md` and `project-state.json`; the handoff
log lives in `docs/handoff-log/`.

Evidence records elsewhere in the repository (`backend/MANIFEST.json`,
`frontend/MANIFEST.json`, `*-CHANGED-FILES.json`, `*-LOCAL-VALIDATION.json`,
`backend/docs/STEP-*`) still cite the old paths. They are historical too and
were deliberately left byte-identical; use this table to resolve them.

| Old path | New path |
|---|---|
| `docs/PROJECT-STATE.md` | `docs/history/PROJECT-STATE-2026-09-03.md` |
| `docs/SIRA-STEP-2C-1-APPROVED-DESIGN-AUDIT.md` | `docs/history/SIRA-STEP-2C-1-APPROVED-DESIGN-AUDIT.md` |
| `docs/SIRA-STEP-2C-2-PLANNING.md` | `docs/history/SIRA-STEP-2C-2-PLANNING.md` |
| `docs/STEP-2C3C-CLOSURE.md` | `docs/history/STEP-2C3C-CLOSURE.md` |
| `docs/STEP-2C3D-CONTENT-READINESS.md` | `docs/history/STEP-2C3D-CONTENT-READINESS.md` |
| `docs/STEP-2C4-PRODUCTION-DESIGN-DATA-CONTRACT-AUDIT.md` | `docs/history/STEP-2C4-PRODUCTION-DESIGN-DATA-CONTRACT-AUDIT.md` |
| `docs/STEP-2C5A-CMS-PREFLIGHT-REMEDIATION-PLAN.md` | `docs/history/STEP-2C5A-CMS-PREFLIGHT-REMEDIATION-PLAN.md` |
| `docs/STEP-2C5B-CMS-MUTATION-READINESS-BACKUP-GATE.md` | `docs/history/STEP-2C5B-CMS-MUTATION-READINESS-BACKUP-GATE.md` |
| `docs/STEP-3-PREVIEW-SEO-DISCOVERY.md` | `docs/history/STEP-3-PREVIEW-SEO-DISCOVERY.md` |
| `docs/STEP-3C2-PREVIEW-ENTRY-DRAFT-MODE.md` | `docs/history/STEP-3C2-PREVIEW-ENTRY-DRAFT-MODE.md` |
| `docs/STEP-3D1-STRUCTURED-DATA.md` | `docs/history/STEP-3D1-STRUCTURED-DATA.md` |
| `docs/STEP-4-DESIGN-DIRECTION-RECONCILIATION.md` | `docs/history/STEP-4-DESIGN-DIRECTION-RECONCILIATION.md` |
| `docs/STEP-4-EXACT-DESIGN-FIDELITY-IMPLEMENTATION.md` | `docs/history/STEP-4-EXACT-DESIGN-FIDELITY-IMPLEMENTATION.md` |
| `docs/STEP-4-HOMEPAGE-DATA-CONTRACT.md` | `docs/history/STEP-4-HOMEPAGE-DATA-CONTRACT.md` |
| `docs/tasks/step-2c3c-b1.md` | `docs/history/tasks/step-2c3c-b1.md` |
| `docs/tasks/step-2c3c-b2.md` | `docs/history/tasks/step-2c3c-b2.md` |
| `docs/tasks/step-2c3c-b3.md` | `docs/history/tasks/step-2c3c-b3.md` |
| `docs/tasks/step-2c3c-b4.md` | `docs/history/tasks/step-2c3c-b4.md` |
| `docs/tasks/step-2c3c-b5.md` | `docs/history/tasks/step-2c3c-b5.md` |
| `docs/tasks/step-2c3c-b6.md` | `docs/history/tasks/step-2c3c-b6.md` |
| `docs/tasks/step-2c3c-b7.md` | `docs/history/tasks/step-2c3c-b7.md` |
| `docs/tasks/step-2c3c-closure.md` | `docs/history/tasks/step-2c3c-closure.md` |
| `docs/tasks/step-2c3d-content-readiness.md` | `docs/history/tasks/step-2c3d-content-readiness.md` |
| `docs/tasks/step-2c4-production-design-data-contract-audit.md` | `docs/history/tasks/step-2c4-production-design-data-contract-audit.md` |
| `docs/tasks/step-2c5a-cms-preflight-remediation-plan.md` | `docs/history/tasks/step-2c5a-cms-preflight-remediation-plan.md` |
| `docs/tasks/step-2c5b-cms-mutation-readiness-backup-gate.md` | `docs/history/tasks/step-2c5b-cms-mutation-readiness-backup-gate.md` |

`docs/HANDOFF.md` (the append-only phase log through 2026-09-10) moved to
`docs/handoff-log/2026-09-10-handoff-through-cms-origin-relocation.md`; the
new `docs/HANDOFF.md` is a one-page resume pointer.
