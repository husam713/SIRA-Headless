# SIRA Engineering Handoff

Use this file when opening a new ChatGPT/Codex session or handing the project to another engineer.

## Read first

1. `/AGENTS.md`
2. `/project-state.json`
3. `/docs/PROJECT-STATE.md`
4. `/docs/SOURCE-OF-TRUTH.md`
5. relevant entries in `/docs/DECISIONS.md`

Then reconcile them against Git before editing.

## Repository

- Repository: `husam713/SIRA-Headless`
- Active execution branch: `step-2c3c-typed-query-contracts`
- Verified execution baseline: `d59035d4ec2a97aa9524cf0b4788606745be245a`
- Latest approved tag: `step-2c3b-approved`
- Governance bootstrap branch: `chore/ai-engineering-governance`

## Current task

**Step 2C.3C-B1 — Generated Runtime Contract Bridge + Typed Brand Banners**

The execution branch is currently identical to the Step 2C.3B baseline; B1 has not yet been committed there.

## Do not restart

Do not restart or redesign without new evidence:

- Step 1 backend migration architecture;
- Step 2A hostname/site registry;
- Step 2B GraphQL client foundation;
- Step 2C brand/design-token foundation;
- Step 2C.2 live inventory;
- Step 2C.3A schema compatibility;
- Step 2C.3B live schema adoption.

## Immediate architecture constraints

- canonical branch schema: Consulting;
- Group: permitted structural superset;
- canonical project ACF type: `ProjectDetails`;
- native menus, not `siraNavigation`;
- native content connections, not `siraEditorialFeed`;
- one shared branch implementation;
- Server Components by default;
- no Bricks/prototype runtime in production;
- no hardcoded CMS content to hide readiness defects.

## Blocking source conflict

`SOT-001` is open: the GitHub `backend/` tree appears older than the verified live GraphQL/later backend contract. Do not make backend runtime changes until it is reconciled.

Frontend Step 2C.3C may continue against the verified checked-in live schema.

## Expected Step 2C.3C validation

Use the repository's actual package scripts. At minimum for affected frontend work:

```bash
cd frontend
corepack enable
pnpm install
pnpm codegen
pnpm typecheck
pnpm test:run
pnpm schema:check
pnpm build
```

Run focused tests and lint as appropriate to the change. Never report PASS for commands not actually executed.

## Protected actions

Do not without explicit owner approval:

- merge into the protected integration/default branch;
- change default-branch governance;
- deploy production;
- perform destructive WordPress/database changes;
- change DNS/cutover;
- commit or expose secrets.

## Handoff completion format

Return:

- branch;
- baseline;
- commit SHA;
- files changed;
- validations actually run and their results;
- warnings/deferred checks;
- rollback point;
- unresolved source conflicts;
- next proposed stage;
- `CURRENT PROJECT STATE`.
