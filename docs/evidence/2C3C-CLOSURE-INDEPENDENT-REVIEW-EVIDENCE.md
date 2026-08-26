# Step 2C.3C Closure Independent Review Evidence

## 1. Exact diff output

Command:

`git diff --no-color 73f41e88a5d1016e2cdd586991765d992a513416...9c2fb34f9d777dc458290f95ac0925e41c127c85`

~~~~text
diff --git a/docs/PROJECT-STATE.md b/docs/PROJECT-STATE.md
index 77274b6..79a5b27 100644
--- a/docs/PROJECT-STATE.md
+++ b/docs/PROJECT-STATE.md
@@ -1,15 +1,15 @@
 # SIRA Current Project State
 
-Last reconciled from repository and GitHub evidence: 2026-08-11
+Last reconciled from repository and GitHub evidence: 2026-08-12
 
 ## Current execution state
 
 - **Current business stage:** Step 2C.3C — Typed Frontend Query Contracts
-- **Current substage:** B7 — Project Single Contract
+- **Current substage:** 2C.3C-CLOSURE — Cumulative Closure Gate
 - **Canonical integration/default branch:** `main`
-- **Business-code baseline:** `a116fea3514af457a54a0df1d5f4e86e4badbeba`
-- **Current governed integration head:** `a116fea3514af457a54a0df1d5f4e86e4badbeba`
-- **Latest approved business milestone:** Step 2C.3C-B6
+- **Business-code baseline:** `73f41e88a5d1016e2cdd586991765d992a513416`
+- **Current governed integration head:** `73f41e88a5d1016e2cdd586991765d992a513416`
+- **Latest approved business milestone:** Step 2C.3C-B7
 - **Latest approved tag:** `step-2c3b-approved`
 - **Production deployment:** NOT AUTHORIZED
 
@@ -29,6 +29,8 @@ Step 2C.3C-B5 is owner accepted and merged through PR `#9` at `00022da346777ce67
 
 Step 2C.3C-B6 is owner accepted and merged through PR `#10` at `a116fea3514af457a54a0df1d5f4e86e4badbeba`. Its implementation head is `f392cfbb022e1928011ff2b28f7955b9e9acb6b0`, Frontend CI run #15 passed, and the accepted full regression was 20 files / 158 tests PASS.
 
+Step 2C.3C-B7 is owner accepted and merged through PR `#11` at `73f41e88a5d1016e2cdd586991765d992a513416`. Its implementation head is `851b85b3d685ae1304466dc5baecadc87bcd1b90`, Frontend CI run #17 passed on that exact head, and the accepted full regression was 21 files / 174 tests PASS. No production deployment or WordPress/backend change occurred.
+
 ## GitHub governance status
 
 - **GOV-001 — CLOSED:** repository default branch is `main`.
@@ -71,6 +73,8 @@ The lack of platform enforcement is a documented GitHub-plan limitation, not a b
 - Step 2C.3C-B5 owner acceptance, Frontend CI, and merge through PR `#9` at `00022da`
 - Step 2C.3C-B6 generated project archive contract with safe site-isolated normalization
 - Step 2C.3C-B6 owner acceptance, Frontend CI, and merge through PR `#10` at `a116fea`
+- Step 2C.3C-B7 generated native project-single contract with bounded detail relationships
+- Step 2C.3C-B7 owner acceptance, Frontend CI, and merge through PR `#11` at `73f41e8`
 - G0 evidence-first AI engineering governance
 - G0-C GitHub governance and executable Frontend CI
 - canonical/default branch cutover to `main`
@@ -115,9 +119,9 @@ Before Step 2C.3C can be accepted, the typed frontend contract layer must cover:
 
 Production visual components remain out of scope for this stage.
 
-## Current B7 execution policy
+## Current Step 2C.3C closure policy
 
-Step 2C.3C-B7 branches from governed `main` at the accepted B6 merge and implements only the generated, native single-project contract. It must use a canonical schema-backed route locator, preserve the lightweight B6 archive, bound detail connections, enforce trusted site isolation, and return explicit ready/not-found/invalid/remote-error states without restricted-data leakage or cross-site fallback.
+The cumulative closure gate branches from governed `main` at the accepted B7 merge and validates the complete B1–B7 typed frontend contract without adding product behavior. Step 2C.3C remains in progress until the closure PR passes local validation, Frontend CI, independent review, and explicit owner acceptance. CMS readiness, preview/SEO, production design/UI, backend reconciliation, and deployment remain later governed work.
 
 Required delivery flow:
 
diff --git a/docs/SOURCE-OF-TRUTH.md b/docs/SOURCE-OF-TRUTH.md
index 669f133..70115c0 100644
--- a/docs/SOURCE-OF-TRUTH.md
+++ b/docs/SOURCE-OF-TRUTH.md
@@ -21,16 +21,16 @@ A later verified artifact may temporarily supersede repository source for a spec
 
 - Repository: `husam713/SIRA-Headless`
 - Canonical integration/default branch: `main`
-- Current governed frontend baseline/head: `a116fea3514af457a54a0df1d5f4e86e4badbeba`
-- Latest accepted increment: Step 2C.3C-B6
-- B6 PR / implementation / merge: `#10` / `f392cfbb022e1928011ff2b28f7955b9e9acb6b0` / `a116fea3514af457a54a0df1d5f4e86e4badbeba`
+- Current governed frontend baseline/head: `73f41e88a5d1016e2cdd586991765d992a513416`
+- Latest accepted increment: Step 2C.3C-B7
+- B7 PR / implementation / merge: `#11` / `851b85b3d685ae1304466dc5baecadc87bcd1b90` / `73f41e88a5d1016e2cdd586991765d992a513416`
 - Approved tag: `step-2c3b-approved`
 - Checked-in canonical live schema: `frontend/schema/wpgraphql.graphql`
 - Group audit schema: `frontend/schema/wpgraphql.group.graphql`
 - Metadata: `frontend/schema/wpgraphql.meta.json`
 - Compatibility evidence: `frontend/schema/wpgraphql.compatibility.json`
 
-The canonical live metadata records Consulting as canonical, four exact branch peers, and Group as a structural superset. B6 Frontend CI run #15 and the full 20-file / 158-test regression passed before owner acceptance and merge.
+The canonical live metadata records Consulting as canonical, four exact branch peers, and Group as a structural superset. B7 Frontend CI run #17 passed on implementation head `851b85b3d685ae1304466dc5baecadc87bcd1b90`, and the full 21-file / 174-test regression passed before owner acceptance and merge. The cumulative Step 2C.3C closure gate is validation-only and does not supersede the open backend conflict or authorize production.
 
 ## Current backend source status
 
diff --git a/docs/STEP-2C3C-CLOSURE.md b/docs/STEP-2C3C-CLOSURE.md
new file mode 100644
index 0000000..2700ebe
--- /dev/null
+++ b/docs/STEP-2C3C-CLOSURE.md
@@ -0,0 +1,182 @@
+# Step 2C.3C Cumulative Closure Evidence
+
+## Gate status
+
+This report is the validation and governance record for the Step 2C.3C typed frontend contract closure gate. It does not mark Step 2C.3C accepted or complete. Owner acceptance remains required after independent review.
+
+- Baseline: `73f41e88a5d1016e2cdd586991765d992a513416` (`main`, accepted merge of PR #11)
+- Accepted B7 implementation: `851b85b3d685ae1304466dc5baecadc87bcd1b90`
+- Accepted B7 CI: Frontend CI run #17, PASS on the exact implementation head
+- Durable state: `IN_PROGRESS`, `2C.3C-CLOSURE`
+- Canonical/default branch: `main`
+- Production authorization: `false`
+- Backend source conflict: `SOT-001` remains `OPEN`
+
+Classification meanings are defined in `docs/tasks/step-2c3c-closure.md`. No `BLOCKING_GAP` was found.
+
+## Cumulative contract matrix
+
+### A. Brand
+
+| Requirement | Classification | Repository evidence |
+| --- | --- | --- |
+| Generated `siraBrand` contract | PASS | `frontend/src/queries/brand.graphql`, generated `SiraBrandDocument`, and `frontend/src/queries/brand.ts` |
+| Typed announcement and emergency | PASS | Generated operation, `frontend/src/lib/brand/normalize-brand.ts`, and immutable brand domain types |
+| Legacy announcement/emergency strings remain independent | PASS | Typed banners and legacy strings are separately selected and normalized; the fallback does not promote legacy strings into typed banners |
+| Inactive typed scheduling cannot be bypassed by frontend fallback | PASS | `frontend/src/lib/brand/fallbacks.ts` always emits null typed banners; no legacy-to-typed scheduling bypass exists |
+| Severity, link, and target data are typed safely | PASS | Generated enum/type ownership plus conservative URL/target normalization and unit coverage |
+| Live Group/Healthcare brand content correction | PASS_WITH_DEFERRED_CMS_READINESS | Contract is complete; content correction belongs to Step 2C.3D |
+
+### B. Homepage
+
+| Requirement | Classification | Repository evidence |
+| --- | --- | --- |
+| Canonical `page(id: "/", idType: URI)` | PASS | `frontend/src/queries/homepage.graphql` and generated document validation against the checked-in schema |
+| Group versus Branch variants | PASS | Generated union discrimination and `frontend/src/lib/homepage/normalize-homepage.ts` |
+| No first-Page fallback or `/home` guessing | PASS | Native singular root lookup only; cumulative contract test rejects those fallback patterns |
+| Explicit `ready`, `not-found`, `invalid`, `remote-error` states | PASS | Homepage immutable domain result types and adapter unit tests |
+| Published and preview boundaries remain separate | PASS | `frontend/src/lib/homepage/get-homepage.ts` exposes explicit published/preview execution without merging the boundaries |
+| Branch static-front-page population | PASS_WITH_DEFERRED_CMS_READINESS | Runtime contract is complete; tenant content population belongs to Step 2C.3D |
+| Preview/Draft Mode completion | NONBLOCKING_DEFERRED | Governed by Step 3 and not required by this contract gate |
+
+### C. Navigation
+
+| Requirement | Classification | Repository evidence |
+| --- | --- | --- |
+| Native WPGraphQL menus | PASS | `frontend/src/queries/navigation.graphql` uses canonical menu connections |
+| Logical `PRIMARY`, `FOOTER`, `LEGAL` roles | PASS | Explicit native location requests and role-specific normalized results |
+| No `siraNavigation` custom API | PASS | Operation/schema validation and repository-wide closure assertion |
+| Deterministic hierarchy | PASS | `frontend/src/lib/navigation/normalize-navigation.ts` preserves source order and validates parent relationships, identity, and cycles |
+| Missing/unassigned menus are explicit | PASS | Stable ready/missing/invalid/remote-error semantics and unit coverage |
+| Safe href/target normalization | PASS | Unsafe schemes, protocol-relative links, credentials, and malformed values are rejected |
+| WordPress menu population and assignment | PASS_WITH_DEFERRED_CMS_READINESS | Native contract is complete; actual tenant assignments belong to Step 2C.3D |
+
+### D. Editorial feed
+
+| Requirement | Classification | Repository evidence |
+| --- | --- | --- |
+| Native `contentNodes` | PASS | `frontend/src/queries/editorial-feed.graphql` and generated `SiraEditorialFeedDocument` |
+| Accepted editorial types | PASS | Article, News, Perspective, and Publication discriminators are selected and normalized |
+| Cursor pagination and stable order | PASS | Opaque `after`, bounded `first`, pageInfo preservation, and `DATE DESC` operation ordering |
+| Unfiltered root Group feed | PASS | Group dispatches to the native unfiltered operation |
+| No `siraEditorialFeed` custom API | PASS | Canonical operation and cumulative structural test |
+
+### E. Business Unit filtering
+
+| Requirement | Classification | Repository evidence |
+| --- | --- | --- |
+| Server-side filtering | PASS | `frontend/src/queries/editorial-feed-by-business-unit.graphql` uses the canonical Business Unit term content connection |
+| Exact ADR-014 mapping | PASS | `frontend/src/lib/editorial/business-unit.ts`: `group -> null`, `consulting -> consulting`, `healthcare -> healthcare`, `lifestyle -> lifestyle`, `realestate -> real-estate` |
+| No JavaScript post-filtering | PASS | Site mapping selects the generated server operation before transport; normalized pages are not filtered in JavaScript |
+| Missing Business Unit term returns empty | PASS | Null native term result normalizes to a valid empty collection, without unfiltered fallback |
+| Group remains unfiltered | PASS | Group uses the native root feed; branches use the exact mapped term operation |
+| Business Unit terms and content assignments | PASS_WITH_DEFERRED_CMS_READINESS | Contract is complete; tenant taxonomy population belongs to Step 2C.3D |
+
+### F. Project Archive
+
+| Requirement | Classification | Repository evidence |
+| --- | --- | --- |
+| Native `siraProjects` | PASS | `frontend/src/queries/projects.graphql` |
+| Generated operation ownership | PASS | Generated `SiraProjectsDocument` supplies runtime source/result/variable types |
+| Lightweight archive payload | PASS | Identity, presentation, featured-image, and minimal `projectDetails` summary only |
+| Cursor pagination | PASS | Bounded inputs are validated before transport; opaque cursors/pageInfo are preserved |
+| Restricted project omission | PASS | Restricted nodes are omitted without leaking detail |
+| No detail overfetch | PASS | No content, gallery, statistics, or related-company selection in the archive operation |
+| Project content population | PASS_WITH_DEFERRED_CMS_READINESS | Empty collections are valid CMS-readiness evidence for Step 2C.3D |
+
+### G. Project Single
+
+| Requirement | Classification | Repository evidence |
+| --- | --- | --- |
+| Native singular `siraProject` | PASS | Dedicated `frontend/src/queries/project-single.graphql`; no plural first-node lookup |
+| URI lookup | PASS | Generated variables use `SiraProjectIdType.URI`; locator validation precedes transport |
+| Complete `SiraProjectIdType` evidence | PASS | Checked-in schema and closure test verify `DATABASE_ID`, `ID`, `SLUG`, `URI` |
+| Published operation fixes `asPreview: false` | PASS | Generated operation call explicitly supplies `false`; authenticated preview is not introduced |
+| `ProjectDetails`, never `SiraProjectDetails` | PASS | Canonical field/type naming is asserted against operations and repository sources |
+| Rich content preserved as CMS body | PASS | Content remains a typed rich CMS value and is not flattened into plain text |
+| Gallery and related company are bounded | PASS | Gallery is bounded to 50; related company is bounded to 10; both include pageInfo |
+| Truncation detected | PASS | `hasNextPage` on either bounded detail connection produces an explicit invalid result |
+| Restricted project is non-disclosing not-found | PASS | Adapter returns not-found before exposing normalized detail |
+| No plural first-node fallback | PASS | Native singular operation and focused cumulative assertion |
+| Project Single routes/UI | NONBLOCKING_DEFERRED | Governed by later production UI work |
+| Rich HTML render/sanitization policy | NONBLOCKING_DEFERRED | B7 owns the typed CMS boundary only; rendering policy is governed later |
+| Project content population | PASS_WITH_DEFERRED_CMS_READINESS | Valid empty/not-found behavior is present; CMS population belongs to Step 2C.3D |
+
+### H. Cross-cutting
+
+| Requirement | Classification | Repository evidence |
+| --- | --- | --- |
+| Generated GraphQL ownership | PASS | Runtime operations derive from generated typed documents; Codegen owns result/variable types |
+| Checked-in schema is the source | PASS | `frontend/codegen.ts`, `schema:check`, and operation validation use local schema files only |
+| No live schema-fetch dependency | PASS | Closure commands did not execute `schema:fetch` or introspection; local schema paths are asserted |
+| Site isolation through trusted `SiteKey` | PASS | Server adapters accept trusted site keys and resolve the existing site registry before transport |
+| Server-only published adapters | PASS | Published adapters import `server-only` and the existing published GraphQL client |
+| No browser GraphQL | PASS | No Client Component or browser transport was added; closure test audits the adapter boundary |
+| Immutable normalized domain outputs | PASS | Readonly result/domain contracts and deterministic normalizers cover B1-B7 |
+| Explicit result states | PASS | Every accepted adapter exposes its governed ready/empty/not-found/invalid/remote-error variants as applicable |
+| Safe URL policy | PASS | Navigation, brand, editorial, archive, and project-single boundaries reject unsafe public URLs |
+| No secrets | PASS | Diff and repository-targeted secret review found no credentials, tokens, endpoints, or private key material |
+| No Group-only shared canonical coordinates | PASS | Canonical checked-in schema validation passes; shared operations contain only supported coordinates |
+| No backend runtime changes | PASS | Closure diff contains governance documents and frontend contract tests only |
+| No Bricks runtime reintroduction | PASS | Existing design-runtime exclusion contract remains green |
+
+## Architecture-lock audit
+
+| Lock | Classification | Evidence/verdict |
+| --- | --- | --- |
+| WordPress Multisite remains CMS | PASS | No CMS ownership or runtime boundary changed |
+| `sira-core` owns backend architecture | PASS | No backend file changed; `SOT-001` remains open |
+| WPGraphQL remains the primary frontend API | PASS | All B1-B7 contracts use generated canonical WPGraphQL operations |
+| Next.js App Router owns presentation | PASS | Existing frontend boundary remains unchanged; closure adds no production UI |
+| `ProjectDetails` only | PASS | No `SiraProjectDetails` reference exists in runtime operations |
+| Native menus; never `siraNavigation` | PASS | Navigation contract uses canonical menu coordinates |
+| Native `contentNodes`; never `siraEditorialFeed` | PASS | Editorial operations use canonical content connections |
+| No hardcoded branch colors in this stage | PASS | Closure diff introduces no brand/color runtime values |
+| No Bricks production runtime | PASS | Exclusion contract remains green and no runtime integration was added |
+| No production design/components yet | PASS | Closure diff is governance/test-only |
+| No canonical-domain guess | PASS | No domain or redirect policy was introduced |
+| No backend change while `SOT-001` is open | PASS | Diff contains no backend changes |
+| No production deployment | PASS | Production authorization remains false and no deployment action occurred |
+
+## Validation evidence
+
+All commands ran from `frontend/` unless stated otherwise.
+
+| Gate | Result |
+| --- | --- |
+| `pnpm schema:check` | PASS; canonical schema digest `32438736d4d73da267242d2ffe38a3e1c00844d10066d7bc098aad70bbf9f4f0` |
+| First `pnpm codegen` | PASS |
+| Second `pnpm codegen` | PASS |
+| Generated determinism | PASS; all three generated-file SHA-256 values were identical before, between, and after both runs; no generated diff from accepted B7 |
+| `pnpm lint` | PASS |
+| `pnpm typecheck` | PASS |
+| Focused closure test | PASS; 1 file / 9 tests |
+| Focused closure plus reconciled B7 durable-state test | PASS; 2 files / 10 tests |
+| `pnpm test:run` | PASS; 22 files / 183 tests |
+| `pnpm build` | PASS; Next.js production build and static generation completed |
+| `git diff --check` | PASS; no whitespace errors |
+
+The test runner emits an existing Vite configuration future-compatibility warning. The production build emits expected local `WordPressConfigurationError` fallback diagnostics because tenant WordPress endpoint configuration is not available in the validation environment. Neither warning changes contract correctness or production authorization.
+
+## Gap and deferral assessment
+
+No `BLOCKING_GAP` exists in the required typed frontend contract scope.
+
+The following are `PASS_WITH_DEFERRED_CMS_READINESS`: actual menu population/assignment, branch static-front-page population, Business Unit term/content assignments, project content population, and Group/Healthcare brand content correction. They belong to Step 2C.3D.
+
+The following are `NONBLOCKING_DEFERRED`: Preview/Draft Mode completion, Project Single routes/UI, rich HTML rendering/sanitization policy, SEO/Yoast, canonical public domain, final redirect policy, production design/components, and production deployment. They belong to Step 3, Step 2C.4, or Step 4 under existing governance.
+
+## Security and privacy review
+
+- No secret, credential, private endpoint, or production configuration was added.
+- No browser GraphQL, Client Component, arbitrary tenant input, cross-site fallback, or backend runtime change was added.
+- Canonical operations remain checked-in-schema validated and free of Group-only coordinates.
+- Safe URL normalization and non-disclosing restricted-content behavior remain covered by the full regression suite.
+- Generated files, dependency manifests, lockfiles, runtime GraphQL documents, and WordPress/backend files are unchanged by this closure increment.
+- No production deployment occurred, and `productionAuthorized` remains `false`.
+
+## Closure conclusion
+
+The B1-B7 typed frontend contracts are cumulatively complete for the governed Step 2C.3C scope. The remaining items are explicitly assigned to later CMS-readiness, preview/discovery, production design, UI, and deployment stages. Step 2C.3C remains `IN_PROGRESS` at `2C.3C-CLOSURE` pending independent review and owner acceptance.
+
+STEP_2C3C_READY_FOR_OWNER_ACCEPTANCE
diff --git a/docs/tasks/step-2c3c-closure.md b/docs/tasks/step-2c3c-closure.md
new file mode 100644
index 0000000..b6320ce
--- /dev/null
+++ b/docs/tasks/step-2c3c-closure.md
@@ -0,0 +1,144 @@
+# Step 2C.3C — Cumulative Closure Gate
+
+## Status
+
+APPROVED FOR VALIDATION on `chore/2c3c-cumulative-closure`.
+
+Step 2C.3C remains **IN PROGRESS** until this gate passes Frontend CI, independent review, and explicit owner acceptance.
+
+## Objective
+
+Prove cumulatively that the accepted B1–B7 increments provide the required typed frontend contract layer while preserving every locked architecture, security, tenant-isolation, and no-fabrication boundary.
+
+This increment is validation- and governance-focused. It adds no product behavior.
+
+## Accepted baseline
+
+- Canonical/default branch: `main`.
+- Accepted B7 PR: `#11`.
+- Accepted B7 implementation: `851b85b3d685ae1304466dc5baecadc87bcd1b90`.
+- Accepted B7 merge: `73f41e88a5d1016e2cdd586991765d992a513416`.
+- Frontend CI run #17: PASS on the exact B7 implementation head.
+- Accepted B7 regression: 21 files / 174 tests PASS.
+- Production deployment: NONE.
+- WordPress/backend changes: NONE.
+- SOT-001: OPEN and blocking new backend runtime changes.
+
+## Scope
+
+The gate must classify every cumulative requirement as one of:
+
+- `PASS`
+- `PASS_WITH_DEFERRED_CMS_READINESS`
+- `NONBLOCKING_DEFERRED`
+- `BLOCKING_GAP`
+
+Required contract areas:
+
+1. generated Brand contract and typed announcement/emergency banners;
+2. canonical Homepage lookup and Group/Branch normalization;
+3. native primary/footer/legal Navigation;
+4. native unfiltered Editorial Feed;
+5. server-side Business Unit filtering with ADR-014 mapping;
+6. generated lightweight Project Archive;
+7. generated native Project Single;
+8. generated ownership, checked-in schema, trusted SiteKey, server-only transport, immutable output, explicit states, URL safety, and architecture locks across all areas.
+
+## Closure evidence
+
+The closure report is `docs/STEP-2C3C-CLOSURE.md`.
+
+The focused executable evidence is `frontend/tests/contract/step-2c3c-closure.test.ts`. It composes existing B1–B7 evidence and does not replace the detailed unit/contract suites.
+
+The gate must prove:
+
+- every runtime operation derives from its generated document;
+- every canonical operation validates against `frontend/schema/wpgraphql.graphql`;
+- no shared operation uses Group-only coordinates;
+- no custom `siraNavigation`, `siraEditorialFeed`, or `SiraProjectDetails` contract exists;
+- the homepage uses the canonical `/` URI lookup;
+- navigation uses `PRIMARY`, `FOOTER`, and `LEGAL` native locations;
+- Group remains unfiltered while branches use the exact ADR-014 Business Unit mapping;
+- project archive remains detail-light;
+- Project Single uses native singular URI lookup with published preview disabled and bounded detail connections;
+- adapters remain server-only and site-isolated through the established published GraphQL client;
+- durable state records accepted B7, keeps SOT-001 open, and keeps production unauthorized.
+
+## Expected deferred work
+
+The following are not closure failures:
+
+- WordPress menu population/assignment;
+- branch static front-page population;
+- Business Unit term/content assignment;
+- project content population;
+- Group/Healthcare brand-content correction;
+- Preview/Draft Mode completion;
+- Project Single routes/UI;
+- rich HTML rendering/sanitization policy;
+- SEO/Yoast;
+- canonical public domain and final redirect policy;
+- production UI and production deployment.
+
+These remain governed by Step 2C.3D, Step 2C.4, Step 3, or Step 4.
+
+## Explicitly out of scope
+
+- production React components or design implementation;
+- new GraphQL operations or runtime business behavior;
+- WordPress/backend runtime changes;
+- CMS edits;
+- live schema fetch or introspection;
+- dependency or lockfile changes;
+- preview, SEO, canonical-domain, or redirect implementation;
+- deployment;
+- merge to `main` without later explicit owner approval.
+
+## Validation
+
+Run from `frontend/`:
+
+1. `pnpm schema:check`
+2. `pnpm codegen`
+3. `pnpm codegen` again and prove generated output is deterministic
+4. `pnpm lint`
+5. `pnpm typecheck`
+6. focused closure contract test
+7. `pnpm test:run`
+8. `pnpm build`
+9. `git diff --check`
+
+Do not run `schema:fetch` or live introspection.
+
+Generated GraphQL output must remain unchanged because this closure increment does not change `.graphql` documents.
+
+## Security and architecture review
+
+Before delivery verify:
+
+- no secrets, credentials, endpoint values, or environment contents;
+- no Group-only shared coordinates;
+- no browser GraphQL or new Client Components;
+- no unsafe link propagation or restricted-data leakage;
+- no post-fetch pagination filtering or cross-site fallback;
+- no Bricks or `.dc.html` production runtime;
+- no backend, dependency, or lockfile changes;
+- no production deployment;
+- Step 2C.3C remains unaccepted until owner review.
+
+## Delivery
+
+When the cumulative gate passes:
+
+1. record the evidence and exact verdict;
+2. inspect and commit only closure documentation/tests;
+3. push `chore/2c3c-cumulative-closure`;
+4. open a draft PR to `main`;
+5. wait for Frontend CI;
+6. fix only validation-scope defects;
+7. do not merge or deploy.
+
+The report must conclude with exactly one verdict token:
+
+- `STEP_2C3C_READY_FOR_OWNER_ACCEPTANCE`
+- `STEP_2C3C_BLOCKED`
diff --git a/frontend/tests/contract/b7-durable-state.test.ts b/frontend/tests/contract/b7-durable-state.test.ts
index 8a5c98a..856f79c 100644
--- a/frontend/tests/contract/b7-durable-state.test.ts
+++ b/frontend/tests/contract/b7-durable-state.test.ts
@@ -21,8 +21,8 @@ interface ProjectState {
   };
 }
 
-describe("B7 durable state baseline", () => {
-  it("records accepted and merged B6 before B7 runtime work", () => {
+describe("B7 durable state acceptance", () => {
+  it("records accepted and merged B7 before cumulative closure", () => {
     const state = JSON.parse(
       readFileSync(
         new URL("../../../project-state.json", import.meta.url),
@@ -32,21 +32,21 @@ describe("B7 durable state baseline", () => {
 
     expect(state).toMatchObject({
       currentStage: "2C.3C",
-      currentSubstage: "B7",
-      executionBaseline: "a116fea3514af457a54a0df1d5f4e86e4badbeba",
+      currentSubstage: "2C.3C-CLOSURE",
+      executionBaseline: "73f41e88a5d1016e2cdd586991765d992a513416",
       productionAuthorized: false,
       governance: {
         canonicalBranch: "main",
         defaultBranch: "main",
       },
       latestAcceptedIncrement: {
-        stage: "Step 2C.3C-B6",
+        stage: "Step 2C.3C-B7",
         status: "ACCEPTED_MERGED",
-        pullRequest: 10,
-        implementationHead: "f392cfbb022e1928011ff2b28f7955b9e9acb6b0",
-        mergeCommit: "a116fea3514af457a54a0df1d5f4e86e4badbeba",
+        pullRequest: 11,
+        implementationHead: "851b85b3d685ae1304466dc5baecadc87bcd1b90",
+        mergeCommit: "73f41e88a5d1016e2cdd586991765d992a513416",
         frontendCi: "PASS",
-        fullRegression: "20 files / 158 tests PASS",
+        fullRegression: "21 files / 174 tests PASS",
       },
     });
   });
diff --git a/frontend/tests/contract/step-2c3c-closure.test.ts b/frontend/tests/contract/step-2c3c-closure.test.ts
new file mode 100644
index 0000000..040462e
--- /dev/null
+++ b/frontend/tests/contract/step-2c3c-closure.test.ts
@@ -0,0 +1,239 @@
+import { readFileSync } from "node:fs";
+import { buildSchema, isEnumType, parse, validate } from "graphql";
+import { describe, expect, it } from "vitest";
+import {
+  SiraBrandDocument,
+  SiraBusinessUnitEditorialFeedDocument,
+  SiraEditorialFeedDocument,
+  SiraHomepageDocument,
+  SiraNavigationDocument,
+  SiraProjectSingleDocument,
+  SiraProjectsDocument,
+} from "@/generated/graphql/graphql";
+import { getEditorialBusinessUnit } from "@/lib/editorial/business-unit";
+import { SIRA_BRAND_QUERY } from "@/queries/brand";
+import {
+  SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY,
+  SIRA_EDITORIAL_FEED_QUERY,
+} from "@/queries/editorial-feed";
+import { SIRA_HOMEPAGE_QUERY } from "@/queries/homepage";
+import { SIRA_NAVIGATION_QUERY } from "@/queries/navigation";
+import { SIRA_PROJECTS_QUERY } from "@/queries/projects";
+import { SIRA_PROJECT_SINGLE_QUERY } from "@/queries/project-single";
+
+function repositoryFile(relativePath: string): string {
+  return readFileSync(
+    new URL(`../../../${relativePath}`, import.meta.url),
+    "utf8",
+  );
+}
+
+const canonicalSchema = buildSchema(
+  readFileSync(
+    new URL("../../schema/wpgraphql.graphql", import.meta.url),
+    "utf8",
+  ),
+);
+
+const operations = [
+  [SIRA_BRAND_QUERY.source, SiraBrandDocument.toString().trim()],
+  [SIRA_HOMEPAGE_QUERY.source, SiraHomepageDocument.toString().trim()],
+  [SIRA_NAVIGATION_QUERY.source, SiraNavigationDocument.toString().trim()],
+  [
+    SIRA_EDITORIAL_FEED_QUERY.source,
+    SiraEditorialFeedDocument.toString().trim(),
+  ],
+  [
+    SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY.source,
+    SiraBusinessUnitEditorialFeedDocument.toString().trim(),
+  ],
+  [SIRA_PROJECTS_QUERY.source, SiraProjectsDocument.toString().trim()],
+  [
+    SIRA_PROJECT_SINGLE_QUERY.source,
+    SiraProjectSingleDocument.toString().trim(),
+  ],
+] as const;
+
+describe("Step 2C.3C cumulative closure contract", () => {
+  it("keeps every B1-B7 operation generated and canonical-schema valid", () => {
+    for (const [source, generatedSource] of operations) {
+      expect(source).toBe(generatedSource);
+      expect(validate(canonicalSchema, parse(source))).toEqual([]);
+    }
+  });
+
+  it("keeps the checked-in canonical schema as Codegen source", () => {
+    const codegen = repositoryFile("frontend/codegen.ts");
+
+    expect(codegen).toContain('schema: "./schema/wpgraphql.graphql"');
+    expect(codegen).toContain('documents: ["./src/queries/**/*.graphql"]');
+    expect(codegen).not.toMatch(/schema:\s*["']https?:/u);
+    expect(codegen).toContain("immutableTypes: true");
+  });
+
+  it("preserves typed and legacy Brand contracts without banner fallback coupling", () => {
+    const source = SIRA_BRAND_QUERY.source;
+    const normalizer = repositoryFile(
+      "frontend/src/lib/brand/normalize-brand.ts",
+    );
+    const fallbacks = repositoryFile("frontend/src/lib/brand/fallbacks.ts");
+
+    for (const field of [
+      "announcementBanner",
+      "emergencyBanner",
+      "announcement",
+      "emergency",
+      "severity",
+      "startsAt",
+      "endsAt",
+      "dismissible",
+      "revisionKey",
+    ]) {
+      expect(source).toContain(field);
+    }
+
+    expect(normalizer).toContain(
+      "announcementBanner: normalizeText(data.announcementBanner, 500)",
+    );
+    expect(normalizer).toContain(
+      'announcement: normalizeBanner(\n      data.announcement,\n      "announcement"',
+    );
+    expect(fallbacks).toMatch(
+      /announcementBanner:\s*null,[\s\S]*?emergencyBanner:\s*null,[\s\S]*?announcement:\s*null,[\s\S]*?emergency:\s*null/u,
+    );
+  });
+
+  it("locks the canonical Homepage and native Navigation coordinates", () => {
+    expect(SIRA_HOMEPAGE_QUERY.source).toContain(
+      'page(id: "/", idType: URI, asPreview: $asPreview)',
+    );
+    expect(SIRA_HOMEPAGE_QUERY.source).not.toMatch(/\bpages\s*\(/u);
+    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("/home");
+    expect(SIRA_HOMEPAGE_QUERY.source).toContain("groupHomepage");
+    expect(SIRA_HOMEPAGE_QUERY.source).toContain("branchHomepage");
+
+    for (const location of ["PRIMARY", "FOOTER", "LEGAL"]) {
+      expect(SIRA_NAVIGATION_QUERY.source).toContain(`location: ${location}`);
+    }
+    expect(SIRA_NAVIGATION_QUERY.source).not.toContain("siraNavigation");
+  });
+
+  it("locks native editorial pagination and the exact ADR-014 mapping", () => {
+    expect(SIRA_EDITORIAL_FEED_QUERY.source).toMatch(/\bcontentNodes\s*\(/u);
+    expect(SIRA_EDITORIAL_FEED_QUERY.source).not.toMatch(/business.?unit/iu);
+    expect(SIRA_EDITORIAL_FEED_QUERY.source).not.toContain(
+      "siraEditorialFeed",
+    );
+    expect(SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY.source).toMatch(
+      /siraBusinessUnit\s*\(\s*id:\s*\$businessUnit,\s*idType:\s*SLUG/u,
+    );
+
+    expect({
+      group: getEditorialBusinessUnit("group"),
+      consulting: getEditorialBusinessUnit("consulting"),
+      healthcare: getEditorialBusinessUnit("healthcare"),
+      lifestyle: getEditorialBusinessUnit("lifestyle"),
+      realestate: getEditorialBusinessUnit("realestate"),
+    }).toEqual({
+      group: null,
+      consulting: "consulting",
+      healthcare: "healthcare",
+      lifestyle: "lifestyle",
+      realestate: "real-estate",
+    });
+  });
+
+  it("keeps Project Archive light and Project Single native and bounded", () => {
+    expect(SIRA_PROJECTS_QUERY.source).toMatch(/\bsiraProjects\s*\(/u);
+    expect(SIRA_PROJECTS_QUERY.source).not.toMatch(
+      /\b(gallery|statistics|relatedCompany|content)\b/u,
+    );
+    expect(SIRA_PROJECT_SINGLE_QUERY.source).toMatch(
+      /siraProject\s*\(\s*id:\s*\$uri,\s*idType:\s*URI,\s*asPreview:\s*false/u,
+    );
+    expect(SIRA_PROJECT_SINGLE_QUERY.source).not.toMatch(
+      /\bsiraProjects\s*\(/u,
+    );
+    expect(SIRA_PROJECT_SINGLE_QUERY.source).toContain("projectDetails");
+    expect(SIRA_PROJECT_SINGLE_QUERY.source).not.toContain(
+      "SiraProjectDetails",
+    );
+    expect(SIRA_PROJECT_SINGLE_QUERY.source).toContain(
+      "content(format: RENDERED)",
+    );
+    expect(SIRA_PROJECT_SINGLE_QUERY.source).toMatch(/gallery\(first:\s*50\)/u);
+    expect(SIRA_PROJECT_SINGLE_QUERY.source).toMatch(
+      /relatedCompany\(first:\s*10\)/u,
+    );
+  });
+
+  it("locks the complete native project identifier enum", () => {
+    const locatorType = canonicalSchema.getType("SiraProjectIdType");
+
+    expect(isEnumType(locatorType)).toBe(true);
+    expect(
+      isEnumType(locatorType)
+        ? locatorType.getValues().map(({ name }) => name)
+        : [],
+    ).toEqual(["DATABASE_ID", "ID", "SLUG", "URI"]);
+  });
+
+  it("keeps every published domain adapter server-only and site-isolated", () => {
+    for (const path of [
+      "frontend/src/lib/brand/get-brand.ts",
+      "frontend/src/lib/homepage/get-homepage.ts",
+      "frontend/src/lib/navigation/get-navigation.ts",
+      "frontend/src/lib/editorial/get-editorial-feed.ts",
+      "frontend/src/lib/projects/get-project-archive.ts",
+      "frontend/src/lib/projects/get-project-single.ts",
+    ]) {
+      const source = repositoryFile(path);
+
+      expect(source.startsWith('import "server-only";')).toBe(true);
+      expect(source).toContain("fetchPublishedGraphQL");
+      expect(source).toContain("siteKey");
+      expect(source).not.toContain('"use client"');
+    }
+  });
+
+  it("records accepted B7 while closure, SOT-001, and production gates stay open", () => {
+    const state = JSON.parse(repositoryFile("project-state.json")) as {
+      readonly status: string;
+      readonly currentStage: string;
+      readonly currentSubstage: string;
+      readonly productionAuthorized: boolean;
+      readonly latestAcceptedIncrement: {
+        readonly stage: string;
+        readonly status: string;
+        readonly pullRequest: number;
+        readonly implementationHead: string;
+        readonly mergeCommit: string;
+        readonly frontendCi: string;
+        readonly fullRegression: string;
+      };
+      readonly knownConflicts: readonly {
+        readonly id: string;
+        readonly status: string;
+      }[];
+    };
+
+    expect(state).toMatchObject({
+      status: "IN_PROGRESS",
+      currentStage: "2C.3C",
+      currentSubstage: "2C.3C-CLOSURE",
+      productionAuthorized: false,
+      latestAcceptedIncrement: {
+        stage: "Step 2C.3C-B7",
+        status: "ACCEPTED_MERGED",
+        pullRequest: 11,
+        implementationHead: "851b85b3d685ae1304466dc5baecadc87bcd1b90",
+        mergeCommit: "73f41e88a5d1016e2cdd586991765d992a513416",
+        frontendCi: "PASS",
+        fullRegression: "21 files / 174 tests PASS",
+      },
+    });
+    expect(state.knownConflicts).toContainEqual(
+      expect.objectContaining({ id: "SOT-001", status: "OPEN" }),
+    );
+  });
+});
diff --git a/project-state.json b/project-state.json
index 6ce0dea..f4cc0a0 100644
--- a/project-state.json
+++ b/project-state.json
@@ -1,24 +1,24 @@
 {
   "project": "SIRA Headless Platform",
-  "updatedAt": "2026-08-11T19:55:04+03:00",
+  "updatedAt": "2026-08-12T01:57:39+03:00",
   "status": "IN_PROGRESS",
   "currentStage": "2C.3C",
-  "currentSubstage": "B7",
+  "currentSubstage": "2C.3C-CLOSURE",
   "executionBranch": "main",
-  "executionBaseline": "a116fea3514af457a54a0df1d5f4e86e4badbeba",
-  "executionHead": "a116fea3514af457a54a0df1d5f4e86e4badbeba",
-  "latestApprovedMilestone": "Step 2C.3C-B6",
+  "executionBaseline": "73f41e88a5d1016e2cdd586991765d992a513416",
+  "executionHead": "73f41e88a5d1016e2cdd586991765d992a513416",
+  "latestApprovedMilestone": "Step 2C.3C-B7",
   "latestApprovedTag": "step-2c3b-approved",
   "productionAuthorized": false,
   "repositoryEvidencePolicy": "evidence-first",
   "latestAcceptedIncrement": {
-    "stage": "Step 2C.3C-B6",
+    "stage": "Step 2C.3C-B7",
     "status": "ACCEPTED_MERGED",
-    "pullRequest": 10,
-    "implementationHead": "f392cfbb022e1928011ff2b28f7955b9e9acb6b0",
-    "mergeCommit": "a116fea3514af457a54a0df1d5f4e86e4badbeba",
+    "pullRequest": 11,
+    "implementationHead": "851b85b3d685ae1304466dc5baecadc87bcd1b90",
+    "mergeCommit": "73f41e88a5d1016e2cdd586991765d992a513416",
     "frontendCi": "PASS",
-    "fullRegression": "20 files / 158 tests PASS"
+    "fullRegression": "21 files / 174 tests PASS"
   },
   "governance": {
     "g0Bootstrap": "COMPLETE",
~~~~

## 2. Complete exact file contents

### project-state.json

~~~~text
{
  "project": "SIRA Headless Platform",
  "updatedAt": "2026-08-12T01:57:39+03:00",
  "status": "IN_PROGRESS",
  "currentStage": "2C.3C",
  "currentSubstage": "2C.3C-CLOSURE",
  "executionBranch": "main",
  "executionBaseline": "73f41e88a5d1016e2cdd586991765d992a513416",
  "executionHead": "73f41e88a5d1016e2cdd586991765d992a513416",
  "latestApprovedMilestone": "Step 2C.3C-B7",
  "latestApprovedTag": "step-2c3b-approved",
  "productionAuthorized": false,
  "repositoryEvidencePolicy": "evidence-first",
  "latestAcceptedIncrement": {
    "stage": "Step 2C.3C-B7",
    "status": "ACCEPTED_MERGED",
    "pullRequest": 11,
    "implementationHead": "851b85b3d685ae1304466dc5baecadc87bcd1b90",
    "mergeCommit": "73f41e88a5d1016e2cdd586991765d992a513416",
    "frontendCi": "PASS",
    "fullRegression": "21 files / 174 tests PASS"
  },
  "governance": {
    "g0Bootstrap": "COMPLETE",
    "g0MergeCommit": "c26b658b4dfafb82c04af42ca880e6894aefcf0d",
    "g0cGitHubGovernance": "COMPLETE",
    "g0cMergeCommit": "e2a0d425cd7fe435981427d9be33a6e6f9d8f436",
    "canonicalBranch": "main",
    "defaultBranch": "main",
    "branchProtection": "CONFIGURED_NOT_ENFORCED",
    "branchProtectionReason": "GitHub plan limitation for this private repository",
    "compensatingControls": [
      "pull-request workflow",
      "frontend CI",
      "owner approval before merge",
      "no direct agent merge to main"
    ]
  },
  "nextMajorStages": [
    "2C.3C typed frontend query contracts",
    "2C.3D WordPress content readiness",
    "2C.4 production design and data contract audit",
    "3 preview, SEO and discovery",
    "4 production component implementation"
  ],
  "knownConflicts": [
    {
      "id": "SOT-001",
      "subsystem": "backend",
      "status": "OPEN",
      "summary": "GitHub backend source appears older than the verified live GraphQL schema and later migration evidence; reconcile the latest cumulative backend source before modifying backend runtime code."
    }
  ],
  "knownGovernanceIssues": [
    {
      "id": "GOV-001",
      "status": "CLOSED",
      "summary": "Repository default branch is main."
    },
    {
      "id": "GOV-002",
      "status": "CLOSED",
      "summary": "Frontend GitHub Actions CI is installed and has successful workflow evidence from G0-C."
    },
    {
      "id": "GOV-003",
      "status": "WARNING",
      "summary": "A main branch protection rule is configured but GitHub reports it is not enforced for this private repository under the current plan; PR + CI + owner approval remain compensating controls."
    }
  ]
}
~~~~

### docs/PROJECT-STATE.md

~~~~text
# SIRA Current Project State

Last reconciled from repository and GitHub evidence: 2026-08-12

## Current execution state

- **Current business stage:** Step 2C.3C — Typed Frontend Query Contracts
- **Current substage:** 2C.3C-CLOSURE — Cumulative Closure Gate
- **Canonical integration/default branch:** `main`
- **Business-code baseline:** `73f41e88a5d1016e2cdd586991765d992a513416`
- **Current governed integration head:** `73f41e88a5d1016e2cdd586991765d992a513416`
- **Latest approved business milestone:** Step 2C.3C-B7
- **Latest approved tag:** `step-2c3b-approved`
- **Production deployment:** NOT AUTHORIZED

G0 — AI Engineering Governance Bootstrap is complete and merged at `c26b658b4dfafb82c04af42ca880e6894aefcf0d`.

G0-C — GitHub Governance + CI is complete and merged at `e2a0d425cd7fe435981427d9be33a6e6f9d8f436`. The repository default branch is now `main`, and `main` is the canonical integration branch.

Step 2C.3C-B1 is owner accepted and merged through PR `#5` at `ace3d058a688dbe1a483b5a1f60f742bfe85cc5b`. Its implementation head is `d0b0d7fae5aa0870487335e066e51d56010e2137`, and Frontend CI run #5 passed.

Step 2C.3C-B2 is owner accepted and merged through PR `#6` at `5efc1ef7b1a49418aaa4258ed250cc6f9541474c`. Its implementation head is `63d4bac028f6760bd57e522bd4a5f88622c797eb`, and Frontend CI run #7 passed.

Step 2C.3C-B3 is owner accepted and merged through PR `#7` at `2653a66f8c6a469be9412e173abd4f6216725e9b`. Its implementation head is `0e35146a41941c3d400fb8aa55e4a19b6c6791dd`, and Frontend CI run #9 passed.

Step 2C.3C-B4 is owner accepted and merged through PR `#8` at `684bce5b51f977e078029870b085a15b2204ad60`. Its implementation head is `e31ce8e793601266be4ae8064ebb0f5fa74c2e81`, and Frontend CI run #11 passed.

Step 2C.3C-B5 is owner accepted and merged through PR `#9` at `00022da346777ce67acc92b0c53c07627e1d85e3`. Its implementation head is `9fec2ea30c36cab62c1af4f576429bea3ea42628`, and Frontend CI run #13 passed.

Step 2C.3C-B6 is owner accepted and merged through PR `#10` at `a116fea3514af457a54a0df1d5f4e86e4badbeba`. Its implementation head is `f392cfbb022e1928011ff2b28f7955b9e9acb6b0`, Frontend CI run #15 passed, and the accepted full regression was 20 files / 158 tests PASS.

Step 2C.3C-B7 is owner accepted and merged through PR `#11` at `73f41e88a5d1016e2cdd586991765d992a513416`. Its implementation head is `851b85b3d685ae1304466dc5baecadc87bcd1b90`, Frontend CI run #17 passed on that exact head, and the accepted full regression was 21 files / 174 tests PASS. No production deployment or WordPress/backend change occurred.

## GitHub governance status

- **GOV-001 — CLOSED:** repository default branch is `main`.
- **GOV-002 — CLOSED:** frontend GitHub Actions CI is installed and successful workflow evidence exists from G0-C.
- **GOV-003 — WARNING:** a `main` branch protection rule is configured, but GitHub reports it is **not enforced** for this private repository under the current plan.

Compensating controls for GOV-003:

- normal changes arrive through Pull Requests;
- frontend-impacting changes must pass Frontend CI;
- the engineering agent must not directly merge to `main`;
- owner approval is required before merge;
- force-push, branch deletion, production deployment, DNS, and destructive operations remain protected by project policy.

The lack of platform enforcement is a documented GitHub-plan limitation, not a blocker for Step 2C.3C.

## Completed / established

- WordPress Multisite headless architecture
- `sira-core` Step 1 headless refactor baseline
- 28 SIRA CPTs and 10 taxonomies in the backend contract
- curated `siraBrand` GraphQL architecture
- Next.js App Router multi-brand foundation
- validated hostname/site registry
- server-only published and preview GraphQL transports
- Step 2C brand/design-token infrastructure
- five-site live GraphQL inventory
- Step 2C.3A schema compatibility tooling and approved tag at `d361272`
- Step 2C.3B verified live schema adoption and Codegen
- Step 2C.3B approved tag at `d59035d`
- Step 2C.3C-B1 generated runtime brand contract bridge and typed banner query contract
- Step 2C.3C-B1 owner acceptance, Frontend CI, and merge through PR `#5` at `ace3d058`
- Step 2C.3C-B2 canonical homepage contract/server adapter and typed brand banner server normalization
- Step 2C.3C-B2 owner acceptance, Frontend CI, and merge through PR `#6` at `5efc1ef`
- Step 2C.3C-B3 native WPGraphQL navigation and stable primary/footer/legal server contracts
- Step 2C.3C-B3 owner acceptance, Frontend CI, and merge through PR `#7` at `2653a66`
- Step 2C.3C-B4 native WPGraphQL editorial feed and stable cursor-paginated server contract
- Step 2C.3C-B4 owner acceptance, Frontend CI, and merge through PR `#8` at `684bce5`
- Step 2C.3C-B5 site-aware server-side Business Unit filtering with stable cursor pagination
- Step 2C.3C-B5 owner acceptance, Frontend CI, and merge through PR `#9` at `00022da`
- Step 2C.3C-B6 generated project archive contract with safe site-isolated normalization
- Step 2C.3C-B6 owner acceptance, Frontend CI, and merge through PR `#10` at `a116fea`
- Step 2C.3C-B7 generated native project-single contract with bounded detail relationships
- Step 2C.3C-B7 owner acceptance, Frontend CI, and merge through PR `#11` at `73f41e8`
- G0 evidence-first AI engineering governance
- G0-C GitHub governance and executable Frontend CI
- canonical/default branch cutover to `main`

## Verified live schema policy

The checked-in live schema metadata records:

- Consulting is the deterministic canonical branch.
- Consulting, Healthcare, Lifestyle, and Real Estate have exact schema equality.
- Canonical SHA-256: `32438736d4d73da267242d2ffe38a3e1c00844d10066d7bc098aad70bbf9f4f0`.
- Group audit SHA-256: `9469ebc4fbea5e55982661ca58e31de5b592fc8a9e6f0a31efd9bf000bf49971`.
- Group is allowed to remain a structural superset.
- Shared Codegen consumes only `frontend/schema/wpgraphql.graphql`.

## Locked data-contract decisions

- Use `ProjectDetails`; do not introduce `SiraProjectDetails`.
- Use native WPGraphQL menus; do not add `siraNavigation`.
- Use native content connections; do not add `siraEditorialFeed` unless a future evidence-backed ADR explicitly supersedes this decision.
- Explicit Business Unit mapping:
  - `group -> null`
  - `consulting -> consulting`
  - `healthcare -> healthcare`
  - `lifestyle -> lifestyle`
  - `realestate -> real-estate`
- Missing front-page/menu/brand content must be fixed at the CMS source rather than hidden with React hardcoding.

## Step 2C.3C required scope

Before Step 2C.3C can be accepted, the typed frontend contract layer must cover:

1. homepage;
2. native WordPress navigation;
3. footer/legal navigation;
4. unfiltered newsroom/editorial feed;
5. Group Business Unit filtering;
6. project archive;
7. project single;
8. typed announcement banner;
9. typed emergency banner.

Production visual components remain out of scope for this stage.

## Current Step 2C.3C closure policy

The cumulative closure gate branches from governed `main` at the accepted B7 merge and validates the complete B1–B7 typed frontend contract without adding product behavior. Step 2C.3C remains in progress until the closure PR passes local validation, Frontend CI, independent review, and explicit owner acceptance. CMS readiness, preview/SEO, production design/UI, backend reconciliation, and deployment remain later governed work.

Required delivery flow:

`main` -> focused feature branch -> implementation -> local validation -> PR -> Frontend CI -> architecture/security/diff review -> owner approval -> merge.

Do not merge automatically.

## Open source-of-truth conflict

### SOT-001 — backend repository freshness

**Status: OPEN / BLOCKING FOR NEW BACKEND RUNTIME CHANGES**

The current GitHub backend source contains Step 1-era material that is not yet proven to be the latest cumulative backend implementation, while the verified live schema adopted in Step 2C.3B contains later contract work.

Do not modify backend runtime code until the latest verified cumulative backend source is reconciled into Git or an explicit evidence-backed decision establishes the correct backend source of truth.

This conflict does **not** block frontend Step 2C.3C work that is based on the already verified checked-in live schema.

## Next stages

After Step 2C.3C approval:

1. **Step 2C.3D — WordPress Content Readiness**
   - branch front pages;
   - menus;
   - Group/Healthcare brand correction;
   - structured homepage content readiness.
2. **Step 2C.4 — Production Design & Data Contract Audit**
   - preserve and update the earlier approved Step 2C.1 audit using live schema evidence.
3. **Step 3 — Preview / SEO / Discovery**
4. **Step 4 — Production Component Implementation**

## Owner/external decisions still protected

- merge into `main`;
- production merge/deployment;
- destructive WordPress changes;
- DNS/cutover;
- production secrets;
- multilingual production model;
- forms provider/storage/retention architecture.
~~~~

### docs/SOURCE-OF-TRUTH.md

~~~~text
# SIRA Source of Truth

This file defines which evidence wins when project sources disagree.

## Trust order

1. **Executable/live evidence** relevant to the claim: runtime checks, live GraphQL/schema evidence, CI/test output.
2. **Current versioned repository source** for a subsystem, provided it has been reconciled with newer approved artifacts.
3. **Approved Git commits and tags.**
4. **Generated contracts** such as GraphQL schema snapshots and generated TypeScript types.
5. **Machine-readable validation artifacts** and approved decision records.
6. **Project-state documentation.**
7. **Approved specifications/design references.**
8. **Historical migration bundles and legacy source.**
9. **Conversation history.**
10. **Model inference** — never authoritative.

A later verified artifact may temporarily supersede repository source for a specific subsystem when Git is demonstrably stale. Such a discrepancy must be recorded here and reconciled before new changes are made to that subsystem.

## Current authoritative frontend baseline

- Repository: `husam713/SIRA-Headless`
- Canonical integration/default branch: `main`
- Current governed frontend baseline/head: `73f41e88a5d1016e2cdd586991765d992a513416`
- Latest accepted increment: Step 2C.3C-B7
- B7 PR / implementation / merge: `#11` / `851b85b3d685ae1304466dc5baecadc87bcd1b90` / `73f41e88a5d1016e2cdd586991765d992a513416`
- Approved tag: `step-2c3b-approved`
- Checked-in canonical live schema: `frontend/schema/wpgraphql.graphql`
- Group audit schema: `frontend/schema/wpgraphql.group.graphql`
- Metadata: `frontend/schema/wpgraphql.meta.json`
- Compatibility evidence: `frontend/schema/wpgraphql.compatibility.json`

The canonical live metadata records Consulting as canonical, four exact branch peers, and Group as a structural superset. B7 Frontend CI run #17 passed on implementation head `851b85b3d685ae1304466dc5baecadc87bcd1b90`, and the full 21-file / 174-test regression passed before owner acceptance and merge. The cumulative Step 2C.3C closure gate is validation-only and does not supersede the open backend conflict or authorize production.

## Current backend source status

### SOT-001 — OPEN CONFLICT

The `backend/` tree in GitHub is not yet proven to be the latest cumulative backend implementation.

Evidence of conflict:

- GitHub `backend/src/GraphQL/BrandSchema.php` exposes legacy `announcementBanner` and `emergencyBanner` string fields.
- The verified live schema adopted by the frontend contains newer typed announcement/emergency banner objects.
- Project recovery evidence records later Step 2C.2 backend work after the Step 1 baseline.

Policy until reconciled:

- **Do not make new backend runtime changes from the current GitHub backend tree.**
- Use the checked-in verified live schema as authoritative for frontend Step 2C.3C contracts.
- Recover/identify the latest cumulative backend source and compare it against `backend/` before any backend implementation stage.
- Never silently merge historical `sira-core.zip` or the original enterprise bundle over newer verified code.

## Historical / reference-only sources

The following are migration archaeology/reference material unless explicitly re-promoted after verification:

- original `sira-enterprise-wordpress-bundle.zip`;
- original `sira-core.zip`;
- original `sira-bricks-child.zip`;
- legacy Bricks exports and `.dc.html` runtime files;
- early setup/recovery conversation transcripts.

They may explain intent and history but must not override later verified Git/live evidence.

## Conflict protocol

When sources conflict:

1. stop changes to the affected subsystem;
2. identify both sources and their stage/timestamp/evidence level;
3. classify each claim as CONFIRMED, STRONGLY INFERRED, or UNKNOWN;
4. prefer the latest verified authoritative source;
5. record the decision in `docs/DECISIONS.md` if architectural;
6. update this file and `PROJECT-STATE.md` after reconciliation;
7. preserve rollback evidence.
~~~~

### docs/STEP-2C3C-CLOSURE.md

~~~~text
# Step 2C.3C Cumulative Closure Evidence

## Gate status

This report is the validation and governance record for the Step 2C.3C typed frontend contract closure gate. It does not mark Step 2C.3C accepted or complete. Owner acceptance remains required after independent review.

- Baseline: `73f41e88a5d1016e2cdd586991765d992a513416` (`main`, accepted merge of PR #11)
- Accepted B7 implementation: `851b85b3d685ae1304466dc5baecadc87bcd1b90`
- Accepted B7 CI: Frontend CI run #17, PASS on the exact implementation head
- Durable state: `IN_PROGRESS`, `2C.3C-CLOSURE`
- Canonical/default branch: `main`
- Production authorization: `false`
- Backend source conflict: `SOT-001` remains `OPEN`

Classification meanings are defined in `docs/tasks/step-2c3c-closure.md`. No `BLOCKING_GAP` was found.

## Cumulative contract matrix

### A. Brand

| Requirement | Classification | Repository evidence |
| --- | --- | --- |
| Generated `siraBrand` contract | PASS | `frontend/src/queries/brand.graphql`, generated `SiraBrandDocument`, and `frontend/src/queries/brand.ts` |
| Typed announcement and emergency | PASS | Generated operation, `frontend/src/lib/brand/normalize-brand.ts`, and immutable brand domain types |
| Legacy announcement/emergency strings remain independent | PASS | Typed banners and legacy strings are separately selected and normalized; the fallback does not promote legacy strings into typed banners |
| Inactive typed scheduling cannot be bypassed by frontend fallback | PASS | `frontend/src/lib/brand/fallbacks.ts` always emits null typed banners; no legacy-to-typed scheduling bypass exists |
| Severity, link, and target data are typed safely | PASS | Generated enum/type ownership plus conservative URL/target normalization and unit coverage |
| Live Group/Healthcare brand content correction | PASS_WITH_DEFERRED_CMS_READINESS | Contract is complete; content correction belongs to Step 2C.3D |

### B. Homepage

| Requirement | Classification | Repository evidence |
| --- | --- | --- |
| Canonical `page(id: "/", idType: URI)` | PASS | `frontend/src/queries/homepage.graphql` and generated document validation against the checked-in schema |
| Group versus Branch variants | PASS | Generated union discrimination and `frontend/src/lib/homepage/normalize-homepage.ts` |
| No first-Page fallback or `/home` guessing | PASS | Native singular root lookup only; cumulative contract test rejects those fallback patterns |
| Explicit `ready`, `not-found`, `invalid`, `remote-error` states | PASS | Homepage immutable domain result types and adapter unit tests |
| Published and preview boundaries remain separate | PASS | `frontend/src/lib/homepage/get-homepage.ts` exposes explicit published/preview execution without merging the boundaries |
| Branch static-front-page population | PASS_WITH_DEFERRED_CMS_READINESS | Runtime contract is complete; tenant content population belongs to Step 2C.3D |
| Preview/Draft Mode completion | NONBLOCKING_DEFERRED | Governed by Step 3 and not required by this contract gate |

### C. Navigation

| Requirement | Classification | Repository evidence |
| --- | --- | --- |
| Native WPGraphQL menus | PASS | `frontend/src/queries/navigation.graphql` uses canonical menu connections |
| Logical `PRIMARY`, `FOOTER`, `LEGAL` roles | PASS | Explicit native location requests and role-specific normalized results |
| No `siraNavigation` custom API | PASS | Operation/schema validation and repository-wide closure assertion |
| Deterministic hierarchy | PASS | `frontend/src/lib/navigation/normalize-navigation.ts` preserves source order and validates parent relationships, identity, and cycles |
| Missing/unassigned menus are explicit | PASS | Stable ready/missing/invalid/remote-error semantics and unit coverage |
| Safe href/target normalization | PASS | Unsafe schemes, protocol-relative links, credentials, and malformed values are rejected |
| WordPress menu population and assignment | PASS_WITH_DEFERRED_CMS_READINESS | Native contract is complete; actual tenant assignments belong to Step 2C.3D |

### D. Editorial feed

| Requirement | Classification | Repository evidence |
| --- | --- | --- |
| Native `contentNodes` | PASS | `frontend/src/queries/editorial-feed.graphql` and generated `SiraEditorialFeedDocument` |
| Accepted editorial types | PASS | Article, News, Perspective, and Publication discriminators are selected and normalized |
| Cursor pagination and stable order | PASS | Opaque `after`, bounded `first`, pageInfo preservation, and `DATE DESC` operation ordering |
| Unfiltered root Group feed | PASS | Group dispatches to the native unfiltered operation |
| No `siraEditorialFeed` custom API | PASS | Canonical operation and cumulative structural test |

### E. Business Unit filtering

| Requirement | Classification | Repository evidence |
| --- | --- | --- |
| Server-side filtering | PASS | `frontend/src/queries/editorial-feed-by-business-unit.graphql` uses the canonical Business Unit term content connection |
| Exact ADR-014 mapping | PASS | `frontend/src/lib/editorial/business-unit.ts`: `group -> null`, `consulting -> consulting`, `healthcare -> healthcare`, `lifestyle -> lifestyle`, `realestate -> real-estate` |
| No JavaScript post-filtering | PASS | Site mapping selects the generated server operation before transport; normalized pages are not filtered in JavaScript |
| Missing Business Unit term returns empty | PASS | Null native term result normalizes to a valid empty collection, without unfiltered fallback |
| Group remains unfiltered | PASS | Group uses the native root feed; branches use the exact mapped term operation |
| Business Unit terms and content assignments | PASS_WITH_DEFERRED_CMS_READINESS | Contract is complete; tenant taxonomy population belongs to Step 2C.3D |

### F. Project Archive

| Requirement | Classification | Repository evidence |
| --- | --- | --- |
| Native `siraProjects` | PASS | `frontend/src/queries/projects.graphql` |
| Generated operation ownership | PASS | Generated `SiraProjectsDocument` supplies runtime source/result/variable types |
| Lightweight archive payload | PASS | Identity, presentation, featured-image, and minimal `projectDetails` summary only |
| Cursor pagination | PASS | Bounded inputs are validated before transport; opaque cursors/pageInfo are preserved |
| Restricted project omission | PASS | Restricted nodes are omitted without leaking detail |
| No detail overfetch | PASS | No content, gallery, statistics, or related-company selection in the archive operation |
| Project content population | PASS_WITH_DEFERRED_CMS_READINESS | Empty collections are valid CMS-readiness evidence for Step 2C.3D |

### G. Project Single

| Requirement | Classification | Repository evidence |
| --- | --- | --- |
| Native singular `siraProject` | PASS | Dedicated `frontend/src/queries/project-single.graphql`; no plural first-node lookup |
| URI lookup | PASS | Generated variables use `SiraProjectIdType.URI`; locator validation precedes transport |
| Complete `SiraProjectIdType` evidence | PASS | Checked-in schema and closure test verify `DATABASE_ID`, `ID`, `SLUG`, `URI` |
| Published operation fixes `asPreview: false` | PASS | Generated operation call explicitly supplies `false`; authenticated preview is not introduced |
| `ProjectDetails`, never `SiraProjectDetails` | PASS | Canonical field/type naming is asserted against operations and repository sources |
| Rich content preserved as CMS body | PASS | Content remains a typed rich CMS value and is not flattened into plain text |
| Gallery and related company are bounded | PASS | Gallery is bounded to 50; related company is bounded to 10; both include pageInfo |
| Truncation detected | PASS | `hasNextPage` on either bounded detail connection produces an explicit invalid result |
| Restricted project is non-disclosing not-found | PASS | Adapter returns not-found before exposing normalized detail |
| No plural first-node fallback | PASS | Native singular operation and focused cumulative assertion |
| Project Single routes/UI | NONBLOCKING_DEFERRED | Governed by later production UI work |
| Rich HTML render/sanitization policy | NONBLOCKING_DEFERRED | B7 owns the typed CMS boundary only; rendering policy is governed later |
| Project content population | PASS_WITH_DEFERRED_CMS_READINESS | Valid empty/not-found behavior is present; CMS population belongs to Step 2C.3D |

### H. Cross-cutting

| Requirement | Classification | Repository evidence |
| --- | --- | --- |
| Generated GraphQL ownership | PASS | Runtime operations derive from generated typed documents; Codegen owns result/variable types |
| Checked-in schema is the source | PASS | `frontend/codegen.ts`, `schema:check`, and operation validation use local schema files only |
| No live schema-fetch dependency | PASS | Closure commands did not execute `schema:fetch` or introspection; local schema paths are asserted |
| Site isolation through trusted `SiteKey` | PASS | Server adapters accept trusted site keys and resolve the existing site registry before transport |
| Server-only published adapters | PASS | Published adapters import `server-only` and the existing published GraphQL client |
| No browser GraphQL | PASS | No Client Component or browser transport was added; closure test audits the adapter boundary |
| Immutable normalized domain outputs | PASS | Readonly result/domain contracts and deterministic normalizers cover B1-B7 |
| Explicit result states | PASS | Every accepted adapter exposes its governed ready/empty/not-found/invalid/remote-error variants as applicable |
| Safe URL policy | PASS | Navigation, brand, editorial, archive, and project-single boundaries reject unsafe public URLs |
| No secrets | PASS | Diff and repository-targeted secret review found no credentials, tokens, endpoints, or private key material |
| No Group-only shared canonical coordinates | PASS | Canonical checked-in schema validation passes; shared operations contain only supported coordinates |
| No backend runtime changes | PASS | Closure diff contains governance documents and frontend contract tests only |
| No Bricks runtime reintroduction | PASS | Existing design-runtime exclusion contract remains green |

## Architecture-lock audit

| Lock | Classification | Evidence/verdict |
| --- | --- | --- |
| WordPress Multisite remains CMS | PASS | No CMS ownership or runtime boundary changed |
| `sira-core` owns backend architecture | PASS | No backend file changed; `SOT-001` remains open |
| WPGraphQL remains the primary frontend API | PASS | All B1-B7 contracts use generated canonical WPGraphQL operations |
| Next.js App Router owns presentation | PASS | Existing frontend boundary remains unchanged; closure adds no production UI |
| `ProjectDetails` only | PASS | No `SiraProjectDetails` reference exists in runtime operations |
| Native menus; never `siraNavigation` | PASS | Navigation contract uses canonical menu coordinates |
| Native `contentNodes`; never `siraEditorialFeed` | PASS | Editorial operations use canonical content connections |
| No hardcoded branch colors in this stage | PASS | Closure diff introduces no brand/color runtime values |
| No Bricks production runtime | PASS | Exclusion contract remains green and no runtime integration was added |
| No production design/components yet | PASS | Closure diff is governance/test-only |
| No canonical-domain guess | PASS | No domain or redirect policy was introduced |
| No backend change while `SOT-001` is open | PASS | Diff contains no backend changes |
| No production deployment | PASS | Production authorization remains false and no deployment action occurred |

## Validation evidence

All commands ran from `frontend/` unless stated otherwise.

| Gate | Result |
| --- | --- |
| `pnpm schema:check` | PASS; canonical schema digest `32438736d4d73da267242d2ffe38a3e1c00844d10066d7bc098aad70bbf9f4f0` |
| First `pnpm codegen` | PASS |
| Second `pnpm codegen` | PASS |
| Generated determinism | PASS; all three generated-file SHA-256 values were identical before, between, and after both runs; no generated diff from accepted B7 |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| Focused closure test | PASS; 1 file / 9 tests |
| Focused closure plus reconciled B7 durable-state test | PASS; 2 files / 10 tests |
| `pnpm test:run` | PASS; 22 files / 183 tests |
| `pnpm build` | PASS; Next.js production build and static generation completed |
| `git diff --check` | PASS; no whitespace errors |

The test runner emits an existing Vite configuration future-compatibility warning. The production build emits expected local `WordPressConfigurationError` fallback diagnostics because tenant WordPress endpoint configuration is not available in the validation environment. Neither warning changes contract correctness or production authorization.

## Gap and deferral assessment

No `BLOCKING_GAP` exists in the required typed frontend contract scope.

The following are `PASS_WITH_DEFERRED_CMS_READINESS`: actual menu population/assignment, branch static-front-page population, Business Unit term/content assignments, project content population, and Group/Healthcare brand content correction. They belong to Step 2C.3D.

The following are `NONBLOCKING_DEFERRED`: Preview/Draft Mode completion, Project Single routes/UI, rich HTML rendering/sanitization policy, SEO/Yoast, canonical public domain, final redirect policy, production design/components, and production deployment. They belong to Step 3, Step 2C.4, or Step 4 under existing governance.

## Security and privacy review

- No secret, credential, private endpoint, or production configuration was added.
- No browser GraphQL, Client Component, arbitrary tenant input, cross-site fallback, or backend runtime change was added.
- Canonical operations remain checked-in-schema validated and free of Group-only coordinates.
- Safe URL normalization and non-disclosing restricted-content behavior remain covered by the full regression suite.
- Generated files, dependency manifests, lockfiles, runtime GraphQL documents, and WordPress/backend files are unchanged by this closure increment.
- No production deployment occurred, and `productionAuthorized` remains `false`.

## Closure conclusion

The B1-B7 typed frontend contracts are cumulatively complete for the governed Step 2C.3C scope. The remaining items are explicitly assigned to later CMS-readiness, preview/discovery, production design, UI, and deployment stages. Step 2C.3C remains `IN_PROGRESS` at `2C.3C-CLOSURE` pending independent review and owner acceptance.

STEP_2C3C_READY_FOR_OWNER_ACCEPTANCE
~~~~

### docs/tasks/step-2c3c-closure.md

~~~~text
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
~~~~

### frontend/tests/contract/b7-durable-state.test.ts

~~~~text
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface ProjectState {
  readonly currentStage: string;
  readonly currentSubstage: string;
  readonly executionBaseline: string;
  readonly productionAuthorized: boolean;
  readonly governance: {
    readonly canonicalBranch: string;
    readonly defaultBranch: string;
  };
  readonly latestAcceptedIncrement: {
    readonly stage: string;
    readonly status: string;
    readonly pullRequest: number;
    readonly implementationHead: string;
    readonly mergeCommit: string;
    readonly frontendCi: string;
    readonly fullRegression: string;
  };
}

describe("B7 durable state acceptance", () => {
  it("records accepted and merged B7 before cumulative closure", () => {
    const state = JSON.parse(
      readFileSync(
        new URL("../../../project-state.json", import.meta.url),
        "utf8",
      ),
    ) as ProjectState;

    expect(state).toMatchObject({
      currentStage: "2C.3C",
      currentSubstage: "2C.3C-CLOSURE",
      executionBaseline: "73f41e88a5d1016e2cdd586991765d992a513416",
      productionAuthorized: false,
      governance: {
        canonicalBranch: "main",
        defaultBranch: "main",
      },
      latestAcceptedIncrement: {
        stage: "Step 2C.3C-B7",
        status: "ACCEPTED_MERGED",
        pullRequest: 11,
        implementationHead: "851b85b3d685ae1304466dc5baecadc87bcd1b90",
        mergeCommit: "73f41e88a5d1016e2cdd586991765d992a513416",
        frontendCi: "PASS",
        fullRegression: "21 files / 174 tests PASS",
      },
    });
  });
});
~~~~

### frontend/tests/contract/step-2c3c-closure.test.ts

~~~~text
import { readFileSync } from "node:fs";
import { buildSchema, isEnumType, parse, validate } from "graphql";
import { describe, expect, it } from "vitest";
import {
  SiraBrandDocument,
  SiraBusinessUnitEditorialFeedDocument,
  SiraEditorialFeedDocument,
  SiraHomepageDocument,
  SiraNavigationDocument,
  SiraProjectSingleDocument,
  SiraProjectsDocument,
} from "@/generated/graphql/graphql";
import { getEditorialBusinessUnit } from "@/lib/editorial/business-unit";
import { SIRA_BRAND_QUERY } from "@/queries/brand";
import {
  SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY,
  SIRA_EDITORIAL_FEED_QUERY,
} from "@/queries/editorial-feed";
import { SIRA_HOMEPAGE_QUERY } from "@/queries/homepage";
import { SIRA_NAVIGATION_QUERY } from "@/queries/navigation";
import { SIRA_PROJECTS_QUERY } from "@/queries/projects";
import { SIRA_PROJECT_SINGLE_QUERY } from "@/queries/project-single";

function repositoryFile(relativePath: string): string {
  return readFileSync(
    new URL(`../../../${relativePath}`, import.meta.url),
    "utf8",
  );
}

const canonicalSchema = buildSchema(
  readFileSync(
    new URL("../../schema/wpgraphql.graphql", import.meta.url),
    "utf8",
  ),
);

const operations = [
  [SIRA_BRAND_QUERY.source, SiraBrandDocument.toString().trim()],
  [SIRA_HOMEPAGE_QUERY.source, SiraHomepageDocument.toString().trim()],
  [SIRA_NAVIGATION_QUERY.source, SiraNavigationDocument.toString().trim()],
  [
    SIRA_EDITORIAL_FEED_QUERY.source,
    SiraEditorialFeedDocument.toString().trim(),
  ],
  [
    SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY.source,
    SiraBusinessUnitEditorialFeedDocument.toString().trim(),
  ],
  [SIRA_PROJECTS_QUERY.source, SiraProjectsDocument.toString().trim()],
  [
    SIRA_PROJECT_SINGLE_QUERY.source,
    SiraProjectSingleDocument.toString().trim(),
  ],
] as const;

describe("Step 2C.3C cumulative closure contract", () => {
  it("keeps every B1-B7 operation generated and canonical-schema valid", () => {
    for (const [source, generatedSource] of operations) {
      expect(source).toBe(generatedSource);
      expect(validate(canonicalSchema, parse(source))).toEqual([]);
    }
  });

  it("keeps the checked-in canonical schema as Codegen source", () => {
    const codegen = repositoryFile("frontend/codegen.ts");

    expect(codegen).toContain('schema: "./schema/wpgraphql.graphql"');
    expect(codegen).toContain('documents: ["./src/queries/**/*.graphql"]');
    expect(codegen).not.toMatch(/schema:\s*["']https?:/u);
    expect(codegen).toContain("immutableTypes: true");
  });

  it("preserves typed and legacy Brand contracts without banner fallback coupling", () => {
    const source = SIRA_BRAND_QUERY.source;
    const normalizer = repositoryFile(
      "frontend/src/lib/brand/normalize-brand.ts",
    );
    const fallbacks = repositoryFile("frontend/src/lib/brand/fallbacks.ts");

    for (const field of [
      "announcementBanner",
      "emergencyBanner",
      "announcement",
      "emergency",
      "severity",
      "startsAt",
      "endsAt",
      "dismissible",
      "revisionKey",
    ]) {
      expect(source).toContain(field);
    }

    expect(normalizer).toContain(
      "announcementBanner: normalizeText(data.announcementBanner, 500)",
    );
    expect(normalizer).toContain(
      'announcement: normalizeBanner(\n      data.announcement,\n      "announcement"',
    );
    expect(fallbacks).toMatch(
      /announcementBanner:\s*null,[\s\S]*?emergencyBanner:\s*null,[\s\S]*?announcement:\s*null,[\s\S]*?emergency:\s*null/u,
    );
  });

  it("locks the canonical Homepage and native Navigation coordinates", () => {
    expect(SIRA_HOMEPAGE_QUERY.source).toContain(
      'page(id: "/", idType: URI, asPreview: $asPreview)',
    );
    expect(SIRA_HOMEPAGE_QUERY.source).not.toMatch(/\bpages\s*\(/u);
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("/home");
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("groupHomepage");
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("branchHomepage");

    for (const location of ["PRIMARY", "FOOTER", "LEGAL"]) {
      expect(SIRA_NAVIGATION_QUERY.source).toContain(`location: ${location}`);
    }
    expect(SIRA_NAVIGATION_QUERY.source).not.toContain("siraNavigation");
  });

  it("locks native editorial pagination and the exact ADR-014 mapping", () => {
    expect(SIRA_EDITORIAL_FEED_QUERY.source).toMatch(/\bcontentNodes\s*\(/u);
    expect(SIRA_EDITORIAL_FEED_QUERY.source).not.toMatch(/business.?unit/iu);
    expect(SIRA_EDITORIAL_FEED_QUERY.source).not.toContain(
      "siraEditorialFeed",
    );
    expect(SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY.source).toMatch(
      /siraBusinessUnit\s*\(\s*id:\s*\$businessUnit,\s*idType:\s*SLUG/u,
    );

    expect({
      group: getEditorialBusinessUnit("group"),
      consulting: getEditorialBusinessUnit("consulting"),
      healthcare: getEditorialBusinessUnit("healthcare"),
      lifestyle: getEditorialBusinessUnit("lifestyle"),
      realestate: getEditorialBusinessUnit("realestate"),
    }).toEqual({
      group: null,
      consulting: "consulting",
      healthcare: "healthcare",
      lifestyle: "lifestyle",
      realestate: "real-estate",
    });
  });

  it("keeps Project Archive light and Project Single native and bounded", () => {
    expect(SIRA_PROJECTS_QUERY.source).toMatch(/\bsiraProjects\s*\(/u);
    expect(SIRA_PROJECTS_QUERY.source).not.toMatch(
      /\b(gallery|statistics|relatedCompany|content)\b/u,
    );
    expect(SIRA_PROJECT_SINGLE_QUERY.source).toMatch(
      /siraProject\s*\(\s*id:\s*\$uri,\s*idType:\s*URI,\s*asPreview:\s*false/u,
    );
    expect(SIRA_PROJECT_SINGLE_QUERY.source).not.toMatch(
      /\bsiraProjects\s*\(/u,
    );
    expect(SIRA_PROJECT_SINGLE_QUERY.source).toContain("projectDetails");
    expect(SIRA_PROJECT_SINGLE_QUERY.source).not.toContain(
      "SiraProjectDetails",
    );
    expect(SIRA_PROJECT_SINGLE_QUERY.source).toContain(
      "content(format: RENDERED)",
    );
    expect(SIRA_PROJECT_SINGLE_QUERY.source).toMatch(/gallery\(first:\s*50\)/u);
    expect(SIRA_PROJECT_SINGLE_QUERY.source).toMatch(
      /relatedCompany\(first:\s*10\)/u,
    );
  });

  it("locks the complete native project identifier enum", () => {
    const locatorType = canonicalSchema.getType("SiraProjectIdType");

    expect(isEnumType(locatorType)).toBe(true);
    expect(
      isEnumType(locatorType)
        ? locatorType.getValues().map(({ name }) => name)
        : [],
    ).toEqual(["DATABASE_ID", "ID", "SLUG", "URI"]);
  });

  it("keeps every published domain adapter server-only and site-isolated", () => {
    for (const path of [
      "frontend/src/lib/brand/get-brand.ts",
      "frontend/src/lib/homepage/get-homepage.ts",
      "frontend/src/lib/navigation/get-navigation.ts",
      "frontend/src/lib/editorial/get-editorial-feed.ts",
      "frontend/src/lib/projects/get-project-archive.ts",
      "frontend/src/lib/projects/get-project-single.ts",
    ]) {
      const source = repositoryFile(path);

      expect(source.startsWith('import "server-only";')).toBe(true);
      expect(source).toContain("fetchPublishedGraphQL");
      expect(source).toContain("siteKey");
      expect(source).not.toContain('"use client"');
    }
  });

  it("records accepted B7 while closure, SOT-001, and production gates stay open", () => {
    const state = JSON.parse(repositoryFile("project-state.json")) as {
      readonly status: string;
      readonly currentStage: string;
      readonly currentSubstage: string;
      readonly productionAuthorized: boolean;
      readonly latestAcceptedIncrement: {
        readonly stage: string;
        readonly status: string;
        readonly pullRequest: number;
        readonly implementationHead: string;
        readonly mergeCommit: string;
        readonly frontendCi: string;
        readonly fullRegression: string;
      };
      readonly knownConflicts: readonly {
        readonly id: string;
        readonly status: string;
      }[];
    };

    expect(state).toMatchObject({
      status: "IN_PROGRESS",
      currentStage: "2C.3C",
      currentSubstage: "2C.3C-CLOSURE",
      productionAuthorized: false,
      latestAcceptedIncrement: {
        stage: "Step 2C.3C-B7",
        status: "ACCEPTED_MERGED",
        pullRequest: 11,
        implementationHead: "851b85b3d685ae1304466dc5baecadc87bcd1b90",
        mergeCommit: "73f41e88a5d1016e2cdd586991765d992a513416",
        frontendCi: "PASS",
        fullRegression: "21 files / 174 tests PASS",
      },
    });
    expect(state.knownConflicts).toContainEqual(
      expect.objectContaining({ id: "SOT-001", status: "OPEN" }),
    );
  });
});
~~~~

## 3. PR #12 evidence

~~~~text
state: open
isDraft: true
mergeable: true
base branch: main
exact base SHA: 73f41e88a5d1016e2cdd586991765d992a513416
head branch: chore/2c3c-cumulative-closure
exact head SHA: 9c2fb34f9d777dc458290f95ac0925e41c127c85
commit count: 2
commit list:
5c3bb58e74575546241296968ab15d56e9e79422 chore(governance): reconcile state after B7 acceptance
9c2fb34f9d777dc458290f95ac0925e41c127c85 test(frontend): add Step 2C.3C closure gate
CI status rollup:
Frontend CI: status=completed conclusion=success run_number=19
frontend job: status=completed conclusion=success
~~~~

## 4. Exact Frontend CI #19 evidence

~~~~text
workflow name: Frontend CI
run number: 19
run id: 31545389731
status: completed
conclusion: success
head SHA: 9c2fb34f9d777dc458290f95ac0925e41c127c85
job name: frontend
job id: 93956644111
job status: completed
job conclusion: success
~~~~

## 5. Read-only search results

### git grep -n "siraNavigation"

~~~~text
AGENTS.md:62:- Use native WPGraphQL menus; do not create `siraNavigation`.
docs/DECISIONS.md:64:- **Rule:** Do not create `RootQuery.siraNavigation`.
docs/HANDOFF.md:46:- native menus, not `siraNavigation`;
docs/PROJECT-STATE.md:96:- Use native WPGraphQL menus; do not add `siraNavigation`.
docs/SIRA-STEP-2C-2-PLANNING.md:725:If stable menu locations cannot survive the selected WordPress theme strategy, add a small curated `siraNavigation` GraphQL schema that resolves only explicitly approved menus.
docs/STEP-2C3C-CLOSURE.md:48:| No `siraNavigation` custom API | PASS | Operation/schema validation and repository-wide closure assertion |
docs/STEP-2C3C-CLOSURE.md:132:| Native menus; never `siraNavigation` | PASS | Navigation contract uses canonical menu coordinates |
docs/tasks/step-2c3c-b1.md:76:- Do not introduce `siraNavigation`, `siraEditorialFeed`, `SiraProjectDetails`, Bricks runtime code, or `.dc.html` runtime dependencies.
docs/tasks/step-2c3c-b2.md:73:- Use native WPGraphQL menus later; do not create `siraNavigation`.
docs/tasks/step-2c3c-b3.md:30:- ADR-012 requires native WPGraphQL menus and forbids a custom `siraNavigation` root field.
docs/tasks/step-2c3c-b3.md:77:- Use native WPGraphQL menus (`ADR-012`). Do not create `siraNavigation`.
docs/tasks/step-2c3c-b3.md:92:- do not introduce or reference `siraNavigation`;
docs/tasks/step-2c3c-b3.md:232:3. operation uses native WPGraphQL menu coordinates and does not reference `siraNavigation`;
docs/tasks/step-2c3c-b3.md:267:- no `siraNavigation` custom contract;
docs/tasks/step-2c3c-b3.md:293:- native WPGraphQL menus are used with no custom `siraNavigation`;
docs/tasks/step-2c3c-closure.md:58:- no custom `siraNavigation`, `siraEditorialFeed`, or `SiraProjectDetails` contract exists;
frontend/tests/contract/query-contracts.test.ts:195:    expect(SIRA_NAVIGATION_QUERY.source).not.toContain("siraNavigation");
frontend/tests/contract/step-2c3c-closure.test.ts:118:    expect(SIRA_NAVIGATION_QUERY.source).not.toContain("siraNavigation");
~~~~

### git grep -n "siraEditorialFeed"

~~~~text
AGENTS.md:63:- Use native content connections; do not create `siraEditorialFeed` unless a future evidence-backed ADR explicitly changes this.
docs/DECISIONS.md:70:- **Rule:** Do not create `RootQuery.siraEditorialFeed` unless a later evidence-backed ADR explicitly supersedes this.
docs/HANDOFF.md:47:- native content connections, not `siraEditorialFeed`;
docs/PROJECT-STATE.md:97:- Use native content connections; do not add `siraEditorialFeed` unless a future evidence-backed ADR explicitly supersedes this decision.
docs/SIRA-STEP-2C-1-APPROVED-DESIGN-AUDIT.md:56:   The backend has separate News, Insight, Article, and Press Release types. The design presents one combined “News & Insights” experience. The live schema must first be checked for a stable cross-type `contentNodes` query. If unavailable or unsuitable for cursor pagination, add one targeted typed `siraEditorialFeed` connection.
docs/SIRA-STEP-2C-1-APPROVED-DESIGN-AUDIT.md:621:RootQuery.siraEditorialFeed
docs/SIRA-STEP-2C-2-PLANNING.md:760:  siraEditorialFeed(
docs/SIRA-STEP-2C-2-PLANNING.md:924:RootQuery.siraEditorialFeed
docs/SIRA-STEP-2C-2-PLANNING.md:927:`RootQuery.siraEditorialFeed` is reserved but must not be registered unless native schema inspection fails.
docs/STEP-2C3C-CLOSURE.md:62:| No `siraEditorialFeed` custom API | PASS | Canonical operation and cumulative structural test |
docs/STEP-2C3C-CLOSURE.md:133:| Native `contentNodes`; never `siraEditorialFeed` | PASS | Editorial operations use canonical content connections |
docs/tasks/step-2c3c-b1.md:76:- Do not introduce `siraNavigation`, `siraEditorialFeed`, `SiraProjectDetails`, Bricks runtime code, or `.dc.html` runtime dependencies.
docs/tasks/step-2c3c-b2.md:74:- Use native content connections later; do not create `siraEditorialFeed`.
docs/tasks/step-2c3c-b4.md:14:4. normalizing public editorial items into a stable immutable frontend contract without inventing a custom `siraEditorialFeed` API;
docs/tasks/step-2c3c-b4.md:32:- ADR-013 requires native WPGraphQL content connections and forbids a custom `RootQuery.siraEditorialFeed` unless a later evidence-backed ADR supersedes it.
docs/tasks/step-2c3c-b4.md:79:- Use native WPGraphQL content connections (`ADR-013`). Do not create or use `siraEditorialFeed`.
docs/tasks/step-2c3c-b4.md:110:- do not add or reference `siraEditorialFeed`;
docs/tasks/step-2c3c-b4.md:239:3. operation uses the native content connection and does not reference `siraEditorialFeed`;
docs/tasks/step-2c3c-b4.md:274:- no `siraEditorialFeed` custom contract;
docs/tasks/step-2c3c-b4.md:301:- native WPGraphQL content connection is used with no custom `siraEditorialFeed`;
docs/tasks/step-2c3c-b5.md:35:- ADR-013 requires native WPGraphQL content connections and forbids a custom `RootQuery.siraEditorialFeed`.
docs/tasks/step-2c3c-b5.md:88:- Use native WPGraphQL content connections (`ADR-013`). Do not create or use `siraEditorialFeed`.
docs/tasks/step-2c3c-b5.md:163:- no custom `siraEditorialFeed`;
docs/tasks/step-2c3c-b5.md:310:8. no `siraEditorialFeed` custom root is introduced;
docs/tasks/step-2c3c-b5.md:344:- no `siraEditorialFeed` custom contract;
docs/tasks/step-2c3c-closure.md:58:- no custom `siraNavigation`, `siraEditorialFeed`, or `SiraProjectDetails` contract exists;
frontend/tests/contract/query-contracts.test.ts:92:      "siraEditorialFeed",
frontend/tests/contract/query-contracts.test.ts:142:    expect(source).not.toContain("siraEditorialFeed");
frontend/tests/contract/step-2c3c-closure.test.ts:125:      "siraEditorialFeed",
tools/report/SOURCE-VERIFIED-BASELINE.md:26:- `RootQuery.siraEditorialFeed` is reserved in planning only and must not be
~~~~

### git grep -n "SiraProjectDetails"

~~~~text
AGENTS.md:61:- The live project ACF type is `ProjectDetails`; do not introduce `SiraProjectDetails`.
backend/src/Integrations/AcfIntegration.php:235:				'graphql_type_name'                    => 'SiraProjectDetails',
backend/tools/validation/graphql-validation.graphql:17:  projectDetails: __type(name: "SiraProjectDetails") {
backend/tools/validation/validate-runtime.php:240:			'SiraProjectDetails',
docs/DECISIONS.md:59:- **Rule:** Do not introduce `SiraProjectDetails`.
docs/PROJECT-STATE.md:95:- Use `ProjectDetails`; do not introduce `SiraProjectDetails`.
docs/STEP-2C3C-CLOSURE.md:95:| `ProjectDetails`, never `SiraProjectDetails` | PASS | Canonical field/type naming is asserted against operations and repository sources |
docs/STEP-2C3C-CLOSURE.md:131:| `ProjectDetails` only | PASS | No `SiraProjectDetails` reference exists in runtime operations |
docs/tasks/step-2c3c-b1.md:76:- Do not introduce `siraNavigation`, `siraEditorialFeed`, `SiraProjectDetails`, Bricks runtime code, or `.dc.html` runtime dependencies.
docs/tasks/step-2c3c-b2.md:75:- Use `ProjectDetails`; do not introduce `SiraProjectDetails`.
docs/tasks/step-2c3c-b6.md:32:- ADR-011 locks the project ACF type to `ProjectDetails`; do not introduce `SiraProjectDetails`.
docs/tasks/step-2c3c-b6.md:241:3. operation uses the verified project archive connection and `projectDetails`, never `SiraProjectDetails`;
docs/tasks/step-2c3c-b6.md:276:- no `SiraProjectDetails` introduction;
docs/tasks/step-2c3c-b6.md:336:- `ProjectDetails` is preserved and `SiraProjectDetails` is absent;
docs/tasks/step-2c3c-b7.md:30:- ADR-011 locks the ACF field group type to `ProjectDetails`; never introduce `SiraProjectDetails`.
docs/tasks/step-2c3c-b7.md:121:- `ProjectDetails` only; no `SiraProjectDetails`.
docs/tasks/step-2c3c-b7.md:286:5. `ProjectDetails` is used and `SiraProjectDetails` is absent;
docs/tasks/step-2c3c-b7.md:326:- no `SiraProjectDetails`;
docs/tasks/step-2c3c-closure.md:58:- no custom `siraNavigation`, `siraEditorialFeed`, or `SiraProjectDetails` contract exists;
frontend/schema/README.md:53:Do not require or introduce `SiraProjectDetails`.
frontend/tests/contract/query-contracts.test.ts:221:    expect(SIRA_PROJECTS_QUERY.source).not.toContain("SiraProjectDetails");
frontend/tests/contract/query-contracts.test.ts:294:    expect(source).not.toContain("SiraProjectDetails");
frontend/tests/contract/step-2c3c-closure.test.ts:159:      "SiraProjectDetails",
frontend/tests/unit/schema-compatibility.test.ts:390:      projectDetails: SiraProjectDetails
frontend/tests/unit/schema-compatibility.test.ts:393:    type SiraProjectDetails {
tools/scripts/graphql-inventory.mjs:48:  "SiraProjectDetails",
tools/scripts/graphql-inventory.mjs:57:  "SiraProjectDetails",
~~~~

### git grep -n "ProjectDetails"

~~~~text
AGENTS.md:61:- The live project ACF type is `ProjectDetails`; do not introduce `SiraProjectDetails`.
backend/src/Integrations/AcfIntegration.php:235:				'graphql_type_name'                    => 'SiraProjectDetails',
backend/tools/validation/graphql-validation.graphql:17:  projectDetails: __type(name: "SiraProjectDetails") {
backend/tools/validation/validate-runtime.php:240:			'SiraProjectDetails',
docs/DECISIONS.md:56:## ADR-011 — The project ACF type is `ProjectDetails`
docs/DECISIONS.md:59:- **Rule:** Do not introduce `SiraProjectDetails`.
docs/HANDOFF.md:45:- canonical project ACF type: `ProjectDetails`;
docs/PROJECT-STATE.md:95:- Use `ProjectDetails`; do not introduce `SiraProjectDetails`.
docs/STEP-2C3C-CLOSURE.md:95:| `ProjectDetails`, never `SiraProjectDetails` | PASS | Canonical field/type naming is asserted against operations and repository sources |
docs/STEP-2C3C-CLOSURE.md:131:| `ProjectDetails` only | PASS | No `SiraProjectDetails` reference exists in runtime operations |
docs/tasks/step-2c3c-b1.md:76:- Do not introduce `siraNavigation`, `siraEditorialFeed`, `SiraProjectDetails`, Bricks runtime code, or `.dc.html` runtime dependencies.
docs/tasks/step-2c3c-b2.md:75:- Use `ProjectDetails`; do not introduce `SiraProjectDetails`.
docs/tasks/step-2c3c-b6.md:32:- ADR-011 locks the project ACF type to `ProjectDetails`; do not introduce `SiraProjectDetails`.
docs/tasks/step-2c3c-b6.md:85:- exact `projectDetails` field and its GraphQL type (`ProjectDetails` per ADR-011);
docs/tasks/step-2c3c-b6.md:241:3. operation uses the verified project archive connection and `projectDetails`, never `SiraProjectDetails`;
docs/tasks/step-2c3c-b6.md:276:- no `SiraProjectDetails` introduction;
docs/tasks/step-2c3c-b6.md:336:- `ProjectDetails` is preserved and `SiraProjectDetails` is absent;
docs/tasks/step-2c3c-b7.md:30:- ADR-011 locks the ACF field group type to `ProjectDetails`; never introduce `SiraProjectDetails`.
docs/tasks/step-2c3c-b7.md:82:5. exact `SiraProject.projectDetails: ProjectDetails` detail coordinates;
docs/tasks/step-2c3c-b7.md:121:- `ProjectDetails` only; no `SiraProjectDetails`.
docs/tasks/step-2c3c-b7.md:154:- `ProjectDetails.subtitle`;
docs/tasks/step-2c3c-b7.md:155:- `ProjectDetails.location`;
docs/tasks/step-2c3c-b7.md:156:- `ProjectDetails.status`;
docs/tasks/step-2c3c-b7.md:157:- `ProjectDetails.gallery`;
docs/tasks/step-2c3c-b7.md:158:- `ProjectDetails.statistics`;
docs/tasks/step-2c3c-b7.md:159:- `ProjectDetails.relatedCompany`.
docs/tasks/step-2c3c-b7.md:202:- ProjectDetails strings with conservative length/whitespace normalization;
docs/tasks/step-2c3c-b7.md:286:5. `ProjectDetails` is used and `SiraProjectDetails` is absent;
docs/tasks/step-2c3c-b7.md:326:- no `SiraProjectDetails`;
docs/tasks/step-2c3c-b7.md:392:- `ProjectDetails` is preserved;
docs/tasks/step-2c3c-closure.md:58:- no custom `siraNavigation`, `siraEditorialFeed`, or `SiraProjectDetails` contract exists;
frontend/docs/STEP-2C3A-LOCAL-VALIDATION.json:51:        "requiredTypeUsesProjectDetails": true,
frontend/docs/STEP-2C3A-LOCAL-VALIDATION.json:61:        "bootstrapUsesProjectDetails": true,
frontend/docs/STEP-2C3A-NOTES.md:19:- `ProjectDetails` is the required generated project detail type.
frontend/docs/STEP-2C3A-VALIDATION.md:30:- `ProjectDetails` is required.
frontend/schema/README.md:44:ProjectDetails
frontend/schema/README.md:50:ProjectDetails
frontend/schema/README.md:53:Do not require or introduce `SiraProjectDetails`.
frontend/schema/README.md:55:`SiraProject.projectDetails` must resolve to `ProjectDetails`.
frontend/schema/README.md:145:- the required `ProjectDetails` contract;
frontend/schema/wpgraphql.bootstrap.graphql:117:  projectDetails: ProjectDetails
frontend/schema/wpgraphql.bootstrap.graphql:123:type ProjectDetails {
frontend/schema/wpgraphql.bootstrap.graphql:127:  statistics: [ProjectDetailsStatistics]
frontend/schema/wpgraphql.bootstrap.graphql:130:type ProjectDetailsStatistics {
frontend/schema/wpgraphql.compatibility.json:333:          "name": "ProjectItemProjectDetails"
frontend/schema/wpgraphql.compatibility.json:337:          "name": "ProjectItemProjectDetails_Fields"
frontend/schema/wpgraphql.compatibility.json:341:          "name": "ProjectItemProjectDetailsProjectList"
frontend/schema/wpgraphql.compatibility.json:345:          "name": "ProjectItemProjectDetailsProjectList_Fields"
frontend/schema/wpgraphql.graphql:71:Connection between the ProjectDetails_Fields type and the MediaItem type
frontend/schema/wpgraphql.graphql:12147:The &quot;ProjectDetails&quot; Field Group. Added to the Schema by &quot;WPGraphQL for ACF&quot;.
frontend/schema/wpgraphql.graphql:12149:type ProjectDetails implements AcfFieldGroup & AcfFieldGroupFields & ProjectDetails_Fields {
frontend/schema/wpgraphql.graphql:12195:  statistics: [ProjectDetailsStatistics]
frontend/schema/wpgraphql.graphql:12205:The &quot;ProjectDetailsStatistics&quot; Field Group. Added to the Schema by &quot;WPGraphQL for ACF&quot;.
frontend/schema/wpgraphql.graphql:12207:type ProjectDetailsStatistics implements AcfFieldGroup & AcfFieldGroupFields & ProjectDetailsStatistics_Fields {
frontend/schema/wpgraphql.graphql:12219:Interface representing fields of the ACF &quot;ProjectDetailsStatistics&quot; Field Group
frontend/schema/wpgraphql.graphql:12221:interface ProjectDetailsStatistics_Fields implements AcfFieldGroup & AcfFieldGroupFields {
frontend/schema/wpgraphql.graphql:12233:Interface representing fields of the ACF &quot;ProjectDetails&quot; Field Group
frontend/schema/wpgraphql.graphql:12235:interface ProjectDetails_Fields implements AcfFieldGroup & AcfFieldGroupFields {
frontend/schema/wpgraphql.graphql:12281:  statistics: [ProjectDetailsStatistics]
frontend/schema/wpgraphql.graphql:50713:type SiraProject implements ContentNode & DatabaseIdentifier & MenuItemLinkable & Node & NodeWithAuthor & NodeWithContentEditor & NodeWithExcerpt & NodeWithFeaturedImage & NodeWithRevisions & NodeWithTemplate & NodeWithTitle & Previewable & UniformResourceIdentifiable & WithAcfProjectDetails {
frontend/schema/wpgraphql.graphql:50899:  """Fields of the ProjectDetails ACF Field Group"""
frontend/schema/wpgraphql.graphql:50900:  projectDetails: ProjectDetails
frontend/schema/wpgraphql.graphql:68592:Provides access to fields of the &quot;ProjectDetails&quot; ACF Field Group via the &quot;projectDetails&quot; field
frontend/schema/wpgraphql.graphql:68594:interface WithAcfProjectDetails {
frontend/schema/wpgraphql.graphql:68595:  """Fields of the ProjectDetails ACF Field Group"""
frontend/schema/wpgraphql.graphql:68596:  projectDetails: ProjectDetails
frontend/schema/wpgraphql.group.graphql:71:Connection between the ProjectDetails_Fields type and the MediaItem type
frontend/schema/wpgraphql.group.graphql:13428:The &quot;ProjectDetails&quot; Field Group. Added to the Schema by &quot;WPGraphQL for ACF&quot;.
frontend/schema/wpgraphql.group.graphql:13430:type ProjectDetails implements AcfFieldGroup & AcfFieldGroupFields & ProjectDetails_Fields {
frontend/schema/wpgraphql.group.graphql:13476:  statistics: [ProjectDetailsStatistics]
frontend/schema/wpgraphql.group.graphql:13486:The &quot;ProjectDetailsStatistics&quot; Field Group. Added to the Schema by &quot;WPGraphQL for ACF&quot;.
frontend/schema/wpgraphql.group.graphql:13488:type ProjectDetailsStatistics implements AcfFieldGroup & AcfFieldGroupFields & ProjectDetailsStatistics_Fields {
frontend/schema/wpgraphql.group.graphql:13500:Interface representing fields of the ACF &quot;ProjectDetailsStatistics&quot; Field Group
frontend/schema/wpgraphql.group.graphql:13502:interface ProjectDetailsStatistics_Fields implements AcfFieldGroup & AcfFieldGroupFields {
frontend/schema/wpgraphql.group.graphql:13514:Interface representing fields of the ACF &quot;ProjectDetails&quot; Field Group
frontend/schema/wpgraphql.group.graphql:13516:interface ProjectDetails_Fields implements AcfFieldGroup & AcfFieldGroupFields {
frontend/schema/wpgraphql.group.graphql:13562:  statistics: [ProjectDetailsStatistics]
frontend/schema/wpgraphql.group.graphql:13595:  projectDetails: [ProjectItemProjectDetails]
frontend/schema/wpgraphql.group.graphql:13630:The &quot;ProjectItemProjectDetails&quot; Field Group. Added to the Schema by &quot;WPGraphQL for ACF&quot;.
frontend/schema/wpgraphql.group.graphql:13632:type ProjectItemProjectDetails implements AcfFieldGroup & AcfFieldGroupFields & ProjectItemProjectDetails_Fields {
frontend/schema/wpgraphql.group.graphql:13637:  Field of the &quot;textarea&quot; Field Type added to the schema as part of the &quot;ProjectItemProjectDetails&quot; Field Group
frontend/schema/wpgraphql.group.graphql:13642:  Field of the &quot;repeater&quot; Field Type added to the schema as part of the &quot;ProjectItemProjectDetails&quot; Field Group
frontend/schema/wpgraphql.group.graphql:13644:  projectList: [ProjectItemProjectDetailsProjectList]
frontend/schema/wpgraphql.group.graphql:13647:  Field of the &quot;text&quot; Field Type added to the schema as part of the &quot;ProjectItemProjectDetails&quot; Field Group
frontend/schema/wpgraphql.group.graphql:13653:The &quot;ProjectItemProjectDetailsProjectList&quot; Field Group. Added to the Schema by &quot;WPGraphQL for ACF&quot;.
frontend/schema/wpgraphql.group.graphql:13655:type ProjectItemProjectDetailsProjectList implements AcfFieldGroup & AcfFieldGroupFields & ProjectItemProjectDetailsProjectList_Fields {
frontend/schema/wpgraphql.group.graphql:13660:  Field of the &quot;text&quot; Field Type added to the schema as part of the &quot;ProjectItemProjectDetailsProjectList&quot; Field Group
frontend/schema/wpgraphql.group.graphql:13666:Interface representing fields of the ACF &quot;ProjectItemProjectDetailsProjectList&quot; Field Group
frontend/schema/wpgraphql.group.graphql:13668:interface ProjectItemProjectDetailsProjectList_Fields implements AcfFieldGroup & AcfFieldGroupFields {
frontend/schema/wpgraphql.group.graphql:13673:  Field of the &quot;text&quot; Field Type added to the schema as part of the &quot;ProjectItemProjectDetailsProjectList&quot; Field Group
frontend/schema/wpgraphql.group.graphql:13679:Interface representing fields of the ACF &quot;ProjectItemProjectDetails&quot; Field Group
frontend/schema/wpgraphql.group.graphql:13681:interface ProjectItemProjectDetails_Fields implements AcfFieldGroup & AcfFieldGroupFields {
frontend/schema/wpgraphql.group.graphql:13686:  Field of the &quot;textarea&quot; Field Type added to the schema as part of the &quot;ProjectItemProjectDetails&quot; Field Group
frontend/schema/wpgraphql.group.graphql:13691:  Field of the &quot;repeater&quot; Field Type added to the schema as part of the &quot;ProjectItemProjectDetails&quot; Field Group
frontend/schema/wpgraphql.group.graphql:13693:  projectList: [ProjectItemProjectDetailsProjectList]
frontend/schema/wpgraphql.group.graphql:13696:  Field of the &quot;text&quot; Field Type added to the schema as part of the &quot;ProjectItemProjectDetails&quot; Field Group
frontend/schema/wpgraphql.group.graphql:13711:  projectDetails: [ProjectItemProjectDetails]
frontend/schema/wpgraphql.group.graphql:55341:type SiraProject implements ContentNode & DatabaseIdentifier & MenuItemLinkable & Node & NodeWithAuthor & NodeWithContentEditor & NodeWithExcerpt & NodeWithFeaturedImage & NodeWithRevisions & NodeWithTemplate & NodeWithTitle & Previewable & UniformResourceIdentifiable & WithAcfProjectDetails {
frontend/schema/wpgraphql.group.graphql:55527:  """Fields of the ProjectDetails ACF Field Group"""
frontend/schema/wpgraphql.group.graphql:55528:  projectDetails: ProjectDetails
frontend/schema/wpgraphql.group.graphql:73811:Provides access to fields of the &quot;ProjectDetails&quot; ACF Field Group via the &quot;projectDetails&quot; field
frontend/schema/wpgraphql.group.graphql:73813:interface WithAcfProjectDetails {
frontend/schema/wpgraphql.group.graphql:73814:  """Fields of the ProjectDetails ACF Field Group"""
frontend/schema/wpgraphql.group.graphql:73815:  projectDetails: ProjectDetails
frontend/scripts/schema-compatibility.mjs:66:  "ProjectDetails",
frontend/scripts/schema-compatibility.mjs:839:  if (getNamedType(projectDetailsField.type).name !== "ProjectDetails") {
frontend/scripts/schema-compatibility.mjs:841:      `SiraProject.projectDetails must resolve to ProjectDetails on ${siteKey}.`,
frontend/tests/contract/query-contracts.test.ts:221:    expect(SIRA_PROJECTS_QUERY.source).not.toContain("SiraProjectDetails");
frontend/tests/contract/query-contracts.test.ts:229:  it("proves the shared project connection and ProjectDetails schema types", () => {
frontend/tests/contract/query-contracts.test.ts:265:    ).toBe("ProjectDetails");
frontend/tests/contract/query-contracts.test.ts:294:    expect(source).not.toContain("SiraProjectDetails");
frontend/tests/contract/step-2c3c-closure.test.ts:159:      "SiraProjectDetails",
frontend/tests/fixtures/schema/canonical.graphql:29:  projectDetails: ProjectDetails
frontend/tests/fixtures/schema/canonical.graphql:32:type ProjectDetails {
frontend/tests/fixtures/schema/canonical.graphql:34:  statistics: [ProjectDetailsStatistics]
frontend/tests/fixtures/schema/canonical.graphql:37:type ProjectDetailsStatistics {
frontend/tests/fixtures/schema/group-changed-field.graphql:29:  projectDetails: ProjectDetails
frontend/tests/fixtures/schema/group-changed-field.graphql:32:type ProjectDetails {
frontend/tests/fixtures/schema/group-changed-field.graphql:34:  statistics: [ProjectDetailsStatistics]
frontend/tests/fixtures/schema/group-changed-field.graphql:37:type ProjectDetailsStatistics {
frontend/tests/fixtures/schema/group-missing-field.graphql:28:  projectDetails: ProjectDetails
frontend/tests/fixtures/schema/group-missing-field.graphql:31:type ProjectDetails {
frontend/tests/fixtures/schema/group-missing-field.graphql:33:  statistics: [ProjectDetailsStatistics]
frontend/tests/fixtures/schema/group-missing-field.graphql:36:type ProjectDetailsStatistics {
frontend/tests/fixtures/schema/group-required-argument.graphql:29:  projectDetails: ProjectDetails
frontend/tests/fixtures/schema/group-required-argument.graphql:32:type ProjectDetails {
frontend/tests/fixtures/schema/group-required-argument.graphql:34:  statistics: [ProjectDetailsStatistics]
frontend/tests/fixtures/schema/group-required-argument.graphql:37:type ProjectDetailsStatistics {
frontend/tests/fixtures/schema/group-superset.graphql:35:  projectDetails: ProjectDetails
frontend/tests/fixtures/schema/group-superset.graphql:38:type ProjectDetails {
frontend/tests/fixtures/schema/group-superset.graphql:40:  statistics: [ProjectDetailsStatistics]
frontend/tests/fixtures/schema/group-superset.graphql:43:type ProjectDetailsStatistics {
frontend/tests/unit/projects/project-single.test.ts:12:type ProjectDetails = NonNullable<ProjectNode["projectDetails"]>;
frontend/tests/unit/projects/project-single.test.ts:13:type GalleryNode = NonNullable<ProjectDetails["gallery"]>["nodes"][number];
frontend/tests/unit/projects/project-single.test.ts:15:  ProjectDetails["relatedCompany"]
frontend/tests/unit/projects/project-single.test.ts:193:        } as ProjectDetails,
frontend/tests/unit/projects/project-single.test.ts:233:          } as ProjectDetails,
frontend/tests/unit/projects/project-single.test.ts:254:        } as ProjectDetails,
frontend/tests/unit/projects/project-single.test.ts:292:        } as ProjectDetails,
frontend/tests/unit/projects/project-single.test.ts:338:          } as ProjectDetails,
frontend/tests/unit/schema-compatibility.test.ts:355:  it("requires the verified live ProjectDetails type", () => {
frontend/tests/unit/schema-compatibility.test.ts:366:    ).toThrow(/ProjectDetails/);
frontend/tests/unit/schema-compatibility.test.ts:390:      projectDetails: SiraProjectDetails
frontend/tests/unit/schema-compatibility.test.ts:393:    type SiraProjectDetails {
frontend/tests/unit/schema-compatibility.test.ts:405:    type ProjectDetails {
tools/scripts/graphql-inventory.mjs:48:  "SiraProjectDetails",
tools/scripts/graphql-inventory.mjs:57:  "SiraProjectDetails",
~~~~

### git grep -n "productionAuthorized"

~~~~text
docs/STEP-2C3C-CLOSURE.md:176:- No production deployment occurred, and `productionAuthorized` remains `false`.
docs/tasks/step-2c3c-b6.md:71:- keep `productionAuthorized: false`;
docs/tasks/step-2c3c-b7.md:65:- `productionAuthorized: false`;
frontend/tests/contract/b7-durable-state.test.ts:8:  readonly productionAuthorized: boolean;
frontend/tests/contract/b7-durable-state.test.ts:37:      productionAuthorized: false,
frontend/tests/contract/step-2c3c-closure.test.ts:204:      readonly productionAuthorized: boolean;
frontend/tests/contract/step-2c3c-closure.test.ts:224:      productionAuthorized: false,
project-state.json:12:  "productionAuthorized": false,
~~~~

### git grep -n "SOT-001"

~~~~text
docs/DECISIONS.md:114:GitHub backend source appears older than later verified live/backend evidence. Resolve SOT-001 before new backend runtime implementation.
docs/GITHUB-GOVERNANCE.md:92:SOT-001 remains open: the GitHub `backend/` tree is not yet proven to be the latest cumulative backend source. Do not add or interpret backend CI as production acceptance until that source is reconciled.
docs/GITHUB-GOVERNANCE.md:94:Existing backend static validation remains useful historical/source evidence, but new backend runtime work is blocked by SOT-001.
docs/HANDOFF.md:55:`SOT-001` is open: the GitHub `backend/` tree appears older than the verified live GraphQL/later backend contract. Do not make backend runtime changes until it is reconciled.
docs/PROJECT-STATE.md:134:### SOT-001 — backend repository freshness
docs/SOURCE-OF-TRUTH.md:37:### SOT-001 — OPEN CONFLICT
docs/STEP-2C3C-CLOSURE.md:13:- Backend source conflict: `SOT-001` remains `OPEN`
docs/STEP-2C3C-CLOSURE.md:128:| `sira-core` owns backend architecture | PASS | No backend file changed; `SOT-001` remains open |
docs/STEP-2C3C-CLOSURE.md:138:| No backend change while `SOT-001` is open | PASS | Diff contains no backend changes |
docs/tasks/step-2c3c-b1.md:78:- Do not modify backend runtime while SOT-001 remains open.
docs/tasks/step-2c3c-b2.md:57:- keep `SOT-001` / backend source reconciliation OPEN and blocking for new backend runtime changes;
docs/tasks/step-2c3c-b3.md:61:- keep `SOT-001` OPEN and blocking for new backend runtime changes;
docs/tasks/step-2c3c-b4.md:63:- keep `SOT-001` OPEN and blocking for new backend runtime changes;
docs/tasks/step-2c3c-b5.md:72:- keep `SOT-001` OPEN and blocking for new backend runtime changes;
docs/tasks/step-2c3c-b5.md:147:4. do not modify backend runtime because `SOT-001` remains open.
docs/tasks/step-2c3c-b6.md:70:- keep `SOT-001` OPEN and backend-blocking;
docs/tasks/step-2c3c-b7.md:34:- `SOT-001` remains OPEN and blocks new backend runtime changes.
docs/tasks/step-2c3c-b7.md:66:- `SOT-001` remains OPEN.
docs/tasks/step-2c3c-closure.md:25:- SOT-001: OPEN and blocking new backend runtime changes.
docs/tasks/step-2c3c-closure.md:65:- durable state records accepted B7, keeps SOT-001 open, and keeps production unauthorized.
frontend/tests/contract/step-2c3c-closure.test.ts:199:  it("records accepted B7 while closure, SOT-001, and production gates stay open", () => {
frontend/tests/contract/step-2c3c-closure.test.ts:236:      expect.objectContaining({ id: "SOT-001", status: "OPEN" }),
project-state.json:48:      "id": "SOT-001",
~~~~

## 6. Final worktree status and checksum

### git status --short

~~~~text
?? 2C3C-CLOSURE-INDEPENDENT-REVIEW-EVIDENCE.md
~~~~

SHA-256 of the evidence payload above, excluding this self-referential checksum line: `38fb9c0ac8c246fbb49f4666380f2d74cbe250501b3d027bbf58a37c5d5e9276`
