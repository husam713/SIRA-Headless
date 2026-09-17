import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getEditorialFeed } from "@/lib/editorial/get-editorial-feed";
import { editorialArticleHref } from "@/lib/editorial/routes";
import { resolveSiteFromHostname } from "@/lib/host/resolve-site";
import { isAtlasTenant } from "@/lib/atlas/routes";
import { getProjectArchiveForLocale } from "@/lib/projects";
import { buildSitemap, type SitemapEntryInput } from "@/lib/seo/discovery";

// How much of the archive the sitemap lists: the feed's own page size, up to
// this many pages through its cursor. A tenant with more entries than that is
// a tenant whose sitemap should be split into an index, which is a later
// change rather than a bigger number here.
const FEED_PAGE_SIZE = 50;
const FEED_MAX_PAGES = 4;

/**
 * The sitemap used to list the homepage alone. It now lists what this app
 * serves for the tenant: the homepage, the newsroom, and every editorial
 * entry that has a route — per locale where locale routes are approved. The
 * Digital content routes (services, work, industries, about, contact) are
 * omitted on purpose: whether a tenant has them is decided by CMS content at
 * request time, and a sitemap must not advertise a URL that 404s.
 *
 * On the Atlas tenants (Group and the four companies) the archive and every
 * published project are listed from the same query the archive renders, so
 * a project is in the sitemap exactly when it has a page; the contact and
 * services routes are listed because they render for every Atlas tenant
 * with a CMS record behind them, and investor relations on Group alone.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hostname = (await headers()).get("host") ?? "";
  const resolution = resolveSiteFromHostname(hostname);

  if (resolution === null || resolution.hostnameRole !== "canonical") {
    return buildSitemap(hostname);
  }

  const entries: SitemapEntryInput[] = [{ path: "/news/" }];
  let after: string | null = null;

  if (isAtlasTenant(resolution.site.key)) {
    // The default-locale archive: `buildSitemap` lists each path once per
    // approved locale, and a translation is reached at the same slug under
    // its prefix, so listing the translated records too would double them.
    const archive = await getProjectArchiveForLocale(
      resolution.site.key,
      48,
      resolution.site.defaultLocale,
    );

    if (archive.status === "ready") {
      entries.push({ path: "/projects/" });
      for (const item of archive.page.items) {
        entries.push({ path: item.href });
      }
    }

    entries.push({ path: "/contact/" }, { path: "/services/" });
    if (resolution.site.key === "group") entries.push({ path: "/investors/" });
  }

  for (let page = 0; page < FEED_MAX_PAGES; page += 1) {
    const feed = await getEditorialFeed(resolution.site.key, FEED_PAGE_SIZE, after);
    if (feed.status !== "ready") break;

    for (const item of feed.page.items) {
      const href = editorialArticleHref(item.href);
      if (href === null) continue;
      entries.push({ path: href, lastModified: item.modifiedAt ?? item.publishedAt });
    }

    if (!feed.page.pageInfo.hasNextPage || feed.page.pageInfo.endCursor === null) break;
    after = feed.page.pageInfo.endCursor;
  }

  return buildSitemap(hostname, entries);
}
