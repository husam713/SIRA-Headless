import { NEWSROOM_COPY } from "@/lib/editorial/newsroom-copy";
import { CHROME, localizeUnitLabel } from "@/lib/i18n/locale";
import type { LocaleCode } from "@/types/site";
import {
  deskRegister,
  editorialDeskLabel,
  EDITORIAL_DESK_ORDER,
} from "@/lib/editorial/desks";
import { countByKind, editorialKindLabel } from "@/lib/editorial/record";
import type {
  EditorialDeskKey,
  EditorialItem,
  EditorialKind,
} from "@/lib/editorial/types";
import type { SiteKey } from "@/types/site";

// The filter row's data, built from the loaded record.
//
// The archive filters by DESK on SIRA GROUP, because the question a reader
// brings to a holding company's newsroom is which house filed a story. A branch
// tenant has exactly one desk, so filtering by it would be a row of one; there
// the same row filters by FORMAT instead. One component, one URL model, two
// axes chosen by tenant.

export interface DeskFilterOption {
  readonly key: string;
  readonly label: string;
  readonly href: string;
  /** Null where a count would mislead, e.g. the unfiltered entry. */
  readonly count: number | null;
  readonly isActive: boolean;
}

export function buildDeskFilters(
  siteKey: SiteKey,
  items: readonly EditorialItem[],
  activeDesk: EditorialDeskKey | null,
  activeKind: EditorialKind | null,
  locale: LocaleCode = "en",
): readonly DeskFilterOption[] {
  const copy = NEWSROOM_COPY[locale];
  const base = locale === "en" ? "/news" : `/${locale}/news`;
  if (siteKey === "group") {
    return Object.freeze([
      {
        key: "all",
        label: copy.allDesks,
        href: base,
        count: items.length,
        isActive: activeDesk === null,
      },
      ...EDITORIAL_DESK_ORDER.map((desk) => {
        const row = deskRegister(items).find((entry) => entry.desk === desk);

        return {
          key: desk,
          label:
            locale === "en"
              ? editorialDeskLabel(desk)
              : desk === "group"
                ? CHROME[locale].siteNames.group
                : (localizeUnitLabel(locale, desk, editorialDeskLabel(desk)) ?? editorialDeskLabel(desk)),
          href: `${base}?desk=${desk}`,
          count: row?.count ?? 0,
          isActive: activeDesk === desk,
        };
      }),
    ]);
  }

  return Object.freeze([
    {
      key: "all",
      label: copy.everything,
      href: base,
      count: items.length,
      isActive: activeKind === null,
    },
    ...countByKind(items).map((entry) => ({
      key: entry.kind,
      label: locale === "en" ? editorialKindLabel(entry.kind) : CHROME[locale].editorialKinds[entry.kind],
      href: `${base}?kind=${entry.kind}`,
      count: entry.count,
      isActive: activeKind === entry.kind,
    })),
  ]);
}

/**
 * The masthead's issue line.
 *
 * Derived, never invented. The prototype showed "ISSUE 09 · 2026"; a real issue
 * number does not exist in this content model, so the line reports the extent
 * of the record instead — how much of it there is and what it covers — which is
 * the same signal the design was carrying and is true.
 */
export function buildIssueLine(
  items: readonly EditorialItem[],
  span: string | null,
  locale: LocaleCode = "en",
): string | null {
  if (items.length === 0) return null;

  const entries = NEWSROOM_COPY[locale].entries(items.length);

  return span === null ? entries : `${entries} · ${span}`;
}
