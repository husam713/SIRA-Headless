import { afterEach, describe, expect, it, vi } from "vitest";
import type { GraphQLErrorSummary } from "@/lib/graphql/errors";
import type { TolerantGraphQLResult } from "@/lib/graphql";
import { resolveHomepage } from "@/lib/homepage/get-homepage";
import { normalizeHomepage } from "@/lib/homepage/normalize-homepage";
import type { SiraHomepageQueryData } from "@/queries/homepage";

// The resilience boundary, stated as tests:
//   CRITICAL  page envelope, siraHomepage, variant, variant field group
//   TOLERANT  every presentation section, hero included

type HomepagePage = NonNullable<SiraHomepageQueryData["page"]>;

const GROUP_HERO = {
  headingBefore: "Shaping a",
  headingHighlight: "smarter",
  headingAfter: "future",
  description: "Group hero description.",
  primaryCta: null,
  secondaryCta: null,
  slides: null,
};

const CONTACT = {
  eyebrow: "Contact",
  heading: "Contact heading",
  description: "Contact description.",
  formVariant: null,
  formContext: null,
};

function groupPage(
  sections: Readonly<Record<string, unknown>>,
): SiraHomepageQueryData {
  return {
    page: {
      databaseId: 7,
      uri: "/",
      title: "SIRA Group",
      siraHomepage: { variant: "group" },
      groupHomepage: sections,
      branchHomepage: null,
    } as unknown as HomepagePage,
  };
}

const BRANCH_HERO = {
  eyebrow: "Consulting",
  headingBefore: "Strategy for",
  headingHighlight: "new markets",
  headingAfter: null,
  description: "Branch hero description.",
  region: "Riyadh",
  imageAlt: null,
  image: null,
  mobileImage: null,
  primaryCta: null,
  secondaryCta: null,
};

function branchPage(
  sections: Readonly<Record<string, unknown>>,
): SiraHomepageQueryData {
  return {
    page: {
      databaseId: 42,
      uri: "/",
      title: "SIRA Consulting",
      siraHomepage: { variant: "branch" },
      groupHomepage: null,
      branchHomepage: sections,
    } as unknown as HomepagePage,
  };
}

function tolerated(
  data: SiraHomepageQueryData,
  errors: readonly GraphQLErrorSummary[] = [],
): TolerantGraphQLResult<SiraHomepageQueryData> {
  return Object.freeze({
    data,
    errors,
    operationName: "SiraHomepage",
    requestId: "11111111-2222-3333-4444-555555555555",
  });
}

function fieldError(
  path: readonly (string | number)[] | null,
  message = "Internal server error",
): GraphQLErrorSummary {
  return Object.freeze({
    message,
    path: path === null ? null : Object.freeze([...path]),
    code: "INTERNAL_SERVER_ERROR",
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("homepage critical boundary", () => {
  it("keeps a null page critical", () => {
    const resolution = normalizeHomepage("group", {
      page: null,
    } as SiraHomepageQueryData);

    expect(resolution.status).toBe("not-found");
  });

  it("keeps a missing siraHomepage record critical", () => {
    const resolution = normalizeHomepage("group", {
      page: {
        databaseId: 7,
        uri: "/",
        title: "SIRA Group",
        siraHomepage: null,
        groupHomepage: { hero: GROUP_HERO },
      } as unknown as HomepagePage,
    });

    expect(resolution).toMatchObject({
      status: "invalid",
      reason: "missing-homepage-data",
    });
  });

  it("keeps a variant mismatch critical", () => {
    const resolution = normalizeHomepage("consulting", groupPage({ hero: GROUP_HERO }));

    expect(resolution).toMatchObject({
      status: "invalid",
      reason: "variant-mismatch",
    });
  });

  it("keeps a missing variant field group critical", () => {
    const resolution = normalizeHomepage("group", {
      page: {
        databaseId: 7,
        uri: "/",
        title: "SIRA Group",
        siraHomepage: { variant: "group" },
        groupHomepage: null,
        branchHomepage: null,
      } as unknown as HomepagePage,
    });

    expect(resolution).toMatchObject({
      status: "invalid",
      reason: "missing-variant-data",
    });
  });
});

describe("homepage tolerant boundary", () => {
  it("renders without a hero instead of collapsing the page", () => {
    const resolution = normalizeHomepage(
      "group",
      groupPage({ hero: null, contact: CONTACT }),
    );

    expect(resolution.status).toBe("ready");

    if (resolution.status !== "ready") return;
    if (resolution.homepage.variant !== "group") return;

    expect(resolution.homepage.hero).toBeNull();
    expect(resolution.homepage.contact).not.toBeNull();
  });

  it("attributes a mapped error path to its section", () => {
    const resolution = normalizeHomepage(
      "group",
      groupPage({ hero: null, contact: CONTACT }),
      [fieldError(["page", "groupHomepage", "hero"])],
    );

    if (resolution.status !== "ready") throw new Error("expected ready");
    if (resolution.homepage.variant !== "group") throw new Error("expected group");

    expect(resolution.homepage.diagnostics).toEqual([
      { code: "graphql-field-error", databaseId: null, section: "hero" },
    ]);
  });

  it("records an unmappable error without inventing a section", () => {
    const resolution = normalizeHomepage(
      "group",
      groupPage({ hero: GROUP_HERO, contact: CONTACT }),
      [
        fieldError(["page", "somethingElse", "hero"]),
        fieldError(null),
        fieldError(["page", "groupHomepage", "notASection"]),
      ],
    );

    if (resolution.status !== "ready") throw new Error("expected ready");
    if (resolution.homepage.variant !== "group") throw new Error("expected group");

    expect(resolution.homepage.diagnostics).toEqual([
      { code: "graphql-field-error", databaseId: null, section: null },
      { code: "graphql-field-error", databaseId: null, section: null },
      { code: "graphql-field-error", databaseId: null, section: null },
    ]);
  });

  it("carries no diagnostics when nothing failed", () => {
    const resolution = normalizeHomepage(
      "group",
      groupPage({ hero: GROUP_HERO, contact: CONTACT }),
    );

    if (resolution.status !== "ready") throw new Error("expected ready");

    expect(resolution.homepage.diagnostics).toEqual([]);
  });
});

// WPGraphQL error paths point at the exact failing field, so they are usually
// deeper than the section itself: a hero slide image, a project's featured
// image. Mapping has to reach the section through that depth, and refuse
// everything it cannot attribute with certainty.
describe("error path to section mapping", () => {
  function groupSections(
    path: readonly (string | number)[] | null,
  ): readonly { code: string; databaseId: number | null; section: string | null }[] {
    const resolution = normalizeHomepage(
      "group",
      groupPage({ hero: GROUP_HERO, contact: CONTACT }),
      [fieldError(path)],
    );

    if (resolution.status !== "ready") throw new Error("expected ready");

    return [...resolution.homepage.diagnostics];
  }

  it("maps a deep group hero path to hero", () => {
    expect(
      groupSections(["page", "groupHomepage", "hero", "slides", 0, "imageOverride"]),
    ).toEqual([{ code: "graphql-field-error", databaseId: null, section: "hero" }]);
  });

  it("maps a deep branch projects path to projects", () => {
    const resolution = normalizeHomepage(
      "consulting",
      branchPage({ hero: BRANCH_HERO }),
      [fieldError(["page", "branchHomepage", "projects", "nodes", 0, "featuredImage"])],
    );

    if (resolution.status !== "ready") throw new Error("expected ready");

    expect(resolution.homepage.diagnostics).toEqual([
      { code: "graphql-field-error", databaseId: null, section: "projects" },
    ]);
  });

  it("refuses to map a path from the wrong variant envelope", () => {
    // A branch-shaped path arriving on a group page names a real section, but
    // not one this page rendered. Attributing it would blame a healthy section.
    expect(
      groupSections(["page", "branchHomepage", "hero"]),
    ).toEqual([{ code: "graphql-field-error", databaseId: null, section: null }]);
  });

  it("refuses to map a path that does not start at page", () => {
    expect(
      groupSections(["viewer", "groupHomepage", "hero"]),
    ).toEqual([{ code: "graphql-field-error", databaseId: null, section: null }]);
  });

  it("refuses to map a missing path", () => {
    expect(groupSections(null)).toEqual([
      { code: "graphql-field-error", databaseId: null, section: null },
    ]);
  });

  it("refuses to map a path that is too short to name a section", () => {
    expect(groupSections(["page", "groupHomepage"])).toEqual([
      { code: "graphql-field-error", databaseId: null, section: null },
    ]);
    expect(groupSections([])).toEqual([
      { code: "graphql-field-error", databaseId: null, section: null },
    ]);
  });

  it("refuses to map an unknown field name in the right envelope", () => {
    expect(
      groupSections(["page", "groupHomepage", "notASection"]),
    ).toEqual([{ code: "graphql-field-error", databaseId: null, section: null }]);
  });

  it("refuses to map a numeric segment where a section name belongs", () => {
    expect(groupSections(["page", "groupHomepage", 0])).toEqual([
      { code: "graphql-field-error", databaseId: null, section: null },
    ]);
  });
});

describe("resolveHomepage with tolerated partial data", () => {
  it("renders the valid sections and records the failure", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const resolution = await resolveHomepage("group", async () =>
      tolerated(groupPage({ hero: null, contact: CONTACT }), [
        fieldError(["page", "groupHomepage", "hero"]),
      ]),
    );

    expect(resolution.status).toBe("ready");

    if (resolution.status !== "ready") return;
    if (resolution.homepage.variant !== "group") return;

    expect(resolution.homepage.hero).toBeNull();
    expect(resolution.homepage.contact).not.toBeNull();
    expect(resolution.homepage.diagnostics).toHaveLength(1);
  });

  it("logs sanitized field context and never the GraphQL message", async () => {
    const warn = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    await resolveHomepage("group", async () =>
      tolerated(groupPage({ hero: null, contact: CONTACT }), [
        fieldError(
          ["page", "groupHomepage", "hero"],
          "SQLSTATE[42S02] table wp_2_postmeta missing",
        ),
      ]),
    );

    expect(warn).toHaveBeenCalledWith(
      "SIRA homepage query returned partial data.",
      {
        siteKey: "group",
        operationName: "SiraHomepage",
        requestId: "11111111-2222-3333-4444-555555555555",
        failedFields: [
          { path: ["page", "groupHomepage", "hero"], code: "INTERNAL_SERVER_ERROR" },
        ],
      },
    );

    const serialized = JSON.stringify(warn.mock.calls);

    expect(serialized).not.toContain("SQLSTATE");
    expect(serialized).not.toContain("wp_2_postmeta");
  });

  it("still degrades to remote-error when the transport fails closed", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const resolution = await resolveHomepage("group", async () => {
      throw new Error("GraphQLResponseError");
    });

    expect(resolution.status).toBe("remote-error");
  });
});
