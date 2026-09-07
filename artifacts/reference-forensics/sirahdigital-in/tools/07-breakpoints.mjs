#!/usr/bin/env node
/**
 * Breakpoint sweep.
 *
 * Resizes one loaded page across a continuous width range and records the
 * values that actually change, so the real breakpoints are found instead of
 * being assumed from a framework's defaults.
 *
 * Writes: data/breakpoints.json
 */
import { writeFile } from "node:fs/promises";
import { chromium, ORIGIN, outPath } from "./_browser.mjs";

const route = process.argv[2] || "/";
const START = 320;
const END = 1920;
const STEP = 20;

const READ = () => {
  const px = (v) => Math.round(Number.parseFloat(v) || 0);
  const header = document.querySelector("header");
  const inner = header ? header.querySelector(":scope > *") : null;
  const nav = header ? header.querySelector("nav") : null;
  const toggle = header ? header.querySelector("button[aria-label]") : null;
  const main = document.querySelector("main") || document.body;
  const sections = Array.from(main.children).filter((el) => el.getBoundingClientRect().height > 24);
  const hero = sections[0] || null;
  const heroH1 = hero ? hero.querySelector("h1") : null;
  const heroContainer = hero ? hero.querySelector(":scope > div") : null;
  const grid = document.querySelector("[class*='home-products_block'], .grid");
  const s = (el) => (el ? getComputedStyle(el) : null);
  return {
    width: window.innerWidth,
    headerPadX: header ? px(s(header).paddingLeft) : null,
    headerInnerMax: inner ? s(inner).maxWidth : null,
    navDisplay: nav ? s(nav).display : null,
    navVisibleLinks: nav ? Array.from(nav.querySelectorAll("a")).filter((a) => a.getBoundingClientRect().width > 0).length : 0,
    toggleDisplay: toggle ? s(toggle).display : null,
    toggleVisible: toggle ? toggle.getBoundingClientRect().width > 0 : null,
    heroMinHeight: hero ? s(hero).minHeight : null,
    heroPadTop: hero ? px(s(hero).paddingTop) : null,
    heroAlign: hero ? s(hero).alignItems : null,
    heroContainerMax: heroContainer ? s(heroContainer).maxWidth : null,
    heroContainerPadX: heroContainer ? px(s(heroContainer).paddingLeft) : null,
    h1Size: heroH1 ? px(s(heroH1).fontSize) : null,
    h1LineHeight: heroH1 ? px(s(heroH1).lineHeight) : null,
    productGridColumns: grid ? s(grid).gridTemplateColumns : null,
    productGridCount: grid ? s(grid).gridTemplateColumns.split(" ").filter(Boolean).length : null,
    sectionPads: sections.slice(0, 6).map((el) => `${px(s(el).paddingTop)}/${px(s(el).paddingBottom)}`),
    docHeight: document.documentElement.scrollHeight,
  };
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: END, height: 900 } });
const page = await ctx.newPage();
await page.goto(ORIGIN + route, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1500);

const samples = [];
for (let w = START; w <= END; w += STEP) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(140);
  samples.push(await page.evaluate(READ));
}

// Derive the widths at which any tracked value changes.
const keys = Object.keys(samples[0]).filter((k) => k !== "width" && k !== "docHeight");
const changes = [];
for (let i = 1; i < samples.length; i += 1) {
  for (const k of keys) {
    const a = JSON.stringify(samples[i - 1][k]);
    const b = JSON.stringify(samples[i][k]);
    if (a !== b) changes.push({ atWidth: samples[i].width, previousWidth: samples[i - 1].width, key: k, from: samples[i - 1][k], to: samples[i][k] });
  }
}

await writeFile(outPath("data", "breakpoints.json"), JSON.stringify({ route, step: STEP, samples, changes }, null, 2), "utf8");
console.log(`breakpoints.json  samples=${samples.length}  changes=${changes.length}`);
for (const c of changes) console.log(`  ${c.previousWidth}->${c.atWidth}  ${c.key}: ${JSON.stringify(c.from)} -> ${JSON.stringify(c.to)}`.slice(0, 200));
await browser.close();
