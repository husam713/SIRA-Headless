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
    expect(block).toMatch(/\.dg-hero__field canvas \{\s*display: none;/u);
  });

  it("gates scroll-driven effects behind support and motion preference", () => {
    const gated = css.match(/@supports \(animation-timeline: (view|scroll)\(\)\) \{\s*@media \(prefers-reduced-motion: no-preference\)/gu) ?? [];
    expect(gated.length).toBeGreaterThanOrEqual(3);
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
    expect(css).toMatch(/html\[data-site="digital"\]:lang\(ar\) :not\(:lang\(en\)\):not\(\.dg-mono\) \{\s*letter-spacing: 0 !important;/u);
    expect(css).toContain("html[data-site=\"digital\"]:lang(ar) .dg-display");
    expect(css).toContain("lining-nums tabular-nums");
  });

  it("reserves the primary colour for lines and surfaces, never small text on paper", () => {
    // The vermilion signal is decorative: it may not be a text colour.
    for (const match of css.matchAll(/^\s*color: var\(--dg-signal\);/gmu)) {
      expect.fail(`--dg-signal used as a text colour at ${match.index}`);
    }
  });

  it("loads its type through next/font, in its own module", () => {
    const fonts = read(join("src", "styles", "digital-fonts.ts"));
    expect(fonts).toContain('from "next/font/google"');
    expect(fonts).toContain("IBM_Plex_Mono");
    expect(fonts).toContain('axes: ["wdth"]');
    expect(fonts).not.toContain("fonts.googleapis.com");
    // The shared font module is not the place for Digital's instruments.
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
    for (const route of ["services", "contact", "about", "[section]"]) {
      const source = read(join(APP, route, "page.tsx"));
      expect(source, route).toContain("resolveDigital(");
      expect(source, route).toContain("buildDigitalMetadata(");
    }
    expect(read(join(APP, "not-found.tsx"))).toContain("<DigitalNotFoundPage");
  });

  it("answers 404 on the routes it does not have", () => {
    for (const route of ["work", "industries", join("industries", "[slug]"), "news", join("[section]", "[slug]")]) {
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

    expect(clients).toEqual(["brief-composer.tsx", "clock.tsx", "field/live-field.tsx"]);

    for (const path of listFiles(root)) {
      const source = read(path);
      if (source.startsWith('"use client";')) continue;
      expect(source, path).not.toContain("useEffect");
      expect(source, path).not.toContain("useState");
    }
  });

  it("keeps the live field honest about when it may run", () => {
    const live = read(join("src", "components", "digital-site", "field", "live-field.tsx"));
    expect(live).toContain('window.matchMedia("(prefers-reduced-motion: reduce)")');
    expect(live).toContain("if (reduced.matches) return;");
    expect(live).toContain("new IntersectionObserver(");
    expect(live).toContain('document.addEventListener("visibilitychange"');
    expect(live).toContain("cancelAnimationFrame(frame)");
    expect(live).toContain('event.pointerType === "touch"');
  });
});
