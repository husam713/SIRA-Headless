import Link from "next/link";

import { RichText } from "@/components/editorial/rich-text";
import { PageContainer } from "@/components/layout/page-container";
import { Prose } from "@/components/layout/prose";
import { Section } from "@/components/layout/section";
import {
  EntryRegister,
  EntryTitle,
  turnStyle,
} from "@/components/newsroom/entry-parts";
import type { EditorialArticle } from "@/lib/editorial/editorial-single-types";
import { formatDateline, toEntryView, type EntryView } from "@/lib/editorial/entry-view";

// The reading view, built from the same grammar as the record so that arriving
// on an article feels like turning to a page of the thing you were just
// reading, not like landing on a different website.
//
// The register margin carries the entry's provenance — dateline, desk, format —
// against the same vertical the archive uses, and the corner mark repeats in the
// same desk accent. The headline opens the page: the picture, when there is one,
// follows it rather than pushing it below the fold.

interface ArticlePageProps {
  readonly article: EditorialArticle;
  /** Other entries from the same desk, for the closing strip. May be empty. */
  readonly alsoInTheRecord: readonly EntryView[];
}

export function ArticlePage({ article, alsoInTheRecord }: ArticlePageProps) {
  const entry = toEntryView(article);
  // The dateline lives in the register margin and nowhere else. A second,
  // long-form date under the standfirst said the same thing twice.
  const updated =
    article.modifiedAt !== null && article.modifiedAt !== article.publishedAt
      ? formatDateline(article.modifiedAt)
      : null;

  return (
    <article style={turnStyle(entry)}>
      <Section space="tight" labelledBy="article-heading">
        <PageContainer>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
            <Link
              href="/news"
              className="text-brand-ink-soft transition-colors hover:text-brand-ink"
            >
              ← The Record
            </Link>
          </p>

          <div className="turn mt-7 grid gap-x-[var(--layout-grid-gap)] gap-y-8 pt-8 lg:grid-cols-12">
            {/*
              The register margin. It reports the same three facts, in the same
              order and the same type, as the entry's row in the archive.
            */}
            <div className="lg:col-span-2">
              <EntryRegister entry={entry} secondary="desk" layout="stack" />
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.13em] text-brand-ink-soft">
                {entry.kindLabel}
              </p>
              {updated !== null ? (
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-ink-soft">
                  Updated {updated}
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-10">
              <h1
                id="article-heading"
                className="max-w-[19ch] text-balance font-display text-[clamp(2.125rem,5vw,4rem)] font-normal leading-[1.05]"
              >
                {article.title}
              </h1>

              {article.excerpt !== null ? (
                <p className="mt-8 max-w-[54ch] text-[clamp(1.0625rem,1.7vw,1.375rem)] leading-[1.55] text-brand-ink-soft">
                  {article.excerpt}
                </p>
              ) : null}

            </div>
          </div>
        </PageContainer>
      </Section>

      {article.featuredImage !== null ? (
        <PageContainer>
          <div className="bleed-edge">
            <div className="aspect-[16/9] w-full overflow-hidden bg-brand-tint">
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
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </PageContainer>
      ) : null}

      {/*
        Flush at the top: the header section above already ends on its own
        padding, and two padded sections in a row opened a gap that read as a
        break in the article rather than as the start of its body.
      */}
      <Section
        space="flush"
        label="Article body"
        className="pb-[var(--space-section)] pt-[clamp(3rem,5vw,4.5rem)]"
      >
        <PageContainer className="lg:grid lg:grid-cols-12 lg:gap-x-[var(--layout-grid-gap)]">
          {/* Body sits under the headline column, not under the register. */}
          <div className="lg:col-span-8 lg:col-start-3">
            <Prose>
              {article.body.length > 0 ? (
                <RichText nodes={article.body} />
              ) : (
                <p className="text-[1.0625rem] leading-[1.75] text-brand-ink-soft">
                  {/*
                    An entry can legitimately be a headline and a summary with
                    no body — a short announcement, say — so this is a statement
                    of fact rather than an error.
                  */}
                  This entry was filed as a summary only.
                </p>
              )}
            </Prose>
          </div>
        </PageContainer>
      </Section>

      {alsoInTheRecord.length > 0 ? (
        <Section space="tight" label="Also in the record" className="bg-brand-tint">
          <PageContainer>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-ink-soft">
              Also from {entry.deskLabel}
            </p>

            <div className="front mt-10">
              {alsoInTheRecord.map((related) => (
                <div
                  key={related.item.databaseId}
                  className="turn pt-6"
                  style={turnStyle(related)}
                >
                  <EntryRegister entry={related} secondary="kind" />
                  <h2 className="front__title mt-5 max-w-[26ch]">
                    <EntryTitle entry={related} />
                  </h2>
                </div>
              ))}
            </div>

            <p className="mt-14">
              <Link
                href="/news"
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-accent underline underline-offset-4"
              >
                The whole record →
              </Link>
            </p>
          </PageContainer>
        </Section>
      ) : null}
    </article>
  );
}
