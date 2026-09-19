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

// THE SIRA RECORD — the archive.
//
// One reusable implementation instantiated per tenant (ADR-020). The route
// resolves site, brand and feed; every decision about what the page IS lives
// here, which is what lets the preview harness render the production page
// rather than a copy of it.
//
// Server Component throughout. Filtering is server-rendered through real links,
// so the archive ships no JavaScript of its own.

export interface NewsroomPageProps {
  readonly siteKey: SiteKey;
  readonly brandName: string;
  readonly items: readonly EditorialItem[];
  readonly desk: EditorialDeskKey | null;
  readonly kind: EditorialKind | null;
  readonly isFailure: boolean;
  /** False off the canonical production hostname; drives the placeholder note. */
  readonly isProductionCanonical?: boolean;
}

/**
 * The signal panel's statement.
 *
 * Structural, not factual: it names what the record is and which desk is
 * leading it. Fabricating a business claim to fill a panel is exactly what the
 * design must not do, so nothing here asserts anything about the world.
 */
function signalStatement(deskLabel: string, isGroup: boolean): string {
  return isGroup
    ? "Long-term capital. Specialised operators. One house."
    : `${deskLabel} — one desk of the SIRA record.`;
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

  // Everything below the lead, still in one chronological order. The front row
  // the previous visual iteration used is gone: the approved prototype runs a
  // single register, and a separate "front" would break its rhythm.
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
        placesLine={isProductionCanonical ? null : "PLACEHOLDER EDITORIAL · NOT SIRA ANNOUNCEMENTS"}
      />

      {items.length > 0 ? (
        <DeskFilters
          options={filters}
          label={isGroup ? "Filter the record by desk" : "Filter the record by format"}
        />
      ) : null}

      {leadEntry !== null ? (
        <NewsroomLead
          entry={leadEntry}
          signalStatement={signalStatement(leadEntry.deskLabel, isGroup)}
          signalFooter={`The Record / ${isGroup ? "SIRA GROUP" : brandName}`}
        />
      ) : (
        <EmptyRecord
          filterLabel={
            activeDesk !== null || activeKind !== null ? activeLabel : null
          }
          brandName={brandName}
          isFailure={isFailure}
        />
      )}

      {bands.length > 0 ? (
        <>
          <div className="record-pad record-aside pb-4 pt-7">
            <h2 className="font-display text-[1.625rem] font-normal leading-none">
              Across the house
            </h2>
            <p className="max-w-[58ch] text-xs leading-[1.6] text-brand-ink-soft">
              A compact editorial register rather than a card wall. Every entry
              keeps its own business-unit identity while remaining part of one
              institutional record.
            </p>
          </div>

          {bands.map((band, index) => (
            <section key={band.year} aria-labelledby={`record-year-${band.year}`}>
              {/*
                The first band needs no year rule: it opens directly beneath the
                desk head and is the current year by construction. Every later
                band announces itself, which is what turns a long archive into a
                chronology instead of a scroll.
              */}
              {index > 0 ? (
                <div className="record-pad record-aside record-rule bg-brand-tint/60 py-[1.375rem]">
                  <h3
                    id={`record-year-${band.year}`}
                    className="font-display text-[3rem] leading-[0.9] tabular-nums"
                  >
                    {band.year}
                  </h3>
                  <p className="max-w-[60ch] self-center text-xs leading-[1.55] text-brand-ink-soft">
                    {band.entries.length}{" "}
                    {band.entries.length === 1 ? "entry" : "entries"} filed in{" "}
                    {band.year}. The archive continues as a chronological record,
                    not an endless grid.
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
        statement="The record compounds."
        supporting="Investment, operations and perspective across the SIRA house."
        trailing={
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-paper/60">
            {countLine}
          </span>
        }
      />
    </RecordShell>
  );
}

interface EmptyRecordProps {
  readonly filterLabel: string | null;
  readonly brandName: string;
  readonly isFailure: boolean;
}

/**
 * Three different nothings, said differently.
 *
 * A filter that matched nothing, a record not yet opened, and a feed that
 * failed are not the same event; saying "no articles" for all three hides a
 * fault behind what looks like ordinary emptiness.
 */
function EmptyRecord({ filterLabel, brandName, isFailure }: EmptyRecordProps) {
  const message = isFailure
    ? "The record could not be loaded just now. This is a fault on our side, not an empty archive — please try again shortly."
    : filterLabel !== null
      ? `Nothing has been filed under ${filterLabel} yet.`
      : `${brandName} has not filed to the record yet. Announcements and analysis appear here first.`;

  return (
    <div className="record-pad record-rule py-12">
      <p className="max-w-[46ch] font-display text-[clamp(1.125rem,2vw,1.5rem)] leading-[1.4] text-brand-ink-soft">
        {message}
      </p>
      {filterLabel !== null ? (
        <p className="mt-6">
          <Link
            href="/news"
            className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-brand-accent underline underline-offset-4"
          >
            View the whole record
          </Link>
        </p>
      ) : null}
    </div>
  );
}
