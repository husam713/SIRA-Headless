import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
} from "node:fs";
import {
  buildSchema,
  lexicographicSortSchema,
  printSchema,
} from "graphql";
import {
  BRANCH_SITE_KEYS,
  CANONICAL_BRANCH_SITE_KEY,
  GROUP_SITE_KEY,
  SCHEMA_POLICY,
  SCHEMA_SOURCE,
  SITE_DEFINITIONS,
  assertRequiredContract,
  assertSafeArtifactObject,
  compareCanonicalToGroup,
  schemaHash,
  stableJson,
} from "./schema-compatibility.mjs";

const canonicalSchemaPath = "schema/wpgraphql.graphql";
const groupSchemaPath = "schema/wpgraphql.group.graphql";
const metadataPath = "schema/wpgraphql.meta.json";
const compatibilityPath = "schema/wpgraphql.compatibility.json";

for (const path of [
  canonicalSchemaPath,
  groupSchemaPath,
  metadataPath,
  compatibilityPath,
]) {
  if (!existsSync(path)) {
    throw new Error(
      "Live WPGraphQL compatibility artifacts are missing. " +
        "Run `pnpm schema:fetch`.",
    );
  }
}

function parseJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    throw new Error(`Invalid JSON in ${path}.`);
  }
}

function assertSha256(value, coordinate) {
  if (
    typeof value !== "string" ||
    !/^[a-f0-9]{64}$/.test(value)
  ) {
    throw new Error(`Invalid SHA-256 at ${coordinate}.`);
  }
}

function normalizedSchema(schemaText, coordinate) {
  let schema;

  try {
    schema = lexicographicSortSchema(buildSchema(schemaText));
  } catch {
    throw new Error(`Invalid GraphQL SDL in ${coordinate}.`);
  }

  const printed = `${printSchema(schema).trim()}\n`;

  if (printed !== schemaText) {
    throw new Error(
      `${coordinate} is not the deterministic lexicographic schema print.`,
    );
  }

  return schema;
}

const canonicalText = readFileSync(canonicalSchemaPath, "utf8");
const groupText = readFileSync(groupSchemaPath, "utf8");
const metadata = parseJson(metadataPath);
const persistedCompatibility = parseJson(compatibilityPath);

assertSafeArtifactObject(metadata, "metadata");
assertSafeArtifactObject(persistedCompatibility, "compatibility");

if (
  metadata.source !== SCHEMA_SOURCE ||
  metadata.policy !== SCHEMA_POLICY
) {
  throw new Error("WPGraphQL schema metadata has an invalid source or policy.");
}

if (
  metadata.canonicalSite !== CANONICAL_BRANCH_SITE_KEY ||
  metadata.groupAuditSite !== GROUP_SITE_KEY
) {
  throw new Error("Schema metadata uses unexpected canonical or Group sites.");
}

assertSha256(metadata.canonicalSha256, "metadata.canonicalSha256");
assertSha256(metadata.groupSha256, "metadata.groupSha256");

const canonicalHash = schemaHash(canonicalText);
const groupHash = schemaHash(groupText);

if (metadata.canonicalSha256 !== canonicalHash) {
  throw new Error("Canonical WPGraphQL schema metadata is stale.");
}

if (metadata.groupSha256 !== groupHash) {
  throw new Error("Group WPGraphQL audit schema metadata is stale.");
}

if (!Array.isArray(metadata.sites)) {
  throw new Error("Schema metadata sites must be an array.");
}

const expectedSiteKeys = SITE_DEFINITIONS.map(
  (definition) => definition.siteKey,
);
const actualSiteKeys = metadata.sites.map((site) => site.siteKey);

if (
  metadata.sites.length !== expectedSiteKeys.length ||
  new Set(actualSiteKeys).size !== expectedSiteKeys.length ||
  expectedSiteKeys.some((siteKey) => !actualSiteKeys.includes(siteKey))
) {
  throw new Error("Schema metadata must contain each SIRA site exactly once.");
}

for (const site of metadata.sites) {
  if (
    typeof site !== "object" ||
    site === null ||
    typeof site.hostname !== "string" ||
    site.hostname.trim() === ""
  ) {
    throw new Error("Schema metadata contains an invalid site record.");
  }

  assertSha256(site.sha256, `metadata.sites.${site.siteKey}.sha256`);

  const expectedRole = SITE_DEFINITIONS.find(
    (definition) => definition.siteKey === site.siteKey,
  )?.role;

  if (site.role !== expectedRole) {
    throw new Error(`Unexpected schema role for ${site.siteKey}.`);
  }
}

for (const branchSiteKey of BRANCH_SITE_KEYS) {
  const branch = metadata.sites.find(
    (site) => site.siteKey === branchSiteKey,
  );

  if (branch?.sha256 !== canonicalHash) {
    throw new Error(
      `Branch schema hash for ${branchSiteKey} does not match canonical.`,
    );
  }
}

const groupSite = metadata.sites.find(
  (site) => site.siteKey === GROUP_SITE_KEY,
);

if (groupSite?.sha256 !== groupHash) {
  throw new Error("Group site hash does not match the Group audit snapshot.");
}

const canonicalSchema = normalizedSchema(
  canonicalText,
  canonicalSchemaPath,
);
const groupSchema = normalizedSchema(groupText, groupSchemaPath);

assertRequiredContract(canonicalSchema, CANONICAL_BRANCH_SITE_KEY);
assertRequiredContract(groupSchema, GROUP_SITE_KEY);

const currentComparison = compareCanonicalToGroup(
  canonicalSchema,
  groupSchema,
);

if (!currentComparison.compatible) {
  throw new Error("Group schema no longer contains the canonical contract.");
}

if (
  persistedCompatibility.source !== SCHEMA_SOURCE ||
  persistedCompatibility.policy !== SCHEMA_POLICY ||
  persistedCompatibility.compatible !== true
) {
  throw new Error("Persisted schema compatibility report is invalid.");
}

if (
  persistedCompatibility.canonical?.siteKey !==
    CANONICAL_BRANCH_SITE_KEY ||
  persistedCompatibility.canonical?.sha256 !== canonicalHash ||
  persistedCompatibility.group?.siteKey !== GROUP_SITE_KEY ||
  persistedCompatibility.group?.sha256 !== groupHash ||
  persistedCompatibility.group?.structurallyContainsCanonical !== true
) {
  throw new Error("Persisted schema compatibility coordinates are stale.");
}

if (
  persistedCompatibility.branches?.exactSchemaEquality !== true ||
  JSON.stringify(
    stableJson(persistedCompatibility.branches.siteKeys),
  ) !== JSON.stringify(stableJson(BRANCH_SITE_KEYS))
) {
  throw new Error("Persisted branch equality result is invalid.");
}

for (const branchSiteKey of BRANCH_SITE_KEYS) {
  if (
    persistedCompatibility.branches.hashes?.[branchSiteKey] !==
    canonicalHash
  ) {
    throw new Error(
      `Persisted branch hash is stale for ${branchSiteKey}.`,
    );
  }
}

if (
  JSON.stringify(
    stableJson(persistedCompatibility.group.issues),
  ) !== JSON.stringify(stableJson(currentComparison.issues)) ||
  JSON.stringify(
    stableJson(persistedCompatibility.group.groupOnlyAdditions),
  ) !==
    JSON.stringify(
      stableJson(currentComparison.groupOnlyAdditions),
    )
) {
  throw new Error("Persisted Group compatibility report is stale.");
}

const metadataDigest = createHash("sha256")
  .update(JSON.stringify(stableJson(metadata)))
  .digest("hex");

console.log(
  [
    `Canonical WPGraphQL schema verified: ${canonicalHash}.`,
    `Group audit schema verified: ${groupHash}.`,
    `Group-only types: ${currentComparison.groupOnlyAdditions.types.length}.`,
    `Metadata digest: ${metadataDigest}.`,
  ].join(" "),
);
