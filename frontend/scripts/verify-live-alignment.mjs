import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const NEWLINE = String.fromCharCode(10);

// Whole-page alignment QA across the viewport x direction x reduced-motion
// matrix. Complements verify-layout-primitives.mjs, which exercises the
// primitives in isolation: this one measures the REAL rendered homepage, so it
// catches cross-section drift the isolated harness cannot see.
//
// It runs offline against a captured page so it needs no deployment auth at
// run time. Capture first (the preview sits behind Vercel deployment
// protection, hence `vercel curl`):
//
//   BR=https://<branch-alias>.vercel.app
//   vercel curl "$BR/" -s > cap/live.html
//   CSS=$(grep -oE '/_next/static/[^"]*\.css' cap/live.html | head -1)
//   vercel curl "$BR$CSS" -s > cap/live.css
//   node scripts/verify-live-alignment.mjs cap
//
// The headline assertion is that every content column resolves to ONE
// inline-start edge. That is the property the shared container exists to
// guarantee, and it is the one a per-component test can never prove.

async function loadChromium() {
  try {
    const playwright = await import("playwright-core");
    return playwright.chromium;
  } catch {
    throw new Error(
      [
        "playwright-core is not installed.",
        "  Install it:            pnpm add -D playwright-core",
        "  Then install Chromium: npx playwright install chromium",
      ].join(NEWLINE),
    );
  }
}

const DIR = process.argv[2];
if (!DIR) throw new Error("usage: node scripts/verify-live-alignment.mjs <capture-dir>");
const OUT = `${DIR}/shots`; mkdirSync(OUT, { recursive: true });
const html = readFileSync(`${DIR}/live.html`, "utf8")
  .replace(/<link[^>]*rel="stylesheet"[^>]*>/g, "")
  .replace("</head>", `<style>${readFileSync(`${DIR}/live.css`, "utf8")}</style></head>`);

const rows = []; const rec = (n, p, d) => rows.push({ n, p, d });
const chromium = await loadChromium();
const browser = await chromium.launch();

for (const motion of ["no-preference", "reduce"]) {
for (const dir of ["ltr", "rtl"]) {
for (const width of [320, 480, 768, 1100, 1440, 1920]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.emulateMedia({ reducedMotion: motion });
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  if (dir === "rtl") await page.evaluate(() => { document.documentElement.dir = "rtl"; });
  await page.waitForTimeout(150);

  const m = await page.evaluate((dir) => {
    const cols = [...document.querySelectorAll(".page-container, .page-grid")];
    // The inline-start edge of every content column: Phase 3's whole point is
    // that these become a single number.
    const edges = cols.map((el) => {
      const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      const pad = parseFloat(dir === "rtl" ? cs.paddingRight : cs.paddingLeft);
      return Math.round((dir === "rtl" ? (window.innerWidth - r.right) : r.left) + pad);
    });
    // Two rhythms exist by design: the default and the 0.6x "tight" variant.
    const secPads = [...document.querySelectorAll("section.section")]
      .map((s) => getComputedStyle(s).paddingTop);
    const tightOwners = [...document.querySelectorAll("section.section--tight")]
      .map((s) => s.getAttribute("aria-label") || s.getAttribute("aria-labelledby") || "?");
    const rails = [...document.querySelectorAll(".rail__items")].map((r) => ({
      cols: getComputedStyle(r).gridTemplateColumns.split(" ").filter(Boolean).length,
      cardRowGap: getComputedStyle(r.firstElementChild).rowGap,
      heights: [...r.children].map((c) => ({ t: Math.round(c.getBoundingClientRect().top), h: c.getBoundingClientRect().height })),
    }));
    const anim = [...document.querySelectorAll(".ticker-marquee")]
      .map((e) => getComputedStyle(e).animationDuration);
    return {
      count: cols.length, edges: [...new Set(edges)],
      widths: [...new Set(cols.map((c) => Math.round(c.getBoundingClientRect().width)))],
      secPads: [...new Set(secPads)], tightOwners, rails, anim,
      scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
    };
  }, dir);

  const tag = `${motion === "reduce" ? "reduced " : ""}${dir} ${width}px`;
  rec(`${tag} — all ${m.count} content columns share one inline-start edge`, m.edges.length === 1, `${m.edges.join("/")}px`);
  rec(`${tag} — container width capped`, Math.max(...m.widths) <= 1320.5, `max ${Math.max(...m.widths)}px`);
  rec(`${tag} — no horizontal overflow`, m.scrollW <= m.clientW + 1, `${m.scrollW}/${m.clientW}`);
  const pads = m.secPads.map(parseFloat).sort((a, b) => b - a);
  const rhythmOk = pads.length === 1
    || (pads.length === 2 && Math.abs(pads[1] - pads[0] * 0.6) < 0.5);
  rec(`${tag} — section rhythm is default (+0.6x tight only)`, rhythmOk,
      `${m.secPads.join("/")} tight=[${m.tightOwners.join(",")}]`);
  const railsOk = m.rails.every((r) => {
    const byRow = new Map();
    for (const c of r.heights) byRow.set(c.t, [...(byRow.get(c.t) ?? []), c.h]);
    return [...byRow.values()].every((hs) => Math.max(...hs) - Math.min(...hs) < 1.5) && r.cardRowGap === "0px";
  });
  rec(`${tag} — ${m.rails.length} card rail(s) row-aligned, no interior gap leak`, railsOk,
      m.rails.map((r) => `${r.cols}col`).join(",") || "none");
  if (motion === "reduce") {
    rec(`${tag} — marquee animation suppressed`, m.anim.every((d) => parseFloat(d) < 0.05), m.anim.join(",") || "none");
  }
  if ((width === 320 || width === 1440) && motion === "no-preference") {
    await page.screenshot({ path: `${OUT}/p4-${dir}-${width}.png` });
  }
  await page.close();
}}}
await browser.close();
let bad = 0;
for (const r of rows) { if (!r.p) bad++; if (!r.p || /1440px|320px/.test(r.n)) console.log(`${r.p?"PASS":"FAIL"}  ${r.n}  [${r.d}]`); }
console.log(`\n${rows.length - bad}/${rows.length} passed`);
if (!bad) console.log("(all pass — failures only would print above)");
console.log(`screenshots: ${OUT}`);
