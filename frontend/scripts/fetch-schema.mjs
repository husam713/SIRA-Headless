import {
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import {
  buildClientSchema,
  getIntrospectionQuery,
  lexicographicSortSchema,
  printSchema,
} from "graphql";

if (existsSync(".env.local") && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(".env.local");
}

const sites = [
  ["group", "SIRA_WP_GROUP_GRAPHQL_URL"],
  ["consulting", "SIRA_WP_CONSULTING_GRAPHQL_URL"],
  ["healthcare", "SIRA_WP_HEALTHCARE_GRAPHQL_URL"],
  ["lifestyle", "SIRA_WP_LIFESTYLE_GRAPHQL_URL"],
  ["realestate", "SIRA_WP_REALESTATE_GRAPHQL_URL"],
];

const requiredRootFields = ["siraBrand", "siraProjects"];
const requiredTypes = ["SiraBrand", "SiraProject", "SiraProjectDetails"];

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
    throw new Error(`${environmentKey} must use HTTPS outside local development.`);
  }

  return url;
}

function schemaHash(schemaText) {
  return createHash("sha256").update(schemaText).digest("hex");
}

async function fetchSchema(siteKey, environmentKey) {
  const endpoint = validateEndpoint(process.env[environmentKey], environmentKey);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      accept: "application/graphql-response+json, application/json;q=0.9",
      "content-type": "application/json",
      "user-agent": "sira-web-schema-fetch/1",
    },
    body: JSON.stringify({
      operationName: "SiraSchemaIntrospection",
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
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(
      `Schema fetch failed for ${siteKey} (${endpoint.hostname}) with HTTP ${response.status}.`,
    );
  }

  const payload = await response.json();

  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload) ||
    !("data" in payload) ||
    payload.data === null
  ) {
    throw new Error(`Invalid introspection response for ${siteKey}.`);
  }

  if ("errors" in payload && Array.isArray(payload.errors) && payload.errors.length > 0) {
    throw new Error(`GraphQL introspection returned errors for ${siteKey}.`);
  }

  const schema = lexicographicSortSchema(buildClientSchema(payload.data));
  const queryType = schema.getQueryType();

  if (queryType === undefined) {
    throw new Error(`No RootQuery type was found for ${siteKey}.`);
  }

  for (const field of requiredRootFields) {
    if (queryType.getFields()[field] === undefined) {
      throw new Error(`Required RootQuery field ${field} is missing on ${siteKey}.`);
    }
  }

  for (const typeName of requiredTypes) {
    if (schema.getType(typeName) === undefined) {
      throw new Error(`Required type ${typeName} is missing on ${siteKey}.`);
    }
  }

  const printed = `${printSchema(schema).trim()}\n`;

  return {
    siteKey,
    hostname: endpoint.hostname,
    schema: printed,
    sha256: schemaHash(printed),
  };
}

const results = [];

for (const [siteKey, environmentKey] of sites) {
  results.push(await fetchSchema(siteKey, environmentKey));
}

const uniqueHashes = new Set(results.map((result) => result.sha256));

if (uniqueHashes.size !== 1) {
  const summary = results
    .map((result) => `${result.siteKey}:${result.sha256}`)
    .join(", ");

  throw new Error(`SIRA Multisite GraphQL schemas differ: ${summary}`);
}

writeFileSync("schema/wpgraphql.graphql", results[0].schema, "utf8");

writeFileSync(
  "schema/wpgraphql.meta.json",
  `${JSON.stringify(
    {
      source: "live-multisite-introspection",
      fetchedAt: new Date().toISOString(),
      canonicalSite: results[0].siteKey,
      sha256: results[0].sha256,
      sites: results.map(({ siteKey, hostname, sha256 }) => ({
        siteKey,
        hostname,
        sha256,
      })),
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(
  `WPGraphQL snapshot written. Sites: ${results.length}. SHA-256: ${results[0].sha256}`,
);
