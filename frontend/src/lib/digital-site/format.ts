import type { LocaleCode } from "@/types/site";

/**
 * Numbers in the Digital document. Both editions use Latin digits (ADR-034),
 * so Arabic asks for the `latn` numbering system explicitly instead of
 * relying on the runtime's default for `ar`.
 */
function numberLocale(locale: LocaleCode): string {
  return locale === "ar" ? "ar-SA-u-nu-latn" : "en-SA";
}

export function formatNumber(locale: LocaleCode, value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(numberLocale(locale), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** An amount with the narrative's currency label, ordered for the language. */
export function formatAmount(locale: LocaleCode, value: number, currency: string): string {
  const number = formatNumber(locale, value);
  return locale === "ar" ? `${number} ${currency}` : `${currency} ${number}`;
}

/** A percentage given as a number of percent (31.4 → "31.4%"), Latin digits. */
export function formatPercent(locale: LocaleCode, percent: number, fractionDigits = 1): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-SA", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(percent / 100);
}
