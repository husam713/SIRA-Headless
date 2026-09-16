import { describe, expect, it } from "vitest";
import { RecentEventIds } from "@/lib/revalidation/dedupe";

describe("RecentEventIds", () => {
  it("reports a repeat inside the window and forgets it after", () => {
    const seen = new RecentEventIds(1000, 10);

    expect(seen.remember("a", 0)).toBe(false);
    expect(seen.remember("a", 500)).toBe(true);
    expect(seen.remember("a", 1500)).toBe(false);
  });

  it("evicts the oldest id at capacity", () => {
    const seen = new RecentEventIds(60_000, 2);

    seen.remember("a", 0);
    seen.remember("b", 1);
    seen.remember("c", 2);

    expect(seen.remember("a", 3)).toBe(false);
    expect(seen.remember("c", 4)).toBe(true);
  });
});
