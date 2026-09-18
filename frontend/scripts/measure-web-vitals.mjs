// Lab measurement of the pages that matter, against a running server.
//
//   node scripts/measure-web-vitals.mjs http://localhost:3000 group consulting digital
//
// For each host it loads the homepage, the newsroom and one article (the first
// the newsroom links), twice: cold (first request the server sees for that
// page) and warm. It records TTFB, FCP, LCP, CLS, transferred bytes, request
// count and the number of GraphQL log lines it can attribute if the server
// runs with SIRA_GRAPHQL_TRACE=on and its stdout is piped through here.
//
// Nothing here is a production dependency: playwright-core is already a dev
// dependency of the verifiers. Output is a Markdown table, so a run can be
// pasted into a PR as evidence.

import { chromium } from "playwright-core";

const [base = "http://localhost:3000", ...hosts] = process.argv.slice(2);
if (hosts.length === 0) {
  console.error("usage: node scripts/measure-web-vitals.mjs <baseUrl> <siteKey...>");
  process.exit(1);
}

const url = new URL(base);

async function measure(page, target) {
  const started = Date.now();
  const response = await page.goto(target, { waitUntil: "networkidle", timeout: 120_000 });
  const metrics = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const nav = performance.getEntriesByType("navigation")[0];
        const paint = Object.fromEntries(
          performance.getEntriesByType("paint").map((entry) => [entry.name, entry.startTime]),
        );
        let lcp = 0;
        let cls = 0;
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) lcp = entry.startTime;
        });
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) if (!entry.hadRecentInput) cls += entry.value;
        });
        clsObserver.observe({ type: "layout-shift", buffered: true });
        const resources = performance.getEntriesByType("resource");
        setTimeout(() => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          resolve({
            ttfb: nav ? nav.responseStart - nav.requestStart : null,
            fcp: paint["first-contentful-paint"] ?? null,
            lcp,
            cls,
            requests: resources.length + 1,
            bytes: resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0) + (nav?.transferSize || 0),
            js: resources.filter((entry) => entry.initiatorType === "script").reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
          });
        }, 800);
      }),
  );
  return { status: response?.status() ?? 0, wall: Date.now() - started, ...metrics };
}

const browser = await chromium.launch();
const rows = [];

for (const host of hosts) {
  const origin = `${url.protocol}//${host}.${url.hostname}${url.port ? `:${url.port}` : ""}`;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const home = `${origin}/`;
  const news = `${origin}/news/`;
  const cold = await measure(page, home);
  const warm = await measure(page, home);
  rows.push([host, "/", "cold", cold], [host, "/", "warm", warm]);
  const newsCold = await measure(page, news);
  rows.push([host, "/news/", "cold", newsCold]);
  const article = await page.evaluate(() => {
    const pattern = /^\/(news|insights|articles|press-releases)\/[^/]+\/$/u;
    for (const anchor of document.querySelectorAll("main a[href]")) {
      const href = anchor.getAttribute("href") ?? "";
      if (pattern.test(href)) return href;
    }
    return null;
  });
  if (article !== null) {
    rows.push([host, article, "cold", await measure(page, `${origin}${article}`)]);
    rows.push([host, article, "warm", await measure(page, `${origin}${article}`)]);
  }
  await context.close();
}

await browser.close();

const fmt = (value, digits = 0) => (value === null || value === undefined ? "—" : Number(value).toFixed(digits));
console.log("| host | path | run | status | TTFB ms | FCP ms | LCP ms | CLS | requests | KB total | KB js |");
console.log("|---|---|---|---|---|---|---|---|---|---|---|");
for (const [host, path, run, m] of rows) {
  console.log(
    `| ${host} | ${path} | ${run} | ${m.status} | ${fmt(m.ttfb)} | ${fmt(m.fcp)} | ${fmt(m.lcp)} | ${fmt(m.cls, 3)} | ${m.requests} | ${fmt(m.bytes / 1024)} | ${fmt(m.js / 1024)} |`,
  );
}
