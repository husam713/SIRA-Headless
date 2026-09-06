import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import {
  EntryFigure,
  EntryRegister,
  EntrySummary,
  EntryTitle,
  turnStyle,
} from "@/components/newsroom/entry-parts";
import type { EntryView } from "@/lib/editorial/entry-view";

// The lead, in two treatments — because roughly half of what this CMS holds
// carries no featured image, and a design that assumes one opens the record
// with a grey rectangle.
//
// WITH an image, the two halves interlock: from lg the picture runs off the
// leading edge of the page and the text plate is laid across its trailing edge,
// overlapping by a column. Two systems that overlap without merging is the
// shape of the SIRA mark and the shape of the business; it is also simply the
// strongest way to stop a lead reading as the first cell of the grid below it.
//
// WITHOUT an image the lead becomes typographic: the headline takes the full
// measure at display scale and the summary carries the spread. Nothing is
// reserved for a picture that does not exist.

interface NewsroomLeadProps {
  readonly entry: EntryView;
  readonly secondary: "desk" | "kind";
}

export function NewsroomLead({ entry, secondary }: NewsroomLeadProps) {
  const style = turnStyle(entry);

  if (entry.item.featuredImage === null) {
    return (
      <Section space="tight" label="Lead entry">
        <PageContainer>
          <article className="turn grid gap-x-[var(--layout-grid-gap)] gap-y-8 pt-8 lg:grid-cols-12" style={style}>
            <EntryRegister
              entry={entry}
              secondary={secondary}
              layout="stack"
              className="lg:col-span-2"
            />
            <div className="lg:col-span-10">
              {/*
                The measure belongs on the heading, not on a wrapper: `ch` is
                computed from the element's own font-size, so a wrapper set at
                body size gives a display heading roughly a quarter of the
                measure it appears to ask for.
              */}
              <h2 className="max-w-[16ch] text-[clamp(2.25rem,6vw,4.5rem)]">
                <EntryTitle entry={entry} />
              </h2>
              {entry.item.excerpt !== null ? (
                <EntrySummary className="mt-8 max-w-[52ch] text-[clamp(1.125rem,2vw,1.5rem)] leading-[1.5]">
                  {entry.item.excerpt}
                </EntrySummary>
              ) : null}
            </div>
          </article>
        </PageContainer>
      </Section>
    );
  }

  return (
    <Section space="tight" label="Lead entry">
      <PageContainer>
        <article className="lead">
          <div className="lead__figure">
            <EntryFigure
              entry={entry}
              aspect="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[5/4]"
              priority
              sizes="(min-width: 68.75rem) 66vw, 100vw"
            />
          </div>

          <div className="lead__plate mt-8 lg:mt-0" style={style}>
            <div className="turn pt-7">
              <EntryRegister entry={entry} secondary={secondary} />
              <h2 className="mt-6 max-w-[17ch] text-[clamp(1.875rem,3.4vw,3.125rem)]">
                <EntryTitle entry={entry} />
              </h2>
              {entry.item.excerpt !== null ? (
                <EntrySummary className="mt-6 max-w-[44ch] text-[1.0625rem] leading-[1.65]">
                  {entry.item.excerpt}
                </EntrySummary>
              ) : null}
            </div>
          </div>
        </article>
      </PageContainer>
    </Section>
  );
}
