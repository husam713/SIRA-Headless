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
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const REFERENCE_DIR = path.join(REPO_ROOT, ".local-reference", "step-4-design");

const NEWLINE = String.fromCharCode(10);

/**
 * `playwright-core` is currently only present as an optional transitive
 * dependency of vitest's browser runner, so it can disappear on a clean
 * install. Import it lazily and fail with an actionable message instead of a
 * bare MODULE_NOT_FOUND.
 */
async function loadChromium() {
  try {
    const playwright = await import("playwright-core");
    return playwright.chromium;
  } catch {
    throw new Error(
      [
        "playwright-core is present but its browser is missing, or install is stale.",
        "  Install deps:     pnpm install",
        "  Install Chromium: node node_modules/playwright-core/cli.js install chromium",
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

const TARGETS = Object.freeze({
  group: Object.freeze({
    label: "SIRA Group Homepage",
    reference: "SIRA Group Homepage.dc.html",
    live: Object.freeze({ url: LIVE_BASE_URL }),
  }),
  realestate: Object.freeze({
    label: "SIRA Real Estate",
    reference: "Sira Real Estate.dc.html",
    live: null,
  }),
  healthcare: Object.freeze({
    label: "SIRA Healthcare",
    reference: "Sira Healthcare.dc.html",
    live: null,
  }),
  lifestyle: Object.freeze({
    label: "SIRA Lifestyle",
    reference: "Sira Lifestyle.dc.html",
    live: null,
  }),
  consulting: Object.freeze({
    label: "SIRA Consulting",
    reference: "Sira Consulting.dc.html",
    live: null,
  }),
  news: Object.freeze({
    label: "SIRA News",
    reference: "Sira News.dc.html",
    live: null,
  }),
  branch: Object.freeze({
    label: "Generic Branch Template",
    reference: "Sira Branch.dc.html",
    live: null,
  }),
});

const VIEWPORT = Object.freeze({ width: 1920, height: 1080 });
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

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--list") {
      list = true;
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

  return { targets, outDir, list };
}

async function startReferenceServer() {
  const server = createServer((request, response) => {
    void (async () => {
      try {
        const requestPath = decodeURIComponent((request.url ?? "/").split("?")[0]);
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

async function captureBands(page, outDir, prefix) {
  const totalHeight = await page.evaluate(() =>
    Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.documentElement.getBoundingClientRect().height,
    ),
  );

  if (totalHeight <= 0) {
    console.warn(`  (skipping ${prefix}: page reported zero height)`);
    return [];
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
      clip: { x: 0, y, width: VIEWPORT.width, height },
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
    files.push(file);
    index += 1;

    if (height < BAND_HEIGHT) break;
    y += BAND_HEIGHT - BAND_OVERLAP;
  }

  return files;
}

async function captureTarget(browser, baseUrl, key, target, outDir) {
  console.log(`\n=== ${target.label} (${key}) ===`);

  const referencePage = await browser.newPage({ viewport: VIEWPORT });
  try {
    const referenceUrl = `${baseUrl}/${encodeURIComponent(target.reference)}`;
    await referencePage.goto(referenceUrl, {
      waitUntil: "load",
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    await settle(referencePage);
    await referencePage.waitForTimeout(600);
    const files = await captureBands(referencePage, outDir, `${key}-reference`);
    console.log(`Reference: ${files.length} band(s):`);
    for (const file of files) console.log(`  ${file}`);
  } catch (error) {
    console.error(`Reference capture failed for "${key}":`, error.message);
  } finally {
    await referencePage.close();
  }

  if (target.live === null) {
    console.log("Live: skipped (no reachable preview URL configured for this target yet).");
    return;
  }

  const bypass = process.env["SIRA_VERCEL_PROTECTION_BYPASS"];
  const headers = { ...(target.live.extraHTTPHeaders ?? {}) };
  if (bypass !== undefined && bypass !== "") {
    headers["x-vercel-protection-bypass"] = bypass;
  }

  const livePage = await browser.newPage({ viewport: VIEWPORT, extraHTTPHeaders: headers });
  try {
    const response = await livePage.goto(target.live.url, {
      waitUntil: "domcontentloaded",
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    if (response !== null && response.status() === 401) {
      console.warn(
        "Live: got HTTP 401 — set SIRA_VERCEL_PROTECTION_BYPASS (Vercel project settings → " +
          "Deployment Protection → Protection Bypass for Automation) and retry.",
      );
      return;
    }
    await settle(livePage);
    await livePage.waitForTimeout(600);
    const files = await captureBands(livePage, outDir, `${key}-live`);
    console.log(`Live: ${files.length} band(s):`);
    for (const file of files) console.log(`  ${file}`);
  } catch (error) {
    console.error(`Live capture failed for "${key}":`, error.message);
  } finally {
    await livePage.close();
  }
}

async function main() {
  const { targets, outDir, list } = parseArgs(process.argv.slice(2));

  if (list) {
    console.log("Available targets:");
    for (const [key, target] of Object.entries(TARGETS)) {
      console.log(`  ${key.padEnd(12)} ${target.label}${target.live === null ? " (reference only)" : ""}`);
    }
    return;
  }

  await mkdir(outDir, { recursive: true });
  console.log(`Output directory: ${outDir}`);

  const { server, baseUrl } = await startReferenceServer();
  const chromium = await loadChromium();
  const browser = await chromium.launch();

  try {
    for (const key of targets) {
      const target = TARGETS[key];
      if (target === undefined) {
        console.warn(`Unknown target "${key}" — skipping. Run with --list to see valid targets.`);
        continue;
      }
      await captureTarget(browser, baseUrl, key, target, outDir);
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\nDone. All screenshots saved under: ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
