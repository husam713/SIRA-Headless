import Link from "next/link";

import { RichText } from "@/components/editorial/rich-text";
import {
  accentStyle,
  RecordEndBar,
  RecordEyebrow,
  RecordRailEntry,
  RecordShell,
  RecordSignal,
} from "@/components/record/record-primitives";
import { StoryCell } from "@/components/record/story-cell";
import type { EditorialArticle } from "@/lib/editorial/editorial-single-types";
import { toEntryView, type EntryView } from "@/lib/editorial/entry-view";
import type { RichTextNode } from "@/lib/editorial/rich-text";
import { editorialSectionLabel } from "@/lib/editorial/routes";

// THE SIRA RECORD — the reading view.
//
// The same sheet, the same rules, the same signal panel and the same register
// cells as the archive, so arriving here reads as turning further into one
// document rather than landing on a different site.
//
// Server Component. An article renders and is fully readable with no client
// JavaScript at all.

interface ArticlePageProps {
  readonly article: EditorialArticle;
  /** Other entries from the same desk. May be empty. */
  readonly related: readonly EntryView[];
}

/**
 * How the hero splits the entry's summary between the deck and the panel.
 *
 * The prototype had a hand-written pull-quote beside a separate deck. This
 * content model has one summary and no quote field, so the rule is: lift a
 * quote from the article's own body the way a subeditor would, and only fall
 * back to the summary when the body offers nothing. The summary is then shown
 * in ONE place, never as a deck and a quote saying the same thing side by side.
 */
interface HeroCopy {
  /** The standfirst under the headline. Null when the panel is carrying it. */
  readonly deck: string | null;
  /** The panel's quote. */
  readonly quote: string;
}

// What the panel holds: at its 18ch measure this is about seven lines, which
// the hero row fits without growing. The floor exists because a three-word
// fragment ("Five tests.") is a sentence but not a pull-quote.
const QUOTE_MAXIMUM = 120;
const QUOTE_MINIMUM = 40;

function heroCopy(article: EditorialArticle): HeroCopy {
  const excerpt = article.excerpt?.trim() ?? null;
  const lifted = liftQuote(article.body, excerpt);

  if (lifted !== null) return { deck: excerpt, quote: lifted };

  // Nothing quotable in the body. The summary goes to the panel, which is the
  // element designed to carry a line, and the deck stands down rather than
  // printing it twice.
  return excerpt === null
    ? { deck: null, quote: article.title }
    : { deck: null, quote: firstSentence(excerpt) };
}

/**
 * The first sentence of the body that reads as a pull-quote: long enough to
 * say something, short enough for the panel, and not simply the summary again.
 */
function liftQuote(
  body: readonly RichTextNode[],
  excerpt: string | null,
): string | null {
  const excerptOpener = excerpt === null ? null : firstSentence(excerpt);

  for (const paragraph of paragraphTexts(body)) {
    for (const sentence of paragraph.match(/[^.!?]+[.!?]/gu) ?? []) {
      const candidate = sentence.trim();

      if (candidate.length < QUOTE_MINIMUM) continue;
      if (candidate.length > QUOTE_MAXIMUM) continue;
      if (candidate === excerptOpener) continue;

      return candidate;
    }
  }

  return null;
}

function firstSentence(value: string): string {
  return (/^[^.!?]+[.!?]/u.exec(value)?.[0] ?? value).trim();
}

/** Every paragraph in the body, in order, as plain text. */
function paragraphTexts(body: readonly RichTextNode[]): readonly string[] {
  const texts: string[] = [];

  for (const node of body) {
    if (node.type !== "element" || node.tag !== "p") continue;

    const text = collectText(node).replace(/\s+/gu, " ").trim();
    if (text !== "") texts.push(text);
  }

  return texts;
}

function collectText(node: RichTextNode): string {
  if (node.type === "text") return node.value;
  return node.children.map(collectText).join("");
}

/**
 * The signal panel's index.
 *
 * The prototype showed a two-digit numeral. This content model has no issue
 * number, so the numeral is the record YEAR — real data, the same visual
 * weight, and it cannot be mistaken for a claim the CMS never made. Falls back
 * to the desk initials for an entry with no date.
 */
function signalIndex(article: EditorialArticle, deskLabel: string): string {
  const year = formatFullDate(article.publishedAt)?.slice(-2);
  return year ?? deskLabel.slice(0, 2).toUpperCase();
}

/** Long-form publication date, in the record's voice. */
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

/**
 * Rough reading time.
 *
 * Derived from the parsed body, so it is a measurement rather than a claim, and
 * omitted entirely for an entry with no body.
 */
function readingMinutes(article: EditorialArticle): number | null {
  const words = JSON.stringify(article.body).split(/\s+/u).length;
  if (words < 60) return null;
  return Math.max(1, Math.round(words / 220));
}

export function ArticlePage({ article, related }: ArticlePageProps) {
  const entry = toEntryView(article);
  const published = formatFullDate(article.publishedAt);
  const updated =
    article.modifiedAt !== null && article.modifiedAt !== article.publishedAt
      ? formatFullDate(article.modifiedAt)
      : null;
  const minutes = readingMinutes(article);
  const hero = heroCopy(article);

  return (
    <RecordShell label={article.title}>
      <article style={accentStyle(entry.accent)}>
        <header className="record-pad record-rule flex flex-wrap items-end justify-between gap-4 py-4">
          <p className="font-display text-lg">The SIRA Record</p>
          <p className="text-[9px] uppercase tracking-[0.13em] text-brand-ink-soft sm:text-end">
            <Link href="/news" className="hover:text-brand-ink">
              Newsroom
            </Link>{" "}
            / {editorialSectionLabel(article.href) ?? entry.kindLabel} /{" "}
            {entry.deskLabel}
          </p>
        </header>

        <div className="record-split record-split--article record-rule">
          <div className="record-pad min-w-0 py-8">
            <RecordEyebrow accent={entry.accent}>
              <span>{entry.kindLabel}</span>
              <span>{entry.deskLabel}</span>
              {published !== null ? (
                <time dateTime={article.publishedAt ?? undefined} dir="ltr">
                  {published}
                </time>
              ) : null}
            </RecordEyebrow>

            <h1 className="mt-6 max-w-[15ch] font-display text-[clamp(2.125rem,6.5vw,4.5rem)] font-normal leading-[0.96] tracking-[-0.045em]">
              {article.title}
            </h1>

            {hero.deck !== null ? (
              <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-[1.6] text-brand-ink-soft">
                {hero.deck}
              </p>
            ) : null}

            {/* Byline. Only facts the record actually holds appear here. */}
            <p className="mt-6 flex flex-wrap gap-x-3.5 gap-y-1.5 border-t border-brand-border pt-4 text-[9px] uppercase tracking-[0.08em] text-brand-ink-soft">
              <span>{entry.deskLabel} desk</span>
              {minutes !== null ? <span>{minutes} min read</span> : null}
              {updated !== null ? <span>Updated {updated}</span> : null}
            </p>
          </div>

          <RecordSignal
            index={signalIndex(article, entry.deskLabel)}
            tag={`${entry.deskLabel} / ${entry.kindLabel}`}
            statement={hero.quote}
            footer={`The Record / ${entry.deskLabel}`}
            accent={entry.accent}
          />
        </div>

        <div
          className={`record-pad record-body record-rule py-8${
            article.featuredImage === null ? " record-body--no-context" : ""
          }`}
        >
          {/* Metadata rail. A sidebar on desktop; a three-up band on mobile. */}
          <aside className="record-rail--band">
            <RecordRailEntry label="Desk" value={entry.deskLabel} />
            <RecordRailEntry label="Format" value={entry.kindLabel} />
            {published !== null ? (
              <RecordRailEntry label="Published" value={published} />
            ) : null}
          </aside>

          <div className="record-prose min-w-0">
            {article.body.length > 0 ? (
              <RichText nodes={article.body} />
            ) : (
              <p>
                {/*
                  An entry can legitimately be a headline and a summary — a
                  short announcement — so this states a fact rather than an
                  error.
                */}
                This entry was filed as a summary only.
              </p>
            )}
          </div>

          {/*
            The context rail is optional by design. With nothing meaningful to
            put in it the column collapses and the reading measure takes the
            space, rather than a filler panel being invented to hold it open.
          */}
          {article.featuredImage !== null ? (
            <aside className="record-context">
              <figure className="border-t-2 border-brand-accent pt-3">
                {/*
                  WPGraphQL media-origin allowlisting (2C4-B07) is unresolved,
                  so a plain <img> is used rather than next/image.
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.featuredImage.sourceUrl}
                  alt={article.featuredImage.altText ?? ""}
                  width={article.featuredImage.width ?? undefined}
                  height={article.featuredImage.height ?? undefined}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover"
                />
                {article.featuredImage.altText !== null ? (
                  <figcaption className="mt-2 text-[9px] leading-[1.5] text-brand-ink-soft">
                    {article.featuredImage.altText}
                  </figcaption>
                ) : null}
              </figure>
            </aside>
          ) : null}
        </div>

        {related.length > 0 ? (
          <>
            <div className="record-pad flex flex-wrap items-end justify-between gap-4 pb-3 pt-7">
              <h2 className="font-display text-[1.8125rem] font-normal leading-none">
                From the same desk
              </h2>
              <span className="text-[9px] uppercase tracking-[0.13em] text-brand-ink-soft">
                {entry.deskLabel}
              </span>
            </div>
            <div className="record-register">
              {related.map((item) => (
                <StoryCell key={item.item.databaseId} entry={item} as="h3" />
              ))}
            </div>
          </>
        ) : null}

        <RecordEndBar
          statement="Back to the record."
          supporting="Investment, operations and perspective across the SIRA house."
          trailing={
            <Link
              href="/news"
              className="border-b border-brand-paper/35 pb-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-brand-paper"
            >
              All entries &rarr;
            </Link>
          }
        />
      </article>
    </RecordShell>
  );
}
