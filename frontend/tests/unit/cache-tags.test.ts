import { describe, expect, it } from "vitest";
import {
  CacheTagError,
  normalizeCacheTags,
  siteCacheTags,
} from "@/lib/cache/tags";

describe("GraphQL cache tags", () => {
  it("normalizes and deduplicates tags", () => {
    expect(
      normalizeCacheTags([
        " Site:2 ",
        "site:2",
        "POST-TYPE:sira_project",
      ]),
    ).toEqual(["site:2", "post-type:sira_project"]);
  });

  it("creates site-isolated base tags", () => {
    expect(siteCacheTags(2, "consulting")).toEqual([
      "site:2",
      "brand:consulting",
    ]);
  });

  it.each(["", "contains spaces", "../path", "tag/with/slash"])(
    "rejects unsafe tag %s",
    (tag) => {
      expect(() => normalizeCacheTags([tag])).toThrow(CacheTagError);
    },
  );

  it("rejects more than 128 tags", () => {
    const tags = Array.from({ length: 129 }, (_, index) => `tag:${index}`);

    expect(() => normalizeCacheTags(tags)).toThrow(CacheTagError);
  });
});
