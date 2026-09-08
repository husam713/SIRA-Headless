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
  // SIRA Digital will trade on its own Saudi domain rather than a Group
  // subdomain (ADR-033). That is a deliberate market decision, not drift: the
  // resolver matches on the whole hostname and never on a parent domain, so a
  // second apex costs this registry nothing.
  //
  // ADR-035: it is not there yet. Pre-launch, Digital is served on
  // `digital.siratrgroup.com`, and `sirahdigital.sa` is the planned address
  // rather than the current one. Recording that distinction — instead of
  // pointing `canonicalHostname` at a domain that does not resolve — is what
  // keeps canonical URLs, `hreflang` and the sitemap honest today, and what
  // makes the cutover a configuration change rather than a migration.
  //
  // The display name follows the established company convention in this file —
  // SIRA Consulting, SIRA Healthcare, SIRA Lifestyle, SIRA Real Estate — and
  // the SIRA/SIRAH spelling of the trading name is recorded in ADR-033 as an
  // open owner confirmation. It is one string here and one in the brand preset.
  digital: {
    key: "digital",
    name: "SIRA Digital",
    canonicalHostname: "digital.siratrgroup.com",
    aliases: [],
    plannedCanonicalHostname: "sirahdigital.sa",
    plannedAliases: ["www.sirahdigital.sa"],
    defaultLocale: "en",
    supportedLocales: ["en", "ar"],
  },
} as const satisfies Record<
  SiteKey,
  Omit<
    SiteDefinition,
    "deploymentHostnames" | "plannedCanonicalHostname" | "plannedAliases"
  > &
    Partial<Pick<SiteDefinition, "plannedCanonicalHostname" | "plannedAliases">>
>;

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

/**
 * Promotes a planned hostname to canonical, per site.
 *
 * ADR-035 requires the move to `sirahdigital.sa` to be configuration-driven: no
 * rebuild, no content migration, no second deployment. Setting
 * `SIRA_CANONICAL_HOSTNAMES_JSON` to `{"digital":"sirahdigital.sa"}` performs
 * the whole cutover — the new domain becomes canonical, its own aliases come
 * with it, and `digital.siratrgroup.com` demotes to a redirect alias so every
 * existing link and every indexed URL keeps working.
 *
 * A promoted hostname MUST already be declared by that site as its canonical,
 * an alias, or its planned hostname. A typo in an environment variable should
 * fail the build, not silently repoint a company at a domain nobody registered.
 */
export function parseCanonicalOverrides(
  rawValue: string | undefined,
): Partial<Record<SiteKey, string>> {
  if (rawValue === undefined || rawValue.trim() === "") return {};

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new SiteRegistryError(
      "SIRA_CANONICAL_HOSTNAMES_JSON is not valid JSON.",
    );
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new SiteRegistryError(
      "SIRA_CANONICAL_HOSTNAMES_JSON must be an object keyed by SIRA site key.",
    );
  }

  const result: Partial<Record<SiteKey, string>> = {};

  for (const [key, hostname] of Object.entries(parsed)) {
    if (!isSiteKey(key)) {
      throw new SiteRegistryError(`Unknown SIRA site key: ${key}.`);
    }

    if (typeof hostname !== "string") {
      throw new SiteRegistryError(
        `Canonical hostname override for ${key} must be a string.`,
      );
    }

    result[key] = hostname;
  }

  return result;
}

export function buildSiteRegistry(
  extraHosts: ExtraHosts = {},
  canonicalOverrides: Partial<Record<SiteKey, string>> = {},
): SiteRegistry {
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
    const declaredCanonical = normalizeSiteHostname(
      key,
      base.canonicalHostname,
    );
    const declaredAliases = base.aliases.map((hostname) =>
      normalizeSiteHostname(key, hostname),
    );
    const plannedCanonical =
      "plannedCanonicalHostname" in base && base.plannedCanonicalHostname !== undefined
        ? normalizeSiteHostname(key, base.plannedCanonicalHostname)
        : null;
    const plannedAliases =
      "plannedAliases" in base && base.plannedAliases !== undefined
        ? base.plannedAliases.map((hostname) =>
            normalizeSiteHostname(key, hostname),
          )
        : [];

    // The cutover. Everything the site declares is a legitimate promotion
    // target; anything else is a typo, and a typo must not be able to move a
    // company to a domain nobody registered.
    const override = canonicalOverrides[key];
    const promoted =
      override === undefined ? null : normalizeSiteHostname(key, override);

    if (
      promoted !== null &&
      promoted !== declaredCanonical &&
      promoted !== plannedCanonical &&
      !declaredAliases.includes(promoted) &&
      !plannedAliases.includes(promoted)
    ) {
      throw new SiteRegistryError(
        `Canonical hostname override for ${key} (${promoted}) is not a hostname ${key} declares.`,
      );
    }

    const canonicalHostname = promoted ?? declaredCanonical;

    // Every other declared hostname redirects to whichever one is canonical
    // now, so promoting the planned domain demotes the old one automatically
    // and no indexed URL is orphaned by the move.
    const aliases = Array.from(
      new Set([
        ...declaredAliases,
        ...(plannedCanonical === null ? [] : [plannedCanonical]),
        ...plannedAliases,
        declaredCanonical,
      ]),
    ).filter((hostname) => hostname !== canonicalHostname);

    // Deliberately NOT de-duplicated against the hostnames above: a deployment
    // host that collides with a canonical or an alias is a configuration
    // mistake, and `register` below is what turns it into a loud failure rather
    // than a silently dropped entry.
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
      aliases: Object.freeze(aliases),
      plannedCanonicalHostname: plannedCanonical,
      plannedAliases: Object.freeze(plannedAliases),
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
    parseCanonicalOverrides(process.env["SIRA_CANONICAL_HOSTNAMES_JSON"]),
  );
}
