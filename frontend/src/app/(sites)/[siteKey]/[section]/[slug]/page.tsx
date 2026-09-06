import type { Metadata } from "next";
import { draftMode, headers } from "next/headers";
import { notFound } from "next/navigation";

import { ArticlePage } from "@/components/editorial/article-page";
import { getBrand } from "@/lib/brand";
import { getEditorialFeed } from "@/lib/editorial";
import { primaryDesk } from "@/lib/editorial/desks";
import { toEntryViews, type EntryView } from "@/lib/editorial/entry-view";
import { getEditorialSingle } from "@/lib/editorial/get-editorial-single";
import { EDITORIAL_SECTIONS } from "@/lib/editorial/routes";
import type { EditorialArticle } from "@/lib/editorial/editorial-single-types";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import type { SiteKey } from "@/types/site";

// Editorial permalinks keep the bases WordPress owns — /news/, /insights/,
// /articles/ and /press-releases/ — rather than being folded under one
// invented prefix. That means item.href from the feed is directly usable, and
// nothing has to rewrite a URL the CMS already published.
//
// One dynamic segment serves all four instead of four near-identical route
// files. The static /news archive sits at the same level and wins over this
// route by Next.js precedence, so /news lists and /news/<slug> reads.

// WordPress slugs are lowercase alphanumerics and hyphens. Anything else is a
// probe rather than a permalink, and is refused before it reaches the CMS.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// How many entries the closing strip carries, and how wide a window to read
// them out of. The window is the same cached feed call the newsroom makes, so
// an article page costs one extra GraphQL query at most and usually none.
const RELATED_COUNT = 3;
const RELATED_WINDOW = 24;

interface ArticleRouteProps {
  readonly params: Promise<{
    readonly siteKey: string;
    readonly section: string;
    readonly slug: string;
  }>;
}

/**
 * The WordPress URI for a section and slug, or null when either is not
 * something this route serves.
 */
function resolveUri(section: string, slug: string): string | null {
  if (!EDITORIAL_SECTIONS.includes(section)) return null;
  if (!SLUG.test(slug) || slug.length > 200) return null;
  return `/${section}/${slug}/`;
}

export async function generateMetadata({
  params,
}: ArticleRouteProps): Promise<Metadata> {
  const { siteKey, section, slug } = await params;
  const site = getSiteDefinition(siteKey);
  const uri = resolveUri(section, slug);

  if (site === null || uri === null) {
    notFound();
  }

  const [brand, requestHeaders, draft, resolution] = await Promise.all([
    getBrand(site.key),
    headers(),
    draftMode(),
    getEditorialSingle(site.key, uri),
  ]);

  const discovery = resolveSiteDiscoveryContext(
    site.key,
    requestHeaders.get("host") ?? "",
  );
  const base = buildSiteMetadata(discovery, brand, uri, {
    forceNoIndex: draft.isEnabled,
  });

  if (resolution.status !== "ready") return base;

  return {
    ...base,
    title: `${resolution.article.title} — ${brand.name}`,
    ...(resolution.article.excerpt !== null
      ? { description: resolution.article.excerpt }
      : {}),
  };
}

/**
 * Other entries from the same desk, newest first.
 *
 * Same desk rather than same content type, because the useful next thing after
 * reading about one SIRA company is usually another entry from that company,
 * not another press release from somewhere else in the group. A quiet failure
 * is correct here: the strip is an addition to the article, and an unreachable
 * feed must not take the article down with it.
 */
async function resolveAlsoInTheRecord(
  siteKey: SiteKey,
  article: EditorialArticle,
): Promise<readonly EntryView[]> {
  const feed = await getEditorialFeed(siteKey, RELATED_WINDOW);

  if (feed.status !== "ready") return [];

  const desk = primaryDesk(article);

  return toEntryViews(
    feed.page.items
      .filter(
        (item) =>
          item.databaseId !== article.databaseId && item.desks.includes(desk),
      )
      .slice(0, RELATED_COUNT),
  );
}

export default async function EditorialArticleRoute({
  params,
}: ArticleRouteProps) {
  const { siteKey, section, slug } = await params;
  const site = getSiteDefinition(siteKey);
  const uri = resolveUri(section, slug);

  if (site === null || uri === null) {
    notFound();
  }

  const resolution = await getEditorialSingle(site.key, uri);

  if (resolution.status === "not-found") {
    notFound();
  }

  if (resolution.status !== "ready") {
    // A restricted, malformed or unreachable item is not "no such page". Saying
    // 404 would tell a reader the article does not exist when it may simply be
    // unavailable, so this throws and the route's error boundary handles it.
    throw new Error(
      `Editorial item at ${section}/${slug} could not be rendered: ${
        resolution.status === "invalid" ? resolution.reason : resolution.errorName
      }`,
    );
  }

  const alsoInTheRecord = await resolveAlsoInTheRecord(
    site.key,
    resolution.article,
  );

  return (
    <ArticlePage
      article={resolution.article}
      alsoInTheRecord={alsoInTheRecord}
    />
  );
}
