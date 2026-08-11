import type { MenuLocationEnum } from "@/generated/graphql/graphql";
import type { SiteKey } from "@/types/site";

export type NavigationScope = "primary" | "footer" | "legal";
export type NavigationTarget = "_self" | "_blank";
export type NavigationLocation = Extract<
  MenuLocationEnum,
  "PRIMARY" | "FOOTER" | "LEGAL"
>;

export type NavigationDiagnosticCode =
  | "restricted-item"
  | "invalid-item-identity"
  | "invalid-item-label"
  | "invalid-item-order"
  | "unsafe-item-link"
  | "unsupported-item-target";

export interface NavigationDiagnostic {
  readonly code: NavigationDiagnosticCode;
  readonly itemDatabaseId: number | null;
}

export interface NavigationItem {
  readonly databaseId: number;
  readonly label: string;
  readonly href: string;
  readonly target: NavigationTarget | null;
  readonly order: number;
  readonly children: readonly NavigationItem[];
}

export interface NavigationMenu {
  readonly scope: NavigationScope;
  readonly location: NavigationLocation;
  readonly databaseId: number;
  readonly items: readonly NavigationItem[];
  readonly diagnostics: readonly NavigationDiagnostic[];
}

export type InvalidNavigationReason =
  | "collection-truncated"
  | "ambiguous-menu"
  | "invalid-menu"
  | "items-truncated"
  | "invalid-hierarchy";

export type NavigationScopeResolution =
  | Readonly<{
      status: "ready";
      menu: NavigationMenu;
    }>
  | Readonly<{
      status: "missing";
      scope: NavigationScope;
      reason: "menu-unassigned" | "menu-empty";
      diagnostics: readonly NavigationDiagnostic[];
    }>
  | Readonly<{
      status: "invalid";
      scope: NavigationScope;
      reason: InvalidNavigationReason;
      diagnostics: readonly NavigationDiagnostic[];
    }>;

export type NavigationResolution =
  | Readonly<{
      status: "resolved";
      siteKey: SiteKey;
      primary: NavigationScopeResolution;
      footer: NavigationScopeResolution;
      legal: NavigationScopeResolution;
    }>
  | Readonly<{
      status: "remote-error";
      siteKey: SiteKey;
      errorName: string;
    }>;
