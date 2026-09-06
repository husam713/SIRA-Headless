import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import {
  EntryRegister,
  EntrySummary,
  EntryTitle,
  turnStyle,
} from "@/components/newsroom/entry-parts";
import type { EntryView } from "@/lib/editorial/entry-view";

// The record: everything the front did not compose, indexed.
//
// This is the part that has to still work at five hundred entries, so it is
// dense, uniform and scannable — and it is where the design idea pays for
// itself. Every entry carries the same right-angled corner mark in its desk's
// accent, set in a margin of its own, so scrolling the archive draws a coloured
// comb down the leading edge: the composition of the house, readable at a
// glance, with no badges and no legend.
//
// Years are quiet rules rather than a display-scale spine. The comb is the
// visual event; the year only needs to say where you are.

interface NewsroomRecordBand {
  readonly year: string;
  readonly entries: readonly EntryView[];
}

interface NewsroomRecordProps {
  readonly bands: readonly NewsroomRecordBand[];
  readonly secondary: "desk" | "kind";
}

interface RecordEntryProps {
  readonly entry: EntryView;
  readonly secondary: "desk" | "kind";
}

function RecordEntry({ entry, secondary }: RecordEntryProps) {
  return (
    <article className="record-entry turn" style={turnStyle(entry)}>
      <EntryRegister entry={entry} secondary={secondary} layout="stack" />

      <div className="min-w-0">
        <h3 className="max-w-[46ch] text-[clamp(1.1875rem,1.5vw,1.4375rem)]">
          <EntryTitle entry={entry} />
        </h3>
        {entry.item.excerpt !== null ? (
          <EntrySummary className="clamp-2 mt-2.5 max-w-[68ch] text-[0.9375rem] leading-[1.6]">
            {entry.item.excerpt}
          </EntrySummary>
        ) : null}
      </div>

      {/*
        The kind gets the trailing column only on Group, and only where there
        is room to set it without squeezing the headline. On a branch the
        register already reports the kind, and repeating it here would print
        the same word twice across one row.
      */}
      {secondary === "desk" ? (
        <p className="hidden text-end text-[11px] font-bold uppercase tracking-[0.13em] text-brand-ink-soft lg:block">
          {entry.kindLabel}
        </p>
      ) : null}
    </article>
  );
}

export function NewsroomRecord({ bands, secondary }: NewsroomRecordProps) {
  if (bands.length === 0) return null;

  return (
    <Section space="tight" label="The record">
      <PageContainer>
        {bands.map((band) => (
          <section
            key={band.year}
            aria-labelledby={`record-band-${band.year}`}
            className="[&+&]:mt-16"
          >
            <h2
              id={`record-band-${band.year}`}
              className="flex items-baseline justify-between gap-4 border-t border-brand-ink pt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-ink"
            >
              <span className="tabular-nums">{band.year}</span>
              <span className="tabular-nums font-semibold text-brand-ink-soft">
                {band.entries.length}
                <span className="sr-only"> entries</span>
              </span>
            </h2>

            {band.entries.map((entry) => (
              <RecordEntry
                key={entry.item.databaseId}
                entry={entry}
                secondary={secondary}
              />
            ))}
          </section>
        ))}
      </PageContainer>
    </Section>
  );
}

export type { NewsroomRecordBand };
