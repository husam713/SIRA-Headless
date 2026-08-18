import {
  SITE_KEYS,
  type HostnameRole,
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
} as const satisfies Record<SiteKey, Omit<SiteDefinition, "deploymentHostnames">>;

type ExtraHosts = Partial<Record<SiteKey, readonly string[]>>;

interface HostnameRegistration {
  readonly site: SiteDefinition;
  readonly role: HostnameRole;
}

export interface SiteRegistry {
  readonly sites: Readonly<Record<SiteKey, SiteDefinition>>;
  readonly byHostname: ReadonlyMap<string, HostnameRegistration>;
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

function normalizeSiteHostname(siteKey: SiteKey, hostname: string): string {
  try {
    return normalizeHostname(hostname);
  } catch (error) {
    const message =
      error instanceof InvalidHostnameError
        ? error.message
        : "Unknown hostname validation error.";

    throw new SiteRegistryError(
      `Invalid hostname for ${siteKey}: ${hostname}. ${message}`,
    );
  }
}

export function buildSiteRegistry(extraHosts: ExtraHosts = {}): SiteRegistry {
  const mutableSites = {} as Record<SiteKey, SiteDefinition>;
  const byHostname = new Map<string, HostnameRegistration>();

  const register = (
    hostname: string,
    site: SiteDefinition,
    role: HostnameRole,
  ): void => {
    const existing = byHostname.get(hostname);

    if (existing !== undefined) {
      throw new SiteRegistryError(
        `Hostname ${hostname} is registered more than once (${existing.site.key}/${existing.role}, ${site.key}/${role}).`,
      );
    }

    byHostname.set(hostname, Object.freeze({ site, role }));
  };

  for (const key of SITE_KEYS) {
    const base = BASE_SITES[key];
    const canonicalHostname = normalizeSiteHostname(key, base.canonicalHostname);
    const aliases = base.aliases.map((hostname) =>
      normalizeSiteHostname(key, hostname),
    );
    const deploymentHostnames = Array.from(
      new Set(
        (extraHosts[key] ?? []).map((hostname) =>
          normalizeSiteHostname(key, hostname),
        ),
      ),
    );

    const site: SiteDefinition = Object.freeze({
      ...base,
      canonicalHostname,
      aliases: Object.freeze([...aliases]),
      deploymentHostnames: Object.freeze(deploymentHostnames),
      supportedLocales: Object.freeze([...base.supportedLocales]),
    });

    mutableSites[key] = site;

    register(site.canonicalHostname, site, "canonical");

    for (const hostname of site.aliases) {
      register(hostname, site, "redirect-alias");
    }

    for (const hostname of site.deploymentHostnames) {
      register(hostname, site, "deployment");
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
