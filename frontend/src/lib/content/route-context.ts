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

export async function resolveContentRoute(
  params: Promise<{ readonly siteKey: string }>,
  path: string,
): Promise<ContentRouteContext> {
  const { siteKey } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null) notFound();

  const request = await getRequestLocale(site);
  const page = await getContentPageForLocale(
    site.key,
    localeUri(request.locale, site, path),
    path,
  );

  return { site, request, page };
}
