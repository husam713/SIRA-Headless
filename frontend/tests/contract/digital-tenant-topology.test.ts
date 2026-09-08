import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildSiteRegistry, getSiteRegistry } from "@/config/sites";
import { getEditorialBusinessUnit } from "@/lib/editorial/business-unit";
import { resolveSiteFromHostname } from "@/lib/host/resolve-site";
import { SITE_KEYS } from "@/types/site";

// ADR-033 made SIRA Digital a first-class company on its own Saudi apex.
// ADR-035 then phased that: Digital launches on `digital.siratrgroup.com` and
// moves to `sirahdigital.sa` by configuration. The point of this file is that a
// later session cannot quietly reverse either decision, and — the sharper risk —
// cannot quietly conflate them. The durable state, the decision records, the
// provisioning guide and the running code all have to keep agreeing.
//
// The two things most likely to be "tidied" by someone working from memory:
// that the ACTIVE hostname is the subdomain today, and that the Saudi domain is
// registered as planned rather than deleted for not resolving yet.

function repositoryFile(relativePath: string): string {
  return readFileSync(new URL(`../../../${relativePath}`, import.meta.url), "utf8");
}

const state = JSON.parse(repositoryFile("project-state.json")) as {
  readonly canonicalPublicProductionTopology: {
    readonly apex: string;
    readonly apexes: readonly string[];
    readonly multiApex: boolean;
    readonly plannedApexes: readonly string[];
    readonly multiApexPlanned: boolean;
    readonly sites: Readonly<Record<string, string>>;
    readonly plannedSites: Readonly<Record<string, string>>;
    readonly expansion: Readonly<Record<string, string>>;
    readonly phasing: Readonly<Record<string, string>>;
  };
  readonly authorization: {
    readonly digitalTenant: {
      readonly status: string;
      readonly decisionRecord: string;
      readonly canonicalHostname: string;
      readonly plannedCanonicalHostname: string;
      readonly hostnameStrategyAdr: string;
      readonly cmsOriginHostname: string;
      readonly siteKey: string;
      readonly businessUnitSlug: string;
      readonly separateCodebase: boolean;
      readonly separateCms: boolean;
      readonly doesNotAuthorize: readonly string[];
    };
  };
  readonly openGates: Readonly<Record<string, string>>;
};

const decisions = repositoryFile("docs/DECISIONS.md");
const provisioning = repositoryFile("docs/DIGITAL-TENANT-PROVISIONING.md");
const wordpressConfig = repositoryFile("frontend/src/config/wordpress.ts");

describe("ADR-033 / ADR-035 Digital tenant topology", () => {
  it("serves Digital on the Group subdomain today and records the Saudi apex as planned", () => {
    const topology = state.canonicalPublicProductionTopology;

    expect(topology.sites["digital"]).toBe("digital.siratrgroup.com");
    expect(topology.plannedSites["digital"]).toBe("sirahdigital.sa");

    // Active topology is single-apex again. ADR-033's expansion is preserved as
    // the END STATE, not asserted as the present one.
    expect(topology.multiApex).toBe(false);
    expect(topology.apexes).toEqual(["siratrgroup.com"]);
    expect(topology.multiApexPlanned).toBe(true);
    expect(topology.plannedApexes).toEqual(["sirahdigital.sa"]);

    // The Group apex stays exactly where it was. Step 2C.4's contract locks it.
    expect(topology.apex).toBe("siratrgroup.com");
    expect(topology.sites["group"]).toBe("siratrgroup.com");
  });

  it("names both decision records everywhere a future session would look", () => {
    expect(state.authorization.digitalTenant.decisionRecord).toBe("ADR-033");
    expect(state.authorization.digitalTenant.hostnameStrategyAdr).toBe("ADR-035");
    expect(topologyText("expansion")).toContain("ADR-033");
    expect(topologyText("phasing")).toContain("ADR-035");
    expect(decisions).toContain("## ADR-033");
    expect(decisions).toContain("## ADR-035");
    expect(provisioning).toContain("ADR-033");
  });

  it("keeps ADR-024's non-topology clauses alive", () => {
    // The expansion supersedes ADR-024 on the single-apex point ONLY. Losing
    // this sentence would let a later reader treat public-domain evidence as
    // evidence about the backend, which ADR-024 exists to forbid.
    const supersedes = state.canonicalPublicProductionTopology.expansion["supersedes"] ?? "";

    expect(supersedes).toContain("single-apex point only");
    expect(supersedes).toContain("cookie-domain");
  });

  it("authorizes the tenant without authorizing anything protected", () => {
    const grant = state.authorization.digitalTenant;

    expect(grant.status).toBe("OWNER_AUTHORIZED");
    expect(grant.separateCodebase).toBe(false);
    expect(grant.separateCms).toBe(false);
    expect(grant.doesNotAuthorize).toEqual(
      expect.arrayContaining([
        // The site now EXISTS, so the thing to protect is no longer its
        // creation but its survival.
        "DIGITAL_WORDPRESS_SITE_DELETION_OR_LOSS",
        "DOMAIN_REGISTRATION_OR_DNS_CHANGE",
        "PRODUCTION_DEPLOYMENT_OR_CUTOVER",
        "DESTRUCTIVE_DATABASE_OPERATIONS",
      ]),
    );
  });

  it("keeps the Saudi cutover visible as an open gate", () => {
    // Provisioning is done and DNS resolves; the domain move is not done. A
    // gate that closes must not take a gate that is still open down with it,
    // which is the whole reason these are separate entries rather than one
    // "Digital domain" status.
    expect(state.openGates["digitalWordPressSiteProvisioning"]).toMatch(/^CLOSED_/u);
    expect(state.openGates["digitalDomainRegistrationAndDns"]).toMatch(/^CLOSED_/u);
    expect(state.openGates["digitalSaudiDomainCutover"]).toMatch(/^OPEN_/u);
    expect(state.openGates["digitalTradingNameSpelling"]).toMatch(/^OPEN_/u);
  });

  it("keeps the pre-launch hostname collision visible", () => {
    // The owner moved the CMS onto `digital.siratrgroup.com` on 2026-09-08,
    // which frees the Saudi domain for the frontend at cutover but means
    // WordPress and the intended pre-launch frontend now claim one hostname.
    // Nothing is broken while no deployment is authorized; this must not be
    // allowed to go quiet before one is.
    expect(state.openGates["digitalCmsOriginHostnameCollision"]).toMatch(/^OPEN_/u);
    expect(state.authorization.digitalTenant.cmsOriginHostname).toBe(
      "digital.siratrgroup.com",
    );
  });

  it("agrees with the code the application actually runs", () => {
    const grant = state.authorization.digitalTenant;
    const registry = getSiteRegistry();

    expect(SITE_KEYS).toContain("digital");
    expect(registry.sites.digital.canonicalHostname).toBe(grant.canonicalHostname);
    expect(registry.sites.digital.plannedCanonicalHostname).toBe(
      grant.plannedCanonicalHostname,
    );
    expect(registry.sites.digital.name).toBe("SIRA Digital");
    expect(getEditorialBusinessUnit("digital")).toBe(grant.businessUnitSlug);

    expect(resolveSiteFromHostname("digital.siratrgroup.com")).toMatchObject({
      site: { key: "digital" },
      isCanonical: true,
      shouldRedirectToCanonical: false,
    });
  });

  it("redirects the Saudi domain to the live host until it is promoted", () => {
    // Registered now rather than later, so the day DNS points at us the domain
    // lands somewhere correct instead of being rejected as an unknown host.
    expect(resolveSiteFromHostname("sirahdigital.sa")).toMatchObject({
      site: { key: "digital" },
      isCanonical: false,
      shouldRedirectToCanonical: true,
    });
    expect(resolveSiteFromHostname("www.sirahdigital.sa")).toMatchObject({
      site: { key: "digital" },
      shouldRedirectToCanonical: true,
    });
  });

  it("completes the cutover from configuration alone", () => {
    const registry = buildSiteRegistry({}, { digital: "sirahdigital.sa" });

    expect(registry.sites.digital.canonicalHostname).toBe("sirahdigital.sa");

    // And the old host keeps working, which is the whole point: promoting the
    // new domain must not orphan a single indexed URL.
    expect(registry.byHostname.get("digital.siratrgroup.com")).toMatchObject({
      site: { key: "digital" },
      role: "redirect-alias",
    });
    expect(registry.byHostname.get("www.sirahdigital.sa")).toMatchObject({
      role: "redirect-alias",
    });
  });

  it("refuses to promote a hostname the site never declared", () => {
    // A typo in an environment variable must not be able to move a company to
    // a domain nobody registered.
    expect(() =>
      buildSiteRegistry({}, { digital: "sirahdigital.com" }),
    ).toThrow(/not a hostname digital declares/u);
  });

  it("keeps the CMS origin independent of the public hostname", () => {
    // ADR-035. WordPress stays on Hostinger while the public frontend runs
    // elsewhere, so the GraphQL origin is configured per tenant and is never
    // derived from whatever hostname the public site is currently served on.
    expect(wordpressConfig).toContain("SIRA_WP_DIGITAL_GRAPHQL_URL");
    expect(wordpressConfig).not.toContain("canonicalHostname");
  });

  it("supports Arabic on the Saudi company", () => {
    expect(getSiteRegistry().sites.digital.supportedLocales).toContain("ar");
  });
});

function topologyText(section: "expansion" | "phasing"): string {
  return JSON.stringify(state.canonicalPublicProductionTopology[section]);
}
