import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The harness composer must stay a mirror of the real page, not a copy that
// drifts. Comparing import lists is not enough: an import can go unused, a
// section can be dropped from one branch only, or the running order can change
// without any import changing. So this compares the ORDERED component sequence
// of each ready-page branch against the matching composer function.
//
// A missing render, an extra render, an unused import, a duplicate, or a
// reordered section therefore fails here.
//
// REVIEW-FIX-2 closed two holes found by adversarial mutation:
//
//   1. Comment poisoning. The scan matched component-like tags inside
//      comments, so replacing a real <GroupPartners /> with
//      {/* <GroupPartners /> */} still counted as rendered. Every source is
//      now comment-stripped before extraction, and stripComments is itself
//      tested below against exactly that shape.
//   2. File-scoped hero assertion. One `hero !== null` anywhere in the file
//      satisfied the old check, so either variant could be made unconditional
//      undetected. The null guard is now asserted inside each of the four
//      regions independently.
//
// PageContainer is deliberately excluded from these sequences. It is a layout
// primitive used by the Step 3 fallback branch — the one that renders when no
// homepage resolves — and by components internally. It is not a homepage
// section, so it must not be treated as a missing production section. The
// fallback assertion below pins that distinction so the exclusion cannot
// silently become wrong.
//
// Plain string slicing and regexes, deliberately: no parser, no dependency,
// no manifest, and no production helper exists just to satisfy a test.

const PAGE_PATH = join("src", "app", "(sites)", "[siteKey]", "page.tsx");
const COMPOSER_PATH = join("tests", "harness", "homepage-fixture-composer.tsx");

const GROUP_BRANCH_MARKER =
  'if (homepage.status === "ready" && homepage.homepage.variant === "group") {';
const BRANCH_BRANCH_MARKER =
  'if (homepage.status === "ready" && homepage.homepage.variant === "branch") {';
const FALLBACK_MARKER = "const homepageTitle =";

const COMPOSE_GROUP_MARKER = "export function composeGroupHomepage(";
const COMPOSE_BRANCH_MARKER = "export function composeBranchHomepage(";

// The exact null guard each region must contain, in its own local terms.
const PAGE_GROUP_HERO_GUARD = "homepage.homepage.hero !== null";
const PAGE_BRANCH_HERO_GUARD = "branch.hero !== null";
const COMPOSER_HERO_GUARD = "homepage.hero !== null";

// Group sections reused by the branch page. Recorded explicitly so that
// dropping one from the branch path is a visible failure rather than a quiet
// divergence between the two variants.
const SHARED_WITH_BRANCH = ["GroupProjects", "GroupInsights", "GroupContact"] as const;

/**
 * Removes JSX comments, block comments, and standalone line comments so that
 * commented-out markup cannot satisfy any assertion in this file. Line
 * comments are only stripped when the line is entirely a comment, which leaves
 * string contents such as a `https://` URL untouched.
 */
export function stripComments(source: string): string {
  return source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "");
}

function slice(source: string, start: string, end: string | null): string {
  const from = source.indexOf(start);

  expect(from, `marker not found: ${start}`).toBeGreaterThan(-1);

  const to = end === null ? source.length : source.indexOf(end, from);

  expect(to, `end marker not found: ${end ?? "<eof>"}`).toBeGreaterThan(from);

  return source.slice(from, to);
}

function importedHomepageComponents(source: string): readonly string[] {
  const names: string[] = [];
  const pattern =
    /import\s*\{\s*([A-Za-z0-9_]+)\s*\}\s*from\s*"@\/components\/homepage\/[^"]+";/g;

  for (const match of source.matchAll(pattern)) {
    const name = match[1];
    if (name !== undefined) names.push(name);
  }

  return names;
}

/** Ordered JSX usages, restricted to the known homepage components. */
function renderedSequence(
  region: string,
  known: ReadonlySet<string>,
): readonly string[] {
  const sequence: string[] = [];

  for (const match of region.matchAll(/<([A-Z][A-Za-z0-9_]*)/g)) {
    const name = match[1];
    if (name !== undefined && known.has(name)) sequence.push(name);
  }

  return sequence;
}

describe("comment stripping", () => {
  // Guards the fix for MEDIUM-1 directly: an import plus a commented-out
  // render must not count as a render, in any of the three comment forms.
  it("removes JSX, block, and standalone line comments", () => {
    const sample = [
      'import { GroupPartners } from "@/components/homepage/group-partners";',
      "      {/* <GroupPartners section={homepage.partners} /> */}",
      "      /* <GroupServices section={homepage.services} /> */",
      "      // <GroupAbout section={homepage.about} />",
      "      <GroupContact section={homepage.contact} />",
    ].join("\n");

    const stripped = stripComments(sample);
    const known = new Set([
      "GroupPartners",
      "GroupServices",
      "GroupAbout",
      "GroupContact",
    ]);

    expect(renderedSequence(stripped, known)).toEqual(["GroupContact"]);
    // The import itself survives: only the render was commented out.
    expect(importedHomepageComponents(stripped)).toEqual(["GroupPartners"]);
  });

  it("leaves ordinary code and string contents intact", () => {
    const sample = 'const href = "https://example.test/a";\n<GroupHero hero={hero} />';

    expect(stripComments(sample)).toContain("https://example.test/a");
    expect(stripComments(sample)).toContain("<GroupHero");
  });
});

describe("fixture harness parity with the production page", () => {
  // Comment-stripped before anything else is derived from them.
  const pageSource = stripComments(readFileSync(PAGE_PATH, "utf8"));
  const composerSource = stripComments(readFileSync(COMPOSER_PATH, "utf8"));

  const pageImports = importedHomepageComponents(pageSource);
  const composerImports = importedHomepageComponents(composerSource);
  const known = new Set([...pageImports, ...composerImports]);

  const pageGroupRegion = slice(pageSource, GROUP_BRANCH_MARKER, BRANCH_BRANCH_MARKER);
  const pageBranchRegion = slice(pageSource, BRANCH_BRANCH_MARKER, FALLBACK_MARKER);
  const composerGroupRegion = slice(
    composerSource,
    COMPOSE_GROUP_MARKER,
    COMPOSE_BRANCH_MARKER,
  );
  const composerBranchRegion = slice(composerSource, COMPOSE_BRANCH_MARKER, null);

  const pageGroup = renderedSequence(pageGroupRegion, known);
  const pageBranch = renderedSequence(pageBranchRegion, known);
  const composerGroup = renderedSequence(composerGroupRegion, known);
  const composerBranch = renderedSequence(composerBranchRegion, known);

  it("imports the same homepage components in page and composer", () => {
    expect([...composerImports].sort()).toEqual([...pageImports].sort());
  });

  it("renders the identical group sequence, in the identical order", () => {
    expect(pageGroup.length).toBeGreaterThan(0);
    expect(composerGroup).toEqual(pageGroup);
  });

  it("renders the identical branch sequence, in the identical order", () => {
    expect(pageBranch.length).toBeGreaterThan(0);
    expect(composerBranch).toEqual(pageBranch);
  });

  it("renders every imported component in at least one branch", () => {
    const rendered = new Set([...pageGroup, ...pageBranch]);

    // Catches an unused import as well as a component dropped from both
    // branches while its import survives.
    expect([...rendered].sort()).toEqual([...pageImports].sort());
  });

  it("renders every imported composer component in at least one branch", () => {
    const rendered = new Set([...composerGroup, ...composerBranch]);

    expect([...rendered].sort()).toEqual([...composerImports].sort());
  });

  it("renders no component it did not import", () => {
    for (const name of [...composerGroup, ...composerBranch]) {
      expect(composerImports).toContain(name);
    }
  });

  it("renders each component at most once per branch", () => {
    for (const sequence of [pageGroup, pageBranch, composerGroup, composerBranch]) {
      expect(new Set(sequence).size).toBe(sequence.length);
    }
  });

  it("keeps the shared group sections on the branch path", () => {
    for (const name of SHARED_WITH_BRANCH) {
      expect(pageBranch).toContain(name);
      expect(composerBranch).toContain(name);
    }
  });

  // MEDIUM-2: four independent region-scoped assertions. A guard present in
  // one region can no longer vouch for another.
  it("guards the production group hero inside the group branch", () => {
    expect(pageGroupRegion).toContain(PAGE_GROUP_HERO_GUARD);
    expect(pageGroup[0]).toBe("GroupHero");
  });

  it("guards the production branch hero inside the branch branch", () => {
    expect(pageBranchRegion).toContain(PAGE_BRANCH_HERO_GUARD);
    expect(pageBranch[0]).toBe("BranchHero");
  });

  it("guards the composer group hero inside composeGroupHomepage", () => {
    expect(composerGroupRegion).toContain(COMPOSER_HERO_GUARD);
    expect(composerGroup[0]).toBe("GroupHero");
  });

  it("guards the composer branch hero inside composeBranchHomepage", () => {
    expect(composerBranchRegion).toContain(COMPOSER_HERO_GUARD);
    expect(composerBranch[0]).toBe("BranchHero");
  });

  it("treats PageContainer as fallback layout, not a homepage section", () => {
    const fallback = slice(pageSource, FALLBACK_MARKER, null);

    expect(fallback).toContain("<PageContainer");
    expect(known.has("PageContainer")).toBe(false);
    expect(pageGroup).not.toContain("PageContainer");
    expect(pageBranch).not.toContain("PageContainer");
  });
});
