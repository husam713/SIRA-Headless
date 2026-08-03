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
  ] as const)("resolves %s to %s", (hostname, expectedKey) => {
    expect(resolveSiteFromHostname(hostname)?.site.key).toBe(expectedKey);
  });

  it("marks www as an alias requiring canonicalization", () => {
    const resolution = resolveSiteFromHostname("www.siratrgroup.com");

    expect(resolution?.site.key).toBe("group");
    expect(resolution?.isCanonical).toBe(false);
    expect(resolution?.site.canonicalHostname).toBe("siratrgroup.com");
  });

  it("supports allowlisted local and staging aliases", () => {
    const registry = buildSiteRegistry({
      group: ["group.localhost", "group.staging.siratrgroup.com"],
      consulting: ["consulting.localhost"],
    });

    expect(
      resolveSiteFromHostname("group.localhost:3000", registry)?.site.key,
    ).toBe("group");

    expect(
      resolveSiteFromHostname(
        "group.staging.siratrgroup.com",
        registry,
      )?.site.key,
    ).toBe("group");

    expect(
      resolveSiteFromHostname("consulting.localhost:3000", registry)?.site.key,
    ).toBe("consulting");
  });

  it("rejects unknown hostnames instead of falling back to Group", () => {
    expect(resolveSiteFromHostname("attacker.example")).toBeNull();
  });

  it("rejects duplicate hostnames across sites", () => {
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
