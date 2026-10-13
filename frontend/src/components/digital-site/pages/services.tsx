import { ButtonLink, Closing, PageIntro, Related, Section, SectionHead } from "@/components/digital-site/primitives";
import { getDigitalSiteContent } from "@/content/digital-site";
import { digitalHref } from "@/lib/digital-site/hrefs";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalServicesPageProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/**
 * Solutions: the five lines of work at full length — what each includes,
 * what the client ends up with, where it fits — then the ways an engagement
 * starts. An in-page index leads to each line (anchors are the solution keys,
 * so `/services/#support` is a stable address).
 */
export function DigitalServicesPage({ site, locale }: DigitalServicesPageProps) {
  const content = getDigitalSiteContent(locale);
  const page = content.services;

  return (
    <>
      <PageIntro id="dg-services-title" intro={page.intro}>
        <nav className="dg-index" aria-label={page.indexLabel}>
          <ol className="dg-index__list">
            {content.solutions.map((solution) => (
              <li key={solution.key}>
                <a className="dg-index__link" href={`#${solution.key}`}>
                  {solution.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </PageIntro>

      <section className="dg-section dg-tone-paper dg-services" aria-labelledby="dg-services-title">
        <div className="dg-container">
          {content.solutions.map((solution) => (
            <article key={solution.key} id={solution.key} className="dg-service" aria-labelledby={`dg-service-${solution.key}`}>
              <header className="dg-service__head">
                <h2 className="dg-title-m" id={`dg-service-${solution.key}`}>
                  {solution.title}
                </h2>
                <p className="dg-service__summary">{solution.summary}</p>
              </header>
              <div className="dg-service__body">
                <p className="dg-service__detail">{solution.detail}</p>
                <div className="dg-service__columns">
                  <div>
                    <h3 className="dg-label">{page.includesLabel}</h3>
                    <ul className="dg-list">
                      {solution.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <dl className="dg-service__facts">
                    <div>
                      <dt className="dg-label">{page.outcomeLabel}</dt>
                      <dd>{solution.outcome}</dd>
                    </div>
                    <div>
                      <dt className="dg-label">{page.fitsLabel}</dt>
                      <dd>{solution.fits}</dd>
                    </div>
                  </dl>
                </div>
                {solution.link.href.startsWith("/services/") ? null : (
                  <a className="dg-link" href={digitalHref(site, locale, solution.link.href)}>
                    {solution.link.label}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <Section tone="mist" labelledBy="dg-engagements-title">
        <SectionHead id="dg-engagements-title" title={page.engagements.title} intro={page.engagements.intro} />
        <ul className="dg-engagements">
          {page.engagements.items.map((item) => (
            <li key={item.key} className="dg-engagement">
              <h3 className="dg-title-s">{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="paper" labelledBy="dg-notsure-title">
        <div className="dg-callout">
          <SectionHead id="dg-notsure-title" title={page.notSure.title} intro={page.notSure.intro} />
          <ButtonLink href={digitalHref(site, locale, page.notSure.link.href)}>{page.notSure.link.label}</ButtonLink>
        </div>
      </Section>

      <Related site={site} locale={locale} content={content} paths={["/erpnext/", "/automation/", "/method/"]} />
      <Closing site={site} locale={locale} content={content} />
    </>
  );
}
