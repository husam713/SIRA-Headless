import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { NewsroomPage } from "@/components/record/newsroom-page";
import type { EditorialItem } from "@/lib/editorial/types";
import { DEMO_RECORD, demoBranchRecord } from "../fixtures/newsroom/demo-record";
import { withBrandTokens } from "./homepage-fixture-composer";

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

const OUTPUT_DIR = fileURLToPath(
  new URL("../../test-results/newsroom-preview/", import.meta.url),
);

// Renders the REAL production newsroom — the same NewsroomPage component the
// /news route renders — against the demo record in tests/fixtures/newsroom.
// The markup is written out so scripts/preview-newsroom.mjs can screenshot it
// at four viewports without a CMS, a deployment, or credentials.
//
// The fixture content is invented for design testing and is marked as such at
// the top of the fixture file. Nothing here is a SIRA announcement.

interface Case {
  readonly file: string;
  readonly siteKey: Parameters<typeof withBrandTokens>[0];
  readonly brandName: string;
  readonly items: readonly EditorialItem[];
  readonly desk: Parameters<typeof NewsroomPage>[0]["desk"];
  readonly kind: Parameters<typeof NewsroomPage>[0]["kind"];
}

const CASES: readonly Case[] = [
  {
    file: "group.html",
    siteKey: "group",
    brandName: "SIRA GROUP",
    items: DEMO_RECORD,
    desk: null,
    kind: null,
  },
  {
    // A desk filter: fewer entries, a different lead, and the index has to keep
    // reporting the whole house rather than only the filtered slice.
    file: "group-desk-healthcare.html",
    siteKey: "group",
    brandName: "SIRA GROUP",
    items: DEMO_RECORD,
    desk: "healthcare",
    kind: null,
  },
  {
    // The other art direction: one desk, indexed by format, painted in the
    // company's own accent.
    file: "branch-healthcare.html",
    siteKey: "healthcare",
    brandName: "SIRA Healthcare",
    items: demoBranchRecord("healthcare"),
    desk: null,
    kind: null,
  },
  {
    file: "branch-realestate.html",
    siteKey: "realestate",
    brandName: "SIRA Real Estate",
    items: demoBranchRecord("real-estate"),
    desk: null,
    kind: null,
  },
  {
    // A young archive: a lead and a single indexed entry. A short record has
    // to read as a young archive rather than as a broken page.
    file: "young-archive.html",
    siteKey: "lifestyle",
    brandName: "SIRA Lifestyle",
    items: demoBranchRecord("lifestyle").slice(0, 2),
    desk: null,
    kind: null,
  },
  {
    // The lead with no featured image, which is roughly half of what this CMS
    // actually holds: it must become typographic, not a grey rectangle.
    file: "typographic-lead.html",
    siteKey: "consulting",
    brandName: "SIRA Consulting",
    items: demoBranchRecord("consulting"),
    desk: null,
    kind: null,
  },
];

/** React escapes these on the way into static markup. */
function escapeMarkup(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#x27;");
}

function render(testCase: Case): string {
  return renderToStaticMarkup(
    withBrandTokens(
      testCase.siteKey,
      createElement(NewsroomPage, {
        siteKey: testCase.siteKey,
        brandName: testCase.brandName,
        items: testCase.items,
        desk: testCase.desk,
        kind: testCase.kind,
        isFailure: false,
      }),
    ),
  );
}

describe("newsroom preview", () => {
  it("writes every composition case", () => {
    mkdirSync(OUTPUT_DIR, { recursive: true });

    for (const testCase of CASES) {
      writeFileSync(join(OUTPUT_DIR, testCase.file), render(testCase));
    }

    // Also write the two states that are easy to leave unstyled because nobody
    // looks at them: a filter that matched nothing, and a feed that failed.
    writeFileSync(
      join(OUTPUT_DIR, "empty-filter.html"),
      renderToStaticMarkup(
        withBrandTokens(
          "group",
          createElement(NewsroomPage, {
            siteKey: "group",
            brandName: "SIRA GROUP",
            // Nothing in the demo record is filed to Lifestyle AND matches this
            // desk once the branch subset is taken, so the view is legitimately
            // empty while the index above it stays usable.
            items: demoBranchRecord("healthcare"),
            desk: "lifestyle",
            kind: null,
            isFailure: false,
          }),
        ),
      ),
    );

    writeFileSync(
      join(OUTPUT_DIR, "feed-failure.html"),
      renderToStaticMarkup(
        withBrandTokens(
          "group",
          createElement(NewsroomPage, {
            siteKey: "group",
            brandName: "SIRA GROUP",
            items: [],
            desk: null,
            kind: null,
            isFailure: true,
          }),
        ),
      ),
    );
  });

  it("composes the record as one lead over one chronological register", () => {
    const markup = render(CASES[0]!);

    // The lead is the newest entry, given the sheet's full width.
    expect(markup).toContain("SIRA GROUP Signs Strategic Partnership");
    expect(markup).toContain("record-shell");
    expect(markup).toContain("record-register");

    // Chronology, not an endless grid: every year the demo record spans gets
    // its own band, and the undated entry is accounted for rather than dropped.
    for (const year of ["2026", "2025", "2024", "2023"]) {
      expect(markup, `band ${year}`).toContain(`record-year-${year}`);
    }
    expect(markup).toContain("record-year-Undated");
  });

  it("gives every entry its desk accent, and no entry a coloured label", () => {
    const markup = render(CASES[0]!);

    // Each approved accent reaches the page, and only ever through the custom
    // property the register's hairline reads.
    for (const accent of ["#cca34b", "#2c6dad", "#b0733c", "#2e8c72", "#8b5aae"]) {
      expect(markup, accent).toContain(`--desk-accent:${accent}`);
    }
  });

  it("renders every entry it is given, at any archive length", () => {
    // The page-level counterpart to composeNewsroom's no-loss invariant. An
    // earlier composition reserved a fixed-size row between the lead and the
    // register; when that row left the design its entries stopped rendering,
    // and nothing failed — the page simply showed fewer stories than the
    // filter counts promised.
    for (const length of [0, 1, 2, 3, 4, 7, DEMO_RECORD.length]) {
      const items = DEMO_RECORD.slice(0, length);
      const markup = render({ ...CASES[0]!, items });

      for (const item of items) {
        expect(markup, `${length} entries: ${item.title}`).toContain(
          escapeMarkup(item.title),
        );
      }
    }
  });

  it("indexes Group by desk and a branch by format", () => {
    const group = render(CASES[0]!);
    expect(group).toContain("/news?desk=healthcare");
    expect(group).toContain("/news?desk=real-estate");
    expect(group).not.toContain("/news?kind=");

    const branch = render(CASES[2]!);
    expect(branch).toContain("/news?kind=article");
    expect(branch).not.toContain("/news?desk=");
  });

  it("carries no media in the register at all", () => {
    // THE RECORD is typographic by design: the archive is rules and type, so a
    // CMS with art and a CMS without it produce the same geometry.
    for (const testCase of CASES) {
      expect(render(testCase), testCase.file).not.toContain("<img");
    }
  });

  it("renders a two-entry archive as a lead and a short register", () => {
    const markup = render(CASES[4]!);

    // A young archive is a short record, not a broken one.
    expect(markup).toContain("record-heading");
    expect(markup).toContain("record-shell");
    // The count line reports what the filter is showing, singular or plural.
    expect(markup).toMatch(/\d+ (?:story|stories) · everything/u);
  });
});
