import { notFound } from "next/navigation";

import type { DigitalPageKey } from "@/content/digital-site/types";

/**
 * The SIRA Digital route registry — one list that the router branches, the
 * sitemap and the tests all read, so a page cannot exist in one and be
 * missing from another.
 *
 * Pages with a static segment of their own in the shared route tree
 * (`/services/`, `/industries/`, `/about/`, `/contact/`) branch inside that
 * segment. Pages that only Digital has (`/erpnext/`, `/automation/`,
 * `/method/`) are served by the generic `[section]` route from this
 * registry, before it would ask the CMS for a page of that slug — so adding
 * one never touches the route tree the other five tenants share.
 */
export const DIGITAL_ROUTES: Readonly<Record<DigitalPageKey, string>> = Object.freeze({
  home: "/",
  services: "/services/",
  erpnext: "/erpnext/",
  automation: "/automation/",
  industries: "/industries/",
  method: "/method/",
  about: "/about/",
  contact: "/contact/",
});

/** The `[section]` slugs the repository narrative owns. */
export const DIGITAL_SECTION_PAGES = Object.freeze({
  erpnext: "erpnext",
  automation: "automation",
  method: "method",
} as const satisfies Record<string, DigitalPageKey>);

export type DigitalSectionSlug = keyof typeof DIGITAL_SECTION_PAGES;

export function digitalSectionPage(slug: string): DigitalSectionSlug | null {
  return Object.hasOwn(DIGITAL_SECTION_PAGES, slug) ? (slug as DigitalSectionSlug) : null;
}

/** CMS prose pages Digital renders in its own voice (they must exist in WordPress). */
export const DIGITAL_PROSE_PATHS = Object.freeze(["/privacy/", "/terms/"] as const);

/** Every locale-less path the Digital site serves from the repository. */
export const DIGITAL_SERVED_PATHS: readonly string[] = Object.freeze([
  ...Object.values(DIGITAL_ROUTES),
  ...DIGITAL_PROSE_PATHS,
]);

/**
 * The routes SIRA Digital does not have.
 *
 * The CMS compositions of the ADR-033 surface (`/work`, industry detail
 * pages) and the shared newsroom exist for the other tenants; on Digital
 * they would render placeholder records inside a document designed to carry
 * none. A 404 is the honest answer until the owner supplies that content.
 */
export function notFoundOnDigital(siteKey: string | null | undefined): void {
  if (siteKey === "digital") notFound();
}
