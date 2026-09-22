import { DigitalApproach } from "@/components/digital-site/sections/approach";
import { DigitalClosing } from "@/components/digital-site/sections/closing";
import { DigitalGroup } from "@/components/digital-site/sections/group";
import { DigitalPrinciples } from "@/components/digital-site/sections/principles";
import { getDigitalSiteContent } from "@/content/digital-site";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalAboutPageProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/**
 * The company. Deliberately no team, no founding date, no office: none of
 * those have been supplied by the owner, and a company page that invents them
 * is worse than one that waits for them.
 */
export function DigitalAboutPage({ site, locale }: DigitalAboutPageProps) {
  const content = getDigitalSiteContent(locale);
  const { about } = content;

  return (
    <>
      <section aria-labelledby="dg-about-heading">
        <div className="dg-container">
          <div className="dg-intro">
            <p className="dg-eyebrow dg-mono">{about.eyebrow}</p>
            <h1 className="dg-display-l" id="dg-about-heading">
              {about.title}
            </h1>
            <p className="dg-lede">{about.lede}</p>
          </div>

          <div className="dg-entries">
            {about.sections.map((section, index) => (
              <section key={section.key} className="dg-entry dg-reveal" aria-labelledby={`dg-about-${section.key}`}>
                <div className="dg-entry__title">
                  <span className="dg-mono" style={{ color: "var(--dg-text-3)" }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="dg-display-m" id={`dg-about-${section.key}`}>
                    {section.title}
                  </h2>
                </div>
                <div className="dg-entry__body">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <DigitalApproach content={content} />
      <DigitalPrinciples content={content} headingId="dg-about-principles" />
      <DigitalGroup locale={locale} content={content} />
      <DigitalClosing site={site} locale={locale} content={content} />
    </>
  );
}
