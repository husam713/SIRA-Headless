import "server-only";

import { notFound } from "next/navigation";
import { getContentPageForLocale, type ContentPage } from "@/lib/content/get-content-page";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { localeUri } from "@/lib/i18n/locale";
import {
  getRequestLocale,
  type RequestLocale,
} from "@/lib/i18n/request-locale";
import type { SiteDefinition } from "@/types/site";

/**
 * The three things every index route needs before it can render: which tenant,
 * which language, and the CMS page carrying that route's heading block.
 *
 * Written once because the four index routes were otherwise going to repeat the
 * same eight lines, and because getting the URI pair wrong — localized first,
 * default as fallback — is the kind of mistake that only shows up in the second
 * language.
 */
export interface ContentRouteContext {
  readonly site: SiteDefinition;
  readonly request: RequestLocale;
  readonly page: ContentPage | null;
}

/**
 * `alongside` runs the route's own index query in parallel with the page
 * query. Both only need the tenant and the locale, which are known before
 * either fetch starts, so the second round trip no longer waits for the first.
 * On a warm Data Cache this is moot; on a cold instance it is the difference
 * between one and two origin latencies before the page can render.
 */
export async function resolveContentRoute<TExtra = undefined>(
  params: Promise<{ readonly siteKey: string }>,
  path: string,
  alongside?: (site: SiteDefinition, request: RequestLocale) => Promise<TExtra>,
): Promise<ContentRouteContext & { readonly extra: TExtra }> {
  const { siteKey } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null) notFound();

  const request = await getRequestLocale(site);
  const [page, extra] = await Promise.all([
    getContentPageForLocale(site.key, localeUri(request.locale, site, path), path),
    alongside === undefined
      ? Promise.resolve(undefined as TExtra)
      : alongside(site, request),
  ]);

  return { site, request, page, extra };
}
