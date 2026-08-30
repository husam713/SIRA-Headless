import type { HomepageMetric } from "@/lib/homepage/types";

// Design reference (branch .dc.html files, the band directly under the
// hero): a full-bleed, solid brand-accent-colored strip with up to four
// metrics as equal columns, divided by faint on-accent borders — distinct
// from the Group homepage's "About" metrics (accent-colored numerals on the
// page's paper background), since branch pages have no separate About
// section of their own.

interface BranchStatsProps {
  readonly statistics: readonly HomepageMetric[];
}

interface StatCellProps {
  readonly metric: HomepageMetric;
}

function StatCell({ metric }: StatCellProps) {
  return (
    // The band is deliberately edge-to-edge, so the cell supplies the
    // gutter rather than a container. Taking it from --layout-gutter puts
    // the stat text on the same inline start as every other section.
    <div
      className="flex flex-col gap-2 border-brand-on-accent-border py-8 [border-inline-start-width:1px] first:border-s-0"
      style={{ paddingInline: "var(--layout-gutter)" }}
    >
      {metric.value !== null ? (
        <p className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-normal leading-none text-brand-on-accent">
          {metric.value}
        </p>
      ) : null}
      {metric.label !== null ? (
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-on-accent/80">
          {metric.label}
        </p>
      ) : null}
    </div>
  );
}

export function BranchStats({ statistics }: BranchStatsProps) {
  if (statistics.length === 0) return null;

  return (
    <section aria-label="Key metrics" className="bg-brand-accent">
      {/* Not PageContainer: this band runs to the container edge and the
          cells own the gutter. Width still comes from the shared token. */}
      <div
        className="mx-auto grid w-full grid-cols-2 sm:grid-cols-4"
        style={{ maxWidth: "var(--layout-container)" }}
      >
        {statistics.map((metric, index) => (
          // The metric list is a fixed, non-reorderable server-rendered
          // selection with no stable identifier of its own — index is safe here.
          <StatCell key={index} metric={metric} />
        ))}
      </div>
    </section>
  );
}
