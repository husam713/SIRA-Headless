import Link from "next/link";

import type { DeskFilterOption } from "@/lib/editorial/desk-filters";

// The masthead and the desk filters — the top of the archive sheet.
//
// The prototype's issue block ("ISSUE 09 · 2026") is reproduced from data the
// production model actually has: the archive's own chronology. Where a real
// issue number cannot be derived, the line carries the record's extent instead
// of a fabricated number.

interface NewsroomMastheadProps {
  readonly kicker: string;
  readonly issueLine: string | null;
  readonly placesLine: string | null;
}

export function NewsroomMasthead({
  kicker,
  issueLine,
  placesLine,
}: NewsroomMastheadProps) {
  return (
    <header className="record-pad record-rule grid items-end gap-4 pb-4 pt-5 sm:grid-cols-[1fr_auto]">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-accent">
          {kicker}
        </p>
        <h1
          id="record-heading"
          className="mt-2.5 font-display text-[clamp(2rem,7vw,4.25rem)] font-normal leading-[0.88] tracking-[-0.045em]"
        >
          The SIRA
          <br />
          Record
        </h1>
      </div>

      {issueLine !== null || placesLine !== null ? (
        <p className="whitespace-nowrap text-[11px] leading-[1.5] text-brand-ink-soft sm:text-end">
          {issueLine}
          {issueLine !== null && placesLine !== null ? <br /> : null}
          {placesLine}
        </p>
      ) : null}
    </header>
  );
}

interface DeskFiltersProps {
  readonly options: readonly DeskFilterOption[];
  readonly label: string;
}

/**
 * The desk filters.
 *
 * Real links to real URLs, server-rendered — so a filtered view is
 * addressable, shareable, indexable, survives a refresh, and works with the
 * browser's back button. The prototype used buttons and client-side hiding;
 * that is a demonstration technique, not the production requirement.
 */
export function DeskFilters({ options, label }: DeskFiltersProps) {
  return (
    <nav
      aria-label={label}
      className="record-rule bg-white/25"
    >
      <ul className="record-pad flex gap-1.5 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((option) => (
          <li key={option.key} className="shrink-0">
            <Link
              href={option.href}
              aria-current={option.isActive ? "page" : undefined}
              className={`block whitespace-nowrap border-b-2 px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
                option.isActive
                  ? "border-brand-accent text-brand-ink"
                  : "border-transparent text-brand-ink-soft hover:text-brand-ink"
              }`}
            >
              {option.label}
              {option.count !== null ? (
                <span className="ms-1.5 tabular-nums opacity-55">{option.count}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
