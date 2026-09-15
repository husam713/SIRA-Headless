import Link from "next/link";

import {
  accentStyle,
  RecordEyebrow,
  RecordSignal,
} from "@/components/record/record-primitives";
import type { EntryView } from "@/lib/editorial/entry-view";

// The archive's one dominant story: editorial on the left, dark signal on the
// right. The lead is chosen by the composition rule, not by an invented CMS
// concept — see composeNewsroom.

interface NewsroomLeadProps {
  readonly entry: EntryView;
  /** Short editorial context for the signal panel. */
  readonly signalStatement: string;
  readonly signalFooter: string;
}

export function NewsroomLead({
  entry,
  signalStatement,
  signalFooter,
}: NewsroomLeadProps) {
  const { item } = entry;

  return (
    <article
      className="record-split record-rule"
      style={accentStyle(entry.accent)}
    >
      <div className="record-pad flex min-w-0 flex-col justify-between gap-6 py-7">
        <div>
          <RecordEyebrow accent={entry.accent}>
            <span className="text-brand-ink">
              {entry.deskLabel} &middot; {entry.kindLabel}
            </span>
            {entry.dateline !== null ? (
              <time
                dateTime={item.publishedAt ?? undefined}
                dir="ltr"
                className="text-brand-ink-soft"
              >
                {entry.dateline}
              </time>
            ) : null}
          </RecordEyebrow>

          <h2 className="mt-7 max-w-[15ch] font-display text-[clamp(1.8125rem,5vw,3.375rem)] font-normal leading-[0.98] tracking-[-0.035em]">
            {entry.href === null ? (
              item.title
            ) : (
              <Link href={entry.href} className="transition-colors hover:text-brand-accent">
                {item.title}
              </Link>
            )}
          </h2>

          {item.excerpt !== null ? (
            <p className="mt-4 max-w-[57ch] text-sm leading-[1.65] text-brand-ink-soft">
              {item.excerpt}
            </p>
          ) : null}
        </div>

        {entry.href === null ? null : (
          <p>
            <Link
              href={entry.href}
              className="group inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-brand-ink"
            >
              Read the lead story
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </p>
        )}
      </div>

      <RecordSignal
        index="01"
        tag={`Lead signal / ${entry.deskLabel}`}
        statement={signalStatement}
        footer={signalFooter}
        accent={entry.accent}
      />
    </article>
  );
}
