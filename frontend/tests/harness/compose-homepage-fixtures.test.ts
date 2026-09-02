import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
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
]);

function readFixture(name: string): SiraHomepageQueryData {
  return JSON.parse(
    readFileSync(join(FIXTURE_DIR, `${name}.json`), "utf8"),
  ) as SiraHomepageQueryData;
}

describe("homepage fixture composition", () => {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const testCase of CASES) {
    it(`renders ${testCase.name} through the production components`, () => {
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

      writeFileSync(join(OUTPUT_DIR, `${testCase.name}.html`), markup);
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
