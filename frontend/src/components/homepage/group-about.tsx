import { GridItem, PageGrid } from "@/components/layout/page-grid";
import { Section } from "@/components/layout/section";
import type { HomepageMetric, HomepageMetricsSection } from "@/lib/homepage/types";

// Design reference (SIRA Group Homepage.dc.html, #about): no background
// override at all — light section on the page's own paper background, dark
// ink text, accent-colored stat values. The dark treatment belongs to the
// Investor section (#investors) instead, not here.

interface GroupAboutProps {
  readonly section: HomepageMetricsSection | null;
}

interface MetricProps {
  readonly metric: HomepageMetric;
}

function Metric({ metric }: MetricProps) {
  return (
    <div>
      <p className="font-display text-[clamp(2rem,4vw,3.5rem)] font-normal leading-none text-brand-accent">
        {metric.value}
      </p>
      {metric.label !== null ? (
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-ink-faint">
          {metric.label}
        </p>
      ) : null}
      {metric.supportingText !== null ? (
        <p className="mt-2 text-xs text-brand-ink-faint/70">{metric.supportingText}</p>
      ) : null}
    </div>
  );
}

export function GroupAbout({ section }: GroupAboutProps) {
  if (section === null) return null;

  const hasHeading = section.heading !== null;
  const hasCopy = section.description !== null;
  const hasMetrics = section.metrics.length > 0;

  if (!hasHeading && !hasCopy && !hasMetrics) return null;

  // Was py-24 sm:py-32 lg:py-40 — the one section running ~20% taller than
  // its peers. Now on the shared rhythm.
  return (
    <Section
      id="about"
      labelledBy={hasHeading ? "about-heading" : undefined}
      label={hasHeading ? undefined : (section.eyebrow ?? "About SIRA Group")}
    >
      <PageGrid className="gap-y-10">
        {/* 3 + 8 leaves column 12 open by design — the eyebrow rail and the
            editorial column, not a full-width split. */}
        <GridItem span={3}>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent">
            {section.eyebrow ?? "About SIRA Group"}
          </p>
        </GridItem>

        <GridItem span={8} className="flex flex-col gap-12">
          {hasHeading ? (
            <h2
              id="about-heading"
              className="text-balance font-display text-[clamp(2.25rem,5.5vw,5rem)] font-normal leading-[1.05]"
            >
              {section.heading}
            </h2>
          ) : null}

          {hasCopy ? (
            <p className="max-w-[40rem] text-[clamp(1rem,1.5vw,1.375rem)] leading-relaxed text-brand-ink-soft">
              {section.description}
            </p>
          ) : null}

          {hasMetrics ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-brand-border pt-12 sm:grid-cols-4">
              {section.metrics.map((metric, index) => (
                // The metric list is a fixed, non-reorderable server-rendered
                // selection with no stable identifier of its own — index is safe here.
                <Metric key={index} metric={metric} />
              ))}
            </div>
          ) : null}
        </GridItem>
      </PageGrid>
    </Section>
  );
}
