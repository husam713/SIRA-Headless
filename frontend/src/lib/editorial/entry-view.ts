import {
  editorialDeskAccent,
  editorialDeskLabel,
  primaryDesk,
} from "@/lib/editorial/desks";
import { calendarDate, editorialKindSingular } from "@/lib/editorial/record";
import { editorialArticleHref } from "@/lib/editorial/routes";
import type { EditorialDeskKey, EditorialItem } from "@/lib/editorial/types";
import { CHROME, localizeUnitLabel } from "@/lib/i18n/locale";
import type { LocaleCode } from "@/types/site";

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
  /** "06 SEP 2026", or null when the entry carries no usable date. */
  readonly dateline: string | null;
  /**
   * "SEP 2026" — the register's shorter form.
   *
   * The archive sets month and year in a 9px column beside a headline, where a
   * day adds nothing a reader scanning by month wants; the lead and the article
   * hero carry the full date instead.
   */
  readonly shortDateline: string | null;
}

/**
 * The dateline.
 *
 * Read through the same `calendarDate` the year bands use, and formatted in
 * UTC, so an entry can never file under one year and print another directly
 * beneath the band heading that contains it.
 */
export function formatDateline(value: string | null, locale: LocaleCode = "en"): string | null {
  const date = calendarDate(value);
  if (date === null) return null;

  // en-GB for day-month-year. A record datelines "02 JUN 2026", not
  // "JUN 02 2026": the en-US ordering reads as an American press release and
  // is ambiguous to most of the international audience this page is for.
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase()
    .replace(/,/gu, "");
}

/** The register's month-and-year form, read through the same calendar date. */
export function formatShortDateline(value: string | null, locale: LocaleCode = "en"): string | null {
  const date = calendarDate(value);
  if (date === null) return null;

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase();
}

export function toEntryView(item: EditorialItem, locale: LocaleCode = "en"): EntryView {
  const desk = primaryDesk(item);

  // The desk and kind are said in the page's language; the entry's own words
  // are whatever language it was written in.
  const deskLabel =
    locale === "en"
      ? editorialDeskLabel(desk)
      : desk === "group"
        ? CHROME[locale].siteNames.group
        : (localizeUnitLabel(locale, desk, editorialDeskLabel(desk)) ?? editorialDeskLabel(desk));

  return Object.freeze({
    item,
    href: editorialArticleHref(item.href),
    desk,
    deskLabel,
    accent: editorialDeskAccent(desk),
    kindLabel: locale === "en" ? editorialKindSingular(item.kind) : CHROME[locale].editorialKinds[item.kind],
    dateline: formatDateline(item.publishedAt, locale),
    shortDateline: formatShortDateline(item.publishedAt, locale),
  });
}

export function toEntryViews(
  items: readonly EditorialItem[],
  locale: LocaleCode = "en",
): readonly EntryView[] {
  return Object.freeze(items.map((item) => toEntryView(item, locale)));
}
