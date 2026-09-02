import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Renders the fixture markup produced by
// tests/harness/compose-homepage-fixtures.test.ts against the BUILT css and
// asserts that a partial homepage degrades correctly: the failed section is
// gone, every other section still renders, and nothing overflows.
//
// The markup comes from the real production components — the composer imports
// them rather than restating their markup — so this checks the site, not a
// hand-maintained copy of it.
//
// Requires, in order:
//   pnpm test:run   (or the composer spec alone) to write the fixture html
//   pnpm build      because the css is read out of .next/static/chunks
//   node node_modules/playwright-core/cli.js install chromium
// `pnpm verify:fixtures` chains the composer and this script so the html can
// never be stale relative to the assertions.
//
// Exits non-zero on any failed assertion, so it gates in CI. Fixture rendering
// is NOT production visual acceptance: it proves resilience behaviour against
// synthetic data, nothing about live content or the L-O QA items.

const NEWLINE = String.fromCharCode(10);
const CHUNK_DIR = join(".next", "static", "chunks");
const HTML_DIR = join("test-results", "homepage-fixtures");

async function loadChromium() {
  try {
    const playwright = await import("playwright-core");
    return playwright.chromium;
  } catch {
    throw new Error(
      [
        "Could not import playwright-core. The module is missing or the install is stale.",
        "  Install deps: pnpm install",
      ].join(NEWLINE),
    );
  }
}

function readBuiltCss() {
  let files;
  try {
    files = readdirSync(CHUNK_DIR).filter((name) => name.endsWith(".css"));
  } catch {
    throw new Error("No " + CHUNK_DIR + ". Run `pnpm build` first.");
  }
  if (files.length === 0) {
    throw new Error("No CSS in " + CHUNK_DIR + ". Run `pnpm build` first.");
  }
  return files
    .map((name) => readFileSync(join(CHUNK_DIR, name), "utf8"))
    .join("\n");
}

function readFixtureMarkup(name) {
  try {
    return readFileSync(join(HTML_DIR, name), "utf8");
  } catch {
    throw new Error(
      [
        "Missing " + join(HTML_DIR, name) + ".",
        "  Generate it: pnpm vitest run tests/harness/compose-homepage-fixtures.test.ts",
        "  Or run the whole gate: pnpm verify:fixtures",
      ].join(NEWLINE),
    );
  }
}

const HERO_GROUP = "Fixture hero description for the group homepage.";
const HERO_BRANCH = "Fixture hero description for the branch homepage.";

const EXPECTATIONS = [
  {
    file: "group-complete.html",
    present: [HERO_GROUP, "Fixture about heading", "Fixture contact heading", "Fixture ticker item"],
    absent: [],
  },
  {
    // The point of the whole task: hero is gone, everything else survives.
    file: "group-hero-missing.html",
    present: ["Fixture about heading", "Fixture contact heading", "Fixture ticker item"],
    absent: [HERO_GROUP],
  },
  {
    file: "group-partial.html",
    present: [HERO_GROUP, "Fixture contact heading"],
    absent: ["Fixture about heading"],
  },
  {
    file: "branch-complete.html",
    present: [HERO_BRANCH, "Fixture overview heading", "Engagements", "Fixture branch contact heading"],
    absent: [],
  },
  {
    file: "branch-hero-missing.html",
    present: ["Fixture overview heading", "Engagements", "Fixture branch contact heading"],
    absent: [HERO_BRANCH],
  },
  {
    file: "branch-partial.html",
    present: [HERO_BRANCH, "Fixture overview heading"],
    absent: ["Fixture branch contact heading"],
  },
];

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

// Deliberate-failure demonstration. Mutates the markup IN MEMORY only, so the
// committed fixtures are never touched. Used to prove the gate can actually
// fail; see the PR body.
const FAILURE_DEMO = process.env["SIRA_FIXTURE_FAILURE_DEMO"] === "1";

const css = readBuiltCss();
const chromium = await loadChromium();
const browser = await chromium.launch();
const failures = [];
let checks = 0;

try {
  for (const expectation of EXPECTATIONS) {
    let markup = readFixtureMarkup(expectation.file);

    if (FAILURE_DEMO && expectation.present.length > 0) {
      markup = markup.split(expectation.present[0]).join("REMOVED-BY-FAILURE-DEMO");
    }

    const html =
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><style>' +
      css +
      "</style></head><body>" +
      markup +
      "</body></html>";

    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
      });

      await page.setContent(html, { waitUntil: "load" });

      const result = await page.evaluate(() => ({
        // innerText is what a reader actually sees, so presence is checked
        // against it. It reflects CSS, including `text-transform: uppercase`
        // on stat labels, which is why presence matching is case-insensitive.
        rendered: document.body.innerText.replace(/\s+/g, " ").toLowerCase(),
        // textContent ignores styling and picks up visually hidden nodes too,
        // so absence is checked against it: the stricter direction.
        raw: (document.body.textContent ?? "").replace(/\s+/g, " "),
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        sections: document.querySelectorAll("section").length,
      }));

      for (const needle of expectation.present) {
        checks += 1;
        if (!result.rendered.includes(needle.toLowerCase())) {
          failures.push(
            `${expectation.file} @ ${viewport.name}: expected to find ${JSON.stringify(needle)}`,
          );
        }
      }

      for (const needle of expectation.absent) {
        checks += 1;
        if (result.raw.includes(needle)) {
          failures.push(
            `${expectation.file} @ ${viewport.name}: expected NOT to find ${JSON.stringify(needle)}`,
          );
        }
      }

      // A degraded page must still be a page, not an empty shell.
      checks += 1;
      if (result.sections === 0) {
        failures.push(`${expectation.file} @ ${viewport.name}: rendered no sections`);
      }

      checks += 1;
      if (result.scrollWidth > result.clientWidth) {
        failures.push(
          `${expectation.file} @ ${viewport.name}: horizontal overflow ` +
            `(${result.scrollWidth} > ${result.clientWidth})`,
        );
      }

      await page.close();
    }
  }
} finally {
  await browser.close();
}

const passed = checks - failures.length;
console.log(`${passed}/${checks} fixture assertions passed`);

if (failures.length > 0) {
  console.error(failures.join(NEWLINE));
  process.exit(1);
}
