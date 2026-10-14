import { IntegrationHub } from "@/components/digital-site/diagrams";
import { Closing, Faq, PageIntro, Related, Section, SectionHead } from "@/components/digital-site/primitives";
import { WorkflowSimulator } from "@/components/digital-site/workflow-simulator";
import { getDigitalSiteContent } from "@/content/digital-site";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalAutomationPageProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/**
 * Automation: the approval example first (the clearest picture of what
 * automation does), then the patterns, the systems connected around the ERP,
 * and where the line between system and person is drawn.
 */
export function DigitalAutomationPage({ site, locale }: DigitalAutomationPageProps) {
  const content = getDigitalSiteContent(locale);
  const page = content.automation;
  const { workflow } = content.demos;

  return (
    <>
      <PageIntro id="dg-automation-title" intro={page.intro} />

      <section className="dg-section dg-tone-night" id="approval-demo" aria-labelledby="dg-automation-demo-title">
        <div className="dg-container">
          <SectionHead id="dg-automation-demo-title" title={workflow.title} intro={workflow.intro} />
          <WorkflowSimulator content={workflow} locale={locale} illustrative={content.common.illustrative} />
        </div>
      </section>

      <Section tone="paper" labelledBy="dg-patterns-title">
        <SectionHead id="dg-patterns-title" title={page.patterns.title} intro={page.patterns.intro} />
        <ul className="dg-statements dg-statements--three">
          {page.patterns.items.map((item) => (
            <li key={item.key} className="dg-statement">
              <h3 className="dg-title-s">{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sheet" labelledBy="dg-integrations-title" id="integrations">
        <SectionHead id="dg-integrations-title" title={page.integrations.title} intro={page.integrations.intro} />
        <IntegrationHub hub={page.integrations.hub} groups={page.integrations.groups} />
      </Section>

      <Section tone="mist" labelledBy="dg-boundaries-title">
        <SectionHead id="dg-boundaries-title" title={page.boundaries.title} intro={page.boundaries.intro} />
        <div className="dg-boundaries">
          <div className="dg-boundaries__side">
            <h3 className="dg-title-s">{page.boundaries.automateLabel}</h3>
            <ul className="dg-list">
              {page.boundaries.automate.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="dg-boundaries__side dg-boundaries__side--person">
            <h3 className="dg-title-s">{page.boundaries.keepLabel}</h3>
            <ul className="dg-list">
              {page.boundaries.keep.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="sheet" labelledBy="dg-automation-faq-title">
        <div className="dg-split">
          <SectionHead id="dg-automation-faq-title" title={content.home.faq.title} />
          <Faq questions={content.questions} keys={page.faqKeys} name="dg-faq-automation" />
        </div>
      </Section>

      <Related site={site} locale={locale} content={content} paths={["/erpnext/", "/industries/", "/services/"]} />
      <Closing site={site} locale={locale} content={content} />
    </>
  );
}
