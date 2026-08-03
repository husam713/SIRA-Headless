import { describe, expect, it } from "vitest";
import {
  BRAND_PRESETS,
  createFallbackBrand,
} from "@/lib/brand/fallbacks";
import { SITE_KEYS } from "@/types/site";

describe("approved SIRA fallback presets", () => {
  it.each([
    ["group", "#cca34b", "/brands/group/mark.png"],
    ["consulting", "#8b5aae", "/brands/consulting/mark.png"],
    ["healthcare", "#2c6dad", "/brands/healthcare/mark.png"],
    ["lifestyle", "#2e8c72", "/brands/lifestyle/mark.png"],
    ["realestate", "#b0733c", "/brands/realestate/mark.png"],
  ] as const)(
    "maps %s to the approved identity color and mark",
    (siteKey, expectedAccent, expectedMark) => {
      const preset = BRAND_PRESETS[siteKey];

      expect(preset.identity.accent).toBe(expectedAccent);
      expect(preset.assets.mark.src).toBe(expectedMark);
      expect(preset.assets.markOnDark.src).toBe(
        "/brands/shared/mark-white.png",
      );
    },
  );

  it("contains one complete preset for every SIRA site", () => {
    expect(Object.keys(BRAND_PRESETS).sort()).toEqual(
      [...SITE_KEYS].sort(),
    );
  });

  it("provides the full SIRA logo only to the Group preset", () => {
    expect(BRAND_PRESETS.group.assets.logo?.src).toBe(
      "/brands/group/logo.png",
    );

    for (const siteKey of SITE_KEYS.filter((key) => key !== "group")) {
      expect(BRAND_PRESETS[siteKey].assets.logo).toBeNull();
    }
  });

  it("selects an AA foreground for every approved accent", () => {
    expect(createFallbackBrand("group").semantic.onAccent).toBe("#20242b");
    expect(createFallbackBrand("consulting").semantic.onAccent).toBe(
      "#f8f4fa",
    );
    expect(createFallbackBrand("healthcare").semantic.onAccent).toBe(
      "#f3f7fb",
    );
    expect(createFallbackBrand("lifestyle").semantic.onAccent).toBe(
      "#000000",
    );
    expect(createFallbackBrand("realestate").semantic.onAccent).toBe(
      "#000000",
    );
  });
});
