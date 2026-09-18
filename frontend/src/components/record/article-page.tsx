import Link from "next/link";

import { RichText } from "@/components/editorial/rich-text";
import {
  accentStyle,
  RecordEyebrow,
  RecordRailEntry,
  RecordShell,
} from "@/components/record/record-primitives";
import { StoryCell } from "@/components/record/story-cell";
import type { EditorialArticle } from "@/lib/editorial/editorial-single-types";
import { toEntryView, type EntryView } from "@/lib/editorial/entry-view";
import type { RichTextNode } from "@/lib/editorial/rich-text";
import { editorialSectionLabel } from "@/lib/editorial/routes";

interface ArticlePageProps {
  readonly article: EditorialArticle;
  readonly related: readonly EntryView[];
}

interface ArticleSection {
  readonly id: string;
  readonly label: string;
  readonly level: "h2" | "h3";
}

function articleSectionId(index: number): string {
  return `article-section-${index}`;
}

function collectText(node: RichTextNode): string {
  if (node.type === "text") return node.value;
  return node.children.map(collectText).join("");
}

/** The contents rail reflects only editor-authored headings. */
function articleSections(body: readonly RichTextNode[]): readonly ArticleSection[] {
  const sections: ArticleSection[] = [];

  for (const [index, node] of body.entries()) {
    if (node.type !== "element" || (node.tag !== "h2" && node.tag !== "h3")) {
      continue;
    }

    const label = collectText(node).replace(/\s+/gu, " ").trim();
    if (label === "") continue;

    sections.push({ id: articleSectionId(index), label, level: node.tag });
  }

  return sections;
}

function formatFullDate(value: string | null): string | null {
  if (value === null) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function readingMinutes(article: EditorialArticle): number | null {
  const words = JSON.stringify(article.body).split(/\s+/u).length;
  if (words < 60) return null;
  return Math.max(1, Math.round(words / 220));
}

/**
 * The CMS-provided featured image is the visual lead. When there is no image,
 * the text hero grows into the available space rather than showing a filler.
 */
export function ArticlePage({ article, related }: ArticlePageProps) {
  const entry = toEntryView(article);
  const published = formatFullDate(article.publishedAt);
  const updated =
    article.modifiedAt !== null && article.modifiedAt !== article.publishedAt
      ? formatFullDate(article.modifiedAt)
      : null;
  const minutes = readingMinutes(article);
  const sections = articleSections(article.body);

  return (
    <RecordShell label={article.title}>
      <article className="editorial-article" style={accentStyle(entry.accent)}>
        <header className="editorial-crumb">
          <Link href="/news">Newsroom</Link>
          <span aria-hidden="true">/</span>
          <span>{editorialSectionLabel(article.href) ?? entry.kindLabel}</span>
          <span aria-hidden="true">/</span>
          <span>{entry.deskLabel}</span>
        </header>

        <section
          className={`editorial-hero${
            article.featuredImage === null ? " editorial-hero--text-only" : ""
          }`}
        >
          <div className="editorial-hero__copy">
            <RecordEyebrow accent={entry.accent}>
              <span>{entry.deskLabel}</span>
              <span>{entry.kindLabel}</span>
            </RecordEyebrow>
            <h1>{article.title}</h1>
            {article.excerpt !== null ? (
              <p className="editorial-hero__deck">{article.excerpt}</p>
            ) : null}
            <p className="editorial-meta">
              {published !== null ? (
                <time dateTime={article.publishedAt ?? undefined} dir="ltr">
                  {published}
                </time>
              ) : null}
              {minutes !== null ? <span>{minutes} min read</span> : null}
              <span>{entry.deskLabel} desk</span>
              {updated !== null ? <span>Updated {updated}</span> : null}
            </p>
          </div>

          {article.featuredImage !== null ? (
            <figure className="editorial-hero__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.featuredImage.sourceUrl}
                alt={article.featuredImage.altText ?? ""}
                width={article.featuredImage.width ?? undefined}
                height={article.featuredImage.height ?? undefined}
                loading="eager"
                decoding="async"
              />
              {article.featuredImage.altText !== null &&
              article.featuredImage.altText !== "" ? (
                <figcaption>{article.featuredImage.altText}</figcaption>
              ) : null}
            </figure>
          ) : null}
        </section>

        <section className="editorial-reading">
          <aside className="editorial-details" aria-label="Article details">
            <RecordRailEntry label="Desk" value={entry.deskLabel} />
            <RecordRailEntry label="Format" value={entry.kindLabel} />
            {published !== null ? (
              <RecordRailEntry label="Published" value={published} />
            ) : null}
          </aside>

          <div className="record-prose editorial-prose min-w-0">
            {article.body.length > 0 ? (
              <RichText
                nodes={article.body}
                headingId={(node, index) =>
                  node.type === "element" &&
                  (node.tag === "h2" || node.tag === "h3")
                    ? articleSectionId(index)
                    : undefined
                }
              />
            ) : (
              <p>This entry was filed as a summary only.</p>
            )}
          </div>

          {sections.length > 0 ? (
            <nav className="editorial-contents" aria-label="On this page">
              <p>In this article</p>
              <ol>
                {sections.map((section) => (
                  <li key={section.id} data-level={section.level}>
                    <a href={`#${section.id}`}>{section.label}</a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </section>

        {related.length > 0 ? (
          <section className="editorial-related" aria-labelledby="related-stories">
            <div className="editorial-related__head">
              <h2 id="related-stories">More from {entry.deskLabel}</h2>
              <span>Latest insights</span>
            </div>
            <div className="record-register">
              {related.map((item) => (
                <StoryCell key={item.item.databaseId} entry={item} as="h3" />
              ))}
            </div>
          </section>
        ) : null}

        <p className="editorial-return">
          <Link href="/news">Explore all insights <span aria-hidden="true">&rarr;</span></Link>
        </p>
      </article>
    </RecordShell>
  );
}
