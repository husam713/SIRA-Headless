import { describe, expect, it } from "vitest";
import { SiraBrandDocument } from "@/generated/graphql/graphql";
import { SIRA_BRAND_QUERY } from "@/queries/brand";
import { SIRA_PROJECTS_QUERY } from "@/queries/projects";

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

  it("queries projects through the Step 1A GraphQL plural name", () => {
    expect(SIRA_PROJECTS_QUERY.operationName).toBe("SiraProjects");
    expect(SIRA_PROJECTS_QUERY.source).toContain("siraProjects");
    expect(SIRA_PROJECTS_QUERY.source).toContain("projectDetails");
    expect(SIRA_PROJECTS_QUERY.source).not.toContain("_sira_");
  });
});
