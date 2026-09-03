import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { CtaLink } from "@/components/homepage/cta-link";
import type {
  HomepageContentItem,
  HomepageContentSection,
} from "@/lib/homepage/types";

interface GroupServicesProps {
  readonly section: HomepageContentSection | null;
}

interface ServiceCardProps {
  readonly item: HomepageContentItem;
  readonly index: number;
}

function ServiceCard({ item, index }: ServiceCardProps) {
  // No image, no per-item link: the approved design for this section is a
  // plain numbered card grid (matching the SiraService content contract,
  // which carries no business-unit relation to color-code by, and no
  // detail route exists yet to link to — see the Companies/Investor fixes).
  return (
    <div className="border-t-[3px] border-brand-accent bg-brand-paper p-9">
      <p className="font-display text-4xl font-normal leading-none text-brand-accent">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-6 text-lg font-semibold leading-snug">{item.title}</h3>
      {item.excerpt !== null ? (
        <p className="mt-3 text-[15px] leading-relaxed text-brand-ink-soft">
          {item.excerpt}
        </p>
      ) : null}
    </div>
  );
}

export function GroupServices({ section }: GroupServicesProps) {
  if (section === null || section.selection.status !== "ready") return null;

  const hasHeading = section.heading !== null;

  return (
    <Section
      id="services"
      labelledBy={hasHeading ? "services-heading" : undefined}
      label={hasHeading ? undefined : (section.eyebrow ?? "Services")}
      className="border-b border-brand-border"
    >
      <PageContainer>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <SectionEyebrow tone="faint">{section.eyebrow ?? "What We Do"}</SectionEyebrow>
            {hasHeading ? (
              <h2
                id="services-heading"
                className="mt-4 text-balance font-display text-[clamp(2.25rem,5vw,3.75rem)] font-normal leading-[1.05]"
              >
                {section.heading}
              </h2>
            ) : null}
          </div>
          {section.link !== null ? (
            <CtaLink link={section.link} variant="ghost-light" />
          ) : null}
        </div>

        {section.description !== null ? (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-brand-ink-soft">
            {section.description}
          </p>
        ) : null}

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden bg-brand-border sm:grid-cols-2 lg:grid-cols-3">
          {section.selection.items.map((item, index) => (
            <ServiceCard key={item.databaseId} item={item} index={index} />
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}
