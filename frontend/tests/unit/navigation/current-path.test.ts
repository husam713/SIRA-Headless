import { describe, expect, it } from "vitest";
import { isCurrentPath } from "@/lib/navigation/current-path";

describe("isCurrentPath", () => {
  it("matches the same page regardless of trailing slash", () => {
    expect(isCurrentPath("/services/", "/services")).toBe(true);
    expect(isCurrentPath("/services", "/services/")).toBe(true);
    expect(isCurrentPath("/", "/")).toBe(true);
  });

  it("ignores the locale prefix on the menu item", () => {
    expect(isCurrentPath("/ar/services/", "/services")).toBe(true);
    expect(isCurrentPath("/ar/", "/")).toBe(true);
  });

  it("does not match a different page or a parent", () => {
    expect(isCurrentPath("/services/", "/services/audit")).toBe(false);
    expect(isCurrentPath("/", "/services")).toBe(false);
  });

  it("never marks anchors, queries or external links as current", () => {
    expect(isCurrentPath("/#companies", "/")).toBe(false);
    expect(isCurrentPath("/?tab=1", "/")).toBe(false);
    expect(isCurrentPath("https://siratrgroup.com/", "/")).toBe(false);
    expect(isCurrentPath("//evil.example/", "/")).toBe(false);
  });
});
