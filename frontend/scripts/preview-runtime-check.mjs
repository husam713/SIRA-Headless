import { createHmac } from "node:crypto";
import { createServer, request as httpRequest } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";

const PREVIEW_SECRET =
  "runtime-only-preview-entry-secret-000000000000000000000001";
const PREVIEW_USERNAME = "runtime-preview-editor";
const PREVIEW_PASSWORD = "runtime-test-application-password-0001";
const HOST = "siratrgroup.com";

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

function canonicalPayload(payload) {
  return [
    String(payload.version),
    payload.purpose,
    payload.siteKey,
    payload.contentType,
    payload.contentId,
    payload.destination,
    String(payload.issuedAt),
    String(payload.expiresAt),
  ].join("\n");
}

function signedPreviewPath(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    version: 1,
    purpose: "sira-editor-preview",
    siteKey: "group",
    contentType: "homepage",
    contentId: "/",
    destination: "/",
    issuedAt: now,
    expiresAt: now + 300,
    ...overrides,
  };
  const signature = createHmac("sha256", PREVIEW_SECRET)
    .update(canonicalPayload(payload), "utf8")
    .digest("base64url");
  const params = new URLSearchParams({
    v: String(payload.version),
    purpose: payload.purpose,
    siteKey: payload.siteKey,
    contentType: payload.contentType,
    contentId: payload.contentId,
    destination: payload.destination,
    issuedAt: String(payload.issuedAt),
    expiresAt: String(payload.expiresAt),
    signature,
  });
  return `/api/preview/?${params}`;
}

function request(port, path, { cookie, host = HOST } = {}) {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method: "GET",
        headers: {
          Host: host,
          ...(cookie ? { Cookie: cookie } : {}),
        },
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers,
            body,
          }),
        );
      },
    );
    req.on("error", reject);
    req.end();
  });
}

function cookieFrom(response) {
  const setCookie = response.headers["set-cookie"] ?? [];
  const values = Array.isArray(setCookie) ? setCookie : [setCookie];
  return values
    .map((value) => value.split(";", 1)[0])
    .filter(Boolean)
    .join("; ");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const graphqlEvents = [];
const mockPort = await freePort();
const appPort = await freePort();

const mockServer = createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    const parsed = JSON.parse(body || "{}");
    const authorization = req.headers.authorization ?? null;
    graphqlEvents.push({
      operationName: parsed.operationName,
      asPreview: parsed.variables?.asPreview ?? null,
      authorization,
    });

    const data =
      parsed.operationName === "SiraHomepage"
        ? {
            page: {
              databaseId: 7,
              uri: "/",
              title: parsed.variables?.asPreview
                ? "Draft Home"
                : "Published Home",
              siraHomepage: {
                variant: "group",
                branchHomepage: null,
                groupHomepage: {
                  hero: {
                    headingBefore: "Runtime",
                    headingHighlight: "preview",
                    headingAfter: "check",
                    description: "Local runtime verification.",
                  },
                },
              },
            },
          }
        : { siraBrand: null };

    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ data }));
  });
});
mockServer.listen(mockPort, "127.0.0.1");
await once(mockServer, "listening");

const app = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "-p",
    String(appPort),
    "--hostname",
    "127.0.0.1",
  ],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      SIRA_PREVIEW_ENTRY_SECRET: PREVIEW_SECRET,
      SIRA_WP_GROUP_GRAPHQL_URL: `http://127.0.0.1:${mockPort}/graphql`,
      SIRA_WP_GROUP_BLOG_ID: "1",
      SIRA_WP_GROUP_PREVIEW_USERNAME: PREVIEW_USERNAME,
      SIRA_WP_GROUP_PREVIEW_APPLICATION_PASSWORD: PREVIEW_PASSWORD,
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);

let logs = "";
app.stdout.on("data", (chunk) => {
  logs += chunk;
});
app.stderr.on("data", (chunk) => {
  logs += chunk;
});

try {
  const deadline = Date.now() + 20_000;
  let ready = false;
  let lastProbe = null;
  while (Date.now() < deadline) {
    try {
      lastProbe = await request(appPort, "/api/health/", { host: HOST });
      if (lastProbe.status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert(
    ready,
    `Next server did not become ready. Probe=${JSON.stringify(lastProbe)} Logs=${logs}`,
  );

  const published = await request(appPort, "/");
  assert(
    published.status === 200,
    `Published homepage status=${published.status}; body=${published.body.slice(0, 1000)}; logs=${logs}`,
  );
  assert(published.body.includes("Published Home"), "Published data was not used.");
  assert(!published.body.includes("Preview Mode"), "Preview banner leaked into public mode.");

  const bad = signedPreviewPath();
  const badUrl = new URL(`http://local${bad}`);
  badUrl.searchParams.set("signature", "A".repeat(43));
  const badResponse = await request(appPort, `${badUrl.pathname}?${badUrl.searchParams}`);
  assert(badResponse.status === 401, "Bad signature was not rejected.");
  assert(!cookieFrom(badResponse).includes("__prerender_bypass"), "Bad signature enabled Draft Mode.");

  const expired = await request(
    appPort,
    signedPreviewPath({
      issuedAt: Math.floor(Date.now() / 1000) - 600,
      expiresAt: Math.floor(Date.now() / 1000) - 300,
    }),
  );
  assert(expired.status === 401, "Expired preview request was not rejected.");

  const malicious = await request(
    appPort,
    signedPreviewPath({ destination: "//evil.example" }),
  );
  assert(malicious.status === 401, "Unsafe destination was not rejected.");

  const entry = await request(appPort, signedPreviewPath());
  assert([307, 308].includes(entry.status), "Valid preview entry did not redirect.");
  const draftCookie = cookieFrom(entry);
  assert(draftCookie.includes("__prerender_bypass"), "Draft Mode cookie was not issued.");

  const draft = await request(appPort, "/", { cookie: draftCookie });
  assert(draft.status === 200, "Draft homepage did not return 200.");
  assert(draft.body.includes("Draft Home"), "Draft data was not used.");
  assert(draft.body.includes("Preview Mode"), "Preview Mode banner was not rendered.");
  assert(
    /name="robots"[^>]+noindex|noindex[^>]+name="robots"/i.test(draft.body),
    "Draft response did not contain robots noindex metadata.",
  );

  const unsafeExit = await request(
    appPort,
    "/api/preview/exit/?destination=https://evil.example",
    { cookie: draftCookie },
  );
  assert(unsafeExit.status === 400, "Unsafe exit destination was not rejected.");

  const exit = await request(appPort, "/api/preview/exit/?destination=/", {
    cookie: draftCookie,
  });
  assert([307, 308].includes(exit.status), "Preview exit did not redirect.");
  const clearCookie = cookieFrom(exit);
  assert(clearCookie.includes("__prerender_bypass"), "Preview exit did not clear Draft Mode state.");

  const restored = await request(appPort, "/");
  assert(restored.body.includes("Published Home"), "Public mode was not restored after exit.");
  assert(!restored.body.includes("Preview Mode"), "Preview banner remained after exit.");

  const publishedGraphql = graphqlEvents.find(
    (event) => event.operationName === "SiraHomepage" && event.asPreview === false,
  );
  const previewGraphql = graphqlEvents.find(
    (event) => event.operationName === "SiraHomepage" && event.asPreview === true,
  );
  assert(publishedGraphql?.authorization === null, "Public GraphQL was authenticated.");
  assert(
    previewGraphql?.authorization?.startsWith("Basic "),
    "Preview GraphQL did not use Basic authentication.",
  );

  console.log(
    "Step 3C.2 local runtime verification PASS: entry, rejection paths, Draft Mode cookie, preview data, banner, noindex, exit, and public restoration.",
  );
} finally {
  app.kill("SIGTERM");
  mockServer.close();
  if (app.exitCode === null) {
    await Promise.race([
      once(app, "exit"),
      new Promise((resolve) => setTimeout(resolve, 2_000)),
    ]);
  }
  if (app.exitCode && app.exitCode !== 0 && !logs.includes("Ready")) {
    console.error(logs);
  }
}
