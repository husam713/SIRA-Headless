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
  readonly canonicalHostname: string;
  readonly aliases: readonly string[];
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
