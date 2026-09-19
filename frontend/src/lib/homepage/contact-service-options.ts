import { getSiteDefinition } from "@/lib/host/resolve-site";
import { CHROME } from "@/lib/i18n/locale";
import { type LocaleCode, SITE_KEYS } from "@/types/site";

import type { HomepageContentSection } from "./types";

// The one place that decides what a "Select Service" control offers, so the
// same rule applies wherever the enquiry form appears (the homepage contact
// section, the standalone /contact page, the investor pack drawer).
//
// Group's site IS the general-enquiry route: a visitor there is choosing
// which company to reach, so the control names the companies. Every other
// tenant's visitor already knows which company they are on; naming the
// other five back at them was the defect this replaces.

/** Group leads with the general-enquiry route, then names every operating company. */
export function groupContactServiceOptions(locale: LocaleCode): readonly string[] {
  return [
    CHROME[locale].generalEnquiry,
    ...SITE_KEYS.filter((key) => key !== "group").flatMap((key) =>
      getSiteDefinition(key) === null ? [] : [CHROME[locale].siteNames[key]],
    ),
  ];
}

/**
 * A tenant's own services, read from the same CMS section its "What We Do"
 * chapter already renders — no second query. Falls back to a single
 * general-enquiry option instead of hiding the control when the section has
 * not resolved, or does not exist at all, as on SIRA Digital's homepage.
 */
export function tenantContactServiceOptions(
  section: HomepageContentSection | null,
  locale: LocaleCode,
): readonly string[] {
  if (
    section !== null &&
    section.selection.status === "ready" &&
    section.selection.items.length > 0
  ) {
    return section.selection.items.map((item) => item.title);
  }

  return [CHROME[locale].generalEnquiry];
}
