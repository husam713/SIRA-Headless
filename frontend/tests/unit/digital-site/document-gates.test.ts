import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The Digital document's durable decisions, asserted at the source so they
// cannot drift quietly: its stylesheet touches nothing outside its own
// document, motion has a kill switch, scroll-driven effects are progressive,
// hover affordances are hover-only, and the tenant branches sit where they
// must — before any CMS query on the routes Digital renders, and as a 404 on
// the routes it does not.

const CSS_PATH = join("src", "styles", "digital-site.css");
const APP = join("src", "app", "(sites)", "[siteKey]");
const css = readFileSync(CSS_PATH, "utf8");

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function listFiles(directory: string): string[] {
  const entries: string[] = [];
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) entries.push(...listFiles(path));
    else entries.push(path);
  }
  return entries;
}

/** Every selector list in the sheet, comment-stripped, as written. */
function selectors(source: string): string[] {
  const stripped = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const found: string[] = [];
  for (const match of stripped.matchAll(/(?:^|[{};])\s*([^{};]+?)\s*\{/g)) {
    const selector = match[1]?.trim();
    if (selector !== undefined && selector !== "" && !selector.startsWith("@")) found.push(selector);
  }
  return found;
}

const SCOPED = [
  /^([a-z]+)?\.dg-/u,
  /^html\[data-site="digital"\]/u,
  /^:where\(html\[data-site="digital"\]/u,
  /^\[dir="rtl"\] \.dg-/u,
  /^(from|to|\d+%(,\s*\d+%)*)$/u,
];

describe("SIRA Digital document gates", () => {
  it("scopes every selector to the Digital document", () => {
    for (const list of selectors(css)) {
      for (const part of list.split(",").map((item) => item.trim())) {
        expect(
          SCOPED.some((pattern) => pattern.test(part)),
          `unscoped selector: ${part}`,
        ).toBe(true);
      }
    }
  });

  it("switches every animation and transition off under reduced motion", () => {
    const index = css.indexOf("@media (prefers-reduced-motion: reduce)");
    expect(index).toBeGreaterThan(-1);
    const block = css.slice(index);
    expect(block).toContain("animation-duration: 0.001ms !important");
    expect(block).toContain("transition-duration: 0.001ms !important");
    expect(block).toMatch(/\.dg-route__token \{\s*display: none;/u);
  });

  it("gates scroll-driven effects behind support and motion preference", () => {
    const gated = css.match(/@supports \(animation-timeline: (view|scroll)\(\)\) \{\s*@media \(prefers-reduced-motion: no-preference\)/gu) ?? [];
    expect(gated.length).toBeGreaterThanOrEqual(1);
    // No scroll-driven timeline outside such a gate: every use is inside one.
    const uses = css.match(/animation-timeline: (view|scroll)\(/gu) ?? [];
    expect(uses.length).toBeGreaterThan(0);
    for (const match of css.matchAll(/animation-timeline: (view|scroll)\(/gu)) {
      const before = css.slice(0, match.index);
      // The condition of an @supports rule is not a use.
      if (before.endsWith("@supports (")) continue;
      const lastSupports = before.lastIndexOf("@supports (animation-timeline");
      const lastMotion = before.lastIndexOf("@media (prefers-reduced-motion: no-preference)");
      expect(lastSupports, "scroll-driven animation outside @supports").toBeGreaterThan(-1);
      expect(lastMotion, "scroll-driven animation outside a motion gate").toBeGreaterThan(lastSupports);
    }
  });

  it("keeps hover affordances hover-only", () => {
    for (const match of css.matchAll(/:hover/gu)) {
      const before = css.slice(0, match.index);
      const open = before.lastIndexOf("@media (hover: hover)");
      const close = before.lastIndexOf("\n}\n");
      expect(open, `:hover outside @media (hover: hover) at ${match.index}`).toBeGreaterThan(close);
    }
  });

  it("styles keyboard focus and neutralises Latin tracking for Arabic", () => {
    expect(css).toContain(":focus-visible {");
    expect(css).toMatch(/html\[data-site="digital"\]:lang\(ar\) :not\(:lang\(en\)\) \{\s*letter-spacing: 0 !important;/u);
    expect(css).toContain("html[data-site=\"digital\"]:lang(ar) .dg-display");
    expect(css).toContain("lining-nums tabular-nums");
  });

  it("keeps the document-state colours for markers, never for running text", () => {
    // Pending, approved and rejected fill markers and chips; text in those
    // states uses the contrast-checked *-fg tokens instead.
    for (const match of css.matchAll(/^\s*color: var\(--dg-(pending|approved|rejected)\);/gmu)) {
      expect.fail(`a state colour used as a text colour at ${match.index}`);
    }
  });

  it("loads its type through next/font, in its own module", () => {
    const fonts = read(join("src", "styles", "digital-fonts.ts"));
    expect(fonts).toContain('from "next/font/google"');
    expect(fonts).toContain("IBM_Plex_Sans,");
    expect(fonts).toContain("IBM_Plex_Sans_Arabic");
    expect(fonts).toContain('subsets: ["arabic"]');
    expect(fonts).not.toContain("fonts.googleapis.com");
    // The shared font module is not the place for Digital's type.
    expect(read(join("src", "styles", "fonts.ts"))).not.toContain("Plex");
  });

  it("branches the root layout and the homepage before any CMS query", () => {
    const layout = read(join(APP, "layout.tsx"));
    const guard = layout.indexOf('if (site.key === "digital") {', layout.indexOf("export default"));
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(layout.indexOf("getBrand(site.key, request.locale)"));
    expect(guard).toBeLessThan(layout.indexOf("getNavigationForLocale("));
    expect(layout).toContain('import("@/components/digital-site/document")');
    // The Atlas shell keeps the strings the existing tests pin.
    expect(layout).toContain("layout={footerLayout}");

    const page = read(join(APP, "page.tsx"));
    const pageGuard = page.indexOf('if (site.key === "digital") {');
    expect(pageGuard).toBeGreaterThan(-1);
    expect(pageGuard).toBeLessThan(page.indexOf("getHomepageForRequest(site.key"));
    expect(page).toContain("<DigitalHome");
  });

  it("renders its own pages on the routes it serves", () => {
    for (const route of ["services", "contact", "about", "industries", "[section]"]) {
      const source = read(join(APP, route, "page.tsx"));
      expect(source, route).toContain("resolveDigital(");
      expect(source, route).toContain("buildDigitalMetadata(");
    }
    expect(read(join(APP, "not-found.tsx"))).toContain("<DigitalNotFoundPage");
    // Digital-only pages come from the registry before the CMS is asked.
    const section = read(join(APP, "[section]", "page.tsx"));
    expect(section).toContain("digitalSectionPage(slug)");
    expect(section.indexOf("digitalSectionPage(slug)")).toBeLessThan(section.indexOf("getContentPageForLocale(site.key"));
  });

  it("answers 404 on the routes it does not have", () => {
    for (const route of ["work", join("industries", "[slug]"), "news", join("[section]", "[slug]")]) {
      const source = read(join(APP, route, "page.tsx"));
      expect(source, route).toContain("notFoundOnDigital(");
    }
    // Atlas-only routes already refuse non-Atlas tenants at the resolver.
    expect(read(join("src", "lib", "atlas", "page-context.ts"))).toContain("!isAtlasTenant(site.key)) notFound()");
  });

  it("limits client JavaScript to the three islands that need it", () => {
    const root = join("src", "components", "digital-site");
    const clients = listFiles(root)
      .filter((path) => read(path).startsWith('"use client";'))
      .map((path) => path.slice(root.length + 1).replace(/\\/gu, "/"))
      .sort();

    expect(clients).toEqual(["discovery-composer.tsx", "tabs.tsx", "workflow-simulator.tsx"]);

    for (const path of listFiles(root)) {
      const source = read(path);
      if (source.startsWith('"use client";')) continue;
      expect(source, path).not.toContain("useEffect");
      expect(source, path).not.toContain("useState");
    }
  });

  it("gives the looping hero motion a pause control that needs no script (WCAG 2.2.2)", () => {
    const map = read(join("src", "components", "digital-site", "route-map.tsx"));
    expect(map).toContain('type="checkbox" className="dg-motion__input"');
    expect(css).toContain(".dg-hero:has(.dg-motion__input:checked) .dg-route__token {");
    expect(css).toMatch(/\.dg-hero:has\(\.dg-motion__input:checked\) \.dg-route__token \{\s*animation-play-state: paused;/u);
  });

  it("labels every illustrative demonstration as such, where it is rendered", () => {
    for (const file of ["dashboard.tsx", "workflow-simulator.tsx"]) {
      const source = read(join("src", "components", "digital-site", file));
      expect(source, file).toContain('<p className="dg-illustrative">{illustrative}</p>');
    }
    const home = read(join("src", "components", "digital-site", "sections", "home.tsx"));
    expect(home.match(/illustrative=\{content\.common\.illustrative\}/gu)?.length).toBe(2);
    expect(read(join("src", "components", "digital-site", "dashboard.tsx"))).toContain("{content.stamp}");
  });

  it("lists exactly the Digital registry in Digital's sitemap", () => {
    const sitemap = read(join("src", "app", "sitemap.ts"));
    const branch = sitemap.indexOf('if (resolution.site.key === "digital")');
    expect(branch).toBeGreaterThan(-1);
    expect(branch).toBeLessThan(sitemap.indexOf('{ path: "/news/" }'));
    expect(sitemap).toContain("Object.values(DIGITAL_ROUTES)");
  });
});
