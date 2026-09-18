import { getSiteDefinition } from "@/lib/host/resolve-site";
import { localeHref } from "@/lib/i18n/locale";
import type { SiteKey } from "@/types/site";

/**
 * Which public URLs an event makes stale at the edge.
 *
 * CDN-agnostic on purpose: no provider has been chosen, so this derives the
 * list and the receiver logs it; a purge client (Cloud CDN `invalidateCache`,
 * Cloudflare purge-by-URL) is one function away from being wired in.
 *
 * Rules:
 * - the hostname is the REGISTRY's canonical hostname for the tenant, never
 *   the payload's own `site.hostname` — the sender is trusted for content,
 *   not for where this deployment serves it;
 * - every path is emitted per locale where the tenant's locale routes are
 *   approved, matching the sitemap and hreflang;
 * - a layout-wide change (brand, menus, homepage) widens the purge to the
 *   whole host, expressed as `/*`, which both candidate CDNs understand.
 */

const LAYOUT_WIDE_PREFIXES = ["brand", "layout", "navigation", "menu:", "homepage"];

export interface PurgePlan {
  readonly hostname: string;
  readonly wholeHost: boolean;
  readonly urls: readonly string[];
}

function isSafePath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("..") && !/[\s<>"]/u.test(path);
}

export function planEdgePurge(
  siteKey: SiteKey,
  paths: readonly string[],
  tags: readonly string[],
  granularity: "coarse" | "fine",
): PurgePlan | null {
  const site = getSiteDefinition(siteKey);
  if (site === null) return null;

  const hostname = site.canonicalHostname;
  const wholeHost =
    granularity === "coarse" ||
    tags.some((tag) => LAYOUT_WIDE_PREFIXES.some((prefix) => tag === prefix || tag.startsWith(prefix)));

  if (wholeHost) {
    return Object.freeze({ hostname, wholeHost: true, urls: Object.freeze([`https://${hostname}/*`]) });
  }

  const locales = site.localeRoutesApproved ? site.supportedLocales : [site.defaultLocale];
  const urls = new Set<string>();

  for (const raw of paths) {
    if (!isSafePath(raw)) continue;
    for (const locale of locales) {
      urls.add(`https://${hostname}${localeHref(site, locale, raw)}`);
    }
  }

  return Object.freeze({ hostname, wholeHost: false, urls: Object.freeze([...urls].slice(0, 200)) });
}
