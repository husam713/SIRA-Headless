import { describe, expect, it } from "vitest";

import { formatDateline, toEntryView } from "@/lib/editorial/entry-view";
import {
  composeNewsroom,
  countByKind,
  groupByYear,
  publicationYear,
  resolveKindFilter,
  yearSpan,
} from "@/lib/editorial/record";
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
    title: `Entry ${databaseId}`,
    excerpt: null,
    href: `/news/entry-${databaseId}/`,
    publishedAt,
    modifiedAt: null,
    featuredImage: null,
    desks: Object.freeze(["group" as const]),
  });
}

describe("resolveKindFilter", () => {
  it("accepts a known kind", () => {
    expect(resolveKindFilter("insight")).toBe("insight");
    expect(resolveKindFilter("press-release")).toBe("press-release");
  });

  it("falls back to the whole record rather than showing nothing", () => {
    expect(resolveKindFilter("bogus")).toBeNull();
    expect(resolveKindFilter(undefined)).toBeNull();
    expect(resolveKindFilter(["article", "news"])).toBe("article");
  });
});

describe("countByKind", () => {
  it("returns a fixed order including the kinds with none", () => {
    const counts = countByKind([
      item(1, "2026-01-01T00:00:00", "news"),
      item(2, "2026-01-01T00:00:00", "insight"),
      item(3, "2026-01-01T00:00:00", "insight"),
    ]);

    expect(counts.map((entry) => [entry.kind, entry.count])).toEqual([
      ["news", 1],
      ["insight", 2],
      ["article", 0],
      ["press-release", 0],
    ]);
    expect(counts[1]?.share).toBeCloseTo(2 / 3);
  });
});

describe("groupByYear", () => {
  it("orders bands newest first and preserves feed order inside them", () => {
    const bands = groupByYear([
      item(1, "2026-07-01T00:00:00"),
      item(2, "2026-02-01T00:00:00"),
      item(3, "2024-05-01T00:00:00"),
    ]);

    expect(bands.map((band) => band.year)).toEqual(["2026", "2024"]);
    expect(bands[0]?.items.map((entry) => entry.databaseId)).toEqual([1, 2]);
  });

  it("accounts for undated entries instead of dropping them", () => {
    const bands = groupByYear([item(1, "2026-01-01T00:00:00"), item(2, null)]);

    expect(bands.map((band) => band.year)).toEqual(["2026", "Undated"]);
    expect(bands[1]?.items).toHaveLength(1);
  });

  it("bands on the UTC year the dateline prints", () => {
    // An entry published just after midnight UTC on 1 January must not band
    // under one year and print the other.
    const entry = item(1, "2026-01-01T00:30:00Z");

    expect(publicationYear(entry)).toBe("2026");
    expect(toEntryView(entry).dateline).toBe("01 JAN 2026");
  });
});

describe("yearSpan", () => {
  it("collapses a single year and joins a range", () => {
    expect(yearSpan([item(1, "2026-01-01T00:00:00")])).toBe("2026");
    expect(
      yearSpan([item(1, "2026-01-01T00:00:00"), item(2, "2023-01-01T00:00:00")]),
    ).toBe("2023–2026");
  });

  it("returns null when nothing carries a date", () => {
    expect(yearSpan([])).toBeNull();
    expect(yearSpan([item(1, null)])).toBeNull();
  });
});

describe("formatDateline", () => {
  it("sets day-month-year, not the American ordering", () => {
    expect(formatDateline("2026-07-14T09:00:00Z")).toBe("14 JUL 2026");
  });

  it("returns null for an absent or unparseable date", () => {
    expect(formatDateline(null)).toBeNull();
    expect(formatDateline("not a date")).toBeNull();
  });
});

describe("composeNewsroom", () => {
  const many = Array.from({ length: 9 }, (_, index) =>
    item(index + 1, `2026-0${((index % 9) + 1).toString()}-01T00:00:00`),
  );

  /** Lead plus every band, in render order. */
  function rendered(composed: ReturnType<typeof composeNewsroom>) {
    return [
      ...(composed.lead === null ? [] : [composed.lead.databaseId]),
      ...composed.record.flatMap((band) =>
        band.items.map((entry) => entry.databaseId),
      ),
    ];
  }

  it("gives the newest entry the lead and indexes the rest", () => {
    const composed = composeNewsroom(many);

    expect(composed.lead?.databaseId).toBe(1);
    expect(
      composed.record.flatMap((band) =>
        band.items.map((entry) => entry.databaseId),
      ),
    ).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("renders every entry exactly once, at any length", () => {
    // The invariant that matters: composition assigns weight, it never drops
    // stories. A previous iteration reserved a fixed-size row between the lead
    // and the record, and those entries disappeared from the page when the row
    // left the design.
    for (const length of [0, 1, 2, 3, 4, 5, 9]) {
      const input = many.slice(0, length);
      expect(rendered(composeNewsroom(input)), `${length} entries`).toEqual(
        input.map((entry) => entry.databaseId),
      );
    }
  });

  it("composes an empty view without a lead", () => {
    expect(composeNewsroom([])).toEqual({ lead: null, record: [] });
  });

  it("opens a single-entry record on its lead and nothing else", () => {
    const composed = composeNewsroom([item(1, "2026-01-01T00:00:00")]);

    expect(composed.lead?.databaseId).toBe(1);
    expect(composed.record).toEqual([]);
  });
});
