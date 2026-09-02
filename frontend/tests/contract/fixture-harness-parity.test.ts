import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The harness composer must stay a mirror of the real page, not a copy that
// drifts. Comparing import lists is not enough: an import can go unused, a
// section can be dropped from one branch only, or the running order can change
// without any import changing. So this compares the ORDERED component sequence
// of each ready-page branch against the matching composer function.
//
// A missing render, an extra render, an unused import, or a reordered section
// therefore fails here.
//
// PageContainer is deliberately excluded from these sequences. It is a layout
// primitive used by the Step 3 fallback branch — the one that renders when no
// homepage resolves — and by components internally. It is not a homepage
// section, so it must not be treated as a missing production section. The
// fallback assertion below pins that distinction so the exclusion cannot
// silently become wrong.
//
// Plain string slicing and one regex, deliberately: no parser, no dependency,
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

// Group sections reused by the branch page. Recorded explicitly so that
// dropping one from the branch path is a visible failure rather than a quiet
// divergence between the two variants.
const SHARED_WITH_BRANCH = ["GroupProjects", "GroupInsights", "GroupContact"] as const;

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

describe("fixture harness parity with the production page", () => {
  const pageSource = readFileSync(PAGE_PATH, "utf8");
  const composerSource = readFileSync(COMPOSER_PATH, "utf8");

  const pageImports = importedHomepageComponents(pageSource);
  const composerImports = importedHomepageComponents(composerSource);
  const known = new Set([...pageImports, ...composerImports]);

  const pageGroup = renderedSequence(
    slice(pageSource, GROUP_BRANCH_MARKER, BRANCH_BRANCH_MARKER),
    known,
  );
  const pageBranch = renderedSequence(
    slice(pageSource, BRANCH_BRANCH_MARKER, FALLBACK_MARKER),
    known,
  );
  const composerGroup = renderedSequence(
    slice(composerSource, COMPOSE_GROUP_MARKER, COMPOSE_BRANCH_MARKER),
    known,
  );
  const composerBranch = renderedSequence(
    slice(composerSource, COMPOSE_BRANCH_MARKER, null),
    known,
  );

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

  it("renders the hero conditionally in both the page and the composer", () => {
    expect(pageSource).toContain("homepage.homepage.hero !== null");
    expect(pageSource).toContain("branch.hero !== null");
    expect(composerSource).toContain("homepage.hero !== null");

    // The hero leads both sequences, so a hero rendered unconditionally or
    // moved would surface here as well as in the sequence comparisons.
    expect(pageGroup[0]).toBe("GroupHero");
    expect(pageBranch[0]).toBe("BranchHero");
  });

  it("treats PageContainer as fallback layout, not a homepage section", () => {
    const fallback = slice(pageSource, FALLBACK_MARKER, null);

    expect(fallback).toContain("<PageContainer");
    expect(known.has("PageContainer")).toBe(false);
    expect(pageGroup).not.toContain("PageContainer");
    expect(pageBranch).not.toContain("PageContainer");
  });
});
