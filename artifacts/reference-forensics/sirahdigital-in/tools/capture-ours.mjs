#!/usr/bin/env node
/**
 * Captures the SIRA Digital implementation at the audited viewports, so it can
 * be compared against the Phase 1 reference measurements taken the same way.
 *
 * Writes: screens/ours-<route>--<vp>.png and data/ours-<route>--<vp>.json
 *
 * Usage: node tools/capture-ours.mjs [--base http://digital.localhost:3000] [--route /]
 */
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, VIEWPORTS, outPath } from "./_browser.mjs";

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback);
}

const base = argument("base", "http://digital.localhost:3000");
const routes = (argument("route", "/") ?? "/").split(",");
const only = argument("vp", null);
const viewports = VIEWPORTS.filter((v) => only === null || only.split(",").includes(v.name));

const PROBE = () => {
  const round = (n) => Math.round(n * 10) / 10;
  const px = (v) => Math.round(Number.parseFloat(v) || 0);
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const type = (el) => {
    const s = getComputedStyle(el);
    return {
      size: px(s.fontSize),
      lineHeight: s.lineHeight === "normal" ? "normal" : px(s.lineHeight),
      weight: s.fontWeight,
      tracking: s.letterSpacing === "normal" ? 0 : round(Number.parseFloat(s.letterSpacing) / px(s.fontSize) * 1000) / 1000,
      transform: s.textTransform,
      color: s.color,
    };
  };
  const main = document.querySelector("main") || document.body;
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");

  return {
    url: location.pathname,
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    brandKey: document.documentElement.dataset["brandKey"] ?? null,
    brandSource: document.documentElement.dataset["brandSource"] ?? null,
    docHeight: Math.round(document.documentElement.scrollHeight),
    viewport: { w: window.innerWidth, h: window.innerHeight },
    screens: Math.round((document.documentElement.scrollHeight / window.innerHeight) * 100) / 100,
    horizontalOverflow: document.body.scrollWidth - window.innerWidth,
    ground: getComputedStyle(document.body).backgroundColor,
    header: header
      ? { height: round(header.getBoundingClientRect().height), navLinks: header.querySelectorAll("nav a").length }
      : null,
    footer: footer
      ? { height: round(footer.getBoundingClientRect().height), links: footer.querySelectorAll("a").length }
      : null,
    sections: Array.from(main.children)
      .filter((el) => el.getBoundingClientRect().height > 24)
      .map((el, index) => {
        const r = el.getBoundingClientRect();
        const heading = el.querySelector("h1,h2,h3");
        return {
          index: index + 1,
          startY: round(r.y + window.scrollY),
          endY: round(r.y + window.scrollY + r.height),
          height: round(r.height),
          screens: Math.round((r.height / window.innerHeight) * 100) / 100,
          heading: heading === null ? null : clean(heading.textContent).slice(0, 60),
          headingType: heading === null ? null : type(heading),
        };
      }),
    h1: (() => {
      const h = document.querySelector("h1");
      return h === null ? null : { text: clean(h.textContent).slice(0, 90), ...type(h) };
    })(),
    headingOrder: Array.from(document.querySelectorAll("h1,h2,h3,h4")).map((h) => h.tagName),
  };
};

await mkdir(outPath("screens"), { recursive: true });
const browser = await chromium.launch();

for (const route of routes) {
  const slug = route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "-");

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: false,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const response = await page.goto(base + route, { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1200);
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.6;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 110));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 350));
    });

    const data = await page.evaluate(PROBE);
    data.status = response?.status() ?? null;

    await writeFile(outPath("data", `ours-${slug}--${vp.name}.json`), JSON.stringify(data, null, 2), "utf8");
    await page.screenshot({ path: outPath("screens", `ours-${slug}--${vp.name}.png`), fullPage: true });

    console.log(
      `${slug} @${vp.name}  ${String(data.status)}  doc=${String(data.docHeight)} (${String(data.screens)} screens)  ` +
        `overflow=${String(data.horizontalOverflow)}  sections=${String(data.sections.length)}  brand=${String(data.brandSource)}`,
    );
    await context.close();
  }
}

await browser.close();
