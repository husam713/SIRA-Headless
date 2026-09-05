import Link from "next/link";

import { joinClasses } from "@/components/layout/page-container";
import { PageContainer } from "@/components/layout/page-container";
import type { EditorialKindCount } from "@/lib/editorial/ledger";
import type { EditorialKind } from "@/lib/editorial/types";

// A newspaper section bar, not a row of filter pills. The reference design used
// pill buttons, which read as an app control and sit badly against the serif
// masthead; DECISIONS.md also asks the newsroom to move away from the generic
// treatment it inherited. Small caps, a hairline rule and an accent underline
// on the active entry do the same job in the publication's own voice.
//
// These are real links to real URLs, so a filtered view is server-rendered,
// shareable and indexable. The counts come from the loaded page, so they
// describe what the reader can actually see rather than a total the archive
// has not fetched.

interface NewsroomIndexBarProps {
  readonly counts: readonly EditorialKindCount[];
  readonly active: EditorialKind | null;
  readonly total: number;
}

function entryClasses(isActive: boolean): string {
  return joinClasses(
    "relative -mb-px inline-flex items-baseline gap-2 border-b-2 pb-4 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors",
    isActive
      ? "border-brand-accent text-brand-ink"
      : "border-transparent text-brand-ink-faint hover:text-brand-ink",
  );
}

export function NewsroomIndexBar({
  counts,
  active,
  total,
}: NewsroomIndexBarProps) {
  return (
    <nav
      aria-label="Filter the newsroom by type"
      // Sticky under the site header so the index stays reachable while the
      // ledger scrolls. top matches the header's own height token.
      className="sticky top-[var(--shell-header-height,4rem)] z-30 border-y border-brand-border bg-brand-paper/95 backdrop-blur"
    >
      <PageContainer>
        <ul className="flex flex-wrap items-baseline gap-x-8 gap-y-0">
          <li>
            <Link href="/news" className={entryClasses(active === null)}>
              All
              <span className="text-[10px] font-semibold tabular-nums opacity-60">
                {total}
              </span>
            </Link>
          </li>
          {counts.map((entry) => (
            <li key={entry.kind}>
              <Link
                href={`/news?kind=${entry.kind}`}
                // A kind with nothing in it is still listed, so the index does
                // not change shape as the archive fills, but it is not offered
                // as a destination that leads to an empty page.
                aria-disabled={entry.count === 0 ? true : undefined}
                className={joinClasses(
                  entryClasses(active === entry.kind),
                  entry.count === 0 ? "pointer-events-none opacity-40" : undefined,
                )}
              >
                {entry.label}
                <span className="text-[10px] font-semibold tabular-nums opacity-60">
                  {entry.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
    </nav>
  );
}
