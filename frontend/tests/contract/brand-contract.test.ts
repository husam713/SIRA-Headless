import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("SIRA font and design-token source contract", () => {
  const fontSource = readFileSync("src/styles/fonts.ts", "utf8");
  const globalCss = readFileSync("src/styles/globals.css", "utf8");

  it("uses next/font for the three approved font families", () => {
    expect(fontSource).toContain('from "next/font/google"');
    expect(fontSource).toContain("Archivo");
    expect(fontSource).toContain("Newsreader");
    expect(fontSource).toContain("Noto_Kufi_Arabic");
    expect(fontSource).not.toContain("fonts.googleapis.com");
  });

  it("maps Latin and Arabic semantic font tokens", () => {
    expect(globalCss).toContain("--font-sira-display");
    expect(globalCss).toContain("--font-sira-body");
    expect(globalCss).toContain("--font-sira-interface");
    expect(globalCss).toContain("html:lang(ar)");
  });

  it("keeps structural tokens frontend-owned", () => {
    expect(globalCss).toContain("--layout-container");
    expect(globalCss).toContain("--layout-reading-width");
    expect(globalCss).toContain("--space-section");
  });
});
