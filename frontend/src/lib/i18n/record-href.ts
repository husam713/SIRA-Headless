import { LOCALE_PREFIX } from "@/lib/i18n/locale";
import type { LocaleCode, SiteDefinition } from "@/types/site";

/**
 * Where a CMS record's page is, given the URI WordPress reports for it.
 *
 * ADR-034 stores a translation as its own record in the same site. A custom
 * post type has one archive slug, so the Arabic copy of `/projects/sira-prime/`
 * is `/projects/ar-sira-prime/` in WordPress — a slug the public site never
 * shows. Its page is `/ar/projects/sira-prime/`: the locale moves from the slug
 * to the path prefix, and the slug is the same in both languages so the language
 * switch lands on the same project.
 *
 * Pages are not prefixed this way: an Arabic page hangs under the `/ar/` page
 * and WordPress already reports `/ar/our-services/`, which is left alone. Only
 * a last segment carrying a locale prefix is rewritten, so an English record
 * or an unrelated slug passes through unchanged.
 */
const RECORD_SLUG_PREFIX = /^([a-z]{2})-(.+)$/u;

export function recordHrefLocale(uri: string): LocaleCode | null {
  const segments = uri.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const match = last === undefined ? null : RECORD_SLUG_PREFIX.exec(last);

  if (match === null) return null;

  const code = match[1];
  return code !== undefined && Object.hasOwn(LOCALE_PREFIX, code) ? LOCALE_PREFIX[code] ?? null : null;
}

export function publicRecordHref(uri: string, locale: LocaleCode | null = null): string {
  // Where the record's language is known from its field, an English record
  // whose slug happens to begin `ar-` (a name, a place) stays where it is.
  if (locale !== null && locale !== "ar") return uri;

  const segments = uri.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const match = last === undefined ? null : RECORD_SLUG_PREFIX.exec(last);
  const code = match?.[1];

  if (match === null || code === undefined || !Object.hasOwn(LOCALE_PREFIX, code)) {
    return uri;
  }

  // Only a non-default locale is prefixed; `en-…` is not a convention in use,
  // and a default-locale prefix would produce a path the proxy does not serve.
  if (code === "en") return uri;

  const neutral = [...segments.slice(0, -1), match[2]].join("/");
  return `/${code}/${neutral}/`;
}

/**
 * The WordPress URI to try first for a locale's copy of a record, then the
 * default-locale URI. A missing translation falls back to the original
 * rather than to a 404 — the same rule `getContentPageForLocale` applies to
 * pages.
 */
export function recordUrisForLocale(
  site: SiteDefinition,
  locale: LocaleCode,
  uri: string,
): readonly string[] {
  if (locale === site.defaultLocale) return [uri];

  const segments = uri.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (last === undefined) return [uri];

  const localized = `/${[...segments.slice(0, -1), `${locale}-${last}`].join("/")}/`;
  return [localized, uri];
}
