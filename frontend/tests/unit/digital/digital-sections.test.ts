import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  DigitalCapabilities,
  DigitalHero,
  DigitalMarquee,
  DigitalWordmark,
} from "@/components/digital";
import type {
  DigitalCapability,
  DigitalHomepageHero,
  DigitalMarqueeSection,
  DigitalWordmarkSection,
} from "@/lib/homepage/types";

// ADR-033. Digital is the one company with a substantially more
// technology-forward surface, and the risk that comes with that is a page whose
// content depends on its effects. These assertions hold the line ADR-028 draws
// around Layer C: the motion may enhance, and it may never be load-bearing.

const styles = readFileSync(join("src", "styles", "globals.css"), "utf8");

const hero: DigitalHomepageHero = {
  eyebrow: "SIRA Digital",
  headingBefore: "Systems that",
  headingHighlight: "run the work",
  headingAfter: null,
  description: "One line of positioning.",
  primaryCta: { label: "Start a review", href: "/contact", target: null },
  secondaryCta: { label: "See our work", href: "/products", target: null },
};

const capabilities: readonly DigitalCapability[] = [
  { title: "Workflow automation", summary: "A summary.", link: { label: "More", href: "/services", target: null } },
  { title: "Document intelligence", summary: "A summary.", link: null },
  { title: "Integration", summary: "A summary.", link: null },
];

const marquee: DigitalMarqueeSection = {
  eyebrow: "Reach",
  heading: "Across the Kingdom",
  description: null,
  link: null,
  body: null,
  items: ["Energy", "Logistics", "Healthcare"],
};

const wordmark: DigitalWordmarkSection = {
  word: "SIRA DIGITAL",
  lockup: "Systems that run the work.",
  link: { label: "See what we build", href: "/services", target: null },
};

describe("the Digital sections", () => {
  it("renders the hero content without depending on any effect", () => {
    const markup = renderToStaticMarkup(createElement(DigitalHero, { hero }));

    expect(markup).toContain("Systems that");
    expect(markup).toContain("run the work");
    expect(markup).toContain("One line of positioning.");
    expect(markup).toContain("digital-hero-heading");
    // The reveal is an animation that plays over visible content, so the markup
    // must never carry an inline hidden state waiting to be released.
    expect(markup).not.toContain("opacity:0");
    expect(markup).not.toContain("visibility:hidden");
  });

  it("numbers the capability rail with two digits", () => {
    const markup = renderToStaticMarkup(
      createElement(DigitalCapabilities, { eyebrow: "Capabilities", capabilities }),
    );

    expect(markup).toContain("01");
    expect(markup).toContain("03");
    expect(markup).toContain("Workflow automation");
    // A ragged column is what "1." beside "10." produces.
    expect(markup).not.toMatch(/>1</u);
  });

  it("hides the decorative index and arrow from assistive technology", () => {
    const markup = renderToStaticMarkup(
      createElement(DigitalCapabilities, { eyebrow: "Capabilities", capabilities }),
    );

    // The index is presentational; the heading is the item's name.
    expect(markup).toMatch(/aria-hidden="true"[^>]*>\s*01/u);
    expect(markup).toContain("digital-rail__arrow");
  });

  it("renders nothing at all when the rail is empty", () => {
    expect(
      renderToStaticMarkup(
        createElement(DigitalCapabilities, { eyebrow: "Capabilities", capabilities: [] }),
      ),
    ).toBe("");
  });

  it("says the marquee content once to assistive technology", () => {
    const markup = renderToStaticMarkup(createElement(DigitalMarquee, { section: marquee }));

    // The strip is duplicated to make the loop seamless. The copy is the same
    // words a second time, so it is marked and hidden rather than announced.
    expect(markup.match(/Energy/gu)).toHaveLength(2);
    expect(markup.match(/data-duplicate="true"/gu)).toHaveLength(3);
    expect(markup).toMatch(/data-duplicate="true" aria-hidden="true"/u);
  });

  it("renders the wordmark as a real heading rather than a decorative span", () => {
    const markup = renderToStaticMarkup(createElement(DigitalWordmark, { section: wordmark }));

    // Rendering it decoratively and adding a visually-hidden heading would say
    // the same words twice.
    expect(markup).toMatch(/<h2[^>]*id="digital-wordmark-heading"/u);
    expect(markup).toContain("SIRA DIGITAL");
    expect(markup.match(/SIRA DIGITAL/gu)).toHaveLength(1);
  });

  it("drops the wordmark band entirely without a word", () => {
    expect(
      renderToStaticMarkup(
        createElement(DigitalWordmark, {
          section: { word: null, lockup: "Orphan caption.", link: null },
        }),
      ),
    ).toBe("");
  });
});

describe("the Digital motion layer", () => {
  it("gates every scroll-driven effect behind support AND reduced motion", () => {
    // Both gates matter. @supports keeps the effect off browsers that would
    // otherwise leave content mid-animation; the media query keeps it off
    // readers who asked for stillness.
    const supportsBlocks = styles.match(
      /@supports \(animation-timeline: view\(\)\) \{\s*@media \(prefers-reduced-motion: no-preference\)/gu,
    );

    expect(supportsBlocks).not.toBeNull();
    expect(supportsBlocks?.length).toBeGreaterThanOrEqual(2);
  });

  it("gives reduced motion a shorter page, not a faster one", () => {
    // The whole 220svh runway goes away and the sticky stage becomes an
    // ordinary block. Collapsing only the durations would leave two screens of
    // empty scrolling behind a static word.
    expect(styles).toMatch(/\.digital-kinetic \{\s*block-size: auto;/u);
    expect(styles).toMatch(/\.digital-kinetic__stage \{\s*position: static;/u);
    expect(styles).toMatch(/\.digital-marquee__item\[data-duplicate="true"\] \{\s*display: none;/u);
  });

  it("flips the marquee and the arrow nudge for Arabic", () => {
    // translateX is physical. A single -50% keyframe animates RTL into blank
    // space, and an arrow nudged "forward" moves left in Arabic.
    expect(styles).toContain("@keyframes digital-marquee-rtl");
    expect(styles).toMatch(
      /\[dir="rtl"\] \.digital-marquee__track \{\s*animation-name: digital-marquee-rtl;/u,
    );
    expect(styles).toContain('[dir="rtl"] .digital-rail__item:focus-within .digital-rail__arrow');
  });

  it("relaxes the Latin display metrics for Arabic", () => {
    // Sub-1.0 leading clips Arabic ascenders and descenders, and negative
    // tracking damages the joins.
    expect(styles).toMatch(/html:lang\(ar\) \.digital-display \{[^}]*line-height: 1\.28;/u);
    expect(styles).toMatch(/html:lang\(ar\) \.digital-display \{[^}]*letter-spacing: 0;/u);
    expect(styles).toMatch(/html:lang\(ar\) \.digital-kinetic__word \{[^}]*letter-spacing: 0;/u);
  });

  it("pauses ambient motion for a reader who shows intent", () => {
    expect(styles).toMatch(
      /\.digital-marquee:hover \.digital-marquee__track,\s*\.digital-marquee:focus-within \.digital-marquee__track \{\s*animation-play-state: paused;/u,
    );
  });

  it("keeps hover-only affordances behind a hover query", () => {
    // A touch device that matches :hover strands the element in its hover
    // state, so the lift and the nudge are gated.
    const hoverBlock = styles.slice(styles.indexOf(".digital-rail__title,"));

    expect(hoverBlock).toMatch(
      /@media \(hover: hover\) \{[\s\S]*\.digital-rail__item:hover \.digital-rail__title \{\s*transform: translateY\(-2px\);/u,
    );
  });
});

describe("the shell adapts to a company that is neither Group nor a branch", () => {
  const layout = readFileSync(
    join("src", "app", "(sites)", "[siteKey]", "layout.tsx"),
    "utf8",
  );
  const footer = readFileSync(join("src", "components", "shell", "site-footer.tsx"), "utf8");

  it("chooses the footer shape from the composition, not from the Group cross-link", () => {
    // The regression this guards is silent and was found in a browser, not by a
    // test: the footer inferred "is a branch site" from "has a link back to
    // Group". SIRA Digital is a GROUP company with its own navigation, so it
    // had the cross-link, took the compact branch footer, and rendered with no
    // menu in it at all.
    expect(footer).not.toContain("const isBranch = groupLink !== null");
    expect(footer).toContain('const isBranch = layout === "compact"');
    expect(layout).toMatch(/footerLayout[\s\S]{0,160}variant === "branch"/u);
    expect(layout).toContain("layout={footerLayout}");
  });
});

describe("the Digital components stay Server Components", () => {
  // The architecture lock keeps Client Components to required interaction. A
  // decorative reveal is not required interaction, and the whole reason the
  // motion is CSS is so this stays true.
  it.each([
    "digital-hero.tsx",
    "digital-capabilities.tsx",
    "digital-marquee.tsx",
    "digital-wordmark.tsx",
  ])("%s carries no use client directive", (file) => {
    const source = readFileSync(join("src", "components", "digital", file), "utf8");

    expect(source).not.toContain("use client");
    expect(source).not.toContain("useEffect");
    expect(source).not.toContain("IntersectionObserver");
  });
});
