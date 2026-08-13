# Step 2C.3D — WordPress Content Readiness Audit

## Status

APPROVED FOR READ-ONLY AUDIT on `chore/2c3d-content-readiness-audit`.

Step 2C.3D remains **IN PROGRESS**. This increment may inspect and report CMS state but may not change it.

## Objective

Audit Group, Consulting, Healthcare, Lifestyle, and Real Estate independently against the accepted Step 2C.3C B1–B7 public frontend contracts. Classify current CMS readiness and produce a deterministic correction manifest without adding frontend behavior or mutating WordPress.

## Accepted baseline

- Canonical/default branch: `main`.
- Step 2C.3C closure PR: `#12`.
- Accepted closure head: `847b0c3f067d9af4f00591c3554a7a693a646017`.
- Accepted merge commit: `4f306733b3e45bee4244688186e5ecae570fcb8b`.
- Merge method: normal merge commit.
- Frontend CI run #21: PASS on the exact closure head.
- Production deployment: none.
- WordPress/backend change in Step 2C.3C: none.
- `SOT-001`: OPEN and blocking speculative backend changes.

## Audit scope

For each tenant inspect:

1. Reading Settings/static front page and the canonical `/` Homepage lookup;
2. native PRIMARY, FOOTER, and LEGAL menus;
3. exact ADR-014 Business Unit term and assignments;
4. published News, Insight, Article, and Press Release metadata;
5. public Project Archive and Project Single readiness metadata;
6. effective public `siraBrand` identity;
7. typed announcement and emergency state/scheduling;
8. required public media metadata;
9. cross-site differences required by the accepted contract or approved identity evidence.

## Classification vocabulary

Every site/area cell must be exactly one of:

- `READY`
- `MISSING_CONTENT`
- `MISSING_CONFIGURATION`
- `DATA_CORRECTION_REQUIRED`
- `EDITORIAL_ACTION`
- `OWNER_DECISION`
- `BLOCKED`

Every non-READY finding must identify a safe evidence summary, expected state, action owner, non/destructive status, mutation authorization, and verification method.

## Read-only evidence mechanism

`frontend/scripts/content-readiness-audit.mjs` executes one checked-in-schema-backed public GraphQL metadata query per trusted configured tenant endpoint. It:

- reads endpoints from the already-authorized untracked `frontend/.env.local`;
- never prints or persists endpoint values or credentials;
- requests only published/public metadata needed by B1–B7;
- does not request unpublished bodies, users, submissions, cookies, or private options;
- transforms responses immediately into counts, IDs, presence/safety flags, and anomaly summaries;
- stores no raw GraphQL payload;
- fails closed per tenant and records a safe blocker code.

The safe tracked output is `artifacts/step-2c3d/content-readiness.json`.

## Evidence limits

Anonymous public GraphQL proves the behavior seen by the accepted published frontend contracts. It does not prove draft/private totals, private restriction counts, admin provenance, or a mutation-ready WordPress correction path. Those limitations must remain explicit and must not be converted into assumptions.

## Mutation boundary

This increment must not:

- modify WordPress content, options, terms, menus, media, or users;
- modify backend runtime code;
- modify any runtime `.graphql` document, generated contract, adapter, domain type, UI, dependency, lockfile, or production configuration;
- run live schema introspection or schema fetch;
- deploy or merge without later explicit owner approval.

## Validation

From `frontend/`:

1. `pnpm lint`
2. `pnpm typecheck`
3. focused durable-state/readiness contract test
4. `pnpm test:run`
5. `pnpm build`

From repository root:

6. `git diff --check`
7. inspect complete diff and changed-file scope
8. scan the safe artifact/diff for secrets, credentials, endpoints, private bodies, and unrelated changes

## Acceptance

Return `STEP_2C3D_AUDIT_READY_FOR_OWNER_REVIEW` only when all five tenants were inspected, all non-ready states are classified and actionable, and no unresolved evidence gap prevents correction planning.

Return `STEP_2C3D_AUDIT_BLOCKED` if tenant access or source-of-truth conflict prevents a meaningful plan.

Missing CMS content is an audit result, not an audit failure.

## Delivery

- commit only governance/audit/test artifacts;
- push `chore/2c3d-content-readiness-audit`;
- open a draft PR to `main`;
- wait for Frontend CI;
- do not merge, mutate WordPress, or deploy.
