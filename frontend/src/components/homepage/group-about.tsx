import type { HomepageMetric, HomepageMetricsSection } from "@/lib/homepage/types";

interface GroupAboutProps {
  readonly section: HomepageMetricsSection | null;
}

interface MetricProps {
  readonly metric: HomepageMetric;
}

function Metric({ metric }: MetricProps) {
  return (
    <div>
      <p className="font-display text-[clamp(2rem,4vw,3.5rem)] font-normal leading-none">
        {metric.value}
      </p>
      {metric.label !== null ? (
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-paper/60">
          {metric.label}
        </p>
      ) : null}
      {metric.supportingText !== null ? (
        <p className="mt-2 text-xs text-brand-paper/50">{metric.supportingText}</p>
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

  return (
    <section
      aria-labelledby={hasHeading ? "about-heading" : undefined}
      aria-label={hasHeading ? undefined : (section.eyebrow ?? "About SIRA Group")}
      className="bg-brand-deep py-24 text-brand-paper sm:py-32 lg:py-40"
    >
      <div className="mx-auto grid w-full max-w-[82.5rem] grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="lg:col-span-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent-bright">
            {section.eyebrow ?? "About SIRA Group"}
          </p>
        </div>

        <div className="flex flex-col gap-12 lg:col-span-8">
          {hasHeading ? (
            <h2
              id="about-heading"
              className="text-balance font-display text-[clamp(2.25rem,5.5vw,5rem)] font-normal leading-[1.05]"
            >
              {section.heading}
            </h2>
          ) : null}

          {hasCopy ? (
            <p className="max-w-[40rem] text-[clamp(1rem,1.5vw,1.375rem)] leading-relaxed text-brand-paper/80">
              {section.description}
            </p>
          ) : null}

          {hasMetrics ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-brand-paper/15 pt-12 sm:grid-cols-4">
              {section.metrics.map((metric, index) => (
                // The metric list is a fixed, non-reorderable server-rendered
                // selection with no stable identifier of its own — index is safe here.
                <Metric key={index} metric={metric} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
