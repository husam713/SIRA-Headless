import type { Metadata } from "next";
import { draftMode, headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { NewsroomIndexBar } from "@/components/newsroom/newsroom-index-bar";
import { NewsroomLead } from "@/components/newsroom/newsroom-lead";
import { NewsroomLedger } from "@/components/newsroom/newsroom-ledger";
import { NewsroomMasthead } from "@/components/newsroom/newsroom-masthead";
import { getBrand } from "@/lib/brand";
import { getEditorialFeed } from "@/lib/editorial";
import {
  countByKind,
  editorialKindLabel,
  groupByYear,
  resolveKindFilter,
  yearSpan,
} from "@/lib/editorial/ledger";
import type { EditorialItem } from "@/lib/editorial/types";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

// One page serves every tenant. `getEditorialFeed` already narrows a branch
// site's feed to its own business unit and leaves the Group feed unfiltered, so
// SIRA GROUP gets the whole network's newsroom and each branch gets its own
// desk without a second route or a second query.

const PAGE_SIZE = 40;

interface NewsroomPageProps {
  readonly params: Promise<{ readonly siteKey: string }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: Pick<NewsroomPageProps, "params">): Promise<Metadata> {
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
    // The filtered views are the same archive in a different order, so they
    // canonicalise to /news rather than competing with it. buildSiteMetadata
    // derives the canonical from the pathname it is given.
    ...buildSiteMetadata(discovery, brand, "/news", {
      forceNoIndex: draft.isEnabled,
    }),
    title: `Newsroom — ${brand.name}`,
  };
}

export default async function NewsroomPage({
  params,
  searchParams,
}: NewsroomPageProps) {
  const [{ siteKey }, query] = await Promise.all([params, searchParams]);
  const site = getSiteDefinition(siteKey);

  if (site === null) {
    notFound();
  }

  const [brand, feed] = await Promise.all([
    getBrand(site.key),
    getEditorialFeed(site.key, PAGE_SIZE),
  ]);

  const kind = resolveKindFilter(query["kind"]);
  const all: readonly EditorialItem[] =
    feed.status === "ready" ? feed.page.items : [];
  const items = kind === null ? all : all.filter((item) => item.kind === kind);

  const heading = site.key === "group" ? "News & Insights" : "From the Desk";
  const description =
    site.key === "group"
      ? "Milestones, perspectives and announcements from across SIRA GROUP and its companies."
      : `Announcements and analysis from ${brand.name}, published alongside the wider group newsroom.`;

  return (
    <>
      <NewsroomMasthead
        heading={heading}
        description={description}
        total={all.length}
        span={yearSpan(all)}
        scopeLabel={site.key === "group" ? null : brand.name}
      />

      {/*
        The index bar is rendered whenever the archive has anything in it, even
        under a filter that matches nothing — it is how a reader gets back out
        of an empty view.
      */}
      {all.length > 0 ? (
        <NewsroomIndexBar
          counts={countByKind(all)}
          active={kind}
          total={all.length}
        />
      ) : null}

      {items.length > 0 ? (
        <>
          {/*
            The lead is the newest item of whatever is being shown, so a
            filtered view opens on its own lead rather than repeating the
            unfiltered one.
          */}
          <NewsroomLead item={items[0]!} />
          {items.length > 1 ? (
            <NewsroomLedger years={groupByYear(items.slice(1))} />
          ) : null}
        </>
      ) : (
        <EmptyArchive
          kindLabel={kind === null ? null : editorialKindLabel(kind)}
          brandName={brand.name}
          isFailure={feed.status === "invalid" || feed.status === "remote-error"}
        />
      )}
    </>
  );
}

interface EmptyArchiveProps {
  readonly kindLabel: string | null;
  readonly brandName: string;
  readonly isFailure: boolean;
}

/**
 * Three different nothings, said differently.
 *
 * A filter that matched nothing, an archive that has not been written yet, and
 * a feed that failed to load are not the same event, and telling a reader "no
 * articles" for all three — as the reference design did — hides a fault behind
 * what looks like ordinary emptiness.
 */
function EmptyArchive({ kindLabel, brandName, isFailure }: EmptyArchiveProps) {
  const message = isFailure
    ? "The newsroom could not be loaded just now. This is a fault on our side, not an empty archive — please try again shortly."
    : kindLabel !== null
      ? `Nothing has been filed under ${kindLabel} yet.`
      : `${brandName} has not published to the newsroom yet. Announcements and analysis will appear here first.`;

  return (
    <Section space="tight" label="Newsroom">
      <PageContainer>
        <p className="max-w-[46ch] text-[clamp(1.125rem,2vw,1.5rem)] leading-[1.5] text-brand-ink-soft">
          {message}
        </p>
        {kindLabel !== null ? (
          <p className="mt-8">
            <Link
              href="/news"
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-accent underline underline-offset-4"
            >
              View the whole index
            </Link>
          </p>
        ) : null}
      </PageContainer>
    </Section>
  );
}
