import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { NewsroomPage } from "@/components/record/newsroom-page";
import { normalizeEditorialFeed } from "@/lib/editorial/normalize-editorial-feed";
import type { SiteKey } from "@/types/site";
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

// Renders the newsroom against REAL CMS DATA, captured from the live WordPress
// by tools/capture-live-feed.mjs, through the real normalizer and the real
// production components.
//
// The capture is taken by tools/capture-live-feed.mjs against the live endpoint
// and replayed here, so the whole pipeline below the transport is exercised
// against content nobody authored for a test.
//
// It SKIPS rather than fails when no capture exists, because the captures are
// real content that a clean checkout has no way to reproduce.

const OUTPUT_DIR = fileURLToPath(
  new URL("../../test-results/newsroom-preview/", import.meta.url),
);
const FIXTURE_DIR = fileURLToPath(
  new URL("../fixtures/newsroom/", import.meta.url),
);

const BRAND_NAME: Readonly<Record<SiteKey, string>> = {
  group: "SIRA GROUP",
  consulting: "SIRA Consulting",
  healthcare: "SIRA Healthcare",
  lifestyle: "SIRA Lifestyle",
  realestate: "SIRA Real Estate",
};

interface Capture {
  readonly data?: {
    readonly contentNodes?: unknown;
    readonly siraBusinessUnit?: { readonly contentNodes?: unknown } | null;
  };
}

function loadCapture(site: SiteKey): unknown | null {
  const path = join(FIXTURE_DIR, `live-feed.${site}.json`);
  if (!existsSync(path)) return null;

  const parsed = JSON.parse(readFileSync(path, "utf8")) as Capture;
  const connection =
    parsed.data?.contentNodes ?? parsed.data?.siraBusinessUnit?.contentNodes;

  return connection === undefined ? null : { contentNodes: connection };
}

describe("newsroom against live CMS data", () => {
  const sites = Object.keys(BRAND_NAME) as readonly SiteKey[];

  for (const site of sites) {
    it(`renders the ${site} record`, () => {
      const capture = loadCapture(site);

      if (capture === null) {
        // No capture in this checkout. Not a failure: run
        // `node tools/capture-live-feed.mjs --site <key>` to produce one.
        return;
      }

      const resolution = normalizeEditorialFeed(
        site,
        capture as Parameters<typeof normalizeEditorialFeed>[1],
      );

      // The live payload has to survive the same validation as any other.
      expect(resolution.status, `${site} feed status`).toBe("ready");
      if (resolution.status !== "ready") return;

      const items = resolution.page.items;
      expect(items.length).toBeGreaterThan(0);

      // Every entry resolves to at least one desk. A gap here would mean the
      // register margin had nothing to report for a real record.
      for (const item of items) {
        expect(item.desks.length, item.title).toBeGreaterThan(0);
      }

      const markup = renderToStaticMarkup(
        withBrandTokens(
          site,
          createElement(NewsroomPage, {
            siteKey: site,
            brandName: BRAND_NAME[site],
            items,
            desk: null,
            kind: null,
            isFailure: false,
            // Captured content includes placeholder editorial (ADR-030), so
            // the preview must carry the notice a non-production host shows.
            isProductionCanonical: false,
          }),
        ),
      );

      mkdirSync(OUTPUT_DIR, { recursive: true });
      writeFileSync(join(OUTPUT_DIR, `live-${site}.html`), markup);

      // Structural assertions against THE SIRA RECORD's own markers.
      expect(markup).toContain("record-heading");
      expect(markup).toContain("record-shell");
      expect(markup).toContain("record-register");
      // Off the canonical host the masthead states the placeholder caveat.
      expect(markup).toContain("PLACEHOLDER EDITORIAL");
    });
  }

  it("reports what the live Group record is composed of", () => {
    const capture = loadCapture("group");
    if (capture === null) return;

    const resolution = normalizeEditorialFeed(
      "group",
      capture as Parameters<typeof normalizeEditorialFeed>[1],
    );
    if (resolution.status !== "ready") return;

    const byDesk = new Map<string, number>();
    for (const item of resolution.page.items) {
      for (const desk of item.desks) {
        byDesk.set(desk, (byDesk.get(desk) ?? 0) + 1);
      }
    }

    // Not an assertion about exact counts — content changes. It asserts the
    // thing the design depends on: that a real Group record spans every desk,
    // which is what makes the index a portrait of the house rather than a
    // single bar.
    expect(byDesk.size).toBeGreaterThanOrEqual(5);

    // Diagnostics from real content are worth seeing rather than swallowing.
    console.log(
      "live group desks:",
      Object.fromEntries([...byDesk.entries()].sort()),
      "diagnostics:",
      resolution.page.diagnostics.length,
      "with images:",
      resolution.page.items.filter((i) => i.featuredImage !== null).length,
      "/",
      resolution.page.items.length,
    );
  });
});
