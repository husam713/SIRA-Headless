#!/usr/bin/env node
/**
 * Measure the approved homepage reference.
 *
 * The reference is a design-canvas `.dc.html` served from Vercel. It is a
 * VISUAL BENCHMARK: this script reads geometry and computed styles out of it so
 * the production implementation can be built to measured numbers rather than to
 * a guess from a screenshot. It copies no source.
 *
 * Writes, per viewport:
 *   artifacts/homepage-fidelity/reference/<vp>.png            full page
 *   artifacts/homepage-fidelity/reference/<vp>.section.*.png  each section
 *   artifacts/homepage-fidelity/reference/<vp>.json           measurements
 *
 * Usage:
 *   node scripts/measure-reference.mjs [--url <href>] [--out <dir>] [--only 1440]
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DEFAULT_URL =
  "https://sira-enterprise-o1ykhvni7-husam713s-projects.vercel.app/SIRA%20Group%20Homepage.dc.html";

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

async function loadChromium() {
  try {
    const playwright = await import("playwright-core");
    return playwright.chromium;
  } catch {
    throw new Error("playwright-core is missing. Run `pnpm install`.");
  }
}

/**
 * Runs inside the page.
 *
 * Reports geometry and the computed styles that actually drive composition, so
 * the production side can be corrected against numbers instead of impressions.
 */
const PROBE = () => {
  const px = (value) => Math.round(Number.parseFloat(value) || 0);
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      y: Math.round(r.y + window.scrollY),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  };

  const type = (el) => {
    const s = getComputedStyle(el);
    return {
      fontFamily: s.fontFamily.split(",")[0].replaceAll('"', ""),
      fontSize: px(s.fontSize),
      lineHeight:
        s.lineHeight === "normal" ? "normal" : px(s.lineHeight),
      fontWeight: s.fontWeight,
      letterSpacing: s.letterSpacing === "normal" ? 0 : Number.parseFloat(s.letterSpacing).toFixed(2),
      textTransform: s.textTransform,
      color: s.color,
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
      aspectRatio: s.aspectRatio,
    };
  };

  const first = (selector) => document.querySelector(selector);
  const all = (selector) => [...document.querySelectorAll(selector)];

  // Sections are identified by their visible eyebrow / heading text rather than
  // by class names, because the canvas runtime's classes are not a contract.
  const headings = all("h1, h2, h3").map((el) => ({
    tag: el.tagName,
    text: (el.textContent ?? "").trim().slice(0, 70),
    ...rect(el),
    type: type(el),
  }));

  const sections = all("section, header, footer, [class*='section']")
    .filter((el) => el.getBoundingClientRect().height > 120)
    .map((el) => {
      const label =
        (el.querySelector("h1,h2,h3")?.textContent ?? "").trim().slice(0, 50) ||
        el.tagName.toLowerCase();
      return { label, tag: el.tagName, ...rect(el), box: box(el) };
    });

  const header = first("header");
  const hero = all("section").find((el) => el.getBoundingClientRect().top < 200 && el.getBoundingClientRect().height > 300);

  const grids = all("*")
    .filter((el) => {
      const s = getComputedStyle(el);
      return s.display === "grid" && el.children.length >= 2 && el.getBoundingClientRect().width > 300;
    })
    .slice(0, 40)
    .map((el) => ({
      children: el.children.length,
      ...rect(el),
      cols: getComputedStyle(el).gridTemplateColumns,
      gap: getComputedStyle(el).gap,
      firstChildText: (el.children[0]?.textContent ?? "").trim().slice(0, 40),
    }));

  const images = all("img").map((el) => ({
    ...rect(el),
    alt: el.getAttribute("alt"),
    natural: `${el.naturalWidth}x${el.naturalHeight}`,
    objectFit: getComputedStyle(el).objectFit,
  }));

  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    documentHeight: document.documentElement.scrollHeight,
    horizontalOverflow:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    header: header === null ? null : { ...rect(header), box: box(header) },
    hero: hero === undefined ? null : { ...rect(hero), box: box(hero) },
    headings,
    sections,
    grids,
    images: images.slice(0, 40),
    bodyFont: getComputedStyle(document.body).fontFamily,
  };
};

async function main() {
  const url = argument("url", DEFAULT_URL);
  const out = argument("out", join("..", "artifacts", "homepage-fidelity", "reference"));
  const only = argument("only", null);

  const viewports =
    only === null ? VIEWPORTS : VIEWPORTS.filter((v) => v.name === only);

  await mkdir(out, { recursive: true });

  const chromium = await loadChromium();
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
      // The canvas runtime hydrates templated content after load; without this
      // every measurement is taken against unpopulated placeholders.
      await page.waitForTimeout(3500);
      await page.evaluate(() => document.fonts.ready);

      // Scroll the whole page once so lazy content and any scroll-triggered
      // state settles, then return to the top for the capture.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(800);

      const measured = await page.evaluate(PROBE);

      await page.screenshot({
        path: join(out, `${viewport.name}.png`),
        fullPage: true,
      });

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
        heroHeight: measured.hero?.h ?? null,
        sections: measured.sections.length,
      });

      console.log(
        `${viewport.name.padStart(4)}  doc=${String(measured.documentHeight).padStart(6)}  ` +
          `header=${String(measured.header?.h ?? "?").padStart(3)}  ` +
          `hero=${String(measured.hero?.h ?? "?").padStart(4)}  ` +
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

  console.log(`\nWrote reference captures to ${out}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
