import { CityList } from "@/components/atlas/city-list";
import { CountUp } from "@/components/homepage/count-up";
import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import type { BrandOffice } from "@/lib/brand";
import type { HomepageMedia, HomepageMetric, HomepageMetricsSection } from "@/lib/homepage/types";

// Atlas direction (owner-approved 2026-09-16): the group's story is told as a
// deep chapter — "where we work" — the narrative on the left, the four
// figures on the right counting up as they arrive, on a layered ground that
// moves a little slower than the page. The design's photograph behind the band
// is not a field the about section carries, so the ground is the brand's deep
// tone; a background image can be added the day the CMS models one.

interface GroupAboutProps {
  readonly section: HomepageMetricsSection | null;
  /**
   * The photograph behind the band, moving a little slower than the page.
   * The chapter has no image field of its own; the page passes the hero's
   * closing photograph so the band and the page's ending share one picture.
   */
  readonly image?: HomepageMedia | null;
  /** Where the group works — the brand's office locations, as a list. */
  readonly offices?: readonly BrandOffice[];
}

function Stat({ metric }: { readonly metric: HomepageMetric }) {
  if (metric.value === null) return null;

  return (
    <div className="reveal">
      <CountUp value={metric.value} className="atlas-stat__value" />
      {metric.label !== null ? <span className="atlas-stat__label">{metric.label}</span> : null}
      {metric.supportingText !== null ? (
        <span className="atlas-stat__note">{metric.supportingText}</span>
      ) : null}
    </div>
  );
}

export function GroupAbout({ section, image = null, offices = [] }: GroupAboutProps) {
  if (section === null) return null;

  const hasHeading = section.heading !== null;
  const hasCopy = section.description !== null;
  const hasMetrics = section.metrics.length > 0;

  if (!hasHeading && !hasCopy && !hasMetrics) return null;

  return (
    <Section
      id="about"
      labelledBy={hasHeading ? "about-heading" : undefined}
      label={hasHeading ? undefined : (section.eyebrow ?? "About SIRA Group")}
      className="atlas-places atlas-on-deep"
    >
      {image !== null ? (
        <div className="atlas-places__bg" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.sourceUrl}
            alt=""
            width={image.width ?? undefined}
            height={image.height ?? undefined}
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}
      <PageContainer className="grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-20">
        {/* Two stagger groups, one per column, so the narrative and the
            figures each arrive in their own order rather than one long
            queue across both. */}
        <div data-stagger>
          <SectionEyebrow tone="bright" className="reveal">
            {section.eyebrow ?? "About SIRA Group"}
          </SectionEyebrow>
          {hasHeading ? (
            <h2 id="about-heading" className="atlas-display atlas-display--l reveal mt-5">
              {section.heading}
            </h2>
          ) : null}
          {hasCopy ? (
            <p className="atlas-lead reveal mt-6 max-w-[38rem]">{section.description}</p>
          ) : null}
          <CityList offices={offices} />
        </div>

        {hasMetrics ? (
          <div className="atlas-stats self-start" data-stagger>
            {section.metrics.map((metric, index) => (
              // The metric list is a fixed, non-reorderable server-rendered
              // selection with no stable identifier of its own — index is safe.
              <Stat key={index} metric={metric} />
            ))}
          </div>
        ) : null}
      </PageContainer>
    </Section>
  );
}
