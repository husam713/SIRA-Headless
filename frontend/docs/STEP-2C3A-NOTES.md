# Step 2C.3A — Live Schema Compatibility Patch

## Scope

Frontend schema tooling only.

No application route, component, visual design, WordPress content, custom
navigation field, custom editorial-feed resolver, menu, static front page or
production deployment is included.

## Verified live policy

- Consulting, Healthcare, Lifestyle and Real Estate are exact schema peers.
- Consulting is selected deterministically as the canonical branch during a
  live fetch.
- Group is a permitted legacy superset.
- Group must structurally preserve the full branch contract.
- Group-only additions are written to the compatibility report.
- `ProjectDetails` is the required generated project detail type.

## Generated files after a future approved fetch

```text
schema/wpgraphql.graphql
schema/wpgraphql.group.graphql
schema/wpgraphql.meta.json
schema/wpgraphql.compatibility.json
```

Only `schema/wpgraphql.graphql` is used by GraphQL Code Generator.

## Security

The optional `SIRA_SCHEMA_AUTHORIZATION` environment variable is request-only.
The scripts persist only:

- site key;
- role;
- hostname;
- schema hash;
- fetch timestamp;
- structural compatibility result;
- Group-only schema additions.

They do not persist:

- complete endpoint URLs;
- endpoint paths;
- request or response headers;
- authorization values;
- credentials;
- cookies;
- introspection response bodies.

The request uses the standard `IntrospectionQuery` operation name emitted by
GraphQL.js.

## Deferred

- live schema refetch with introspection authorization;
- committed schema snapshots;
- GraphQL Code Generator output;
- WordPress menu configuration;
- branch static front pages;
- homepage content;
- frontend visual component library;
- production deployment and acceptance.
