import { describe, expect, it } from "vitest";
import { planEdgePurge } from "@/lib/revalidation/purge";

describe("planEdgePurge", () => {
  it("derives per-locale URLs on the registry's canonical host, never the payload's", () => {
    const plan = planEdgePurge("digital", ["/", "/insights/x/"], ["slug:sira_insight:x"], "fine");

    expect(plan?.wholeHost).toBe(false);
    expect(plan?.urls).toEqual([
      "https://digital.siratrgroup.com/",
      "https://digital.siratrgroup.com/ar/",
      "https://digital.siratrgroup.com/insights/x/",
      "https://digital.siratrgroup.com/ar/insights/x/",
    ]);
  });

  it("widens to the whole host for layout-wide tags and in coarse mode", () => {
    expect(planEdgePurge("group", ["/"], ["navigation"], "fine")?.urls).toEqual(["https://siratrgroup.com/*"]);
    expect(planEdgePurge("group", ["/insights/x/"], ["slug:sira_insight:x"], "coarse")?.wholeHost).toBe(true);
  });

  it("ignores paths it cannot trust", () => {
    const plan = planEdgePurge("consulting", ["//evil", "/../x", "/ok/", "/bad path/"], ["slug:page:ok"], "fine");
    expect(plan?.urls).toEqual([
      "https://consulting.siratrgroup.com/ok/",
      "https://consulting.siratrgroup.com/ar/ok/",
    ]);
  });
});
