#!/usr/bin/env node
/**
 * THE SIRA RECORD — prototype vs production measurement.
 *
 * Loads the approved HTML prototype and the corresponding production route in
 * the same browser at the same viewports, measures the same landmarks on both,
 * and reports the delta. The point is to stop judging fidelity by eye: a
 * headline that "looks about right" can be 40px off, and a register that reads
 * as three columns can be three columns of the wrong width.
 *
 * The prototype's development-only chrome (the route bar and the content-type
 * switcher, which the brief says not to ship) is measured separately and
 * excluded from the page-height comparison, rather than silently inflating the
 * prototype side of every delta.
 *
 * Usage:
 *   pnpm build && pnpm start -p 3100      # in another shell
 *   node scripts/compare-record.mjs [--out <dir>] [--base http://localhost:3100]
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const NEWLINE = String.fromCharCode(10);
const VIEWPORTS = [390, 768, 1024, 1440, 1920];

function arg(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? fallback : process.argv[index + 1];
}

const BASE = arg("--base", "http://localhost:3100");
const OUT = arg("--out", join("..", "artifacts", "editorial", "compare"));

/**
 * What to measure, and where it lives on each side.
 *
 * `proto` and `prod` are CSS selectors against two different DOMs that express
 * the same design idea. Keeping them side by side in one table is what makes a
 * drift reviewable rather than archaeological.
 */
const PAGES = [
  {
    id: "newsroom",
    proto: "../.local-reference/editorial/newsroom.html",
    prod: "/news",
    /** Prototype-only chrome, excluded from the height comparison. */
    protoChrome: [],
    metrics: [
      { key: "sheet", proto: ".shell", prod: ".record-shell" },
      { key: "masthead", proto: ".mast", prod: "header:has(#record-heading)" },
      { key: "mastheadTitle", proto: ".mast .serif", prod: "#record-heading" },
      { key: "filters", proto: ".filters", prod: "nav[aria-label*=Filter]" },
      { key: "lead", proto: ".lead", prod: ".record-split" },
      { key: "leadHeadline", proto: ".lead-main .serif", prod: ".record-split h2" },
      { key: "signal", proto: ".lead-side", prod: ".record-signal" },
      { key: "deskHead", proto: ".desk-head", prod: ".record-aside" },
      { key: "register", proto: ".grid", prod: ".record-register" },
      { key: "storyCell", proto: ".story", prod: ".record-cell" },
      { key: "storyTitle", proto: ".story .title", prod: ".record-cell h2, .record-cell h3" },
      { key: "yearBand", proto: ".year-row", prod: "div:has(> h3[id^=record-year])" },
      { key: "endBar", proto: ".footer", prod: ".record-shell .bg-brand-deep" },
    ],
  },
  {
    id: "article",
    proto: "../.local-reference/editorial/article.html",
    prod: "/insights/what-we-underwrite/",
    protoChrome: [".routebar", ".switches"],
    metrics: [
      { key: "sheet", proto: ".shell", prod: ".record-shell" },
      { key: "masthead", proto: ".mast", prod: "article > header" },
      { key: "hero", proto: ".hero", prod: ".record-split" },
      { key: "heroHeadline", proto: ".hero-main .serif", prod: ".record-split h1" },
      { key: "deck", proto: ".deck", prod: ".record-split h1 + p" },
      { key: "signal", proto: ".hero .signal", prod: ".record-signal" },
      { key: "body", proto: ".bodywrap", prod: ".record-body" },
      { key: "rail", proto: ".rail", prod: ".record-body > aside" },
      { key: "prose", proto: ".article", prod: ".record-prose" },
      { key: "proseLine", proto: ".article p", prod: ".record-prose p" },
      { key: "related", proto: ".related", prod: ".record-register" },
    ],
  },
];

/**
 * Measures one landmark: the first match's box, how many matched, and the
 * resolved column count where the element is a grid. Columns are read from the
 * computed style rather than inferred from child positions, so a wrapped flex
 * row can never masquerade as a grid.
 *
 * Serialised as a string because it is evaluated inside the page, on both a
 * file:// prototype and the production origin.
 */
const MEASURE = [
  "(selector) => {",
  "  const nodes = Array.from(document.querySelectorAll(selector));",
  "  if (nodes.length === 0) return null;",
  "  const first = nodes[0];",
  "  const box = first.getBoundingClientRect();",
  "  const style = getComputedStyle(first);",
  "  const columns = style.gridTemplateColumns;",
  "  return {",
  "    count: nodes.length,",
  "    width: Math.round(box.width),",
  "    height: Math.round(box.height),",
  "    columns: columns === 'none' ? null : columns.split(' ').length,",
  "    fontSize: Math.round(parseFloat(style.fontSize) * 10) / 10,",
  "  };",
  "}",
].join(NEWLINE);

async function capture(browser, url, width, selectors, chromeSelectors, shot) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  const measured = await page.evaluate(
    ([expression, pairs, chrome]) => {
      const measureOne = new Function("return " + expression)();
      const boxes = {};
      for (const [name, selector] of pairs) {
        try {
          boxes[name] = measureOne(selector);
        } catch {
          // An invalid selector is a fault in the spec, not in the page.
          boxes[name] = { error: "invalid selector" };
        }
      }

      let chromeHeight = 0;
      for (const selector of chrome) {
        for (const node of document.querySelectorAll(selector)) {
          chromeHeight += node.getBoundingClientRect().height;
        }
      }

      const root = document.documentElement;
      return {
        boxes,
        documentHeight: root.scrollHeight,
        chromeHeight: Math.round(chromeHeight),
        overflow: Math.max(0, root.scrollWidth - root.clientWidth),
      };
    },
    [MEASURE, selectors, chromeSelectors],
  );

  await page.screenshot({ path: shot, fullPage: true });
  await page.close();
  return measured;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const report = [];

  for (const spec of PAGES) {
    const protoUrl = pathToFileURL(resolve(spec.proto)).href;
    const prodUrl = new URL(spec.prod, BASE).href;

    for (const width of VIEWPORTS) {
      const proto = await capture(
        browser,
        protoUrl,
        width,
        spec.metrics.map((metric) => [metric.key, metric.proto]),
        spec.protoChrome,
        join(OUT, `${spec.id}-proto-${width}.png`),
      );
      const prod = await capture(
        browser,
        prodUrl,
        width,
        spec.metrics.map((metric) => [metric.key, metric.prod]),
        [],
        join(OUT, `${spec.id}-prod-${width}.png`),
      );

      // The prototype's dev-only chrome is not part of the design being
      // reproduced, so it comes off the prototype's height before comparing.
      const protoHeight = proto.documentHeight - proto.chromeHeight;
      const drift = ((prod.documentHeight / protoHeight - 1) * 100).toFixed(1);

      report.push({
        page: spec.id,
        viewport: width,
        protoHeight,
        prodHeight: prod.documentHeight,
        driftPercent: Number(drift),
        overflow: { proto: proto.overflow, prod: prod.overflow },
        metrics: spec.metrics.map((metric) => ({
          key: metric.key,
          proto: proto.boxes[metric.key],
          prod: prod.boxes[metric.key],
        })),
      });

      console.log(
        `${spec.id} @${width}  proto ${protoHeight}  prod ${prod.documentHeight}  ${drift}%  overflow ${proto.overflow}/${prod.overflow}`,
      );
    }
  }

  await browser.close();
  await writeFile(join(OUT, "report.json"), JSON.stringify(report, null, 2) + NEWLINE);
  console.log(`${NEWLINE}Wrote ${join(OUT, "report.json")}`);
}

await main();
