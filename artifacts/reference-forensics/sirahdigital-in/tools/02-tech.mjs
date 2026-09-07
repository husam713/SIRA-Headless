#!/usr/bin/env node
/**
 * Technology + motion-engine fingerprint.
 *
 * Instruments the page BEFORE its own scripts run, so IntersectionObserver
 * construction, Element.animate (WAAPI) calls, scroll listeners, rAF pressure
 * and reduced-motion queries are observed as runtime evidence rather than
 * guessed from appearance. Also records the full network waterfall.
 *
 * Writes: data/tech-<route>.json
 */
import { writeFile } from "node:fs/promises";
import { chromium, ORIGIN, outPath } from "./_browser.mjs";

const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/"];

const INSTRUMENT = () => {
  const log = {
    io: [],
    animate: [],
    scrollListeners: [],
    reducedMotionQueries: 0,
    rafTicks: 0,
    transitionRuns: [],
    keyframeRuns: [],
  };
  window.__forensics = log;

  const label = (el) => {
    try {
      const cls = typeof el.className === "string" ? el.className.split(/\s+/).slice(0, 4).join(".") : "";
      return (el.tagName || "?").toLowerCase() + (cls ? "." + cls : "");
    } catch {
      return "?";
    }
  };

  const NativeIO = window.IntersectionObserver;
  window.IntersectionObserver = class extends NativeIO {
    constructor(cb, options) {
      super(cb, options);
      this.__record = {
        threshold: options && options.threshold !== undefined ? options.threshold : null,
        rootMargin: options && options.rootMargin !== undefined ? options.rootMargin : null,
        targets: [],
      };
      log.io.push(this.__record);
    }
    observe(el) {
      this.__record.targets.push(label(el));
      return super.observe(el);
    }
  };

  const nativeAnimate = Element.prototype.animate;
  Element.prototype.animate = function (keyframes, options) {
    try {
      log.animate.push({
        target: label(this),
        keyframes: JSON.parse(JSON.stringify(keyframes)),
        options: typeof options === "number" ? { duration: options } : JSON.parse(JSON.stringify(options || {})),
      });
    } catch {}
    return nativeAnimate.call(this, keyframes, options);
  };

  const nativeAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    if (type === "scroll" || type === "wheel" || type === "touchmove" || type === "pointermove") {
      try {
        log.scrollListeners.push({
          type,
          on: this === window ? "window" : this === document ? "document" : label(this),
          passive: typeof opts === "object" && opts !== null ? !!opts.passive : false,
        });
      } catch {}
    }
    return nativeAdd.call(this, type, fn, opts);
  };

  const nativeMM = window.matchMedia;
  window.matchMedia = function (q) {
    if (/prefers-reduced-motion/.test(q)) log.reducedMotionQueries += 1;
    return nativeMM.call(window, q);
  };

  const nativeRaf = window.requestAnimationFrame;
  window.requestAnimationFrame = function (cb) {
    log.rafTicks += 1;
    return nativeRaf.call(window, cb);
  };

  addEventListener(
    "transitionrun",
    (e) => {
      if (log.transitionRuns.length > 400) return;
      const s = getComputedStyle(e.target);
      log.transitionRuns.push({
        property: e.propertyName,
        target: label(e.target),
        duration: s.transitionDuration,
        easing: s.transitionTimingFunction,
        delay: s.transitionDelay,
      });
    },
    true,
  );

  addEventListener(
    "animationstart",
    (e) => {
      if (log.keyframeRuns.length > 200) return;
      const s = getComputedStyle(e.target);
      log.keyframeRuns.push({
        name: e.animationName,
        target: label(e.target),
        duration: s.animationDuration,
        easing: s.animationTimingFunction,
        delay: s.animationDelay,
        iteration: s.animationIterationCount,
        direction: s.animationDirection,
      });
    },
    true,
  );
};

const READOUT = () => {
  const g = (name) => (name in window ? typeof window[name] : null);
  const label = (el) => {
    if (!el) return null;
    const cls = typeof el.className === "string" ? el.className.split(/\s+/).slice(0, 3).join(".") : "";
    return el.tagName.toLowerCase() + (cls ? "." + cls : "");
  };
  const running = document.getAnimations().map((a) => {
    const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : {};
    return {
      type: a.constructor.name,
      name: a.animationName || a.id || null,
      target: a.effect && a.effect.target ? label(a.effect.target) : null,
      duration: t.duration,
      easing: t.easing,
      delay: t.delay,
      iterations: t.iterations,
      playState: a.playState,
      timeline: a.timeline ? a.timeline.constructor.name : null,
    };
  });
  return {
    globals: {
      gsap: g("gsap"),
      ScrollTrigger: g("ScrollTrigger"),
      Lenis: g("Lenis"),
      lenis: g("lenis"),
      Swiper: g("Swiper"),
      lottie: g("lottie"),
      anime: g("anime"),
      Motion: g("Motion"),
      THREE: g("THREE"),
      jQuery: g("jQuery"),
      dataLayer: g("dataLayer"),
      gtag: g("gtag"),
      __NEXT_DATA__: g("__NEXT_DATA__"),
      next: g("next"),
      __next_f: g("__next_f"),
      framerMotionMarkers: document.querySelectorAll("[data-framer-name],[data-projection-id]").length,
    },
    nextBuildId: window.__NEXT_DATA__ ? window.__NEXT_DATA__.buildId : null,
    scripts: Array.from(document.querySelectorAll("script[src]")).map((s) => s.src),
    styles: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((s) => s.href),
    fontFaces: Array.from(document.fonts).map((f) => ({ family: f.family, weight: f.weight, style: f.style, status: f.status })),
    documentAnimations: running,
    documentAnimationCount: running.length,
    forensics: window.__forensics,
    cssCustomProperties: (() => {
      const cs = getComputedStyle(document.documentElement);
      const out = {};
      for (let i = 0; i < cs.length; i += 1) {
        const p = cs[i];
        if (p.startsWith("--")) out[p] = cs.getPropertyValue(p).trim().slice(0, 160);
      }
      return out;
    })(),
    htmlClasses: document.documentElement.className,
    bodyClasses: document.body.className,
    generator: document.querySelector('meta[name="generator"]') ? document.querySelector('meta[name="generator"]').content : null,
    viewportMeta: document.querySelector('meta[name="viewport"]') ? document.querySelector('meta[name="viewport"]').content : null,
    scrollBehaviour: {
      html: getComputedStyle(document.documentElement).scrollBehavior,
      body: getComputedStyle(document.body).scrollBehavior,
      overscroll: getComputedStyle(document.documentElement).overscrollBehavior,
    },
  };
};

const browser = await chromium.launch();
for (const route of routes) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(INSTRUMENT);
  const page = await context.newPage();

  const requests = [];
  page.on("response", async (res) => {
    const req = res.request();
    let size = null;
    try {
      size = (await res.body()).length;
    } catch {}
    const url = res.url();
    requests.push({
      url: url.length > 200 ? url.slice(0, 200) + "..." : url,
      type: req.resourceType(),
      status: res.status(),
      size,
      server: res.headers()["server"] || null,
      cache: res.headers()["x-vercel-cache"] || res.headers()["cf-cache-status"] || null,
      poweredBy: res.headers()["x-powered-by"] || null,
    });
  });

  const res = await page.goto(ORIGIN + route, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.5;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
  });
  await page.waitForTimeout(800);
  const readout = await page.evaluate(READOUT);

  const name = route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "-");
  const headers = res ? Object.fromEntries(Object.entries(res.headers()).filter(([k]) => !/set-cookie|authorization/i.test(k))) : null;
  await writeFile(
    outPath("data", "tech-" + name + ".json"),
    JSON.stringify({ route, documentStatus: res ? res.status() : null, documentHeaders: headers, requests, ...readout }, null, 2),
    "utf8",
  );
  console.log(
    "tech-" + name + ".json  requests=" + requests.length +
      "  io=" + readout.forensics.io.length +
      "  waapi=" + readout.forensics.animate.length +
      "  cssAnim=" + readout.forensics.keyframeRuns.length +
      "  transitions=" + readout.forensics.transitionRuns.length +
      "  raf=" + readout.forensics.rafTicks,
  );
  await context.close();
}
await browser.close();
