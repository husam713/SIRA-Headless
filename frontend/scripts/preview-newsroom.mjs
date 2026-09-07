#!/usr/bin/env node
/**
 * Newsroom preview capture.
 *
 * Screenshots the markup written by tests/harness/compose-newsroom-preview.test.ts
 * and tests/harness/compose-article-preview.test.ts at four viewports, so the
 * newsroom can be art-directed and reviewed without a CMS, a deployment, or any
 * credentials. The markup comes from the real production components, so what is
 * captured here is the site.
 *
 * Unlike scripts/verify-homepage-fixtures.mjs this compiles the stylesheet
 * directly with PostCSS instead of reading it out of `.next/static/chunks`,
 * which turns a design iteration from a full production build into about a
 * second. Fonts still come from a build, because next/font only resolves inside
 * the Next compiler — the woff2 files under `.next/static/media` are stable
 * across source edits, so one build is enough for many iterations.
 *
 * Usage:
 *   pnpm vitest run tests/harness/compose-newsroom-preview.test.ts
 *   node scripts/preview-newsroom.mjs [--only group,branch-healthcare] [--out <dir>]
 *
 * Requires once:
 *   pnpm build
 *   node node_modules/playwright-core/cli.js install chromium
 */

import { createServer } from "node:http";
import { readdirSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const NEWLINE = String.fromCharCode(10);
const HTML_DIR = join("test-results", "newsroom-preview");
const MEDIA_DIR = join(".next", "static", "media");
const CHUNK_DIR = join(".next", "static", "chunks");

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 1400, scale: 2 },
  { name: "tablet", width: 834, height: 1500, scale: 2 },
  { name: "laptop", width: 1440, height: 1400, scale: 1 },
  { name: "wide", width: 1920, height: 1400, scale: 1 },
];

function parseArguments(argv) {
  const options = {
    only: null,
    out: join("test-results", "newsroom-shots"),
    dir: "ltr",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];

    if (flag === "--only" && value !== undefined) {
      options.only = value.split(",").map((name) => name.trim()).filter(Boolean);
      index += 1;
    } else if (flag === "--out" && value !== undefined) {
      options.out = value;
      index += 1;
    } else if (flag === "--dir" && value !== undefined) {
      // The whole newsroom is written in logical properties, so an RTL pass is
      // a real check of that rather than a formality.
      options.dir = value === "rtl" ? "rtl" : "ltr";
      index += 1;
    }
  }

  return options;
}

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

/**
 * The application stylesheet, compiled from source.
 *
 * Tailwind v4 discovers its sources from the CSS file's own directory upward,
 * so this picks up every utility used by src/ exactly as the production build
 * does — including the arbitrary values the newsroom leans on.
 */
async function compileCss() {
  const from = join("src", "styles", "globals.css");
  const result = await postcss([tailwind()]).process(readFileSync(from, "utf8"), {
    from,
    to: "preview.css",
  });

  return result.css;
}

/**
 * The @font-face rules and the hashed next/font variable classes, recovered
 * from a build.
 *
 * Never hardcoded: the hash changes every build, and rendering the newsroom in
 * a fallback face would make every measure, wrap and spacing judgement wrong
 * while looking approximately right.
 */
function readBuiltFontCss() {
  let files;
  try {
    files = readdirSync(CHUNK_DIR).filter((name) => name.endsWith(".css"));
  } catch {
    throw new Error("No " + CHUNK_DIR + ". Run `pnpm build` once first.");
  }

  const css = files
    .map((name) => readFileSync(join(CHUNK_DIR, name), "utf8"))
    .join(NEWLINE);

  const faces = css.match(/@font-face\{[^}]*\}/g) ?? [];
  const variables = new Set();
  for (const match of css.matchAll(/\.([A-Za-z0-9_-]+__variable)\{[^}]*\}/g)) {
    variables.add(match[0]);
  }

  if (faces.length === 0 || variables.size === 0) {
    throw new Error(
      "No next/font faces or variable classes in the built CSS. Re-run `pnpm build`; " +
        "do not judge typography or spacing against this render.",
    );
  }

  return {
    css: [...faces, ...variables].join(NEWLINE),
    classes: [...variables]
      .map((rule) => (/\.([A-Za-z0-9_-]+__variable)/.exec(rule) ?? [])[1])
      .filter(Boolean)
      .join(" "),
  };
}

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

/**
 * A throwaway origin for the capture.
 *
 * The font files are referenced by the built CSS as `/_next/static/media/...`,
 * which `file://` cannot resolve, so the page is served rather than opened off
 * disk. It binds to the loopback interface only and is closed when the run ends.
 */
function startServer(routes) {
  const server = createServer((request, response) => {
    const path = (request.url ?? "/").split("?")[0];
    const body = routes.get(path);

    if (body === undefined) {
      response.writeHead(404).end();
      return;
    }

    response.writeHead(200, {
      "content-type": MIME[extname(path)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    response.end(body);
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: server.address().port });
    });
  });
}

function page(markup, fontClasses, dir) {
  return (
    '<!doctype html><html lang="en" dir="' +
    dir +
    '" class="' +
    fontClasses +
    '"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<link rel="stylesheet" href="/preview.css">' +
    "</head><body>" +
    markup +
    "</body></html>"
  );
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  let names;
  try {
    names = readdirSync(HTML_DIR)
      .filter((name) => name.endsWith(".html"))
      .map((name) => name.slice(0, -".html".length));
  } catch {
    throw new Error(
      [
        "No " + HTML_DIR + ".",
        "  Generate it: pnpm vitest run tests/harness/compose-newsroom-preview.test.ts tests/harness/compose-article-preview.test.ts",
      ].join(NEWLINE),
    );
  }

  if (options.only !== null) {
    names = names.filter((name) => options.only.includes(name));
  }

  if (names.length === 0) throw new Error("No preview markup matched.");

  const fonts = readBuiltFontCss();
  const css = (await compileCss()) + NEWLINE + fonts.css;

  const routes = new Map([["/preview.css", css]]);
  for (const name of names) {
    routes.set(
      "/" + name + ".html",
      page(
        readFileSync(join(HTML_DIR, name + ".html"), "utf8"),
        fonts.classes,
        options.dir,
      ),
    );
  }

  let media = [];
  try {
    media = readdirSync(MEDIA_DIR);
  } catch {
    // A build without font files is already caught by readBuiltFontCss.
  }
  for (const file of media) {
    routes.set("/_next/static/media/" + file, readFileSync(join(MEDIA_DIR, file)));
  }

  await mkdir(options.out, { recursive: true });

  const chromium = await loadChromium();
  const { server, port } = await startServer(routes);
  const browser = await chromium.launch();
  const captured = [];

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.scale,
      });

      for (const name of names) {
        const tab = await context.newPage();
        await tab.goto(
          "http://127.0.0.1:" + port + "/" + name + ".html",
          { waitUntil: "load" },
        );
        await tab.evaluate(() => document.fonts.ready);

        const overflow = await tab.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );

        const suffix = options.dir === "rtl" ? ".rtl" : "";
        const file = join(
          options.out,
          name + "." + viewport.name + suffix + ".png",
        );
        await tab.screenshot({ path: file, fullPage: true });
        captured.push({ file, overflow, viewport: viewport.name, name });
        await tab.close();
      }

      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  const overflowing = captured.filter((shot) => shot.overflow > 1);

  await writeFile(
    join(options.out, "index.json"),
    JSON.stringify({ captured }, null, 2) + NEWLINE,
    "utf8",
  );

  console.log("Captured " + captured.length + " screenshots into " + options.out);

  if (overflowing.length > 0) {
    console.error(
      "Horizontal overflow:" +
        NEWLINE +
        overflowing
          .map((shot) => "  " + shot.name + " @ " + shot.viewport + ": +" + shot.overflow + "px")
          .join(NEWLINE),
    );
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
