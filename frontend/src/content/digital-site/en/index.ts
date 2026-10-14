import { CATALOGUE_EN } from "@/content/digital-site/en/catalogue";
import { COMMON_EN } from "@/content/digital-site/en/common";
import { DEMOS_EN } from "@/content/digital-site/en/demos";
import { PAGES_EN } from "@/content/digital-site/en/pages";
import type { DigitalSiteContent } from "@/content/digital-site/types";

/**
 * SIRA Digital — English, assembled.
 *
 * Written as the company's own voice: plain, specific about the work, and
 * silent about anything the owner has not supplied. Edit the part files —
 * `common.ts` (chrome), `catalogue.ts` (shared lists), `demos.ts`
 * (demonstration labels), `pages.ts` (page narratives) — not this one.
 */
export const DIGITAL_SITE_EN: DigitalSiteContent = {
  locale: "en",
  ...COMMON_EN,
  ...CATALOGUE_EN,
  ...DEMOS_EN,
  ...PAGES_EN,
};
