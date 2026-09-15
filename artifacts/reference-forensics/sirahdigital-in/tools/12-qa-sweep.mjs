#!/usr/bin/env node
/**
 * The browser QA pass Phase 3 owed and Phase 4 carried over.
 *
 * Five routes x two languages x six viewports, rendered by the real Next.js
 * application against the REAL live CMS through `tools/graphql-ssh-proxy.mjs`
 * (ADR-032: a direct fetch from this machine's egress gets a bot challenge, so
 * the transport is substituted and nothing else is). Nothing here is stubbed:
 * real routes, real query documents, real normalizers, real components.
 *
 * What it measures, and why each one is a real failure mode rather than a box:
 *
 *   - horizontal overflow, with the offending elements named. A page that
 *     scrolls sideways on a phone is broken, and "0px" alone does not tell the
 *     next person which element to fix when it stops being 0.
 *   - density, so it can be compared against the Phase 1 reference figures for
 *     the same route at the same viewport, rather than against an impression.
 *   - direction and language on the document element, because RTL that is
 *     merely styled and not declared breaks selection, spellcheck and forms.
 *   - control size, because the calculator is the one place on this site with
 *     eight interactive controls in a column.
 *   - a reduced-motion run, asserting that with the preference set nothing is
 *     still animating. The whole digital layer is gated on that query and an
 *     ungated rule is invisible until somebody who needs it arrives.
 *
 * Read-only. It navigates and screenshots; it submits nothing.
 *
 * Usage:
 *   node tools/12-qa-sweep.mjs [--base http://digital.localhost:3000]
 *   node tools/12-qa-sweep.mjs --route /contact/ --locale en --vp 390
 *
 * With any filter set the run merges into the existing qa-sweep.json rather
 * than replacing it, so one bad capture can be re-shot without re-shooting all
 * sixty.
 *
 * Writes: data/qa-sweep.json, plus screens/qa-*.png (gitignored).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { chromium, VIEWPORTS, outPath } from "./_browser.mjs";

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback);
}

const base = argument("base", "http://digital.localhost:3000");

// Filters, so one bad capture can be re-shot without re-shooting sixty. With
// any of them set the run MERGES into the existing qa-sweep.json instead of
// replacing it, and the totals are recomputed over the merged set.
const onlyRoutes = argument("route", null);
const onlyLocales = argument("locale", null);
const onlyViewports = argument("vp", null);
const filtered = onlyRoutes !== null || onlyLocales !== null || onlyViewports !== null;
const wanted = (value, list) => list === null || list.split(",").includes(value);

/** Route, and the key the Phase 1 reference density file uses for it. */
const ROUTES = [
  { path: "/about/", slug: "about", reference: "about" },
  { path: "/services/", slug: "services", reference: "services" },
  { path: "/industries/", slug: "industries", reference: "industries" },
  {
    path: "/industries/healthcare/",
    slug: "industries-healthcare",
    reference: "industries-healthcare",
  },
  { path: "/contact/", slug: "contact", reference: "contact" },
];

const LOCALES = [
  { code: "en", prefix: "", dir: "ltr" },
  { code: "ar", prefix: "/ar", dir: "rtl" },
];

const PROBE = () => {
  const round = (n) => Math.round(n * 10) / 10;
  const px = (v) => Math.round(Number.parseFloat(v) || 0);
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const root = document.documentElement;
  const width = root.clientWidth;

  // Opacity counts. Without it the contact form's honeypot — an `opacity-0`,
  // `tabIndex=-1`, `aria-hidden` input that only a bot ever reaches — is
  // reported as a 24px tap target, which is a false positive that would bury a
  // real one.
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    if (Number.parseFloat(s.opacity) < 0.01) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  /** Reachable by a person: visible, focusable, and not hidden from AT. */
  const reachable = (el) =>
    visible(el) &&
    el.tabIndex >= 0 &&
    el.closest('[aria-hidden="true"]') === null &&
    el.closest("[hidden]") === null;

  const describe = (el) =>
    `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}` +
    `${typeof el.className === "string" && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}` : ""}`;

  // Which elements actually stick out. Reported only when the document really
  // overflows, so a page that is fine does not carry a list of near-misses.
  const offenders = [];
  const documentOverflow = Math.max(
    root.scrollWidth - width,
    document.body.scrollWidth - width,
  );
  if (documentOverflow > 0) {
    for (const el of document.querySelectorAll("body *")) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      const over = Math.max(round(r.right - width), round(-r.left));
      if (over > 1) offenders.push({ element: describe(el), over });
    }
    offenders.sort((a, b) => b.over - a.over);
  }

  const controls = [];
  for (const el of document.querySelectorAll(
    'button, select, input, [role="button"], a[class*="btn"]',
  )) {
    if (!reachable(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.height < 44 - 0.5) {
      controls.push({ element: describe(el), height: round(r.height) });
    }
  }

  // Anything still moving. Under prefers-reduced-motion this list must be
  // empty; the run without the preference is the control that proves the query
  // is what emptied it rather than the motion never having existed.
  const animating = [];
  for (const el of document.querySelectorAll("body *")) {
    const s = getComputedStyle(el);
    const durations = [s.transitionDuration, s.animationDuration]
      .join(",")
      .split(",")
      .map((d) => Number.parseFloat(d) || 0);
    if (durations.some((d) => d > 0.05)) {
      const properties = `${s.transitionProperty} ${s.animationName}`;
      animating.push({ element: describe(el), properties: clean(properties).slice(0, 60) });
    }
  }

  const main = document.querySelector("main") || document.body;
  const heading = document.querySelector("h1");

  return {
    lang: root.lang,
    dir: root.dir || getComputedStyle(root).direction,
    brandKey: root.dataset["brandKey"] ?? null,
    brandSource: root.dataset["brandSource"] ?? null,
    viewport: { w: window.innerWidth, h: window.innerHeight },
    docHeight: Math.round(root.scrollHeight),
    screensTall: Math.round((root.scrollHeight / window.innerHeight) * 100) / 100,
    horizontalOverflow: documentOverflow,
    overflowOffenders: offenders.slice(0, 6),
    smallControls: controls.slice(0, 8),
    smallControlCount: controls.length,
    animatingCount: animating.length,
    animating: animating.slice(0, 6),
    sections: Array.from(main.children).filter(
      (el) => el.getBoundingClientRect().height > 24,
    ).length,
    h1:
      heading === null
        ? null
        : {
            text: clean(heading.textContent).slice(0, 70),
            size: px(getComputedStyle(heading).fontSize),
            lineHeight: px(getComputedStyle(heading).lineHeight),
          },
    headingOrder: Array.from(document.querySelectorAll("h1,h2,h3,h4"))
      .map((h) => h.tagName)
      .join(" "),
  };
};

async function settle(page) {
  await page.waitForTimeout(900);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
}

await mkdir(outPath("screens"), { recursive: true });

let reference = {};
try {
  reference = JSON.parse(readFileSync(outPath("data", "density.json"), "utf8"));
} catch {
  reference = {};
}

const browser = await chromium.launch();
const results = [];
const reducedMotion = [];

for (const locale of LOCALES.filter((l) => wanted(l.code, onlyLocales))) {
  for (const route of ROUTES.filter((r) => wanted(r.path, onlyRoutes))) {
    for (const vp of VIEWPORTS.filter((v) => wanted(v.name, onlyViewports))) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const url = `${base}${locale.prefix}${route.path}`;

      // A capture with no `h1` is not a short page, it is a FAILED page. The
      // development SSH transport spawns a shell per request and times out under
      // a sweep this size; the application's partial-data path then renders a
      // shell with nothing in it, which measures as a page a fifth of its real
      // height. That is how a broken reading becomes a recorded density fact,
      // so it is retried, and flagged if it never resolves.
      let data = null;
      let response = null;
      let attempt = 0;
      for (; attempt < 3; attempt += 1) {
        response = await page.goto(url, { waitUntil: "load", timeout: 180_000 });
        await settle(page);
        data = await page.evaluate(PROBE);
        if (data.h1 !== null) break;
        console.log(`  retry ${locale.code} ${route.slug} @${vp.name}: no h1, partial render`);
      }
      data.attempts = attempt + 1;
      data.degraded = data.h1 === null;
      data.status = response?.status() ?? null;
      data.route = route.path;
      data.locale = locale.code;
      data.viewportName = vp.name;

      const referenceDensity = reference[route.reference]?.[vp.name] ?? null;
      data.reference =
        referenceDensity === null
          ? null
          : {
              docHeight: referenceDensity.docHeight,
              screensTall: referenceDensity.screensTall,
              deltaScreens:
                Math.round((data.screensTall - referenceDensity.screensTall) * 100) / 100,
            };

      results.push(data);
      await page.screenshot({
        path: outPath("screens", `qa-${locale.code}-${route.slug}--${vp.name}.png`),
        fullPage: true,
      });

      console.log(
        `${locale.code} ${route.slug.padEnd(22)} @${vp.name.padEnd(4)} ` +
          `${String(data.status)} dir=${data.dir} overflow=${String(data.horizontalOverflow)} ` +
          `screens=${String(data.screensTall)}` +
          (data.reference === null ? "" : ` (ref ${String(data.reference.screensTall)})`) +
          ` controls<44=${String(data.smallControlCount)}`,
      );
      await context.close();
    }
  }
}

// The reduced-motion run. One viewport is enough: the media query is not
// viewport-conditional, and running all six would only repeat the same answer.
console.log("\n--- prefers-reduced-motion: reduce, @1440 ---");
for (const locale of LOCALES.filter((l) => wanted(l.code, onlyLocales))) {
  for (const route of ROUTES.filter((r) => wanted(r.path, onlyRoutes))) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(`${base}${locale.prefix}${route.path}`, {
      waitUntil: "load",
      timeout: 180_000,
    });
    await settle(page);
    const data = await page.evaluate(PROBE);
    reducedMotion.push({
      locale: locale.code,
      route: route.path,
      viewportName: "reduce",
      animatingCount: data.animatingCount,
      animating: data.animating,
      horizontalOverflow: data.horizontalOverflow,
      docHeight: data.docHeight,
    });
    console.log(
      `${locale.code} ${route.slug.padEnd(22)} still-animating=${String(data.animatingCount)} ` +
        `overflow=${String(data.horizontalOverflow)}`,
    );
    await context.close();
  }
}

await browser.close();

const key = (r) => `${r.locale}|${r.route}|${r.viewportName ?? "reduce"}`;

let mergedResults = results;
let mergedReduced = reducedMotion;
if (filtered) {
  let previous = { results: [], reducedMotion: [] };
  try {
    previous = JSON.parse(readFileSync(outPath("data", "qa-sweep.json"), "utf8"));
  } catch {
    previous = { results: [], reducedMotion: [] };
  }
  const replaced = new Set(results.map(key));
  mergedResults = [...previous.results.filter((r) => !replaced.has(key(r))), ...results];
  const reducedReplaced = new Set(reducedMotion.map(key));
  mergedReduced = [
    ...previous.reducedMotion.filter((r) => !reducedReplaced.has(key(r))),
    ...reducedMotion,
  ];
  const order = (r) =>
    LOCALES.findIndex((l) => l.code === r.locale) * 1000 +
    ROUTES.findIndex((x) => x.path === r.route) * 10 +
    VIEWPORTS.findIndex((v) => v.name === r.viewportName);
  mergedResults.sort((a, b) => order(a) - order(b));
  mergedReduced.sort((a, b) => order(a) - order(b));
}

const summary = {
  capturedAt: new Date().toISOString(),
  base,
  transport: "tools/graphql-ssh-proxy.mjs (ADR-032)",
  partialRun: filtered
    ? { routes: onlyRoutes, locales: onlyLocales, viewports: onlyViewports }
    : null,
  routes: ROUTES.map((r) => r.path),
  locales: LOCALES.map((l) => l.code),
  viewports: VIEWPORTS.map((v) => v.name),
  totals: {
    captures: mergedResults.length,
    nonOkStatuses: mergedResults.filter((r) => r.status !== 200).length,
    degraded: mergedResults.filter((r) => r.degraded === true).length,
    withHorizontalOverflow: mergedResults.filter((r) => r.horizontalOverflow > 0).length,
    withSmallControls: mergedResults.filter((r) => r.smallControlCount > 0).length,
    wrongDirection: mergedResults.filter(
      (r) => r.dir !== (r.locale === "ar" ? "rtl" : "ltr"),
    ).length,
    reducedMotionStillAnimating: mergedReduced.filter((r) => r.animatingCount > 0)
      .length,
  },
  results: mergedResults,
  reducedMotion: mergedReduced,
};

await writeFile(outPath("data", "qa-sweep.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(`\n${JSON.stringify(summary.totals, null, 2)}`);
