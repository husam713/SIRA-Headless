import { ContactForm } from "@/components/homepage/contact-form";
import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import type { HomepageContactSection } from "@/lib/homepage/types";
import { SITE_KEYS } from "@/types/site";

interface GroupContactProps {
  readonly section: HomepageContactSection | null;
  readonly email: string | null;
  readonly address: string | null;
}

/**
 * The service options offered by the "Select Service" control.
 *
 * Derived from the trusted site registry rather than written here, so the list
 * cannot drift from the companies the group actually operates. Group is the
 * general enquiry route and leads the list.
 */
function serviceOptions(): readonly string[] {
  return [
    "General enquiry",
    ...SITE_KEYS.filter((key) => key !== "group").flatMap((key) => {
      const site = getSiteDefinition(key);
      return site === null ? [] : [site.name];
    }),
  ];
}

export function GroupContact({ section, email, address }: GroupContactProps) {
  if (section === null) return null;

  const hasHeading = section.heading !== null;
  const hasCopy = section.description !== null;

  if (!hasHeading && !hasCopy && email === null && address === null) {
    return null;
  }

  return (
    <Section
      id="contact"
      labelledBy={hasHeading ? "contact-heading" : undefined}
      label={hasHeading ? undefined : (section.eyebrow ?? "Get in Touch")}
      tone="deep"
    >
      {/* Was max-w-[72.5rem] — the one section that silently used a
          different container width from every other. Normalised; the
          internal two-column form split keeps its own wider gap. */}
      <PageContainer className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionEyebrow tone="bright">{section.eyebrow ?? "Get in Touch"}</SectionEyebrow>
          {hasHeading ? (
            <h2
              id="contact-heading"
              className="mt-4 text-balance font-display text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.05]"
            >
              {section.heading}
            </h2>
          ) : null}
          {hasCopy ? (
            <p className="mt-6 max-w-md text-base leading-relaxed text-brand-paper/75">
              {section.description}
            </p>
          ) : null}

          {email !== null || address !== null ? (
            <div className="mt-8 flex flex-col gap-3">
              {email !== null ? (
                <a
                  href={`mailto:${email}`}
                  className="text-[15px] text-brand-paper transition-colors hover:text-brand-accent-bright"
                >
                  {email}
                </a>
              ) : null}
              {address !== null ? (
                <p className="text-[15px] text-brand-paper/70">{address}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <ContactForm services={serviceOptions()} />
      </PageContainer>
    </Section>
  );
}
