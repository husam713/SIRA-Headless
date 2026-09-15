#!/usr/bin/env node
/**
 * First-paint entrance choreography.
 *
 * Instruments the page before its scripts run and records every transition and
 * keyframe start with its own timestamp, then samples hero element state on a
 * fine interval, so the entrance sequence is recovered as an ordered timeline.
 *
 * Writes: data/entrance-<route>.json
 */
import { writeFile } from "node:fs/promises";
import { chromium, ORIGIN, outPath } from "./_browser.mjs";

const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/"];

const browser = await chromium.launch();
for (const route of routes) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const events = [];
  await page.exposeFunction("__ev", (e) => events.push(e));
  await page.addInitScript(() => {
    const t0 = performance.now();
    const label = (el) => {
      try {
        const cls = typeof el.className === "string" ? el.className.split(/\s+/).slice(0, 4).join(".") : "";
        return el.tagName.toLowerCase() + (cls ? "." + cls : "");
      } catch {
        return "?";
      }
    };
    addEventListener("transitionrun", (e) => {
      const s = getComputedStyle(e.target);
      window.__ev({ t: Math.round(performance.now() - t0), kind: "transitionrun", property: e.propertyName, target: label(e.target), duration: s.transitionDuration, delay: s.transitionDelay, easing: s.transitionTimingFunction, text: (e.target.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30) });
    }, true);
    addEventListener("animationstart", (e) => {
      const s = getComputedStyle(e.target);
      window.__ev({ t: Math.round(performance.now() - t0), kind: "animationstart", name: e.animationName, target: label(e.target), duration: s.animationDuration, delay: s.animationDelay, easing: s.animationTimingFunction, iteration: s.animationIterationCount });
    }, true);
  });

  await page.goto(ORIGIN + route, { waitUntil: "commit", timeout: 60000 });

  const timeline = [];
  const start = Date.now();
  while (Date.now() - start < 3200) {
    const s = await page.evaluate(() => {
      const pick = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { opacity: Number(cs.opacity).toFixed(3), transform: cs.transform, filter: cs.filter, y: Math.round(r.y), h: Math.round(r.height) };
      };
      const words = Array.from(document.querySelectorAll("main h1 span")).slice(0, 8).map((w) => {
        const cs = getComputedStyle(w);
        return { text: (w.textContent || "").trim().slice(0, 14), opacity: Number(cs.opacity).toFixed(2), transform: cs.transform };
      });
      return {
        h1: pick("main h1"),
        heroBody: pick("main section p"),
        heroCta: pick("main section a"),
        header: pick("header"),
        canvas: pick("canvas"),
        launcher: pick(".sirah-launcher"),
        words,
      };
    }).catch(() => null);
    if (s) timeline.push({ t: Date.now() - start, ...s });
    await page.waitForTimeout(70);
  }

  const slug = route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "-");
  await writeFile(outPath("data", `entrance-${slug}.json`), JSON.stringify({ route, events, timeline }, null, 2), "utf8");
  console.log(`entrance-${slug}.json  events=${events.length}  samples=${timeline.length}`);
  await ctx.close();
}
await browser.close();
