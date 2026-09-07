import { describe, expect, it } from "vitest";

import {
  deskRegister,
  EDITORIAL_DESK_ORDER,
  editorialDeskAccent,
  editorialDeskLabel,
  editorialDeskSiteKey,
  isEditorialDeskKey,
  primaryDesk,
  resolveDeskFilter,
  siteEditorialDesk,
} from "@/lib/editorial/desks";
import { BRAND_PRESETS } from "@/lib/brand/fallbacks";
import type { EditorialDeskKey, EditorialItem } from "@/lib/editorial/types";

function item(
  databaseId: number,
  desks: readonly EditorialDeskKey[],
): EditorialItem {
  return Object.freeze({
    databaseId,
    typename: "SiraNewsItem",
    contentTypeName: "sira_news",
    kind: "news",
    title: `Entry ${databaseId}`,
    excerpt: null,
    href: `/news/entry-${databaseId}/`,
    publishedAt: "2026-01-01T00:00:00",
    modifiedAt: null,
    featuredImage: null,
    desks: Object.freeze([...desks]),
  });
}

describe("the desk registry", () => {
  it("lists Group first and every operating company after it", () => {
    expect(EDITORIAL_DESK_ORDER).toEqual([
      "group",
      "healthcare",
      "real-estate",
      "lifestyle",
      "consulting",
      "digital",
    ]);
  });

  it("keeps the ADR-014 slug that is not derivable from the site key", () => {
    // `real-estate` is the CMS term; `realestate` is the site key. Deriving one
    // from the other mechanically is exactly what ADR-014 forbids.
    expect(editorialDeskSiteKey("real-estate")).toBe("realestate");
    expect(siteEditorialDesk("realestate")).toBe("real-estate");
    expect(isEditorialDeskKey("realestate")).toBe(false);
    expect(isEditorialDeskKey("real-estate")).toBe(true);
  });

  it("borrows each company's approved accent rather than inventing one", () => {
    // The newsroom must not drift away from the sites it links to, so every
    // accent has to come out of the brand presets and nowhere else.
    expect(editorialDeskAccent("group")).toBe(
      BRAND_PRESETS.group.identity.accent,
    );
    expect(editorialDeskAccent("real-estate")).toBe(
      BRAND_PRESETS.realestate.identity.accent,
    );
    expect(editorialDeskAccent("healthcare")).toBe(
      BRAND_PRESETS.healthcare.identity.accent,
    );
    expect(editorialDeskAccent("lifestyle")).toBe(
      BRAND_PRESETS.lifestyle.identity.accent,
    );
    expect(editorialDeskAccent("consulting")).toBe(
      BRAND_PRESETS.consulting.identity.accent,
    );
  });

  it("labels desks short enough to set in a register margin", () => {
    for (const desk of EDITORIAL_DESK_ORDER) {
      const label = editorialDeskLabel(desk);
      expect(label.length).toBeLessThanOrEqual(11);
      expect(label).not.toContain("SIRA");
    }
  });
});

describe("primaryDesk", () => {
  it("prefers the earliest desk in canonical order, not feed order", () => {
    expect(primaryDesk(item(1, ["consulting", "healthcare"]))).toBe(
      "healthcare",
    );
    expect(primaryDesk(item(2, ["lifestyle", "group"]))).toBe("group");
  });

  it("falls back to Group rather than throwing on an empty list", () => {
    // The normalizer guarantees a non-empty list; this is the belt-and-braces
    // path so a future caller cannot produce an unlabelled entry.
    expect(primaryDesk(item(3, []))).toBe("group");
  });
});

describe("deskRegister", () => {
  it("counts an entry under every desk it is filed to", () => {
    const register = deskRegister([
      item(1, ["healthcare"]),
      item(2, ["healthcare", "group"]),
      item(3, ["group"]),
      item(4, ["real-estate"]),
    ]);

    expect(
      Object.fromEntries(register.map((row) => [row.desk, row.count])),
    ).toEqual({
      group: 2,
      healthcare: 2,
      "real-estate": 1,
      lifestyle: 0,
      consulting: 0,
      digital: 0,
    });
  });

  it("lists every desk even at zero, so the index keeps its shape", () => {
    // The group has the companies it has whether or not each published this
    // month. An index that grew as the archive filled would teach a reader
    // nothing about the structure of the house.
    expect(deskRegister([]).map((row) => row.desk)).toEqual(
      EDITORIAL_DESK_ORDER,
    );
    expect(deskRegister([]).every((row) => row.share === 0)).toBe(true);
  });

  it("reports shares of the loaded record", () => {
    const register = deskRegister([
      item(1, ["healthcare"]),
      item(2, ["healthcare"]),
      item(3, ["group"]),
      item(4, ["group"]),
    ]);

    expect(register.find((row) => row.desk === "healthcare")?.share).toBe(0.5);
    expect(register.find((row) => row.desk === "lifestyle")?.share).toBe(0);
  });
});

describe("resolveDeskFilter", () => {
  it("accepts a known desk", () => {
    expect(resolveDeskFilter("healthcare")).toBe("healthcare");
    expect(resolveDeskFilter("real-estate")).toBe("real-estate");
    expect(resolveDeskFilter("group")).toBe("group");
  });

  it("falls back to the whole record rather than an empty page", () => {
    // A stale bookmark or a hand-edited URL should land on the whole record,
    // not on a page that looks like the newsroom has nothing in it.
    expect(resolveDeskFilter("aviation")).toBeNull();
    expect(resolveDeskFilter("realestate")).toBeNull();
    expect(resolveDeskFilter(undefined)).toBeNull();
    expect(resolveDeskFilter([])).toBeNull();
  });

  it("takes the first value when the parameter is repeated", () => {
    expect(resolveDeskFilter(["lifestyle", "healthcare"])).toBe("lifestyle");
    expect(resolveDeskFilter(["nonsense", "healthcare"])).toBeNull();
  });
});
