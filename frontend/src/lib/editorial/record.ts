import type {
  EditorialItem,
  EditorialKind,
} from "@/lib/editorial/types";

// The newsroom's own vocabulary, kept out of the components so the page reads
// as composition and this file carries the editorial rules.

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
 * Resolve the `kind` search parameter, which may arrive absent, repeated, or as
 * something nobody offered. Anything unrecognised falls back to the whole
 * record rather than rendering an empty archive.
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
  readonly share: number;
}

/** Counts per kind, in a fixed order, including the kinds with none. */
export function countByKind(
  items: readonly EditorialItem[],
): readonly EditorialKindCount[] {
  return Object.freeze(
    EDITORIAL_KINDS.map((kind) => {
      const count = items.filter((item) => item.kind === kind).length;

      return Object.freeze({
        kind,
        label: KIND_LABEL[kind],
        count,
        share: items.length === 0 ? 0 : count / items.length,
      });
    }),
  );
}

/**
 * WordPress emits `date` as site-local wall-clock time with no offset —
 * "2026-01-01T00:00:00", not "...Z" and not "...+03:00".
 *
 * `new Date()` reads that as the SERVER's local time, so the same entry lands
 * on a different calendar day depending on where the render happened: an entry
 * an editor dated 1 January renders as 31 December on any server ahead of UTC.
 * Pinning the wall clock to UTC makes the calendar date an editor entered the
 * calendar date every reader sees, on every server, in every timezone.
 *
 * A string that DOES carry an offset is an instant, and is converted normally.
 */
const WALL_CLOCK = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/u;

export function calendarDate(value: string | null): Date | null {
  if (typeof value !== "string") return null;

  const wallClock = WALL_CLOCK.exec(value.trim());

  if (wallClock !== null) {
    return new Date(
      Date.UTC(
        Number(wallClock[1]),
        Number(wallClock[2]) - 1,
        Number(wallClock[3]),
      ),
    );
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Publication year, or null when the date is absent or unparseable.
 *
 * The feed normalizer already rejects an invalid date string, but an item may
 * legitimately carry no date at all.
 */
export function publicationYear(item: EditorialItem): string | null {
  const date = calendarDate(item.publishedAt);
  return date === null ? null : String(date.getUTCFullYear());
}

/** Inclusive span of publication years, for the masthead's extent block. */
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

export interface EditorialYear {
  readonly year: string;
  readonly items: readonly EditorialItem[];
}

/**
 * Group items into year bands, preserving the feed's newest-first order both
 * between bands and inside them.
 *
 * Undated items collect into one trailing band rather than being dropped: the
 * record should account for everything it was given.
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
      : [
          ...dated,
          Object.freeze({
            year: "Undated",
            items: Object.freeze([...undated]),
          }),
        ],
  );
}

export interface ComposedNewsroom {
  /** The newest entry, given the page's full weight. Null on an empty view. */
  readonly lead: EditorialItem | null;
  /** Every remaining entry, as dated bands. */
  readonly record: readonly EditorialYear[];
}

/**
 * Split a feed into the two weights the page composes.
 *
 * Position, not category, assigns the weight. The feed is already ordered
 * newest-first by the CMS, so this says only "the most recent entry leads, the
 * rest are indexed" — it does not invent an importance ranking that no editor
 * entered. A filtered view is composed the same way, so it opens on its own
 * lead rather than repeating the unfiltered one.
 *
 * Nothing is discarded: lead plus record is always the whole input. An earlier
 * iteration carved a fixed-size "front" row out of the middle, and when that
 * row left the design its entries stopped rendering anywhere.
 */
export function composeNewsroom(
  items: readonly EditorialItem[],
): ComposedNewsroom {
  if (items.length === 0) {
    return Object.freeze({ lead: null, record: Object.freeze([]) });
  }

  const [lead, ...rest] = items;

  return Object.freeze({
    lead: lead ?? null,
    record: groupByYear(rest),
  });
}
