import Link from "next/link";

import { NewsroomLead } from "@/components/record/newsroom-lead";
import {
  DeskFilters,
  NewsroomMasthead,
} from "@/components/record/newsroom-masthead";
import { RecordEndBar, RecordShell } from "@/components/record/record-primitives";
import { StoryCell } from "@/components/record/story-cell";
import { buildDeskFilters, buildIssueLine } from "@/lib/editorial/desk-filters";
import { editorialDeskLabel } from "@/lib/editorial/desks";
import { toEntryViews } from "@/lib/editorial/entry-view";
import {
  composeNewsroom,
  editorialKindLabel,
  yearSpan,
} from "@/lib/editorial/record";
import type {
  EditorialDeskKey,
  EditorialItem,
  EditorialKind,
} from "@/lib/editorial/types";
import { NEWSROOM_COPY } from "@/lib/editorial/newsroom-copy";
import type { LocaleCode, SiteKey } from "@/types/site";

export interface NewsroomPageProps {
  readonly siteKey: SiteKey;
  readonly brandName: string;
  readonly items: readonly EditorialItem[];
  readonly desk: EditorialDeskKey | null;
  readonly kind: EditorialKind | null;
  readonly isFailure: boolean;
  /** Kept for the route's call; the newsroom no longer marks itself off-canonical (content is final, 2026-09-18). */
  readonly isProductionCanonical?: boolean;
  /** The page's language; the chrome speaks it, the entries speak their own. */
  readonly locale?: LocaleCode;
}

export function NewsroomPage({
  siteKey,
  brandName,
  items,
  desk,
  kind,
  isFailure,
  locale = "en",
}: NewsroomPageProps) {
  const copy = NEWSROOM_COPY[locale];
  const isGroup = siteKey === "group";
  const activeDesk = isGroup ? desk : null;
  const activeKind = isGroup ? null : kind;
  const selected =
    activeDesk !== null
      ? items.filter((item) => item.desks.includes(activeDesk))
      : activeKind !== null
        ? items.filter((item) => item.kind === activeKind)
        : items;
  const { lead, record } = composeNewsroom(selected);
  const leadEntry = lead === null ? null : toEntryViews([lead], locale)[0]!;
  const bands = record.map((band) => ({
    year: band.year,
    entries: toEntryViews(band.items, locale),
  }));
  const filters = buildDeskFilters(siteKey, items, activeDesk, activeKind, locale);
  const issueLine = buildIssueLine(items, yearSpan(items), locale);
  const activeLabel =
    activeDesk !== null
      ? (filters.find((option) => option.isActive)?.label ?? editorialDeskLabel(activeDesk))
      : activeKind !== null
        ? (filters.find((option) => option.isActive)?.label ?? editorialKindLabel(activeKind))
        : isGroup
          ? copy.allDesks
          : copy.everything;
  const countLine = `${copy.stories(selected.length)} · ${activeLabel.toLowerCase()}`;

  return (
    <RecordShell label={`${brandName} newsroom`}>
      <NewsroomMasthead
        kicker={`${isGroup ? "SIRA GROUP" : brandName} · ${copy.newsroom}`}
        title={copy.title}
        issueLine={issueLine}
        placesLine={null}
      />

      {items.length > 0 ? (
        <DeskFilters
          options={filters}
          label={isGroup ? copy.filterByDesk : copy.filterByFormat}
        />
      ) : null}

      {leadEntry !== null ? (
        <NewsroomLead entry={leadEntry} readLabel={copy.readTheStory} />
      ) : (
        <EmptyNewsroom
          filterLabel={activeDesk !== null || activeKind !== null ? activeLabel : null}
          brandName={brandName}
          isFailure={isFailure}
          locale={locale}
        />
      )}

      {bands.length > 0 ? (
        <>
          <div className="newsroom-section-head">
            <h2>{copy.latest}</h2>
            <p>{countLine}</p>
          </div>

          {bands.map((band, index) => (
            <section key={band.year} aria-labelledby={`record-year-${band.year}`}>
              {index > 0 ? (
                <div className="newsroom-year">
                  <h3 id={`record-year-${band.year}`}>{band.year}</h3>
                  <p>{copy.stories(band.entries.length)}</p>
                </div>
              ) : (
                <h3 id={`record-year-${band.year}`} className="sr-only">
                  {band.year}
                </h3>
              )}
              <div className="record-register">
                {band.entries.map((entry) => (
                  <StoryCell key={entry.item.databaseId} entry={entry} />
                ))}
              </div>
            </section>
          ))}
        </>
      ) : null}

      <RecordEndBar
        statement={copy.keepExploring}
        supporting={copy.keepExploringLead(brandName)}
        trailing={
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-paper/60">
            {countLine}
          </span>
        }
      />
    </RecordShell>
  );
}

interface EmptyNewsroomProps {
  readonly filterLabel: string | null;
  readonly brandName: string;
  readonly isFailure: boolean;
  readonly locale: LocaleCode;
}

function EmptyNewsroom({ filterLabel, brandName, isFailure, locale }: EmptyNewsroomProps) {
  const copy = NEWSROOM_COPY[locale];
  const message = isFailure
    ? copy.couldNotLoad
    : filterLabel !== null
      ? copy.nothingFor(filterLabel)
      : copy.nothingYet(brandName);

  return (
    <div className="newsroom-empty">
      <p>{message}</p>
      {filterLabel !== null ? (
        <Link href={locale === "en" ? "/news" : `/${locale}/news`}>{copy.viewAll}</Link>
      ) : null}
    </div>
  );
}
