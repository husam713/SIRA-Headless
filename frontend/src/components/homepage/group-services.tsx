import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionHead } from "@/components/layout/section-head";
import { CtaLink } from "@/components/homepage/cta-link";
import type {
  HomepageContentItem,
  HomepageContentSection,
} from "@/lib/homepage/types";

// Atlas direction (owner-approved 2026-09-16): services are numbered rows
// that open in place, not a card grid. Native <details>, so there is no
// script; the `name` attribute makes the group exclusive where the browser
// supports it and harmless where it does not. The first row opens by default
// so the chapter is never a list of closed lines.
//
// The SiraService contract carries a title and an excerpt and no detail
// route, which is exactly what a row that opens in place needs.

interface GroupServicesProps {
  readonly section: HomepageContentSection | null;
}

interface ServiceRowProps {
  readonly item: HomepageContentItem;
  readonly index: number;
}

function ServiceRow({ item, index }: ServiceRowProps) {
  return (
    <details className="atlas-service" name="sira-services" open={index === 0}>
      <summary>
        <span aria-hidden="true" className="atlas-service__n">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="atlas-service__title">{item.title}</h3>
        <span aria-hidden="true" className="atlas-service__plus" />
      </summary>
      {item.excerpt !== null ? (
        <div className="atlas-service__body">
          <p>{item.excerpt}</p>
        </div>
      ) : null}
    </details>
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
        <SectionHead
          id="services-heading"
          eyebrow={section.eyebrow ?? "What We Do"}
          heading={section.heading}
          lead={section.description}
          tone="faint"
          action={
            section.link !== null ? <CtaLink link={section.link} variant="ghost-light" /> : undefined
          }
        />

        <div className="atlas-services reveal">
          {section.selection.items.map((item, index) => (
            <ServiceRow key={item.databaseId} item={item} index={index} />
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}
