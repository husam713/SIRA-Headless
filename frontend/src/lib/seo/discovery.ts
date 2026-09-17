import type { MetadataRoute } from "next";
import {
  getSiteRegistry,
  type SiteRegistry,
} from "@/config/sites";
import {
  getSiteDefinition,
  resolveSiteFromHostname,
} from "@/lib/host/resolve-site";
import { localeHref } from "@/lib/i18n/locale";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import type {
  HostnameRole,
  SiteDefinition,
  SiteKey,
} from "@/types/site";

export interface SiteDiscoveryContext {
  readonly site: SiteDefinition;
  readonly requestedHostname: string;
  readonly hostnameRole: HostnameRole | null;
  readonly isProductionCanonical: boolean;
}

export function resolveSiteDiscoveryContext(
  siteKey: SiteKey,
  hostname: string,
  registry: SiteRegistry = getSiteRegistry(),
): SiteDiscoveryContext {
  const site = getSiteDefinition(siteKey, registry);

  if (site === null) {
    throw new TypeError(`Unknown SIRA site key: ${siteKey}.`);
  }

  const resolution = resolveSiteFromHostname(hostname, registry);
  const sameTenant = resolution?.site.key === siteKey;
  const hostnameRole = sameTenant ? resolution.hostnameRole : null;

  return Object.freeze({
    site,
    requestedHostname: hostname,
    hostnameRole,
    isProductionCanonical: hostnameRole === "canonical",
  });
}

export function buildRobotsPolicy(
  hostname: string,
  registry: SiteRegistry = getSiteRegistry(),
): MetadataRoute.Robots {
  const resolution = resolveSiteFromHostname(hostname, registry);

  if (resolution === null || resolution.hostnameRole !== "canonical") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: buildCanonicalUrl(
      resolution.site.key,
      "/sitemap.xml",
      registry,
    ).toString(),
    host: `https://${resolution.site.canonicalHostname}`,
  };
}

export interface SitemapEntryInput {
  /** A locale-less path this app serves, e.g. `/news/` or `/insights/x/`. */
  readonly path: string;
  readonly lastModified?: string | null | undefined;
}

/**
 * The sitemap for the host being asked. Empty on any host that is not the
 * tenant's canonical one, so a deployment or alias host never advertises
 * URLs. Every path is emitted for the default locale and, where the tenant's
 * locale routes are approved (ADR-034), for each other locale under its
 * prefix — the same rule the layout uses for hreflang.
 */
export function buildSitemap(
  hostname: string,
  entries: readonly SitemapEntryInput[] = [],
  registry: SiteRegistry = getSiteRegistry(),
): MetadataRoute.Sitemap {
  const resolution = resolveSiteFromHostname(hostname, registry);

  if (resolution === null || resolution.hostnameRole !== "canonical") {
    return [];
  }

  const site = resolution.site;
  const locales = site.localeRoutesApproved ? site.supportedLocales : [site.defaultLocale];
  const seen = new Set<string>();
  const sitemap: MetadataRoute.Sitemap = [];

  for (const entry of [{ path: "/" }, ...entries]) {
    for (const locale of locales) {
      const path = localeHref(site, locale, entry.path);
      if (seen.has(path)) continue;
      seen.add(path);

      const url = buildCanonicalUrl(site.key, path, registry).toString();
      const lastModified = entry.lastModified ?? null;

      sitemap.push(
        lastModified === null ? { url } : { url, lastModified: new Date(lastModified) },
      );
    }
  }

  return sitemap;
}
