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
    ["sirahdigital.sa", "digital"],
    ["www.sirahdigital.sa", "digital"],
  ] as const)("resolves %s to %s", (hostname, expectedKey) => {
    expect(resolveSiteFromHostname(hostname)?.site.key).toBe(expectedKey);
  });

  // ADR-033. The registry never matched on a parent domain, so a company on its
  // own apex resolves by exactly the same rule as a Group subdomain. These
  // assertions exist so a future change that reintroduces a siratrgroup.com
  // assumption fails here rather than in production.
  it("resolves the Digital company on its own Saudi apex", () => {
    expect(resolveSiteFromHostname("sirahdigital.sa")).toMatchObject({
      hostnameRole: "canonical",
      isCanonical: true,
      shouldRedirectToCanonical: false,
      site: { key: "digital", canonicalHostname: "sirahdigital.sa" },
    });
  });

  it("redirects the Digital www alias to its own canonical apex, not to Group", () => {
    expect(resolveSiteFromHostname("www.sirahdigital.sa")).toMatchObject({
      hostnameRole: "redirect-alias",
      shouldRedirectToCanonical: true,
      site: { key: "digital", canonicalHostname: "sirahdigital.sa" },
    });
  });

  it("does not resolve an unregistered host under either apex", () => {
    expect(resolveSiteFromHostname("digital.siratrgroup.com")).toBeNull();
    expect(resolveSiteFromHostname("mail.sirahdigital.sa")).toBeNull();
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
