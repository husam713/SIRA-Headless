# Step 2C.3A static validation

## Source checks

```bash
node --check scripts/schema-compatibility.mjs
node --check scripts/fetch-schema.mjs
node --check scripts/check-schema.mjs
```

## Focused automated tests

With the approved dependencies installed:

```bash
pnpm test:schema-compatibility
```

The tests verify:

- all five site hashes are preserved in safe metadata;
- a Group structural superset is accepted;
- Group-only legacy types, fields and optional arguments are reported;
- a missing canonical field fails;
- an exact field-type change fails;
- a Group-only required argument fails;
- a Group-only required input field fails;
- missing canonical enum values and union members fail;
- the standard `IntrospectionQuery` operation name is used;
- `ProjectDetails` is required.

## Full repository validation

```bash
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
```

## Live workflow, intentionally deferred in this source stage

```bash
pnpm schema:fetch
pnpm schema:check
pnpm codegen
```

Do not run live introspection without approved temporary authorization and a
post-run credential cleanup procedure.
