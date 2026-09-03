import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";

const HOMEPAGE_DIR = join("src", "components", "homepage");

// Sections rendered by the branch homepage. Group-only sections are outside
// this increment's scope and are reported rather than changed.
const BRANCH_SECTION_FILES = [
  "branch-hero.tsx",
  "branch-overview.tsx",
  "group-projects.tsx",
  "group-insights.tsx",
  "group-contact.tsx",
] as const;

const EYEBROW_TYPOGRAPHY = "tracking-[0.12em]";

function render(tone?: "accent" | "bright"): string {
  return renderToStaticMarkup(
    createElement(SectionEyebrow, tone === undefined ? null : { tone }, "Overview"),
  );
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
  it("is the only eyebrow implementation used by the branch sections", () => {
    for (const file of BRANCH_SECTION_FILES) {
      const source = readFileSync(join(HOMEPAGE_DIR, file), "utf8");

      expect(source, `${file} should use the shared eyebrow`).toContain("SectionEyebrow");
      expect(
        source.includes(EYEBROW_TYPOGRAPHY),
        `${file} still hand-rolls the eyebrow typography`,
      ).toBe(false);
    }
  });

});
