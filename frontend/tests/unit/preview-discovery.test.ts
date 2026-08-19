import { describe, expect, it } from "vitest";
import { buildSitemap } from "@/lib/seo/discovery";

describe("preview discovery isolation", () => {
  it("does not emit Preview Entry or Exit routes in the canonical sitemap", () => {
    const urls = buildSitemap("siratrgroup.com").map((entry) => entry.url);

    expect(urls).toEqual(["https://siratrgroup.com/"]);
    expect(urls.some((url) => url.includes("/api/preview"))).toBe(false);
  });
});
