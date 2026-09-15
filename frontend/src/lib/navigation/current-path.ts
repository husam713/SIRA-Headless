import { splitLocalePath } from "@/lib/i18n/locale";

/**
 * Whether a menu item points at the page being read, for `aria-current`.
 *
 * Both sides are compared as locale-stripped, slash-normalised paths, because
 * the proxy hands the layout a path without its locale prefix (`/services`)
 * while an Arabic menu item carries one (`/ar/services/`). Anchors (`/#about`),
 * absolute URLs and query strings never match: an anchor is a place on a page
 * rather than a page, and an external link is not this site.
 */
export function isCurrentPath(href: string, currentPath: string): boolean {
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  if (href.includes("#") || href.includes("?")) return false;

  return normalize(splitLocalePath(href).path) === normalize(currentPath);
}

function normalize(path: string): string {
  const trimmed = path.replace(/\/+$/u, "");
  return trimmed === "" ? "/" : trimmed;
}
