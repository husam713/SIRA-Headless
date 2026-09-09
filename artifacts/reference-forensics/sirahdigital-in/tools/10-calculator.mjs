#!/usr/bin/env node
/**
 * Derives the impact calculator's model by observation.
 *
 * The formula was deliberately not reverse-engineered in Phase 1, and the saved
 * page does not contain it: the calculator's copy exists only in the
 * server-rendered HTML and the chunks holding the logic were never captured. It
 * is also not derivable from the two data points in REPORT.md 7.4, because
 * 29,440 manual hours does not factor cleanly out of 40 people x 14 hours x any
 * standard working year.
 *
 * So this measures it instead. The owner asked for the calculator to be
 * reproduced exactly and confirmed that driving the live site is acceptable.
 *
 * SAFETY: every non-GET request to the origin is aborted, exactly as in
 * 06-forms.mjs, so no enquiry, booking or lead can be created. This reads a
 * public page and submits nothing.
 *
 * CHEAP: the calculator recalculates client-side, so the whole sweep runs from
 * ONE page load with no further network traffic.
 *
 * PRECISION: several outputs are rounded for display but exposed unrounded in
 * the DOM - the coverage and productivity meters carry a `width` percentage to
 * four decimal places, the before/after bar carries the exact hours ratio, and
 * the twelve-month curve is an SVG path whose coordinates are the monthly
 * values. All of it is recorded.
 *
 * Writes: data/calculator-model.json
 *
 * Usage:
 *   MSYS_NO_PATHCONV=1 node tools/10-calculator.mjs
 */
import { writeFile } from "node:fs/promises";
import { chromium, ORIGIN, outPath } from "./_browser.mjs";

const URL_UNDER_TEST = `${ORIGIN}/contact`;

/**
 * Finds every control by its LABEL text rather than by id.
 *
 * The ids in the markup (`r1`, `r3`, ...) are React `useId` values. They are
 * stable within a build and meaningless across one, so selecting on them would
 * produce a harness that works today and silently selects nothing later.
 */
const CONTROLS = {
  industry: "Industry",
  size: "Business size",
  team: "Team Size",
  hours: "Manual Hours Per Week",
  hourly: "Average Employee Hourly Cost",
  automation: "Current Automation Level",
};

/** Sets a React-controlled input through the native setter it listens for. */
const SET_VALUE = (labelText, value) => {
  const labels = [...document.querySelectorAll("label")];
  const label = labels.find(
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

/** Reads every output, both as displayed and unrounded where the DOM has it. */
const READ = () => {
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const byId = (id) => document.getElementById(id);

  const rowValue = (term) => {
    const rows = [...document.querySelectorAll("dl > div")];
    const row = rows.find((node) =>
      (node.querySelector("dt")?.textContent || "").trim().startsWith(term),
    );
    return row ? clean(row.querySelector("dd")?.textContent) : null;
  };

  const sectionOf = (id) => byId(id)?.closest("section") ?? null;
  const meterWidth = (section) => {
    const fill = section?.querySelector('[class*="meterFill"], [style*="width"]');
    const raw = fill?.getAttribute("style") || "";
    const match = /width:\s*([\d.]+)%/.exec(raw);
    return match ? Number(match[1]) : null;
  };

  const coverage = sectionOf("roi-coverage");
  const productivity = sectionOf("roi-productivity");
  const hours = sectionOf("roi-hours");
  const curve = sectionOf("roi-curve-title");

  // The headline and the hours figure are the first two large spans in the
  // impact column, neither of which has an id of its own.
  const impact = coverage?.parentElement ?? document;
  const bigSpans = [...impact.querySelectorAll("span")].filter((node) =>
    /font-size:\s*clamp/.test(node.getAttribute("style") || ""),
  );

  const hoursRows = hours ? [...hours.querySelectorAll("div > div > span")] : [];

  return {
    headline: clean(bigSpans[0]?.textContent),
    hoursSaved: clean(bigSpans[1]?.textContent),
    roi: rowValue("First-year ROI"),
    payback: rowValue("Payback period"),
    revenue: rowValue("Revenue opportunity"),
    leadResponse: rowValue("Lead response"),
    coverageText: clean(coverage?.querySelector("span")?.textContent),
    coverageExact: meterWidth(coverage),
    productivityText: clean(
      productivity?.querySelector("span:last-of-type")?.textContent,
    ),
    productivityExact: meterWidth(productivity),
    manualToday: clean(hoursRows[1]?.textContent),
    manualAfter: clean(hoursRows[3]?.textContent),
    manualRatioExact: meterWidth(hours),
    twelveMonth: clean(curve?.querySelector("p")?.textContent),
    // The curve's coordinates ARE the monthly figures, at full precision.
    curvePath:
      curve?.querySelector("svg path")?.getAttribute("d")?.slice(0, 900) ?? null,
    curveLabel: curve?.querySelector("svg")?.getAttribute("aria-label") ?? null,
    recommended: clean(
      [...document.querySelectorAll("h2")]
        .find((n) => (n.textContent || "").includes("Recommended automations"))
        ?.parentElement?.querySelector("p")?.textContent,
    ),
  };
};

/** Reads the min/max/step contract off each slider rather than assuming it. */
const CONTRACT = (labels) => {
  const out = {};
  for (const [key, text] of Object.entries(labels)) {
    const label = [...document.querySelectorAll("label")].find(
      (node) => (node.textContent || "").trim() === text,
    );
    const element = label?.htmlFor ? document.getElementById(label.htmlFor) : null;
    if (!element) {
      out[key] = null;
      continue;
    }
    out[key] =
      element.tagName === "SELECT"
        ? {
            kind: "select",
            options: [...element.options].map((o) => o.value),
            value: element.value,
          }
        : {
            kind: element.type,
            min: element.min,
            max: element.max,
            step: element.step,
            value: element.value,
          };
  }
  return out;
};

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});

// Nothing but GETs reach the origin. A calculator sweep has no business
// creating a lead, and this makes that structural rather than careful.
await context.route("**/*", (route) => {
  const request = route.request();
  if (request.url().startsWith(ORIGIN) && request.method() !== "GET") {
    return route.abort();
  }
  return route.continue();
});

const page = await context.newPage();
await page.goto(URL_UNDER_TEST, { waitUntil: "networkidle", timeout: 90_000 });

// Open the advanced disclosure so the hourly-cost and automation sliders exist.
await page.click('button[aria-controls="roi-advanced"]').catch(() => {});
await page.waitForTimeout(400);

const contract = await page.evaluate(CONTRACT, CONTROLS);
console.log("control contract:");
console.log(JSON.stringify(contract, null, 2));

const defaults = Object.fromEntries(
  Object.entries(contract).map(([key, spec]) => [key, spec?.value ?? null]),
);

/** Applies a full input state, then reads every output. */
async function sample(state) {
  for (const [key, value] of Object.entries(state)) {
    const problem = await page.evaluate(
      ([label, v]) => SET_VALUE_IMPL(label, v),
      [CONTROLS[key], value],
    );
    if (problem) throw new Error(problem);
  }
  // The figures update synchronously on input; the meters animate their width
  // over 700ms, and the width is one of the precise readings.
  await page.waitForTimeout(850);
  return { input: { ...state }, output: await page.evaluate(READ) };
}

await page.addInitScript(`window.SET_VALUE_IMPL = ${SET_VALUE.toString()}`);
await page.evaluate(`window.SET_VALUE_IMPL = ${SET_VALUE.toString()}`);

const samples = [];
const record = async (label, state) => {
  const result = await sample({ ...defaults, ...state });
  samples.push({ label, ...result });
  console.log(
    `${label.padEnd(34)} ${result.output.manualToday ?? "-"} -> ${result.output.manualAfter ?? "-"}  ${result.output.headline ?? "-"}`,
  );
};

await record("baseline", {});

// One factor at a time. Each of these sweeps reads a coefficient directly.
for (const team of [5, 10, 20, 40, 80, 160, 320, 640, 1000]) {
  await record(`team=${team}`, { team });
}
for (const hours of [1, 2, 5, 10, 14, 20, 30, 45, 60]) {
  await record(`hours=${hours}`, { hours });
}

const hourlySpec = contract.hourly;
if (hourlySpec) {
  const min = Number(hourlySpec.min);
  const max = Number(hourlySpec.max);
  for (let i = 0; i <= 8; i += 1) {
    const value = Math.round(min + ((max - min) * i) / 8);
    await record(`hourly=${value}`, { hourly: value });
  }
}

const automationSpec = contract.automation;
if (automationSpec) {
  const min = Number(automationSpec.min);
  const max = Number(automationSpec.max);
  for (let i = 0; i <= 6; i += 1) {
    const value = Math.round(min + ((max - min) * i) / 6);
    await record(`automation=${value}`, { automation: value });
  }
}

for (const industry of contract.industry?.options ?? []) {
  await record(`industry=${industry}`, { industry });
}
for (const size of contract.size?.options ?? []) {
  await record(`size=${size}`, { size });
}

// Does the model separate, or are there cross terms?
for (const team of [20, 40, 200]) {
  for (const hours of [5, 14, 40]) {
    for (const automation of [0, 15, 60]) {
      await record(`grid t${team} h${hours} a${automation}`, {
        team,
        hours,
        automation,
      });
    }
  }
}

// Held out. Never used to fit anything; this is what proves the derived model.
const holdout = [];
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const industries = contract.industry?.options ?? [];
const sizes = contract.size?.options ?? [];

for (let i = 0; i < 40; i += 1) {
  const state = {
    team: 5 * (1 + Math.floor(Math.random() * 200)),
    hours: 1 + Math.floor(Math.random() * 60),
    industry: pick(industries),
    size: pick(sizes),
  };
  if (hourlySpec) {
    const min = Number(hourlySpec.min);
    const max = Number(hourlySpec.max);
    state.hourly = min + Math.floor(Math.random() * (max - min + 1));
  }
  if (automationSpec) {
    const min = Number(automationSpec.min);
    const max = Number(automationSpec.max);
    state.automation = min + Math.floor(Math.random() * (max - min + 1));
  }

  const result = await sample({ ...defaults, ...state });
  holdout.push({ label: `holdout-${i}`, ...result });
  console.log(
    `holdout-${String(i).padEnd(24)} ${result.output.manualToday ?? "-"} -> ${result.output.manualAfter ?? "-"}  ${result.output.headline ?? "-"}`,
  );
}

await browser.close();

await writeFile(
  outPath("data", "calculator-model.json"),
  `${JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      url: URL_UNDER_TEST,
      note:
        "Observed behaviour of the reference calculator. `samples` is the fitting set; `holdout` was never used to fit anything and is the verification set.",
      contract,
      defaults,
      samples,
      holdout,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(
  `\n${String(samples.length)} fitting samples, ${String(holdout.length)} held out -> data/calculator-model.json`,
);
