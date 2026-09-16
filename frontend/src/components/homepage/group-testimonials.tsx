import type { CSSProperties } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionHead } from "@/components/layout/section-head";
import type {
  HomepageContentItem,
  HomepageContentSection,
} from "@/lib/homepage/types";

// Atlas direction (owner-approved 2026-09-16): the words carry the chapter.
// No cards — each quotation is set large in the display italic on the deep
// ground, with the attribution beneath. Two to a row on wide screens.

interface GroupTestimonialsProps {
  readonly section: HomepageContentSection | null;
}

interface QuoteProps {
  readonly item: HomepageContentItem;
  readonly index: number;
}

function Quote({ item, index }: QuoteProps) {
  const attribution = [item.role, item.organization].filter(
    (value): value is string => value !== null,
  );

  if (item.excerpt === null) return null;

  return (
    <figure
      className="atlas-quote reveal"
      style={{ "--reveal-offset": `${String(index * 2)}%` } as CSSProperties}
    >
      <blockquote>{item.excerpt}</blockquote>
      <figcaption>
        <cite>
          <b>{item.title}</b>
          {attribution.length > 0 ? <span>{attribution.join(", ")}</span> : null}
        </cite>
      </figcaption>
    </figure>
  );
}

export function GroupTestimonials({ section }: GroupTestimonialsProps) {
  if (section === null || section.selection.status !== "ready") return null;

  const hasHeading = section.heading !== null;

  return (
    <Section
      id="testimonials"
      tone="deep"
      labelledBy={hasHeading ? "testimonials-heading" : undefined}
      label={hasHeading ? undefined : (section.eyebrow ?? "In Their Words")}
    >
      <PageContainer className="atlas-on-deep">
        <SectionHead
          id="testimonials-heading"
          eyebrow={section.eyebrow ?? "In Their Words"}
          heading={section.heading}
          lead={section.description}
          tone="bright"
        />

        <div className="atlas-quotes">
          {section.selection.items.map((item, index) => (
            <Quote key={item.databaseId} item={item} index={index} />
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}
