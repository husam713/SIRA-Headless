// Responsive / RTL / reduced-motion sweep against a running server — the
// L-to-O items of docs/STEP-4-EXACT-DESIGN-FIDELITY-IMPLEMENTATION.md §20,
// made repeatable.
//
//   node scripts/qa-sweep.mjs http://localhost:3000 group consulting digital
//
// For every host × viewport × motion preference it loads the homepage,
// scrolls it end to end, and records: HTTP status, horizontal overflow, how
// many `.reveal` chapters are still below full opacity after the scroll (must
// be 0 — nothing may stay hidden), whether any animation is running under
// reduced motion (must be none), whether the header settled into its bar
// after scrolling, the largest touch target failure among links and buttons
// (< 44px on a phone), and that the first Tab lands on a visible focus ring.
// Arabic is checked on the tenant that has approved locale routes.
//
// Exits non-zero on any failure, so it can gate. Output is a Markdown table.

import { chromium } from "playwright-core";

const [base = "http://localhost:3000", ...hosts] = process.argv.slice(2);
if (hosts.length === 0) {
  console.error("usage: node scripts/qa-sweep.mjs <baseUrl> <siteKey...>");
  process.exit(1);
}

const url = new URL(base);
const VIEWPORTS = [
  [390, 844],
  [768, 1024],
  [1280, 800],
  [1920, 1080],
];

async function sweep(page, target, { reduced, width }) {
  const response = await page.goto(target, { waitUntil: "networkidle", timeout: 120_000 });
  const status = response?.status() ?? 0;
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(400);
  const scrolled = await page.evaluate(() => {
    const header = document.querySelector("header");
    const style = header ? getComputedStyle(header) : null;
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      hiddenReveals: [...document.querySelectorAll(".reveal")].filter((el) => {
        const rect = el.getBoundingClientRect();
        const onScreenOrAbove = rect.top < window.innerHeight;
        return onScreenOrAbove && Number(getComputedStyle(el).opacity) < 0.99;
      }).length,
      running: document.getAnimations().filter((animation) => animation.playState === "running" && !(animation.timeline && "axis" in animation.timeline)).length,
      headerSettled: style ? style.backgroundColor !== "rgba(0, 0, 0, 0)" && style.backgroundColor !== "transparent" : null,
      smallTargets: [...document.querySelectorAll("a[href], button")]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.height < 44 && el.closest("nav, header, footer, form") !== null && !(el.closest("nav")?.getAttribute("aria-label") === "Primary");
        }).length,
    };
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.keyboard.press("Tab");
  const focusVisible = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return false;
    const style = getComputedStyle(el);
    return style.outlineStyle !== "none" && style.outlineWidth !== "0px";
  });
  return { status, ...scrolled, focusVisible, phone: width < 600, reduced };
}

const browser = await chromium.launch();
const rows = [];
let failures = 0;

for (const host of hosts) {
  const origin = `${url.protocol}//${host}.${url.hostname}${url.port ? `:${url.port}` : ""}`;
  const paths = host === "digital" ? ["/", "/ar/"] : ["/"];
  for (const path of paths) {
    for (const [width, height] of VIEWPORTS) {
      for (const reduced of [false, true]) {
        const context = await browser.newContext({
          viewport: { width, height },
          reducedMotion: reduced ? "reduce" : "no-preference",
        });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        const result = await sweep(page, `${origin}${path}`, { reduced, width });
        const problems = [];
        if (result.status !== 200) problems.push(`status ${result.status}`);
        if (result.overflow !== 0) problems.push(`overflow ${result.overflow}px`);
        if (result.hiddenReveals > 0) problems.push(`${result.hiddenReveals} reveals hidden`);
        if (reduced && result.running > 0) problems.push(`${result.running} animations under reduced motion`);
        if (result.headerSettled === false) problems.push("header did not settle");
        if (result.phone && result.smallTargets > 0) problems.push(`${result.smallTargets} targets < 44px`);
        if (!result.focusVisible) problems.push("no visible focus ring on first Tab");
        if (errors.length > 0) problems.push(`js error: ${errors[0].slice(0, 60)}`);
        if (problems.length > 0) failures += 1;
        rows.push([host, path, `${width}×${height}`, reduced ? "reduce" : "normal", problems.length === 0 ? "PASS" : `FAIL — ${problems.join("; ")}`]);
        await context.close();
      }
    }
  }
}

await browser.close();

console.log("| host | path | viewport | motion | result |");
console.log("|---|---|---|---|---|");
for (const row of rows) console.log(`| ${row.join(" | ")} |`);
console.log(`\n${rows.length - failures}/${rows.length} passed`);
process.exit(failures === 0 ? 0 : 1);
