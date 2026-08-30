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

  // Declaring a token proves nothing. These three sat unused while
  // max-w-[82.5rem] was hardcoded in 17 components, and the old assertions
  // above still passed. Require a real consumer so they cannot drift again.
  it("consumes the structural tokens rather than only declaring them", () => {
    for (const token of ["--layout-container", "--layout-reading-width", "--space-section"]) {
      expect(globalCss, `${token} is declared but never referenced`).toContain(`var(${token})`);
    }
  });

  it("defines the shared layout primitives the components depend on", () => {
    for (const selector of [".page-container", ".page-grid", ".grid-item", ".section", ".prose-measure", ".rail__items"]) {
      expect(globalCss).toContain(selector);
    }
  });

  it("uses subgrid and container queries for card rails", () => {
    expect(globalCss).toContain("grid-template-rows: subgrid");
    expect(globalCss).toContain("container-type: inline-size");
    expect(globalCss).toContain("@container rail");
    // Subgrid support is broad but not universal; the fallback must survive.
    expect(globalCss).toContain("@supports not (grid-template-rows: subgrid)");
  });

  it("keeps the marquee direction-aware so RTL does not animate into blank space", () => {
    expect(globalCss).toContain("@keyframes ticker-marquee-rtl");
    expect(globalCss).toContain('[dir="rtl"] .ticker-marquee');
  });

  it("offsets anchor targets from the sticky header", () => {
    expect(globalCss).toContain("scroll-padding-block-start");
    expect(globalCss).toContain("scroll-margin-block-start");
  });
});
