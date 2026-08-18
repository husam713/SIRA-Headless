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

  const registration = registry.byHostname.get(normalized);

  if (registration === undefined) {
    return null;
  }

  return {
    site: registration.site,
    requestedHostname: normalized,
    hostnameRole: registration.role,
    isCanonical: registration.role === "canonical",
    shouldRedirectToCanonical: registration.role === "redirect-alias",
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
