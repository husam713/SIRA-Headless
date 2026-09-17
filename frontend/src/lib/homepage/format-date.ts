import type { LocaleCode } from "@/types/site";

/**
 * Shared with GroupLatestUpdates and GroupInsights — both render the same
 * "MON YYYY" editorial date format for HomepageContentItem.date.
 */
export function formatContentDate(
  value: string | null,
  locale: LocaleCode = "en",
): string | null {
  if (value === null) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Latin numerals in both languages (ADR-034): one numeral system per page.
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en", {
    month: "short",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}
