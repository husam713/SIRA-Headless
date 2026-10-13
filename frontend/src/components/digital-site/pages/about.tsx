import { companyHref } from "@/components/digital-site/footer";
import { Closing, PageIntro, Related, Section, SectionHead } from "@/components/digital-site/primitives";
import { getDigitalSiteContent } from "@/content/digital-site";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalAboutPageProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/**
 * Company: why SIRA Digital exists and how it works, its principles, and the
 * group it belongs to. No people, numbers, offices or dates — none have been
 * supplied, and the page does not invent them.
 */
export function DigitalAboutPage({ site, locale }: DigitalAboutPageProps) {
  const content = getDigitalSiteContent(locale);
  const page = content.about;

  return (
    <>
      <PageIntro id="dg-about-title" intro={page.intro} />

      <Section tone="paper" labelledBy="dg-about-why">
        <div className="dg-about">
          {page.sections.map((section) => (
            <div key={section.key} className="dg-about__block">
              <h2 className="dg-title-m" id={`dg-about-${section.key}`}>
                {section.title}
              </h2>
              <div className="dg-about__body">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="mist" labelledBy="dg-principles-title">
        <SectionHead id="dg-principles-title" title={page.principles.title} intro={page.principles.intro} />
        <ul className="dg-commitments">
          {page.principles.items.map((item) => (
            <li key={item.key} className="dg-commitment">
              <h3 className="dg-commitment__title">{item.title}</h3>
              <p className="dg-commitment__body">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sheet" labelledBy="dg-group-title">
        <SectionHead id="dg-group-title" title={page.group.title} intro={page.group.intro} />
        <ul className="dg-group">
          {page.group.companies.map((company) => {
            const href = companyHref(company.key, locale);
            return (
              <li key={company.key} className="dg-group__company">
                <span className="dg-group__name">{company.name}</span>
                <span className="dg-group__field">{company.field}</span>
                {href === null ? null : (
                  <a className="dg-link dg-group__link" href={href} aria-label={`${page.group.visit}: ${company.name}`}>
                    {page.group.visit}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      <Related site={site} locale={locale} content={content} paths={["/services/", "/method/", "/industries/"]} />
      <Closing site={site} locale={locale} content={content} />
    </>
  );
}
