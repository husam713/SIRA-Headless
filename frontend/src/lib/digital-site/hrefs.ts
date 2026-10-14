import { localeHref } from "@/lib/i18n/locale";
import type { LocaleCode, SiteDefinition } from "@/types/site";

/**
 * A content link (`/contact/`, `#approval-demo`, `/automation/#integrations`)
 * as a public href in the reader's language. The fragment is split off before
 * the path is localised — `localeHref` normalises a trailing slash, which
 * would otherwise land inside the fragment. Bare anchors are pinned to the
 * homepage so they work from every route.
 */
export function digitalHref(site: SiteDefinition, locale: LocaleCode, href: string): string {
  if (href.startsWith("http")) return href;
  const hashAt = href.indexOf("#");
  const path = hashAt === -1 ? href : href.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : href.slice(hashAt);
  return `${localeHref(site, locale, path === "" ? "/" : path)}${hash}`;
}

/** Whether a nav item is the current page — its path, with or without locale. */
export function isCurrentPath(currentPath: string, href: string): boolean {
  const normalize = (value: string): string => {
    const withSlash = value.endsWith("/") ? value : `${value}/`;
    return withSlash.startsWith("/") ? withSlash : `/${withSlash}`;
  };

  return normalize(currentPath) === normalize(href);
}
