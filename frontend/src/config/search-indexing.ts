import "server-only";

export type SearchIndexingEnvironment = Readonly<
  Record<string, string | undefined>
>;

export class SearchIndexingConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SearchIndexingConfigurationError";
  }
}

const ENABLED_VALUES = new Set(["on", "true", "1"]);
const DISABLED_VALUES = new Set(["off", "false", "0"]);

/**
 * Whether search engines may index this deployment.
 *
 * Read from `SIRA_SEARCH_INDEXING`, which defaults to `on`. Discovery policy is
 * otherwise decided purely by hostname role — a production canonical hostname is
 * indexable by design — so without this switch there is no way to map a tenant
 * to its real hostname for testing without also inviting crawlers in.
 *
 * When `off`, every hostname serves `noindex, nofollow` metadata, a
 * `Disallow: /` robots policy and an empty sitemap, canonical or not. Releasing
 * the site to search engines is then a single environment change on the
 * deployment, with no code deploy.
 *
 * Unknown values throw rather than silently defaulting: a typo in this variable
 * must not quietly open or close the estate to indexing.
 */
export function isSearchIndexingEnabled(
  environment: SearchIndexingEnvironment = process.env,
): boolean {
  const rawValue = (environment["SIRA_SEARCH_INDEXING"] ?? "on")
    .trim()
    .toLowerCase();

  if (ENABLED_VALUES.has(rawValue)) {
    return true;
  }

  if (DISABLED_VALUES.has(rawValue)) {
    return false;
  }

  throw new SearchIndexingConfigurationError(
    `SIRA_SEARCH_INDEXING must be "on" or "off"; received "${rawValue}".`,
  );
}
