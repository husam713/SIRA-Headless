#!/usr/bin/env node
/**
 * Geometry, typography, colour and composition measurement.
 *
 * Reads the rendered page rather than its source: getBoundingClientRect plus
 * getComputedStyle for every structural element, at each audited viewport.
 *
 * Usage: node tools/03-measure.mjs <route> [<route> ...] [--vp 390,1440]
 * Writes: data/measure/<route>--<vp>.json  and  screens/<route>--<vp>.png
 */
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, ORIGIN, VIEWPORTS, outPath } from "./_browser.mjs";

const argv = process.argv.slice(2);
const vpArgIndex = argv.indexOf("--vp");
const only = vpArgIndex === -1 ? null : new Set(argv[vpArgIndex + 1].split(","));
const shotIndex = argv.indexOf("--shots");
const shots = shotIndex === -1 ? null : new Set(argv[shotIndex + 1].split(","));
const routes = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--vp" && argv[i - 1] !== "--shots");
const viewports = VIEWPORTS.filter((v) => !only || only.has(v.name));

const PROBE = () => {
  const round = (n) => Math.round(n * 10) / 10;
  const px = (v) => Math.round(Number.parseFloat(v) || 0);
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const cls = (el) => {
    const c = el.className;
    return clean(typeof c === "string" ? c : c && c.baseVal ? c.baseVal : "");
  };
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return { x: round(r.x), y: round(r.y + window.scrollY), w: round(r.width), h: round(r.height) };
  };
  const type = (el) => {
    const s = getComputedStyle(el);
    return {
      family: s.fontFamily.split(",")[0].replaceAll('"', ""),
      stack: s.fontFamily,
      size: px(s.fontSize),
      weight: s.fontWeight,
      lineHeight: s.lineHeight === "normal" ? "normal" : px(s.lineHeight),
      leadingRatio: s.lineHeight === "normal" ? null : round(px(s.lineHeight) / px(s.fontSize)),
      tracking: s.letterSpacing === "normal" ? 0 : round(Number.parseFloat(s.letterSpacing)),
      trackingEm: s.letterSpacing === "normal" ? 0 : round((Number.parseFloat(s.letterSpacing) / px(s.fontSize)) * 1000) / 1000,
      transform: s.textTransform,
      color: s.color,
      align: s.textAlign,
      wrap: s.textWrap || null,
    };
  };
  const boxOf = (el) => {
    const s = getComputedStyle(el);
    return {
      display: s.display,
      position: s.position,
      maxWidth: s.maxWidth,
      width: px(s.width),
      padTop: px(s.paddingTop),
      padBottom: px(s.paddingBottom),
      padLeft: px(s.paddingLeft),
      padRight: px(s.paddingRight),
      marginTop: px(s.marginTop),
      marginBottom: px(s.marginBottom),
      gap: s.gap === "normal" ? null : s.gap,
      columns: s.gridTemplateColumns === "none" ? null : s.gridTemplateColumns,
      rows: s.gridTemplateRows === "none" ? null : s.gridTemplateRows,
      flexDirection: s.display.includes("flex") ? s.flexDirection : null,
      flexWrap: s.display.includes("flex") ? s.flexWrap : null,
      background: s.backgroundColor,
      backgroundImage: s.backgroundImage === "none" ? null : s.backgroundImage.slice(0, 220),
      border: s.borderTopWidth === "0px" && s.borderBottomWidth === "0px" && s.borderLeftWidth === "0px" ? null : `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
      radius: s.borderRadius === "0px" ? null : s.borderRadius,
      shadow: s.boxShadow === "none" ? null : s.boxShadow.slice(0, 160),
      backdrop: s.backdropFilter === "none" ? null : s.backdropFilter,
      overflow: s.overflow,
      zIndex: s.zIndex,
      opacity: s.opacity,
      transform: s.transform === "none" ? null : s.transform,
      willChange: s.willChange === "auto" ? null : s.willChange,
      transition: s.transitionProperty === "all" || s.transitionProperty !== "none" ? `${s.transitionProperty} ${s.transitionDuration} ${s.transitionTimingFunction} ${s.transitionDelay}` : null,
    };
  };
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  // ---- header -------------------------------------------------------------
  const headerEl = document.querySelector("header") || document.querySelector("[class*='header']");
  const header = headerEl
    ? {
        rect: rect(headerEl),
        box: boxOf(headerEl),
        inner: (() => {
          const inner = headerEl.querySelector(":scope > *");
          return inner ? { rect: rect(inner), box: boxOf(inner) } : null;
        })(),
        logo: (() => {
          const l = headerEl.querySelector("a[href='/'], a[href$='//'], img, svg");
          return l ? { tag: l.tagName.toLowerCase(), rect: rect(l), text: clean(l.textContent).slice(0, 40) } : null;
        })(),
        nav: Array.from(headerEl.querySelectorAll("nav a, nav button")).filter(visible).map((a) => ({
          text: clean(a.textContent).slice(0, 40),
          href: a.getAttribute("href"),
          rect: rect(a),
          type: type(a),
          box: boxOf(a),
        })),
        actions: Array.from(headerEl.querySelectorAll(":scope a, :scope button")).filter(visible).filter((a) => !a.closest("nav")).map((a) => ({
          tag: a.tagName.toLowerCase(),
          text: clean(a.textContent).slice(0, 40),
          href: a.getAttribute("href"),
          aria: a.getAttribute("aria-label") || a.getAttribute("aria-expanded"),
          rect: rect(a),
          type: type(a),
          box: boxOf(a),
        })),
      }
    : null;

  // ---- sections -----------------------------------------------------------
  const main = document.querySelector("main") || document.body;
  const sections = Array.from(main.children)
    .filter(visible)
    .map((el, i) => {
      const inner = Array.from(el.querySelectorAll(":scope > *")).filter(visible);
      const container = inner.find((c) => {
        const s = getComputedStyle(c);
        return s.maxWidth !== "none" || px(s.paddingLeft) > 0;
      }) || inner[0] || null;
      const grids = Array.from(el.querySelectorAll("*"))
        .filter((c) => {
          const s = getComputedStyle(c);
          return (s.display === "grid" || s.display === "flex") && c.children.length > 1 && c.getBoundingClientRect().width > 200;
        })
        .slice(0, 4)
        .map((g) => ({
          cls: cls(g).slice(0, 160),
          rect: rect(g),
          box: boxOf(g),
          childCount: g.children.length,
          childRects: Array.from(g.children).slice(0, 8).map((c) => rect(c)),
        }));
      return {
        index: i + 1,
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        cls: cls(el).slice(0, 300),
        rect: rect(el),
        box: boxOf(el),
        container: container ? { cls: cls(container).slice(0, 200), rect: rect(container), box: boxOf(container) } : null,
        headings: Array.from(el.querySelectorAll("h1,h2,h3,h4")).filter(visible).slice(0, 6).map((h) => ({
          tag: h.tagName.toLowerCase(),
          text: clean(h.textContent).slice(0, 120),
          rect: rect(h),
          type: type(h),
        })),
        paragraphs: Array.from(el.querySelectorAll("p")).filter(visible).slice(0, 3).map((p) => ({
          text: clean(p.textContent).slice(0, 90),
          rect: rect(p),
          type: type(p),
          measureCh: Math.round(rect(p).w / (px(getComputedStyle(p).fontSize) * 0.5)),
        })),
        links: Array.from(el.querySelectorAll("a[href]")).filter(visible).slice(0, 10).map((a) => ({
          text: clean(a.textContent).slice(0, 50),
          href: a.getAttribute("href"),
          rect: rect(a),
          type: type(a),
          box: boxOf(a),
        })),
        media: Array.from(el.querySelectorAll("img,video,canvas,svg")).filter(visible).slice(0, 10).map((m) => {
          const s = getComputedStyle(m);
          return {
            tag: m.tagName.toLowerCase(),
            src: (m.currentSrc || m.getAttribute("src") || "").slice(0, 140) || null,
            rect: rect(m),
            natural: m.naturalWidth ? { w: m.naturalWidth, h: m.naturalHeight } : null,
            fit: s.objectFit,
            ratio: rect(m).h ? Math.round((rect(m).w / rect(m).h) * 100) / 100 : null,
            loading: m.getAttribute("loading"),
            sizes: m.getAttribute("sizes"),
          };
        }),
        grids,
        scrollable: (() => {
          const sc = Array.from(el.querySelectorAll("*")).find((c) => {
            const s = getComputedStyle(c);
            return (s.overflowX === "auto" || s.overflowX === "scroll") && c.scrollWidth > c.clientWidth + 8;
          });
          return sc ? { cls: cls(sc).slice(0, 120), scrollWidth: sc.scrollWidth, clientWidth: sc.clientWidth, snap: getComputedStyle(sc).scrollSnapType } : null;
        })(),
      };
    });

  // ---- footer -------------------------------------------------------------
  const footerEl = document.querySelector("footer");
  const footer = footerEl
    ? {
        rect: rect(footerEl),
        box: boxOf(footerEl),
        columns: Array.from(footerEl.querySelectorAll("*"))
          .filter((c) => getComputedStyle(c).display === "grid" && c.children.length > 1)
          .slice(0, 2)
          .map((g) => ({ cls: cls(g).slice(0, 140), box: boxOf(g), childCount: g.children.length })),
        headings: Array.from(footerEl.querySelectorAll("h2,h3,h4,strong,[class*='title']")).filter(visible).slice(0, 10).map((h) => clean(h.textContent).slice(0, 50)),
        links: Array.from(footerEl.querySelectorAll("a[href]")).filter(visible).map((a) => ({ text: clean(a.textContent).slice(0, 50), href: a.getAttribute("href") })),
      }
    : null;

  // ---- colour inventory ---------------------------------------------------
  const colours = {};
  const bump = (bucket, key) => {
    if (!key || key === "rgba(0, 0, 0, 0)" || key === "none") return;
    colours[bucket] = colours[bucket] || {};
    colours[bucket][key] = (colours[bucket][key] || 0) + 1;
  };
  for (const el of Array.from(document.querySelectorAll("body *")).slice(0, 3000)) {
    if (!visible(el)) continue;
    const s = getComputedStyle(el);
    bump("background", s.backgroundColor);
    bump("text", s.color);
    if (s.borderTopWidth !== "0px") bump("border", s.borderTopColor);
    if (s.backgroundImage !== "none" && s.backgroundImage.includes("gradient")) bump("gradient", s.backgroundImage.slice(0, 140));
  }
  for (const bucket of Object.keys(colours)) {
    colours[bucket] = Object.entries(colours[bucket]).sort((a, b) => b[1] - a[1]).slice(0, 14);
  }

  // ---- root / body --------------------------------------------------------
  const rootStyle = getComputedStyle(document.documentElement);
  const bodyStyle = getComputedStyle(document.body);

  return {
    url: location.pathname,
    docHeight: Math.round(document.documentElement.scrollHeight),
    viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
    root: {
      background: bodyStyle.backgroundColor,
      color: bodyStyle.color,
      font: bodyStyle.fontFamily,
      fontSize: px(bodyStyle.fontSize),
      scrollBehavior: rootStyle.scrollBehavior,
      overflowX: bodyStyle.overflowX,
    },
    header,
    sections,
    footer,
    colours,
    pinSpacers: document.querySelectorAll(".pin-spacer").length,
    stickyElements: Array.from(document.querySelectorAll("body *"))
      .filter((el) => {
        const s = getComputedStyle(el);
        return (s.position === "sticky" || s.position === "fixed") && visible(el);
      })
      .slice(0, 14)
      .map((el) => ({ tag: el.tagName.toLowerCase(), cls: cls(el).slice(0, 120), position: getComputedStyle(el).position, top: getComputedStyle(el).top, z: getComputedStyle(el).zIndex, rect: rect(el) })),
  };
};

await mkdir(outPath("data", "measure"), { recursive: true });
await mkdir(outPath("screens"), { recursive: true });

const browser = await chromium.launch();
for (const route of routes) {
  const slug = route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "-");
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      userAgent: vp.mobile
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        : undefined,
    });
    const page = await context.newPage();
    await page.goto(ORIGIN + route, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(1200);
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.5;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 130));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 500));
    });
    const data = await page.evaluate(PROBE);
    await writeFile(outPath("data", "measure", `${slug}--${vp.name}.json`), JSON.stringify(data, null, 2), "utf8");
    if (!shots || shots.has(vp.name)) {
      await page.screenshot({ path: outPath("screens", `${slug}--${vp.name}.png`), fullPage: true });
    }
    console.log(`${slug} @${vp.name}  docH=${data.docHeight}  sections=${data.sections.length}  header=${data.header ? data.header.rect.h : "-"}  pinSpacers=${data.pinSpacers}`);
    await context.close();
  }
}
await browser.close();
