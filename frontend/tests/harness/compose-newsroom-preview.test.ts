import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { NewsroomPage } from "@/components/newsroom/newsroom-page";
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
    // A young archive: a lead, no front row, a short record. The front is
    // dropped rather than half-filled.
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

  it("composes the group record into three weights, not one grid", () => {
    const markup = render(CASES[0]!);

    // The lead is the newest entry and it is the only one at lead scale.
    expect(markup).toContain("SIRA GROUP Signs Strategic Partnership");
    // The front's stepping widths are the composition; if `.front` ever stopped
    // rendering, every entry would collapse into the record at equal weight.
    expect(markup).toContain('class="front"');
    // Year bands give the record its spine at 24 entries and at 500.
    for (const year of ["2026", "2025", "2024", "2023"]) {
      expect(markup, `band ${year}`).toContain(`record-band-${year}`);
    }
    // The undated entry is accounted for rather than dropped.
    expect(markup).toContain("record-band-Undated");
  });

  it("gives every entry its desk accent, and no entry a coloured label", () => {
    const markup = render(CASES[0]!);

    // Each of the five approved accents appears as a corner-mark colour.
    for (const accent of ["#cca34b", "#2c6dad", "#b0733c", "#2e8c72", "#8b5aae"]) {
      expect(markup, accent).toContain(accent);
    }

    // Every accent reaches an entry through --desk-accent, which is what the
    // corner mark reads. Nothing sets an entry's TEXT colour from an accent:
    // Group gold and Real Estate ochre cannot meet AA as 11px type on paper.
    for (const accent of ["#cca34b", "#2c6dad", "#b0733c", "#2e8c72", "#8b5aae"]) {
      expect(markup, accent).toContain(`--desk-accent:${accent}`);
    }
    expect(markup).not.toMatch(/(?<!--desk-accent:)#(?:cca34b|b0733c)"/u);
  });

  it("sets no newsroom text in a token that fails AA on SIRA paper", () => {
    // Measured against the five approved papers in Chromium:
    //   --brand-ink       13.62-14.87 : 1
    //   --brand-ink-soft   6.81- 7.20 : 1
    //   --brand-ink-faint  3.60- 4.50 : 1   <- below AA, and none of this is
    //                                          large text (11px bold is not)
    // ink-faint stays available for decoration; nothing the reader has to read
    // may use it. The desk accents are further out still (Group gold 2.15:1),
    // which is why they only ever paint the corner mark.
    for (const testCase of CASES) {
      expect(render(testCase), testCase.file).not.toContain(
        "text-brand-ink-faint",
      );
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
    // A format with nothing filed under it is still listed, so the index does
    // not change shape as the record fills — but it is not a link to nowhere.
    expect(branch).not.toContain("/news?kind=insight");
    expect(branch).toContain("Insights");
  });

  it("never reserves an image block for an entry that has none", () => {
    // The Consulting demo record carries no featured images at all, so the
    // whole page — lead included — must render without a single <img>.
    const markup = render(CASES[5]!);
    expect(markup).not.toContain("<img");
    expect(markup).toContain("The Cost of Waiting");
  });

  it("drops the front rather than half-filling it on a young archive", () => {
    const markup = render(CASES[4]!);
    expect(markup).not.toContain('class="front"');
    // The lead is still composed, so a two-entry newsroom reads as a young
    // record rather than as a broken row.
    expect(markup).toContain("newsroom-heading");
  });
});
