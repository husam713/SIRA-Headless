# Step 2B — Typed WPGraphQL client

## Objective

Add a server-only, site-aware GraphQL transport and an official GraphQL
Code Generator workflow without coupling React components directly to
WordPress.

## Affected areas

- server-only WordPress endpoint registry
- published GraphQL client
- preview GraphQL boundary
- request timeout and tracing
- GraphQL response/error model
- cache-tag validation
- initial brand and project operations
- live schema introspection workflow
- contract and transport tests

## Important schema status

The repository includes `schema/wpgraphql.bootstrap.graphql` only as a review
aid derived from the approved Step 1 PHP contract. It is not treated as a live
snapshot.

Production acceptance requires:

```bash
pnpm schema:fetch
pnpm schema:check
pnpm codegen
```

The fetch command compares the schema from all five SIRA WordPress sites and
fails if their deterministic hashes differ.

## Client boundaries

`published-client.ts`

- anonymous
- server-only
- `force-cache`
- explicit `next.tags`
- configurable time-based revalidation

`preview-client.ts`

- authenticated token supplied by a future Step 3 preview flow
- server-only
- `no-store`
- no tags or shared cache

No Client Component receives the WordPress endpoint or credentials.

## Failure policy

The client fails closed for:

- HTTP errors
- malformed JSON
- malformed GraphQL envelopes
- GraphQL errors, including partial-data responses
- request timeouts
- network failures

Errors contain request ID, operation name, site key, and safe status metadata.
They do not contain response bodies, variables, tokens, or endpoint
credentials.

## Rollback

Revert the Step 2B commit or restore the Step 2A package. WordPress is not
changed.
