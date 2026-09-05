import type { EditorialItem, EditorialKind } from "@/lib/editorial/types";

// The newsroom is organised by kind and by year, because those are the two
// things the feed actually carries for every item. Business unit is not on
// EditorialItem — the feed filters by it at the route level rather than
// exposing it per node — so colouring or grouping by unit would mean
// inventing data the CMS has not given us.

export const EDITORIAL_KINDS: readonly EditorialKind[] = Object.freeze([
  "news",
  "insight",
  "article",
  "press-release",
]);

const KIND_LABEL: Readonly<Record<EditorialKind, string>> = Object.freeze({
  news: "News",
  insight: "Insights",
  article: "Articles",
  "press-release": "Press",
});

const KIND_SINGULAR: Readonly<Record<EditorialKind, string>> = Object.freeze({
  news: "News",
  insight: "Insight",
  article: "Article",
  "press-release": "Press Release",
});

export function editorialKindLabel(kind: EditorialKind): string {
  return KIND_LABEL[kind];
}

export function editorialKindSingular(kind: EditorialKind): string {
  return KIND_SINGULAR[kind];
}

export function isEditorialKind(value: string): value is EditorialKind {
  return (EDITORIAL_KINDS as readonly string[]).includes(value);
}

/**
 * Resolve the `kind` search parameter, which may arrive absent, repeated, or
 * as something nobody offered. Anything unrecognised falls back to the
 * unfiltered index rather than rendering an empty archive.
 */
export function resolveKindFilter(
  value: string | readonly string[] | undefined,
): EditorialKind | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== "string") return null;
  return isEditorialKind(candidate) ? candidate : null;
}

export interface EditorialKindCount {
  readonly kind: EditorialKind;
  readonly label: string;
  readonly count: number;
}

/** Counts per kind, in a fixed order, including the kinds with none. */
export function countByKind(
  items: readonly EditorialItem[],
): readonly EditorialKindCount[] {
  return Object.freeze(
    EDITORIAL_KINDS.map((kind) =>
      Object.freeze({
        kind,
        label: KIND_LABEL[kind],
        count: items.filter((item) => item.kind === kind).length,
      }),
    ),
  );
}

export interface EditorialYear {
  readonly year: string;
  readonly items: readonly EditorialItem[];
}

/**
 * Publication year, or null when the date is absent or unparseable.
 *
 * The feed normalizer already rejects an invalid date string, but an item may
 * legitimately carry no date at all.
 */
export function publicationYear(item: EditorialItem): string | null {
  if (item.publishedAt === null) return null;
  const date = new Date(item.publishedAt);
  if (Number.isNaN(date.getTime())) return null;
  return String(date.getUTCFullYear());
}

/**
 * Group items into year bands, preserving the feed's newest-first order both
 * between bands and inside them.
 *
 * Undated items collect into one trailing band rather than being dropped: the
 * archive should account for everything it was given.
 */
export function groupByYear(
  items: readonly EditorialItem[],
): readonly EditorialYear[] {
  const bands = new Map<string, EditorialItem[]>();
  const undated: EditorialItem[] = [];

  for (const item of items) {
    const year = publicationYear(item);

    if (year === null) {
      undated.push(item);
      continue;
    }

    const band = bands.get(year);
    if (band === undefined) {
      bands.set(year, [item]);
    } else {
      band.push(item);
    }
  }

  const dated = [...bands.entries()]
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, band]) =>
      Object.freeze({ year, items: Object.freeze([...band]) }),
    );

  return Object.freeze(
    undated.length === 0
      ? dated
      : [...dated, Object.freeze({ year: "Undated", items: Object.freeze([...undated]) })],
  );
}

/** Inclusive span of publication years, for the masthead's archive line. */
export function yearSpan(items: readonly EditorialItem[]): string | null {
  const years = items
    .map(publicationYear)
    .filter((year): year is string => year !== null)
    .map(Number);

  if (years.length === 0) return null;

  const earliest = Math.min(...years);
  const latest = Math.max(...years);

  return earliest === latest ? String(latest) : `${earliest}–${latest}`;
}
