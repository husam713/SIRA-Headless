import { describe, expect, it } from "vitest";
import { normalizeHomepage } from "@/lib/homepage/normalize-homepage";
import type { SiraHomepageQueryData } from "@/queries/homepage";

// A branch site nobody has authored still returns its ACF group as an object
// with every field null. `isRecord` was therefore true, the hero was kept, and
// every branch page opened with an 850px empty dark band carrying no <h1> at
// all, followed by an overview showing only its fallback eyebrow. Confirmed
// live on healthcare on 2026-09-03.
//
// Presence of the field group is not presence of content.

type HomepagePage = NonNullable<SiraHomepageQueryData["page"]>;

const EMPTY_HERO = {
  headingBefore: null,
  headingHighlight: null,
  headingAfter: null,
  description: null,
  eyebrow: null,
  region: null,
  imageAlt: null,
  image: null,
  mobileImage: null,
  primaryCta: null,
  secondaryCta: null,
};

const EMPTY_OVERVIEW = {
  eyebrow: null,
  heading: null,
  description: null,
  link: null,
  body: null,
};

function branchPage(sections: Readonly<Record<string, unknown>>): SiraHomepageQueryData {
  return {
    page: {
      databaseId: 42,
      uri: "/",
      title: "SIRA Healthcare",
      siraHomepage: { variant: "branch" },
      groupHomepage: null,
      branchHomepage: sections,
    } as unknown as HomepagePage,
  };
}

function groupPage(sections: Readonly<Record<string, unknown>>): SiraHomepageQueryData {
  return {
    page: {
      databaseId: 7,
      uri: "/",
      title: "SIRA Group",
      siraHomepage: { variant: "group" },
      groupHomepage: sections,
      branchHomepage: null,
    } as unknown as HomepagePage,
  };
}

function branchHomepage(sections: Readonly<Record<string, unknown>>) {
  const resolution = normalizeHomepage("healthcare", branchPage(sections));

  expect(resolution.status).toBe("ready");
  if (resolution.status !== "ready") throw new Error("expected a ready homepage");
  if (resolution.homepage.variant !== "branch") throw new Error("expected a branch homepage");

  return resolution.homepage;
}

describe("empty branch section normalization", () => {
  it("drops an object-shaped but completely empty hero", () => {
    expect(branchHomepage({ hero: EMPTY_HERO }).hero).toBeNull();
  });

  it("treats whitespace-only hero values as empty", () => {
    const hero = branchHomepage({
      hero: { ...EMPTY_HERO, headingBefore: "   ", description: "\n\t  ", eyebrow: " " },
    }).hero;

    expect(hero).toBeNull();
  });

  it("keeps a partially authored hero", () => {
    const hero = branchHomepage({
      hero: { ...EMPTY_HERO, headingHighlight: "Diagnostics" },
    }).hero;

    expect(hero).not.toBeNull();
    expect(hero?.headingHighlight).toBe("Diagnostics");
    // Everything else stays null rather than acquiring fallback copy.
    expect(hero?.description).toBeNull();
  });

  it("keeps a hero authored only with an eyebrow or a region", () => {
    expect(branchHomepage({ hero: { ...EMPTY_HERO, eyebrow: "SIRA Healthcare" } }).hero).not.toBeNull();
    expect(branchHomepage({ hero: { ...EMPTY_HERO, region: "Nairobi, Kenya" } }).hero).not.toBeNull();
  });

  it("does not let alt text alone keep an image-less hero", () => {
    // Alt text without an image renders nothing, so it cannot justify the band.
    expect(branchHomepage({ hero: { ...EMPTY_HERO, imageAlt: "Diagnostic centre" } }).hero).toBeNull();
  });

  it("drops a completely empty overview", () => {
    expect(branchHomepage({ overview: EMPTY_OVERVIEW }).overview).toBeNull();
  });

  it("keeps a partially authored overview", () => {
    const overview = branchHomepage({
      overview: { ...EMPTY_OVERVIEW, heading: "Advancing diagnostics" },
    }).overview;

    expect(overview).not.toBeNull();
    expect(overview?.heading).toBe("Advancing diagnostics");
    expect(overview?.body).toBeNull();
  });

  it("keeps an overview authored only with body copy", () => {
    const overview = branchHomepage({
      overview: { ...EMPTY_OVERVIEW, body: "<p>Overview body.</p>" },
    }).overview;

    expect(overview).not.toBeNull();
  });

  it("still resolves the page when both are dropped, keeping the other sections", () => {
    // The tolerant behaviour from PR #58 is preserved: an empty section is
    // omitted, it does not collapse the page.
    const homepage = branchHomepage({
      hero: EMPTY_HERO,
      overview: EMPTY_OVERVIEW,
      contact: {
        eyebrow: "Get in Touch",
        heading: null,
        description: null,
        formVariant: null,
        formContext: null,
      },
    });

    expect(homepage.hero).toBeNull();
    expect(homepage.overview).toBeNull();
    expect(homepage.contact).not.toBeNull();
    expect(homepage.title).toBe("SIRA Healthcare");
  });

  it("leaves Group normalization unchanged", () => {
    // Group is explicitly out of scope: an empty Group hero object is still
    // kept, exactly as before this fix.
    const resolution = normalizeHomepage(
      "group",
      groupPage({
        hero: {
          headingBefore: null,
          headingHighlight: null,
          headingAfter: null,
          description: null,
          primaryCta: null,
          secondaryCta: null,
          slides: null,
        },
      }),
    );

    expect(resolution.status).toBe("ready");
    if (resolution.status !== "ready") return;
    if (resolution.homepage.variant !== "group") return;

    expect(resolution.homepage.hero).not.toBeNull();
  });
});
