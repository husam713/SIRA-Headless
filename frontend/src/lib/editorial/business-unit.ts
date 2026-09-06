import "server-only";

import type { EditorialBusinessUnitSlug } from "@/lib/editorial/types";
import type { SiteKey } from "@/types/site";

export type { EditorialBusinessUnitSlug };

const EDITORIAL_BUSINESS_UNIT_BY_SITE = Object.freeze({
  group: null,
  consulting: "consulting",
  healthcare: "healthcare",
  lifestyle: "lifestyle",
  realestate: "real-estate",
} as const satisfies Readonly<
  Record<SiteKey, EditorialBusinessUnitSlug | null>
>);

export function getEditorialBusinessUnit(
  siteKey: SiteKey,
): EditorialBusinessUnitSlug | null {
  return EDITORIAL_BUSINESS_UNIT_BY_SITE[siteKey];
}
