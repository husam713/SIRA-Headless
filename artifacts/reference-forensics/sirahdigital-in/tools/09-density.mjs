#!/usr/bin/env node
/**
 * Vertical density tables: where each section starts and ends, per viewport.
 *
 * Writes: data/density.json and data/density.md
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { outPath } from "./_browser.mjs";

const dir = outPath("data", "measure");
const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
const bySlug = {};
for (const f of files) {
  const [slug, vp] = f.replace(".json", "").split("--");
  const d = JSON.parse(await readFile(`${dir}/${f}`, "utf8"));
  bySlug[slug] = bySlug[slug] || {};
  bySlug[slug][vp] = {
    docHeight: d.docHeight,
    viewportHeight: d.viewport.h,
    screensTall: Math.round((d.docHeight / d.viewport.h) * 10) / 10,
    header: d.header ? d.header.rect.h : null,
    footer: d.footer ? { y: d.footer.rect.y, h: d.footer.rect.h } : null,
    sections: d.sections.map((s) => ({
      index: s.index,
      startY: s.rect.y,
      endY: Math.round((s.rect.y + s.rect.h) * 10) / 10,
      height: s.rect.h,
      screens: Math.round((s.rect.h / d.viewport.h) * 100) / 100,
      label: (s.headings[0] && s.headings[0].text.slice(0, 40)) || s.cls.slice(0, 40) || `section ${s.index}`,
    })),
  };
}

const lines = ["# Vertical density — measured section coordinates", ""];
for (const slug of Object.keys(bySlug).sort()) {
  lines.push(`## ${slug}`, "");
  for (const vp of ["390", "768", "1024", "1280", "1440", "1920"]) {
    const v = bySlug[slug][vp];
    if (!v) continue;
    lines.push(`### @${vp} — document ${v.docHeight}px (${v.screensTall} screens of ${v.viewportHeight}px)`, "");
    lines.push("| # | section | start Y | end Y | height | screens |", "| --: | --- | --: | --: | --: | --: |");
    for (const s of v.sections) lines.push(`| ${s.index} | ${s.label} | ${s.startY} | ${s.endY} | ${s.height} | ${s.screens} |`);
    if (v.footer) lines.push(`| — | footer | ${v.footer.y} | ${Math.round(v.footer.y + v.footer.h)} | ${v.footer.h} | ${Math.round((v.footer.h / v.viewportHeight) * 100) / 100} |`);
    lines.push("");
  }
}

await writeFile(outPath("data", "density.json"), JSON.stringify(bySlug, null, 2), "utf8");
await writeFile(outPath("data", "density.md"), lines.join("\n"), "utf8");
console.log(`density.json / density.md written for ${Object.keys(bySlug).length} routes`);
