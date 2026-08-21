import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildSiteRegistry } from "@/config/sites";
import { createFallbackBrand, type ResolvedBrand } from "@/lib/brand";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import {
  buildOrganizationStructuredData,
  buildSiteStructuredData,
  buildWebSiteStructuredData,
  JsonLdScript,
  serializeJsonLd,
  SiteStructuredDataScripts,
} from "@/lib/seo/structured-data";

function withBrand(
  siteKey: ResolvedBrand["siteKey"],
  values: Partial<ResolvedBrand>,
): ResolvedBrand {
  return Object.freeze({
    ...createFallbackBrand(siteKey),
    ...values,
  });
}

describe("headless structured data ownership", () => {
  it("builds valid Organization and WebSite JSON-LD", () => {
    const brand = createFallbackBrand("group");
    const organization = buildOrganizationStructuredData("group", brand);
    const website = buildWebSiteStructuredData("group", brand);

    expect(JSON.parse(serializeJsonLd(organization))).toEqual(organization);
    expect(JSON.parse(serializeJsonLd(website))).toEqual(website);
    expect(organization).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "SIRA GROUP",
      url: "https://siratrgroup.com/",
      logo: "https://siratrgroup.com/brands/group/logo.png",
    });
    expect(website).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "SIRA GROUP",
      url: "https://siratrgroup.com/",
    });
  });

  it("keeps canonical hosts and organization identity tenant-specific", () => {
    const consulting = buildSiteStructuredData(
      "consulting",
      createFallbackBrand("consulting"),
    );
    const healthcare = buildSiteStructuredData(
      "healthcare",
      createFallbackBrand("healthcare"),
    );

    expect(consulting.organization.name).toBe("SIRA Consulting");
    expect(consulting.organization.url).toBe(
      "https://consulting.siratrgroup.com/",
    );
    expect(healthcare.organization.name).toBe("SIRA Healthcare");
    expect(healthcare.organization.url).toBe(
      "https://healthcare.siratrgroup.com/",
    );
    expect(serializeJsonLd(consulting)).not.toContain(
      "healthcare.siratrgroup.com",
    );
    expect(serializeJsonLd(healthcare)).not.toContain(
      "consulting.siratrgroup.com",
    );
  });

  it("rejects a brand object from another tenant", () => {
    expect(() =>
      buildSiteStructuredData(
        "consulting",
        createFallbackBrand("healthcare"),
      ),
    ).toThrow(TypeError);
  });

  it("uses canonical production identity on an allowlisted deployment host", () => {
    const registry = buildSiteRegistry({ group: ["group.localhost"] });
    const discovery = resolveSiteDiscoveryContext(
      "group",
      "group.localhost",
      registry,
    );
    const data = buildSiteStructuredData(
      discovery.site.key,
      createFallbackBrand(discovery.site.key),
    );

    expect(discovery.hostnameRole).toBe("deployment");
    expect(discovery.isProductionCanonical).toBe(false);
    expect(data.organization.url).toBe("https://siratrgroup.com/");
    expect(data.website.url).toBe("https://siratrgroup.com/");
    expect(serializeJsonLd(data)).not.toContain("group.localhost");
  });

  it("never uses a WordPress backend hostname as canonical identity", () => {
    const brand = withBrand("group", {
      remoteLogo: {
        databaseId: 42,
        sourceUrl: "https://wordpress.example.test/uploads/logo.png",
        altText: "SIRA Group",
        width: 800,
        height: 300,
      },
    });
    const organization = buildOrganizationStructuredData("group", brand);

    expect(organization.logo).toBe(
      "https://wordpress.example.test/uploads/logo.png",
    );
    expect(organization.url).toBe("https://siratrgroup.com/");
    expect(organization.url).not.toContain("wordpress.example.test");
  });

  it("omits missing or invalid optional properties", () => {
    const brand = withBrand("consulting", {
      tagline: null,
      description: null,
      email: null,
      phone: null,
      socialProfiles: {
        linkedin: "javascript:alert(1)",
        instagram: null,
        x: null,
        youtube: null,
      },
    });
    const organization = buildOrganizationStructuredData(
      "consulting",
      brand,
    );

    expect(organization).not.toHaveProperty("description");
    expect(organization).not.toHaveProperty("logo");
    expect(organization).not.toHaveProperty("email");
    expect(organization).not.toHaveProperty("telephone");
    expect(organization).not.toHaveProperty("sameAs");
  });

  it("escapes script-closing and HTML-significant content safely", () => {
    const dangerous = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "SIRA </script><script>alert('x')</script> & \u2028",
    };
    const serialized = serializeJsonLd(dangerous);
    const markup = renderToStaticMarkup(JsonLdScript({ data: dangerous }));

    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain(">");
    expect(serialized).not.toContain("&");
    expect(serialized).not.toContain("\u2028");
    expect(JSON.parse(serialized)).toEqual(dangerous);
    expect(markup).not.toContain("</script><script>");
    expect(markup.match(/<script/g)).toHaveLength(1);
  });

  it("renders only deterministic Organization and WebSite schema", () => {
    const brand = createFallbackBrand("lifestyle");
    const first = buildSiteStructuredData("lifestyle", brand);
    const second = buildSiteStructuredData("lifestyle", brand);
    const markup = renderToStaticMarkup(
      SiteStructuredDataScripts({ siteKey: "lifestyle", brand }),
    );

    expect(serializeJsonLd(first)).toBe(serializeJsonLd(second));
    expect(markup.match(/application\/ld\+json/g)).toHaveLength(2);
    expect(markup).toContain('"@type":"Organization"');
    expect(markup).toContain('"@type":"WebSite"');
    expect(markup).not.toMatch(
      /NewsArticle|Article|Project|Service|Event|JobPosting|FAQPage|Person|LocalBusiness|SearchAction/,
    );
  });
});
