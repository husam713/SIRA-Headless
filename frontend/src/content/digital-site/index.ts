import { DIGITAL_SITE_AR } from "@/content/digital-site/ar";
import { DIGITAL_SITE_EN } from "@/content/digital-site/en";
import type { DigitalSiteContent } from "@/content/digital-site/types";
import type { LocaleCode } from "@/types/site";

export type * from "@/content/digital-site/types";

const CONTENT: Readonly<Record<LocaleCode, DigitalSiteContent>> = Object.freeze({
  en: DIGITAL_SITE_EN,
  ar: DIGITAL_SITE_AR,
});

/** The whole narrative for one language. Never partial, never mixed. */
export function getDigitalSiteContent(locale: LocaleCode): DigitalSiteContent {
  return CONTENT[locale];
}
