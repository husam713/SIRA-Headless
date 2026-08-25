import { describe, expect, it } from "vitest";
import { resolveBusinessUnitAccent } from "@/lib/homepage/business-unit-accent";
import type {
  HomepageBusinessUnit,
  HomepageSelection,
} from "@/lib/homepage/types";

const FALLBACK = Object.freeze({ label: "SIRA GROUP", color: "#cca34b" });
const EMPTY_ITEMS: readonly [] = Object.freeze([]);

function readySelection(
  slug: string,
): HomepageSelection<HomepageBusinessUnit> {
  return Object.freeze({
    status: "ready",
    items: Object.freeze([
      Object.freeze({ databaseId: 1, name: "Sira Real Estate", slug }),
    ]),
    diagnostics: Object.freeze([]),
  });
}

function emptySelection(): HomepageSelection<HomepageBusinessUnit> {
  return Object.freeze({ status: "empty", items: EMPTY_ITEMS, diagnostics: Object.freeze([]) });
}

function invalidSelection(): HomepageSelection<HomepageBusinessUnit> {
  return Object.freeze({
    status: "invalid",
    reason: "relationship-truncated",
    items: EMPTY_ITEMS,
    diagnostics: Object.freeze([]),
  });
}

describe("resolveBusinessUnitAccent", () => {
  it("maps a known editorial business-unit slug to its approved brand accent", () => {
    const accent = resolveBusinessUnitAccent(readySelection("real-estate"), FALLBACK);

    expect(accent.label).toBe("SIRA Real Estate");
    expect(accent.color).toBe("#b0733c");
  });

  it("maps each supported branch slug", () => {
    expect(resolveBusinessUnitAccent(readySelection("consulting"), FALLBACK).color).toBe(
      "#8b5aae",
    );
    expect(resolveBusinessUnitAccent(readySelection("healthcare"), FALLBACK).color).toBe(
      "#2c6dad",
    );
    expect(resolveBusinessUnitAccent(readySelection("lifestyle"), FALLBACK).color).toBe(
      "#2e8c72",
    );
  });

  it("falls back for an empty selection", () => {
    expect(resolveBusinessUnitAccent(emptySelection(), FALLBACK)).toEqual(FALLBACK);
  });

  it("falls back for an invalid selection", () => {
    expect(resolveBusinessUnitAccent(invalidSelection(), FALLBACK)).toEqual(FALLBACK);
  });

  it("falls back for an unrecognized slug rather than throwing", () => {
    expect(resolveBusinessUnitAccent(readySelection("group"), FALLBACK)).toEqual(FALLBACK);
  });
});
