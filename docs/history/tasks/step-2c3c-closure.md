# Step 2C.3C — Cumulative Closure Gate

## Status

APPROVED FOR VALIDATION on `chore/2c3c-cumulative-closure`.

Step 2C.3C remains **IN PROGRESS** until this gate passes Frontend CI, independent review, and explicit owner acceptance.

## Objective

Prove cumulatively that the accepted B1–B7 increments provide the required typed frontend contract layer while preserving every locked architecture, security, tenant-isolation, and no-fabrication boundary.

This increment is validation- and governance-focused. It adds no product behavior.

## Accepted baseline

- Canonical/default branch: `main`.
- Accepted B7 PR: `#11`.
- Accepted B7 implementation: `851b85b3d685ae1304466dc5baecadc87bcd1b90`.
- Accepted B7 merge: `73f41e88a5d1016e2cdd586991765d992a513416`.
- Frontend CI run #17: PASS on the exact B7 implementation head.
- Accepted B7 regression: 21 files / 174 tests PASS.
- Production deployment: NONE.
- WordPress/backend changes: NONE.
- SOT-001: OPEN and blocking new backend runtime changes.

## Scope

The gate must classify every cumulative requirement as one of:

- `PASS`
- `PASS_WITH_DEFERRED_CMS_READINESS`
- `NONBLOCKING_DEFERRED`
- `BLOCKING_GAP`

Required contract areas:

1. generated Brand contract and typed announcement/emergency banners;
2. canonical Homepage lookup and Group/Branch normalization;
3. native primary/footer/legal Navigation;
4. native unfiltered Editorial Feed;
5. server-side Business Unit filtering with ADR-014 mapping;
6. generated lightweight Project Archive;
7. generated native Project Single;
8. generated ownership, checked-in schema, trusted SiteKey, server-only transport, immutable output, explicit states, URL safety, and architecture locks across all areas.

## Closure evidence

The closure report is `docs/STEP-2C3C-CLOSURE.md`.

The focused executable evidence is `frontend/tests/contract/step-2c3c-closure.test.ts`. It composes existing B1–B7 evidence and does not replace the detailed unit/contract suites.

The gate must prove:

- every runtime operation derives from its generated document;
- every canonical operation validates against `frontend/schema/wpgraphql.graphql`;
- no shared operation uses Group-only coordinates;
- no custom `siraNavigation`, `siraEditorialFeed`, or `SiraProjectDetails` contract exists;
- the homepage uses the canonical `/` URI lookup;
- navigation uses `PRIMARY`, `FOOTER`, and `LEGAL` native locations;
- Group remains unfiltered while branches use the exact ADR-014 Business Unit mapping;
- project archive remains detail-light;
- Project Single uses native singular URI lookup with published preview disabled and bounded detail connections;
- adapters remain server-only and site-isolated through the established published GraphQL client;
- durable state records accepted B7, keeps SOT-001 open, and keeps production unauthorized.

## Expected deferred work

The following are not closure failures:

- WordPress menu population/assignment;
- branch static front-page population;
- Business Unit term/content assignment;
- project content population;
- Group/Healthcare brand-content correction;
- Preview/Draft Mode completion;
- Project Single routes/UI;
- rich HTML rendering/sanitization policy;
- SEO/Yoast;
- canonical public domain and final redirect policy;
- production UI and production deployment.

These remain governed by Step 2C.3D, Step 2C.4, Step 3, or Step 4.

## Explicitly out of scope

- production React components or design implementation;
- new GraphQL operations or runtime business behavior;
- WordPress/backend runtime changes;
- CMS edits;
- live schema fetch or introspection;
- dependency or lockfile changes;
- preview, SEO, canonical-domain, or redirect implementation;
- deployment;
- merge to `main` without later explicit owner approval.

## Validation

Run from `frontend/`:

1. `pnpm schema:check`
2. `pnpm codegen`
3. `pnpm codegen` again and prove generated output is deterministic
4. `pnpm lint`
5. `pnpm typecheck`
6. focused closure contract test
7. `pnpm test:run`
8. `pnpm build`
9. `git diff --check`

Do not run `schema:fetch` or live introspection.

Generated GraphQL output must remain unchanged because this closure increment does not change `.graphql` documents.

## Security and architecture review

Before delivery verify:

- no secrets, credentials, endpoint values, or environment contents;
- no Group-only shared coordinates;
- no browser GraphQL or new Client Components;
- no unsafe link propagation or restricted-data leakage;
- no post-fetch pagination filtering or cross-site fallback;
- no Bricks or `.dc.html` production runtime;
- no backend, dependency, or lockfile changes;
- no production deployment;
- Step 2C.3C remains unaccepted until owner review.

## Delivery

When the cumulative gate passes:

1. record the evidence and exact verdict;
2. inspect and commit only closure documentation/tests;
3. push `chore/2c3c-cumulative-closure`;
4. open a draft PR to `main`;
5. wait for Frontend CI;
6. fix only validation-scope defects;
7. do not merge or deploy.

The report must conclude with exactly one verdict token:

- `STEP_2C3C_READY_FOR_OWNER_ACCEPTANCE`
- `STEP_2C3C_BLOCKED`
