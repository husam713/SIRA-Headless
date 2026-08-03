import {
  SITE_KEYS,
  type SiteDefinition,
  type SiteKey,
} from "@/types/site";
import {
  InvalidHostnameError,
  normalizeHostname,
} from "@/lib/host/normalize-host";

const BASE_SITES = {
  group: {
    key: "group",
    name: "SIRA Group",
    canonicalHostname: "siratrgroup.com",
    aliases: ["www.siratrgroup.com"],
    defaultLocale: "en",
    supportedLocales: ["en", "ar"],
  },
  consulting: {
    key: "consulting",
    name: "SIRA Consulting",
    canonicalHostname: "consulting.siratrgroup.com",
    aliases: [],
    defaultLocale: "en",
    supportedLocales: ["en", "ar"],
  },
  healthcare: {
    key: "healthcare",
    name: "SIRA Healthcare",
    canonicalHostname: "healthcare.siratrgroup.com",
    aliases: [],
    defaultLocale: "en",
    supportedLocales: ["en", "ar"],
  },
  lifestyle: {
    key: "lifestyle",
    name: "SIRA Lifestyle",
    canonicalHostname: "lifestyle.siratrgroup.com",
    aliases: [],
    defaultLocale: "en",
    supportedLocales: ["en", "ar"],
  },
  realestate: {
    key: "realestate",
    name: "SIRA Real Estate",
    canonicalHostname: "realestate.siratrgroup.com",
    aliases: [],
    defaultLocale: "en",
    supportedLocales: ["en", "ar"],
  },
} as const satisfies Record<SiteKey, SiteDefinition>;

type ExtraHosts = Partial<Record<SiteKey, readonly string[]>>;

export interface SiteRegistry {
  readonly sites: Readonly<Record<SiteKey, SiteDefinition>>;
  readonly byHostname: ReadonlyMap<string, SiteDefinition>;
}

export class SiteRegistryError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "SiteRegistryError";
  }
}

export function isSiteKey(value: string): value is SiteKey {
  return (SITE_KEYS as readonly string[]).includes(value);
}

export function parseExtraHosts(rawValue: string | undefined): ExtraHosts {
  if (rawValue === undefined || rawValue.trim() === "") {
    return {};
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new SiteRegistryError("SIRA_EXTRA_HOSTS_JSON is not valid JSON.");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new SiteRegistryError(
      "SIRA_EXTRA_HOSTS_JSON must be an object keyed by SIRA site key.",
    );
  }

  const result: Partial<Record<SiteKey, readonly string[]>> = {};

  for (const [key, hostnames] of Object.entries(parsed)) {
    if (!isSiteKey(key)) {
      throw new SiteRegistryError(`Unknown SIRA site key: ${key}.`);
    }

    if (
      !Array.isArray(hostnames) ||
      !hostnames.every((hostname) => typeof hostname === "string")
    ) {
      throw new SiteRegistryError(
        `Extra hostnames for ${key} must be an array of strings.`,
      );
    }

    result[key] = hostnames;
  }

  return result;
}

export function buildSiteRegistry(extraHosts: ExtraHosts = {}): SiteRegistry {
  const mutableSites = {} as Record<SiteKey, SiteDefinition>;
  const byHostname = new Map<string, SiteDefinition>();

  for (const key of SITE_KEYS) {
    const base = BASE_SITES[key];
    const aliases = [
      ...base.aliases,
      ...(extraHosts[key] ?? []),
    ].map((hostname) => {
      try {
        return normalizeHostname(hostname);
      } catch (error) {
        const message =
          error instanceof InvalidHostnameError
            ? error.message
            : "Unknown hostname validation error.";

        throw new SiteRegistryError(
          `Invalid hostname for ${key}: ${hostname}. ${message}`,
        );
      }
    });

    const site: SiteDefinition = Object.freeze({
      ...base,
      canonicalHostname: normalizeHostname(base.canonicalHostname),
      aliases: Object.freeze(Array.from(new Set(aliases))),
      supportedLocales: Object.freeze([...base.supportedLocales]),
    });

    mutableSites[key] = site;

    for (const hostname of [site.canonicalHostname, ...site.aliases]) {
      const existing = byHostname.get(hostname);

      if (existing !== undefined) {
        throw new SiteRegistryError(
          `Hostname ${hostname} is assigned to both ${existing.key} and ${key}.`,
        );
      }

      byHostname.set(hostname, site);
    }
  }

  return Object.freeze({
    sites: Object.freeze(mutableSites),
    byHostname,
  });
}

export function getSiteRegistry(): SiteRegistry {
  return buildSiteRegistry(
    parseExtraHosts(process.env["SIRA_EXTRA_HOSTS_JSON"]),
  );
}
