import { describe, expect, it } from "vitest";
import { SIRA_BRAND_QUERY } from "@/queries/brand";
import { SIRA_PROJECTS_QUERY } from "@/queries/projects";

describe("approved SIRA GraphQL operation contracts", () => {
  it("uses the curated public brand root field", () => {
    expect(SIRA_BRAND_QUERY.operationName).toBe("SiraBrand");
    expect(SIRA_BRAND_QUERY.source).toContain("siraBrand");
    expect(SIRA_BRAND_QUERY.source).not.toContain("analytics");
  });

  it("queries projects through the Step 1A GraphQL plural name", () => {
    expect(SIRA_PROJECTS_QUERY.operationName).toBe("SiraProjects");
    expect(SIRA_PROJECTS_QUERY.source).toContain("siraProjects");
    expect(SIRA_PROJECTS_QUERY.source).toContain("projectDetails");
    expect(SIRA_PROJECTS_QUERY.source).not.toContain("_sira_");
  });
});
