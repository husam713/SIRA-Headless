import { describe, expect, it } from "vitest";

import {
  countByKind,
  groupByYear,
  publicationYear,
  resolveKindFilter,
  yearSpan,
} from "@/lib/editorial/ledger";
import type { EditorialItem, EditorialKind } from "@/lib/editorial/types";

function item(
  databaseId: number,
  publishedAt: string | null,
  kind: EditorialKind = "news",
): EditorialItem {
  return Object.freeze({
    databaseId,
    typename: "SiraNewsItem",
    contentTypeName: "sira_news",
    kind,
    title: `Item ${databaseId}`,
    excerpt: null,
    href: `/news/item-${databaseId}/`,
    publishedAt,
    modifiedAt: null,
    featuredImage: null,
  });
}

describe("resolveKindFilter", () => {
  it("accepts a known kind", () => {
    expect(resolveKindFilter("insight")).toBe("insight");
    expect(resolveKindFilter("press-release")).toBe("press-release");
  });

  it("falls back to the unfiltered index rather than showing nothing", () => {
    // A stale bookmark or a hand-edited URL should land on the whole archive,
    // not on an empty page that looks like the newsroom has no content.
    expect(resolveKindFilter("bogus")).toBeNull();
    expect(resolveKindFilter(undefined)).toBeNull();
    expect(resolveKindFilter("")).toBeNull();
  });

  it("takes the first value when the parameter is repeated", () => {
    expect(resolveKindFilter(["article", "news"])).toBe("article");
    expect(resolveKindFilter([])).toBeNull();
  });
});

describe("countByKind", () => {
  it("reports every kind in a fixed order, including the empty ones", () => {
    // The index bar must not change shape as the archive fills, so a kind with
    // nothing filed under it is still counted.
    const counts = countByKind([
      item(1, "2026-05-01T00:00:00", "news"),
      item(2, "2026-04-01T00:00:00", "insight"),
      item(3, "2026-03-01T00:00:00", "insight"),
    ]);

    expect(counts.map((entry) => entry.kind)).toEqual([
      "news",
      "insight",
      "article",
      "press-release",
    ]);
    expect(counts.map((entry) => entry.count)).toEqual([1, 2, 0, 0]);
  });
});

describe("publicationYear", () => {
  it("reads the UTC year", () => {
    expect(publicationYear(item(1, "2026-01-01T00:00:00Z"))).toBe("2026");
  });

  it("returns null for an absent or unparseable date", () => {
    expect(publicationYear(item(1, null))).toBeNull();
    expect(publicationYear(item(1, "not a date"))).toBeNull();
  });
});

describe("groupByYear", () => {
  it("orders bands newest first and preserves feed order inside them", () => {
    const bands = groupByYear([
      item(1, "2026-08-01T00:00:00Z"),
      item(2, "2026-02-01T00:00:00Z"),
      item(3, "2024-11-01T00:00:00Z"),
      item(4, "2025-06-01T00:00:00Z"),
    ]);

    expect(bands.map((band) => band.year)).toEqual(["2026", "2025", "2024"]);
    expect(bands[0]!.items.map((entry) => entry.databaseId)).toEqual([1, 2]);
  });

  it("keeps undated items in a trailing band instead of dropping them", () => {
    // An archive that silently discards an item it was handed is worse than
    // one that admits it does not know when the item was published.
    const bands = groupByYear([
      item(1, "2026-08-01T00:00:00Z"),
      item(2, null),
    ]);

    expect(bands.map((band) => band.year)).toEqual(["2026", "Undated"]);
    expect(bands[1]!.items.map((entry) => entry.databaseId)).toEqual([2]);
  });

  it("returns nothing for nothing", () => {
    expect(groupByYear([])).toEqual([]);
  });
});

describe("yearSpan", () => {
  it("collapses a single year rather than printing a range of one", () => {
    expect(yearSpan([item(1, "2026-01-01T00:00:00Z")])).toBe("2026");
  });

  it("spans earliest to latest", () => {
    expect(
      yearSpan([
        item(1, "2026-01-01T00:00:00Z"),
        item(2, "2023-01-01T00:00:00Z"),
        item(3, "2025-01-01T00:00:00Z"),
      ]),
    ).toBe("2023–2026");
  });

  it("is null when nothing carries a date", () => {
    expect(yearSpan([])).toBeNull();
    expect(yearSpan([item(1, null)])).toBeNull();
  });
});
