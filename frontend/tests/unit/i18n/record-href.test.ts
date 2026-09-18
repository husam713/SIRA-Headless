import { describe, expect, it } from "vitest";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import {
  publicRecordHref,
  recordHrefLocale,
  recordUrisForLocale,
} from "@/lib/i18n/record-href";

// ADR-034: a translation is its own record in the same post type, so its
// WordPress slug carries the locale (`ar-sira-prime`) and its public page does
// not (`/ar/projects/sira-prime/`). These are the two directions of that rule.

describe("publicRecordHref", () => {
  it("moves the locale from the slug to the path prefix", () => {
    expect(publicRecordHref("/projects/ar-sira-prime/")).toBe("/ar/projects/sira-prime/");
    expect(publicRecordHref("/services/ar-market-entry/")).toBe("/ar/services/market-entry/");
  });

  it("leaves a default-locale record and an unrelated slug alone", () => {
    expect(publicRecordHref("/projects/sira-prime/")).toBe("/projects/sira-prime/");
    expect(publicRecordHref("/projects/area-51/")).toBe("/projects/area-51/");
    expect(publicRecordHref("/projects/xx-prime/")).toBe("/projects/xx-prime/");
    expect(publicRecordHref("/")).toBe("/");
  });

  it("does not prefix the default locale, which has no prefix route", () => {
    expect(publicRecordHref("/projects/en-prime/")).toBe("/projects/en-prime/");
  });

  it("leaves an English record alone even when its slug begins with a locale code", () => {
    // A field says the language where one exists; the slug rule is only the
    // fallback for records written before the field.
    expect(publicRecordHref("/projects/ar-rayyan-tower/", "en")).toBe("/projects/ar-rayyan-tower/");
    expect(publicRecordHref("/projects/ar-rayyan-tower/", "ar")).toBe("/ar/projects/rayyan-tower/");
    expect(publicRecordHref("/projects/ar-rayyan-tower/", null)).toBe("/ar/projects/rayyan-tower/");
  });

  it("does not touch a page URI, whose locale is already a parent segment", () => {
    expect(publicRecordHref("/ar/our-services/")).toBe("/ar/our-services/");
  });
});

describe("recordHrefLocale", () => {
  it("reads the locale off the slug prefix, or reports none", () => {
    expect(recordHrefLocale("/projects/ar-sira-prime/")).toBe("ar");
    expect(recordHrefLocale("/projects/sira-prime/")).toBeNull();
    expect(recordHrefLocale("/projects/area-51/")).toBeNull();
  });
});

describe("recordUrisForLocale", () => {
  const group = getSiteDefinition("group");
  if (group === null) throw new Error("group is registered");

  it("tries the translation first, then the default-locale record", () => {
    expect(recordUrisForLocale(group, "ar", "/projects/sira-prime/")).toEqual([
      "/projects/ar-sira-prime/",
      "/projects/sira-prime/",
    ]);
  });

  it("looks up the default locale directly", () => {
    expect(recordUrisForLocale(group, "en", "/projects/sira-prime/")).toEqual([
      "/projects/sira-prime/",
    ]);
  });
});
