import type { SiraNavigationQueryData } from "@/queries/navigation";
import type {
  InvalidNavigationReason,
  NavigationDiagnostic,
  NavigationDiagnosticCode,
  NavigationItem,
  NavigationLocation,
  NavigationMenu,
  NavigationResolution,
  NavigationScope,
  NavigationScopeResolution,
  NavigationTarget,
} from "@/lib/navigation/types";
import type { SiteKey } from "@/types/site";

type MenuCollection = NonNullable<SiraNavigationQueryData[NavigationScope]>;
type NativeMenu = MenuCollection["nodes"][number];
type NativeMenuItem = NonNullable<NativeMenu["menuItems"]>["nodes"][number];

const SCOPE_LOCATIONS: Readonly<Record<NavigationScope, NavigationLocation>> =
  Object.freeze({
    primary: "PRIMARY",
    footer: "FOOTER",
    legal: "LEGAL",
  });

const EMPTY_DIAGNOSTICS: readonly NavigationDiagnostic[] = Object.freeze([]);

function diagnostic(
  code: NavigationDiagnosticCode,
  itemDatabaseId: number | null,
): NavigationDiagnostic {
  return Object.freeze({ code, itemDatabaseId });
}

function freezeDiagnostics(
  diagnostics: NavigationDiagnostic[],
): readonly NavigationDiagnostic[] {
  return Object.freeze([...diagnostics]);
}

function invalid(
  scope: NavigationScope,
  reason: InvalidNavigationReason,
  diagnostics: readonly NavigationDiagnostic[] = EMPTY_DIAGNOSTICS,
): NavigationScopeResolution {
  return Object.freeze({ status: "invalid", scope, reason, diagnostics });
}

function missing(
  scope: NavigationScope,
  reason: "menu-unassigned" | "menu-empty",
  diagnostics: readonly NavigationDiagnostic[] = EMPTY_DIAGNOSTICS,
): NavigationScopeResolution {
  return Object.freeze({ status: "missing", scope, reason, diagnostics });
}

function normalizeLabel(value: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const label = value.replace(/\s+/g, " ").trim();
  return label === "" ? null : label.slice(0, 240);
}

function normalizeHref(value: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const href = value.trim();

  if (
    href === "" ||
    href.startsWith("//") ||
    href.includes("\\") ||
    /[\u0000-\u001f\u007f]/u.test(href)
  ) {
    return null;
  }

  if (href.startsWith("/")) {
    return href;
  }

  try {
    const url = new URL(href);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username !== "" ||
      url.password !== ""
    ) {
      return null;
    }

    return href;
  } catch {
    return null;
  }
}

function normalizeTarget(
  target: string | null,
  diagnostics: NavigationDiagnostic[],
  itemDatabaseId: number,
): NavigationTarget | null {
  if (target === null || target.trim() === "") {
    return null;
  }

  if (target === "_self" || target === "_blank") {
    return target;
  }

  diagnostics.push(
    diagnostic("unsupported-item-target", itemDatabaseId),
  );
  return null;
}

interface NormalizedFlatItem {
  readonly databaseId: number;
  readonly parentDatabaseId: number | null;
  readonly label: string;
  readonly href: string;
  readonly target: NavigationTarget | null;
  readonly order: number;
}

function normalizeFlatItem(
  item: NativeMenuItem,
  diagnostics: NavigationDiagnostic[],
): NormalizedFlatItem | null {
  const itemDatabaseId = Number.isSafeInteger(item.databaseId)
    ? item.databaseId
    : null;

  if (itemDatabaseId === null || itemDatabaseId <= 0) {
    diagnostics.push(diagnostic("invalid-item-identity", itemDatabaseId));
    return null;
  }

  if (item.isRestricted === true) {
    diagnostics.push(diagnostic("restricted-item", itemDatabaseId));
    return null;
  }

  const label = normalizeLabel(item.label);

  if (label === null) {
    diagnostics.push(diagnostic("invalid-item-label", itemDatabaseId));
    return null;
  }

  if (!Number.isSafeInteger(item.order) || item.order === null) {
    diagnostics.push(diagnostic("invalid-item-order", itemDatabaseId));
    return null;
  }

  const href = normalizeHref(item.path) ?? normalizeHref(item.url);

  if (href === null) {
    diagnostics.push(diagnostic("unsafe-item-link", itemDatabaseId));
    return null;
  }

  return Object.freeze({
    databaseId: itemDatabaseId,
    parentDatabaseId: item.parentDatabaseId,
    label,
    href,
    target: normalizeTarget(item.target, diagnostics, itemDatabaseId),
    order: item.order,
  });
}

function hasInvalidHierarchy(
  items: readonly NormalizedFlatItem[],
): boolean {
  const byId = new Map(items.map((item) => [item.databaseId, item]));

  for (const item of items) {
    if (
      item.parentDatabaseId !== null &&
      (item.parentDatabaseId === item.databaseId ||
        !byId.has(item.parentDatabaseId))
    ) {
      return true;
    }

    const visited = new Set<number>();
    let current: NormalizedFlatItem | undefined = item;

    while (current !== undefined && current.parentDatabaseId !== null) {
      if (visited.has(current.databaseId)) {
        return true;
      }

      visited.add(current.databaseId);
      current = byId.get(current.parentDatabaseId);
    }
  }

  return false;
}

function sortItems(
  left: NormalizedFlatItem,
  right: NormalizedFlatItem,
): number {
  return left.order - right.order || left.databaseId - right.databaseId;
}

function createTree(items: readonly NormalizedFlatItem[]): readonly NavigationItem[] {
  const childrenByParent = new Map<number | null, NormalizedFlatItem[]>();

  for (const item of items) {
    const siblings = childrenByParent.get(item.parentDatabaseId) ?? [];
    siblings.push(item);
    childrenByParent.set(item.parentDatabaseId, siblings);
  }

  const buildItem = (item: NormalizedFlatItem): NavigationItem =>
    Object.freeze({
      databaseId: item.databaseId,
      label: item.label,
      href: item.href,
      target: item.target,
      order: item.order,
      children: Object.freeze(
        (childrenByParent.get(item.databaseId) ?? [])
          .sort(sortItems)
          .map(buildItem),
      ),
    });

  return Object.freeze(
    (childrenByParent.get(null) ?? []).sort(sortItems).map(buildItem),
  );
}

function normalizeScope(
  scope: NavigationScope,
  collection: SiraNavigationQueryData[NavigationScope],
): NavigationScopeResolution {
  if (collection === null) {
    return missing(scope, "menu-unassigned");
  }

  if (collection.pageInfo.hasNextPage) {
    return invalid(scope, "collection-truncated");
  }

  if (collection.nodes.length === 0) {
    return missing(scope, "menu-unassigned");
  }

  if (collection.nodes.length !== 1) {
    return invalid(scope, "ambiguous-menu");
  }

  const menu = collection.nodes[0];
  const expectedLocation = SCOPE_LOCATIONS[scope];

  if (
    menu === undefined ||
    !Number.isSafeInteger(menu.databaseId) ||
    menu.databaseId <= 0 ||
    menu.isRestricted === true ||
    !menu.locations?.includes(expectedLocation)
  ) {
    return invalid(scope, "invalid-menu");
  }

  if (menu.menuItems === null) {
    return missing(scope, "menu-empty");
  }

  if (menu.menuItems.pageInfo.hasNextPage) {
    return invalid(scope, "items-truncated");
  }

  const databaseIds = new Set<number>();

  for (const item of menu.menuItems.nodes) {
    if (databaseIds.has(item.databaseId)) {
      return invalid(scope, "invalid-hierarchy");
    }

    databaseIds.add(item.databaseId);
  }

  const diagnostics: NavigationDiagnostic[] = [];
  const normalizedItems = menu.menuItems.nodes
    .map((item) => normalizeFlatItem(item, diagnostics))
    .filter((item): item is NormalizedFlatItem => item !== null);
  const frozenDiagnostics = freezeDiagnostics(diagnostics);

  if (normalizedItems.length === 0) {
    return missing(scope, "menu-empty", frozenDiagnostics);
  }

  if (hasInvalidHierarchy(normalizedItems)) {
    return invalid(
      scope,
      "invalid-hierarchy",
      frozenDiagnostics,
    );
  }

  const normalizedMenu: NavigationMenu = Object.freeze({
    scope,
    location: expectedLocation,
    databaseId: menu.databaseId,
    items: createTree(normalizedItems),
    diagnostics: frozenDiagnostics,
  });

  return Object.freeze({ status: "ready", menu: normalizedMenu });
}

export function normalizeNavigation(
  siteKey: SiteKey,
  data: SiraNavigationQueryData,
): NavigationResolution {
  return Object.freeze({
    status: "resolved",
    siteKey,
    primary: normalizeScope("primary", data.primary),
    footer: normalizeScope("footer", data.footer),
    legal: normalizeScope("legal", data.legal),
  });
}
