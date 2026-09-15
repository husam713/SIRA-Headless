#!/usr/bin/env node
/**
 * Branch-site fidelity: approved design vs production, measured.
 *
 * The same discipline used on the Group homepage, applied to all four branch
 * sites. It loads each approved .dc.html and the corresponding production
 * hostname in one browser at the same viewports, measures the same landmarks on
 * both, and writes a report plus full-page screenshots of each side.
 *
 * Tenant resolution is by hostname, so Chromium is launched with a
 * host-resolver rule that maps every siratrgroup.com name to the loopback. That
 * makes the browser send a real Host header, which is what the proxy reads —
 * a header override on the request would not reach it.
 *
 * The host-resolver rule has a side effect worth naming: it also captures the
 * MEDIA URLs, which live on the same hostnames, so uploads would be fetched
 * from the loopback and fail. Every /wp-content/ request is therefore routed
 * back out to the real origin by hostname-pinned IP, so a capture shows the
 * photographs a visitor actually sees rather than a page stripped of its art.
 *
 * The branch designs are not self-contained: their runtime fetches a shared
 * "Sira Branch" template as a sibling file, and fetch() is blocked on file://,
 * so a file:// load renders an empty placeholder. They are therefore served
 * over a throwaway static server on the loopback instead.
 *
 * Usage:
 *   pnpm build && pnpm start -p 3100      # in another shell
 *   node scripts/compare-branch.mjs [--out <dir>] [--port 3100]
 */

import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";

const NEWLINE = String.fromCharCode(10);
const VIEWPORTS = [390, 768, 1024, 1280, 1440, 1920];
const DESIGN_DIR = "../.local-reference/step-4-design";

function arg(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? fallback : process.argv[index + 1];
}

const PORT = arg("--port", "3100");
const OUT = arg("--out", join("..", "artifacts", "branch-fidelity"));

const BRANCHES = [
  { key: "realestate", host: "realestate.siratrgroup.com", design: "Sira Real Estate.dc.html" },
  { key: "healthcare", host: "healthcare.siratrgroup.com", design: "Sira Healthcare.dc.html" },
  { key: "lifestyle", host: "lifestyle.siratrgroup.com", design: "Sira Lifestyle.dc.html" },
  { key: "consulting", host: "consulting.siratrgroup.com", design: "Sira Consulting.dc.html" },
];

/**
 * Landmarks measured on both sides.
 *
 * The design is a flat export with no stable class names, so it is addressed
 * structurally and by content; production is addressed by its own semantics.
 * Where a landmark genuinely has no counterpart the entry reports null rather
 * than guessing, which is the point — a missing counterpart is a finding.
 */
const MEASURE = [
  "() => {",
  "  const box = (el) => {",
  "    if (!el) return null;",
  "    const r = el.getBoundingClientRect();",
  "    const s = getComputedStyle(el);",
  "    return {",
  "      w: Math.round(r.width), h: Math.round(r.height),",
  "      fs: Math.round(parseFloat(s.fontSize) * 10) / 10,",
  "      lh: s.lineHeight,",
  "      color: s.color, bg: s.backgroundColor,",
  "      family: s.fontFamily.split(',')[0].replace(/[\"']/g, ''),",
  "    };",
  "  };",
  "  const text = (el) => (el ? (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 60) : null);",
  "  const bySection = {};",
  "  for (const s of document.querySelectorAll('section')) {",
  "    const id = s.id || (s.getAttribute('aria-label') || '').toLowerCase().replace(/\\s+/g, '-') || '?';",
  "    const r = s.getBoundingClientRect();",
  "    if (!bySection[id]) bySection[id] = Math.round(r.height);",
  "  }",
  "  const header = document.querySelector('header');",
  "  const footer = document.querySelector('footer');",
  "  const h1 = document.querySelector('h1');",
  "  const hero = h1 ? h1.closest('section') : null;",
  "  const form = document.querySelector('form');",
  "  const nav = document.querySelector('header nav');",
  "  const root = document.documentElement;",
  "  return {",
  "    documentHeight: root.scrollHeight,",
  "    overflow: Math.max(0, root.scrollWidth - root.clientWidth),",
  "    header: box(header),",
  "    headerText: text(header),",
  "    navLinks: nav ? nav.querySelectorAll('a').length : 0,",
  "    hero: box(hero),",
  "    h1: box(h1),",
  "    h1Text: text(h1),",
  "    footer: box(footer),",
  "    footerText: text(footer),",
  "    form: box(form),",
  "    formFields: form ? form.querySelectorAll('input, select, textarea').length : 0,",
  "    sections: bySection,",
  "    sectionCount: document.querySelectorAll('section').length,",
  "    images: document.querySelectorAll('img').length,",
  "    cards: document.querySelectorAll('.card-lift, .card-hover').length,",
  "  };",
  "}",
].join(NEWLINE);

/**
 * Serve /wp-content/ from the real origin.
 *
 * Node resolves DNS normally, so it can reach the CMS even though Chromium's
 * resolver has been pointed at the loopback for the page itself.
 */
async function routeMediaToOrigin(page) {
  await page.route("**/wp-content/**", async (route) => {
    try {
      const response = await fetch(route.request().url());
      const body = Buffer.from(await response.arrayBuffer());

      await route.fulfill({
        status: response.status,
        contentType: response.headers.get("content-type") ?? "application/octet-stream",
        body,
      });
    } catch {
      // A media outage is a finding about the CMS, not a reason to abandon the
      // capture, so the request simply fails as it would in a browser.
      await route.abort();
    }
  });
}

async function capture(browser, url, width, shot) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });

  try {
    await routeMediaToOrigin(page);
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    await page.evaluate(() => document.fonts.ready);
    // The hero push is a 7.5s animation; let it settle so a screenshot is not
    // caught mid-scale and read as a layout difference.
    await page.waitForTimeout(500);

    const measured = await page.evaluate(
      (expression) => new Function("return " + expression)()(),
      MEASURE,
    );

    await page.screenshot({ path: shot, fullPage: true });
    return measured;
  } finally {
    await page.close();
  }
}

const MIME = Object.freeze({
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
});

/** Serves the design directory so its runtime can fetch its sibling template. */
function serveDesigns(root) {
  const server = createServer((request, response) => {
    const path = decodeURIComponent((request.url ?? "/").split("?")[0]);
    const target = normalize(join(root, path));

    stat(target)
      .then((info) => {
        // Resolved inside the design directory, or not served at all: a
        // traversal attempt lands outside `root` and is refused here rather
        // than being papered over by string surgery on the request path.
        if (!target.startsWith(root)) throw new Error("outside the design root");
        if (!info.isFile()) throw new Error("not a file");
        response.writeHead(200, {
          "Content-Type": MIME[extname(target).toLowerCase()] ?? "application/octet-stream",
        });
        createReadStream(target).pipe(response);
      })
      .catch(() => {
        response.writeHead(404).end("not found");
      });
  });

  return new Promise((resolveServer) => {
    server.listen(0, "127.0.0.1", () => resolveServer(server));
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const designRoot = resolve(DESIGN_DIR);
  const designServer = await serveDesigns(designRoot);
  const designPort = designServer.address().port;

  const browser = await chromium.launch({
    args: [
      "--host-resolver-rules=MAP *.siratrgroup.com 127.0.0.1,MAP siratrgroup.com 127.0.0.1",
    ],
  });

  const report = [];

  for (const branch of BRANCHES) {
    const designUrl = `http://127.0.0.1:${designPort}/${encodeURIComponent(branch.design)}`;
    const prodUrl = `http://${branch.host}:${PORT}/`;

    for (const width of VIEWPORTS) {
      const design = await capture(
        browser,
        designUrl,
        width,
        join(OUT, `${branch.key}-design-${width}.png`),
      );
      const prod = await capture(
        browser,
        prodUrl,
        width,
        join(OUT, `${branch.key}-prod-${width}.png`),
      );

      report.push({ branch: branch.key, viewport: width, design, prod });

      const drift = ((prod.documentHeight / design.documentHeight - 1) * 100).toFixed(1);
      console.log(
        `${branch.key.padEnd(11)} @${String(width).padEnd(5)} design ${String(design.documentHeight).padStart(5)}  prod ${String(prod.documentHeight).padStart(5)}  ${String(drift).padStart(6)}%  overflow ${design.overflow}/${prod.overflow}  sections ${design.sectionCount}/${prod.sectionCount}`,
      );
    }
  }

  await browser.close();
  designServer.close();
  await writeFile(join(OUT, "report.json"), JSON.stringify(report, null, 2) + NEWLINE);
  console.log(`${NEWLINE}Wrote ${join(OUT, "report.json")}`);
}

await main();
