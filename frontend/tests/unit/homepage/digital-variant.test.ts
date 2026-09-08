import { describe, expect, it } from "vitest";
import { normalizeHomepage } from "@/lib/homepage/normalize-homepage";
import type { SiraHomepageQueryData } from "@/queries/homepage";

// ADR-033. The Digital variant is the third homepage shape, and the thing most
// likely to go wrong with it is silence: falling back to `branch` and rendering
// SIRA Digital as a fifth branch site without anybody noticing. Several of the
// assertions below exist for exactly that.
//
// `digitalHomepage` is not in the checked-in GraphQL schema yet — it is
// registered in backend source, and refreshing the schema needs the live
// endpoint — so these fixtures are cast at the boundary the same way the
// normalizer reads the field.

interface DigitalFixtureOptions {
  readonly variant?: string;
  readonly withFieldGroup?: boolean;
  readonly sections?: Readonly<Record<string, unknown>>;
}

function digitalData({
  variant = "digital",
  withFieldGroup = true,
  sections = {},
}: DigitalFixtureOptions = {}): SiraHomepageQueryData {
  return {
    page: {
      databaseId: 77,
      uri: "/",
      title: "SIRA Digital",
      siraHomepage: { variant },
      groupHomepage: null,
      branchHomepage: null,
      ...(withFieldGroup ? { digitalHomepage: sections } : {}),
    },
  } as unknown as SiraHomepageQueryData;
}

describe("the Digital homepage variant", () => {
  it("expects its own variant rather than falling through to branch", () => {
    // The regression this guards: `siteKey === "group" ? "group" : "branch"`
    // would have accepted a branch payload here and rendered the branch
    // composition on sirahdigital.sa.
    const resolution = normalizeHomepage("digital", digitalData({ variant: "branch" }));

    expect(resolution).toMatchObject({
      status: "invalid",
      siteKey: "digital",
      reason: "variant-mismatch",
    });
  });

  it("treats a missing field group as unrecoverable, like the other variants", () => {
    expect(
      normalizeHomepage("digital", digitalData({ withFieldGroup: false })),
    ).toMatchObject({ status: "invalid", reason: "missing-variant-data" });
  });

  it("resolves with every section absent", () => {
    // Only the envelope is critical. An unauthored Digital homepage is a page
    // with no sections, not a broken page.
    const resolution = normalizeHomepage("digital", digitalData());

    expect(resolution.status).toBe("ready");
    if (resolution.status !== "ready") return;
    expect(resolution.homepage.variant).toBe("digital");
    if (resolution.homepage.variant !== "digital") return;

    expect(resolution.homepage.hero).toBeNull();
    expect(resolution.homepage.capabilities).toEqual([]);
    expect(resolution.homepage.marquee).toBeNull();
    expect(resolution.homepage.wordmark).toBeNull();
  });

  it("does not keep a hero that carries only an eyebrow", () => {
    // Same keep-threshold as the branch hero, for the same reason: the panel is
    // a full screen of dark ground gated on a heading, and an eyebrow alone
    // fills none of it.
    const resolution = normalizeHomepage(
      "digital",
      digitalData({ sections: { hero: { eyebrow: "Capabilities" } } }),
    );

    expect(resolution.status).toBe("ready");
    if (resolution.status !== "ready" || resolution.homepage.variant !== "digital") return;
    expect(resolution.homepage.hero).toBeNull();
  });

  it("keeps a hero once it carries a heading", () => {
    const resolution = normalizeHomepage(
      "digital",
      digitalData({
        sections: {
          hero: {
            eyebrow: "SIRA Digital",
            headingBefore: "Systems that",
            headingHighlight: "run the work",
            description: "  Spaced description.  ",
          },
        },
      }),
    );

    expect(resolution.status).toBe("ready");
    if (resolution.status !== "ready" || resolution.homepage.variant !== "digital") return;
    expect(resolution.homepage.hero).toMatchObject({
      eyebrow: "SIRA Digital",
      headingBefore: "Systems that",
      headingHighlight: "run the work",
      description: "Spaced description.",
    });
  });

  describe("the capability rail", () => {
    it("drops an entry with neither a title nor a summary", () => {
      const resolution = normalizeHomepage(
        "digital",
        digitalData({
          sections: {
            capabilities: [
              { title: "Workflow automation", summary: "One line." },
              { title: null, summary: null, link: null },
              { title: "   ", summary: "" },
              { title: null, summary: "Summary only is enough." },
            ],
          },
        }),
      );

      expect(resolution.status).toBe("ready");
      if (resolution.status !== "ready" || resolution.homepage.variant !== "digital") return;
      expect(resolution.homepage.capabilities).toHaveLength(2);
      expect(resolution.homepage.capabilities[0]?.title).toBe("Workflow automation");
      expect(resolution.homepage.capabilities[1]?.summary).toBe(
        "Summary only is enough.",
      );
    });

    it("caps the rail so it stays a reading surface", () => {
      const resolution = normalizeHomepage(
        "digital",
        digitalData({
          sections: {
            capabilities: Array.from({ length: 30 }, (_unused, index) => ({
              title: `Capability ${String(index)}`,
              summary: "Summary.",
            })),
          },
        }),
      );

      if (resolution.status !== "ready" || resolution.homepage.variant !== "digital") return;
      expect(resolution.homepage.capabilities).toHaveLength(12);
    });

    it("ignores a capabilities value that is not a list", () => {
      const resolution = normalizeHomepage(
        "digital",
        digitalData({ sections: { capabilities: "not a list" } }),
      );

      if (resolution.status !== "ready" || resolution.homepage.variant !== "digital") return;
      expect(resolution.homepage.capabilities).toEqual([]);
    });
  });

  describe("the marquee", () => {
    it("accepts both plain strings and labelled rows", () => {
      // ACF repeaters arrive as rows of fields; a simpler list field arrives as
      // strings. Both spellings are real, so both are read.
      const resolution = normalizeHomepage(
        "digital",
        digitalData({
          sections: {
            marquee: {
              heading: "Across the Kingdom",
              items: ["Energy", { label: "Logistics" }, null, { label: "   " }],
            },
          },
        }),
      );

      if (resolution.status !== "ready" || resolution.homepage.variant !== "digital") return;
      expect(resolution.homepage.marquee?.items).toEqual(["Energy", "Logistics"]);
      expect(resolution.homepage.marquee?.heading).toBe("Across the Kingdom");
    });

    it("caps the list so the loop does not look stalled", () => {
      const resolution = normalizeHomepage(
        "digital",
        digitalData({
          sections: {
            marquee: {
              items: Array.from({ length: 90 }, (_unused, index) => `Sector ${String(index)}`),
            },
          },
        }),
      );

      if (resolution.status !== "ready" || resolution.homepage.variant !== "digital") return;
      expect(resolution.homepage.marquee?.items).toHaveLength(40);
    });
  });

  describe("the kinetic wordmark", () => {
    it("returns nothing without a word to set", () => {
      // The lockup is a caption. A caption with nothing to caption is two
      // screens of empty ground.
      const resolution = normalizeHomepage(
        "digital",
        digitalData({
          sections: { wordmark: { word: null, lockup: "A supporting line." } },
        }),
      );

      if (resolution.status !== "ready" || resolution.homepage.variant !== "digital") return;
      expect(resolution.homepage.wordmark).toBeNull();
    });

    it("keeps the word, the lockup and the link together", () => {
      const resolution = normalizeHomepage(
        "digital",
        digitalData({
          sections: {
            wordmark: {
              word: "SIRA DIGITAL",
              lockup: "Systems that run the work.",
              link: { label: "See what we build", url: "/services", target: null },
            },
          },
        }),
      );

      if (resolution.status !== "ready" || resolution.homepage.variant !== "digital") return;
      expect(resolution.homepage.wordmark).toMatchObject({
        word: "SIRA DIGITAL",
        lockup: "Systems that run the work.",
      });
      expect(resolution.homepage.wordmark?.link?.href).toBe("/services");
    });
  });

  it("does not change how the other variants resolve", () => {
    // The variant expression became a three-way mapping. Group must still
    // expect `group`, and a branch tenant must still expect `branch`.
    const branchPayload = {
      page: {
        databaseId: 12,
        uri: "/",
        title: "SIRA Consulting",
        siraHomepage: { variant: "branch" },
        groupHomepage: null,
        branchHomepage: {},
      },
    } as unknown as SiraHomepageQueryData;

    expect(normalizeHomepage("consulting", branchPayload).status).toBe("ready");
    expect(normalizeHomepage("group", branchPayload)).toMatchObject({
      reason: "variant-mismatch",
    });
  });
});
