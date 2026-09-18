import Link from "next/link";
import type { CSSProperties } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionHead } from "@/components/layout/section-head";
import { CtaLink } from "@/components/homepage/cta-link";
import { editorialArticleHref } from "@/lib/editorial/routes";
import { formatContentDate } from "@/lib/homepage/format-date";
import type {
  HomepageContentItem,
  HomepageEditorialSection,
} from "@/lib/homepage/types";

// Atlas direction (owner-approved 2026-09-16): perspectives are an editorial
// list, not a card row — dateline and kind on the left, the title as the
// line, the picture as a small plate on the right. The whole row is the link
// (the title's anchor is stretched over it) when the item has a route this
// app serves; otherwise the title stands unlinked.

interface GroupInsightsProps {
  readonly section: HomepageEditorialSection | null;
}

interface InsightRowProps {
  readonly item: HomepageContentItem;
  readonly index: number;
  /**
   * Whether the rows carry a picture plate at all. Decided once for the
   * list: a plate on one row and a blank on the next reads as broken rows,
   * so either every row has its picture or none reserves the space.
   */
  readonly withMedia: boolean;
}

const KIND_LABEL: Readonly<Record<string, string>> = Object.freeze({
  article: "Article",
  insight: "Insight",
  news: "News",
  "press-release": "Press release",
});

function InsightRow({ item, index, withMedia }: InsightRowProps) {
  const date = formatContentDate(item.date);
  const href = editorialArticleHref(item.href);
  const kind = KIND_LABEL[item.kind] ?? null;

  return (
    <article
      className={`atlas-insight reveal${withMedia ? "" : " atlas-insight--text"}`}
      style={{ "--reveal-offset": `${String(Math.min(index, 5) * 1.5)}%` } as CSSProperties}
    >
      <p className="atlas-insight__meta">
        {kind !== null ? <b>{kind}</b> : null}
        {date !== null ? <span>{date}</span> : null}
      </p>

      <div>
        <h3 className="atlas-insight__title">
          {href === null ? (
            item.title
          ) : (
            <Link href={href} className="transition-colors hover:text-brand-accent">
              {item.title}
            </Link>
          )}
        </h3>
        {item.excerpt !== null ? <p className="atlas-insight__copy">{item.excerpt}</p> : null}
      </div>

      {withMedia ? (
      <div className="atlas-insight__thumb" aria-hidden="true">
        {item.featuredImage !== null ? (
          // WPGraphQL media-origin allowlisting (2C4-B07) is unresolved, so a
          // plain <img>. Decorative: the row is named by its title.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.featuredImage.sourceUrl}
            alt=""
            width={item.featuredImage.width ?? undefined}
            height={item.featuredImage.height ?? undefined}
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>
      ) : null}
    </article>
  );
}

export function GroupInsights({ section }: GroupInsightsProps) {
  if (section === null || section.selection.status !== "ready") return null;

  const withMedia = section.selection.items.every((item) => item.featuredImage !== null);

  return (
    <Section
      id="insights"
      labelledBy="insights-heading"
      className="border-b border-brand-border"
    >
      <PageContainer>
        <SectionHead
          id="insights-heading"
          eyebrow={section.eyebrow ?? "News & Perspectives"}
          heading={section.heading}
          lead={section.description}
          action={
            section.link !== null ? <CtaLink link={section.link} variant="ghost-light" /> : undefined
          }
        />

        <div className="atlas-insights">
          {section.selection.items.map((item, index) => (
            <InsightRow key={item.databaseId} item={item} index={index} withMedia={withMedia} />
          ))}
        </div>

        {section.link !== null && section.description !== null ? (
          <p className="mt-10">
            <CtaLink link={section.link} variant="ghost-light" />
          </p>
        ) : null}
      </PageContainer>
    </Section>
  );
}
