// The SIRA GROUP operating companies this application serves.
//
// `digital` is SIRA Digital, added by ADR-033. It is the first company whose
// canonical hostname is not a `siratrgroup.com` subdomain: it trades on its own
// Saudi domain. Nothing in this registry assumed a shared parent domain, so the
// only thing that changed is that the topology now spans two apex domains.
export const SITE_KEYS = [
  "group",
  "consulting",
  "healthcare",
  "lifestyle",
  "realestate",
  "digital",
] as const;

export type SiteKey = (typeof SITE_KEYS)[number];

export type LocaleCode = "en" | "ar";

export type HostnameRole = "canonical" | "redirect-alias" | "deployment";

export interface SiteDefinition {
  readonly key: SiteKey;
  readonly name: string;
  /**
   * The hostname this site is served on TODAY. Canonical URLs, `metadataBase`,
   * the sitemap and the alias redirects all derive from it.
   */
  readonly canonicalHostname: string;
  readonly aliases: readonly string[];
  /**
   * A hostname this site is expected to move to, registered now as a redirect
   * alias and promoted to canonical by configuration rather than by a code
   * change (ADR-035).
   *
   * A domain a company owns but has not launched on is a real, ordinary state,
   * and it is not the same thing as an alias: an alias is a spelling of the
   * current address, whereas this is the next address. Keeping them distinct is
   * what lets the cutover be a configuration change instead of a migration.
   */
  readonly plannedCanonicalHostname: string | null;
  /** Aliases that belong to `plannedCanonicalHostname`, not to the current one. */
  readonly plannedAliases: readonly string[];
  readonly deploymentHostnames: readonly string[];
  readonly defaultLocale: LocaleCode;
  readonly supportedLocales: readonly LocaleCode[];
}

export interface ResolvedSite {
  readonly site: SiteDefinition;
  readonly requestedHostname: string;
  readonly hostnameRole: HostnameRole;
  readonly isCanonical: boolean;
  readonly shouldRedirectToCanonical: boolean;
}
