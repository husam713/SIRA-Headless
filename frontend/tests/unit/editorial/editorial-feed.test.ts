import { describe, expect, it, vi } from "vitest";
import { resolveEditorialFeed } from "@/lib/editorial/get-editorial-feed";
import { normalizeEditorialFeed } from "@/lib/editorial/normalize-editorial-feed";
import type { EditorialTypename } from "@/lib/editorial/types";
import type { SiraEditorialFeedQueryData } from "@/queries/editorial-feed";

type ContentNodes = NonNullable<
  SiraEditorialFeedQueryData["contentNodes"]
>;
type EditorialNode = ContentNodes["nodes"][number];
type SupportedNode = Extract<
  EditorialNode,
  { readonly __typename: EditorialTypename }
>;

const CONTENT_TYPE_NAMES = {
  SiraNewsItem: "sira_news",
  SiraInsight: "sira_insight",
  SiraArticle: "sira_article",
  SiraPressRelease: "sira_press_release",
} as const;

function createNode(
  typename: EditorialTypename,
  databaseId: number,
  overrides: Partial<SupportedNode> = {},
): SupportedNode {
  return {
    __typename: typename,
    databaseId,
    contentTypeName: CONTENT_TYPE_NAMES[typename],
    date: "2026-08-10T09:00:00+00:00",
    modified: "2026-08-10T10:00:00+00:00",
    uri: `/news/item-${databaseId}/`,
    isRestricted: false,
    title: `Editorial item ${databaseId}`,
    excerpt: `Summary ${databaseId}`,
    featuredImage: null,
    ...overrides,
  } as SupportedNode;
}

function createData(
  nodes: readonly EditorialNode[],
  pageInfo: ContentNodes["pageInfo"] = {
    hasNextPage: false,
    endCursor: null,
  },
): SiraEditorialFeedQueryData {
  return {
    contentNodes: {
      nodes,
      pageInfo,
    },
  };
}

describe("native editorial feed server adapter", () => {
  it("represents an empty native collection without fabricated content", () => {
    expect(normalizeEditorialFeed("consulting", createData([]))).toEqual({
      status: "empty",
      siteKey: "consulting",
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
    });
  });

  it("normalizes all four supported editorial discriminators", () => {
    const result = normalizeEditorialFeed(
      "group",
      createData([
        createNode("SiraNewsItem", 1),
        createNode("SiraInsight", 2),
        createNode("SiraArticle", 3),
        createNode("SiraPressRelease", 4),
      ]),
    );

    if (result.status !== "ready") {
      throw new Error("Expected the editorial feed to be ready.");
    }

    expect(
      result.page.items.map((item) => [
        item.typename,
        item.contentTypeName,
        item.kind,
      ]),
    ).toEqual([
      ["SiraNewsItem", "sira_news", "news"],
      ["SiraInsight", "sira_insight", "insight"],
      ["SiraArticle", "sira_article", "article"],
      ["SiraPressRelease", "sira_press_release", "press-release"],
    ]);
    expect(Object.isFrozen(result.page.items)).toBe(true);
    expect(Object.isFrozen(result.page.items[0])).toBe(true);
  });

  it("preserves native source order without client-side reordering", () => {
    const result = normalizeEditorialFeed(
      "healthcare",
      createData([
        createNode("SiraArticle", 40),
        createNode("SiraNewsItem", 10),
        createNode("SiraInsight", 30),
      ]),
    );

    if (result.status !== "ready") {
      throw new Error("Expected the editorial feed to be ready.");
    }

    expect(result.page.items.map((item) => item.databaseId)).toEqual([
      40, 10, 30,
    ]);
  });

  it("normalizes card text, safe links, dates, and public media", () => {
    const result = normalizeEditorialFeed(
      "lifestyle",
      createData([
        createNode("SiraInsight", 12, {
          title: "  A <strong>clear</strong> title  ",
          excerpt: "<p>Useful&nbsp; summary.</p><script>bad()</script>",
          uri: "https://news.example/item-12/",
          featuredImage: {
            node: {
              databaseId: 120,
              sourceUrl: "https://media.example/item-12.jpg",
              altText: "  Cover image ",
              mediaDetails: { width: 1200, height: 800 },
            },
          },
        }),
      ]),
    );

    if (result.status !== "ready") {
      throw new Error("Expected the editorial feed to be ready.");
    }

    expect(result.page.items[0]).toEqual({
      databaseId: 12,
      typename: "SiraInsight",
      contentTypeName: "sira_insight",
      kind: "insight",
      title: "A clear title",
      excerpt: "Useful summary.",
      href: "https://news.example/item-12/",
      publishedAt: "2026-08-10T09:00:00+00:00",
      modifiedAt: "2026-08-10T10:00:00+00:00",
      featuredImage: {
        databaseId: 120,
        sourceUrl: "https://media.example/item-12.jpg",
        altText: "Cover image",
        width: 1200,
        height: 800,
      },
    });
  });

  it("omits malformed nodes without inventing replacement card data", () => {
    const result = normalizeEditorialFeed(
      "realestate",
      createData([
        createNode("SiraNewsItem", 10),
        createNode("SiraArticle", 11, { title: "   " }),
        createNode("SiraInsight", 12, {
          uri: "javascript:alert(1)",
        }),
        createNode("SiraPressRelease", 13, {
          uri: "https://user:password@example.com/private",
        }),
        createNode("SiraNewsItem", 14, {
          uri: "//attacker.example/path",
        }),
      ]),
    );

    if (result.status !== "ready") {
      throw new Error("Expected a safely reduced editorial feed.");
    }

    expect(result.page.items.map((item) => item.databaseId)).toEqual([10]);
    expect(result.page.diagnostics).toEqual([
      { code: "invalid-title", nodeDatabaseId: 11 },
      { code: "unsafe-uri", nodeDatabaseId: 12 },
      { code: "unsafe-uri", nodeDatabaseId: 13 },
      { code: "unsafe-uri", nodeDatabaseId: 14 },
    ]);
  });

  it("rejects duplicate and invalid node identity payloads", () => {
    expect(
      normalizeEditorialFeed(
        "consulting",
        createData([
          createNode("SiraNewsItem", 10),
          createNode("SiraArticle", 10),
        ]),
      ),
    ).toMatchObject({
      status: "invalid",
      reason: "duplicate-node-identity",
    });

    expect(
      normalizeEditorialFeed(
        "consulting",
        createData([createNode("SiraNewsItem", 0)]),
      ),
    ).toEqual({
      status: "invalid",
      siteKey: "consulting",
      reason: "no-valid-items",
      diagnostics: [
        { code: "invalid-node-identity", nodeDatabaseId: 0 },
      ],
    });
  });

  it("preserves valid cursor pagination and rejects an unusable next cursor", () => {
    const ready = normalizeEditorialFeed(
      "group",
      createData([createNode("SiraNewsItem", 1)], {
        hasNextPage: true,
        endCursor: "YXJyYXljb25uZWN0aW9uOjE=",
      }),
    );

    expect(ready).toMatchObject({
      status: "ready",
      page: {
        pageInfo: {
          hasNextPage: true,
          endCursor: "YXJyYXljb25uZWN0aW9uOjE=",
        },
      },
    });

    expect(
      normalizeEditorialFeed(
        "group",
        createData([createNode("SiraNewsItem", 1)], {
          hasNextPage: true,
          endCursor: null,
        }),
      ),
    ).toMatchObject({ status: "invalid", reason: "invalid-page-info" });
  });

  it("validates bounded cursor request variables before transport", async () => {
    const executor = vi.fn();

    await expect(
      resolveEditorialFeed("group", { first: 0, after: null }, executor),
    ).resolves.toMatchObject({
      status: "invalid",
      reason: "invalid-pagination-request",
    });
    expect(executor).not.toHaveBeenCalled();

    const data = createData([]);
    executor.mockResolvedValue(data);
    await resolveEditorialFeed(
      "group",
      { first: 24, after: "cursor-1" },
      executor,
    );
    expect(executor).toHaveBeenCalledWith({
      first: 24,
      after: "cursor-1",
    });
  });

  it("maps remote GraphQL failures to a stable server result", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      resolveEditorialFeed(
        "healthcare",
        { first: 12, after: null },
        async () => {
          throw new Error("endpoint unavailable");
        },
      ),
    ).resolves.toEqual({
      status: "remote-error",
      siteKey: "healthcare",
      errorName: "Error",
    });

    expect(warning).toHaveBeenCalledWith(
      "SIRA editorial feed query failed.",
      expect.objectContaining({ siteKey: "healthcare", errorName: "Error" }),
    );
    warning.mockRestore();
  });
});
