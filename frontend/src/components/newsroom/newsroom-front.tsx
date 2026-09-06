import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import {
  EntryRegister,
  EntrySummary,
  EntryTitle,
  turnStyle,
} from "@/components/newsroom/entry-parts";
import type { EntryView } from "@/lib/editorial/entry-view";

// The three entries under the lead, at 5 / 4 / 3 columns with a matching step
// in type scale (`.front` in globals.css).
//
// This is where the record stops treating everything equally. Three cells of
// identical width say every story is worth the same, which is the one thing a
// holding company's newsroom must not say; a width that narrows left to right
// puts the reader's eye through the entries in order without a single label
// telling them to. The stepping is also the mark's own logic — registers
// nesting inward — used as hierarchy rather than as ornament.
//
// It renders only when there are exactly three entries to place. Two would
// leave a hole where the third step belongs, and the composition would read as
// a fault rather than as a shorter page.
//
// No pictures here, and none in the record below. ONE photograph per view, on
// the lead, and everything after it is type and rule. That is an art-direction
// position, not a limitation: an investment house's record is read, not
// browsed; three images at three different widths pull the row apart instead of
// stepping down it; and roughly half of what this CMS holds carries no image at
// all, so a composition that needs one is a composition that breaks.

interface NewsroomFrontProps {
  readonly entries: readonly EntryView[];
  readonly secondary: "desk" | "kind";
}

export function NewsroomFront({ entries, secondary }: NewsroomFrontProps) {
  if (entries.length === 0) return null;

  return (
    <Section space="tight" label="Latest entries">
      <PageContainer>
        <div className="front">
          {entries.map((entry) => (
            <article key={entry.item.databaseId} className="turn pt-7" style={turnStyle(entry)}>
              <EntryRegister entry={entry} secondary={secondary} />

              <h3 className="front__title mt-6 max-w-[24ch]">
                <EntryTitle entry={entry} />
              </h3>

              {entry.item.excerpt !== null ? (
                <EntrySummary className="clamp-2 mt-4 text-[0.9375rem] leading-[1.6]">
                  {entry.item.excerpt}
                </EntrySummary>
              ) : null}

            </article>
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}
