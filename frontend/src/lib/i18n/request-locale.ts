import "server-only";

import { headers } from "next/headers";
import { LOCALE_HEADER, PATH_HEADER, resolveLocale } from "@/lib/i18n/locale";
import type { LocaleCode, SiteDefinition } from "@/types/site";

/**
 * What the proxy decided about this request's language and path.
 *
 * Both answers arrive as headers the proxy strips from the inbound request
 * before setting, so neither can be chosen by the client. Anything malformed
 * falls back rather than throwing: a bad header should not be able to blank a
 * page. Nothing here is request-cached because `headers()` already is.
 */

export interface RequestLocale {
  readonly locale: LocaleCode;
  readonly path: string;
  /** The other language this site offers, or null when it offers only one. */
  readonly alternate: LocaleCode | null;
}

export async function getRequestLocale(
  site: SiteDefinition,
): Promise<RequestLocale> {
  const requestHeaders = await headers();
  const locale = resolveLocale(site, requestHeaders.get(LOCALE_HEADER));
  const rawPath = requestHeaders.get(PATH_HEADER);
  const path =
    rawPath !== null && rawPath.startsWith("/") ? rawPath.split("?")[0] ?? "/" : "/";

  return {
    locale,
    path,
    // Only offered where the other language is an approved route. A switch
    // that leads to a 404 is worse than no switch.
    alternate: site.localeRoutesApproved
      ? (site.supportedLocales.find((code) => code !== locale) ?? null)
      : null,
  };
}
