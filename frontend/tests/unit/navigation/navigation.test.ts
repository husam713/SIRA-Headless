import { describe, expect, it, vi } from "vitest";
import type { MenuLocationEnum } from "@/generated/graphql/graphql";
import { resolveNavigation } from "@/lib/navigation/get-navigation";
import { normalizeNavigation } from "@/lib/navigation/normalize-navigation";
import type { NavigationScope } from "@/lib/navigation/types";
import type { SiraNavigationQueryData } from "@/queries/navigation";

type MenuCollection = NonNullable<SiraNavigationQueryData[NavigationScope]>;
type MenuNode = MenuCollection["nodes"][number];
type MenuItem = NonNullable<MenuNode["menuItems"]>["nodes"][number];

function createItem(
  databaseId: number,
  overrides: Partial<MenuItem> = {},
): MenuItem {
  return {
    databaseId,
    isRestricted: false,
    label: `Item ${databaseId}`,
    order: databaseId,
    parentDatabaseId: null,
    path: `/item-${databaseId}/`,
    target: null,
    url: `https://cms.example/item-${databaseId}/`,
    ...overrides,
  };
}

function createCollection(
  databaseId: number,
  location: MenuLocationEnum,
  items: readonly MenuItem[] = [createItem(databaseId * 10)],
  overrides: Partial<MenuCollection> = {},
): MenuCollection {
  return {
    pageInfo: { hasNextPage: false },
    nodes: [
      {
        databaseId,
        isRestricted: false,
        locations: [location],
        menuItems: {
          pageInfo: { hasNextPage: false },
          nodes: items,
        },
      },
    ],
    ...overrides,
  };
}

function createNavigationData(): SiraNavigationQueryData {
  return {
    primary: createCollection(1, "PRIMARY"),
    footer: createCollection(2, "FOOTER"),
    legal: createCollection(3, "LEGAL"),
  };
}

describe("native navigation server adapter", () => {
  it("exposes explicit primary, footer, and legal scope semantics", () => {
    const result = normalizeNavigation("consulting", createNavigationData());

    expect(result.status).toBe("resolved");
    if (result.status !== "resolved") {
      throw new Error("Expected navigation to resolve.");
    }

    expect(result.primary).toMatchObject({
      status: "ready",
      menu: { scope: "primary", location: "PRIMARY" },
    });
    expect(result.footer).toMatchObject({
      status: "ready",
      menu: { scope: "footer", location: "FOOTER" },
    });
    expect(result.legal).toMatchObject({
      status: "ready",
      menu: { scope: "legal", location: "LEGAL" },
    });
  });

  it("represents empty native collections as CMS-readiness gaps", () => {
    const data = createNavigationData();
    const result = normalizeNavigation("healthcare", {
      ...data,
      primary: {
        pageInfo: { hasNextPage: false },
        nodes: [],
      },
      footer: null,
    });

    expect(result).toMatchObject({
      status: "resolved",
      primary: {
        status: "missing",
        scope: "primary",
        reason: "menu-unassigned",
      },
      footer: {
        status: "missing",
        scope: "footer",
        reason: "menu-unassigned",
      },
    });
  });

  it("does not select the first menu when a native role is ambiguous", () => {
    const data = createNavigationData();
    const firstMenu = data.primary?.nodes[0];

    if (firstMenu === undefined) {
      throw new Error("Expected a primary menu fixture.");
    }

    const result = normalizeNavigation("group", {
      ...data,
      primary: {
        pageInfo: { hasNextPage: false },
        nodes: [firstMenu, { ...firstMenu, databaseId: 99 }],
      },
    });

    expect(result).toMatchObject({
      status: "resolved",
      primary: {
        status: "invalid",
        scope: "primary",
        reason: "ambiguous-menu",
      },
    });
  });

  it("builds a deterministic, recursively immutable item tree", () => {
    const data = createNavigationData();
    const result = normalizeNavigation("consulting", {
      ...data,
      primary: createCollection(1, "PRIMARY", [
        createItem(30, { order: 2 }),
        createItem(12, { parentDatabaseId: 10, order: 1 }),
        createItem(11, { parentDatabaseId: 10, order: 1 }),
        createItem(10, { order: 1 }),
        createItem(20, { order: 1 }),
      ]),
    });

    if (result.status !== "resolved" || result.primary.status !== "ready") {
      throw new Error("Expected primary navigation to be ready.");
    }

    expect(result.primary.menu.items.map((item) => item.databaseId)).toEqual([
      10, 20, 30,
    ]);
    expect(
      result.primary.menu.items[0]?.children.map((item) => item.databaseId),
    ).toEqual([11, 12]);
    expect(Object.isFrozen(result.primary.menu.items)).toBe(true);
    expect(Object.isFrozen(result.primary.menu.items[0])).toBe(true);
    expect(Object.isFrozen(result.primary.menu.items[0]?.children)).toBe(true);
  });

  // Regression: WordPress sends 0, not null, for a top-level item's parent.
  // Every fixture here used null, so the suite never saw the real payload while
  // production rejected all five sites' menus as "invalid-hierarchy" and the
  // header rendered nothing. Values taken from the live PRIMARY menu.
  it("treats a parent id of 0 as top level, the way WordPress reports it", () => {
    const data = createNavigationData();
    const result = normalizeNavigation("group", {
      ...data,
      primary: createCollection(65, "PRIMARY", [
        createItem(1704, { parentDatabaseId: 0, order: 1, label: "Companies" }),
        createItem(1708, { parentDatabaseId: 0, order: 2, label: "Investors" }),
        createItem(1706, { parentDatabaseId: 0, order: 3, label: "Projects" }),
      ]),
    });

    if (result.status !== "resolved" || result.primary.status !== "ready") {
      throw new Error("Expected a menu of top-level items to be ready.");
    }

    expect(result.primary.menu.items.map((item) => item.label)).toEqual([
      "Companies",
      "Investors",
      "Projects",
    ]);
    expect(result.primary.menu.items.every((item) => item.children.length === 0)).toBe(true);
  });

  it.each([
    [
      "duplicate IDs",
      [createItem(10), createItem(10, { label: "Duplicate" })],
    ],
    ["an orphan", [createItem(10, { parentDatabaseId: 999 })]],
    ["self-parenting", [createItem(10, { parentDatabaseId: 10 })]],
    [
      "a cycle",
      [
        createItem(10, { parentDatabaseId: 11 }),
        createItem(11, { parentDatabaseId: 10 }),
      ],
    ],
  ])("rejects an invalid hierarchy containing %s", (_label, items) => {
    const data = createNavigationData();
    const result = normalizeNavigation("realestate", {
      ...data,
      primary: createCollection(1, "PRIMARY", items),
    });

    expect(result).toMatchObject({
      status: "resolved",
      primary: {
        status: "invalid",
        scope: "primary",
        reason: "invalid-hierarchy",
      },
    });
  });

  it("prefers a safe native path and preserves safe HTTP(S) links", () => {
    const data = createNavigationData();
    const result = normalizeNavigation("lifestyle", {
      ...data,
      primary: createCollection(1, "PRIMARY", [
        createItem(10, {
          path: "/about/?section=team#leadership",
          url: "https://cms.example/ignored/",
        }),
        createItem(11, {
          path: null,
          url: "https://partner.example/resource?q=1",
        }),
        createItem(12, {
          path: null,
          url: "http://partner.example/legacy",
        }),
      ]),
    });

    if (result.status !== "resolved" || result.primary.status !== "ready") {
      throw new Error("Expected primary navigation to be ready.");
    }

    expect(result.primary.menu.items.map((item) => item.href)).toEqual([
      "/about/?section=team#leadership",
      "https://partner.example/resource?q=1",
      "http://partner.example/legacy",
    ]);
  });

  it("omits unsafe links without fabricating replacements", () => {
    const data = createNavigationData();
    const result = normalizeNavigation("consulting", {
      ...data,
      primary: createCollection(1, "PRIMARY", [
        createItem(10),
        createItem(11, { path: null, url: "javascript:alert(1)" }),
        createItem(12, { path: "//attacker.example/path", url: null }),
        createItem(13, {
          path: null,
          url: "https://user:password@example.com/private",
        }),
        createItem(14, { path: "not a relative path", url: "data:text/html,x" }),
      ]),
    });

    if (result.status !== "resolved" || result.primary.status !== "ready") {
      throw new Error("Expected a safely reduced primary navigation.");
    }

    expect(result.primary.menu.items).toHaveLength(1);
    expect(result.primary.menu.items[0]?.databaseId).toBe(10);
    expect(result.primary.menu.diagnostics).toEqual([
      { code: "unsafe-item-link", itemDatabaseId: 11 },
      { code: "unsafe-item-link", itemDatabaseId: 12 },
      { code: "unsafe-item-link", itemDatabaseId: 13 },
      { code: "unsafe-item-link", itemDatabaseId: 14 },
    ]);
  });

  it("normalizes targets to the known native target allowlist", () => {
    const data = createNavigationData();
    const result = normalizeNavigation("healthcare", {
      ...data,
      primary: createCollection(1, "PRIMARY", [
        createItem(10, { target: "_self" }),
        createItem(11, { target: "_blank" }),
        createItem(12, { target: "popup" }),
      ]),
    });

    if (result.status !== "resolved" || result.primary.status !== "ready") {
      throw new Error("Expected primary navigation to be ready.");
    }

    expect(result.primary.menu.items.map((item) => item.target)).toEqual([
      "_self",
      "_blank",
      null,
    ]);
    expect(result.primary.menu.diagnostics).toContainEqual({
      code: "unsupported-item-target",
      itemDatabaseId: 12,
    });
  });

  it("reports a configured menu with no usable items as missing", () => {
    const data = createNavigationData();
    const result = normalizeNavigation("realestate", {
      ...data,
      legal: createCollection(3, "LEGAL", [
        createItem(30, { path: null, url: "vbscript:unsafe" }),
      ]),
    });

    expect(result).toMatchObject({
      status: "resolved",
      legal: {
        status: "missing",
        scope: "legal",
        reason: "menu-empty",
        diagnostics: [
          { code: "unsafe-item-link", itemDatabaseId: 30 },
        ],
      },
    });
  });

  it("maps remote GraphQL failures to a stable server result", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      resolveNavigation("group", async () => {
        throw new Error("endpoint unavailable");
      }),
    ).resolves.toEqual({
      status: "remote-error",
      siteKey: "group",
      errorName: "Error",
    });

    expect(warning).toHaveBeenCalledWith(
      "SIRA navigation query failed.",
      expect.objectContaining({ siteKey: "group", errorName: "Error" }),
    );
    warning.mockRestore();
  });
});
