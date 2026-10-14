import { DiscoveryComposer } from "@/components/digital-site/discovery-composer";
import { PageIntro, Section, SectionHead } from "@/components/digital-site/primitives";
import { getDigitalSiteContent } from "@/content/digital-site";
import { digitalHref } from "@/lib/digital-site/hrefs";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalContactPageProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/** Request a discovery call: a few plain questions, a brief that writes itself, a person who replies. */
export function DigitalContactPage({ site, locale }: DigitalContactPageProps) {
  const content = getDigitalSiteContent(locale);
  const { contact } = content;

  return (
    <>
      <PageIntro id="dg-contact-title" intro={contact.intro} />

      <section className="dg-section dg-section--flush dg-tone-paper" aria-labelledby="dg-contact-title">
        <div className="dg-container">
          <DiscoveryComposer contact={contact} privacyHref={digitalHref(site, locale, contact.form.privacyLink.href)} />
        </div>
      </section>

      <Section tone="mist" labelledBy="dg-after-title">
        <div className="dg-split">
          <SectionHead id="dg-after-title" title={contact.after.title} intro={contact.after.intro} />
          <ol className="dg-closing__steps dg-closing__steps--paper">
            {contact.after.steps.map((step, index) => (
              <li key={step} className="dg-closing__step">
                <span className="dg-closing__index" aria-hidden="true">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </>
  );
}
