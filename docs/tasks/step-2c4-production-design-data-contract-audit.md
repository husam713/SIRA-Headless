# Task — Step 2C.4 Production Design & Data Contract Audit

## Objective

Reconcile the approved SIRA design references with the accepted live frontend contracts and Step 2C.3D content-authority evidence. Produce a complete, read-only page/component/data architecture and a non-destructive CMS correction manifest without starting production component implementation.

## Baseline

- Branch: `main`
- Commit: `1cfab49f113acca5a1866e225f8b5b64a5fcb926`
- Latest accepted stage: Step 2C.3D
- PR #13 correction head: `73bec8e671a53c1abb5396ed945785162b71b5da`
- Frontend CI: #25 PASS
- Regression: 23 files / 196 tests PASS

## In scope

- Direct inspection of the seven approved `.dc.html` references.
- Group, reusable Branch Website System, newsroom, and secondary renderer-family mapping.
- Approved section inventory.
- Server/Client Component boundaries.
- Canonical schema and current generated frontend contract mapping.
- CMS/data, token, typography, responsive, LTR/RTL, accessibility, motion, media, navigation, state, SEO/preview, and performance audit.
- BLOCKING/NONBLOCKING gap classification.
- Proposed non-destructive CMS correction manifest.
- Durable state and contract-test updates.
- Focused branch, draft PR, Frontend CI, and owner acceptance gate.

## Out of scope

- WordPress mutation or deletion.
- Backend runtime GraphQL changes or SOT-001 resolution.
- Generated GraphQL changes.
- Production UI or component implementation.
- Forms, localization, SEO/preview, deployment, DNS, or production configuration implementation.
- Merge to `main`.

## Deliverables

- `docs/STEP-2C4-PRODUCTION-DESIGN-DATA-CONTRACT-AUDIT.md`
- `artifacts/step-2c4/design-data-contract-audit.json`
- `artifacts/step-2c4/cms-correction-manifest.json`
- `frontend/tests/contract/step-2c4-design-data-audit.test.ts`
- Reconciled `project-state.json`, project-state/source-of-truth documentation, and durable decision records.

## Acceptance

- One shared `BranchHomepage` component architecture is instantiated independently for four tenant websites; content, CMS records, hostname, and runtime/cache scope are not shared.
- The canonical public production topology is Group at `siratrgroup.com` and the four branch tenants at their approved subdomains; non-public service origins remain evidence-gated.
- The audit relies on current canonical schema evidence rather than stale Step 2C.1 assumptions.
- Existing native menus, content connections, typed banners, homepage groups, and targeted details are reused.
- Prototype runtime exclusions remain enforced.
- Every CMS action is non-destructive and unauthorized until owner acceptance.
- Required local validation and exact-head Frontend CI pass.
- Draft PR remains unmerged at the owner acceptance gate.

## Rollback

Revert the focused audit commit. No WordPress or deployment rollback is required.
