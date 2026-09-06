import Link from "next/link";
import type { CSSProperties } from "react";

import { joinClasses, PageContainer } from "@/components/layout/page-container";

// The index is the page's one piece of navigation and its portrait of the
// house at the same time.
//
// One hairline runs the width of the page. Riding it, each desk carries an
// accent rule whose length is that desk's share of the loaded record — so the
// composition of the group is legible in the same gesture that lets you filter
// by it. A row of pill buttons, which is what the reference design used and
// what every corporate newsroom uses, says nothing at all.
//
// Colour is a signal here, never the information: the label and the count carry
// the meaning, so the index is fully readable without perceiving the accents.
// Several SIRA accents (gold, ochre) cannot meet AA as small text on paper,
// which is the other reason they are confined to a 3px rule.

export interface DeskIndexEntry {
  readonly key: string;
  readonly label: string;
  readonly href: string;
  readonly count: number;
  /** Share of the loaded record, 0-1. Drives the rule length only. */
  readonly share: number;
  /** Approved brand accent, or null where the axis is not a business unit. */
  readonly accent: string | null;
  readonly isActive: boolean;
}

interface DeskIndexProps {
  readonly label: string;
  readonly entries: readonly DeskIndexEntry[];
}

type RuleStyle = CSSProperties & {
  readonly "--desk-share"?: number;
  readonly "--desk-accent"?: string;
};

function Rule({ entry }: { readonly entry: DeskIndexEntry }) {
  const style: RuleStyle = {
    "--desk-share": entry.share,
    ...(entry.accent === null ? {} : { "--desk-accent": entry.accent }),
  };

  return (
    <span
      aria-hidden="true"
      className={joinClasses(
        "desk-index__rule",
        entry.count === 0 ? "desk-index__rule--empty" : undefined,
      )}
      style={style}
    />
  );
}

function Label({ entry }: { readonly entry: DeskIndexEntry }) {
  return (
    <>
      <span className="text-[11px] font-bold uppercase tracking-[0.13em]">
        {entry.label}
      </span>
      <span className="ms-2 align-baseline text-[11px] tabular-nums opacity-55">
        {entry.count}
      </span>
    </>
  );
}

/**
 * "Healthcare, 6 entries" rather than "Healthcare 6".
 *
 * Said on the control itself rather than in a visually hidden span, because
 * `sr-only` is absolutely positioned: inside the index's horizontal scroller
 * its containing block is the sticky nav, not the scroller, so at mobile widths
 * six of them sat up to 500px past the viewport and made the whole page scroll
 * sideways. An accessible name costs no box at all.
 */
function accessibleName(entry: DeskIndexEntry): string {
  return `${entry.label}, ${entry.count} ${entry.count === 1 ? "entry" : "entries"}`;
}

export function DeskIndex({ label, entries }: DeskIndexProps) {
  return (
    <nav
      aria-label={label}
      // Sticky beneath the shared shell header so the index stays reachable
      // however far into the record a reader has scrolled.
      className="sticky top-[var(--shell-header-height,4.5rem)] z-30 border-b border-brand-border bg-brand-paper-glass backdrop-blur-md"
    >
      <PageContainer>
        <ul className="desk-index">
          {entries.map((entry) => (
            <li key={entry.key} className="min-w-0">
              {/*
                A desk that has filed nothing is still listed — the group has
                five companies whether or not each published this month — but
                it is not offered as a destination, so it is a span rather than
                a link a keyboard user can land on and get an empty page from.
              */}
              {entry.count === 0 && !entry.isActive ? (
                <span
                  className="desk-index__entry block opacity-45"
                  aria-label={accessibleName(entry)}
                >
                  <Rule entry={entry} />
                  <Label entry={entry} />
                </span>
              ) : (
                <Link
                  href={entry.href}
                  aria-current={entry.isActive ? "page" : undefined}
                  aria-label={accessibleName(entry)}
                  className="desk-index__entry"
                >
                  <Rule entry={entry} />
                  <Label entry={entry} />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </PageContainer>
    </nav>
  );
}
