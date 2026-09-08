#!/usr/bin/env node
/**
 * Captures a WPGraphQL introspection result for every tenant, in-process on the
 * origin, and writes one JSON file per tenant for `pnpm schema:fetch --offline`.
 *
 * Why this exists rather than an HTTP fetch:
 *
 *   - Hostinger's edge challenges this developer machine's egress (ADR-032), so
 *     a direct request from here never reaches the origin at all;
 *   - WPGraphQL refuses `__schema` for public requests, so even from a
 *     permitted address an HTTP introspection needs an Application Password —
 *     a real credential that would have to be created, stored locally and sent
 *     over the wire on every refresh;
 *   - SIRA Digital has no web-server vhost yet, so no HTTP request can reach it
 *     under its own hostname however it is authenticated.
 *
 * `graphql()` is WPGraphQL's own in-process entry point. Running it under
 * WP-CLI as a super admin on the machine that owns the database exercises the
 * same schema an HTTP request would, authenticates without any secret leaving
 * the server, and works for a tenant whose domain does not resolve yet.
 *
 * Usage:
 *   node tools/capture-schema-introspection.mjs [--out <dir>] [--only digital]
 */

import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createRequire } from "node:module";

const require = createRequire(new URL("../frontend/package.json", import.meta.url));
const { getIntrospectionQuery } = require("graphql");

const SITES = Object.freeze({
  group: "siratrgroup.com",
  consulting: "consulting.siratrgroup.com",
  healthcare: "healthcare.siratrgroup.com",
  lifestyle: "lifestyle.siratrgroup.com",
  realestate: "realestate.siratrgroup.com",
  digital: "sirahdigital.sa",
});

const WP_ROOT = "~/domains/siratrgroup.com/public_html";
const WP_USER = process.env["SIRA_PROXY_WP_USER"] ?? "1";

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback);
}

const outputDirectory = argument("out", "frontend/.schema-introspection");
const only = argument("only", null);

/** Runs a command, writes stdin, and resolves with stdout. */
function run(command, args, input) {
  return new Promise((resolve, reject) => {
    const child = execFile(
      command,
      args,
      { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(`${command} failed: ${String(stderr).trim().slice(0, 400)}`),
          );
          return;
        }
        resolve(stdout);
      },
    );

    child.stdin.end(input, "utf8");
  });
}

const query = getIntrospectionQuery({
  descriptions: true,
  directiveIsRepeatable: true,
  inputValueDeprecation: true,
  schemaDescription: true,
  specifiedByUrl: true,
});

// The query travels inside a quoted heredoc and is read back from a file, so it
// is never a command-line argument and never reaches the remote process table.
// The result is gzipped before it comes back: these payloads are megabytes of
// JSON and an uncompressed base64 stream over a fresh SSH handshake is slow
// enough to look hung.
function script(hostname) {
  return [
    "set -e",
    "TMP=$(mktemp)",
    "OUT=$(mktemp)",
    'trap "rm -f $TMP $OUT" EXIT',
    "cat > \"$TMP\" <<'SIRA_QUERY'",
    query,
    "SIRA_QUERY",
    `cd ${WP_ROOT}`,
    `SIRA_QUERY_FILE="$TMP" wp --skip-themes --user=${WP_USER} ` +
      `--url="https://${hostname}" eval '` +
      '$q = file_get_contents( getenv( "SIRA_QUERY_FILE" ) );' +
      '$r = graphql( array( "query" => $q, "operation_name" => "IntrospectionQuery" ) );' +
      'echo json_encode( $r );' +
      `' > "$OUT"`,
    'gzip -9 -c "$OUT" | base64 -w0',
  ].join("\n");
}

await mkdir(outputDirectory, { recursive: true });

const entries = Object.entries(SITES).filter(
  ([siteKey]) => only === null || siteKey === only,
);

for (const [siteKey, hostname] of entries) {
  process.stdout.write(`${siteKey} … `);

  const encoded = await run("ssh", ["-o", "BatchMode=yes", "sira", "bash -s"], script(hostname));
  const json = gunzipSync(Buffer.from(encoded.trim(), "base64")).toString("utf8");
  const parsed = JSON.parse(json);

  if (parsed.errors !== undefined) {
    throw new Error(
      `${siteKey} introspection returned errors: ${JSON.stringify(parsed.errors).slice(0, 300)}`,
    );
  }

  if (parsed.data?.__schema === undefined) {
    throw new Error(`${siteKey} introspection response had no __schema.`);
  }

  const path = `${outputDirectory}/${siteKey}.json`;
  await writeFile(path, JSON.stringify(parsed), "utf8");
  process.stdout.write(
    `${String(parsed.data.__schema.types.length)} types → ${path}\n`,
  );
}

console.log(`\nCaptured ${String(entries.length)} tenant(s).`);
