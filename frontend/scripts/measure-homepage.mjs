#!/usr/bin/env node
/**
 * Measure OUR homepage the same way scripts/measure-reference.mjs measures the
 * approved reference, so the two are directly comparable.
 *
 * It drives the REAL route on a running server (`pnpm start`), which means the
 * numbers come from the production query documents, normalizers and components
 * against live CMS data — not from a fixture render.
 *
 * Usage:
 *   pnpm build && pnpm start -p 3100
 *   node scripts/measure-homepage.mjs [--url http://localhost:3100/] [--only 1440]
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback);
}

const PROBE = () => {
  const px = (v) => Math.round(Number.parseFloat(v) || 0);
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      y: Math.round(r.y + window.scrollY),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  };
  const box = (el) => {
    const s = getComputedStyle(el);
    return {
      display: s.display,
      gridTemplateColumns: s.gridTemplateColumns,
      gap: s.gap,
      padding: `${px(s.paddingTop)} ${px(s.paddingRight)} ${px(s.paddingBottom)} ${px(s.paddingLeft)}`,
      maxWidth: s.maxWidth,
      background: s.backgroundColor,
    };
  };
  const type = (el) => {
    const s = getComputedStyle(el);
    return {
      fontFamily: s.fontFamily.split(",")[0].replaceAll('"', ""),
      fontSize: px(s.fontSize),
      lineHeight: s.lineHeight === "normal" ? "normal" : px(s.lineHeight),
      fontWeight: s.fontWeight,
      letterSpacing:
        s.letterSpacing === "normal" ? 0 : Number.parseFloat(s.letterSpacing).toFixed(2),
      color: s.color,
    };
  };

  const all = (sel) => [...document.querySelectorAll(sel)];
  const header = document.querySelector("header");
  const sections = all("section, footer")
    .filter((el) => el.getBoundingClientRect().height > 80)
    .map((el) => {
      const label =
        (el.getAttribute("aria-label") ?? "").trim() ||
        (el.querySelector("h1,h2,h3")?.textContent ?? "").trim().slice(0, 50) ||
        el.tagName.toLowerCase();
      return { label, tag: el.tagName, ...rect(el), box: box(el) };
    });

  const grids = all("*")
    .filter((el) => {
      const s = getComputedStyle(el);
      return (
        s.display === "grid" &&
        el.children.length >= 2 &&
        el.getBoundingClientRect().width > 300
      );
    })
    .slice(0, 40)
    .map((el) => ({
      children: el.children.length,
      ...rect(el),
      cols: getComputedStyle(el).gridTemplateColumns,
      gap: getComputedStyle(el).gap,
      firstChildText: (el.children[0]?.textContent ?? "").trim().slice(0, 40),
    }));

  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    documentHeight: document.documentElement.scrollHeight,
    horizontalOverflow:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    header: header === null ? null : { ...rect(header), box: box(header) },
    headings: all("h1,h2,h3").map((el) => ({
      tag: el.tagName,
      text: (el.textContent ?? "").trim().slice(0, 70),
      ...rect(el),
      type: type(el),
    })),
    sections,
    grids,
  };
};

async function main() {
  const url = argument("url", "http://localhost:3100/");
  const out = argument("out", join("..", "artifacts", "homepage-fidelity", "ours"));
  const only = argument("only", null);
  const viewports = only === null ? VIEWPORTS : VIEWPORTS.filter((v) => v.name === only);

  await mkdir(out, { recursive: true });

  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch();
  const summary = [];

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 100));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(600);

      const measured = await page.evaluate(PROBE);
      await page.screenshot({ path: join(out, `${viewport.name}.png`), fullPage: true });
      await writeFile(
        join(out, `${viewport.name}.json`),
        JSON.stringify(measured, null, 2) + "\n",
        "utf8",
      );

      summary.push({
        viewport: viewport.name,
        documentHeight: measured.documentHeight,
        overflow: measured.horizontalOverflow,
        headerHeight: measured.header?.h ?? null,
      });

      console.log(
        `${viewport.name.padStart(4)}  doc=${String(measured.documentHeight).padStart(6)}  ` +
          `header=${String(measured.header?.h ?? "?").padStart(3)}  ` +
          `overflow=${measured.horizontalOverflow}`,
      );

      await context.close();
    }
  } finally {
    await browser.close();
  }

  await writeFile(
    join(out, "summary.json"),
    JSON.stringify({ url, capturedAt: new Date().toISOString(), summary }, null, 2) + "\n",
    "utf8",
  );
  console.log(`\nWrote homepage captures to ${out}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
