import { ContactForm } from "@/components/homepage/contact-form";
import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import type { HomepageContactSection } from "@/lib/homepage/types";
import { CHROME } from "@/lib/i18n/locale";
import type { LocaleCode } from "@/types/site";

interface GroupContactProps {
  readonly section: HomepageContactSection | null;
  readonly email: string | null;
  readonly address: string | null;
  /**
   * The "Select Service" options, in the site's own voice. The caller decides
   * what these mean for its tenant — the Group homepage, the general-enquiry
   * route, names its companies; every other tenant names its own services —
   * so this component never has to know which site it is rendering on.
   * Empty hides the control (`ContactForm`'s own rule).
   */
  readonly serviceOptions: readonly string[];
  /** The page's language; the form and the fallback labels speak it. */
  readonly locale?: LocaleCode;
}

export function GroupContact({
  section,
  email,
  address,
  serviceOptions,
  locale = "en",
}: GroupContactProps) {
  if (section === null) return null;

  const chrome = CHROME[locale];

  const hasHeading = section.heading !== null;
  const hasCopy = section.description !== null;

  if (!hasHeading && !hasCopy && email === null && address === null) {
    return null;
  }

  return (
    <Section
      id="contact"
      labelledBy={hasHeading ? "contact-heading" : undefined}
      label={hasHeading ? undefined : (section.eyebrow ?? chrome.getInTouch)}
      tone="deep"
    >
      {/* Was max-w-[72.5rem] — the one section that silently used a
          different container width from every other. Normalised; the
          internal two-column form split keeps its own wider gap. */}
      <PageContainer className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionEyebrow tone="bright">{section.eyebrow ?? chrome.getInTouch}</SectionEyebrow>
          {hasHeading ? (
            <h2
              id="contact-heading"
              className="mt-4 text-balance font-display text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.05]"
            >
              {section.heading}
            </h2>
          ) : null}
          {hasCopy ? (
            <p className="mt-6 max-w-md text-base leading-relaxed text-brand-on-deep/75">
              {section.description}
            </p>
          ) : null}

          {email !== null || address !== null ? (
            <div className="mt-8 flex flex-col gap-3">
              {email !== null ? (
                <a
                  href={`mailto:${email}`}
                  className="text-[15px] text-brand-on-deep transition-colors hover:text-brand-accent-bright"
                >
                  {email}
                </a>
              ) : null}
              {address !== null ? (
                <p className="text-[15px] text-brand-on-deep/70">{address}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <ContactForm services={serviceOptions} locale={locale} />
      </PageContainer>
    </Section>
  );
}
