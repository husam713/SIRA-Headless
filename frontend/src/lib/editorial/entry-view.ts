import {
  editorialDeskAccent,
  editorialDeskLabel,
  primaryDesk,
} from "@/lib/editorial/desks";
import { calendarDate, editorialKindSingular } from "@/lib/editorial/record";
import { editorialArticleHref } from "@/lib/editorial/routes";
import type { EditorialDeskKey, EditorialItem } from "@/lib/editorial/types";

/**
 * Everything the newsroom needs to draw one entry, resolved once.
 *
 * The components stay compositional this way: none of them reaches for the
 * desk registry, the route table or the date formatter on its own, so there is
 * exactly one place where an entry's label, accent and destination are decided
 * and they cannot disagree between the lead, the front and the record.
 */
export interface EntryView {
  readonly item: EditorialItem;
  /** The permalink, or null when this app serves no route for it. */
  readonly href: string | null;
  readonly desk: EditorialDeskKey;
  readonly deskLabel: string;
  readonly accent: string;
  readonly kindLabel: string;
  /** "14 JUL 2026", or null when the entry carries no usable date. */
  readonly dateline: string | null;
}

/**
 * The dateline.
 *
 * Read through the same `calendarDate` the year bands use, and formatted in
 * UTC, so an entry can never file under one year and print another directly
 * beneath the band heading that contains it.
 */
export function formatDateline(value: string | null): string | null {
  const date = calendarDate(value);
  if (date === null) return null;

  // en-GB for day-month-year. A record datelines "02 JUN 2026", not
  // "JUN 02 2026": the en-US ordering reads as an American press release and
  // is ambiguous to most of the international audience this page is for.
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase()
    .replace(/,/gu, "");
}

export function toEntryView(item: EditorialItem): EntryView {
  const desk = primaryDesk(item);

  return Object.freeze({
    item,
    href: editorialArticleHref(item.href),
    desk,
    deskLabel: editorialDeskLabel(desk),
    accent: editorialDeskAccent(desk),
    kindLabel: editorialKindSingular(item.kind),
    dateline: formatDateline(item.publishedAt),
  });
}

export function toEntryViews(
  items: readonly EditorialItem[],
): readonly EntryView[] {
  return Object.freeze(items.map(toEntryView));
}
