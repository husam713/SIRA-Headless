/**
 * The edge cache policy for published HTML.
 *
 * Off unless `SIRA_EDGE_CACHE_SMAXAGE_SECONDS` is set (60–3600). When on, the
 * proxy stamps published responses with a shared-cache lifetime so a CDN in
 * front of Cloud Run serves them from the edge, keeps serving them while it
 * refreshes in the background, and keeps serving them if the origin is down.
 * Browsers still revalidate every time (`max-age=0`): the edge is the cache,
 * not the visitor's disk, so a purge from the revalidation receiver reaches
 * everyone.
 *
 * Next never overrides a Cache-Control that is already on the response
 * (server/send-payload.js: `if (cacheControl && !res.getHeader('Cache-Control'))`),
 * which is what lets the proxy own this decision — and which also means the
 * header stays on a 500 or a 404, because the proxy runs before the status is
 * known. The edge must refuse to cache 5xx and keep 404s short; see
 * docs/PLATFORM-DELIVERY.md. That is why this is off by default.
 */

export const EDGE_CACHE_ENV = "SIRA_EDGE_CACHE_SMAXAGE_SECONDS";
const MIN_SECONDS = 60;
const MAX_SECONDS = 3600;
const STALE_SECONDS = 86_400;

export class EdgeCacheConfigurationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "EdgeCacheConfigurationError";
  }
}

export function getEdgeCacheSeconds(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): number | null {
  const raw = environment[EDGE_CACHE_ENV];
  if (raw === undefined || raw.trim() === "" || raw === "off" || raw === "0") return null;

  const seconds = Number(raw);
  if (!Number.isInteger(seconds) || seconds < MIN_SECONDS || seconds > MAX_SECONDS) {
    throw new EdgeCacheConfigurationError(
      `${EDGE_CACHE_ENV} must be an integer between ${MIN_SECONDS} and ${MAX_SECONDS}, or unset.`,
    );
  }

  return seconds;
}

/** The header for a published, cacheable page. */
export function publishedCacheControl(seconds: number): string {
  return `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${STALE_SECONDS}, stale-if-error=${STALE_SECONDS}`;
}

/** The header for anything an editor is previewing, or that must not be shared. */
export const PRIVATE_CACHE_CONTROL = "private, no-store";

/** Next's Draft Mode bypass cookie; its presence means "this is a preview". */
export const DRAFT_MODE_COOKIE = "__prerender_bypass";
