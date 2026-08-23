# SIRA Engineering Acceptance Gates

These gates separate implementation progress from actual acceptance.

This document defines durable acceptance mechanics, gate definitions, and
historical gate context. It is not the canonical volatile current-project-state
tracker.

For current project state:

- discover the actual current repository HEAD from Git;
- use `project-state.json` for machine-readable current project state;
- use `docs/PROJECT-STATE.md` for human-readable current-state interpretation;
- use `docs/SOURCE-OF-TRUTH.md` for SIRA-specific source, state, history, and
  conflict mapping;
- use `docs/AI-ENGINEERING-OPERATING-PROTOCOL.md` as the exclusive normative
  authority for evidence precedence between source types.

Recorded milestone SHAs and gate outcomes in this document are provenance and
historical context unless current canonical evidence establishes that they are
also current. No recorded SHA implicitly means eternally current `main`.

## Status vocabulary

Use only:

- PASS
- FAIL
- WARNING
- DEFERRED
- NOT RUN
- BLOCKED
- NOT APPLICABLE

A command may be marked PASS only when it was actually executed against the stated baseline.

## Gate A — Source complete

Required:

- approved stage scope implemented;
- no unrelated architecture rewrite;
- source-of-truth conflicts resolved or explicitly out of scope;
- generated files produced only from their generators;
- no secrets or temporary credentials in source/artifacts;
- diff reviewed for unexpected files and regressions.

## Gate B — Local/dependency validation

Run all checks applicable to the changed subsystem.

Frontend baseline checks normally include:

```bash
cd frontend
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
```

GraphQL/schema changes normally also include:

```bash
pnpm schema:check
pnpm codegen
pnpm test:graphql
```

Schema tooling changes normally also include:

```bash
pnpm check:schema-tooling
```

Backend changes use the backend's actual validation harness and staging checks. Do not invent PHPCS/PHPUnit success where the tools were not executed.

## Gate C — Version-control evidence

Required:

- focused branch;
- understood baseline;
- clean intentional diff;
- no secret leakage;
- commit SHA recorded;
- rollback point identified;
- feature branch pushed;
- PR created/updated when GitHub workflow is in use.

## Gate D — CI

When CI exists:

- required workflow checks pass;
- warnings are classified;
- failed jobs are diagnosed rather than ignored;
- CI evidence is tied to the commit SHA.

Until CI is implemented, status must be `NOT RUN`, not PASS.

## Gate E — Staging/runtime

Required only when the stage affects runtime behavior that cannot be proven locally.

Examples:

- WordPress plugin activation/network activation;
- live WPGraphQL behavior;
- authenticated preview;
- HMAC revalidation;
- menus/front pages/content readiness;
- browser RTL/accessibility behavior;
- Vercel preview/staging behavior.

Never promote source validation to staging validation by inference.

## Gate F — Production

Production requires explicit owner approval after:

- rollback/backups are verified;
- required CI and staging gates pass;
- security and privacy checks pass;
- DNS/cutover plan is approved where applicable;
- monitoring/observability is ready;
- owner explicitly authorizes production.

## Gate progression policy

Do not silently begin the next major milestone after an acceptance gate.

An implementation result, passing local validation, CI PASS, or a Draft PR does
not by itself establish owner acceptance or canonical project state. Protected
transitions remain subject to the owner-gate rules defined by the SIRA AI
Engineering Operating Protocol.

The exact current milestone, current authorization, unresolved gates, and next
owner gate must be read from the canonical current-state carriers listed at the
top of this document rather than duplicated here.

## Historical milestone context

The following sequence is retained only as historical roadmap provenance from an
earlier project state:

1. Step 2C.3C — typed frontend query contracts — accepted.
2. Step 2C.3D — WordPress content readiness — accepted.
3. Step 2C.4 — production design/data contract audit — was previously the next
   owner-acceptance gate at the time this sequence was written.
4. Separately authorized non-destructive CMS correction execution.
5. Step 3 — preview, SEO, discovery.
6. Step 4 — production components.
7. Full QA/staging.
8. Deployment/cutover/rollback.

This historical sequence must not be interpreted as the current project state
or current authorization. Later accepted repository evidence supersedes its
former "current" designation while preserving the historical fact that Step
2C.4 once occupied that position in the roadmap.
