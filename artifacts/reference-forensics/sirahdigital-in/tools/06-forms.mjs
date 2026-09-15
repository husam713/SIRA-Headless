#!/usr/bin/env node
/**
 * Contact form, booking form and impact-calculator forensics.
 *
 * SAFETY: every non-GET request to the reference origin is aborted, so no real
 * enquiry, booking or lead can be created by this audit. Validation is exercised
 * only through the client-side path.
 *
 * Writes: data/forms.json
 */
import { writeFile } from "node:fs/promises";
import { chromium, ORIGIN, outPath } from "./_browser.mjs";

const FIELD_PROBE = () => {
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const style = (el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      rect: { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      background: s.backgroundColor,
      color: s.color,
      border: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
      borderBottom: `${s.borderBottomWidth} ${s.borderBottomStyle} ${s.borderBottomColor}`,
      radius: s.borderRadius,
      padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
      font: `${s.fontSize}/${s.lineHeight} ${s.fontWeight}`,
      letterSpacing: s.letterSpacing,
      textTransform: s.textTransform,
      outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`,
      transition: `${s.transitionProperty} ${s.transitionDuration} ${s.transitionTimingFunction}`,
      placeholderColour: null,
    };
  };
  const forms = Array.from(document.querySelectorAll("form")).map((f) => ({
    action: f.getAttribute("action"),
    method: f.getAttribute("method"),
    noValidate: f.noValidate,
    layout: (() => {
      const grids = Array.from(f.querySelectorAll("*")).filter((el) => getComputedStyle(el).display === "grid");
      return grids.slice(0, 5).map((g) => ({ cls: String(g.className).slice(0, 120), columns: getComputedStyle(g).gridTemplateColumns, gap: getComputedStyle(g).gap }));
    })(),
    fieldsets: Array.from(f.querySelectorAll("fieldset")).map((fs) => ({
      legend: clean(fs.querySelector("legend") ? fs.querySelector("legend").textContent : ""),
      controls: Array.from(fs.querySelectorAll("button,input,select")).map((c) => ({
        tag: c.tagName.toLowerCase(),
        type: c.type || null,
        text: clean(c.textContent).slice(0, 40),
        value: c.value || null,
        pressed: c.getAttribute("aria-pressed"),
        checked: c.checked === undefined ? null : c.checked,
        style: style(c),
      })),
    })),
    fields: Array.from(f.elements)
      .filter((e) => ["INPUT", "TEXTAREA", "SELECT"].includes(e.tagName))
      .map((e) => {
        const labelEl = e.labels && e.labels[0] ? e.labels[0] : e.closest("label");
        const hidden = getComputedStyle(e).display === "none" || getComputedStyle(e).visibility === "hidden" || e.getBoundingClientRect().width === 0;
        return {
          tag: e.tagName.toLowerCase(),
          type: e.type || null,
          name: e.name || null,
          id: e.id || null,
          required: !!e.required,
          placeholder: e.placeholder || null,
          autocomplete: e.getAttribute("autocomplete"),
          inputmode: e.getAttribute("inputmode"),
          pattern: e.getAttribute("pattern"),
          maxLength: e.maxLength > 0 ? e.maxLength : null,
          rows: e.rows || null,
          label: labelEl ? clean(labelEl.textContent).slice(0, 60) : null,
          ariaLabel: e.getAttribute("aria-label"),
          ariaDescribedBy: e.getAttribute("aria-describedby"),
          hiddenFromUser: hidden,
          style: hidden ? null : style(e),
        };
      }),
    submit: (() => {
      const b = f.querySelector('button[type="submit"],button:not([type])');
      return b ? { text: clean(b.textContent).slice(0, 50), disabled: b.disabled, style: style(b) } : null;
    })(),
    helperText: Array.from(f.querySelectorAll("p,span,small"))
      .map((n) => clean(n.textContent))
      .filter((t) => t.length > 8 && t.length < 200)
      .slice(0, 10),
  }));
  return forms;
};

const CALC_PROBE = () => {
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const host = Array.from(document.querySelectorAll("section,div")).find((el) => /Estimated impact|automation could save/i.test(el.textContent || "") && el.querySelectorAll("input,select,button").length > 2);
  if (!host) return null;
  const controls = Array.from(host.querySelectorAll("input,select,button,[role='slider'],[role='radio'],[role='tab']")).map((c) => ({
    tag: c.tagName.toLowerCase(),
    role: c.getAttribute("role"),
    type: c.type || null,
    name: c.name || null,
    min: c.min || c.getAttribute("aria-valuemin") || null,
    max: c.max || c.getAttribute("aria-valuemax") || null,
    step: c.step || null,
    value: c.value ?? c.getAttribute("aria-valuenow") ?? null,
    text: clean(c.textContent).slice(0, 40),
    pressed: c.getAttribute("aria-pressed"),
    label: c.getAttribute("aria-label"),
  }));
  const outputs = Array.from(host.querySelectorAll("h3,h4,dt,dd,strong,[class*='value'],[class*='result'],[class*='metric']"))
    .map((n) => clean(n.textContent))
    .filter(Boolean)
    .slice(0, 40);
  return {
    hostClass: String(host.className).slice(0, 160),
    rect: (() => { const r = host.getBoundingClientRect(); return { y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) }; })(),
    controls,
    outputs,
    text: clean(host.textContent).slice(0, 2200),
  };
};

const result = { capturedAt: new Date().toISOString() };
const browser = await chromium.launch();

for (const route of ["/contact", "/book"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  // Hard guarantee: nothing is ever submitted to the reference site.
  await page.route("**/*", (r) => {
    const req = r.request();
    if (req.method() !== "GET" && req.url().includes("sirahdigital.in")) return r.abort();
    return r.continue();
  });
  await page.goto(ORIGIN + route, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.5;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 160));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });

  const entry = { route, forms: await page.evaluate(FIELD_PROBE), calculator: await page.evaluate(CALC_PROBE) };

  // --- focus ring on the first text input
  const firstInput = await page.$("form input[type='text'], form input[type='email']");
  if (firstInput) {
    const before = await page.evaluate(() => {
      const el = document.querySelector("form input[type='text'], form input[type='email']");
      const s = getComputedStyle(el);
      return { border: s.borderColor, background: s.backgroundColor, outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`, shadow: s.boxShadow.slice(0, 120) };
    });
    await firstInput.focus();
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => {
      const el = document.querySelector("form input[type='text'], form input[type='email']");
      const s = getComputedStyle(el);
      return { border: s.borderColor, background: s.backgroundColor, outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`, shadow: s.boxShadow.slice(0, 120) };
    });
    entry.inputFocus = { before, after };
  }

  // --- client-side validation: submit empty (network writes are already blocked)
  const submit = await page.$("form button[type='submit']");
  if (submit) {
    await submit.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await submit.click({ force: true }).catch(() => {});
    await page.waitForTimeout(900);
    entry.emptySubmit = await page.evaluate(() => {
      const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
      const invalid = Array.from(document.querySelectorAll("form :invalid")).map((e) => ({ name: e.name || e.tagName.toLowerCase(), message: e.validationMessage }));
      const errors = Array.from(document.querySelectorAll("[role='alert'],[aria-invalid='true'],[class*='error'],[class*='invalid']")).map((e) => ({
        cls: String(e.className).slice(0, 90),
        text: clean(e.textContent).slice(0, 120),
        colour: getComputedStyle(e).color,
        border: getComputedStyle(e).borderColor,
      }));
      const firstField = document.querySelector("form input[name='firstName']");
      return {
        invalidCount: invalid.length,
        invalid: invalid.slice(0, 10),
        errors: errors.slice(0, 10),
        focused: document.activeElement ? document.activeElement.name || document.activeElement.tagName : null,
        firstFieldBorder: firstField ? getComputedStyle(firstField).borderColor : null,
      };
    });
  }

  // --- exercise the calculator, if present
  if (entry.calculator) {
    const ranges = await page.$$("input[type='range']");
    const numbers = await page.$$("input[type='number']");
    const beforeText = entry.calculator.outputs;
    for (const r of ranges.slice(0, 3)) {
      const box = await r.boundingBox();
      if (!box) continue;
      await page.mouse.click(box.x + box.width * 0.8, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }
    for (const n of numbers.slice(0, 3)) {
      await n.fill("40").catch(() => {});
      await page.waitForTimeout(400);
    }
    const chips = await page.$$("fieldset button, [role='tab'], [aria-pressed]");
    if (chips.length) {
      await chips[Math.min(1, chips.length - 1)].click().catch(() => {});
      await page.waitForTimeout(600);
    }
    entry.calculatorAfterInteraction = await page.evaluate(CALC_PROBE);
    entry.calculatorOutputsBefore = beforeText;
  }

  result[route] = entry;
  await ctx.close();
}

await writeFile(outPath("data", "forms.json"), JSON.stringify(result, null, 2), "utf8");
console.log("forms.json written");
await browser.close();
