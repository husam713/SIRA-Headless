import { describe, expect, it } from "vitest";
import {
  createBrandCssVariables,
  DERIVED_BRAND_TOKEN_NAMES,
  WORDPRESS_BRAND_TOKEN_NAMES,
} from "@/lib/brand/css-variables";
import { createFallbackBrand } from "@/lib/brand/fallbacks";

describe("SIRA brand CSS-variable contract", () => {
  it("contains exactly five WordPress-owned identity tokens", () => {
    expect(WORDPRESS_BRAND_TOKEN_NAMES).toEqual([
      "--brand-primary",
      "--brand-secondary",
      "--brand-accent",
      "--brand-paper",
      "--brand-ink",
    ]);
  });

  it("contains the approved normalized semantic tokens", () => {
    expect(DERIVED_BRAND_TOKEN_NAMES).toEqual(
      expect.arrayContaining([
        "--brand-accent-bright",
        "--brand-on-accent",
        "--brand-paper-glass",
        "--brand-ink-soft",
        "--brand-ink-faint",
        "--brand-deep",
        "--brand-deep-card",
        "--brand-footer",
        "--brand-tint",
        "--brand-border",
        "--brand-shadow",
      ]),
    );
  });

  it("renders every token server-side", () => {
    const variables = createBrandCssVariables(
      createFallbackBrand("healthcare"),
    );

    for (const tokenName of [
      ...WORDPRESS_BRAND_TOKEN_NAMES,
      ...DERIVED_BRAND_TOKEN_NAMES,
    ]) {
      expect(variables[tokenName]).toBeTypeOf("string");
      expect(variables[tokenName]).not.toBe("");
    }
  });
});
