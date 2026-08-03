# WPGraphQL schema workflow

`wpgraphql.bootstrap.graphql` is a review aid derived from the approved Step 1
PHP contract. It is deliberately incomplete and is not accepted as a runtime
schema snapshot.

Before Step 2B can be accepted against staging:

1. Configure all five `SIRA_WP_*_GRAPHQL_URL` values.
2. Export those variables or place them in `.env.local`.
3. Run:

   ```bash
   pnpm schema:fetch
   pnpm schema:check
   pnpm codegen
   ```

The fetch script:

- introspects every configured SIRA WordPress site;
- verifies required SIRA root fields and types;
- sorts and prints a deterministic schema;
- compares the five schema hashes;
- fails if any site exposes a different schema;
- writes `schema/wpgraphql.graphql`;
- writes `schema/wpgraphql.meta.json`.

Only hostnames, timestamps, and schema hashes are stored in the metadata file.
Credentials, complete endpoint URLs, response bodies, and headers are not
written.

Commit the live snapshot and generated TypeScript output after review.
