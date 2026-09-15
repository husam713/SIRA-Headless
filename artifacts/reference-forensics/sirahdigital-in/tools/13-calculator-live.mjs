#!/usr/bin/env node
/**
 * The rebuilt calculator, checked in a real browser rather than in a unit test.
 *
 * The unit suite proves the MODEL reproduces the reference. This proves the
 * PAGE does: that the component is wired to the model it was tested against,
 * that the controls move the figures, and that "Download the automation report"
 * produces a document rather than a blank sheet.
 *
 * Three things are checked, in both languages:
 *
 *   1. the published defaults appear on the page, as strings, exactly;
 *   2. driving a control moves the outputs the way the model says it should;
 *   3. under `media: print` with the report class applied, the report is
 *      visible, the site shell is not, and the inputs summary — which only
 *      exists on paper, because the sliders are gone there — is present.
 *
 * Read-only. It changes client-side state and prints nothing to a printer.
 *
 * Usage: node tools/13-calculator-live.mjs [--base http://digital.localhost:3000]
 */
import { writeFile } from "node:fs/promises";
import { chromium, outPath } from "./_browser.mjs";

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback);
}

const base = argument("base", "http://digital.localhost:3000");

const READ = () => {
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const report = document.querySelector("[data-automation-report]");
  if (report === null) return null;
  const text = clean(report.textContent);
  const meters = [...report.querySelectorAll(".digital-meter__fill")].map((el) =>
    el.getAttribute("style"),
  );
  const bars = [...report.querySelectorAll(".digital-projection__bar")].map((el) =>
    el.getAttribute("data-state"),
  );
  const shown = [...report.querySelectorAll("input, select")].filter((el) => {
    const s = getComputedStyle(el);
    return s.display !== "none" && s.visibility !== "hidden" && el.offsetParent !== null;
  });
  return {
    text,
    meters,
    bars,
    controls: report.querySelectorAll("input, select").length,
    visibleControls: shown.length,
  };
};

const set = (labelText, value) => {
  const label = [...document.querySelectorAll("label")].find(
    (node) => (node.textContent || "").trim() === labelText,
  );
  if (!label) return `no label: ${labelText}`;
  const element = document.getElementById(label.htmlFor);
  if (!element) return `no control for: ${labelText}`;
  const prototype =
    element.tagName === "SELECT"
      ? window.HTMLSelectElement.prototype
      : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value").set.call(element, String(value));
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  return null;
};

// The figures the reference publishes at its own defaults. Every one of them
// has to be on the page as a literal string.
//
// Arabic differs in exactly one way, and deliberately: the NUMERALS are Latin
// in both languages (ADR-034), and only the unit after a figure is a word. So
// `18.2Kh` becomes `18.2K ساعة` and `2.0 mo` becomes `2.0 شهر`, while `$204K`
// and `509%` are identical strings in both. An Arabic build that reproduced the
// English unit suffixes would be the actual failure.
const PUBLISHED = {
  en: [
    "$204K",
    "18.2Kh",
    "509%",
    "2.0 mo",
    "$258K",
    "720×",
    "68%",
    "+24.8%",
    "29,440h",
    "11,207h",
    "$462K",
  ],
  ar: [
    "$204K",
    "18.2K ساعة",
    "509%",
    "2.0 شهر",
    "$258K",
    "720×",
    "68%",
    "+24.8%",
    "29,440 ساعة",
    "11,207 ساعة",
    "$462K",
  ],
};

/** What `automation = 0` must produce, in each language. */
const AT_ZERO = {
  en: ["$240K", "21.5Kh", "616%", "73%"],
  ar: ["$240K", "21.5K ساعة", "616%", "73%"],
};

const browser = await chromium.launch();
const findings = [];
const fail = (name, detail) => {
  findings.push({ check: name, result: "FAIL", detail });
  console.log(`FAIL  ${name}  ${detail}`);
};
const pass = (name, detail = "") => {
  findings.push({ check: name, result: "PASS", detail });
  console.log(`PASS  ${name}  ${detail}`);
};

for (const locale of ["en", "ar"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${base}${locale === "ar" ? "/ar" : ""}/contact/`, {
    waitUntil: "load",
    timeout: 180_000,
  });
  await page.waitForTimeout(1200);

  const initial = await page.evaluate(READ);
  if (initial === null) {
    fail(`${locale} calculator present`, "no [data-automation-report] on the page");
    await context.close();
    continue;
  }
  pass(
    `${locale} calculator present`,
    `${String(initial.controls)} controls, ${String(initial.visibleControls)} visible`,
  );

  // The two advanced assumptions start collapsed. This is not decoration: the
  // `hidden` ATTRIBUTE alone does not hide them, because Tailwind v4 puts
  // utilities in a later cascade layer than the preflight rule that implements
  // it, so `.grid` wins and the panel stays on screen.
  if (initial.visibleControls === 4) {
    pass(`${locale} advanced assumptions start collapsed`, "4 of 6 controls visible");
  } else {
    fail(
      `${locale} advanced assumptions start collapsed`,
      `${String(initial.visibleControls)} of ${String(initial.controls)} controls visible, expected 4`,
    );
  }

  const missing = PUBLISHED[locale].filter((figure) => !initial.text.includes(figure));
  if (missing.length === 0) {
    pass(`${locale} published defaults render`, PUBLISHED[locale].join(" "));
  } else {
    fail(`${locale} published defaults render`, `missing: ${missing.join(", ")}`);
  }

  // The projection is split at payback: with the defaults it is paid back
  // inside the first three months, so both states must be present.
  const states = new Set(initial.bars);
  if (initial.bars.length === 12 && states.has("unpaid") && states.has("paid")) {
    pass(`${locale} projection splits at payback`, initial.bars.join(","));
  } else {
    fail(`${locale} projection splits at payback`, initial.bars.join(","));
  }

  // Open the advanced disclosure and drive a control the reference has.
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((node) =>
      (node.getAttribute("aria-controls") || "").includes("advanced"),
    );
    button?.click();
  });
  await page.waitForTimeout(250);

  const labels =
    locale === "en"
      ? { automation: "Current Automation Level", team: "Team Size" }
      : { automation: "مستوى الأتمتة الحالي", team: "عدد الموظفين" };

  const problem = await page.evaluate(
    ([fn, label]) => new Function(`return (${fn})`)()(label, 0),
    [set.toString(), labels.automation],
  );
  if (problem !== null) {
    fail(`${locale} advanced controls reachable`, String(problem));
  } else {
    const opened = await page.evaluate(READ);
    if (opened.visibleControls === 6) {
      pass(`${locale} the disclosure reveals both assumptions`, "6 of 6 controls visible");
    } else {
      fail(
        `${locale} the disclosure reveals both assumptions`,
        `${String(opened.visibleControls)} visible, expected 6`,
      );
    }
    await page.waitForTimeout(400);
    const moved = await page.evaluate(READ);
    // At automation = 0 the reference reads $240K / 21.5Kh / 616% / 73%.
    const expected = AT_ZERO[locale];
    const absent = expected.filter((figure) => !moved.text.includes(figure));
    if (absent.length === 0) {
      pass(`${locale} controls move the figures`, `automation=0 -> ${expected.join(" ")}`);
    } else {
      fail(`${locale} controls move the figures`, `missing: ${absent.join(", ")}`);
    }
  }

  // The printed report. `emulateMedia` applies the print stylesheet without a
  // printer, and the class is the one the button sets.
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => {
    document.documentElement.classList.add("digital-printing");
  });
  await page.waitForTimeout(200);

  const print = await page.evaluate(() => {
    const seen = (selector) => {
      const el = document.querySelector(selector);
      if (el === null) return null;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.visibility !== "hidden" && s.display !== "none" && r.height > 0;
    };
    const summary = document.querySelector(".digital-print-only");
    return {
      report: seen("[data-automation-report]"),
      header: seen("header"),
      footer: seen("footer"),
      form: seen("form input[type='email']"),
      chart: seen(".digital-projection"),
      summary: summary === null ? null : getComputedStyle(summary).display,
      summaryText: (summary?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 160),
    };
  });

  const printOk =
    print.report === true &&
    print.header !== true &&
    print.footer !== true &&
    print.chart !== true &&
    print.summary === "block";
  if (printOk) {
    pass(`${locale} print report isolates and restates its inputs`, print.summaryText);
  } else {
    fail(`${locale} print report isolates and restates its inputs`, JSON.stringify(print));
  }

  await page.screenshot({
    path: outPath("screens", `qa-print-${locale}.png`),
    fullPage: true,
  });
  await context.close();
}

await browser.close();

const failed = findings.filter((f) => f.result === "FAIL").length;
await writeFile(
  outPath("data", "calculator-live.json"),
  JSON.stringify(
    { capturedAt: new Date().toISOString(), base, failed, findings },
    null,
    2,
  ),
  "utf8",
);
console.log(`\n${String(findings.length - failed)}/${String(findings.length)} passed`);
process.exitCode = failed === 0 ? 0 : 1;
