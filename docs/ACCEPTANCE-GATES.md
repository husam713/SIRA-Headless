# SIRA Engineering Acceptance Gates

These gates separate implementation progress from actual acceptance.

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

## Current milestone sequence

1. Step 2C.3C — typed frontend query contracts
2. Step 2C.3D — WordPress content readiness
3. Step 2C.4 — production design/data contract audit
4. Step 3 — preview, SEO, discovery
5. Step 4 — production components
6. full QA/staging
7. deployment/cutover/rollback

Do not silently begin the next major milestone after an acceptance gate.
