import type { Metadata } from "next";
import { draftMode, headers } from "next/headers";
import { notFound } from "next/navigation";

import { NewsroomPage as NewsroomPageView } from "@/components/newsroom/newsroom-page";
import { getBrand } from "@/lib/brand";
import { getEditorialFeed } from "@/lib/editorial";
import { resolveDeskFilter } from "@/lib/editorial/desks";
import { resolveKindFilter } from "@/lib/editorial/record";
import type { EditorialItem } from "@/lib/editorial/types";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

// The route resolves the tenant, its brand and its feed. Everything about what
// the page then is lives in the shared NewsroomPage component (ADR-020: one
// reusable newsroom implementation, instantiated per tenant), which is also
// what the preview harness renders — so the harness cannot drift from the site.
//
// `getEditorialFeed` already narrows a branch site's feed to its own business
// unit and leaves the Group feed unfiltered, so SIRA GROUP gets the whole
// network's record and each company gets its own desk without a second route
// or a second query.

// The feed resolver caps a page at 50. The record is deliberately one bounded
// window rather than a cursor-paginated archive: the filters are applied over
// what was loaded, and a window is what keeps the index counts and the entries
// beneath them describing the same set of entries.
const PAGE_SIZE = 50;

interface NewsroomRouteProps {
  readonly params: Promise<{ readonly siteKey: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: Pick<NewsroomRouteProps, "params">): Promise<Metadata> {
  const { siteKey } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null) {
    notFound();
  }

  const [brand, requestHeaders, draft] = await Promise.all([
    getBrand(site.key),
    headers(),
    draftMode(),
  ]);

  const discovery = resolveSiteDiscoveryContext(
    site.key,
    requestHeaders.get("host") ?? "",
  );

  return {
    // The filtered views are the same record in a different order, so they
    // canonicalise to /news rather than competing with it. buildSiteMetadata
    // derives the canonical from the pathname it is given.
    ...buildSiteMetadata(discovery, brand, "/news", {
      forceNoIndex: draft.isEnabled,
    }),
    title: `Newsroom — ${brand.name}`,
  };
}

export default async function NewsroomRoute({
  params,
  searchParams,
}: NewsroomRouteProps) {
  const [{ siteKey }, query] = await Promise.all([params, searchParams]);
  const site = getSiteDefinition(siteKey);

  if (site === null) {
    notFound();
  }

  const [brand, feed, requestHeaders] = await Promise.all([
    getBrand(site.key),
    getEditorialFeed(site.key, PAGE_SIZE),
    headers(),
  ]);

  const discovery = resolveSiteDiscoveryContext(
    site.key,
    requestHeaders.get("host") ?? "",
  );

  const items: readonly EditorialItem[] =
    feed.status === "ready" ? feed.page.items : [];

  return (
    <NewsroomPageView
      siteKey={site.key}
      brandName={brand.name}
      items={items}
      desk={resolveDeskFilter(query["desk"])}
      kind={resolveKindFilter(query["kind"])}
      isFailure={feed.status === "invalid" || feed.status === "remote-error"}
      isProductionCanonical={discovery.isProductionCanonical}
    />
  );
}
