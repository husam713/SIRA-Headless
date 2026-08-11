import { describe, expect, it, vi } from "vitest";
import {
  PROJECT_SINGLE_CACHE_TAGS,
  resolveProjectSingle,
} from "@/lib/projects/get-project-single";
import { normalizeProjectSingle } from "@/lib/projects/normalize-project-single";
import type { SiraProjectSingleQueryData } from "@/queries/project-single";

type ProjectNode = NonNullable<
  SiraProjectSingleQueryData["siraProject"]
>;
type ProjectDetails = NonNullable<ProjectNode["projectDetails"]>;
type GalleryNode = NonNullable<ProjectDetails["gallery"]>["nodes"][number];
type RelatedNode = NonNullable<
  ProjectDetails["relatedCompany"]
>["nodes"][number];

function createGalleryImage(
  databaseId: number,
  overrides: Partial<GalleryNode> = {},
): GalleryNode {
  return {
    databaseId,
    sourceUrl: `https://media.example/project-${databaseId}.jpg`,
    altText: `Image ${databaseId}`,
    isRestricted: false,
    mediaDetails: { width: 1200, height: 800 },
    ...overrides,
  };
}

function createCompany(
  databaseId: number,
  overrides: Partial<RelatedNode> = {},
): RelatedNode {
  return {
    __typename: "SiraCompany",
    databaseId,
    isRestricted: false,
    title: `Company ${databaseId}`,
    uri: `/companies/company-${databaseId}/`,
    ...overrides,
  } as RelatedNode;
}

function createProject(
  overrides: Partial<ProjectNode> = {},
): ProjectNode {
  return {
    databaseId: 42,
    title: "Project Forty Two",
    uri: "/projects/project-forty-two/",
    excerpt: "<p>Public summary.</p>",
    content: "<section><h2>Rich body</h2><p>Keep markup.</p></section>",
    isRestricted: false,
    featuredImage: null,
    projectDetails: {
      subtitle: "Sustainable landmark",
      location: "Riyadh",
      status: "Completed",
      gallery: {
        pageInfo: { hasNextPage: false, endCursor: null },
        nodes: [],
      },
      statistics: [],
      relatedCompany: {
        pageInfo: { hasNextPage: false, endCursor: null },
        nodes: [],
      },
    },
    ...overrides,
  };
}

function createData(
  overrides: Partial<ProjectNode> = {},
): SiraProjectSingleQueryData {
  return { siraProject: createProject(overrides) };
}

describe("project single normalization", () => {
  it("normalizes a valid immutable detail result in source order", () => {
    const richContent = "<section><h2>Rich body</h2><p>Keep markup.</p></section>";
    const result = normalizeProjectSingle(
      "consulting",
      "/projects/project-forty-two/",
      createData({
        title: " <strong>Project Forty Two</strong> ",
        content: richContent,
        featuredImage: { node: createGalleryImage(90) },
        projectDetails: {
          subtitle: " <em>Sustainable landmark</em> ",
          location: "Riyadh",
          status: "Completed",
          gallery: {
            pageInfo: { hasNextPage: false, endCursor: null },
            nodes: [createGalleryImage(12), createGalleryImage(7)],
          },
          statistics: [
            { label: "Area", value: "20,000 m²" },
            { label: "Duration", value: "24 months" },
          ],
          relatedCompany: {
            pageInfo: { hasNextPage: false, endCursor: null },
            nodes: [createCompany(8), createCompany(3)],
          },
        },
      }),
    );

    if (result.status !== "ready") {
      throw new Error("Expected a ready project single result.");
    }

    expect(result.project.title).toBe("Project Forty Two");
    expect(result.project.content).toBe(richContent);
    expect(result.project.gallery.map(({ databaseId }) => databaseId)).toEqual([
      12, 7,
    ]);
    expect(
      result.project.statistics.map(({ label }) => label),
    ).toEqual(["Area", "Duration"]);
    expect(
      result.project.relatedCompanies.map(({ databaseId }) => databaseId),
    ).toEqual([8, 3]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.project)).toBe(true);
    expect(Object.isFrozen(result.project.gallery)).toBe(true);
  });

  it("maps a native null lookup to not-found", () => {
    expect(
      normalizeProjectSingle("group", "/projects/missing/", {
        siraProject: null,
      }),
    ).toEqual({ status: "not-found", siteKey: "group" });
  });

  it("maps a restricted project to non-disclosing not-found", () => {
    expect(
      normalizeProjectSingle(
        "healthcare",
        "/projects/project-forty-two/",
        createData({
          isRestricted: true,
          content: "Private content must not escape.",
        }),
      ),
    ).toEqual({ status: "not-found", siteKey: "healthcare" });
  });

  it("rejects malformed identity and locator mismatches", () => {
    expect(
      normalizeProjectSingle(
        "group",
        "/projects/project-forty-two/",
        createData({ databaseId: 0 }),
      ),
    ).toMatchObject({ status: "invalid", reason: "invalid-project" });
    expect(
      normalizeProjectSingle(
        "group",
        "/projects/project-forty-two/",
        createData({ uri: "/projects/another-project/" }),
      ),
    ).toMatchObject({ status: "invalid", reason: "locator-mismatch" });
  });

  it("does not propagate unsafe project, featured, or gallery URLs", () => {
    expect(
      normalizeProjectSingle(
        "group",
        "/projects/project-forty-two/",
        createData({ uri: "//evil.example/project" }),
      ),
    ).toMatchObject({ status: "invalid", reason: "invalid-project" });

    const result = normalizeProjectSingle(
      "group",
      "/projects/project-forty-two/",
      createData({
        featuredImage: {
          node: createGalleryImage(90, { sourceUrl: "javascript:alert(1)" }),
        },
        projectDetails: {
          ...createProject().projectDetails,
          gallery: {
            pageInfo: { hasNextPage: false, endCursor: null },
            nodes: [
              createGalleryImage(2, { sourceUrl: "data:image/png;base64,abc" }),
            ],
          },
        } as ProjectDetails,
      }),
    );

    if (result.status !== "ready") {
      throw new Error("Expected unsafe optional media to be omitted.");
    }

    expect(result.project.featuredImage).toBeNull();
    expect(result.project.gallery).toEqual([]);
    expect(result.project.diagnostics.map(({ code }) => code)).toEqual([
      "invalid-featured-image",
      "invalid-gallery-image",
    ]);
  });

  it("fails closed on duplicate or truncated gallery data", () => {
    for (const [gallery, reason] of [
      [
        {
          pageInfo: { hasNextPage: false, endCursor: null },
          nodes: [createGalleryImage(5), createGalleryImage(5)],
        },
        "duplicate-gallery-identity",
      ],
      [
        {
          pageInfo: { hasNextPage: true, endCursor: "next-gallery" },
          nodes: [createGalleryImage(5)],
        },
        "truncated-gallery",
      ],
    ] as const) {
      const result = normalizeProjectSingle(
        "group",
        "/projects/project-forty-two/",
        createData({
          projectDetails: {
            ...createProject().projectDetails,
            gallery,
          } as ProjectDetails,
        }),
      );

      expect(result).toMatchObject({ status: "invalid", reason });
    }
  });

  it("normalizes statistics conservatively without fabricating entries", () => {
    const result = normalizeProjectSingle(
      "group",
      "/projects/project-forty-two/",
      createData({
        projectDetails: {
          ...createProject().projectDetails,
          statistics: [
            { label: " <b>Area</b> ", value: " 20,000 m² " },
            { label: "", value: "missing label" },
            null,
            { label: "Duration", value: "24 months" },
          ],
        } as ProjectDetails,
      }),
    );

    if (result.status !== "ready") {
      throw new Error("Expected a ready result with diagnostics.");
    }

    expect(result.project.statistics).toEqual([
      { label: "Area", value: "20,000 m²" },
      { label: "Duration", value: "24 months" },
    ]);
    expect(result.project.diagnostics).toEqual([
      { code: "invalid-statistic", databaseId: null },
      { code: "invalid-statistic", databaseId: null },
    ]);
  });

  it("keeps only minimal safe public related companies", () => {
    const result = normalizeProjectSingle(
      "realestate",
      "/projects/project-forty-two/",
      createData({
        projectDetails: {
          ...createProject().projectDetails,
          relatedCompany: {
            pageInfo: { hasNextPage: false, endCursor: null },
            nodes: [
              createCompany(1),
              createCompany(2, { uri: "https://user:pass@example.com/" }),
              createCompany(3, { isRestricted: true }),
              {
                __typename: "Post",
                databaseId: 4,
                isRestricted: false,
              } as RelatedNode,
            ],
          },
        } as ProjectDetails,
      }),
    );

    if (result.status !== "ready") {
      throw new Error("Expected a ready result with safe companies.");
    }

    expect(result.project.relatedCompanies).toEqual([
      {
        databaseId: 1,
        title: "Company 1",
        href: "/companies/company-1/",
      },
    ]);
    expect(result.project.diagnostics.map(({ code }) => code)).toEqual([
      "invalid-related-company",
      "restricted-related-company",
      "unsupported-related-node",
    ]);
  });

  it("fails closed on duplicate or truncated related companies", () => {
    for (const [relatedCompany, reason] of [
      [
        {
          pageInfo: { hasNextPage: false, endCursor: null },
          nodes: [createCompany(5), createCompany(5)],
        },
        "duplicate-related-company-identity",
      ],
      [
        {
          pageInfo: { hasNextPage: true, endCursor: "next-company" },
          nodes: [createCompany(5)],
        },
        "truncated-related-companies",
      ],
    ] as const) {
      const result = normalizeProjectSingle(
        "group",
        "/projects/project-forty-two/",
        createData({
          projectDetails: {
            ...createProject().projectDetails,
            relatedCompany,
          } as ProjectDetails,
        }),
      );

      expect(result).toMatchObject({ status: "invalid", reason });
    }
  });
});

describe("project single server adapter", () => {
  it("rejects invalid locators before transport", async () => {
    for (const locator of [
      "https://example.com/projects/one/",
      "//example.com/projects/one/",
      "/projects/one/?preview=1",
      "/projects/project one/",
      "javascript:alert(1)",
    ]) {
      const execute = vi.fn();
      const result = await resolveProjectSingle("group", locator, execute);

      expect(result).toMatchObject({
        status: "invalid",
        reason: "invalid-locator",
      });
      expect(execute).not.toHaveBeenCalled();
    }
  });

  it("passes only the validated URI to one tenant-scoped execution", async () => {
    const execute = vi.fn().mockResolvedValue(createData());

    const result = await resolveProjectSingle(
      "lifestyle",
      " /projects/project-forty-two/ ",
      execute,
    );

    expect(result.status).toBe("ready");
    expect(execute).toHaveBeenCalledOnce();
    expect(execute).toHaveBeenCalledWith({
      uri: "/projects/project-forty-two/",
    });
  });

  it("maps transport failures to remote-error without retry fallback", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const execute = vi.fn().mockRejectedValue(new TypeError("network down"));

    const result = await resolveProjectSingle(
      "healthcare",
      "/projects/project-forty-two/",
      execute,
    );

    expect(result).toEqual({
      status: "remote-error",
      siteKey: "healthcare",
      errorName: "TypeError",
    });
    expect(execute).toHaveBeenCalledOnce();
    expect(warning).toHaveBeenCalledOnce();
    warning.mockRestore();
  });

  it("uses the existing project post-type invalidation tag", () => {
    expect(PROJECT_SINGLE_CACHE_TAGS).toEqual(["post-type:sira_project"]);
    expect(Object.isFrozen(PROJECT_SINGLE_CACHE_TAGS)).toBe(true);
  });
});
