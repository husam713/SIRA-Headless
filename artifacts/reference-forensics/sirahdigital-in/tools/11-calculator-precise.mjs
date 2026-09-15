#!/usr/bin/env node
/**
 * Second, precise pass over the impact calculator.
 *
 * The first pass (10-calculator.mjs) established the shape of the model. It also
 * showed a read race: identical inputs returned 12,880h in one sample and
 * 12,878h in another, and the coverage meter came back non-monotonic against
 * current automation, which no plausible formula produces. The meter carries a
 * 700ms width transition and the figures appear to settle on their own schedule.
 *
 * So this pass reads each sample TWICE, 400ms apart, and only accepts the
 * reading when both agree. A disagreement is retried rather than recorded, which
 * turns a race into a delay instead of into a wrong constant.
 *
 * It targets only what the first pass left open:
 *   - displayed coverage against current automation;
 *   - base coverage and revenue across the full 12 x 4 industry/size grid;
 *   - the implementation cost implied by ROI and payback, against team size;
 *   - a fresh held-out set for verification.
 *
 * SAFETY: as 10-calculator.mjs. Every non-GET to the origin is aborted.
 *
 * Writes: data/calculator-precise.json
 */
import { writeFile } from "node:fs/promises";
import { chromium, ORIGIN, outPath } from "./_browser.mjs";

const URL_UNDER_TEST = `${ORIGIN}/contact`;

const CONTROLS = {
  industry: "Industry",
  size: "Business size",
  team: "Team Size",
  hours: "Manual Hours Per Week",
  hourly: "Average Employee Hourly Cost",
  automation: "Current Automation Level",
};

const SET_VALUE = (labelText, value) => {
  const label = [...document.querySelectorAll("label")].find(
    (node) => (node.textContent || "").trim() === labelText,
  );
  if (!label) return `no label: ${labelText}`;
  const element = label.htmlFor
    ? document.getElementById(label.htmlFor)
    : label.querySelector("input, select");
  if (!element) return `no control for: ${labelText}`;
  const prototype =
    element.tagName === "SELECT"
      ? window.HTMLSelectElement.prototype
      : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value").set.call(
    element,
    String(value),
  );
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  return null;
};

const READ = () => {
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const rowValue = (term) => {
    const row = [...document.querySelectorAll("dl > div")].find((node) =>
      (node.querySelector("dt")?.textContent || "").trim().startsWith(term),
    );
    return row ? clean(row.querySelector("dd")?.textContent) : null;
  };
  const sectionOf = (id) => document.getElementById(id)?.closest("section") ?? null;
  const meter = (section) => {
    const fill = section?.querySelector('[class*="meterFill"]');
    const m = /width:\s*([\d.]+)%/.exec(fill?.getAttribute("style") || "");
    return m ? Number(m[1]) : null;
  };
  const coverage = sectionOf("roi-coverage");
  const productivity = sectionOf("roi-productivity");
  const hours = sectionOf("roi-hours");
  const curve = sectionOf("roi-curve-title");
  const impact = coverage?.parentElement ?? document;
  const big = [...impact.querySelectorAll("span")].filter((n) =>
    /font-size:\s*clamp/.test(n.getAttribute("style") || ""),
  );
  const hoursRows = hours ? [...hours.querySelectorAll("div > div > span")] : [];

  return {
    headline: clean(big[0]?.textContent),
    hoursSaved: clean(big[1]?.textContent),
    roi: rowValue("First-year ROI"),
    payback: rowValue("Payback period"),
    revenue: rowValue("Revenue opportunity"),
    leadResponse: rowValue("Lead response"),
    coverageText: clean(coverage?.querySelector("span")?.textContent),
    coverageExact: meter(coverage),
    productivityExact: meter(productivity),
    manualToday: clean(hoursRows[1]?.textContent),
    manualAfter: clean(hoursRows[3]?.textContent),
    twelveMonth: clean(curve?.querySelector("p")?.textContent),
    recommended: clean(
      [...document.querySelectorAll("h2")]
        .find((n) => (n.textContent || "").includes("Recommended automations"))
        ?.parentElement?.querySelector("p")?.textContent,
    ),
  };
};

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
await context.route("**/*", (route) => {
  const request = route.request();
  return request.url().startsWith(ORIGIN) && request.method() !== "GET"
    ? route.abort()
    : route.continue();
});

const page = await context.newPage();
await page.goto(URL_UNDER_TEST, { waitUntil: "networkidle", timeout: 90_000 });
await page.click('button[aria-controls="roi-advanced"]').catch(() => {});
await page.waitForTimeout(500);
await page.evaluate(`window.__set = ${SET_VALUE.toString()}`);

const contract = await page.evaluate((labels) => {
  const out = {};
  for (const [key, text] of Object.entries(labels)) {
    const label = [...document.querySelectorAll("label")].find(
      (n) => (n.textContent || "").trim() === text,
    );
    const el = label?.htmlFor ? document.getElementById(label.htmlFor) : null;
    out[key] = !el
      ? null
      : el.tagName === "SELECT"
        ? { kind: "select", options: [...el.options].map((o) => o.value), value: el.value }
        : { kind: el.type, min: el.min, max: el.max, step: el.step, value: el.value };
  }
  return out;
}, CONTROLS);

const defaults = Object.fromEntries(
  Object.entries(contract).map(([k, v]) => [k, v?.value ?? null]),
);

/** Applies a state and reads it twice, accepting only a stable reading. */
async function sample(state) {
  for (const [key, value] of Object.entries(state)) {
    const problem = await page.evaluate(
      ([label, v]) => window.__set(label, v),
      [CONTROLS[key], value],
    );
    if (problem) throw new Error(problem);
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    await page.waitForTimeout(attempt === 0 ? 1100 : 500);
    const first = await page.evaluate(READ);
    await page.waitForTimeout(400);
    const second = await page.evaluate(READ);
    if (JSON.stringify(first) === JSON.stringify(second)) {
      return { input: { ...state }, output: second, settled: true, attempt };
    }
  }

  const last = await page.evaluate(READ);
  return { input: { ...state }, output: last, settled: false, attempt: 6 };
}

const samples = [];
let unsettled = 0;
const record = async (label, state) => {
  const r = await sample({ ...defaults, ...state });
  if (!r.settled) unsettled += 1;
  samples.push({ label, ...r });
  return r;
};

console.log("automation sweep (0..100 step 5):");
for (let a = 0; a <= 100; a += 5) {
  const r = await record(`automation=${a}`, { automation: a });
  console.log(
    `  a=${String(a).padStart(3)} today=${r.output.manualToday} after=${r.output.manualAfter} coverage=${r.output.coverageExact} ${r.settled ? "" : "UNSETTLED"}`,
  );
}

console.log("\nindustry x size grid:");
for (const industry of contract.industry.options) {
  for (const size of contract.size.options) {
    const r = await record(`grid ${industry}/${size}`, { industry, size });
    console.log(
      `  ${industry.padEnd(22)} ${size.padEnd(11)} after=${String(r.output.manualAfter).padStart(9)} rev=${String(r.output.revenue).padStart(9)} ${r.settled ? "" : "UNSETTLED"}`,
    );
  }
}

console.log("\nteam sweep for the implementation cost:");
for (const team of [5, 10, 25, 50, 100, 200, 400, 700, 1000]) {
  const r = await record(`team=${team}`, { team });
  console.log(
    `  team=${String(team).padStart(4)} head=${String(r.output.headline).padStart(8)} roi=${String(r.output.roi).padStart(6)} pay=${String(r.output.payback).padStart(6)} rev=${String(r.output.revenue).padStart(9)} ${r.settled ? "" : "UNSETTLED"}`,
  );
}

console.log("\nhourly sweep:");
for (const hourly of [10, 25, 32, 50, 80, 120, 200]) {
  const r = await record(`hourly=${hourly}`, { hourly });
  console.log(
    `  $${String(hourly).padStart(3)} head=${String(r.output.headline).padStart(8)} roi=${String(r.output.roi).padStart(6)} rev=${String(r.output.revenue).padStart(9)} ${r.settled ? "" : "UNSETTLED"}`,
  );
}

console.log("\nfresh holdout:");
const holdout = [];
const pick = (l) => l[Math.floor(Math.random() * l.length)];
for (let i = 0; i < 30; i += 1) {
  const state = {
    team: 5 * (1 + Math.floor(Math.random() * 200)),
    hours: 1 + Math.floor(Math.random() * 60),
    hourly: 10 + Math.floor(Math.random() * 190),
    automation: Math.floor(Math.random() * 96),
    industry: pick(contract.industry.options),
    size: pick(contract.size.options),
  };
  const r = await sample({ ...defaults, ...state });
  if (!r.settled) unsettled += 1;
  holdout.push({ label: `holdout-${i}`, ...r });
  console.log(
    `  ${String(i).padStart(2)} ${r.output.manualToday} -> ${r.output.manualAfter}  ${r.output.headline} ${r.settled ? "" : "UNSETTLED"}`,
  );
}

await browser.close();

await writeFile(
  outPath("data", "calculator-precise.json"),
  `${JSON.stringify(
    { capturedAt: new Date().toISOString(), url: URL_UNDER_TEST, contract, defaults, samples, holdout },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(
  `\n${String(samples.length)} samples, ${String(holdout.length)} held out, ${String(unsettled)} unsettled -> data/calculator-precise.json`,
);
