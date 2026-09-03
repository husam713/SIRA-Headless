import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";

const HOMEPAGE_DIR = join("src", "components", "homepage");

// Sections converted to the shared eyebrow. The branch homepage renders the
// first five; the last three are Group-only and were converted separately.
//
// group-latest-updates, group-partners, group-services and group-testimonials
// still hand-roll the same eyebrow and are NOT in this list: they are reported
// for a separate decision rather than changed without authorization.
const CONVERTED_SECTION_FILES = [
  "branch-hero.tsx",
  "branch-overview.tsx",
  "group-projects.tsx",
  "group-insights.tsx",
  "group-contact.tsx",
  "group-about.tsx",
  "group-companies.tsx",
  "group-investor.tsx",
] as const;

const EYEBROW_TYPOGRAPHY = "tracking-[0.12em]";

function render(tone?: "accent" | "bright"): string {
  const props =
    tone === undefined
      ? { children: "Overview" }
      : { tone, children: "Overview" };

  return renderToStaticMarkup(createElement(SectionEyebrow, props));
}

describe("SectionEyebrow", () => {
  it("draws the leading rule and hides it from assistive technology", () => {
    const markup = render();

    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("h-px w-8");
    expect(markup).toContain("Overview");
  });

  it("carries the accent tone by default and the bright tone on deep sections", () => {
    expect(render()).toContain("text-brand-accent");
    expect(render("bright")).toContain("text-brand-accent-bright");
  });

  // The rule was previously drawn inline in BranchHero alone, so five other
  // sections repeated the eyebrow typography without it. Keeping the markup in
  // one place is what stops it drifting apart again.
  it("is the only eyebrow implementation used by the converted sections", () => {
    for (const file of CONVERTED_SECTION_FILES) {
      const source = readFileSync(join(HOMEPAGE_DIR, file), "utf8");

      expect(source, `${file} should use the shared eyebrow`).toContain("SectionEyebrow");
      expect(
        source.includes(EYEBROW_TYPOGRAPHY),
        `${file} still hand-rolls the eyebrow typography`,
      ).toBe(false);
    }
  });

});
