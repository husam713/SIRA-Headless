# Step 2C.3C-B7 — Project Single Contract

## Status

APPROVED FOR IMPLEMENTATION on `feature/2c3c-b7-project-single-contract`.

## Objective

Complete the final major Step 2C.3C typed frontend data-contract slice by:

1. reconciling durable repository state after accepted/merged B6;
2. verifying the exact canonical shared-schema single-project lookup and identifier semantics;
3. adding a generated Project Single GraphQL operation without altering the accepted B6 archive contract;
4. implementing a published, server-only, site-isolated project-single adapter with explicit ready/not-found/invalid/remote-error semantics;
5. restoring only evidence-backed detail payloads that belong on a project detail page, with safe immutable normalization;
6. preserving all architecture/security gates so the next increment can perform the cumulative Step 2C.3C closure audit.

B7 is a **Project Single data-contract increment only**. Project UI/routes, Preview/Draft Mode, SEO, CMS edits, backend changes, and production deployment remain out of scope.

## Accepted baseline evidence

- Canonical/default branch: `main`.
- Accepted B6 PR: `#10` — owner accepted and merged.
- Accepted B6 implementation head: `f392cfbb022e1928011ff2b28f7955b9e9acb6b0`.
- Accepted B6 merge commit on `main`: `a116fea3514af457a54a0df1d5f4e86e4badbeba`.
- B6 Frontend CI run #15: PASS.
- B6 full regression: 20 files / 158 tests PASS.
- B6 archive operation: `SiraProjects` using generated ownership and `RootQuery.siraProjects`.
- B6 deliberately removed `gallery`, `statistics`, and `relatedCompany` from the archive because they are detail payloads.
- ADR-011 locks the ACF field group type to `ProjectDetails`; never introduce `SiraProjectDetails`.
- ADR-016 locks generated operation ownership: `.graphql -> Codegen -> generated types/document -> GraphQLOperation -> server adapter`.
- Canonical checked-in schema: `frontend/schema/wpgraphql.graphql`.
- Group remains a schema superset; Group-only coordinates must not enter shared operations.
- `SOT-001` remains OPEN and blocks new backend runtime changes.
- Production remains unauthorized.

Repository/schema evidence already confirms a canonical single-project root field exists:

`RootQuery.siraProject(asPreview, id, idType) -> SiraProject`

and the identifier enum is `SiraProjectIdType`.

Do **not** infer the allowed identifier values from convention. Inspect the checked-in schema and choose the route-safe identifier only from exact schema evidence.

## Mandatory pre-implementation durable-state reconciliation

Before modifying B7 runtime/business code, reconcile repository state to record accepted B6.

At minimum inspect/update as required:

- `project-state.json`
- `docs/PROJECT-STATE.md`
- `docs/SOURCE-OF-TRUTH.md`

Required evidence:

- latest accepted milestone: `Step 2C.3C-B6`;
- PR `#10`;
- implementation head `f392cfbb022e1928011ff2b28f7955b9e9acb6b0`;
- merge commit `a116fea3514af457a54a0df1d5f4e86e4badbeba`;
- Frontend CI run #15 PASS;
- current Step 2C.3C substage: B7;
- execution baseline/head: accepted B6 merge where appropriate;
- canonical/default branch remains `main`;
- `productionAuthorized: false`;
- `SOT-001` remains OPEN.

Do not claim CMS readiness, preview acceptance, backend reconciliation, staging, or production deployment.

Commit durable-state reconciliation before the first runtime/business-code edit when practical.

## B7-A — Verify the exact canonical Project Single schema

Inspect `frontend/schema/wpgraphql.graphql` before writing the operation.

Verify and document:

1. exact `RootQuery.siraProject` arguments and nullability;
2. every exact value in `SiraProjectIdType`;
3. which identifier is appropriate for the future public project route (prefer an evidence-backed URI/route identifier if and only if the enum supports it); otherwise stop for an architecture decision rather than implementing a first-match workaround;
4. exact public fields on `SiraProject`, including identity, title, URI, content/excerpt if present, featured media, and `isRestricted`;
5. exact `SiraProject.projectDetails: ProjectDetails` detail coordinates;
6. exact types/connection shapes for `gallery`, `statistics`, and `relatedCompany`;
7. whether detail relations expose restriction/publication signals that must be respected;
8. whether any candidate field is Group-only;
9. whether the canonical schema exposes preview capability through `asPreview` but keep Preview/Draft Mode out of B7 runtime unless an existing accepted frontend abstraction requires otherwise.

Do not run live introspection or `schema:fetch`.

### Lookup rule

Never implement Project Single as:

- `siraProjects(first: 1, ...)`;
- first node from a plural query;
- slug/URI guessing outside the schema;
- a cross-site fallback;
- a request to another tenant when the selected tenant returns null.

Use the native singular lookup only.

If the checked-in canonical schema cannot support a stable public-route lookup without ambiguity, return `BLOCKED_ARCHITECTURE_DECISION` and preserve B6 unchanged.

## B7-B — Generated Project Single operation

Add a dedicated canonical `.graphql` Project Single operation under the existing query convention.

Required flow:

`project-single.graphql -> Codegen -> generated result/variable/document types -> GraphQLOperation -> existing published GraphQL client -> server-only Project Single adapter`

Requirements:

- runtime source derives from generated `TypedDocumentString.toString()`;
- generated types own result/variables;
- do not hand-edit generated files;
- do not duplicate result interfaces unnecessarily;
- do not modify the accepted B6 `SiraProjects` archive operation except for strictly necessary shared typing/import changes;
- operation must validate against the canonical checked-in branch schema;
- no Group-only coordinates;
- `ProjectDetails` only; no `SiraProjectDetails`.

Use a clear operation name such as `SiraProjectSingle` unless repository conventions/schema evidence justify a better narrow name.

## B7-C — Published lookup semantics and input validation

Implement a server-only published Project Single adapter using trusted `SiteKey` plus the evidence-backed project locator.

Requirements:

- validate/normalize the locator before GraphQL transport;
- preserve the exact route identity semantics selected from `SiraProjectIdType`;
- no arbitrary GraphQL endpoint input;
- no arbitrary tenant/taxonomy scope;
- no plural-query fallback;
- no alternate-site fallback;
- null native singular result -> `not-found`;
- restricted project must not leak detail data; map to a non-disclosing not-found/unavailable contract consistent with repository conventions;
- remote GraphQL failure -> stable `remote-error`;
- malformed payload/identity mismatch -> `invalid`;
- successful valid public project -> `ready`.

Do not implement authenticated preview or Draft Mode in B7. If the operation includes `$asPreview` solely because generated schema shape/reuse clearly benefits from it, published execution must explicitly use `false` and no preview credentials may be introduced.

## B7-D — Detail payload discipline

B7 may restore detail fields removed from B6 only when they are canonical, public, and appropriate for a project detail contract.

Expected candidates to verify from schema evidence:

- archive-safe identity/title/URI/restriction data;
- excerpt and/or full content if canonical and required for a detail contract;
- featured image;
- `ProjectDetails.subtitle`;
- `ProjectDetails.location`;
- `ProjectDetails.status`;
- `ProjectDetails.gallery`;
- `ProjectDetails.statistics`;
- `ProjectDetails.relatedCompany`.

Rules:

- do not add fields merely because they exist;
- do not expose raw options, analytics, private metadata, internal IDs beyond stable public/database identity needed by the frontend contract;
- if full `content` is selected, B7 owns only the typed data boundary — do not render it in React or invent an HTML sanitization strategy in this increment;
- relationships should select the minimum stable public identity/presentation fields necessary for later UI/design audit;
- media should select only stable identity/source/alt/dimensions needed by later presentation;
- preserve source order for gallery/statistics/relations unless schema evidence provides an explicit ordering contract;
- no design-specific shaping beyond stable semantic data normalization.

### Bounded detail connections

For gallery/relationship connections, do not silently accept an unbounded or silently truncated detail payload.

Inspect schema/repository conventions and choose a conservative bounded connection strategy. If a connection is bounded with `first`, query `pageInfo.hasNextPage/endCursor` where available and surface truncation explicitly (`invalid` or a stable diagnostic) rather than pretending the partial connection is complete.

Do not implement client pagination for detail sub-connections in B7 unless repository evidence explicitly requires it.

## B7-E — Project Single normalized contract

Create immutable/read-only server-domain types consistent with B2–B6 patterns.

Expected top-level states:

- `ready`
- `not-found`
- `invalid`
- `remote-error`

Use exact repository naming if an existing single-resource convention exists.

Normalize and validate:

- positive project `databaseId`;
- expected locator/URI identity consistency where meaningful;
- title as safe plain text where used as plain text;
- project URI with the same safe public-link policy as accepted contracts;
- featured image/media URL safety;
- gallery media identity, URL, alt text, dimensions, duplicate identities, source order;
- statistics entries as structured label/value data, preserving source order and omitting/diagnosing malformed entries without fabricating replacements;
- related companies as minimal public references with positive identities, safe URI/link values, non-empty public title/name where schema-backed, duplicate protection, and restriction handling if exposed;
- ProjectDetails strings with conservative length/whitespace normalization;
- excerpt as safe summary text;
- content, if included, as an explicitly typed CMS body value — do not silently convert rich content into summary text or strip meaningful markup merely to satisfy normalization.

Do not fabricate:

- gallery images;
- statistics;
- related companies;
- missing body content;
- project title/URI;
- cross-site data.

## B7-F — Site isolation and cache/invalidation

Project Single must remain bound to the trusted tenant selected by `SiteKey`.

Requirements:

- reuse existing published GraphQL transport/site registry;
- reuse the established cache-tag architecture;
- inspect existing single/archive project tag conventions before adding anything;
- use the narrowest architecture-consistent project-single invalidation tag(s);
- no unvalidated locator values in shared/global cache tags;
- no parallel cache framework;
- no client-side cache implementation.

If cache tags require a route identity value, normalize and bound it first and ensure it cannot create arbitrary cross-tenant invalidation scope.

## B7-G — Preserve accepted B6 archive contract

B7 must not regress B6.

Specifically:

- `SiraProjects` remains the lightweight archive operation;
- gallery/statistics/relatedCompany remain absent from the archive query;
- archive cursor validation/result semantics remain unchanged;
- archive tests remain green;
- do not merge Project Single and archive into one oversized operation.

## Explicitly out of scope

- project detail route or React UI;
- project archive UI;
- Client Components;
- Preview/Draft Mode implementation;
- authenticated preview GraphQL;
- SEO/Yoast;
- canonical-domain routing decision;
- CMS edits/content population;
- Business Unit editorial changes;
- project cross-site aggregation;
- backend/WordPress runtime changes;
- live schema fetch/introspection;
- dependency or lockfile upgrades;
- Vite/GitHub Actions warning cleanup;
- production deployment;
- merge to `main`.

## Expected affected areas

Exact paths must follow repository evidence, but expected areas include:

- durable state files;
- this B7 task brief;
- a Project Single `.graphql` document;
- a runtime operation bridge under `frontend/src/queries/`;
- generated `frontend/src/generated/graphql/{graphql,gql}.ts` from Codegen only;
- a Project Single server/domain adapter under the existing `frontend/src/lib/projects/` area;
- focused Project Single tests;
- canonical query-contract tests;
- durable-state evidence test update/rename consistent with current strategy.

Do not reorganize unrelated modules.

## Required tests

At minimum cover:

1. Project Single runtime operation derives from generated document;
2. operation validates against canonical checked-in schema;
3. operation uses native singular `siraProject`, not plural `siraProjects(first:1)`;
4. exact chosen `SiraProjectIdType` is schema-backed and tested;
5. `ProjectDetails` is used and `SiraProjectDetails` is absent;
6. B6 archive remains lightweight and excludes gallery/statistics/relatedCompany;
7. valid project -> `ready`;
8. native null -> `not-found` with no fallback;
9. restricted project does not expose detail payload;
10. invalid locator rejected before transport;
11. remote GraphQL failure -> stable `remote-error`;
12. malformed root/project identity -> `invalid`;
13. unsafe project/media/company URLs do not propagate;
14. gallery order/identity/duplicate/truncation behavior is explicit;
15. statistics normalization preserves valid source order and handles malformed entries safely;
16. related-company normalization is minimal/public/safe and handles duplicates/restrictions where supported;
17. full content behavior, if selected, is explicitly tested as typed CMS body data rather than accidentally plain-text normalized;
18. site isolation/no cross-site fallback is preserved;
19. cache tag behavior is narrow and architecture-consistent;
20. all B1–B6 regression tests remain green;
21. durable state records accepted B6 before B7 runtime work.

## Validation

Run from `frontend/`:

- `pnpm schema:check`
- `pnpm codegen`
- run Codegen a second time and verify generated output is deterministic
- `pnpm lint`
- `pnpm typecheck`
- focused B7 tests
- `pnpm test:run`
- `pnpm build`
- `git diff --check`

Autonomously diagnose/fix failures that are strictly within B7 scope, then rerun gates.

## Security/privacy gate

Before delivery verify:

- no secrets/auth headers/environment values/endpoints committed;
- no Group-only shared coordinates;
- no `SiraProjectDetails`;
- no private/raw/internal project fields;
- no unsafe project/media/company URLs propagated;
- restricted project/relation data does not leak;
- no first-project fallback;
- no cross-site fallback or aggregation;
- no arbitrary tenant/taxonomy scope;
- no Client Components;
- no backend runtime changes;
- no dependency/lockfile churn;
- no live introspection/schema fetch;
- B6 archive remains lightweight.

## Delivery

Work only on:

`feature/2c3c-b7-project-single-contract`

When all required checks pass:

1. inspect the complete diff/security scope;
2. commit scoped B7 changes;
3. push the branch;
4. open a **draft PR** to `main`;
5. wait for Frontend CI;
6. fix only in-scope failures autonomously and rerun gates;
7. do **not** merge the PR;
8. do **not** deploy production.

Return:

- objective completed;
- durable B6 reconciliation performed;
- exact canonical singular project coordinate;
- full `SiraProjectIdType` enum evidence and chosen locator/idType with rationale;
- exact Project Single field set;
- whether `content` was included and why;
- gallery/statistics/relatedCompany connection behavior and truncation policy;
- normalized result states;
- files changed;
- generated GraphQL changes;
- focused tests;
- full regression count;
- schema/codegen result;
- lint/typecheck result;
- production build result;
- GitHub CI result;
- security/privacy review;
- warnings/deferred/CMS-readiness items;
- implementation commit SHA;
- branch;
- PR number;
- rollback point;
- CURRENT PROJECT STATE.

Stop only for a genuine protected, external, or architecture decision requiring the owner.

## Acceptance criteria

B7 is ready for owner review when:

- durable state records accepted/merged B6 before runtime work;
- the native singular project lookup and idType are checked-in-schema-backed;
- no plural first-project fallback exists;
- generated ownership is used end-to-end;
- `ProjectDetails` is preserved;
- detail payload is intentionally separated from B6 archive payload;
- published server-only adapter is tenant-isolated;
- ready/not-found/invalid/remote-error semantics are explicit;
- restricted/private and unsafe-link behavior is safe;
- bounded detail connections cannot silently truncate;
- B6 archive contract remains lightweight and green;
- all required local validation and Frontend CI pass;
- rollback is explicit;
- production remains unauthorized.