import type { MetadataRoute } from "next";
import {
  getSiteRegistry,
  type SiteRegistry,
} from "@/config/sites";
import {
  getSiteDefinition,
  resolveSiteFromHostname,
} from "@/lib/host/resolve-site";
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

export function buildSitemap(
  hostname: string,
  registry: SiteRegistry = getSiteRegistry(),
): MetadataRoute.Sitemap {
  const resolution = resolveSiteFromHostname(hostname, registry);

  if (resolution === null || resolution.hostnameRole !== "canonical") {
    return [];
  }

  return [
    {
      url: buildCanonicalUrl(resolution.site.key, "/", registry).toString(),
    },
  ];
}
