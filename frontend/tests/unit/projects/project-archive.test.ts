import { describe, expect, it, vi } from "vitest";
import {
  PROJECT_ARCHIVE_CACHE_TAGS,
  resolveProjectArchive,
} from "@/lib/projects/get-project-archive";
import { normalizeProjectArchive } from "@/lib/projects/normalize-project-archive";
import type { SiraProjectsQueryData } from "@/queries/projects";

type ProjectConnection = NonNullable<
  SiraProjectsQueryData["siraProjects"]
>;
type ProjectNode = ProjectConnection["nodes"][number];

function createNode(
  databaseId: number,
  overrides: Partial<ProjectNode> = {},
): ProjectNode {
  return {
    databaseId,
    title: `Project ${databaseId}`,
    uri: `/projects/project-${databaseId}/`,
    excerpt: `<p>Summary ${databaseId}</p>`,
    isRestricted: false,
    featuredImage: null,
    projectDetails: {
      subtitle: `Subtitle ${databaseId}`,
      location: "Riyadh",
      status: "Completed",
    },
    ...overrides,
  };
}

function createData(
  nodes: readonly ProjectNode[],
  pageInfo: ProjectConnection["pageInfo"] = {
    hasNextPage: false,
    endCursor: null,
  },
): SiraProjectsQueryData {
  return {
    siraProjects: {
      nodes,
      pageInfo,
    },
  };
}

describe("project archive server adapter", () => {
  it("normalizes a valid immutable archive page in source order", () => {
    const result = normalizeProjectArchive(
      "consulting",
      createData(
        [
          createNode(9, {
            title: "  <strong>Project Nine</strong>  ",
            excerpt: "<p>Useful&nbsp; summary.</p><script>bad()</script>",
            featuredImage: {
              node: {
                databaseId: 90,
                sourceUrl: "https://media.example/project-9.jpg",
                altText: "  Project cover  ",
                mediaDetails: { width: 1200, height: 800 },
              },
            },
          }),
          createNode(3),
        ],
        { hasNextPage: true, endCursor: "next-project-cursor" },
      ),
    );

    if (result.status !== "ready") {
      throw new Error("Expected a ready project archive.");
    }

    expect(result.page.items.map((item) => item.databaseId)).toEqual([9, 3]);
    expect(result.page.items[0]).toEqual({
      databaseId: 9,
      title: "Project Nine",
      href: "/projects/project-9/",
      excerpt: "Useful summary.",
      featuredImage: {
        databaseId: 90,
        sourceUrl: "https://media.example/project-9.jpg",
        altText: "Project cover",
        width: 1200,
        height: 800,
      },
      subtitle: "Subtitle 9",
      location: "Riyadh",
      status: "Completed",
    });
    expect(result.page.pageInfo).toEqual({
      hasNextPage: true,
      endCursor: "next-project-cursor",
    });
    expect(Object.isFrozen(result.page)).toBe(true);
    expect(Object.isFrozen(result.page.items)).toBe(true);
    expect(Object.isFrozen(result.page.items[0])).toBe(true);
  });

  it("returns empty without fabricated or cross-site fallback content", () => {
    expect(normalizeProjectArchive("healthcare", createData([]))).toEqual({
      status: "empty",
      siteKey: "healthcare",
      pageInfo: { hasNextPage: false, endCursor: null },
    });
  });

  it("rejects invalid pagination before transport", async () => {
    const execute = vi.fn();

    await expect(
      resolveProjectArchive(
        "realestate",
        { first: 0, after: null },
        execute,
      ),
    ).resolves.toMatchObject({
      status: "invalid",
      reason: "invalid-pagination-request",
    });
    await expect(
      resolveProjectArchive(
        "realestate",
        { first: 12, after: "bad\u0000cursor" },
        execute,
      ),
    ).resolves.toMatchObject({
      status: "invalid",
      reason: "invalid-pagination-request",
    });
    expect(execute).not.toHaveBeenCalled();

    execute.mockResolvedValue(createData([]));
    await resolveProjectArchive(
      "realestate",
      { first: 24, after: "opaque-project-cursor" },
      execute,
    );
    expect(execute).toHaveBeenCalledWith({
      first: 24,
      after: "opaque-project-cursor",
    });
  });

  it("maps remote failures to a stable site-bound result", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      resolveProjectArchive(
        "lifestyle",
        { first: 12, after: null },
        async () => {
          throw new Error("endpoint unavailable");
        },
      ),
    ).resolves.toEqual({
      status: "remote-error",
      siteKey: "lifestyle",
      errorName: "Error",
    });
    expect(warning).toHaveBeenCalledWith(
      "SIRA project archive query failed.",
      expect.objectContaining({ siteKey: "lifestyle", errorName: "Error" }),
    );
    warning.mockRestore();
  });

  it("rejects malformed connections and pagination metadata", () => {
    expect(
      normalizeProjectArchive("group", {
        siraProjects: null,
      }),
    ).toMatchObject({ status: "invalid", reason: "invalid-connection" });

    expect(
      normalizeProjectArchive(
        "group",
        {
          siraProjects: {
            nodes: [createNode(1)],
            pageInfo: { hasNextPage: true, endCursor: null },
          },
        },
      ),
    ).toMatchObject({ status: "invalid", reason: "invalid-page-info" });
  });

  it("rejects duplicate identities and safely diagnoses invalid identities", () => {
    expect(
      normalizeProjectArchive(
        "consulting",
        createData([createNode(7), createNode(7)]),
      ),
    ).toMatchObject({
      status: "invalid",
      reason: "duplicate-project-identity",
    });

    const result = normalizeProjectArchive(
      "consulting",
      createData([createNode(0), createNode(8)]),
    );

    expect(result).toMatchObject({
      status: "ready",
      page: {
        items: [{ databaseId: 8 }],
        diagnostics: [
          { code: "invalid-project-identity", projectDatabaseId: 0 },
        ],
      },
    });
  });

  it("does not propagate restricted projects or unsafe project URLs", () => {
    const result = normalizeProjectArchive(
      "group",
      createData([
        createNode(1, { isRestricted: true }),
        createNode(2, { uri: "javascript:alert(1)" }),
        createNode(3, { uri: "//attacker.example/project" }),
        createNode(4, {
          uri: "https://user:password@example.com/private",
        }),
        createNode(5),
      ]),
    );

    expect(result).toMatchObject({
      status: "ready",
      page: {
        items: [{ databaseId: 5 }],
        diagnostics: [
          { code: "restricted-project", projectDatabaseId: 1 },
          { code: "unsafe-uri", projectDatabaseId: 2 },
          { code: "unsafe-uri", projectDatabaseId: 3 },
          { code: "unsafe-uri", projectDatabaseId: 4 },
        ],
      },
    });
  });

  it("drops unsafe media without fabricating a replacement card", () => {
    const result = normalizeProjectArchive(
      "healthcare",
      createData([
        createNode(11, {
          featuredImage: {
            node: {
              databaseId: 110,
              sourceUrl: "data:image/png;base64,bad",
              altText: "Unsafe",
              mediaDetails: { width: 100, height: 100 },
            },
          },
        }),
      ]),
    );

    expect(result).toMatchObject({
      status: "ready",
      page: {
        items: [{ databaseId: 11, featuredImage: null }],
        diagnostics: [
          { code: "invalid-featured-image", projectDatabaseId: 11 },
        ],
      },
    });
  });

  it("uses the narrow project archive invalidation tag", () => {
    expect(PROJECT_ARCHIVE_CACHE_TAGS).toEqual(["archive:sira_project"]);
    expect(Object.isFrozen(PROJECT_ARCHIVE_CACHE_TAGS)).toBe(true);
  });
});
