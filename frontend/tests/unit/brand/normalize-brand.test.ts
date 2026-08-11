import { describe, expect, it } from "vitest";
import { normalizeWordPressBrand } from "@/lib/brand/normalize-brand";
import type { SiraBrandQueryData } from "@/queries/brand";

function createBrand(
  overrides: Partial<SiraBrandQueryData["siraBrand"]> = {},
): SiraBrandQueryData["siraBrand"] {
  return {
    name: "SIRA Consulting",
    key: "consulting",
    tagline: "Strategy for new markets.",
    primaryColor: "#8B5AAE",
    secondaryColor: "#2B1F36",
    accentColor: "#8B5AAE",
    paperColor: "#F8F4FA",
    inkColor: "#29232D",
    logo: null,
    mark: null,
    email: null,
    phone: null,
    address: null,
    description: null,
    mission: null,
    vision: null,
    values: null,
    officeLocations: null,
    socialProfiles: null,
    announcementBanner: null,
    emergencyBanner: null,
    announcement: null,
    emergency: null,
    ...overrides,
  };
}

describe("normalizeWordPressBrand", () => {
  it("accepts and lowercases the five WordPress-owned colors", () => {
    const brand = normalizeWordPressBrand("consulting", createBrand());

    expect(brand.source).toBe("wordpress");
    expect(brand.identity).toEqual({
      primary: "#8b5aae",
      secondary: "#2b1f36",
      accent: "#8b5aae",
      paper: "#f8f4fa",
      ink: "#29232d",
    });
  });

  it("falls back per invalid identity color without accepting arbitrary CSS", () => {
    const brand = normalizeWordPressBrand(
      "consulting",
      createBrand({
        accentColor: "url(javascript:alert(1))",
        paperColor: "oklch(0.9 0.1 300)",
      }),
    );

    expect(brand.source).toBe("wordpress-normalized");
    expect(brand.identity.accent).toBe("#8b5aae");
    expect(brand.identity.paper).toBe("#f8f4fa");
    expect(brand.diagnostics).toEqual([
      "invalid-accent-color",
      "invalid-paper-color",
    ]);
  });

  it("fails closed to the requested site preset on a brand-key mismatch", () => {
    const brand = normalizeWordPressBrand(
      "healthcare",
      createBrand({
        key: "consulting",
      }),
    );

    expect(brand.source).toBe("fallback");
    expect(brand.key).toBe("healthcare");
    expect(brand.identity.accent).toBe("#2c6dad");
    expect(brand.diagnostics).toContain("brand-key-mismatch");
  });

  it("accepts only HTTPS remote media and positive dimensions", () => {
    const brand = normalizeWordPressBrand(
      "consulting",
      createBrand({
        mark: {
          databaseId: 41,
          sourceUrl: "https://cms.example.test/mark.png",
          altText: "Consulting mark",
          width: 285,
          height: 274,
          mediaItem: null,
        },
      }),
    );

    expect(brand.remoteMark).toEqual({
      databaseId: 41,
      sourceUrl: "https://cms.example.test/mark.png",
      altText: "Consulting mark",
      width: 285,
      height: 274,
    });

    const rejected = normalizeWordPressBrand(
      "consulting",
      createBrand({
        mark: {
          databaseId: 41,
          sourceUrl: "http://cms.example.test/mark.png",
          altText: "Consulting mark",
          width: 285,
          height: 274,
          mediaItem: null,
        },
      }),
    );

    expect(rejected.remoteMark).toBeNull();
  });
});
