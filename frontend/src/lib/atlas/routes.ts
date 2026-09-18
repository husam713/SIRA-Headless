import type { SiteKey } from "@/types/site";

// Which routes open on photography under the overlay header (Atlas direction).
//
// SIRA Digital keeps its own compositions and its own paper-first pages
// (ADR-033); the newsroom keeps the register design it already has. Everything
// else in this list is an Atlas page and carries its own hero image.

const PHOTOGRAPH_PREFIXES: readonly string[] = Object.freeze([
  "/projects",
  "/services",
  "/investors",
  "/contact",
]);

export function isAtlasTenant(siteKey: SiteKey): boolean {
  return siteKey !== "digital";
}

export function isAtlasPhotographRoute(siteKey: SiteKey, path: string): boolean {
  if (!isAtlasTenant(siteKey)) return false;

  return PHOTOGRAPH_PREFIXES.some(
    (prefix) => path === prefix || path === `${prefix}/` || path.startsWith(`${prefix}/`),
  );
}
