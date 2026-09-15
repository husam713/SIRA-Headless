import { describe, expect, it } from "vitest";

import { EDITORIAL_SECTIONS, editorialArticleHref } from "@/lib/editorial/routes";

// Every editorial section on the site asks this whether it may link an item.
// A false positive sends a reader to a 404; a false negative silently drops a
// link that should work. Both are worth a test.

describe("editorialArticleHref", () => {
  it("accepts a permalink under each served base", () => {
    for (const section of EDITORIAL_SECTIONS) {
      const href = `/${section}/some-story/`;

      expect(editorialArticleHref(href), section).toBe(href);
    }
  });

  it("accepts a permalink with no trailing slash", () => {
    expect(editorialArticleHref("/news/some-story")).toBe("/news/some-story");
  });

  it("refuses a base this app does not serve", () => {
    // Projects, companies and services are real content types with real uris
    // and no detail route. Linking them is exactly the mistake this guards.
    for (const href of ["/projects/sira-prime/", "/companies/sira-prime/", "/services/advisory/"]) {
      expect(editorialArticleHref(href), href).toBeNull();
    }
  });

  it("refuses an archive root, which is not an item", () => {
    expect(editorialArticleHref("/news/")).toBeNull();
    expect(editorialArticleHref("/news")).toBeNull();
  });

  it("refuses a path deeper than one slug", () => {
    expect(editorialArticleHref("/news/2026/some-story/")).toBeNull();
  });

  it("refuses anything that is not a site-relative path", () => {
    for (const href of [
      "https://evil.example/news/x/",
      "//evil.example/news/x/",
      "news/x/",
      "",
    ]) {
      expect(editorialArticleHref(href), href).toBeNull();
    }
  });
});
