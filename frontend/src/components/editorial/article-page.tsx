import Link from "next/link";

import { Bleed, PageContainer } from "@/components/layout/page-container";
import { Prose } from "@/components/layout/prose";
import { Section } from "@/components/layout/section";
import { RichText } from "@/components/editorial/rich-text";
import type { EditorialArticle } from "@/lib/editorial/editorial-single-types";
import { editorialKindSingular } from "@/lib/editorial/ledger";
import { formatContentDate } from "@/lib/homepage/format-date";

// The reading view. The masthead of the newsroom announced an archive; this
// announces one piece, so it opens on the title rather than on an image — the
// image, when there is one, follows the headline instead of pushing it down
// the page.

interface ArticlePageProps {
  readonly article: EditorialArticle;
}

function formatFullDate(value: string | null): string | null {
  if (value === null) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function ArticlePage({ article }: ArticlePageProps) {
  const published = formatFullDate(article.publishedAt);
  const updated =
    article.modifiedAt !== null && article.modifiedAt !== article.publishedAt
      ? formatContentDate(article.modifiedAt)
      : null;

  return (
    <article>
      <Section space="tight" labelledBy="article-heading">
        <PageContainer>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-[0.14em]">
            <Link href="/news" className="text-brand-ink-faint hover:text-brand-ink">
              Newsroom
            </Link>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-brand-ink-faint" />
            <span className="text-brand-accent">
              {editorialKindSingular(article.kind)}
            </span>
          </p>

          <h1
            id="article-heading"
            className="mt-6 max-w-[20ch] text-balance font-display text-[clamp(2rem,5vw,3.75rem)] font-normal leading-[1.04]"
          >
            {article.title}
          </h1>

          {article.excerpt !== null ? (
            <p className="mt-7 max-w-[52ch] text-[clamp(1.0625rem,1.8vw,1.375rem)] leading-[1.55] text-brand-ink-soft">
              {article.excerpt}
            </p>
          ) : null}

          {published !== null ? (
            <p className="mt-8 border-t border-brand-border pt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-ink-faint">
              <time dateTime={article.publishedAt ?? undefined}>{published}</time>
              {updated !== null ? <span> · Updated {updated}</span> : null}
            </p>
          ) : null}
        </PageContainer>
      </Section>

      {article.featuredImage !== null ? (
        <PageContainer className="mt-12">
          <Bleed bleed="edge">
            <div className="aspect-[16/9] w-full overflow-hidden border-t-2 border-brand-accent bg-brand-tint">
              {/*
                WPGraphQL media-origin allowlisting (2C4-B07) is unresolved, so
                a plain <img> is used rather than next/image.
              */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.featuredImage.sourceUrl}
                alt={article.featuredImage.altText ?? ""}
                width={article.featuredImage.width ?? undefined}
                height={article.featuredImage.height ?? undefined}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </Bleed>
        </PageContainer>
      ) : null}

      {/*
        Flush at the top: the header section above already ends on its own
        padding, and two padded sections in a row opened a gap that read as a
        break in the article rather than as the start of its body.
      */}
      <Section space="flush" label="Article body" className="pb-[var(--space-section)]">
        <PageContainer>
          <Prose>
            {article.body.length > 0 ? (
              <RichText nodes={article.body} />
            ) : (
              <p className="text-[1.0625rem] leading-[1.75] text-brand-ink-soft">
                {/*
                  An item can legitimately be a headline and a summary with no
                  body — a short announcement, say — so this is a statement of
                  fact rather than an error.
                */}
                This item was published as a summary only.
              </p>
            )}
          </Prose>

          <p className="mt-16 border-t border-brand-border pt-8">
            <Link
              href="/news"
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-accent underline underline-offset-4"
            >
              ← Back to the newsroom
            </Link>
          </p>
        </PageContainer>
      </Section>
    </article>
  );
}
