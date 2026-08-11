import "server-only";

export {
  getNavigation,
  resolveNavigation,
} from "@/lib/navigation/get-navigation";
export type {
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
