import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// Companion to design-runtime-exclusion.test.ts. That one keeps the prototype
// runtime out of the shipped app; this one keeps the fixture harness out of it.
//
// The harness renders production components with synthetic data. It must never
// become reachable from the production route graph or the client bundle, so
// nothing under src/ or public/ may be a fixture, and no production module may
// import from tests/ or from the generated output directory.

function walk(directory: string): readonly string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);

    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const forbiddenPathTerms = ["fixtures", "harness", "test-results"] as const;

const forbiddenImportTerms = [
  "tests/fixtures",
  "tests/harness",
  "@/tests",
  "test-results",
  "homepage-fixture-composer",
] as const;

describe("homepage fixture runtime exclusion", () => {
  const shippedFiles = [...walk("src"), ...walk("public")];

  it("ships no fixture or harness file", () => {
    for (const path of shippedFiles) {
      const normalized = path.split("\\").join("/");

      for (const term of forbiddenPathTerms) {
        expect(
          normalized.includes(term),
          `${relative(".", path)} looks like a fixture/harness artifact`,
        ).toBe(false);
      }
    }
  });

  it("never imports test fixtures or the harness from production source", () => {
    for (const path of walk("src")) {
      const source = readFileSync(path, "utf8");

      for (const term of forbiddenImportTerms) {
        expect(
          source,
          `${relative(".", path)} references ${term}`,
        ).not.toContain(term);
      }
    }
  });

  it("keeps the fixtures and the composer under tests/", () => {
    const fixtures = walk(join("tests", "fixtures", "homepage"));
    const harness = walk(join("tests", "harness"));

    expect(fixtures.length).toBeGreaterThan(0);
    expect(harness.length).toBeGreaterThan(0);
  });
});
