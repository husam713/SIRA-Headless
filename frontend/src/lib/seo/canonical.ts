import type { SiteRegistry } from "@/config/sites";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import type { SiteKey } from "@/types/site";

const SAFE_PATHNAME_PATTERN = /^\/(?!\/)[^?#\\\u0000-\u001f\u007f]*$/;

export function buildCanonicalUrl(
  siteKey: SiteKey,
  pathname = "/",
  registry?: SiteRegistry,
): URL {
  if (!SAFE_PATHNAME_PATTERN.test(pathname)) {
    throw new TypeError("Canonical pathname must be an absolute application pathname.");
  }

  const site = getSiteDefinition(siteKey, registry);

  if (site === null) {
    throw new TypeError(`Unknown SIRA site key: ${siteKey}.`);
  }

  return new URL(pathname, `https://${site.canonicalHostname}`);
}
