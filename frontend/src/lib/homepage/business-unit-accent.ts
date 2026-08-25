import "server-only";

import { getBrandPreset } from "@/lib/brand";
import type { EditorialBusinessUnitSlug } from "@/lib/editorial/business-unit";
import type {
  HomepageBusinessUnit,
  HomepageSelection,
} from "@/lib/homepage/types";
import type { SiteKey } from "@/types/site";

/**
 * The CMS-owned editorial business-unit slug is not the same string as the
 * frontend site-key registry (`real-estate` vs. `realestate`). This is the
 * only place that bridges the two so a Group hero slide's related business
 * unit can borrow that branch's already-approved accent token instead of a
 * new, invented color.
 */
const SITE_KEY_BY_BUSINESS_UNIT_SLUG: Readonly<
  Record<EditorialBusinessUnitSlug, SiteKey>
> = Object.freeze({
  consulting: "consulting",
  healthcare: "healthcare",
  lifestyle: "lifestyle",
  "real-estate": "realestate",
});

function isEditorialBusinessUnitSlug(
  value: string,
): value is EditorialBusinessUnitSlug {
  return Object.hasOwn(SITE_KEY_BY_BUSINESS_UNIT_SLUG, value);
}

export interface BusinessUnitAccent {
  readonly label: string;
  readonly color: string;
}

/**
 * Resolves the approved brand accent color and display label for a Group
 * hero slide's related business unit. Falls back to the supplied default
 * (normally the Group preset) when the relationship is empty, invalid, or
 * points at an unrecognized slug, so missing CMS data degrades gracefully
 * instead of rendering an unstyled or broken tag.
 */
export function resolveBusinessUnitAccent(
  selection: HomepageSelection<HomepageBusinessUnit>,
  fallback: BusinessUnitAccent,
): BusinessUnitAccent {
  const unit = selection.status === "ready" ? selection.items[0] : undefined;

  if (unit === undefined || !isEditorialBusinessUnitSlug(unit.slug)) {
    return fallback;
  }

  const preset = getBrandPreset(SITE_KEY_BY_BUSINESS_UNIT_SLUG[unit.slug]);

  return Object.freeze({ label: preset.name, color: preset.identity.accent });
}
