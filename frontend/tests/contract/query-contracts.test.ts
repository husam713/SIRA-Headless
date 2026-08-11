import { readFileSync } from "node:fs";
import { buildSchema, parse, validate } from "graphql";
import { describe, expect, it } from "vitest";
import {
  SiraBrandDocument,
  SiraHomepageDocument,
  SiraNavigationDocument,
} from "@/generated/graphql/graphql";
import { SIRA_BRAND_QUERY } from "@/queries/brand";
import { SIRA_HOMEPAGE_QUERY } from "@/queries/homepage";
import { SIRA_NAVIGATION_QUERY } from "@/queries/navigation";
import { SIRA_PROJECTS_QUERY } from "@/queries/projects";

const canonicalSchema = buildSchema(
  readFileSync(
    new URL("../../schema/wpgraphql.graphql", import.meta.url),
    "utf8",
  ),
);

describe("approved SIRA GraphQL operation contracts", () => {
  it("derives the curated public brand operation from Codegen output", () => {
    expect(SIRA_BRAND_QUERY.operationName).toBe("SiraBrand");
    expect(SIRA_BRAND_QUERY.source).toBe(SiraBrandDocument.toString().trim());
    expect(SIRA_BRAND_QUERY.source).toContain("siraBrand");
  });

  it("keeps legacy banners and queries both typed public banner contracts", () => {
    expect(SIRA_BRAND_QUERY.source).toContain("announcementBanner");
    expect(SIRA_BRAND_QUERY.source).toContain("emergencyBanner");

    for (const field of ["announcement", "emergency"]) {
      expect(SIRA_BRAND_QUERY.source).toMatch(
        new RegExp(
          `${field}\\s*\\{[\\s\\S]*?message[\\s\\S]*?severity[\\s\\S]*?link\\s*\\{[\\s\\S]*?label[\\s\\S]*?url[\\s\\S]*?target[\\s\\S]*?\\}[\\s\\S]*?startsAt[\\s\\S]*?endsAt[\\s\\S]*?dismissible[\\s\\S]*?revisionKey[\\s\\S]*?\\}`,
        ),
      );
    }

    expect(SIRA_BRAND_QUERY.source).not.toContain("analyticsId");
    expect(SIRA_BRAND_QUERY.source).not.toContain("rawOptions");
    expect(SIRA_BRAND_QUERY.source).not.toContain("_sira_");
  });

  it("derives the homepage operation from canonical Codegen output", () => {
    expect(SIRA_HOMEPAGE_QUERY.operationName).toBe("SiraHomepage");
    expect(SIRA_HOMEPAGE_QUERY.source).toBe(
      SiraHomepageDocument.toString().trim(),
    );
    expect(
      validate(canonicalSchema, parse(SIRA_HOMEPAGE_QUERY.source)),
    ).toEqual([]);
  });

  it("uses only the approved root URI and canonical homepage variants", () => {
    expect(SIRA_HOMEPAGE_QUERY.source).toContain(
      'page(id: "/", idType: URI, asPreview: $asPreview)',
    );
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("siraHomepage");
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("groupHomepage");
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("branchHomepage");
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("pages(");
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("first:");
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("/home");
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("analyticsId");
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("rawOptions");
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("_sira_");
  });

  it("derives the native navigation operation from canonical Codegen output", () => {
    expect(SIRA_NAVIGATION_QUERY.operationName).toBe("SiraNavigation");
    expect(SIRA_NAVIGATION_QUERY.source).toBe(
      SiraNavigationDocument.toString().trim(),
    );
    expect(
      validate(canonicalSchema, parse(SIRA_NAVIGATION_QUERY.source)),
    ).toEqual([]);
  });

  it("uses only evidence-backed native menu locations without a fallback menu", () => {
    for (const [scope, location] of [
      ["primary", "PRIMARY"],
      ["footer", "FOOTER"],
      ["legal", "LEGAL"],
    ] as const) {
      expect(SIRA_NAVIGATION_QUERY.source).toMatch(
        new RegExp(
          `${scope}: menus\\(first: 2, where: \\{location: ${location}\\}\\)`,
        ),
      );
    }

    expect(SIRA_NAVIGATION_QUERY.source).toContain("menuItems(first: 200)");
    expect(SIRA_NAVIGATION_QUERY.source).not.toContain("siraNavigation");
    expect(SIRA_NAVIGATION_QUERY.source).not.toMatch(/\bmenu\s*\(/u);
    expect(SIRA_NAVIGATION_QUERY.source).not.toMatch(/\b(name|slug)\b/u);
  });

  it("queries projects through the Step 1A GraphQL plural name", () => {
    expect(SIRA_PROJECTS_QUERY.operationName).toBe("SiraProjects");
    expect(SIRA_PROJECTS_QUERY.source).toContain("siraProjects");
    expect(SIRA_PROJECTS_QUERY.source).toContain("projectDetails");
    expect(SIRA_PROJECTS_QUERY.source).not.toContain("_sira_");
  });
});
