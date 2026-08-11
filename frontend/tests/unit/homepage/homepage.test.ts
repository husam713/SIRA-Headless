import { describe, expect, it, vi } from "vitest";
import { resolveHomepage } from "@/lib/homepage/get-homepage";
import { normalizeHomepage } from "@/lib/homepage/normalize-homepage";
import type { SiraHomepageQueryData } from "@/queries/homepage";

function createBranchHomepage(): SiraHomepageQueryData {
  return {
    page: {
      databaseId: 42,
      uri: "/",
      title: "Consulting",
      siraHomepage: {
        variant: "branch",
        groupHomepage: null,
        branchHomepage: {
          hero: {
            eyebrow: "  Consulting  ",
            headingBefore: "Strategy for",
            headingHighlight: "new markets",
            headingAfter: null,
            description: "  Deliberate   growth. ",
            region: "Riyadh",
          },
        },
      },
    },
  };
}

function createGroupHomepage(): SiraHomepageQueryData {
  return {
    page: {
      databaseId: 7,
      uri: "/",
      title: "SIRA Group",
      siraHomepage: {
        variant: "group",
        branchHomepage: null,
        groupHomepage: {
          hero: {
            headingBefore: "Shaping a",
            headingHighlight: "smarter",
            headingAfter: "future",
            description: "Long-term enterprise value.",
          },
        },
      },
    },
  };
}

describe("homepage server adapter", () => {
  it("normalizes the canonical Group variant", () => {
    expect(normalizeHomepage("group", createGroupHomepage())).toEqual({
      status: "ready",
      homepage: {
        siteKey: "group",
        databaseId: 7,
        uri: "/",
        title: "SIRA Group",
        variant: "group",
        hero: {
          headingBefore: "Shaping a",
          headingHighlight: "smarter",
          headingAfter: "future",
          description: "Long-term enterprise value.",
        },
      },
    });
  });

  it("normalizes the canonical shared Branch variant", () => {
    expect(
      normalizeHomepage("consulting", createBranchHomepage()),
    ).toEqual({
      status: "ready",
      homepage: {
        siteKey: "consulting",
        databaseId: 42,
        uri: "/",
        title: "Consulting",
        variant: "branch",
        hero: {
          eyebrow: "Consulting",
          headingBefore: "Strategy for",
          headingHighlight: "new markets",
          headingAfter: null,
          description: "Deliberate growth.",
          region: "Riyadh",
        },
      },
    });
  });

  it("represents a missing root page without fabricating another page", () => {
    expect(normalizeHomepage("healthcare", { page: null })).toEqual({
      status: "not-found",
      siteKey: "healthcare",
      reason: "homepage-not-configured",
    });
  });

  it("rejects a homepage variant that does not match the trusted site", () => {
    expect(
      normalizeHomepage("group", createBranchHomepage()),
    ).toEqual({
      status: "invalid",
      siteKey: "group",
      reason: "variant-mismatch",
    });
  });

  it("reports an unsupported homepage data shape explicitly", () => {
    const data = createBranchHomepage();
    const invalidData: SiraHomepageQueryData = {
      page:
        data.page === null
          ? null
          : {
              ...data.page,
              siraHomepage: null,
            },
    };

    expect(normalizeHomepage("consulting", invalidData)).toEqual({
      status: "invalid",
      siteKey: "consulting",
      reason: "missing-homepage-data",
    });
  });

  it("maps remote failures to a stable server result", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      resolveHomepage("lifestyle", async () => {
        throw new Error("endpoint unavailable");
      }),
    ).resolves.toEqual({
      status: "remote-error",
      siteKey: "lifestyle",
      errorName: "Error",
    });

    expect(warning).toHaveBeenCalledWith(
      "SIRA homepage query failed.",
      expect.objectContaining({
        siteKey: "lifestyle",
        errorName: "Error",
      }),
    );

    warning.mockRestore();
  });
});
