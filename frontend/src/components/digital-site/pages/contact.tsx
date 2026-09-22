import { BriefComposer } from "@/components/digital-site/brief-composer";
import { getDigitalSiteContent } from "@/content/digital-site";
import { digitalHref } from "@/lib/digital-site/hrefs";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalContactPageProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/** Start: compose a brief, send it to a person. */
export function DigitalContactPage({ site, locale }: DigitalContactPageProps) {
  const content = getDigitalSiteContent(locale);
  const { contact } = content;

  return (
    <section aria-labelledby="dg-contact-heading">
      <div className="dg-container">
        <div className="dg-intro">
          <p className="dg-eyebrow dg-mono">{contact.eyebrow}</p>
          <h1 className="dg-display-l" id="dg-contact-heading">
            {contact.title}
          </h1>
          <p className="dg-lede">{contact.lede}</p>
        </div>

        <div className="dg-section dg-section--tight" style={{ paddingBlockStart: 0 }}>
          <BriefComposer
            contact={contact}
            privacyHref={digitalHref(site, locale, contact.form.privacyLink.href)}
          />
        </div>
      </div>
    </section>
  );
}
