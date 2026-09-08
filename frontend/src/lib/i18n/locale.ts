import type { LocaleCode, SiteDefinition } from "@/types/site";

/**
 * How a request's language is decided, and how it travels.
 *
 * The URL owns the locale: `/ar/services` is Arabic, `/services` is the site's
 * default. That is the only signal — not a cookie, not Accept-Language, not a
 * stored preference — because a language a reader cannot link to, share or
 * bookmark is not a first-class language, and because a page that changes
 * language based on a header cannot be cached or indexed per locale.
 *
 * The proxy strips the prefix from the internal path and puts the resolved
 * locale in a request header instead, so every route is bilingual without the
 * route tree being duplicated under `/ar`. That header is stripped from inbound
 * requests before it is set, so a client cannot choose it by sending it.
 */

export const LOCALE_HEADER = "x-sira-locale";

/**
 * The request path with both prefixes removed — the site key the proxy adds and
 * the locale the proxy consumes.
 *
 * Set by the proxy because a Server Component cannot otherwise learn the path
 * it is rendering, and the language switch has to point at the same page in the
 * other language rather than at the homepage.
 */
export const PATH_HEADER = "x-sira-path";

/** Prefix segments that select a non-default locale. */
export const LOCALE_PREFIX: Readonly<Record<string, LocaleCode>> = Object.freeze({
  ar: "ar",
  en: "en",
});

export function isLocaleCode(value: string): value is LocaleCode {
  return value === "en" || value === "ar";
}

/**
 * Splits a public path into its locale and the rest.
 *
 * `/ar/services` becomes `{ locale: "ar", path: "/services" }`; `/services`
 * becomes `{ locale: null, path: "/services" }`. A bare `/ar` keeps `/` as its
 * path so the Arabic homepage is not a 404.
 */
export function splitLocalePath(pathname: string): {
  readonly locale: LocaleCode | null;
  readonly path: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first === undefined || !Object.hasOwn(LOCALE_PREFIX, first)) {
    return { locale: null, path: pathname };
  }

  const rest = segments.slice(1).join("/");

  return {
    locale: LOCALE_PREFIX[first] ?? null,
    path: rest === "" ? "/" : `/${rest}`,
  };
}

/** The locale a request resolved to, given what the proxy put in the header. */
export function resolveLocale(
  site: SiteDefinition,
  headerValue: string | null,
): LocaleCode {
  if (
    headerValue !== null &&
    isLocaleCode(headerValue) &&
    site.localeRoutesApproved &&
    site.supportedLocales.includes(headerValue)
  ) {
    return headerValue;
  }

  return site.defaultLocale;
}

/** A public href for this locale. The default locale carries no prefix. */
export function localeHref(
  site: SiteDefinition,
  locale: LocaleCode,
  path: string,
): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (locale === site.defaultLocale) return normalized;

  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

/**
 * Where this locale's copy of a CMS record lives.
 *
 * ADR-034: a locale is a slug prefix inside the SAME WordPress site rather than
 * a second site or a translation plugin. One company, one editorial team, one
 * media library, and an Arabic page is an ordinary page an editor can find in
 * the admin — with no network-wide plugin decision imposed on the five tenants
 * that did not ask for one.
 */
export function localeUri(locale: LocaleCode, site: SiteDefinition, uri: string): string {
  const normalized = uri.startsWith("/") ? uri : `/${uri}`;

  if (locale === site.defaultLocale) return normalized;

  return normalized === "/" ? `/${locale}/` : `/${locale}${normalized}`;
}

/** BCP-47 tag for Intl formatting. Saudi Arabic, not generic Arabic. */
export function intlLocale(locale: LocaleCode): string {
  return locale === "ar" ? "ar-SA" : "en-SA";
}

interface Chrome {
  readonly skipToContent: string;
  readonly switchLanguage: string;
  readonly switchLanguageShort: string;
  readonly switchLanguageHint: string;
  readonly contactCta: string;
  readonly primaryNav: string;
  readonly siteNav: string;
  readonly siteMenu: string;
  readonly openMenu: string;
  readonly closeMenu: string;
  readonly onThisPage: string;
  /**
   * Column labels on the industries register. They repeat on every row, so no
   * single row owns them editorially and they cannot come from a term's own
   * fields — which is the test for whether a string belongs in here at all.
   */
  readonly bottleneckLabel: string;
  readonly opportunityLabel: string;
  readonly previewMode: string;
  readonly exitPreview: string;
}

/**
 * Interface strings the shell renders itself.
 *
 * Deliberately small. Everything a reader is here to read comes from the CMS;
 * this is only the furniture that has no editorial owner — a menu button's
 * accessible name, the skip link, the language switch. Growing this object is a
 * signal that something should have been content instead.
 */
export const CHROME: Readonly<Record<LocaleCode, Chrome>> = Object.freeze({
  en: Object.freeze({
    skipToContent: "Skip to main content",
    switchLanguage: "العربية",
    switchLanguageShort: "AR",
    switchLanguageHint: "اعرض هذه الصفحة بالعربية",
    contactCta: "Contact Us",
    primaryNav: "Primary",
    siteNav: "Site",
    siteMenu: "Site menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    onThisPage: "On this page",
    bottleneckLabel: "Where the time goes",
    opportunityLabel: "What can be done",
    previewMode: "Preview Mode",
    exitPreview: "Exit Preview",
  }),
  ar: Object.freeze({
    skipToContent: "تخطَّ إلى المحتوى الرئيسي",
    switchLanguage: "English",
    switchLanguageShort: "EN",
    switchLanguageHint: "View this page in English",
    contactCta: "تواصل معنا",
    primaryNav: "الرئيسية",
    siteNav: "الموقع",
    siteMenu: "قائمة الموقع",
    openMenu: "افتح القائمة",
    closeMenu: "أغلق القائمة",
    onThisPage: "في هذه الصفحة",
    bottleneckLabel: "أين يضيع الوقت",
    opportunityLabel: "ما الذي يمكن عمله",
    previewMode: "وضع المعاينة",
    exitPreview: "إنهاء المعاينة",
  }),
});
