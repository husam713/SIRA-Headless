import {
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const forbiddenFileNames = new Set([
  "support.js",
  "deck-stage.js",
  "image-slot.js",
]);

const forbiddenSourceTerms = [
  "DCLogic",
  "<x-dc",
  "<dc-import",
  "<sc-for",
  "<sc-if",
  "style-hover",
] as const;

function walk(directory: string): readonly string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);

    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe("prototype runtime exclusion", () => {
  const shippedFiles = [...walk("src"), ...walk("public")];

  it("does not ship proprietary prototype runtime files", () => {
    for (const path of shippedFiles) {
      expect(forbiddenFileNames.has(path.split("/").at(-1) ?? "")).toBe(
        false,
      );
      expect(path.endsWith(".dc.html")).toBe(false);
    }
  });

  it("does not include proprietary runtime markup in source files", () => {
    for (const path of walk("src")) {
      const source = readFileSync(path, "utf8");

      for (const term of forbiddenSourceTerms) {
        expect(
          source,
          `${relative(".", path)} contains ${term}`,
        ).not.toContain(term);
      }
    }
  });
});
