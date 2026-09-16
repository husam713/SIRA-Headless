import { describe, expect, it } from "vitest";
import { mapRevalidationTags, readRevalidationGranularity } from "@/lib/revalidation/tag-map";

const senderTags = [
  "site:2",
  "brand:consulting",
  "post-type:sira_project",
  "post:sira_project:123",
  "archive:sira_project",
  "slug:sira_project:sira-prime",
  "homepage",
];

describe("mapRevalidationTags", () => {
  it("coarse mode always expires the tenant, plus everything the sender named that the app tags", () => {
    const { tags, dropped } = mapRevalidationTags("consulting", 2, senderTags, "coarse");

    expect(tags).toEqual(expect.arrayContaining([
      "site:2",
      "brand:consulting",
      "site:2:post-type:sira_project",
      "site:2:archive:sira_project",
      "site:2:slug:sira_project:sira-prime",
      "site:2:homepage",
    ]));
    // Numeric-id tags have no consumer in this app, and nothing unscoped
    // may reach the shared tag namespace.
    expect(tags).not.toContain("post:sira_project:123");
    expect(tags).not.toContain("homepage");
    expect(dropped).toEqual(["post:sira_project:123"]);
  });

  it("fine mode omits the tenant-wide flush", () => {
    const { tags } = mapRevalidationTags("consulting", 2, ["slug:sira_project:sira-prime"], "fine");

    expect(tags).toEqual(["site:2:slug:sira_project:sira-prime"]);
  });

  it("never lets one tenant's event expire another tenant's tags", () => {
    const { tags, dropped } = mapRevalidationTags("consulting", 2, ["site:3", "brand:healthcare", "homepage"], "fine");

    expect(tags).toEqual(["site:2:homepage"]);
    expect(dropped).toEqual(["site:3", "brand:healthcare"]);
  });

  it("translates the sender's vocabulary where the app names differ", () => {
    const { tags } = mapRevalidationTags("group", 1, ["brand", "layout", "menu:14", "post-type:page", "slug:page:about"], "fine");

    expect(tags).toEqual(expect.arrayContaining([
      "site:1:brand-identity", "site:1:brand", "site:1:layout", "site:1:navigation",
      "site:1:content-page", "site:1:services", "site:1:work", "site:1:industries", "site:1:team",
      "site:1:slug:page:about",
    ]));
  });

  it("drops tags the grammar refuses instead of failing the event", () => {
    const { tags } = mapRevalidationTags("group", 1, ["slug:page:%d8%b9%d9%86", "homepage", "Archive:SIRA_NEWS"], "fine");

    expect(tags).toEqual(expect.arrayContaining(["site:1:homepage", "site:1:archive:sira_news"]));
    expect(tags.some((tag) => tag.includes("%"))).toBe(false);
  });

  it("reads the granularity switch with a coarse default", () => {
    expect(readRevalidationGranularity({})).toBe("coarse");
    expect(readRevalidationGranularity({ SIRA_REVALIDATION_GRANULARITY: "fine" })).toBe("fine");
    expect(readRevalidationGranularity({ SIRA_REVALIDATION_GRANULARITY: "anything" })).toBe("coarse");
  });
});
