import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// playwright-core is an explicit devDependency. It used to arrive only as an
// optional transitive of vitest's browser runner, which meant a clean
// `pnpm install --frozen-lockfile` did not install it at all and both
// verifiers died on MODULE_NOT_FOUND. The guarded lazy import stays so a
// missing or stale module fails with an actionable message.
//
// The browser BINARY is a separate download and is not bundled with the
// package. Install it with:
//   node node_modules/playwright-core/cli.js install chromium
// A missing binary surfaces later, from Playwright's own chromium.launch(),
// not from the catch below — that catch only ever sees the import fail.
const NEWLINE = String.fromCharCode(10);

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

// Verifies the layout primitives in src/styles/globals.css actually behave:
// master-grid column steps, container cap, span/start placement, RTL mirroring,
// subgrid row alignment, container-query card rails, and absence of horizontal
// overflow.
//
// Runs against the BUILT css, so `pnpm build` must run first, and needs the
// Chromium download (`node node_modules/playwright-core/cli.js install chromium`).
//
// Wired into Frontend CI after the build step, with the browser cached. It
// exits non-zero on a failed assertion, so it gates. Its whole-page
// counterpart, scripts/verify-live-alignment.mjs, is deliberately not in CI:
// it needs a captured deployment and CI holds no credentials for one.

const CHUNK_DIR = join(".next", "static", "chunks");

function readBuiltCss() {
  let files;
  try {
    files = readdirSync(CHUNK_DIR).filter((name) => name.endsWith(".css"));
  } catch {
    throw new Error("No " + CHUNK_DIR + ". Run `pnpm build` first.");
  }
  if (files.length === 0) throw new Error("No CSS in " + CHUNK_DIR + ". Run `pnpm build` first.");
  return files.map((name) => readFileSync(join(CHUNK_DIR, name), "utf8")).join("\n");
}

const css = readBuiltCss();

const html = `<!doctype html><html lang="en" dir="DIRECTION"><head><style>${css}</style></head>
<body>
  <section class="section" id="probe-section">
    <div class="page-grid" id="grid">
      <div class="grid-item" id="a" style="--grid-item-span:5">A</div>
      <div class="grid-item" id="b" style="--grid-item-span:5;--grid-item-start:8">B</div>
      <div class="grid-item" id="wide" style="--grid-item-span:12">
        <div class="rail" id="rail">
          <div class="rail__items" style="--rail-max:3;--rail-rows:3">
            <article id="c1"><p>eyebrow</p><h3>a short heading</h3><p>body</p></article>
            <article id="c2"><p>eyebrow</p><h3>a much much much longer heading that wraps onto several lines</h3><p>body</p></article>
            <article id="c3"><p>eyebrow</p><h3>mid heading here</h3><p>body</p></article>
          </div>
        </div>
      </div>
      <div class="grid-item"><div class="prose-measure" id="prose">measure</div></div>
    </div>
  </section>
</body></html>`;

const trackCount = (value) => value.split(" ").filter(Boolean).length;
const results = [];
const check = (name, pass, detail) => results.push({ name, pass, detail });

const chromium = await loadChromium();
const browser = await chromium.launch();

for (const dir of ["ltr", "rtl"]) {
  const page = await browser.newPage();
  for (const width of [320, 480, 768, 1100, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(html.replace("DIRECTION", dir), { waitUntil: "load" });

    const m = await page.evaluate(() => {
      const styles = (id) => getComputedStyle(document.getElementById(id));
      const box = (id) => document.getElementById(id).getBoundingClientRect();
      return {
        gridCols: styles("grid").gridTemplateColumns,
        gridWidth: box("grid").width,
        railCols: getComputedStyle(document.querySelector(".rail__items")).gridTemplateColumns,
        railRowGap: getComputedStyle(document.querySelector(".rail__items")).rowGap,
        cardRowGap: getComputedStyle(document.querySelector(".rail__items > *")).rowGap,
        a: box("a"),
        b: box("b"),
        cards: [box("c1"), box("c2"), box("c3")],
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });

    // Regression guard: a subgrid child inherits its parent row-gap between
    // its OWN rows, which opened the rail gap up inside every card on top of
    // the padding the component sets. The rail keeps its row gap; cards do not.
    check(`${dir} ${width}px rail keeps row-gap, card interior does not`,
      m.railRowGap !== "0px" && m.cardRowGap === "0px",
      `rail=${m.railRowGap} card=${m.cardRowGap}`);

    const expectedCols = width < 768 ? 4 : width < 1100 ? 8 : 12;
    check(`${dir} ${width}px master grid = ${expectedCols} cols`, trackCount(m.gridCols) === expectedCols, trackCount(m.gridCols));
    check(`${dir} ${width}px container <= 1320px`, m.gridWidth <= 1320.5, `${m.gridWidth.toFixed(1)}px`);
    check(`${dir} ${width}px no horizontal overflow`, m.scrollWidth <= m.clientWidth + 1, `scroll=${m.scrollWidth} client=${m.clientWidth}`);

    // Only cards sharing a row can align. Group by top offset first; stacked
    // cards correctly keep their natural heights.
    const rows = new Map();
    for (const card of m.cards) {
      const key = Math.round(card.top);
      rows.set(key, [...(rows.get(key) ?? []), card]);
    }
    const rowsAligned = [...rows.values()].every(
      (row) => Math.max(...row.map((c) => c.height)) - Math.min(...row.map((c) => c.height)) < 1,
    );
    const shape = [...rows.values()].map((row) => row.map((c) => c.height.toFixed(0)).join("=")).join(" | ");
    check(`${dir} ${width}px cards aligned within each row (${rows.size} row(s))`, rowsAligned, shape);

    if (width >= 1100) {
      const gap = dir === "ltr" ? m.b.left - (m.a.left + m.a.width) : m.a.left - (m.b.left + m.b.width);
      check(`${dir} ${width}px span/start leaves a real gap`, gap > 20, `gap=${gap.toFixed(0)}px`);
      check(
        `${dir} ${width}px B follows A in inline order`,
        dir === "ltr" ? m.b.left > m.a.left : m.b.left < m.a.left,
        `A.left=${m.a.left.toFixed(0)} B.left=${m.b.left.toFixed(0)}`,
      );
    }
    if (width === 320) {
      check(`${dir} 320px items stack full-width`, Math.abs(m.a.width - m.b.width) < 1, `${m.a.width.toFixed(0)}px`);
    }
  }
  await page.close();
}

// Container query, not viewport: a deliberately narrow rail inside a wide window.
const page = await browser.newPage();
await page.setViewportSize({ width: 1600, height: 900 });
await page.setContent(html.replace("DIRECTION", "ltr").replace('id="rail"', 'id="rail" style="max-width:26rem"'), {
  waitUntil: "load",
});
const narrowRail = await page.evaluate(() => getComputedStyle(document.querySelector(".rail__items")).gridTemplateColumns);
check("26rem rail at 1600px viewport -> 1 column (container query, not viewport)", trackCount(narrowRail) === 1, narrowRail);
await page.close();
await browser.close();

let failed = 0;
for (const result of results) {
  if (!result.pass) failed += 1;
  console.log(`${result.pass ? "PASS" : "FAIL"}  ${result.name}  [${result.detail}]`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed === 0 ? 0 : 1);
