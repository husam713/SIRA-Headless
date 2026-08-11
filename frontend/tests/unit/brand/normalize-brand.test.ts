import { describe, expect, it } from "vitest";
import { normalizeWordPressBrand } from "@/lib/brand/normalize-brand";
import type { SiraBrandQueryData } from "@/queries/brand";

type BrandBannerInput = NonNullable<
  SiraBrandQueryData["siraBrand"]["announcement"]
>;

function createBanner(
  overrides: Partial<BrandBannerInput> = {},
): BrandBannerInput {
  return {
    message: "Scheduled maintenance",
    severity: "INFO",
    link: null,
    startsAt: "2026-08-12T08:00:00Z",
    endsAt: "2026-08-12T09:00:00Z",
    dismissible: true,
    revisionKey: "banner-revision-1",
    ...overrides,
  };
}

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

  it("normalizes the typed announcement contract", () => {
    const brand = normalizeWordPressBrand(
      "consulting",
      createBrand({
        announcement: createBanner({
          message: "  Scheduled   maintenance  ",
          link: {
            label: " Service status ",
            url: "/status?source=banner",
            target: "_blank",
          },
          revisionKey: " revision-2 ",
        }),
      }),
    );

    expect(brand.announcement).toEqual({
      message: "Scheduled maintenance",
      severity: "INFO",
      link: {
        label: "Service status",
        url: "/status?source=banner",
        target: "_blank",
      },
      startsAt: "2026-08-12T08:00:00Z",
      endsAt: "2026-08-12T09:00:00Z",
      dismissible: true,
      revisionKey: "revision-2",
    });
  });

  it("normalizes the typed emergency contract without reinterpreting schedule fields", () => {
    const brand = normalizeWordPressBrand(
      "consulting",
      createBrand({
        emergency: createBanner({
          message: "Office closed",
          severity: "URGENT",
          startsAt: "2026-08-13T10:15:00+03:00",
          endsAt: null,
          dismissible: false,
          revisionKey: "emergency-7",
        }),
      }),
    );

    expect(brand.emergency).toEqual({
      message: "Office closed",
      severity: "URGENT",
      link: null,
      startsAt: "2026-08-13T10:15:00+03:00",
      endsAt: null,
      dismissible: false,
      revisionKey: "emergency-7",
    });
  });

  it("keeps nullable typed banners and legacy strings independently", () => {
    const brand = normalizeWordPressBrand(
      "consulting",
      createBrand({
        announcementBanner: "Legacy announcement",
        emergencyBanner: "Legacy emergency",
        announcement: null,
        emergency: null,
      }),
    );

    expect(brand.announcementBanner).toBe("Legacy announcement");
    expect(brand.emergencyBanner).toBe("Legacy emergency");
    expect(brand.announcement).toBeNull();
    expect(brand.emergency).toBeNull();
  });

  it.each([
    "javascript:alert(1)",
    "//attacker.example/path",
    "not a public URL",
  ])("nulls an unsafe typed banner link: %s", (url) => {
    const brand = normalizeWordPressBrand(
      "consulting",
      createBrand({
        announcement: createBanner({
          link: {
            label: "Unsafe link",
            url,
            target: "_self",
          },
        }),
      }),
    );

    expect(brand.announcement?.link).toBeNull();
    expect(brand.source).toBe("wordpress-normalized");
    expect(brand.diagnostics).toContain("invalid-announcement-link");
  });
});
