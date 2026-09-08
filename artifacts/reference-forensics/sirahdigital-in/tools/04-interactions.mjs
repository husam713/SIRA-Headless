#!/usr/bin/env node
/**
 * Pointer, focus, header-scroll and mobile-menu interaction forensics.
 *
 * Every reading is a before/after pair around a real interaction driven through
 * the browser, so hover and focus deltas are measured rather than inferred from
 * class names.
 *
 * Writes: data/interactions.json
 */
import { writeFile } from "node:fs/promises";
import { chromium, ORIGIN, outPath } from "./_browser.mjs";

const SNAP = (selector) => {
  const el = document.querySelector(selector);
  if (!el) return null;
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    rect: { x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 },
    color: s.color,
    background: s.backgroundColor,
    backgroundImage: s.backgroundImage === "none" ? null : s.backgroundImage.slice(0, 160),
    border: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
    radius: s.borderRadius,
    opacity: s.opacity,
    transform: s.transform,
    filter: s.filter,
    boxShadow: s.boxShadow.slice(0, 140),
    backdrop: s.backdropFilter,
    maxWidth: s.maxWidth,
    padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
    letterSpacing: s.letterSpacing,
    fontWeight: s.fontWeight,
    textDecoration: s.textDecorationLine,
    outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`,
    transition: `${s.transitionProperty} | ${s.transitionDuration} | ${s.transitionTimingFunction} | ${s.transitionDelay}`,
    pseudoBefore: (() => {
      const p = getComputedStyle(el, "::before");
      return p.content === "none" ? null : { content: p.content, width: p.width, height: p.height, background: p.backgroundColor, transform: p.transform, opacity: p.opacity, transition: p.transitionDuration };
    })(),
    pseudoAfter: (() => {
      const p = getComputedStyle(el, "::after");
      return p.content === "none" ? null : { content: p.content, width: p.width, height: p.height, background: p.backgroundColor, transform: p.transform, opacity: p.opacity, transition: p.transitionDuration };
    })(),
    childTransforms: Array.from(el.querySelectorAll("*")).slice(0, 12).map((c) => {
      const cs = getComputedStyle(c);
      return { tag: c.tagName.toLowerCase(), transform: cs.transform, opacity: cs.opacity, color: cs.color, transition: cs.transitionDuration };
    }),
  };
};

const HEADER_SNAP = () => {
  const header = document.querySelector("header");
  if (!header) return null;
  const inner = header.querySelector(":scope > *");
  const hs = getComputedStyle(header);
  const is = inner ? getComputedStyle(inner) : null;
  const ir = inner ? inner.getBoundingClientRect() : null;
  return {
    scrollY: Math.round(window.scrollY),
    outer: {
      height: Math.round(header.getBoundingClientRect().height),
      padding: `${hs.paddingTop} ${hs.paddingRight} ${hs.paddingBottom} ${hs.paddingLeft}`,
      background: hs.backgroundColor,
      transform: hs.transform,
      position: hs.position,
    },
    inner: inner
      ? {
          width: Math.round(ir.width),
          height: Math.round(ir.height),
          maxWidth: is.maxWidth,
          background: is.backgroundColor,
          border: `${is.borderTopWidth} ${is.borderTopStyle} ${is.borderTopColor}`,
          radius: is.borderRadius,
          backdrop: is.backdropFilter,
          shadow: is.boxShadow.slice(0, 140),
        }
      : null,
  };
};

const result = { capturedAt: new Date().toISOString(), origin: ORIGIN };
const browser = await chromium.launch();

// ---------------------------------------------------------------- header scroll
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(ORIGIN + "/", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  const states = [];
  for (const y of [0, 40, 80, 120, 200, 600, 1600, 3000]) {
    await page.evaluate((to) => window.scrollTo({ top: to, behavior: "instant" }), y);
    await page.waitForTimeout(750);
    states.push(await page.evaluate(HEADER_SNAP));
  }
  // scroll back up: does the header hide/show by direction?
  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
  await page.waitForTimeout(700);
  const atDown = await page.evaluate(HEADER_SNAP);
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
  await page.waitForTimeout(700);
  const atUp = await page.evaluate(HEADER_SNAP);
  result.headerScroll = { states, directionTest: { down: atDown, up: atUp } };
  await ctx.close();
}

// ---------------------------------------------------------------- desktop hover
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(ORIGIN + "/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.5;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 110));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });

  const targets = [
    { name: "nav-link", selector: "header nav a[href='/services']" },
    { name: "header-cta", selector: "header a[href='/contact']" },
    { name: "hero-primary-cta", selector: "main section:nth-of-type(1) a[href='/contact']" },
    { name: "hero-secondary-cta", selector: "main section:nth-of-type(1) a[href='/products']" },
    { name: "product-column", selector: "[class*='home-products_col']" },
    { name: "final-cta-button", selector: "main section:last-of-type a" },
    { name: "footer-link", selector: "footer a[href='/about']" },
  ];

  result.hover = [];
  for (const t of targets) {
    const exists = await page.$(t.selector);
    if (!exists) {
      result.hover.push({ ...t, present: false });
      continue;
    }
    await exists.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(450);
    const before = await page.evaluate(SNAP, t.selector);
    await exists.hover();
    await page.waitForTimeout(650);
    const after = await page.evaluate(SNAP, t.selector);
    const diff = {};
    for (const k of Object.keys(before || {})) {
      if (k === "childTransforms" || k === "rect") continue;
      if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) diff[k] = { from: before[k], to: after[k] };
    }
    if (before && after && JSON.stringify(before.rect) !== JSON.stringify(after.rect)) diff.rect = { from: before.rect, to: after.rect };
    const childDiff = [];
    if (before && after) {
      before.childTransforms.forEach((c, i) => {
        const a = after.childTransforms[i];
        if (a && (c.transform !== a.transform || c.opacity !== a.opacity || c.color !== a.color)) {
          childDiff.push({ tag: c.tag, transform: [c.transform, a.transform], opacity: [c.opacity, a.opacity], color: [c.color, a.color], transition: a.transition });
        }
      });
    }
    result.hover.push({ ...t, present: true, transition: before ? before.transition : null, diff, childDiff });
    await page.mouse.move(5, 5);
    await page.waitForTimeout(400);
  }

  // ---- keyboard focus
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const focusStates = [];
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(220);
    focusStates.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
          href: el.getAttribute("href"),
          outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor} offset ${s.outlineOffset}`,
          boxShadow: s.boxShadow.slice(0, 120),
          ring: s.getPropertyValue("--tw-ring-color"),
        };
      }),
    );
  }
  result.focus = focusStates;
  await ctx.close();
}

// ---------------------------------------------------------------- mobile menu
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const page = await ctx.newPage();
  const animations = [];
  await page.exposeFunction("__record", (entry) => animations.push(entry));
  await page.addInitScript(() => {
    addEventListener("animationstart", (e) => {
      const s = getComputedStyle(e.target);
      window.__record({ kind: "keyframe", name: e.animationName, duration: s.animationDuration, easing: s.animationTimingFunction, delay: s.animationDelay, target: e.target.tagName.toLowerCase() + "." + String(e.target.className).split(/\s+/).slice(0, 3).join(".") });
    }, true);
    addEventListener("transitionrun", (e) => {
      const s = getComputedStyle(e.target);
      window.__record({ kind: "transition", property: e.propertyName, duration: s.transitionDuration, easing: s.transitionTimingFunction, delay: s.transitionDelay, target: e.target.tagName.toLowerCase() + "." + String(e.target.className).split(/\s+/).slice(0, 3).join(".") });
    }, true);
  });
  await page.goto(ORIGIN + "/", { waitUntil: "load" });
  await page.waitForTimeout(1500);

  const closed = await page.evaluate(() => {
    const header = document.querySelector("header");
    return {
      headerHeight: Math.round(header.getBoundingClientRect().height),
      controls: Array.from(header.querySelectorAll("button,a")).map((b) => ({
        tag: b.tagName.toLowerCase(),
        text: (b.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30),
        aria: b.getAttribute("aria-label"),
        expanded: b.getAttribute("aria-expanded"),
        controls: b.getAttribute("aria-controls"),
        rect: (() => { const r = b.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })(),
      })),
      bodyOverflow: getComputedStyle(document.body).overflow,
    };
  });

  animations.length = 0;
  const toggle = await page.$("header button");
  let open = null;
  if (toggle) {
    await toggle.click();
    await page.waitForTimeout(900);
    open = await page.evaluate(() => {
      const panels = Array.from(document.querySelectorAll("body *")).filter((el) => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return (s.position === "fixed" || s.position === "absolute") && r.height > 250 && r.width > 250 && s.display !== "none" && Number(s.opacity) > 0.05;
      });
      return {
        bodyOverflow: getComputedStyle(document.body).overflow,
        htmlOverflow: getComputedStyle(document.documentElement).overflow,
        panels: panels.slice(0, 4).map((p) => {
          const s = getComputedStyle(p);
          const r = p.getBoundingClientRect();
          return {
            cls: String(p.className).slice(0, 140),
            rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
            background: s.backgroundColor,
            backdrop: s.backdropFilter,
            transform: s.transform,
            transition: `${s.transitionProperty} ${s.transitionDuration} ${s.transitionTimingFunction}`,
            zIndex: s.zIndex,
            linkCount: p.querySelectorAll("a").length,
            links: Array.from(p.querySelectorAll("a")).slice(0, 12).map((a) => ({ text: (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30), href: a.getAttribute("href") })),
          };
        }),
      };
    });
  }
  const openAnimations = animations.slice();
  animations.length = 0;
  if (toggle) {
    await toggle.click().catch(() => {});
    await page.waitForTimeout(900);
  }
  result.mobileMenu = { closed, open, openAnimations, closeAnimations: animations.slice() };
  await ctx.close();
}

await writeFile(outPath("data", "interactions.json"), JSON.stringify(result, null, 2), "utf8");
console.log("interactions.json written");
await browser.close();
