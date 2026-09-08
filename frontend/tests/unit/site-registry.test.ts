import { describe, expect, it } from "vitest";
import {
  buildSiteRegistry,
  parseExtraHosts,
  SiteRegistryError,
} from "@/config/sites";
import {
  getInternalSitePath,
  getSiteDefinition,
  isInternalSitePath,
  resolveSiteFromHostname,
} from "@/lib/host/resolve-site";

describe("SIRA site registry", () => {
  it.each([
    ["siratrgroup.com", "group"],
    ["www.siratrgroup.com", "group"],
    ["consulting.siratrgroup.com", "consulting"],
    ["healthcare.siratrgroup.com", "healthcare"],
    ["lifestyle.siratrgroup.com", "lifestyle"],
    ["realestate.siratrgroup.com", "realestate"],
    ["digital.siratrgroup.com", "digital"],
    ["sirahdigital.sa", "digital"],
    ["www.sirahdigital.sa", "digital"],
  ] as const)("resolves %s to %s", (hostname, expectedKey) => {
    expect(resolveSiteFromHostname(hostname)?.site.key).toBe(expectedKey);
  });

  // ADR-033 put Digital on its own Saudi apex; ADR-035 phased the move, so the
  // company is served on a Group subdomain today. The registry never matched on
  // a parent domain, so both shapes resolve by exactly the same rule. These
  // assertions exist so a future change that reintroduces a single-apex
  // assumption — in either direction — fails here rather than in production.
  it("serves the Digital company on its pre-launch subdomain", () => {
    expect(resolveSiteFromHostname("digital.siratrgroup.com")).toMatchObject({
      hostnameRole: "canonical",
      isCanonical: true,
      shouldRedirectToCanonical: false,
      site: { key: "digital", canonicalHostname: "digital.siratrgroup.com" },
    });
  });

  it("redirects the planned Saudi domain to Digital rather than to Group", () => {
    // The domain is registered in the registry before it resolves in DNS, so
    // the day it points at us it lands on Digital instead of being rejected.
    for (const hostname of ["sirahdigital.sa", "www.sirahdigital.sa"]) {
      expect(resolveSiteFromHostname(hostname)).toMatchObject({
        hostnameRole: "redirect-alias",
        shouldRedirectToCanonical: true,
        site: { key: "digital", canonicalHostname: "digital.siratrgroup.com" },
      });
    }
  });

  it("does not resolve an unregistered host under either apex", () => {
    expect(resolveSiteFromHostname("mail.sirahdigital.sa")).toBeNull();
    expect(resolveSiteFromHostname("digital.sirahdigital.sa")).toBeNull();
  });

  it("classifies canonical production hosts without redirecting", () => {
    expect(resolveSiteFromHostname("siratrgroup.com")).toMatchObject({
      hostnameRole: "canonical",
      isCanonical: true,
      shouldRedirectToCanonical: false,
      site: { key: "group", canonicalHostname: "siratrgroup.com" },
    });
  });

  it("classifies www as a redirect alias requiring production canonicalization", () => {
    expect(resolveSiteFromHostname("www.siratrgroup.com")).toMatchObject({
      hostnameRole: "redirect-alias",
      isCanonical: false,
      shouldRedirectToCanonical: true,
      site: { key: "group", canonicalHostname: "siratrgroup.com" },
    });
  });

  it("supports allowlisted deployment hosts without treating them as redirect aliases", () => {
    const registry = buildSiteRegistry({
      group: ["group.localhost"],
      consulting: ["consulting.localhost"],
    });

    expect(
      resolveSiteFromHostname("group.localhost:3000", registry),
    ).toMatchObject({
      hostnameRole: "deployment",
      isCanonical: false,
      shouldRedirectToCanonical: false,
      site: { key: "group", canonicalHostname: "siratrgroup.com" },
    });

    expect(
      resolveSiteFromHostname("consulting.localhost:3000", registry),
    ).toMatchObject({
      hostnameRole: "deployment",
      shouldRedirectToCanonical: false,
      site: {
        key: "consulting",
        canonicalHostname: "consulting.siratrgroup.com",
      },
    });
  });

  it("rejects unknown hostnames instead of falling back to Group", () => {
    expect(resolveSiteFromHostname("attacker.example")).toBeNull();
  });

  it("rejects duplicate hostnames across site or hostname roles", () => {
    expect(() =>
      buildSiteRegistry({
        group: ["siratrgroup.com"],
      }),
    ).toThrow(SiteRegistryError);

    expect(() =>
      buildSiteRegistry({
        consulting: ["shared.localhost"],
        healthcare: ["shared.localhost"],
      }),
    ).toThrow(SiteRegistryError);
  });

  it("rejects unknown site keys in environment JSON", () => {
    expect(() =>
      parseExtraHosts('{"unknown":["unknown.localhost"]}'),
    ).toThrow(SiteRegistryError);
  });

  it("validates direct internal tenant paths", () => {
    expect(isInternalSitePath("/consulting/projects")).toBe(true);
    expect(isInternalSitePath("/projects/consulting")).toBe(false);
  });

  it("builds an internal rewrite path without exposing it publicly", () => {
    expect(getInternalSitePath("healthcare", "/projects/example")).toBe(
      "/healthcare/projects/example",
    );
    expect(getInternalSitePath("group", "/")).toBe("/group");
  });

  it("returns null for an unknown site-key route parameter", () => {
    expect(getSiteDefinition("unknown")).toBeNull();
  });
});
