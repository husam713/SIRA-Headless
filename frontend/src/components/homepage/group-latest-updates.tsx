import Link from "next/link";
import type { CSSProperties } from "react";

import { CtaLink } from "@/components/homepage/cta-link";
import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { editorialArticleHref } from "@/lib/editorial/routes";
import { formatContentDate } from "@/lib/homepage/format-date";
import type {
  HomepageContentItem,
  HomepageEditorialSection,
} from "@/lib/homepage/types";

// The homepage's editorial preview — deliberately NOT a small newsroom.
//
// This used to be an intro column beside one oversized lead and two smaller
// stories, which measured 599px against the reference's 298px and gave the
// first item a weight the homepage never intended. The homepage's job here is
// discovery: three siblings of equal weight, one glance, one route out. The
// Record is where editorial actually gets browsed.
//
// Each entry is a single ruled column: an accent hairline at the leading edge,
// kind and date, headline, one line of summary, one link. No media — the
// reference carries none here either, and roughly half of what this CMS holds
// has no image, so a media slot would be an empty rectangle most of the time.

type UpdatesGridStyle = CSSProperties & {
  readonly "--updates-count"?: number;
};

interface GroupLatestUpdatesProps {
  readonly section: HomepageEditorialSection | null;
}

// Editorial kind, in the CMS's own vocabulary rather than an invented one.
const KIND_LABELS: Readonly<Record<string, string>> = Object.freeze({
  article: "Article",
  insight: "Insight",
  news: "News",
  "press-release": "Press Release",
});

interface UpdateColumnProps {
  readonly item: HomepageContentItem;
}

function UpdateColumn({ item }: UpdateColumnProps) {
  // Only the four editorial bases have a detail route; anything else renders
  // unlinked rather than pointing at a 404.
  const href = editorialArticleHref(item.href);
  const label = KIND_LABELS[item.kind] ?? item.kind;
  const date = formatContentDate(item.date);

  return (
    // The rule is a leading border rather than a card outline: the reference
    // marks each column with a single vertical accent and no box, which is the
    // same grammar the Newsroom's corner mark uses.
    <article className="border-s-2 border-brand-accent ps-5">
      <p className="flex flex-wrap items-baseline gap-x-2 text-[11px] font-bold uppercase tracking-[0.1em]">
        <span className="text-brand-accent">{label}</span>
        {date !== null ? (
          <>
            <span aria-hidden="true" className="text-brand-ink-faint">
              ·
            </span>
            <span className="font-semibold tabular-nums text-brand-ink-soft">
              {date}
            </span>
          </>
        ) : null}
      </p>

      <h3 className="mt-3 text-balance font-display text-[clamp(1.125rem,1.5vw,1.375rem)] font-normal leading-[1.25]">
        {href === null ? (
          item.title
        ) : (
          <Link href={href} className="transition-colors hover:text-brand-accent">
            {item.title}
          </Link>
        )}
      </h3>

      {item.excerpt !== null ? (
        // Clamped to two lines so three columns of uneven CMS copy still read
        // as one row rather than three ragged blocks.
        <p className="clamp-2 mt-3 text-[0.9375rem] leading-relaxed text-brand-ink-soft">
          {item.excerpt}
        </p>
      ) : null}

      {href === null ? null : (
        <p className="mt-4">
          <Link
            href={href}
            className="group inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-ink transition-colors hover:text-brand-accent"
          >
            Read More
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </p>
      )}
    </article>
  );
}

export function GroupLatestUpdates({ section }: GroupLatestUpdatesProps) {
  if (section === null || section.selection.status !== "ready") return null;

  // The homepage shows at most three. The data contract asks for more than it
  // renders so an unpublished or malformed record cannot silently shorten the
  // row; curating here keeps a growing archive from reshaping the homepage.
  const items = section.selection.items.slice(0, 3);

  if (items.length === 0) return null;

  return (
    <Section
      id="latest-updates"
      space="tight"
      labelledBy="latest-updates-heading"
      className="border-b border-brand-border"
    >
      <PageContainer>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2
            id="latest-updates-heading"
            className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-ink"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent"
            />
            {section.eyebrow ?? "Latest Updates"}
          </h2>
          {section.link !== null ? (
            <CtaLink link={section.link} variant="ghost-light" />
          ) : null}
        </div>

        {/*
          One row of siblings. The column count follows the content count, so a
          quiet month renders two balanced columns rather than one wide column
          and a gap where the third should be.
        */}
        {/*
          The count reaches CSS as a custom property and is only read at the
          desktop step. An inline `grid-template-columns` would beat the
          responsive classes at every width and pin mobile to three columns.
        */}
        <div
          className="mt-10 grid gap-x-[var(--layout-grid-gap)] gap-y-10 sm:grid-cols-2 lg:mt-12 lg:[grid-template-columns:repeat(var(--updates-count),minmax(0,1fr))]"
          style={{ "--updates-count": items.length } as UpdatesGridStyle}
        >
          {items.map((item) => (
            <UpdateColumn key={item.databaseId} item={item} />
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}
