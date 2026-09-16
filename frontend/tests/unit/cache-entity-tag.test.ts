import { describe, expect, it } from "vitest";
import { entityCacheTag } from "@/lib/cache/tags";
import { contentPageCacheTags } from "@/lib/content/get-content-page";
import { editorialSingleCacheTags } from "@/lib/editorial/get-editorial-single";
import { projectSingleCacheTags } from "@/lib/projects/get-project-single";

describe("entity cache tags", () => {
  it("spells the WordPress sender's slug tag for a safe slug and nothing for an unsafe one", () => {
    expect(entityCacheTag("sira_project", "Sira-Prime")).toBe("slug:sira_project:sira-prime");
    expect(entityCacheTag("page", "%d8%b9%d9%86")).toBeNull();
    expect(entityCacheTag("page", "")).toBeNull();
    expect(entityCacheTag("page", undefined)).toBeNull();
  });

  it("tags each single-entity fetch with the type-wide tags plus its own slug", () => {
    expect(projectSingleCacheTags("/projects/sira-prime/")).toEqual([
      "post-type:sira_project",
      "slug:sira_project:sira-prime",
    ]);
    expect(editorialSingleCacheTags("/insights/istanbul-bridge/")).toContain("slug:sira_insight:istanbul-bridge");
    expect(editorialSingleCacheTags("/unknown/x/")).not.toContainEqual(expect.stringMatching(/^slug:/u));
    expect(contentPageCacheTags("/services/")).toEqual(["content-page", "post-type:page", "slug:page:services"]);
    expect(contentPageCacheTags("/ar/services/")).toEqual(["content-page", "post-type:page", "slug:page:services"]);
  });
});
