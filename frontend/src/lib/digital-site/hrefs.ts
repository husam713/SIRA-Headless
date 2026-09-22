import { localeHref } from "@/lib/i18n/locale";
import type { LocaleCode, SiteDefinition } from "@/types/site";

/**
 * A content link (`/contact/`, `#capabilities`) as a public href in the
 * reader's language. Anchors are pinned to the homepage so they work from
 * every route, not only the one that happens to contain the target.
 */
export function digitalHref(site: SiteDefinition, locale: LocaleCode, href: string): string {
  if (href.startsWith("#")) return `${localeHref(site, locale, "/")}${href}`;
  if (href.startsWith("http")) return href;
  return localeHref(site, locale, href);
}

/** Whether a nav item is the current page — its path, with or without locale. */
export function isCurrentPath(currentPath: string, href: string): boolean {
  const normalize = (value: string): string => {
    const withSlash = value.endsWith("/") ? value : `${value}/`;
    return withSlash.startsWith("/") ? withSlash : `/${withSlash}`;
  };

  return normalize(currentPath) === normalize(href);
}
