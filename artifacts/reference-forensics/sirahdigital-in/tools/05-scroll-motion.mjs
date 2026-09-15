#!/usr/bin/env node
/**
 * Scroll-linked motion forensics + reduced-motion comparison.
 *
 * Samples the scroll-driven sections at fixed scroll positions and reads the
 * custom properties and transforms they actually resolve to, so the mapping
 * from scroll progress to visual state is measured rather than described.
 *
 * Writes: data/scroll-motion.json, data/reduced-motion.json
 */
import { writeFile } from "node:fs/promises";
import { chromium, ORIGIN, outPath } from "./_browser.mjs";

const SAMPLE = () => {
  const num = (v) => Math.round((Number.parseFloat(v) || 0) * 1000) / 1000;
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      rect: { y: Math.round(r.y), h: Math.round(r.height) },
      transform: s.transform,
      opacity: s.opacity,
      filter: s.filter,
      letterSpacing: s.letterSpacing,
      fontSize: s.fontSize,
      clipPath: s.clipPath === "none" ? null : s.clipPath,
    };
  };
  const root = getComputedStyle(document.documentElement);
  const stage = document.querySelector("[class*='kinetic-wordmark_stage']");
  const stageVars = stage
    ? Object.fromEntries(["--kt-p", "--kt-scale", "--kt-y", "--kt-o"].map((v) => [v, getComputedStyle(stage).getPropertyValue(v).trim() || null]))
    : null;
  const track = document.querySelector("[class*='kinetic-wordmark_track']");
  const trackVars = track
    ? Object.fromEntries(["--kt-p"].map((v) => [v, getComputedStyle(track).getPropertyValue(v).trim() || null]))
    : null;

  return {
    scrollY: Math.round(window.scrollY),
    rootKtP: root.getPropertyValue("--kt-p").trim() || null,
    stageVars,
    trackVars,
    kineticWord: pick("[class*='kinetic-wordmark_word']"),
    kineticInner: pick("[class*='kinetic-wordmark_inner']"),
    kineticStage: pick("[class*='kinetic-wordmark_stage']"),
    imageFlowPanel: pick("[class*='image-flow_panel']"),
    imageFlowStage: pick("[class*='image-flow_stage']"),
    marqueeTrack: pick(".cmarquee__track"),
    heroContent: pick("main section:nth-of-type(1) > div"),
    canvasOpacity: (() => {
      const c = document.querySelector("canvas");
      if (!c) return null;
      const s = getComputedStyle(c);
      const p = c.parentElement ? getComputedStyle(c.parentElement) : null;
      return { opacity: s.opacity, transform: s.transform, position: p ? p.position : null, parentOpacity: p ? p.opacity : null, z: p ? p.zIndex : null };
    })(),
    imageFlowImages: Array.from(document.querySelectorAll("[class*='image-flow'] img")).slice(0, 9).map((img) => {
      const r = img.getBoundingClientRect();
      const s = getComputedStyle(img.closest("figure,div,li") || img);
      return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), transform: s.transform, opacity: s.opacity, filter: s.filter, zIndex: s.zIndex };
    }),
  };
};

const browser = await chromium.launch();

// ------------------------------------------------------------------ sampling
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(ORIGIN + "/", { waitUntil: "load" });
  await page.waitForTimeout(1800);
  const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const samples = [];
  const stops = [];
  for (let y = 0; y <= docHeight - 900; y += 150) stops.push(y);
  for (const y of stops) {
    await page.evaluate((t) => window.scrollTo({ top: t, behavior: "instant" }), y);
    await page.waitForTimeout(260);
    samples.push(await page.evaluate(SAMPLE));
  }
  await writeFile(outPath("data", "scroll-motion.json"), JSON.stringify({ docHeight, viewport: { w: 1440, h: 900 }, samples }, null, 2), "utf8");
  console.log(`scroll-motion.json  samples=${samples.length}  docHeight=${docHeight}`);
  await ctx.close();
}

// ------------------------------------------------------- reduced-motion delta
{
  const out = {};
  for (const motion of ["no-preference", "reduce"]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: motion === "reduce" ? "reduce" : "no-preference" });
    const page = await ctx.newPage();
    const events = [];
    await page.exposeFunction("__rec", (e) => events.push(e));
    await page.addInitScript(() => {
      addEventListener("animationstart", (e) => {
        const s = getComputedStyle(e.target);
        window.__rec({ kind: "keyframe", name: e.animationName, duration: s.animationDuration, easing: s.animationTimingFunction });
      }, true);
      addEventListener("transitionrun", (e) => {
        const s = getComputedStyle(e.target);
        window.__rec({ kind: "transition", property: e.propertyName, duration: s.transitionDuration, easing: s.transitionTimingFunction });
      }, true);
    });
    await page.goto(ORIGIN + "/", { waitUntil: "load" });
    await page.waitForTimeout(1600);
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.5;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 200));
      }
    });
    await page.waitForTimeout(900);
    const state = await page.evaluate(() => {
      const marquee = document.querySelector(".cmarquee__track");
      const anims = document.getAnimations().map((a) => {
        const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : {};
        return { name: a.animationName || null, duration: t.duration, playState: a.playState };
      });
      return {
        docHeight: document.documentElement.scrollHeight,
        marqueeAnimation: marquee ? getComputedStyle(marquee).animation.slice(0, 120) : null,
        runningAnimations: anims,
        canvasPresent: !!document.querySelector("canvas"),
        revealedOpacity: Array.from(document.querySelectorAll("main div")).slice(0, 200).filter((d) => Number(getComputedStyle(d).opacity) < 1).length,
      };
    });
    const counts = {};
    for (const e of events) {
      const key = e.kind === "keyframe" ? `keyframe:${e.name}:${e.duration}` : `transition:${e.property}:${e.duration}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    out[motion] = { eventCount: events.length, uniqueEvents: Object.keys(counts).length, counts, state };
    await ctx.close();
  }
  await writeFile(outPath("data", "reduced-motion.json"), JSON.stringify(out, null, 2), "utf8");
  console.log(`reduced-motion.json  no-preference=${out["no-preference"].eventCount} events  reduce=${out.reduce.eventCount} events`);
}

await browser.close();
