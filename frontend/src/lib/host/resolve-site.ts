import {
  getSiteRegistry,
  isSiteKey,
  type SiteRegistry,
} from "@/config/sites";
import { normalizeHostname } from "@/lib/host/normalize-host";
import type {
  ResolvedSite,
  SiteDefinition,
  SiteKey,
} from "@/types/site";

export function resolveSiteFromHostname(
  hostname: string,
  registry: SiteRegistry = getSiteRegistry(),
): ResolvedSite | null {
  let normalized: string;

  try {
    normalized = normalizeHostname(hostname);
  } catch {
    return null;
  }

  const site = registry.byHostname.get(normalized);

  if (site === undefined) {
    return null;
  }

  return {
    site,
    requestedHostname: normalized,
    isCanonical: normalized === site.canonicalHostname,
  };
}

export function getSiteDefinition(
  value: string,
  registry: SiteRegistry = getSiteRegistry(),
): SiteDefinition | null {
  if (!isSiteKey(value)) {
    return null;
  }

  return registry.sites[value];
}

export function isInternalSitePath(pathname: string): boolean {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  return firstSegment !== undefined && isSiteKey(firstSegment);
}

export function getInternalSitePath(
  siteKey: SiteKey,
  pathname: string,
): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return normalizedPath === "/"
    ? `/${siteKey}`
    : `/${siteKey}${normalizedPath}`;
}
