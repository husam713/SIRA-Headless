import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import type {
  HomepageContentItem,
  HomepageContentSection,
} from "@/lib/homepage/types";

interface GroupTestimonialsProps {
  readonly section: HomepageContentSection | null;
}

interface TestimonialCardProps {
  readonly item: HomepageContentItem;
}

function TestimonialCard({ item }: TestimonialCardProps) {
  const attribution = [item.role, item.organization].filter(
    (value): value is string => value !== null,
  );

  if (item.excerpt === null) return null;

  return (
    // Card surface sits ON the dark section rather than reversing out of it:
    // the reference keeps the quote inside the dark environment and separates
    // it with an accent top rule, not with a light panel.
    <figure className="border-t-[3px] border-brand-accent bg-brand-deep-card p-9 sm:p-10">
      <p
        aria-hidden="true"
        className="font-display text-5xl leading-[0.6] text-brand-accent"
      >
        &ldquo;
      </p>
      <blockquote className="mt-3 font-display text-[clamp(1.125rem,1.8vw,1.375rem)] italic leading-relaxed text-brand-paper">
        {item.excerpt}
      </blockquote>
      <figcaption className="mt-7 flex flex-col gap-1">
        <span className="text-[15px] font-semibold text-brand-paper">{item.title}</span>
        {attribution.length > 0 ? (
          <span className="text-sm text-brand-paper/60">
            {attribution.join(", ")}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function GroupTestimonials({ section }: GroupTestimonialsProps) {
  if (section === null || section.selection.status !== "ready") return null;

  const hasHeading = section.heading !== null;

  return (
    // Dark, matching the reference. This section was rendering on paper, which
    // put three consecutive light sections between Insights and Partners and
    // flattened the page's light/dark rhythm — the single largest surface
    // mismatch in the fidelity audit.
    <Section
      id="testimonials"
      tone="deep"
      labelledBy={hasHeading ? "testimonials-heading" : undefined}
      label={hasHeading ? undefined : (section.eyebrow ?? "In Their Words")}
    >
      <PageContainer>
        <SectionEyebrow tone="bright">{section.eyebrow ?? "In Their Words"}</SectionEyebrow>
        {hasHeading ? (
          <h2
            id="testimonials-heading"
            className="mt-4 max-w-3xl text-balance font-display text-[clamp(2.25rem,5vw,3.75rem)] font-normal leading-[1.05]"
          >
            {section.heading}
          </h2>
        ) : null}

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {section.selection.items.map((item) => (
            <TestimonialCard key={item.databaseId} item={item} />
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}
