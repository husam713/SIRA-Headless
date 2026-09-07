import Link from "next/link";

import { accentStyle } from "@/components/record/record-primitives";
import type { EntryView } from "@/lib/editorial/entry-view";

// One entry in the register — the archive's repeating unit, and the same cell
// the article page reuses for its related stories.
//
// It is not a card: no border of its own, no shadow, no media block. The grid
// draws the rules, and the cell's only ornament is the desk-accent hairline that
// draws across its top on hover. That keeps a hundred entries legible where a
// hundred cards would not be.

interface StoryCellProps {
  readonly entry: EntryView;
  /** Heading level, so the cell fits the outline of whichever page hosts it. */
  readonly as?: "h3" | "h4";
}

export function StoryCell({ entry, as: Heading = "h4" }: StoryCellProps) {
  const { item } = entry;

  return (
    <article className="record-cell" style={accentStyle(entry.accent)}>
      <div className="flex items-start justify-between gap-3">
        <span
          className="text-[9px] font-extrabold uppercase tracking-[0.14em]"
          style={{ color: entry.accent }}
        >
          {entry.deskLabel}
        </span>
        {entry.dateline !== null ? (
          <time
            dateTime={item.publishedAt ?? undefined}
            // Isolated so RTL does not reorder the day, month and year of a
            // Latin dateline into "JUL 2026 14".
            dir="ltr"
            className="shrink-0 text-[9px] uppercase tracking-wide text-brand-ink-soft"
          >
            {entry.shortDateline ?? entry.dateline}
          </time>
        ) : null}
      </div>

      <Heading className="mt-5 font-display text-[1.25rem] font-normal leading-[1.12] text-brand-ink">
        {entry.href === null ? (
          item.title
        ) : (
          // The link spans the cell so the whole rule-and-hover area is one
          // target, but the accessible name stays the headline alone.
          <Link href={entry.href} className="after:absolute after:inset-0">
            {item.title}
          </Link>
        )}
      </Heading>

      {item.excerpt !== null ? (
        <p className="clamp-3 mt-3 text-[11px] leading-[1.55] text-brand-ink-soft">
          {item.excerpt}
        </p>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-ink-soft">
        <span>{entry.kindLabel}</span>
        <span aria-hidden="true" className="record-arrow text-[13px]">
          &rarr;
        </span>
      </div>
    </article>
  );
}
