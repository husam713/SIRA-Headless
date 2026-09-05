import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ArticlePage } from "@/components/editorial/article-page";
import type { EditorialArticle } from "@/lib/editorial/editorial-single-types";
import { normalizeEditorialSingle } from "@/lib/editorial/normalize-editorial-single";
import { parseRichText } from "@/lib/editorial/rich-text";
import { withBrandTokens } from "./homepage-fixture-composer";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { readonly href: string; readonly children?: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
}));

const OUTPUT_DIR = fileURLToPath(new URL("../../test-results/newsroom-preview/", import.meta.url));
const PAYLOAD_DIR = process.env["SIRA_PAYLOAD_DIR"];

// Exercises every tag the renderer supports, so the article typography can be
// reviewed without waiting for the CMS to carry a long piece.
const RICH_BODY = `
<p>Demand for advanced radiology is reshaping how healthcare investors think about East Africa, and the shift is happening faster than most capital allocators expected.</p>
<h2>Why now</h2>
<p>Three things changed at once. Equipment financing became available locally, referring clinicians grew comfortable with <strong>cross-facility reporting</strong>, and patients began travelling shorter distances for a scan than for a consultation.</p>
<ul><li>Imaging volumes rose faster than bed capacity.</li><li>Reporting turnaround, not machine count, became the constraint.</li><li>Insurers started reimbursing outpatient diagnostics directly.</li></ul>
<blockquote>The bottleneck was never the scanner. It was everything that had to happen before and after it.</blockquote>
<h3>What that means for operators</h3>
<p>An operator entering the market now inherits demand but also inherits an expectation of turnaround that did not exist five years ago. See our <a href="/news/rosina-diagnostic-center-adds-pet-ct-molecular-imaging-wing/">note on the PET-CT wing</a> for one example.</p>
<ol><li>Staff the reporting desk before the second machine.</li><li>Contract with insurers early.</li><li>Publish turnaround times.</li></ol>
<hr>
<p>Written by the SIRA Health investment team. Reach us at <a href="mailto:healthcare@siratrgroup.com">healthcare@siratrgroup.com</a>.</p>
`;

const SYNTHETIC: EditorialArticle = Object.freeze({
  databaseId: 9001,
  typename: "SiraArticle" as const,
  contentTypeName: "sira_article" as const,
  kind: "article" as const,
  title: "Inside Nairobi's Diagnostic Imaging Boom",
  excerpt:
    "Demand for advanced radiology is reshaping how healthcare investors think about East Africa.",
  href: "/articles/inside-nairobis-diagnostic-imaging-boom/",
  publishedAt: "2026-08-27T20:38:20",
  modifiedAt: "2026-09-02T11:04:00",
  featuredImage: null,
  body: parseRichText(RICH_BODY),
});

describe("article preview", () => {
  it("renders a full-typography body", () => {
    mkdirSync(OUTPUT_DIR, { recursive: true });

    const markup = renderToStaticMarkup(
      withBrandTokens("healthcare", createElement(ArticlePage, { article: SYNTHETIC })),
    );
    writeFileSync(join(OUTPUT_DIR, "article.html"), markup);

    // The body must arrive as real elements. If the renderer ever regressed to
    // injecting a string, the tags would still appear but as escaped text.
    for (const tag of ["<h2", "<h3", "<ul", "<ol", "<blockquote", "<hr"]) {
      expect(markup, tag).toContain(tag);
    }
    expect(markup).not.toContain("&lt;h2");
  });

  it("renders the live payload through the real normalizer", () => {
    if (PAYLOAD_DIR === undefined) return;

    const raw = JSON.parse(
      readFileSync(join(PAYLOAD_DIR, "article-payload.json"), "utf8"),
    ) as { readonly data: unknown };

    const resolution = normalizeEditorialSingle(
      "group",
      "/articles/inside-nairobis-diagnostic-imaging-boom/",
      raw.data as never,
    );

    expect(resolution.status).toBe("ready");
    if (resolution.status !== "ready") return;

    writeFileSync(
      join(OUTPUT_DIR, "article-live.html"),
      renderToStaticMarkup(
        withBrandTokens("group", createElement(ArticlePage, { article: resolution.article })),
      ),
    );
  });
});
