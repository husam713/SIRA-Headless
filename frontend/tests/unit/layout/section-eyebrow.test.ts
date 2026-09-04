import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";

const HOMEPAGE_DIR = join("src", "components", "homepage");

// Every scoped homepage section now uses the shared eyebrow. The list is
// exhaustive on purpose: the guard below also asserts that no homepage
// component hand-rolls the eyebrow typography any more, so a new section
// cannot quietly reintroduce one.
const CONVERTED_SECTION_FILES = [
  "branch-hero.tsx",
  "branch-overview.tsx",
  "group-projects.tsx",
  "group-insights.tsx",
  "group-contact.tsx",
  "group-about.tsx",
  "group-companies.tsx",
  "group-investor.tsx",
  "group-latest-updates.tsx",
  "group-partners.tsx",
  "group-services.tsx",
  "group-testimonials.tsx",
] as const;

// The exact eyebrow signature. Matching on tracking alone is too broad: the
// carousel slide label (10px span with a per-slide accent) and the ticker
// entry (text-xs, semibold) share the tracking without being eyebrows.
const EYEBROW_TYPOGRAPHY = "text-[11px] font-bold uppercase tracking-[0.12em]";

function render(tone?: "accent" | "bright" | "faint" | "inherit"): string {
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

  it("carries the accent tone by default and the other tones on request", () => {
    expect(render()).toContain("text-brand-accent");
    expect(render("bright")).toContain("text-brand-accent-bright");
    // Sections that have always been quiet must not be repainted by the
    // migration to the shared component.
    expect(render("faint")).toContain("text-brand-ink-faint");
    // "inherit" sets no colour at all, for sections that never carried one.
    const inherited = render("inherit");
    expect(inherited).not.toContain("text-brand-ink-faint");
    expect(inherited).not.toContain("text-brand-accent");
  });

  it("does not repaint the Latest Updates heading", () => {
    // It never carried a colour class: it inherited --brand-ink. Giving it the
    // faint tone was a contrast regression on a heading that is also the
    // section's accessible name, so it must stay uncoloured.
    const source = readFileSync(join(HOMEPAGE_DIR, "group-latest-updates.tsx"), "utf8");

    expect(source).toContain('tone="inherit"');
    // Scoped to the eyebrow: the file legitimately uses ink-faint elsewhere,
    // on the card meta line.
    expect(source).not.toContain('tone="faint"');
    expect(source).not.toContain('tone="accent"');
  });

  it("can render as a heading that keeps its id", () => {
    // group-latest-updates uses its eyebrow as the section accessible name via
    // aria-labelledby, so it must stay an <h2> and keep the id.
    // Props go through a variable: passing children inline trips
    // react/no-children-prop, while omitting it fails the required prop.
    const props = {
      as: "h2",
      id: "latest-updates-heading",
      children: "Latest Updates",
    } as const;
    const markup = renderToStaticMarkup(createElement(SectionEyebrow, props));

    expect(markup).toContain("<h2");
    expect(markup).toContain('id="latest-updates-heading"');
    expect(markup).toContain('aria-hidden="true"');
  });

  it("keeps the aria-labelledby target intact in group-latest-updates", () => {
    const source = readFileSync(join(HOMEPAGE_DIR, "group-latest-updates.tsx"), "utf8");

    expect(source).toContain('labelledBy="latest-updates-heading"');
    expect(source).toContain('id="latest-updates-heading"');
    expect(source).toContain('as="h2"');
  });

  it("leaves no hand-rolled eyebrow anywhere in the homepage sections", () => {
    // withFileTypes and the .tsx filter keep this from throwing EISDIR the day
    // someone adds a subdirectory or a non-source asset under homepage/.
    const remaining = readdirSync(HOMEPAGE_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
      .map((entry) => entry.name)
      .filter((name) =>
        readFileSync(join(HOMEPAGE_DIR, name), "utf8").includes(EYEBROW_TYPOGRAPHY),
      );

    expect(remaining).toEqual([]);
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
