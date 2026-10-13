import { Closing, PageIntro, Related, Section, SectionHead } from "@/components/digital-site/primitives";
import { getDigitalSiteContent } from "@/content/digital-site";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalMethodPageProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/**
 * Method: the five stages in full (they are a sequence, so they are
 * numbered), who does what, and the questions to put to any ERP partner —
 * with this one's answers beside them.
 */
export function DigitalMethodPage({ site, locale }: DigitalMethodPageProps) {
  const content = getDigitalSiteContent(locale);
  const page = content.method;

  return (
    <>
      <PageIntro id="dg-method-title" intro={page.intro}>
        <ol className="dg-index__list dg-index__list--stages" aria-label={page.phasesTitle}>
          {content.phases.map((phase, index) => (
            <li key={phase.key}>
              <a className="dg-index__link" href={`#${phase.key}`}>
                <span className="dg-index__n" aria-hidden="true">
                  {index + 1}
                </span>
                {phase.name}
              </a>
            </li>
          ))}
        </ol>
      </PageIntro>

      <section className="dg-section dg-tone-paper" aria-labelledby="dg-stages-title">
        <div className="dg-container">
          <h2 className="dg-visually-hidden" id="dg-stages-title">
            {page.phasesTitle}
          </h2>
          <ol className="dg-stages">
            {content.phases.map((phase, index) => (
              <li key={phase.key} id={phase.key} className="dg-stage">
                <header className="dg-stage__head">
                  <span className="dg-stage__index" aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3 className="dg-title-m">{phase.name}</h3>
                  <p className="dg-stage__summary">{phase.summary}</p>
                </header>
                <div className="dg-stage__grid">
                  <div>
                    <h4 className="dg-label">{page.activitiesLabel}</h4>
                    <ul className="dg-list">
                      {phase.activities.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="dg-label">{page.deliverablesLabel}</h4>
                    <ul className="dg-list dg-list--deliverables">
                      {phase.deliverables.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="dg-label">{page.fromYouLabel}</h4>
                    <ul className="dg-list">
                      {phase.fromYou.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="dg-stage__gate">
                  <span className="dg-label">{page.gateLabel}</span>
                  <span>{phase.gate}</span>
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Section tone="mist" labelledBy="dg-roles-title">
        <div className="dg-split">
          <SectionHead id="dg-roles-title" title={page.roles.title} intro={page.roles.intro} />
          <dl className="dg-ledger dg-ledger--dl">
            {page.roles.items.map((role) => (
              <div key={role.key} className="dg-ledger__row">
                <dt className="dg-ledger__label">{role.label}</dt>
                <dd className="dg-ledger__detail">{role.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section tone="sheet" labelledBy="dg-checklist-title">
        <SectionHead id="dg-checklist-title" title={page.checklist.title} intro={page.checklist.intro} />
        <div className="dg-table-wrap">
          <table className="dg-table dg-table--checklist">
            <thead>
              <tr>
                <th scope="col">{page.checklist.questionLabel}</th>
                <th scope="col">{page.checklist.answerLabel}</th>
              </tr>
            </thead>
            <tbody>
              {page.checklist.items.map((item) => (
                <tr key={item.key}>
                  <th scope="row">{item.label}</th>
                  <td>{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Related site={site} locale={locale} content={content} paths={["/services/", "/erpnext/", "/about/"]} />
      <Closing site={site} locale={locale} content={content} />
    </>
  );
}
