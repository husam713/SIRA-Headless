import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
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

/**
 * How long one introspection request may take.
 *
 * Twenty seconds is right for a direct HTTPS call to the CMS and wrong for the
 * SSH transport in tools/graphql-ssh-proxy.mjs, which pays a fresh handshake
 * per request because Windows OpenSSH has no mux socket. Introspection is also
 * the largest document this project ever sends. The default is unchanged, so
 * nothing about a normal run moves; only a developer on the slow transport
 * needs to raise it.
 */
function fetchTimeoutMs() {
  const raw = process.env["SIRA_SCHEMA_FETCH_TIMEOUT_MS"];

  if (raw === undefined || raw.trim() === "") {
    return 20_000;
  }

  const value = Number(raw);

  if (!Number.isSafeInteger(value) || value < 1_000 || value > 600_000) {
    throw new Error(
      "SIRA_SCHEMA_FETCH_TIMEOUT_MS must be an integer between 1000 and 600000.",
    );
  }

  return value;
}

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

/**
 * Where to read pre-captured introspection results instead of fetching.
 *
 * Three separate things make an HTTP introspection impossible or expensive from
 * a developer machine: the CMS edge challenges this egress (ADR-032), WPGraphQL
 * refuses `__schema` for public requests so a real Application Password would
 * have to exist locally and travel on every refresh, and SIRA Digital has no
 * web-server vhost yet so nothing can reach it under its own hostname.
 *
 * `tools/capture-schema-introspection.mjs` runs the same introspection
 * in-process on the origin as a super admin and writes one file per tenant.
 * Pointing this script at that directory keeps ONE schema pipeline: the same
 * policy checks, the same comparison, the same artifacts. Only where the
 * introspection JSON came from differs.
 */
function offlineDirectory() {
  const raw = process.env["SIRA_SCHEMA_INTROSPECTION_DIR"];

  return typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null;
}

function readOfflineIntrospection(definition, directory) {
  const path = `${directory}/${definition.siteKey}.json`;

  if (!existsSync(path)) {
    throw new Error(
      `Missing offline introspection for ${definition.siteKey} at ${path}.`,
    );
  }

  const payload = JSON.parse(readFileSync(path, "utf8"));

  if (payload.errors !== undefined) {
    throw new Error(
      `Offline introspection for ${definition.siteKey} carries GraphQL errors.`,
    );
  }

  if (payload.data?.__schema === undefined) {
    throw new Error(
      `Offline introspection for ${definition.siteKey} has no __schema.`,
    );
  }

  return payload;
}

/** Turns one introspection payload into the artifacts the rest of this expects. */
function buildArtifacts(definition, endpoint, payload) {
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

async function fetchSchema(definition) {
  const endpoint = validateEndpoint(
    process.env[definition.environmentKey],
    definition.environmentKey,
  );

  const offline = offlineDirectory();

  if (offline !== null) {
    return buildArtifacts(
      definition,
      endpoint,
      readOfflineIntrospection(definition, offline),
    );
  }
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
    signal: AbortSignal.timeout(fetchTimeoutMs()),
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

  return buildArtifacts(definition, endpoint, payload);
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
