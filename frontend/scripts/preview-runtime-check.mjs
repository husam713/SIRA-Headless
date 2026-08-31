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
const REDIRECT_ALIAS_HOST = "www.siratrgroup.com";
const DEPLOYMENT_HOST = "group-deploy.localhost";
const UNKNOWN_HOST = "unknown.localhost";
const APP_HOSTNAME = "localhost";

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
        hostname: APP_HOSTNAME,
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

function setCookieValues(response) {
  const setCookie = response.headers["set-cookie"] ?? [];
  return Array.isArray(setCookie) ? setCookie : [setCookie];
}

function hasDraftModeCookie(response) {
  return cookieFrom(response).includes("__prerender_bypass");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const graphqlEvents = [];
let previewHomepageRequestCount = 0;
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
    const previewRequest = parsed.variables?.asPreview === true;
    const previewSequence =
      parsed.operationName === "SiraHomepage" && previewRequest
        ? ++previewHomepageRequestCount
        : null;
    graphqlEvents.push({
      operationName: parsed.operationName,
      asPreview: parsed.variables?.asPreview ?? null,
      authorization,
      previewSequence,
    });

    const data =
      parsed.operationName === "SiraHomepage"
        ? {
            page: {
              databaseId: 7,
              uri: "/",
              title: previewRequest
                ? `Draft Home ${previewSequence}`
                : "Published Home",
              // `siraHomepage` carries only `variant`; the sections arrive in
              // two ACF field groups on `page`, `groupHomepage` and
              // `branchHomepage`. See normalizeHomepage in
              // src/lib/homepage/normalize-homepage.ts.
              siraHomepage: { variant: "group" },
              groupHomepage: {
                hero: {
                  headingBefore: "Runtime",
                  headingHighlight: "preview",
                  headingAfter: "check",
                  description: "Local runtime verification.",
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
    APP_HOSTNAME,
  ],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      SIRA_PREVIEW_ENTRY_SECRET: PREVIEW_SECRET,
      SIRA_EXTRA_HOSTS_JSON: JSON.stringify({
        group: [DEPLOYMENT_HOST],
      }),
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
  assert(!hasDraftModeCookie(published), "Public mode issued a Draft Mode cookie.");

  const unauthorized = await request(appPort, "/api/preview/");
  assert(unauthorized.status === 401, "Unsigned preview entry was not rejected.");
  assert(!hasDraftModeCookie(unauthorized), "Unsigned preview entry enabled Draft Mode.");

  const bad = signedPreviewPath();
  const badUrl = new URL(`http://local${bad}`);
  badUrl.searchParams.set("signature", "A".repeat(43));
  const badResponse = await request(appPort, `${badUrl.pathname}?${badUrl.searchParams}`);
  assert(badResponse.status === 401, "Bad signature was not rejected.");
  assert(!hasDraftModeCookie(badResponse), "Bad signature enabled Draft Mode.");

  const now = Math.floor(Date.now() / 1000);
  const expired = await request(
    appPort,
    signedPreviewPath({
      issuedAt: now - 600,
      expiresAt: now - 300,
    }),
  );
  assert(expired.status === 401, "Expired preview request was not rejected.");
  assert(!hasDraftModeCookie(expired), "Expired preview request enabled Draft Mode.");

  const future = await request(
    appPort,
    signedPreviewPath({
      issuedAt: now + 60,
      expiresAt: now + 180,
    }),
  );
  assert(future.status === 401, "Future preview request was not rejected.");
  assert(!hasDraftModeCookie(future), "Future preview request enabled Draft Mode.");

  const malicious = await request(
    appPort,
    signedPreviewPath({ destination: "//evil.example" }),
  );
  assert(malicious.status === 401, "Unsafe destination was not rejected.");
  assert(!hasDraftModeCookie(malicious), "Unsafe destination enabled Draft Mode.");

  const tenantMismatch = await request(
    appPort,
    signedPreviewPath({ siteKey: "consulting" }),
  );
  assert(tenantMismatch.status === 401, "Tenant-mismatched preview entry was not rejected.");
  assert(!hasDraftModeCookie(tenantMismatch), "Tenant mismatch enabled Draft Mode.");

  const unknownPublic = await request(appPort, "/", { host: UNKNOWN_HOST });
  assert(unknownPublic.status === 421, "Unknown public Host did not fail closed.");

  const unknownEntry = await request(appPort, signedPreviewPath(), {
    host: UNKNOWN_HOST,
  });
  assert(unknownEntry.status === 401, "Unknown preview Host was not rejected.");
  assert(!hasDraftModeCookie(unknownEntry), "Unknown Host enabled Draft Mode.");

  const aliasEntry = await request(appPort, signedPreviewPath(), {
    host: REDIRECT_ALIAS_HOST,
  });
  assert(aliasEntry.status === 401, "Redirect-alias preview entry was not rejected.");
  assert(!hasDraftModeCookie(aliasEntry), "Redirect alias enabled Draft Mode.");

  const deploymentEntry = await request(appPort, signedPreviewPath(), {
    host: DEPLOYMENT_HOST,
  });
  assert(
    [307, 308].includes(deploymentEntry.status),
    "Allowlisted deployment-host preview entry did not redirect.",
  );
  assert(
    typeof deploymentEntry.headers.location === "string",
    "Deployment-host preview entry did not return a redirect destination.",
  );
  const deploymentLocation = new URL(
    deploymentEntry.headers.location,
    `http://${DEPLOYMENT_HOST}`,
  );
  assert(
    deploymentLocation.hostname === DEPLOYMENT_HOST,
    "Deployment-host preview entry redirected to production.",
  );
  const deploymentDraftCookie = cookieFrom(deploymentEntry);
  assert(
    deploymentDraftCookie.includes("__prerender_bypass"),
    "Deployment-host preview entry did not issue Draft Mode state.",
  );

  const deploymentDraft = await request(appPort, "/", {
    cookie: deploymentDraftCookie,
    host: DEPLOYMENT_HOST,
  });
  assert(deploymentDraft.status === 200, "Deployment-host preview did not render.");
  assert(
    deploymentDraft.body.includes("Draft Home 1"),
    "Deployment host did not remain on the Group preview data flow.",
  );
  assert(
    deploymentDraft.headers["x-robots-tag"] === "noindex, nofollow, noarchive",
    "Deployment-host preview was not marked noindex at the proxy boundary.",
  );

  const entry = await request(appPort, signedPreviewPath());
  assert([307, 308].includes(entry.status), "Valid preview entry did not redirect.");
  assert(
    typeof entry.headers.location === "string",
    "Valid preview entry did not return a redirect destination.",
  );
  const entryLocation = new URL(entry.headers.location, `http://${HOST}`);
  assert(
    entryLocation.hostname === HOST &&
      entryLocation.pathname === "/" &&
      entryLocation.search === "",
    "Valid preview entry did not retain its safe same-host destination.",
  );
  const draftCookie = cookieFrom(entry);
  assert(draftCookie.includes("__prerender_bypass"), "Draft Mode cookie was not issued.");

  const draft = await request(appPort, "/", { cookie: draftCookie });
  assert(draft.status === 200, "Draft homepage did not return 200.");
  assert(draft.body.includes("Draft Home 2"), "Draft data was not used.");
  assert(draft.body.includes("Preview Mode"), "Preview Mode banner was not rendered.");
  assert(
    /name="robots"[^>]+noindex|noindex[^>]+name="robots"/i.test(draft.body),
    "Draft response did not contain robots noindex metadata.",
  );
  assert(
    /<link[^>]+rel="canonical"[^>]+href="https:\/\/siratrgroup\.com\/"|<link[^>]+href="https:\/\/siratrgroup\.com\/"[^>]+rel="canonical"/i.test(
      draft.body,
    ),
    "Draft response did not retain the production canonical URL.",
  );
  assert(
    !draft.body.includes(PREVIEW_SECRET) &&
      !draft.body.includes(PREVIEW_USERNAME) &&
      !draft.body.includes(PREVIEW_PASSWORD),
    "Server-only preview material leaked into rendered HTML.",
  );

  const secondDraft = await request(appPort, "/", { cookie: draftCookie });
  assert(secondDraft.status === 200, "Second Draft Mode request did not render.");
  assert(
    secondDraft.body.includes("Draft Home 3"),
    "Preview GraphQL data was cached instead of making a no-store transport request.",
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
  assert(
    typeof exit.headers.location === "string",
    "Preview exit did not return a redirect destination.",
  );
  const exitLocation = new URL(exit.headers.location, `http://${HOST}`);
  assert(
    exitLocation.hostname === HOST &&
      exitLocation.pathname === "/" &&
      exitLocation.search === "",
    "Preview exit did not retain its safe same-host destination.",
  );
  const clearCookie = cookieFrom(exit);
  assert(clearCookie.includes("__prerender_bypass"), "Preview exit did not clear Draft Mode state.");
  assert(
    setCookieValues(exit).some(
      (value) =>
        value.startsWith("__prerender_bypass=;") &&
        (/max-age=0/i.test(value) || /expires=Thu, 01 Jan 1970/i.test(value)),
    ),
    "Preview exit did not expire the Draft Mode cookie.",
  );

  const restored = await request(appPort, "/", { cookie: clearCookie });
  assert(restored.status === 200, "Public mode was not restored to a 200 response.");
  assert(restored.body.includes("Published Home"), "Public mode was not restored after exit.");
  assert(!restored.body.includes("Preview Mode"), "Preview banner remained after exit.");

  const publishedGraphql = graphqlEvents.find(
    (event) => event.operationName === "SiraHomepage" && event.asPreview === false,
  );
  const previewGraphql = graphqlEvents.filter(
    (event) => event.operationName === "SiraHomepage" && event.asPreview === true,
  );
  assert(publishedGraphql?.authorization === null, "Public GraphQL was authenticated.");
  assert(
    previewGraphql.length >= 3 &&
      previewGraphql.every((event) => event.authorization?.startsWith("Basic ")),
    "Preview GraphQL requests did not use server-only Basic authentication.",
  );
  assert(
    previewGraphql.slice(0, 3).every((event, index) => event.previewSequence === index + 1),
    "Preview GraphQL no-store requests did not cross the real HTTP boundary independently.",
  );

  console.log(
    "Step 3C.2 local runtime verification PASS: public Group, unsigned/bad/expired/future/unsafe/tenant/unknown/alias rejection, deployment host, signed entry, Draft Mode cookie, no-store preview data, banner, noindex/canonical, exit, and public restoration.",
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
