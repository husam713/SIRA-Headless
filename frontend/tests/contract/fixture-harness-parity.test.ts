import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The harness composer must stay a mirror of the real page, not a copy that
// drifts. If a section is added to or removed from the homepage and the
// composer is not updated, this fails — which is what stops the harness from
// quietly verifying a page the site no longer renders.

const PAGE_PATH = join("src", "app", "(sites)", "[siteKey]", "page.tsx");
const COMPOSER_PATH = join("tests", "harness", "homepage-fixture-composer.tsx");

function homepageComponentImports(source: string): ReadonlySet<string> {
  const names = new Set<string>();
  const pattern = /import\s*\{\s*([A-Za-z0-9_]+)\s*\}\s*from\s*"@\/components\/homepage\/[^"]+";/g;

  for (const match of source.matchAll(pattern)) {
    const name = match[1];
    if (name !== undefined) names.add(name);
  }

  return names;
}

function renderedComponents(
  source: string,
  candidates: ReadonlySet<string>,
): ReadonlySet<string> {
  const used = new Set<string>();

  for (const match of source.matchAll(/<([A-Z][A-Za-z0-9_]*)/g)) {
    const name = match[1];
    if (name !== undefined && candidates.has(name)) used.add(name);
  }

  return used;
}

describe("fixture harness parity with the production page", () => {
  const pageSource = readFileSync(PAGE_PATH, "utf8");
  const composerSource = readFileSync(COMPOSER_PATH, "utf8");

  const pageComponents = homepageComponentImports(pageSource);
  const composerComponents = homepageComponentImports(composerSource);

  it("imports the same homepage components as the page", () => {
    expect([...composerComponents].sort()).toEqual([...pageComponents].sort());
  });

  it("actually renders every component it imports", () => {
    const rendered = renderedComponents(composerSource, composerComponents);

    expect([...rendered].sort()).toEqual([...composerComponents].sort());
  });

  it("renders the hero conditionally in both the page and the composer", () => {
    expect(pageSource).toContain("homepage.homepage.hero !== null");
    expect(pageSource).toContain("branch.hero !== null");
    expect(composerSource).toContain("homepage.hero !== null");
  });
});
