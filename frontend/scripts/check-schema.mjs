import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const schemaPath = "schema/wpgraphql.graphql";
const metadataPath = "schema/wpgraphql.meta.json";

if (!existsSync(schemaPath) || !existsSync(metadataPath)) {
  throw new Error(
    "Live WPGraphQL schema files are missing. Run `pnpm schema:fetch`.",
  );
}

const schema = readFileSync(schemaPath, "utf8");
const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
const actualHash = createHash("sha256").update(schema).digest("hex");

if (
  metadata.source !== "live-multisite-introspection" ||
  typeof metadata.sha256 !== "string" ||
  metadata.sha256 !== actualHash
) {
  throw new Error("WPGraphQL schema metadata is invalid or stale.");
}

if (!Array.isArray(metadata.sites) || metadata.sites.length !== 5) {
  throw new Error("Schema metadata must contain all five SIRA sites.");
}

const hashes = new Set(metadata.sites.map((site) => site.sha256));

if (hashes.size !== 1 || !hashes.has(actualHash)) {
  throw new Error("SIRA site schema hashes do not match.");
}

console.log(`Live WPGraphQL schema verified: ${actualHash}`);
