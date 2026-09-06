import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { joinClasses } from "@/components/layout/page-container";
import type { EntryView } from "@/lib/editorial/entry-view";

// The pieces every entry is assembled from, in one place, so the lead, the
// front and the record differ by composition and scale rather than by markup.

export type TurnStyle = CSSProperties & {
  readonly "--desk-accent"?: string;
};

/** Hands the entry's desk accent to the `.turn` corner mark in globals.css. */
export function turnStyle(entry: EntryView): TurnStyle {
  return { "--desk-accent": entry.accent };
}

interface EntryTitleProps {
  readonly entry: EntryView;
  readonly className?: string;
}

/**
 * The headline, linked when this app serves a route for it.
 *
 * The link is on the title rather than on the whole entry: a block-sized hit
 * area swallows text selection over the summary, and the title is what a
 * reader is aiming at. An entry whose permalink this app cannot serve still
 * renders — as text — instead of offering a link to nothing.
 */
export function EntryTitle({ entry, className }: EntryTitleProps) {
  const classes = joinClasses(
    "text-balance font-display font-normal leading-[1.12]",
    className,
  );

  if (entry.href === null) {
    return <span className={classes}>{entry.item.title}</span>;
  }

  return (
    <Link
      href={entry.href}
      className={joinClasses(classes, "transition-colors hover:text-brand-accent")}
    >
      {entry.item.title}
    </Link>
  );
}

interface EntryRegisterProps {
  readonly entry: EntryView;
  /** What the second line reports. Group indexes by desk, a branch by kind. */
  readonly secondary: "desk" | "kind";
  /**
   * `stack` sets the two facts one above the other from the small step up, for
   * the record's narrow register column. `inline` keeps them on one line, for
   * the lead and the front where the column is the full measure.
   */
  readonly layout?: "stack" | "inline";
  readonly className?: string;
}

/**
 * The register: dateline over origin, set tabular so the column rules itself.
 *
 * The desk name is set in ink rather than in its accent on purpose. Measured
 * against the approved papers, Group's gold reaches 2.15:1 and Real Estate's
 * ochre 3.61:1 — nowhere near AA for 11px type — and colour-coded metadata is
 * unreadable to a colour-blind reader whatever its contrast. The accent stays
 * on the non-text corner mark, where it is decoration beside a text label
 * rather than the label itself.
 */
export function EntryRegister({
  entry,
  secondary,
  layout = "inline",
  className,
}: EntryRegisterProps) {
  return (
    <p
      className={joinClasses(
        "flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[11px] font-bold uppercase tracking-[0.13em]",
        layout === "stack" ? "sm:flex-col sm:items-start sm:gap-y-2" : undefined,
        className,
      )}
    >
      {entry.dateline !== null ? (
        <time
          dateTime={entry.item.publishedAt ?? undefined}
          // "14 JUL 2026" is a run of digits and Latin letters separated by
          // neutrals, so under RTL the bidi algorithm reorders it to
          // "JUL 2026 14". Isolating the run keeps the dateline readable
          // without pinning the register's alignment, which stays logical.
          dir="ltr"
          className="tabular-nums text-brand-ink"
        >
          {entry.dateline}
        </time>
      ) : null}
      <span className="text-brand-ink-soft">
        {secondary === "desk" ? entry.deskLabel : entry.kindLabel}
      </span>
    </p>
  );
}

interface EntryFigureProps {
  readonly entry: EntryView;
  readonly aspect: string;
  readonly priority?: boolean;
  readonly className?: string;
  readonly sizes?: string;
}

/**
 * A featured image, when there is one.
 *
 * WPGraphQL media-origin allowlisting (2C4-B07) is unresolved, so this is a
 * plain <img>: next/image would need remote patterns configured against an
 * origin policy that has not been approved. `aspect` is passed rather than
 * fixed because the lead, the front and the record each crop differently.
 */
export function EntryFigure({
  entry,
  aspect,
  priority = false,
  className,
  sizes,
}: EntryFigureProps) {
  const image = entry.item.featuredImage;

  if (image === null) return null;

  return (
    <div
      className={joinClasses("overflow-hidden bg-brand-tint", aspect, className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.sourceUrl}
        alt={image.altText ?? ""}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        sizes={sizes}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

interface EntrySummaryProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function EntrySummary({ children, className }: EntrySummaryProps) {
  return (
    <p className={joinClasses("text-brand-ink-soft", className)}>{children}</p>
  );
}
