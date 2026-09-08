import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getSiteRegistry } from "@/config/sites";
import { getEditorialBusinessUnit } from "@/lib/editorial/business-unit";
import { resolveSiteFromHostname } from "@/lib/host/resolve-site";
import { SITE_KEYS } from "@/types/site";

// ADR-033 expanded the canonical public production topology from one apex to
// two. The point of this file is that a later session cannot quietly reverse
// that: the durable state, the decision record, the provisioning guide and the
// running code all have to keep agreeing, or this fails.
//
// It also pins the two things most likely to be "tidied" by someone who
// remembers the old single-apex rule — that `sirahdigital.sa` is canonical
// rather than an alias of Group, and that ADR-024's other clauses survive.

function repositoryFile(relativePath: string): string {
  return readFileSync(new URL(`../../../${relativePath}`, import.meta.url), "utf8");
}

const state = JSON.parse(repositoryFile("project-state.json")) as {
  readonly canonicalPublicProductionTopology: {
    readonly apex: string;
    readonly apexes: readonly string[];
    readonly multiApex: boolean;
    readonly sites: Readonly<Record<string, string>>;
    readonly expansion: Readonly<Record<string, string>>;
  };
  readonly authorization: {
    readonly digitalTenant: {
      readonly status: string;
      readonly decisionRecord: string;
      readonly canonicalHostname: string;
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

describe("ADR-033 Digital tenant topology", () => {
  it("records a two-apex canonical topology with Digital on the Saudi domain", () => {
    const topology = state.canonicalPublicProductionTopology;

    expect(topology.multiApex).toBe(true);
    expect(topology.apexes).toEqual(["siratrgroup.com", "sirahdigital.sa"]);
    expect(topology.sites["digital"]).toBe("sirahdigital.sa");

    // The Group apex stays exactly where it was. Step 2C.4's contract locks it,
    // and the expansion added a second apex rather than moving the first.
    expect(topology.apex).toBe("siratrgroup.com");
    expect(topology.sites["group"]).toBe("siratrgroup.com");
  });

  it("names the decision record everywhere a future session would look", () => {
    expect(state.authorization.digitalTenant.decisionRecord).toBe("ADR-033");
    expect(topologyExpansionText()).toContain("ADR-033");
    expect(decisions).toContain("## ADR-033");
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
        "LIVE_WORDPRESS_SITE_CREATION",
        "DOMAIN_REGISTRATION_OR_DNS_CHANGE",
        "PRODUCTION_DEPLOYMENT_OR_CUTOVER",
        "DESTRUCTIVE_DATABASE_OPERATIONS",
      ]),
    );
  });

  it("keeps the unprovisioned CMS site recorded as an open gate", () => {
    // The tenant exists in this repository before it exists in WordPress. That
    // is deliberate and safe, but it must stay visible rather than being
    // mistaken for a finished provisioning.
    expect(state.openGates["digitalWordPressSiteNotProvisioned"]).toMatch(
      /^OPEN_/u,
    );
    expect(state.openGates["digitalTradingNameSpelling"]).toMatch(/^OPEN_/u);
  });

  it("agrees with the code the application actually runs", () => {
    const grant = state.authorization.digitalTenant;
    const registry = getSiteRegistry();

    expect(SITE_KEYS).toContain("digital");
    expect(registry.sites.digital.canonicalHostname).toBe(grant.canonicalHostname);
    expect(registry.sites.digital.name).toBe("SIRA Digital");
    expect(getEditorialBusinessUnit("digital")).toBe(grant.businessUnitSlug);

    // Canonical in its own right. If a later change ever made this an alias of
    // Group, `isCanonical` would flip and this is where it would be caught.
    expect(resolveSiteFromHostname("sirahdigital.sa")).toMatchObject({
      site: { key: "digital" },
      isCanonical: true,
      shouldRedirectToCanonical: false,
    });
  });

  it("supports Arabic on the Saudi company", () => {
    expect(getSiteRegistry().sites.digital.supportedLocales).toContain("ar");
  });
});

function topologyExpansionText(): string {
  return JSON.stringify(state.canonicalPublicProductionTopology.expansion);
}
