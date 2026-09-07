#!/usr/bin/env node
/**
 * Crop the same band from the reference capture and ours, and write them side
 * by side so a section can actually be judged rather than inferred from
 * section-height numbers.
 *
 * Both captures are full-page PNGs at the same viewport width, so a band is
 * addressed by its y offset in each — which differ, because the pages are not
 * the same length. Offsets come from the measured section geometry.
 *
 * Usage:
 *   node scripts/compare-section.mjs --vp 1440 --ref-y 71 --our-y 69 --h 860 --name hero
 */

import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback);
}

async function main() {
  const vp = argument("vp", "1440");
  const name = argument("name", "section");
  const refY = Number(argument("ref-y", "0"));
  const ourY = Number(argument("our-y", "0"));
  const height = Number(argument("h", "800"));
  const root = join("..", "artifacts", "homepage-fidelity");
  const out = join(root, "compare");

  await mkdir(out, { recursive: true });

  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({
      viewport: { width: Number(vp) * 2 + 48, height: height + 96 },
    });

    // The crops are inlined as data URIs rather than served through a route
    // handler: a handler registered after setContent never intercepts the
    // initial load, and the first attempt at this silently produced two blank
    // panels that looked like a rendering bug in the page under test.
    const asDataUri = async (file) =>
      "data:image/png;base64," + (await readFile(file)).toString("base64");

    const refSrc = await asDataUri(join(root, "reference", `${vp}.png`));
    const ourSrc = await asDataUri(join(root, "ours", `${vp}.png`));

    await page.setContent(`
      <style>
        body { margin:0; background:#111; font:12px/1.4 system-ui,sans-serif; color:#eee; }
        .row { display:flex; gap:16px; padding:16px; }
        figure { margin:0; flex:1; }
        figcaption { padding:6px 2px; letter-spacing:.08em; text-transform:uppercase; }
        .win { width:${vp}px; height:${height}px; overflow:hidden; position:relative; background:#000; }
        .win img { position:absolute; left:0; width:${vp}px; }
      </style>
      <div class="row">
        <figure>
          <figcaption>Reference &mdash; ${name} @ ${vp}</figcaption>
          <div class="win"><img src="${refSrc}" style="top:${-refY}px"></div>
        </figure>
        <figure>
          <figcaption>Ours &mdash; ${name} @ ${vp}</figcaption>
          <div class="win"><img src="${ourSrc}" style="top:${-ourY}px"></div>
        </figure>
      </div>
    `);

    await page.waitForTimeout(500);

    const file = join(out, `${name}.${vp}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`wrote ${file}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
