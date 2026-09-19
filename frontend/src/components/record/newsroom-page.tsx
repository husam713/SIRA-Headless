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
import type { SiteKey } from "@/types/site";

export interface NewsroomPageProps {
  readonly siteKey: SiteKey;
  readonly brandName: string;
  readonly items: readonly EditorialItem[];
  readonly desk: EditorialDeskKey | null;
  readonly kind: EditorialKind | null;
  readonly isFailure: boolean;
  readonly isProductionCanonical?: boolean;
}

export function NewsroomPage({
  siteKey,
  brandName,
  items,
  desk,
  kind,
  isFailure,
  isProductionCanonical = true,
}: NewsroomPageProps) {
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
  const leadEntry = lead === null ? null : toEntryViews([lead])[0]!;
  const bands = record.map((band) => ({
    year: band.year,
    entries: toEntryViews(band.items),
  }));
  const filters = buildDeskFilters(siteKey, items, activeDesk, activeKind);
  const issueLine = buildIssueLine(items, yearSpan(items));
  const activeLabel =
    activeDesk !== null
      ? editorialDeskLabel(activeDesk)
      : activeKind !== null
        ? editorialKindLabel(activeKind)
        : isGroup
          ? "all desks"
          : "everything";
  const countLine = `${selected.length} ${selected.length === 1 ? "story" : "stories"} · ${activeLabel.toLowerCase()}`;

  return (
    <RecordShell label={`${brandName} newsroom`}>
      <NewsroomMasthead
        kicker={`${isGroup ? "SIRA GROUP" : brandName} · Newsroom`}
        issueLine={issueLine}
        placesLine={
          isProductionCanonical
            ? null
            : "PLACEHOLDER EDITORIAL · NOT SIRA ANNOUNCEMENTS"
        }
      />

      {items.length > 0 ? (
        <DeskFilters
          options={filters}
          label={isGroup ? "Filter insights by desk" : "Filter insights by format"}
        />
      ) : null}

      {leadEntry !== null ? (
        <NewsroomLead entry={leadEntry} />
      ) : (
        <EmptyNewsroom
          filterLabel={activeDesk !== null || activeKind !== null ? activeLabel : null}
          brandName={brandName}
          isFailure={isFailure}
        />
      )}

      {bands.length > 0 ? (
        <>
          <div className="newsroom-section-head">
            <h2>Latest insights</h2>
            <p>{countLine}</p>
          </div>

          {bands.map((band, index) => (
            <section key={band.year} aria-labelledby={`record-year-${band.year}`}>
              {index > 0 ? (
                <div className="newsroom-year">
                  <h3 id={`record-year-${band.year}`}>{band.year}</h3>
                  <p>
                    {band.entries.length} {band.entries.length === 1 ? "story" : "stories"}
                  </p>
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
        statement="Keep exploring."
        supporting={`${brandName} perspectives, updates and analysis.`}
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
}

function EmptyNewsroom({ filterLabel, brandName, isFailure }: EmptyNewsroomProps) {
  const message = isFailure
    ? "The insights could not be loaded just now. Please try again shortly."
    : filterLabel !== null
      ? `Nothing has been published under ${filterLabel} yet.`
      : `${brandName} has not published insights yet.`;

  return (
    <div className="newsroom-empty">
      <p>{message}</p>
      {filterLabel !== null ? (
        <Link href="/news">View all insights</Link>
      ) : null}
    </div>
  );
}
