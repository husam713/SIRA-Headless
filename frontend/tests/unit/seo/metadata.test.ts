import { describe, expect, it } from "vitest";
import { createFallbackBrand } from "@/lib/brand";
import { buildSiteRegistry } from "@/config/sites";
import {
  resolveSiteDiscoveryContext,
} from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

describe("tenant-aware metadata", () => {
  it("uses the Group production origin and remains indexable on the Group canonical host", () => {
    const metadata = buildSiteMetadata(
      resolveSiteDiscoveryContext("group", "siratrgroup.com"),
      createFallbackBrand("group"),
    );

    expect(metadata.metadataBase?.toString()).toBe("https://siratrgroup.com/");
    expect(metadata.alternates?.canonical?.toString()).toBe(
      "https://siratrgroup.com/",
    );
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({
      siteName: "SIRA GROUP",
      title: "SIRA GROUP",
    });
  });

  it("keeps each branch metadata base and Open Graph identity isolated", () => {
    const consulting = buildSiteMetadata(
      resolveSiteDiscoveryContext(
        "consulting",
        "consulting.siratrgroup.com",
      ),
      createFallbackBrand("consulting"),
    );
    const healthcare = buildSiteMetadata(
      resolveSiteDiscoveryContext(
        "healthcare",
        "healthcare.siratrgroup.com",
      ),
      createFallbackBrand("healthcare"),
    );

    expect(new URL(consulting.metadataBase?.toString() ?? "").hostname).toBe(
      "consulting.siratrgroup.com",
    );
    expect(new URL(healthcare.metadataBase?.toString() ?? "").hostname).toBe(
      "healthcare.siratrgroup.com",
    );
    expect(consulting.openGraph).toMatchObject({
      siteName: "SIRA Consulting",
    });
    expect(healthcare.openGraph).toMatchObject({
      siteName: "SIRA Healthcare",
    });
  });

  it("points deployment metadata at the production canonical URL while failing closed against indexing", () => {
    const registry = buildSiteRegistry({ group: ["group.localhost"] });
    const metadata = buildSiteMetadata(
      resolveSiteDiscoveryContext("group", "group.localhost", registry),
      createFallbackBrand("group"),
    );

    expect(metadata.metadataBase?.toString()).toBe("https://siratrgroup.com/");
    expect(metadata.alternates?.canonical?.toString()).toBe(
      "https://siratrgroup.com/",
    );
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    });
  });

  it("fails closed if the request hostname belongs to a different tenant", () => {
    const metadata = buildSiteMetadata(
      resolveSiteDiscoveryContext(
        "healthcare",
        "consulting.siratrgroup.com",
      ),
      createFallbackBrand("healthcare"),
    );

    expect(metadata.alternates?.canonical?.toString()).toBe(
      "https://healthcare.siratrgroup.com/",
    );
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
});
