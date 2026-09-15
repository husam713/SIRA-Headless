#!/usr/bin/env node
/** Compact page-structure summary from a measurement file. Usage: node tools/summarise.mjs <slug> [vp] */
import { readFile } from "node:fs/promises";
import { outPath } from "./_browser.mjs";

const slug = process.argv[2];
const vp = process.argv[3] || "1440";
const d = JSON.parse(await readFile(outPath("data", "measure", `${slug}--${vp}.json`), "utf8"));

console.log(`PAGE ${d.url}  @${vp}  docHeight=${d.docHeight}  sections=${d.sections.length}`);
console.log(`body bg=${d.root.background} colour=${d.root.color}`);
for (const s of d.sections) {
  const pad = `${s.box.padTop}/${s.box.padRight}/${s.box.padBottom}/${s.box.padLeft}`;
  console.log(`\n${String(s.index).padStart(2, "0")} <${s.tag}> id=${s.id || "-"}  y=${s.rect.y}  h=${s.rect.h}  pad=${pad}  bg=${s.box.background}${s.box.backgroundImage ? " +bgImage" : ""}`);
  console.log(`   cls ${s.cls.slice(0, 180)}`);
  if (s.container) console.log(`   container max=${s.container.box.maxWidth} w=${s.container.rect.w} padX=${s.container.box.padLeft}`);
  for (const h of s.headings) console.log(`   ${h.tag.toUpperCase()} ${h.type.size}/${h.type.lineHeight} w${h.type.weight} tr${h.type.trackingEm} ${h.type.transform} ${h.type.color} :: ${h.text.slice(0, 80)}`);
  for (const p of s.paragraphs) console.log(`   P  ${p.type.size}/${p.type.lineHeight} ${p.type.color} ~${p.measureCh}ch :: ${p.text.slice(0, 70)}`);
  for (const g of s.grids) console.log(`   GRID n=${g.childCount} cols=${g.box.columns} gap=${g.box.gap} w=${g.rect.w} :: ${g.cls.slice(0, 90)}`);
  if (s.scrollable) console.log(`   SCROLLER ${JSON.stringify(s.scrollable)}`);
  for (const m of s.media.slice(0, 5)) console.log(`   MEDIA ${m.tag} ${m.rect.w}x${m.rect.h} ratio=${m.ratio} fit=${m.fit} ${m.src ? m.src.slice(0, 70) : ""}`);
  const ctas = s.links.filter((l) => l.box.background !== "rgba(0, 0, 0, 0)" || l.box.border);
  for (const c of ctas.slice(0, 4)) console.log(`   CTA "${c.text.slice(0, 40)}" -> ${c.href}  ${c.rect.w}x${c.rect.h} bg=${c.box.background} radius=${c.box.radius} border=${c.box.border}`);
}
if (d.footer) console.log(`\nFOOTER y=${d.footer.rect.y} h=${d.footer.rect.h} bg=${d.footer.box.background} links=${d.footer.links.length}`);
