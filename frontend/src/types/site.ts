export const SITE_KEYS = [
  "group",
  "consulting",
  "healthcare",
  "lifestyle",
  "realestate",
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
