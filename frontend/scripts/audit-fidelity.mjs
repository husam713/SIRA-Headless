#!/usr/bin/env node
/**
 * Component-level fidelity audit.
 *
 * Measures the SAME structural facts on the approved reference and on our
 * production page, at identical viewports, and prints the differences as a
 * table. Section-height totals were enough to find the container and rhythm
 * faults; card-level proportions are not visible in them, so this goes a level
 * deeper: media height, content height, padding, gaps, column counts.
 *
 * Sections are located by their visible heading text rather than by class,
 * because the reference's classes are not a contract and ours are not the
 * reference's. Cards are located as the children of the widest repeated grid
 * inside each section.
 *
 * Usage:
 *   node scripts/audit-fidelity.mjs                       # all viewports
 *   node scripts/audit-fidelity.mjs --only 1024
 *   node scripts/audit-fidelity.mjs --ours http://localhost:3100/
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const REFERENCE_URL =
  "https://sira-enterprise-o1ykhvni7-husam713s-projects.vercel.app/SIRA%20Group%20Homepage.dc.html";

const VIEWPORTS = ["390", "768", "1024", "1280", "1440", "1920"];
const SIZE = {
  390: [390, 844],
  768: [768, 1024],
  1024: [1024, 768],
  1280: [1280, 800],
  1440: [1440, 900],
  1920: [1920, 1080],
};

/**
 * Section identity, as a heading fragment that appears on BOTH pages.
 * `key` is the reporting name; `match` is matched case-insensitively.
 */
const SECTIONS = [
  { key: "hero", match: "shaping a" },
  { key: "latestUpdates", match: "latest updates" },
  { key: "companies", match: "one group" },
  { key: "about", match: "bridging continents" },
  { key: "investors", match: "invest alongside" },
  { key: "services", match: "our core services" },
  { key: "projects", match: "our projects" },
  { key: "insights", match: "insights" },
  { key: "testimonials", match: "trusted by partners" },
  { key: "partners", match: "strategic partners" },
  { key: "contact", match: "ready to partner" },
];

function argument(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : (process.argv[i + 1] ?? fallback);
}

const PROBE = (sections) => {
  const px = (v) => Math.round(Number.parseFloat(v) || 0);
  const R = (el) => {
    const r = el.getBoundingClientRect();
    return { y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) };
  };

  const sectionOf = (el) => {
    let node = el;
    while (node && node !== document.body) {
      if (/^(SECTION|FOOTER|HEADER)$/.test(node.tagName) && node.getBoundingClientRect().height > 100) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  };

  const findSection = (fragment) => {
    const heads = [...document.querySelectorAll("h1,h2,h3,p,span")];
    for (const h of heads) {
      const text = (h.textContent ?? "").trim().toLowerCase();
      if (text.length < 200 && text.includes(fragment)) {
        const s = sectionOf(h);
        if (s) return s;
      }
    }
    return null;
  };

  /** The widest repeated grid inside a section — its card row. */
  const cardGrid = (section) => {
    const grids = [...section.querySelectorAll("*")].filter((el) => {
      const s = getComputedStyle(el);
      return (
        (s.display === "grid" || s.display === "flex") &&
        el.children.length >= 2 &&
        el.getBoundingClientRect().width > 250 &&
        el.getBoundingClientRect().height > 80
      );
    });
    grids.sort((a, b) => {
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return rb.width * rb.height - ra.width * ra.height;
    });
    return grids[0] ?? null;
  };

  /** Tallest descendant that looks like a media block. */
  const mediaHeight = (card) => {
    const nodes = [...card.querySelectorAll("img, picture, [class*='aspect'], figure")];
    let best = 0;
    for (const n of nodes) {
      const r = n.getBoundingClientRect();
      if (r.width > 40 && r.height > best) best = r.height;
    }
    return Math.round(best);
  };

  const out = { viewport: window.innerWidth, documentHeight: document.documentElement.scrollHeight, sections: {} };

  for (const { key, match } of sections) {
    const section = findSection(match);
    if (!section) { out.sections[key] = null; continue; }

    const s = getComputedStyle(section);
    const grid = cardGrid(section);
    const gs = grid ? getComputedStyle(grid) : null;
    const cards = grid ? [...grid.children].filter((c) => c.getBoundingClientRect().height > 40) : [];
    const card = cards[0] ?? null;
    const cardRect = card ? R(card) : null;

    out.sections[key] = {
      ...R(section),
      padTop: px(s.paddingTop),
      padBottom: px(s.paddingBottom),
      bg: s.backgroundColor,
      cardCols: gs ? gs.gridTemplateColumns.split(" ").filter((c) => Number.parseFloat(c) > 1).length : null,
      cardCount: cards.length,
      cardW: cardRect ? cardRect.w : null,
      cardH: cardRect ? cardRect.h : null,
      cardMediaH: card ? mediaHeight(card) : null,
      cardPad: card ? px(getComputedStyle(card).paddingTop) : null,
      gap: gs ? gs.gap : null,
    };
  }

  const header = document.querySelector("header");
  out.header = header ? R(header) : null;
  return out;
};

async function measure(browser, url, viewport) {
  const [width, height] = SIZE[viewport];
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForTimeout(url.includes("http://localhost") ? 500 : 3500);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
  const result = await page.evaluate(PROBE, SECTIONS);
  await context.close();
  return result;
}

function line(label, ref, ours, unit = "") {
  if (ref === null && ours === null) return null;
  const d = typeof ref === "number" && typeof ours === "number" ? ours - ref : null;
  const flag = d !== null && Math.abs(d) >= 60 ? "  <<<" : "";
  return `    ${label.padEnd(13)} ref=${String(ref ?? "-").padStart(6)}${unit}  ours=${String(ours ?? "-").padStart(6)}${unit}  ${
    d === null ? "" : ((d > 0 ? "+" : "") + d).padStart(7)
  }${flag}`;
}

async function main() {
  const oursUrl = argument("ours", "http://localhost:3100/");
  const only = argument("only", null);
  const out = argument("out", join("..", "artifacts", "homepage-fidelity", "audit"));
  const viewports = only === null ? VIEWPORTS : [only];

  await mkdir(out, { recursive: true });
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch();
  const report = {};

  try {
    for (const vp of viewports) {
      const [ref, ours] = [
        await measure(browser, REFERENCE_URL, vp),
        await measure(browser, oursUrl, vp),
      ];
      report[vp] = { ref, ours };

      console.log(`\n${"=".repeat(72)}\nVIEWPORT ${vp}   doc: ref=${ref.documentHeight} ours=${ours.documentHeight} (${
        ours.documentHeight - ref.documentHeight > 0 ? "+" : ""
      }${ours.documentHeight - ref.documentHeight})\n${"=".repeat(72)}`);
      console.log(line("header h", ref.header?.h ?? null, ours.header?.h ?? null) ?? "");

      for (const { key } of SECTIONS) {
        const r = ref.sections[key];
        const o = ours.sections[key];
        if (!r && !o) continue;
        console.log(`  ${key}${!r ? "  (missing in reference)" : ""}${!o ? "  (missing in ours)" : ""}`);
        if (!r || !o) continue;
        for (const [label, field, unit] of [
          ["height", "h", ""],
          ["padTop", "padTop", ""],
          ["cols", "cardCols", ""],
          ["cardW", "cardW", ""],
          ["cardH", "cardH", ""],
          ["cardMediaH", "cardMediaH", ""],
        ]) {
          const l = line(label, r[field], o[field], unit);
          if (l) console.log(l);
        }
        if (r.bg !== o.bg) console.log(`    background     ref=${r.bg}  ours=${o.bg}   <<< DIFFERENT SURFACE`);
      }
    }
  } finally {
    await browser.close();
  }

  await writeFile(join(out, "audit.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(`\nWrote ${join(out, "audit.json")}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
