#!/usr/bin/env node
/**
 * Visual-diff capture tool.
 *
 * Captures full-page screenshots (sliced into readable horizontal bands) of
 * both the live coded site and its design-reference counterpart
 * (`.local-reference/step-4-design/*.dc.html`), so a reviewer can compare
 * them without manually screenshotting either side.
 *
 * The reference files are a client-rendered "design canvas" format
 * (templated placeholders + a small custom-element runtime, see
 * `support.js` next to them) — they need an HTTP origin, not `file://`,
 * because the runtime does a `fetch()` for a companion script that the
 * `file:` scheme can't load. This script spins up a throwaway local static
 * server for that directory rather than depending on the separately
 * deployed (and access-protected) canvas host.
 *
 * Usage:
 *   node scripts/visual-diff.mjs [--targets group,realestate,...] [--out <dir>]
 *   node scripts/visual-diff.mjs --list
 *
 * Live-site capture additionally requires (only for targets whose `live`
 * entry is configured below):
 *   SIRA_VERCEL_PROTECTION_BYPASS  — the project's Vercel "Protection
 *     Bypass for Automation" secret (Vercel project settings → Deployment
 *     Protection). Without it, live capture for that target is skipped
 *     with a warning; reference capture still runs.
 */

import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { readFile, readdir, mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const REFERENCE_DIR = path.join(REPO_ROOT, ".local-reference", "step-4-design");

const NEWLINE = String.fromCharCode(10);

/**
 * `playwright-core` is an explicit devDependency. It used to arrive only as an
 * optional transitive of vitest's browser runner, which meant a clean
 * `pnpm install --frozen-lockfile` did not install it at all. The guarded lazy
 * import stays so a missing or stale module fails with an actionable message
 * instead of a bare MODULE_NOT_FOUND.
 *
 * The browser BINARY is a separate download and is not bundled with the
 * package. Install it with:
 *   node node_modules/playwright-core/cli.js install chromium
 * A missing binary surfaces later, from Playwright's own `chromium.launch()`,
 * not from the catch below — that catch only ever sees the import fail.
 */
async function loadChromium() {
  try {
    const playwright = await import("playwright-core");
    return playwright.chromium;
  } catch {
    throw new Error(
      [
        "Could not import playwright-core. The module is missing or the install is stale.",
        "  Install deps: pnpm install",
      ].join(NEWLINE),
    );
  }
}

const MIME_TYPES = Object.freeze({
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
});

// The one Vercel deployment hostname the project currently maps to a site
// (see SIRA_EXTRA_HOSTS_JSON on Vercel → Preview). Only "group" is reachable
// today; add `live` entries for the branch targets once their own preview
// hostnames exist (see the "give me preview links" discussion — hostname-
// based routing means a single alias can't serve more than one site).
const LIVE_BASE_URL =
  "https://sira-headless-git-feat-step-4-shared-shell-husam713s-projects.vercel.app/";

// Tenants are resolved from the Host header, not from a path segment: the
// [siteKey] route parameter is populated by hostname discovery, and requesting
// http://localhost:3000/healthcare/ is a 404 while an unknown Host is a 421.
// So local capture maps the canonical hostnames onto a local `next dev` at the
// DNS layer and requests the real hostname:
//   SIRA_VISUAL_DIFF_LOCAL_ORIGIN=127.0.0.1:3000
// Unset, every target keeps exactly its previous live entry.
const LOCAL_ORIGIN = process.env["SIRA_VISUAL_DIFF_LOCAL_ORIGIN"];

// Mirrors canonicalHostname in src/config/sites.ts. Duplicated rather than
// imported because this is a plain .mjs script and that registry is TypeScript.
const SITE_HOSTNAMES = Object.freeze({
  group: "siratrgroup.com",
  consulting: "consulting.siratrgroup.com",
  healthcare: "healthcare.siratrgroup.com",
  lifestyle: "lifestyle.siratrgroup.com",
  realestate: "realestate.siratrgroup.com",
});

function localResolverRules() {
  if (LOCAL_ORIGIN === undefined || LOCAL_ORIGIN === "") return [];
  const rules = Object.values(SITE_HOSTNAMES)
    .map((hostname) => `MAP ${hostname} ${LOCAL_ORIGIN}`)
    .join(",");
  return [`--host-resolver-rules=${rules}`];
}

function liveFor(siteKey, fallback) {
  if (LOCAL_ORIGIN === undefined || LOCAL_ORIGIN === "") return fallback;
  return Object.freeze({ url: `http://${SITE_HOSTNAMES[siteKey]}/` });
}

const TARGETS = Object.freeze({
  group: Object.freeze({
    label: "SIRA Group Homepage",
    reference: "SIRA Group Homepage.dc.html",
    fixture: "group-complete.html",
    live: liveFor("group", Object.freeze({ url: LIVE_BASE_URL })),
  }),
  realestate: Object.freeze({
    label: "SIRA Real Estate",
    reference: "Sira Real Estate.dc.html",
    fixture: "branch-complete-realestate.html",
    live: liveFor("realestate", null),
  }),
  healthcare: Object.freeze({
    label: "SIRA Healthcare",
    reference: "Sira Healthcare.dc.html",
    fixture: "branch-complete-healthcare.html",
    live: liveFor("healthcare", null),
  }),
  lifestyle: Object.freeze({
    label: "SIRA Lifestyle",
    reference: "Sira Lifestyle.dc.html",
    fixture: "branch-complete-lifestyle.html",
    live: liveFor("lifestyle", null),
  }),
  consulting: Object.freeze({
    label: "SIRA Consulting",
    reference: "Sira Consulting.dc.html",
    fixture: "branch-complete.html",
    live: liveFor("consulting", null),
  }),
  news: Object.freeze({
    label: "SIRA News",
    reference: "Sira News.dc.html",
    fixture: null,
    live: null,
  }),
  branch: Object.freeze({
    label: "Generic Branch Template",
    reference: "Sira Branch.dc.html",
    fixture: null,
    live: null,
  }),
});

// Default stays the historical single 1920 capture so existing invocations are
// unchanged. --viewports selects the comparison widths; G-J uses 1440,768,390,
// which straddle the app's real breakpoints (48rem = 768 and 68.75rem = 1100 in
// styles/globals.css) rather than generic device sizes.
const DEFAULT_VIEWPORT_WIDTHS = Object.freeze([1920]);
const VIEWPORT_HEIGHT = 1080;
const MIN_VIEWPORT_WIDTH = 320;
const MAX_VIEWPORT_WIDTH = 3840;
const BAND_HEIGHT = 1300;
const BAND_OVERLAP = 100;
const MAX_BANDS = 40;
// The live page server-renders against five WordPress GraphQL endpoints and
// the reference canvas pulls Google Fonts, so both are legitimately slow on a
// cold hit. These are deliberately generous rather than tuned.
const NAVIGATION_TIMEOUT_MS = 90000;
const SCREENSHOT_TIMEOUT_MS = 60000;
const FONT_SETTLE_TIMEOUT_MS = 15000;

function parseArgs(argv) {
  let targets = ["group"];
  let outDir = path.join(
    process.env["TEMP"] ?? process.env["TMPDIR"] ?? REPO_ROOT,
    "sira-visual-diff",
  );
  let list = false;
  let viewports = [...DEFAULT_VIEWPORT_WIDTHS];
  let source = "live";

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--list") {
      list = true;
    } else if (arg === "--viewports") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("--viewports requires a value");
      viewports = value.split(",").map((item) => item.trim()).filter(Boolean).map((item) => {
        if (!/^[0-9]+$/.test(item)) {
          throw new Error(`--viewports expects integer widths, got "${item}"`);
        }
        const width = Number(item);
        if (width < MIN_VIEWPORT_WIDTH || width > MAX_VIEWPORT_WIDTH) {
          throw new Error(
            `--viewports width ${width} is outside ${MIN_VIEWPORT_WIDTH}-${MAX_VIEWPORT_WIDTH}`,
          );
        }
        return width;
      });
      if (viewports.length === 0) throw new Error("--viewports requires at least one width");
      i += 1;
    } else if (arg === "--source") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("--source requires a value");
      if (value !== "live" && value !== "fixture") {
        throw new Error(`--source expects "live" or "fixture", got "${value}"`);
      }
      source = value;
      i += 1;
    } else if (arg === "--targets") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("--targets requires a value");
      targets = value.split(",").map((item) => item.trim()).filter(Boolean);
      i += 1;
    } else if (arg === "--out") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("--out requires a value");
      outDir = path.resolve(value);
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (targets.length === 0) throw new Error("--targets requires at least one target");

  // An unknown target used to warn and continue, so a typo produced a run that
  // looked successful and captured nothing for that tenant. It is now fatal.
  const unknown = targets.filter((key) => !Object.hasOwn(TARGETS, key));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown target(s): ${unknown.join(", ")}. Run with --list to see valid targets.`,
    );
  }

  return { targets, outDir, list, viewports, source };
}

const FIXTURE_HTML_DIR = path.join(REPO_ROOT, "frontend", "test-results", "homepage-fixtures");
const FIXTURE_CHUNK_DIR = path.join(REPO_ROOT, "frontend", ".next", "static", "chunks");

// Assembles exactly what scripts/verify-homepage-fixtures.mjs assembles: the
// built CSS plus the next/font variable classes recovered from it. The fixture
// markup already carries its tenant brand tokens, emitted by tests/harness.
async function readFixtureDocument(fileName) {
  const markup = await readFile(path.join(FIXTURE_HTML_DIR, fileName), "utf8");

  const cssFiles = (await readdir(FIXTURE_CHUNK_DIR)).filter((name) => name.endsWith(".css"));
  if (cssFiles.length === 0) {
    throw new Error(`No CSS in ${FIXTURE_CHUNK_DIR}. Run the build first.`);
  }
  const parts = await Promise.all(
    cssFiles.map((name) => readFile(path.join(FIXTURE_CHUNK_DIR, name), "utf8")),
  );
  const css = parts.join(NEWLINE);

  const fontClasses = new Set();
  for (const match of css.matchAll(/\.([A-Za-z0-9_-]+__variable)/g)) fontClasses.add(match[1]);
  if (fontClasses.size === 0) {
    throw new Error("No next/font variable classes in the built CSS; typography would be wrong.");
  }

  return (
    `<!doctype html><html lang="en" class="${[...fontClasses].join(" ")}">` +
    `<head><meta charset="utf-8"><style>${css}</style></head>` +
    `<body>${markup}</body></html>`
  );
}

async function startReferenceServer() {
  const server = createServer((request, response) => {
    void (async () => {
      try {
        const requestPath = decodeURIComponent((request.url ?? "/").split("?")[0]);

        if (requestPath.startsWith("/__fixture/")) {
          const fileName = path.basename(requestPath.slice("/__fixture/".length));
          const document = await readFixtureDocument(fileName);
          response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          response.end(document);
          return;
        }
        const relativePath = requestPath === "/" ? "" : requestPath.replace(/^\/+/, "");
        const filePath = path.join(REFERENCE_DIR, relativePath);

        if (!filePath.startsWith(REFERENCE_DIR)) {
          response.writeHead(403);
          response.end("Forbidden");
          return;
        }

        const data = await readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        response.writeHead(200, {
          "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
        });
        response.end(data);
      } catch {
        response.writeHead(404);
        response.end("Not found");
      }
    })();
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = typeof address === "object" && address !== null ? address.port : 0;
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function settle(page) {
  await page.evaluate(
    (timeoutMs) =>
      Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, timeoutMs)),
      ]),
    FONT_SETTLE_TIMEOUT_MS,
  );
}

async function captureBands(page, outDir, prefix, viewportWidth) {
  const totalHeight = await page.evaluate(() =>
    Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.documentElement.getBoundingClientRect().height,
    ),
  );

  if (totalHeight <= 0) {
    throw new Error(`${prefix}: page reported zero height, so nothing was captured`);
  }

  const files = [];
  let y = 0;
  let index = 0;

  while (y < totalHeight && index < MAX_BANDS) {
    const height = Math.min(BAND_HEIGHT, totalHeight - y);
    const file = path.join(outDir, `${prefix}-${String(index).padStart(2, "0")}.png`);
    await page.screenshot({
      path: file,
      // clip is viewport-relative unless fullPage is set; these bands are
      // slices of the whole document, so both are required.
      fullPage: true,
      clip: { x: 0, y, width: viewportWidth, height },
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
    files.push(file);
    index += 1;

    if (height < BAND_HEIGHT) break;
    y += BAND_HEIGHT - BAND_OVERLAP;
  }

  return files;
}

async function sideCarRecord(files) {
  const records = [];
  for (const file of files) {
    const bytes = await readFile(file);
    const info = await stat(file);
    records.push({
      path: path.basename(file),
      absolutePath: file,
      size: info.size,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
  return records;
}

// One capture = one tenant, one side, one viewport. Every requested capture
// produces a record, successful or not, so a partial run can never be read as a
// complete one.
async function captureSide(browser, key, side, url, viewportWidth, outDir, extraHeaders) {
  const startedAt = new Date().toISOString();
  const prefix = `${key}-${side}-${viewportWidth}`;
  const page = await browser.newPage({
    viewport: { width: viewportWidth, height: VIEWPORT_HEIGHT },
    ...(extraHeaders === undefined ? {} : { extraHTTPHeaders: extraHeaders }),
  });

  try {
    const response = await page.goto(url, {
      waitUntil: side === "reference" ? "load" : "domcontentloaded",
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    const status = response === null ? null : response.status();

    if (status === 401) {
      throw new Error(
        "HTTP 401 - set SIRA_VERCEL_PROTECTION_BYPASS (Vercel project settings -> " +
          "Deployment Protection -> Protection Bypass for Automation) and retry",
      );
    }
    if (status !== null && status >= 400) {
      throw new Error(`HTTP ${status}`);
    }

    await settle(page);
    await page.waitForTimeout(600);

    const files = await captureBands(page, outDir, prefix, viewportWidth);
    if (files.length === 0) throw new Error("no bands were captured");

    console.log(`  ${side} @ ${viewportWidth}px: PASS (${files.length} band(s))`);
    return {
      tenant: key,
      side,
      viewport: viewportWidth,
      url,
      status: "PASS",
      httpStatus: status,
      startedAt,
      finishedAt: new Date().toISOString(),
      error: null,
      files: await sideCarRecord(files),
    };
  } catch (error) {
    console.error(`  ${side} @ ${viewportWidth}px: FAIL - ${error.message}`);
    return {
      tenant: key,
      side,
      viewport: viewportWidth,
      url,
      status: "FAIL",
      httpStatus: null,
      startedAt,
      finishedAt: new Date().toISOString(),
      error: error.message,
      files: [],
    };
  } finally {
    await page.close();
  }
}

async function captureTarget(browser, baseUrl, key, target, outDir, viewports, source) {
  console.log(`
=== ${target.label} (${key}) ===`);
  const results = [];

  for (const viewportWidth of viewports) {
    results.push(
      await captureSide(
        browser,
        key,
        "reference",
        `${baseUrl}/${encodeURIComponent(target.reference)}`,
        viewportWidth,
        outDir,
        undefined,
      ),
    );
  }

  // Fixture mode replaces the live side with the composed fixture render, which
  // carries full content and this tenant's brand tokens. It is the only surface
  // that can compare the content sections while the CMS is unauthored.
  if (source === "fixture") {
    if (target.fixture === null) {
      for (const viewportWidth of viewports) {
        console.log(`  fixture @ ${viewportWidth}px: SKIPPED (no fixture for this target)`);
        results.push({
          tenant: key,
          side: "fixture",
          viewport: viewportWidth,
          url: null,
          status: "SKIPPED",
          httpStatus: null,
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          error: "no fixture render exists for this target",
          files: [],
        });
      }
      return results;
    }

    for (const viewportWidth of viewports) {
      results.push(
        await captureSide(
          browser,
          key,
          "fixture",
          `${baseUrl}/__fixture/${encodeURIComponent(target.fixture)}`,
          viewportWidth,
          outDir,
          undefined,
        ),
      );
    }

    return results;
  }

  if (target.live === null) {
    // Not requested, so not a failure: it is reported as SKIPPED and the
    // manifest says why.
    for (const viewportWidth of viewports) {
      console.log(`  live @ ${viewportWidth}px: SKIPPED (no live URL configured)`);
      results.push({
        tenant: key,
        side: "live",
        viewport: viewportWidth,
        url: null,
        status: "SKIPPED",
        httpStatus: null,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        error: "no live URL configured; set SIRA_VISUAL_DIFF_LOCAL_ORIGIN",
        files: [],
      });
    }
    return results;
  }

  const bypass = process.env["SIRA_VERCEL_PROTECTION_BYPASS"];
  const headers = { ...(target.live.extraHTTPHeaders ?? {}) };
  if (bypass !== undefined && bypass !== "") {
    headers["x-vercel-protection-bypass"] = bypass;
  }

  for (const viewportWidth of viewports) {
    results.push(
      await captureSide(
        browser,
        key,
        "live",
        target.live.url,
        viewportWidth,
        outDir,
        headers,
      ),
    );
  }

  return results;
}

async function main() {
  const { targets, outDir, list, viewports, source } = parseArgs(process.argv.slice(2));

  if (list) {
    console.log("Available targets:");
    for (const [key, target] of Object.entries(TARGETS)) {
      console.log(`  ${key.padEnd(12)} ${target.label}${target.live === null ? " (reference only)" : ""}`);
    }
    return;
  }

  await mkdir(outDir, { recursive: true });
  console.log(`Output directory: ${outDir}`);
  console.log(`Viewports: ${viewports.join(", ")}`);
  console.log(`Source: ${source}`);

  const runStartedAt = new Date().toISOString();
  const results = [];

  const { server, baseUrl } = await startReferenceServer();
  const chromium = await loadChromium();
  const browser = await chromium.launch({ args: localResolverRules() });

  try {
    for (const key of targets) {
      // parseArgs already rejected unknown targets, so every key here is real.
      results.push(
        ...(await captureTarget(browser, baseUrl, key, TARGETS[key], outDir, viewports, source)),
      );
    }
  } finally {
    await browser.close();
    server.close();
  }

  const failed = results.filter((r) => r.status === "FAIL");
  const passed = results.filter((r) => r.status === "PASS");
  const skipped = results.filter((r) => r.status === "SKIPPED");
  const exitStatus = failed.length === 0 ? 0 : 1;

  const manifestPath = path.join(outDir, "capture-manifest.json");
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        tool: "frontend/scripts/visual-diff.mjs",
        startedAt: runStartedAt,
        finishedAt: new Date().toISOString(),
        outDir,
        requestedTargets: targets,
        requestedViewports: viewports,
        source,
        references: Object.fromEntries(
          targets.map((key) => [key, TARGETS[key].reference]),
        ),
        summary: {
          requested: results.length,
          passed: passed.length,
          failed: failed.length,
          skipped: skipped.length,
        },
        captures: results,
        exitStatus,
      },
      null,
      2,
    )}
`,
    "utf8",
  );

  console.log(
    `
Captures: ${passed.length} PASS, ${failed.length} FAIL, ${skipped.length} SKIPPED`,
  );
  console.log(`Manifest: ${manifestPath}`);

  if (exitStatus !== 0) {
    // A failed capture must never be reportable as a complete successful run.
    console.error(
      `
${failed.length} requested capture(s) failed:` +
        failed
          .map((r) => `
  ${r.tenant} ${r.side} @ ${r.viewport}px - ${r.error}`)
          .join(""),
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Done. All screenshots saved under: ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
