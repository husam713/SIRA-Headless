import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement, Fragment, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { NewsroomIndexBar } from "@/components/newsroom/newsroom-index-bar";
import { NewsroomLead } from "@/components/newsroom/newsroom-lead";
import { NewsroomLedger } from "@/components/newsroom/newsroom-ledger";
import { NewsroomMasthead } from "@/components/newsroom/newsroom-masthead";
import { countByKind, groupByYear, yearSpan } from "@/lib/editorial/ledger";
import type { EditorialItem, EditorialKind } from "@/lib/editorial/types";
import { withBrandTokens } from "./homepage-fixture-composer";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { readonly href: string; readonly children?: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
}));

const OUTPUT_DIR = fileURLToPath(new URL("../../test-results/newsroom-preview/", import.meta.url));

const IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#0b1622"/><circle cx="900" cy="220" r="180" fill="#cca34b" opacity="0.35"/><rect x="0" y="560" width="1200" height="240" fill="#16324a" opacity="0.7"/></svg>',
  );

let next = 1;
function item(
  title: string,
  publishedAt: string | null,
  kind: EditorialKind,
  excerpt: string | null,
  withImage: boolean,
): EditorialItem {
  return Object.freeze({
    databaseId: next++,
    typename: "SiraNewsItem" as const,
    contentTypeName: "sira_news" as const,
    kind,
    title,
    excerpt,
    href: "/news/x/",
    publishedAt,
    modifiedAt: null,
    featuredImage: withImage
      ? Object.freeze({ databaseId: 1, sourceUrl: IMG, altText: null, width: 1200, height: 800 })
      : null,
  });
}

const ITEMS: readonly EditorialItem[] = [
  item("SIRA GROUP Signs Strategic Partnership with OVAN Group", "2026-07-14T00:00:00Z", "news",
    "A joint venture to accelerate residential delivery in Istanbul, combining capital, land and delivery capability.", true),
  item("Rosina Diagnostic Center Adds PET-CT Molecular Imaging Wing", "2026-06-02T00:00:00Z", "news",
    "The Nairobi facility expands into early-stage cancer diagnostics with next-generation molecular imaging.", true),
  item("Inside Nairobi's Diagnostic Imaging Boom", "2026-05-19T00:00:00Z", "insight",
    "Why demand for advanced radiology is reshaping healthcare investment across East Africa.", false),
  item("SIRA GROUP Expands Portfolio into Hospitality & Lifestyle", "2026-05-04T00:00:00Z", "press-release",
    "Sira Lifestyle launches as the group's newest division, opening founding-partner opportunities.", false),
  item("What We Look for in a Strategic Partner", "2026-04-21T00:00:00Z", "insight",
    "The criteria SIRA GROUP applies before entering a new market or venture.", true),
  item("Why Istanbul Remains a Resilient Property Market", "2026-04-02T00:00:00Z", "article",
    "The fundamentals continuing to draw international capital into Turkish real estate.", false),
  item("Bridging Continents Through Smart Investment", "2025-11-11T00:00:00Z", "article",
    "How a house of specialized companies is building infrastructure for the next generation of growth.", true),
  item("Sira Prime Tops Out Ahead of Schedule", "2025-08-30T00:00:00Z", "news",
    "The Istanbul development reaches structural completion four weeks early.", false),
  item("A Second Diagnostic Center for East Africa", "2024-12-05T00:00:00Z", "news", null, false),
];

// Renders the newsroom against the two cases the CMS actually produces — a
// lead with a featured image and a lead without one — and writes the markup so
// it can be screenshotted the same way the homepage fixtures are. Roughly half
// the editorial items in this CMS carry no image, so the imageless lead is a
// real case, not an edge one.
describe("newsroom preview", () => {
  it("writes the preview markup for both lead treatments", () => {
    mkdirSync(OUTPUT_DIR, { recursive: true });

    const page = createElement(
      Fragment,
      null,
      createElement(NewsroomMasthead, {
        heading: "News & Insights",
        description:
          "Milestones, perspectives and announcements from across SIRA GROUP and its companies.",
        total: ITEMS.length,
        span: yearSpan(ITEMS),
        scopeLabel: null,
      }),
      createElement(NewsroomIndexBar, {
        counts: countByKind(ITEMS),
        active: null,
        total: ITEMS.length,
      }),
      createElement(NewsroomLead, { item: ITEMS[0]! }),
      createElement(NewsroomLedger, { years: groupByYear(ITEMS.slice(1)) }),
    );

    const markup = renderToStaticMarkup(withBrandTokens("group", page));
    writeFileSync(join(OUTPUT_DIR, "newsroom.html"), markup);

    // The year spine is what replaces the reference design's equal-card grid,
    // so its absence would mean the ledger silently degraded back into a list.
    for (const year of ["2026", "2025", "2024"]) {
      expect(markup, `year band ${year}`).toContain(`aria-label="${year}"`);
    }

    const typographicLead = createElement(
      Fragment,
      null,
      createElement(NewsroomLead, { item: ITEMS[2]! }),
      createElement(NewsroomLedger, { years: groupByYear(ITEMS.slice(3)) }),
    );

    const typographicMarkup = renderToStaticMarkup(
      withBrandTokens("healthcare", typographicLead),
    );
    writeFileSync(join(OUTPUT_DIR, "newsroom-typographic-lead.html"), typographicMarkup);

    // The imageless lead must not reserve the image block: the whole point of
    // the second treatment is that it does not open the page with an empty
    // rectangle. Asserted against the lead alone — the preview above it also
    // carries the ledger, whose rows legitimately do have thumbnails.
    const leadOnly = renderToStaticMarkup(
      createElement(NewsroomLead, { item: ITEMS[2]! }),
    );
    expect(leadOnly).not.toContain("<img");
    expect(leadOnly).toContain("Inside Nairobi&#x27;s Diagnostic Imaging Boom");
  });
});
