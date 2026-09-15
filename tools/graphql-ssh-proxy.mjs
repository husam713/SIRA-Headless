#!/usr/bin/env node
/**
 * A local GraphQL transport that reaches the live CMS over SSH.
 *
 * Hostinger's edge challenges this developer machine's egress (an M247
 * hosting/VPN range), so a direct request from here returns a bot-challenge
 * page for EVERY path on the origin — `/`, `/wp-json/` and `/graphql` alike.
 * The same requests succeed from the origin itself.
 *
 * This forwards GraphQL POSTs through the `sira` SSH alias so the Next.js
 * application can run against REAL CMS data through its real route, real query
 * documents, real normalizers and real components. Only the network hop is
 * substituted; nothing about the application is stubbed.
 *
 * It is a development tool. `src/config/wordpress.ts` already permits an
 * `http://127.0.0.1` endpoint for exactly this case, so no production
 * configuration is relaxed to use it.
 *
 * Usage:
 *   node tools/graphql-ssh-proxy.mjs [--port 8787]
 *
 * Then point the endpoints at it:
 *   SIRA_WP_GROUP_GRAPHQL_URL=http://127.0.0.1:8787/group/graphql
 */

import { spawn } from "node:child_process";
import { createServer } from "node:http";

/**
 * Runs a command, writes `input` to its stdin, and resolves with its stdout.
 *
 * This used `promisify(execFile)` with an `input` option. execFile has no such
 * option — that belongs to the *Sync* variants — so it was silently dropped,
 * `bash -s` never reached EOF, and every request hung until the client gave up.
 * spawn is used directly so stdin is actually written and then closed.
 */
function run(command, args, input, authorization = null) {
  return new Promise((resolve, reject) => {
    const environment =
      authorization === null
        ? process.env
        : { ...process.env, SIRA_PROXY_AUTHORIZATION: authorization };
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: environment,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(
        new Error(
          `${command} exited with ${String(code)}: ${stderr.trim().slice(0, 400)}`,
        ),
      );
    });

    child.stdin.end(input, "utf8");
  });
}

const HOSTNAME = Object.freeze({
  group: "siratrgroup.com",
  consulting: "consulting.siratrgroup.com",
  healthcare: "healthcare.siratrgroup.com",
  lifestyle: "lifestyle.siratrgroup.com",
  realestate: "realestate.siratrgroup.com",
  digital: "digital.siratrgroup.com",
});

// The WordPress root on the origin, needed only by the WP-CLI transport below.
const WP_ROOT = "~/domains/siratrgroup.com/public_html";

// Tenants whose domain has no web-server vhost yet.
//
// SIRA Digital's WordPress site is real — blog 6, `wp_blogs.domain` =
// digital.siratrgroup.com since the 2026-09-08 CMS move — but that hostname has
// no vhost of its own in the hosting panel, so an HTTP request for it lands on
// the wrong site. That is an owner action, and it is not a reason to be unable
// to develop against the tenant's real data.
//
// WPGraphQL does not need the web server. `graphql()` executes the schema
// in-process, so WP-CLI reaches exactly the same resolvers, the same ACF field
// groups and the same database rows that an HTTP request would. Only the
// transport differs, and only for tenants in this set.
const WP_CLI_TENANTS = new Set(["digital"]);

// Which transport a tenant uses.
//
//   auto   (default) HTTP for tenants with a public vhost, WP-CLI for the rest.
//   wp-cli every tenant in-process on the origin.
//   http   every tenant over HTTPS.
//
// `wp-cli` exists for schema introspection. WPGraphQL refuses __schema for
// public requests, so an HTTP fetch needs an Application Password, which means
// a real credential has to exist locally and travel to the origin. The
// in-process transport authenticates as a super admin on the machine that owns
// the database, so introspection works with no secret created, stored or
// transported. That is a smaller attack surface, not a workaround.
const TRANSPORT = process.env["SIRA_PROXY_TRANSPORT"] ?? "auto";

if (!["auto", "wp-cli", "http"].includes(TRANSPORT)) {
  throw new Error(
    `SIRA_PROXY_TRANSPORT must be auto, wp-cli or http (got ${TRANSPORT}).`,
  );
}

function usesWpCli(siteKey) {
  if (TRANSPORT === "wp-cli") return true;
  if (TRANSPORT === "http") return false;
  return WP_CLI_TENANTS.has(siteKey);
}

// Which account the WP-CLI transport runs as. Introspection needs one.
const WP_CLI_USER = process.env["SIRA_PROXY_WP_USER"] ?? "1";

const port = Number(
  process.argv.includes("--port")
    ? process.argv[process.argv.indexOf("--port") + 1]
    : 8787,
);

// Connection multiplexing (ControlMaster) is deliberately not used: Windows
// OpenSSH does not implement the mux socket and every request fails with
// `mux_client_request_session`. Each call therefore pays a fresh handshake,
// which is slow but correct; a short in-process cache below removes most of
// the repeat cost during a page render.
const SSH_BASE = ["-o", "BatchMode=yes"];

// Server Components issue the same document repeatedly across a render (brand,
// navigation and homepage are each requested per layout and page). Caching the
// exact payload for a few seconds turns a homepage render from dozens of SSH
// handshakes into a handful.
const CACHE = new Map();
const CACHE_TTL_MS = 15_000;

let requests = 0;
let failures = 0;

function httpScript(hostname, payload, authorization) {
  // The payload travels inside a quoted heredoc, so no query text is ever a
  // command-line argument and none of it reaches the remote process table.
  return [
    "set -e",
    "TMP=$(mktemp)",
    'trap "rm -f $TMP" EXIT',
    "cat > \"$TMP\" <<'SIRA_PAYLOAD'",
    payload,
    "SIRA_PAYLOAD",
    // The credential travels in the environment and is read back by curl from
    // there, so it never appears as an argument and never reaches the remote
    // process table. It is also never logged.
    authorization === null
      ? `curl -sS -X POST -H 'content-type: application/json' --data @"$TMP" ` +
        `--max-time 120 "https://${hostname}/graphql"`
      : `curl -sS -X POST -H 'content-type: application/json' ` +
        `-H "authorization: $SIRA_PROXY_AUTHORIZATION" --data @"$TMP" ` +
        `--max-time 120 "https://${hostname}/graphql"`,
  ].join("\n");
}

// The PHP that WP-CLI evaluates. Kept as its own constant because it has to
// survive three levels of quoting on the way to the origin, and inlining it
// made that unreadable. It reads the request body from a file whose path
// arrives in the environment, so the query text never becomes an argument.
const WP_CLI_PHP = [
  '$raw = file_get_contents( getenv( "SIRA_PAYLOAD_FILE" ) );',
  '$body = json_decode( $raw, true );',
  'if ( ! is_array( $body ) ) { echo json_encode( array( "errors" => array( array( "message" => "Proxy could not parse the request body." ) ) ) ); return; }',
  '$result = graphql( array(',
  '  "query" => isset( $body["query"] ) ? $body["query"] : "",',
  '  "variables" => isset( $body["variables"] ) ? $body["variables"] : null,',
  '  "operation_name" => isset( $body["operationName"] ) ? $body["operationName"] : null,',
  ') );',
  'echo json_encode( $result );',
].join(" ");

function wpCliScript(hostname, payload) {
  // Same heredoc discipline as the HTTP transport. `graphql()` is WPGraphQL's
  // own in-process entry point, so this runs the real schema, the real ACF
  // field groups and the real database rows — only the network hop is absent.
  return [
    "set -e",
    "TMP=$(mktemp)",
    'trap "rm -f $TMP" EXIT',
    "cat > \"$TMP\" <<'SIRA_PAYLOAD'",
    payload,
    "SIRA_PAYLOAD",
    `cd ${WP_ROOT}`,
    // Introspection is refused for public requests by WPGraphQL's default
    // setting, so the in-process call runs as a network administrator exactly
    // as the HTTP transport authenticates. WP_CLI_USER keeps the choice
    // configurable rather than hardcoding an account.
    `SIRA_PAYLOAD_FILE="$TMP" wp --skip-themes --user=${WP_CLI_USER} ` +
      `--url="https://${hostname}" eval '${WP_CLI_PHP}'`,
  ].join("\n");
}

async function forward(siteKey, payload, authorization) {
  const hostname = HOSTNAME[siteKey];
  const script = usesWpCli(siteKey)
    ? wpCliScript(hostname, payload)
    : httpScript(hostname, payload, authorization);

  const args = [...SSH_BASE];

  if (authorization !== null && !usesWpCli(siteKey)) {
    args.push("-o", "SendEnv=SIRA_PROXY_AUTHORIZATION");
  }

  return run("ssh", [...args, "sira", "bash -s"], script, authorization);
}

async function forwardCached(siteKey, payload, authorization) {
  const key =
    siteKey +
    " " +
    (authorization === null ? "anon" : "auth") +
    " " +
    payload;
  const hit = CACHE.get(key);

  if (hit !== undefined && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.body;
  }

  const body = await forward(siteKey, payload, authorization);
  CACHE.set(key, { at: Date.now(), body });
  return body;
}

const server = createServer((request, response) => {
  const [, siteKey = "", tail = ""] = (request.url ?? "").split("/");

  if (request.method !== "POST" || tail !== "graphql" || !Object.hasOwn(HOSTNAME, siteKey)) {
    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ errors: [{ message: "Unknown proxy route." }] }));
    return;
  }

  const rawAuthorization = request.headers["authorization"];
  const incomingAuthorization =
    typeof rawAuthorization === "string" && rawAuthorization.trim() !== ""
      ? rawAuthorization.trim()
      : null;

  const chunks = [];
  request.on("data", (chunk) => chunks.push(chunk));
  request.on("end", () => {
    const payload = Buffer.concat(chunks).toString("utf8");
    requests += 1;

    forwardCached(siteKey, payload, incomingAuthorization)
      .then((body) => {
        // A challenge page would arrive as HTML. Surfacing it as a GraphQL
        // error is far more useful than letting the client fail on a parse.
        const looksLikeJson = body.trimStart().startsWith("{");
        if (!looksLikeJson) {
          failures += 1;
          response.writeHead(502, { "content-type": "application/json" });
          response.end(
            JSON.stringify({
              errors: [
                {
                  message:
                    "Upstream returned non-JSON (likely an edge challenge page).",
                },
              ],
            }),
          );
          return;
        }

        response.writeHead(200, {
          "content-type": "application/json",
          "cache-control": "no-store",
        });
        response.end(body);
      })
      .catch((error) => {
        failures += 1;
        response.writeHead(502, { "content-type": "application/json" });
        response.end(
          JSON.stringify({
            errors: [{ message: `SSH transport failed: ${error.message}` }],
          }),
        );
      });
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`GraphQL SSH proxy listening on http://127.0.0.1:${port}`);
  for (const key of Object.keys(HOSTNAME)) {
    console.log(`  SIRA_WP_${key.toUpperCase()}_GRAPHQL_URL=http://127.0.0.1:${port}/${key}/graphql`);
  }
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    console.log(`\n${requests} request(s), ${failures} failure(s). Closing.`);
    server.close(() => process.exit(0));
  });
}
