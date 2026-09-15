#!/usr/bin/env node
/**
 * Capture a real editorial feed response from the live CMS.
 *
 * Hostinger's CDN (`Server: hcdn`) serves a JavaScript bot-challenge to
 * unrecognised client IPs, so the GraphQL endpoint answers 403 from a developer
 * machine and 200 from the server itself. The request is therefore issued over
 * SSH, from the origin, rather than directly.
 *
 * The document posted is `src/queries/editorial-feed.graphql` verbatim —
 * fragments and both operations — with `operationName` selecting the one to
 * run, so this exercises the same contract the application ships rather than a
 * hand-written approximation of it.
 *
 * Output is written to frontend/tests/fixtures/newsroom/live-feed.<site>.json
 * and is real CMS data, not a fixture anyone authored.
 *
 * Usage:
 *   node tools/capture-live-feed.mjs [--site group] [--first 50]
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DOCUMENT = fileURLToPath(
  new URL("../frontend/src/queries/editorial-feed.graphql", import.meta.url),
);

const SITE_HOSTNAME = Object.freeze({
  group: "siratrgroup.com",
  consulting: "consulting.siratrgroup.com",
  healthcare: "healthcare.siratrgroup.com",
  lifestyle: "lifestyle.siratrgroup.com",
  realestate: "realestate.siratrgroup.com",
});

const BUSINESS_UNIT = Object.freeze({
  group: null,
  consulting: "consulting",
  healthcare: "healthcare",
  lifestyle: "lifestyle",
  realestate: "real-estate",
});

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback);
}

function main() {
  const site = argument("site", "group");
  const first = Number(argument("first", "50"));

  if (!Object.hasOwn(SITE_HOSTNAME, site)) {
    console.error(`Unknown site key: ${site}`);
    process.exitCode = 2;
    return;
  }

  const unit = BUSINESS_UNIT[site];
  const body = JSON.stringify({
    query: readFileSync(DOCUMENT, "utf8"),
    operationName:
      unit === null ? "SiraEditorialFeed" : "SiraBusinessUnitEditorialFeed",
    variables:
      unit === null
        ? { first, after: null }
        : { first, after: null, businessUnit: unit },
  });

  // The payload travels inside the script as a quoted heredoc, never as a
  // command-line argument, so no query text lands in the remote process table.
  // It cannot be read from stdin separately: `bash -s` already owns stdin.
  const script = [
    "set -e",
    "TMP=$(mktemp)",
    'trap "rm -f $TMP" EXIT',
    "cat > \"$TMP\" <<'SIRA_GRAPHQL_PAYLOAD'",
    body,
    "SIRA_GRAPHQL_PAYLOAD",
    `curl -s -X POST -H 'content-type: application/json' --data @"$TMP" ` +
      `--max-time 30 "https://${SITE_HOSTNAME[site]}/graphql"`,
  ].join("\n");

  const raw = execFileSync("ssh", ["-o", "BatchMode=yes", "sira", "bash -s"], {
    input: script,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error(
      "The endpoint did not return JSON. First 300 characters:\n" +
        raw.slice(0, 300),
    );
    process.exitCode = 1;
    return;
  }

  if (parsed.errors !== undefined) {
    console.error("GraphQL errors:");
    console.error(JSON.stringify(parsed.errors, null, 2).slice(0, 1200));
    process.exitCode = 1;
    return;
  }

  const out = fileURLToPath(
    new URL(
      `../frontend/tests/fixtures/newsroom/live-feed.${site}.json`,
      import.meta.url,
    ),
  );
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(parsed, null, 2) + "\n");

  const connection =
    parsed.data?.contentNodes ?? parsed.data?.siraBusinessUnit?.contentNodes;

  console.log(
    `${site}: captured ${connection?.nodes?.length ?? 0} nodes ` +
      `(hasNextPage=${connection?.pageInfo?.hasNextPage})`,
  );
}

main();
