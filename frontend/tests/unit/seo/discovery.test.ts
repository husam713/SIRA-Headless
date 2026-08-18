import { describe, expect, it } from "vitest";
import { buildSiteRegistry } from "@/config/sites";
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
    expect(buildSitemap("group.localhost", registry)).toEqual([]);
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
  ] as const)("emits only the canonical homepage for %s", (hostname, url) => {
    expect(buildSitemap(hostname)).toEqual([{ url }]);
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
});
