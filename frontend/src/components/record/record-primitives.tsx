import type { CSSProperties, ReactNode } from "react";

import { joinClasses } from "@/components/layout/page-container";

// The primitives shared by THE SIRA RECORD's two surfaces — the Newsroom
// archive and the article detail page. They exist because the same visual rules
// genuinely repeat across both approved prototypes, not to abstract for its own
// sake: each one below appears on both pages.

export type AccentStyle = CSSProperties & {
  readonly "--desk-accent"?: string;
};

/** Hands a desk accent to the CSS rules that read `--desk-accent`. */
export function accentStyle(accent: string): AccentStyle {
  return { "--desk-accent": accent };
}

interface RecordShellProps {
  readonly children: ReactNode;
  readonly label?: string;
}

/**
 * The sheet.
 *
 * A ruled page laid on a slightly darker ground — the single strongest thing
 * the prototypes do, and what makes the newsroom read as a printed record
 * rather than a web page. Full-bleed below the small step, bordered above it.
 */
export function RecordShell({ children, label }: RecordShellProps) {
  return (
    <div className="record-ground">
      <div className="record-wrap">
        <section className="record-shell" aria-label={label}>
          {children}
        </section>
      </div>
    </div>
  );
}

interface EyebrowProps {
  readonly children: ReactNode;
  readonly accent?: string | undefined;
  readonly className?: string;
}

/**
 * The metadata eyebrow: a short accent rule, then uppercase facts.
 *
 * Distinct from the site-wide SectionEyebrow, which is a section heading device
 * on the marketing pages. This one labels a RECORD — a desk, a format, a date —
 * and is set tighter and smaller.
 */
export function RecordEyebrow({ children, accent, className }: EyebrowProps) {
  return (
    <p
      className={joinClasses(
        "flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[9px] font-extrabold uppercase tracking-[0.14em]",
        className,
      )}
      style={accent === undefined ? undefined : { color: accent }}
    >
      <span
        aria-hidden="true"
        className="block h-px w-6 shrink-0"
        style={{ background: accent ?? "currentColor" }}
      />
      {children}
    </p>
  );
}

interface SignalProps {
  readonly index: string;
  readonly tag: string;
  readonly statement: string;
  readonly footer: string;
  readonly accent: string;
  readonly className?: string;
}

/**
 * The dark signal panel.
 *
 * Editorial counterweight to a headline, present on both prototypes. It carries
 * an index, a desk tag, one short statement and a footer label — never a
 * promotion, and never an invented fact: every value is passed in from resolved
 * CMS data or a safe structural default.
 */
export function RecordSignal({
  index,
  tag,
  statement,
  footer,
  accent,
  className,
}: SignalProps) {
  return (
    <aside
      className={joinClasses(
        "record-signal flex flex-col justify-between gap-8 p-6 sm:p-7",
        className,
      )}
    >
      <div>
        <p
          className="font-display text-[clamp(3.25rem,5vw,4rem)] leading-[0.8] tracking-[-0.05em]"
          style={{ color: accent }}
        >
          {index}
        </p>
        <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.15em] text-brand-paper/65">
          {tag}
        </p>
        <span
          aria-hidden="true"
          className="mt-3.5 mb-4 block h-0.5 w-[3.375rem]"
          style={{ background: accent }}
        />
        <p className="max-w-[18ch] font-display text-[1.1875rem] leading-[1.24]">
          {statement}
        </p>
      </div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-brand-paper/55">
        {footer}
      </p>
    </aside>
  );
}

interface EndBarProps {
  readonly statement: string;
  readonly supporting: string;
  readonly trailing: ReactNode;
}

/**
 * The ink bar that closes both pages.
 *
 * On the archive it states what the record is and counts it; on an article it
 * offers the way back. Same bar, different trailing content, so the two pages
 * end in the same voice.
 */
export function RecordEndBar({ statement, supporting, trailing }: EndBarProps) {
  return (
    <div className="record-pad flex flex-col items-start justify-between gap-4 bg-brand-deep pb-6 pt-[1.3125rem] text-brand-paper sm:flex-row sm:items-end">
      <div>
        <strong className="block font-display text-xl font-normal">
          {statement}
        </strong>
        <p className="mt-1.5 text-[10px] leading-relaxed text-brand-paper/60">
          {supporting}
        </p>
      </div>
      {trailing}
    </div>
  );
}

interface RailEntryProps {
  readonly label: string;
  readonly value: string;
}

/** One label/value pair in the article's metadata rail. */
export function RecordRailEntry({ label, value }: RailEntryProps) {
  return (
    <div>
      <p className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-brand-ink-soft">
        {label}
      </p>
      <p className="mt-1 font-display text-[0.9375rem] leading-snug text-brand-ink">
        {value}
      </p>
    </div>
  );
}
