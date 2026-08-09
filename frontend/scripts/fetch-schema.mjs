import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import {
  buildClientSchema,
  getIntrospectionQuery,
  lexicographicSortSchema,
  printSchema,
} from "graphql";
import {
  GROUP_SITE_KEY,
  SCHEMA_POLICY,
  SITE_DEFINITIONS,
  assertExactBranchSchemas,
  assertRequiredContract,
  compareCanonicalToGroup,
  createCompatibilityReport,
  createSchemaMetadata,
  schemaHash,
} from "./schema-compatibility.mjs";

if (existsSync(".env.local") && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(".env.local");
}

const OUTPUT_DIRECTORY = "schema";
const CANONICAL_SCHEMA_PATH = `${OUTPUT_DIRECTORY}/wpgraphql.graphql`;
const GROUP_SCHEMA_PATH = `${OUTPUT_DIRECTORY}/wpgraphql.group.graphql`;
const METADATA_PATH = `${OUTPUT_DIRECTORY}/wpgraphql.meta.json`;
const COMPATIBILITY_PATH =
  `${OUTPUT_DIRECTORY}/wpgraphql.compatibility.json`;

function validateEndpoint(rawValue, environmentKey) {
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    throw new Error(`Missing ${environmentKey}.`);
  }

  const url = new URL(rawValue);

  if (url.username !== "" || url.password !== "") {
    throw new Error(`${environmentKey} must not contain credentials.`);
  }

  if (url.search !== "" || url.hash !== "") {
    throw new Error(`${environmentKey} must not contain a query or fragment.`);
  }

  const isLocal =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname.endsWith(".localhost");

  if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) {
    throw new Error(
      `${environmentKey} must use HTTPS outside local development.`,
    );
  }

  return url;
}

function authorizationHeader() {
  const value = process.env.SIRA_SCHEMA_AUTHORIZATION;

  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : null;
}

async function fetchSchema(definition) {
  const endpoint = validateEndpoint(
    process.env[definition.environmentKey],
    definition.environmentKey,
  );
  const headers = {
    accept: "application/graphql-response+json, application/json;q=0.9",
    "content-type": "application/json",
    "user-agent": "sira-web-schema-fetch/2",
  };
  const authorization = authorizationHeader();

  if (authorization !== null) {
    headers.authorization = authorization;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      operationName: "IntrospectionQuery",
      query: getIntrospectionQuery({
        descriptions: true,
        directiveIsRepeatable: true,
        inputValueDeprecation: true,
        schemaDescription: true,
        specifiedByUrl: true,
      }),
      variables: {},
    }),
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(
      `Schema fetch failed for ${definition.siteKey} ` +
        `(${endpoint.hostname}) with HTTP ${response.status}.`,
    );
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new Error(
      `Schema fetch for ${definition.siteKey} did not return JSON.`,
    );
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload) ||
    !("data" in payload) ||
    payload.data === null
  ) {
    throw new Error(
      `Invalid introspection response for ${definition.siteKey}.`,
    );
  }

  if (
    "errors" in payload &&
    Array.isArray(payload.errors) &&
    payload.errors.length > 0
  ) {
    throw new Error(
      `GraphQL introspection returned errors for ${definition.siteKey}.`,
    );
  }

  const schema = lexicographicSortSchema(buildClientSchema(payload.data));
  assertRequiredContract(schema, definition.siteKey);

  const printed = `${printSchema(schema).trim()}\n`;

  return {
    ...definition,
    hostname: endpoint.hostname,
    schemaObject: schema,
    schema: printed,
    sha256: schemaHash(printed),
  };
}

function writeAtomic(path, value) {
  const temporaryPath =
    `${path}.tmp-${process.pid}-${createHash("sha256")
      .update(path)
      .digest("hex")
      .slice(0, 8)}`;

  writeFileSync(temporaryPath, value, "utf8");
  rmSync(path, { force: true });
  renameSync(temporaryPath, path);
}

const results = [];

for (const definition of SITE_DEFINITIONS) {
  results.push(await fetchSchema(definition));
}

const canonical = assertExactBranchSchemas(results);
const group = results.find(
  (result) => result.siteKey === GROUP_SITE_KEY,
);

if (canonical === undefined || group === undefined) {
  throw new Error("Canonical branch or Group schema result is missing.");
}

const comparison = compareCanonicalToGroup(
  canonical.schemaObject,
  group.schemaObject,
);

if (!comparison.compatible) {
  const coordinates = comparison.issues
    .slice(0, 10)
    .map((issue) => `${issue.code}:${issue.coordinate}`)
    .join(", ");

  throw new Error(
    "Group schema is not structurally compatible with the canonical " +
      `branch contract: ${coordinates}`,
  );
}

const generatedAt = new Date().toISOString();
const metadata = createSchemaMetadata(results, generatedAt);
const compatibility = createCompatibilityReport({
  results,
  comparison,
  generatedAt,
});

if (!compatibility.branches.exactSchemaEquality) {
  throw new Error("Compatibility report did not preserve branch equality.");
}

mkdirSync(OUTPUT_DIRECTORY, { recursive: true });

writeAtomic(CANONICAL_SCHEMA_PATH, canonical.schema);
writeAtomic(GROUP_SCHEMA_PATH, group.schema);
writeAtomic(
  METADATA_PATH,
  `${JSON.stringify(metadata, null, 2)}\n`,
);
writeAtomic(
  COMPATIBILITY_PATH,
  `${JSON.stringify(compatibility, null, 2)}\n`,
);

console.log(
  [
    "WPGraphQL compatibility snapshots written.",
    `Policy: ${SCHEMA_POLICY}.`,
    `Canonical: ${canonical.siteKey}:${canonical.sha256}.`,
    `Group audit: ${group.siteKey}:${group.sha256}.`,
    `Group-only types: ${comparison.groupOnlyAdditions.types.length}.`,
  ].join(" "),
);
