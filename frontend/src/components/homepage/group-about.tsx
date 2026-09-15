import { GridItem, PageGrid } from "@/components/layout/page-grid";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
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
      <PageGrid className="gap-y-12 lg:gap-y-10">
        {/* Eyebrow rail, then narrative, then metrics BESIDE the narrative.
            The reference sets the figures alongside the copy rather than under
            it; stacking them ran this section 219px taller than the reference
            and separated the numbers from the sentence they belong to. */}
        <GridItem span={3}>
          <SectionEyebrow>{section.eyebrow ?? "About SIRA Group"}</SectionEyebrow>
        </GridItem>

        <GridItem span={5} start={4} className="flex flex-col gap-8">
          {hasHeading ? (
            <h2
              id="about-heading"
              className="text-balance font-display text-[clamp(2.25rem,4vw,3.5rem)] font-normal leading-[1.05]"
            >
              {section.heading}
            </h2>
          ) : null}

          {hasCopy ? (
            <p className="max-w-[38rem] text-[clamp(0.9375rem,1.1vw,1.0625rem)] leading-relaxed text-brand-ink-soft">
              {section.description}
            </p>
          ) : null}
        </GridItem>

        {hasMetrics ? (
          // Two columns, matching the reference's 2x2 block, and top-aligned
          // with the heading rather than trailing the copy.
          <GridItem span={4} start={9} className="self-start">
            <div className="grid grid-cols-2 gap-x-8 gap-y-10">
              {section.metrics.map((metric, index) => (
                // The metric list is a fixed, non-reorderable server-rendered
                // selection with no stable identifier of its own — index is safe here.
                <Metric key={index} metric={metric} />
              ))}
            </div>
          </GridItem>
        ) : null}
      </PageGrid>
    </Section>
  );
}
