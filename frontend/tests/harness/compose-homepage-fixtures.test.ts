import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createBrandCssVariables } from "@/lib/brand/css-variables";
import { createFallbackBrand } from "@/lib/brand/fallbacks";
import type { GraphQLErrorSummary } from "@/lib/graphql/errors";
import { normalizeHomepage } from "@/lib/homepage/normalize-homepage";
import type { SiraHomepageQueryData } from "@/queries/homepage";
import type { SiteKey } from "@/types/site";
import {
  composeBranchHomepage,
  composeGroupHomepage,
} from "./homepage-fixture-composer";

// next/link needs the Next runtime, which this render deliberately does not
// have. Rendering it as the anchor it becomes keeps the harness on real
// production components without pulling in a bundler or a route.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    readonly href: string;
    readonly children?: ReactNode;
  }) => createElement("a", { href, ...rest }, children),
}));

const FIXTURE_DIR = fileURLToPath(new URL("../fixtures/homepage/", import.meta.url));
const OUTPUT_DIR = fileURLToPath(
  new URL("../../test-results/homepage-fixtures/", import.meta.url),
);

const HERO_FIELD_ERROR: readonly GraphQLErrorSummary[] = Object.freeze([
  Object.freeze({
    message: "Internal server error",
    path: Object.freeze(["page", "groupHomepage", "hero"]),
    code: "INTERNAL_SERVER_ERROR",
  }),
]);

interface FixtureCase {
  readonly name: string;
  readonly siteKey: SiteKey;
  readonly variant: "group" | "branch";
  readonly fieldErrors: readonly GraphQLErrorSummary[];
  // Output filename stem, when several cases share one fixture. Defaults to
  // `name`. scripts/verify-homepage-fixtures.mjs reads a fixed list of
  // filenames, so the original six stems must keep writing exactly the files
  // it expects; the per-tenant G-J cases below add files rather than rename
  // any.
  readonly outputName?: string;
}

const CASES: readonly FixtureCase[] = Object.freeze([
  { name: "group-complete", siteKey: "group", variant: "group", fieldErrors: [] },
  { name: "group-partial", siteKey: "group", variant: "group", fieldErrors: [] },
  {
    name: "group-hero-missing",
    siteKey: "group",
    variant: "group",
    fieldErrors: HERO_FIELD_ERROR,
  },
  { name: "branch-complete", siteKey: "consulting", variant: "branch", fieldErrors: [] },
  { name: "branch-partial", siteKey: "consulting", variant: "branch", fieldErrors: [] },
  {
    name: "branch-hero-missing",
    siteKey: "consulting",
    variant: "branch",
    fieldErrors: [],
  },
  // Sequence items G-J: the four branch tenants share ONE BranchHomepage
  // component set, so variant validation is about proving that same set
  // resolves and renders for each tenant key - not about four implementations.
  // Consulting (H) is already covered by the three cases above.
  {
    name: "branch-complete",
    outputName: "branch-complete-healthcare",
    siteKey: "healthcare",
    variant: "branch",
    fieldErrors: [],
  },
  {
    name: "branch-complete",
    outputName: "branch-complete-lifestyle",
    siteKey: "lifestyle",
    variant: "branch",
    fieldErrors: [],
  },
  {
    name: "branch-complete",
    outputName: "branch-complete-realestate",
    siteKey: "realestate",
    variant: "branch",
    fieldErrors: [],
  },
]);

// G-J tenants in approved sequence order (docs/STEP-4-EXACT-DESIGN-FIDELITY-
// IMPLEMENTATION.md section 20): G Healthcare, H Consulting, I Lifestyle,
// J Real Estate.
const BRANCH_TENANTS: readonly SiteKey[] = Object.freeze([
  "healthcare",
  "consulting",
  "lifestyle",
  "realestate",
]);

function readFixture(name: string): SiraHomepageQueryData {
  return JSON.parse(
    readFileSync(join(FIXTURE_DIR, `${name}.json`), "utf8"),
  ) as SiraHomepageQueryData;
}

describe("homepage fixture composition", () => {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const testCase of CASES) {
    const outputName = testCase.outputName ?? testCase.name;

    it(`renders ${outputName} through the production components`, () => {
      const resolution = normalizeHomepage(
        testCase.siteKey,
        readFixture(testCase.name),
        testCase.fieldErrors,
      );

      // A fixture that only lacks sections must still resolve: only the page
      // envelope is critical.
      expect(resolution.status).toBe("ready");

      if (resolution.status !== "ready") return;

      const { homepage } = resolution;
      const markup =
        homepage.variant === "group"
          ? renderToStaticMarkup(composeGroupHomepage(homepage))
          : renderToStaticMarkup(composeBranchHomepage(homepage));

      expect(markup.length).toBeGreaterThan(0);

      writeFileSync(join(OUTPUT_DIR, `${outputName}.html`), markup);
    });
  }

  it("omits a failed hero while keeping the other group sections", () => {
    const resolution = normalizeHomepage(
      "group",
      readFixture("group-hero-missing"),
      HERO_FIELD_ERROR,
    );

    expect(resolution.status).toBe("ready");

    if (resolution.status !== "ready") return;
    if (resolution.homepage.variant !== "group") return;

    expect(resolution.homepage.hero).toBeNull();
    expect(resolution.homepage.about).not.toBeNull();
    expect(resolution.homepage.contact).not.toBeNull();
    expect(resolution.homepage.diagnostics).toEqual([
      { code: "graphql-field-error", databaseId: null, section: "hero" },
    ]);

    const markup = renderToStaticMarkup(
      composeGroupHomepage(resolution.homepage),
    );

    expect(markup).not.toContain("Fixture hero description");
    expect(markup).toContain("Fixture about heading");
    expect(markup).toContain("Fixture contact heading");
  });

  // What actually differs between G, H, I and J is brand identity, not markup:
  // BrandDocument stamps data-brand-key and the --brand-* custom properties
  // onto <html>, and every branch section then reads those tokens. So the
  // variant check that matters is that each tenant resolves to its own brand
  // and its own token values.
  it("resolves a distinct brand identity for each of the four branch tenants", () => {
    const seen = new Map<SiteKey, string>();

    for (const siteKey of BRANCH_TENANTS) {
      const brand = createFallbackBrand(siteKey);

      expect(brand.key, `${siteKey} brand key`).toBe(siteKey);
      expect(brand.siteKey, `${siteKey} brand siteKey`).toBe(siteKey);
      expect(brand.name.length, `${siteKey} brand name`).toBeGreaterThan(0);

      const variables = createBrandCssVariables(brand);

      // Every token the sections consume must be a real value, or a tenant
      // would silently inherit whatever the previous brand set.
      for (const [token, value] of Object.entries(variables)) {
        expect(value, `${siteKey} ${token}`).toBeTruthy();
      }

      seen.set(siteKey, JSON.stringify(variables));
    }

    expect(seen.size).toBe(BRANCH_TENANTS.length);

    // Pairwise distinct: four tenants sharing one component set must not also
    // share one palette, or the variants are indistinguishable in review.
    const signatures = [...seen.values()];
    expect(new Set(signatures).size, "brand token sets are pairwise distinct").toBe(
      signatures.length,
    );
  });

  it("renders every branch tenant through the same shared component set", () => {
    for (const siteKey of BRANCH_TENANTS) {
      const resolution = normalizeHomepage(siteKey, readFixture("branch-complete"));

      expect(resolution.status, `${siteKey} resolution`).toBe("ready");

      if (resolution.status !== "ready") continue;
      if (resolution.homepage.variant !== "branch") {
        throw new Error(`${siteKey} did not resolve as a branch homepage`);
      }

      const markup = renderToStaticMarkup(
        composeBranchHomepage(resolution.homepage),
      );

      // The sentinels come from the shared branch sections, so their presence
      // proves the shared set rendered for this tenant.
      expect(markup, `${siteKey} hero`).toContain("SENTINEL-BRANCH-HERO");
      expect(markup, `${siteKey} statistics`).toContain("SENTINEL-BRANCH-STATISTICS");
      expect(markup, `${siteKey} overview`).toContain("SENTINEL-BRANCH-OVERVIEW");
      expect(markup, `${siteKey} focus areas`).toContain("SENTINEL-BRANCH-FOCUS-AREAS");
    }
  });

  it("omits a failed hero while keeping the other branch sections", () => {
    const resolution = normalizeHomepage(
      "consulting",
      readFixture("branch-hero-missing"),
    );

    expect(resolution.status).toBe("ready");

    if (resolution.status !== "ready") return;
    if (resolution.homepage.variant !== "branch") return;

    expect(resolution.homepage.hero).toBeNull();
    expect(resolution.homepage.overview).not.toBeNull();

    const markup = renderToStaticMarkup(
      composeBranchHomepage(resolution.homepage),
    );

    expect(markup).not.toContain("Fixture hero description");
    expect(markup).toContain("Fixture overview heading");
  });
});
