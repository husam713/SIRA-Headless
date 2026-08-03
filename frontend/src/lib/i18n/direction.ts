import type { LocaleCode } from "@/types/site";

export type TextDirection = "ltr" | "rtl";

export function getTextDirection(locale: LocaleCode): TextDirection {
  return locale === "ar" ? "rtl" : "ltr";
}
