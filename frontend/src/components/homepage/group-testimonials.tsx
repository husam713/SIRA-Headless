import { QuoteRotator, type RotatingQuote } from "@/components/atlas/quote-rotator";
import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionHead } from "@/components/layout/section-head";
import type { HomepageContentSection } from "@/lib/homepage/types";

// Atlas direction (owner-approved 2026-09-16): one large-set quotation at a
// time, turning over on its own, with a dot for each. Every testimonial the
// CMS marks consent-approved is in the HTML; the rotation is presentation.

interface GroupTestimonialsProps {
  readonly section: HomepageContentSection | null;
}

export function GroupTestimonials({ section }: GroupTestimonialsProps) {
  if (section === null || section.selection.status !== "ready") return null;

  const quotes: RotatingQuote[] = section.selection.items.flatMap((item) => {
    if (item.excerpt === null) return [];
    const attribution = [item.role, item.organization].filter(
      (value): value is string => value !== null,
    );
    return [
      {
        databaseId: item.databaseId,
        quote: item.excerpt,
        name: item.title,
        attribution: attribution.length > 0 ? attribution.join(", ") : null,
      },
    ];
  });

  if (quotes.length === 0) return null;

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

        <div data-reveal="fade">
          <QuoteRotator quotes={quotes} />
        </div>
      </PageContainer>
    </Section>
  );
}
