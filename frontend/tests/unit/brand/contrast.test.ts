import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  selectReadableForeground,
} from "@/lib/brand/contrast";

describe("brand foreground selection", () => {
  it("uses dark ink on the Group gold accent", () => {
    expect(
      selectReadableForeground("#cca34b", "#f7f4ed", "#20242b"),
    ).toBe("#20242b");
  });

  it("uses light paper on Consulting purple", () => {
    expect(
      selectReadableForeground("#8b5aae", "#f8f4fa", "#29232d"),
    ).toBe("#f8f4fa");
  });

  it("uses black when neither brand paper nor brand ink reaches AA", () => {
    expect(
      selectReadableForeground("#2e8c72", "#f2f8f5", "#1f2b27"),
    ).toBe("#000000");
  });

  it("returns at least 4.5:1 for every fallback accent foreground", () => {
    const pairs = [
      ["#20242b", "#cca34b"],
      ["#f8f4fa", "#8b5aae"],
      ["#f3f7fb", "#2c6dad"],
      ["#000000", "#2e8c72"],
      ["#000000", "#b0733c"],
    ] as const;

    for (const [foreground, background] of pairs) {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });
});
