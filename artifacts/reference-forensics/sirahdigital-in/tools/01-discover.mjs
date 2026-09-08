#!/usr/bin/env node
/**
 * Route discovery for the sirahdigital.in reference.
 *
 * Reads robots.txt + sitemap(s), then breadth-first crawls same-origin links
 * from the homepage. Records, per route: status, title, meta description,
 * canonical, H1, the top-level section outline, and outbound internal links.
 *
 * Writes: data/routes.json, data/sitemap.json, data/robots.txt
 */
import { writeFile } from "node:fs/promises";
import { chromium, ORIGIN, outPath } from "./_browser.mjs";

const MAX_PAGES = 60;

const SECTION_PROBE = () => {
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const main = document.querySelector("main") || document.body;

  // Top-level composition blocks: direct children of <main> (or of body when a
  // site does not use <main>), which is where these builders put sections.
  const roots = Array.from(main.children).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.height > 24 && getComputedStyle(el).display !== "none";
  });

  const sections = roots.map((el, i) => {
    const r = el.getBoundingClientRect();
    const heads = Array.from(el.querySelectorAll("h1,h2,h3")).slice(0, 4).map((h) => ({
      tag: h.tagName.toLowerCase(),
      text: clean(h.textContent).slice(0, 140),
    }));
    const ctas = Array.from(el.querySelectorAll("a[href],button")).slice(0, 8).map((a) => ({
      tag: a.tagName.toLowerCase(),
      text: clean(a.textContent).slice(0, 60),
      href: a.getAttribute("href") || null,
    })).filter((a) => a.text);
    return {
      index: i + 1,
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      className: clean(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).slice(0, 200) || null,
      y: Math.round(r.y + window.scrollY),
      height: Math.round(r.height),
      background: getComputedStyle(el).backgroundColor,
      headings: heads,
      ctas,
      imgCount: el.querySelectorAll("img,svg,video,canvas").length,
      textLength: clean(el.textContent).length,
    };
  });

  return {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || null,
    canonical: document.querySelector('link[rel="canonical"]')?.href || null,
    ogTitle: document.querySelector('meta[property="og:title"]')?.content || null,
    lang: document.documentElement.lang || null,
    dir: document.documentElement.dir || null,
    h1: Array.from(document.querySelectorAll("h1")).map((h) => clean(h.textContent)).slice(0, 3),
    headings: Array.from(document.querySelectorAll("h1,h2,h3")).map((h) => ({
      tag: h.tagName.toLowerCase(),
      text: clean(h.textContent).slice(0, 160),
    })).slice(0, 60),
    docHeight: Math.round(document.documentElement.scrollHeight),
    sections,
    links: Array.from(document.querySelectorAll("a[href]"))
      .map((a) => ({ href: a.href, text: clean(a.textContent).slice(0, 80), rel: a.rel || null }))
      .filter((l) => l.href.startsWith(location.origin)),
    forms: Array.from(document.querySelectorAll("form")).map((f) => ({
      action: f.getAttribute("action"),
      method: f.getAttribute("method"),
      fields: Array.from(f.elements).map((e) => ({
        tag: e.tagName.toLowerCase(),
        type: e.type || null,
        name: e.name || null,
        required: !!e.required,
        placeholder: e.placeholder || null,
      })),
    })),
  };
};

async function textOf(page, url) {
  try {
    const res = await page.request.get(url, { timeout: 20000 });
    if (!res.ok()) return null;
    return await res.text();
  } catch {
    return null;
  }
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const robots = await textOf(page, `${ORIGIN}/robots.txt`);
await writeFile(outPath("data", "robots.txt"), robots ?? "(no robots.txt)", "utf8");

const sitemapUrls = new Set();
const sitemapIndexes = [`${ORIGIN}/sitemap.xml`, `${ORIGIN}/sitemap_index.xml`, `${ORIGIN}/wp-sitemap.xml`];
for (const line of (robots || "").split(/\r?\n/)) {
  const m = /^\s*sitemap:\s*(\S+)/i.exec(line);
  if (m) sitemapIndexes.push(m[1]);
}
const seenSitemaps = new Set();
const queueSitemaps = [...new Set(sitemapIndexes)];
while (queueSitemaps.length) {
  const sm = queueSitemaps.shift();
  if (seenSitemaps.has(sm)) continue;
  seenSitemaps.add(sm);
  const xml = await textOf(page, sm);
  if (!xml) continue;
  const locs = Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)).map((m) => m[1]);
  for (const loc of locs) {
    if (/\.xml$/i.test(loc)) queueSitemaps.push(loc);
    else if (loc.startsWith(ORIGIN)) sitemapUrls.add(loc);
  }
}
await writeFile(
  outPath("data", "sitemap.json"),
  JSON.stringify({ checked: [...seenSitemaps], urls: [...sitemapUrls].sort() }, null, 2),
  "utf8",
);

const normalise = (href) => {
  try {
    const u = new URL(href);
    if (u.origin !== ORIGIN) return null;
    if (/\.(pdf|jpe?g|png|webp|svg|zip|mp4|webm|avif|gif|ico|css|js)$/i.test(u.pathname)) return null;
    u.hash = "";
    u.search = "";
    let p = u.pathname.replace(/\/+$/, "");
    if (p === "") p = "/";
    return ORIGIN + p;
  } catch {
    return null;
  }
};

const queue = [ORIGIN + "/", ...[...sitemapUrls].map(normalise).filter(Boolean)];
const seen = new Set();
const routes = [];

while (queue.length && routes.length < MAX_PAGES) {
  const url = normalise(queue.shift());
  if (!url || seen.has(url)) continue;
  seen.add(url);
  let status = null;
  let data = null;
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    status = res?.status() ?? null;
    await page.waitForTimeout(900);
    // Scroll the page so lazy/reveal content mounts before the outline is read.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 90));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 250));
    });
    data = await page.evaluate(SECTION_PROBE);
  } catch (error) {
    routes.push({ url, pathname: new URL(url).pathname, status, error: String(error).slice(0, 200) });
    continue;
  }
  for (const l of data.links) {
    const n = normalise(l.href);
    if (n && !seen.has(n)) queue.push(n);
  }
  routes.push({
    url,
    pathname: new URL(url).pathname || "/",
    status,
    finalUrl: page.url(),
    ...data,
    links: undefined,
    internalLinkCount: data.links.length,
  });
  process.stdout.write(`. ${new URL(url).pathname} (${status})\n`);
}

await writeFile(outPath("data", "routes.json"), JSON.stringify({ origin: ORIGIN, crawledAt: new Date().toISOString(), count: routes.length, routes }, null, 2), "utf8");
console.log(`\nroutes: ${routes.length}`);
await browser.close();
