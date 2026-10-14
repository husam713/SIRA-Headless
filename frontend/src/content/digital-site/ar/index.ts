import { CATALOGUE_AR } from "@/content/digital-site/ar/catalogue";
import { COMMON_AR } from "@/content/digital-site/ar/common";
import { DEMOS_AR } from "@/content/digital-site/ar/demos";
import { PAGES_AR } from "@/content/digital-site/ar/pages";
import type { DigitalSiteContent } from "@/content/digital-site/types";

/**
 * سيرة الرقمية — العربية، مجمّعة.
 *
 * Edit the part files (`common.ts`, `catalogue.ts`, `demos.ts`, `pages.ts`),
 * not this one. Same shape as the English edition by construction.
 */
export const DIGITAL_SITE_AR: DigitalSiteContent = {
  locale: "ar",
  ...COMMON_AR,
  ...CATALOGUE_AR,
  ...DEMOS_AR,
  ...PAGES_AR,
};
