import { describe, expect, it } from "vitest";
import { buildSiteRegistry, getSiteRegistry } from "@/config/sites";
import {
  buildRobotsPolicy,
  buildSitemap,
  resolveSiteDiscoveryContext,
} from "@/lib/seo/discovery";

describe("discovery policy", () => {
  it("allows discovery only on canonical production hosts", () => {
    expect(buildRobotsPolicy("siratrgroup.com")).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      sitemap: "https://siratrgroup.com/sitemap.xml",
      host: "https://siratrgroup.com",
    });
  });

  it("fails closed for deployment hosts without advertising a sitemap", () => {
    const registry = buildSiteRegistry({ group: ["group.localhost"] });

    expect(buildRobotsPolicy("group.localhost", registry)).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
    expect(buildSitemap("group.localhost", [], registry)).toEqual([]);
  });

  it("fails closed for redirect aliases and unknown hosts", () => {
    expect(buildRobotsPolicy("www.siratrgroup.com")).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
    expect(buildSitemap("www.siratrgroup.com")).toEqual([]);

    expect(buildRobotsPolicy("attacker.example")).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
    expect(buildSitemap("attacker.example")).toEqual([]);
  });

  it.each([
    ["siratrgroup.com", "https://siratrgroup.com/"],
    ["consulting.siratrgroup.com", "https://consulting.siratrgroup.com/"],
    ["healthcare.siratrgroup.com", "https://healthcare.siratrgroup.com/"],
    ["lifestyle.siratrgroup.com", "https://lifestyle.siratrgroup.com/"],
    ["realestate.siratrgroup.com", "https://realestate.siratrgroup.com/"],
  ] as const)("emits the canonical homepage in both languages for %s", (hostname, url) => {
    // ADR-037: every Atlas tenant serves Arabic under `/ar/`.
    expect(buildSitemap(hostname)).toEqual([{ url }, { url: `${url}ar/` }]);
  });

  it("does not treat a different tenant canonical host as production for the requested site", () => {
    const context = resolveSiteDiscoveryContext(
      "healthcare",
      "consulting.siratrgroup.com",
    );

    expect(context.site.key).toBe("healthcare");
    expect(context.hostnameRole).toBeNull();
    expect(context.isProductionCanonical).toBe(false);
  });

  it("lists supplied paths per approved locale with a last-modified date, homepage first", () => {
    const digital = buildSitemap("digital.siratrgroup.com", [
      { path: "/news/" },
      { path: "/insights/istanbul-bridge/", lastModified: "2026-08-01T00:00:00Z" },
    ]);

    expect(digital.map((entry) => entry.url)).toEqual([
      "https://digital.siratrgroup.com/",
      "https://digital.siratrgroup.com/ar/",
      "https://digital.siratrgroup.com/news/",
      "https://digital.siratrgroup.com/ar/news/",
      "https://digital.siratrgroup.com/insights/istanbul-bridge/",
      "https://digital.siratrgroup.com/ar/insights/istanbul-bridge/",
    ]);
    expect(digital[4]?.lastModified).toEqual(new Date("2026-08-01T00:00:00Z"));
    expect(digital[0]).not.toHaveProperty("lastModified");

    // A tenant without approved locale routes lists only its default locale.
    // None is left in the registry (ADR-037), so one is derived for the test.
    const base = getSiteRegistry();
    const gated = { ...base.sites.group, localeRoutesApproved: false };
    const registry = {
      sites: { ...base.sites, group: gated },
      byHostname: new Map(
        [...base.byHostname].map(([hostname, registration]) => [
          hostname,
          registration.site.key === "group" ? { ...registration, site: gated } : registration,
        ]),
      ),
    };
    const group = buildSitemap("siratrgroup.com", [{ path: "/news/" }], registry);
    expect(group.map((entry) => entry.url)).toEqual([
      "https://siratrgroup.com/",
      "https://siratrgroup.com/news/",
    ]);
  });
});
