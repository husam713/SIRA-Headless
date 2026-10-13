import { Faq, Closing, PageIntro, Related, Section, SectionHead } from "@/components/digital-site/primitives";
import { ModuleMap } from "@/components/digital-site/diagrams";
import { Tabs } from "@/components/digital-site/tabs";
import { getDigitalSiteContent } from "@/content/digital-site";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalErpnextPageProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/**
 * ERPNext: why the platform, its modules by what they do (explorable), the
 * Saudi requirements, how data arrives from other tools, where it runs, how
 * Frappe extends it, and help for systems already live.
 */
export function DigitalErpnextPage({ site, locale }: DigitalErpnextPageProps) {
  const content = getDigitalSiteContent(locale);
  const page = content.erpnext;

  const modulePanels = content.modules.map((module) => (
    <div key={module.key} className="dg-module-panel">
      <p className="dg-module-panel__handles">{module.handles}</p>
      <h3 className="dg-label">{page.modules.documentsLabel}</h3>
      <ul className="dg-documents">
        {module.documents.map((document) => (
          <li key={document} className="dg-document">
            {document}
          </li>
        ))}
      </ul>
    </div>
  ));

  return (
    <>
      <PageIntro id="dg-erpnext-title" intro={page.intro} />

      <Section tone="paper" labelledBy="dg-why-title">
        <SectionHead id="dg-why-title" title={page.why.title} intro={page.why.intro} />
        <ul className="dg-statements dg-statements--two">
          {page.why.items.map((item) => (
            <li key={item.key} className="dg-statement">
              <h3 className="dg-title-s">{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sheet" labelledBy="dg-modules-title">
        <SectionHead id="dg-modules-title" title={page.modules.title} intro={page.modules.intro} />
        <Tabs
          className="dg-explorer dg-explorer--modules"
          label={page.modules.title}
          items={content.modules.map((module) => ({ key: module.key, label: module.name }))}
          panels={modulePanels}
        />
        <div className="dg-erp__map">
          <ModuleMap modules={content.modules} databaseLabel={page.modules.databaseLabel} detail={false} />
        </div>
      </Section>

      <Section tone="mist" labelledBy="dg-saudi-title">
        <div className="dg-split">
          <SectionHead id="dg-saudi-title" title={page.saudi.title} intro={page.saudi.intro} />
          <div>
            <dl className="dg-ledger dg-ledger--dl">
              {content.requirements.map((requirement) => (
                <div key={requirement.key} className="dg-ledger__row">
                  <dt className="dg-ledger__label">{requirement.name}</dt>
                  <dd className="dg-ledger__detail">{requirement.body}</dd>
                </div>
              ))}
            </dl>
            <p className="dg-note dg-note--rule">{page.saudi.caution}</p>
          </div>
        </div>
      </Section>

      <Section tone="paper" labelledBy="dg-migration-title">
        <div className="dg-split">
          <SectionHead id="dg-migration-title" title={page.migration.title} intro={page.migration.intro} />
          <dl className="dg-ledger dg-ledger--dl">
            {page.migration.sources.map((source) => (
              <div key={source.key} className="dg-ledger__row">
                <dt className="dg-ledger__label">{source.label}</dt>
                <dd className="dg-ledger__detail">{source.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section tone="sheet" labelledBy="dg-hosting-title">
        <SectionHead id="dg-hosting-title" title={page.hosting.title} intro={page.hosting.intro} />
        <ul className="dg-statements dg-statements--three">
          {page.hosting.options.map((option) => (
            <li key={option.key} className="dg-statement">
              <h3 className="dg-title-s">{option.title}</h3>
              <p>{option.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="paper" labelledBy="dg-frappe-title">
        <div className="dg-pair">
          <div>
            <SectionHead id="dg-frappe-title" title={page.frappe.title} intro={page.frappe.intro} />
            <ul className="dg-list">
              {page.frappe.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="dg-title-m" id="dg-existing-title">
              {page.existing.title}
            </h2>
            <p className="dg-head__intro">{page.existing.intro}</p>
            <ul className="dg-list">
              {page.existing.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="sheet" labelledBy="dg-erpnext-faq-title">
        <div className="dg-split">
          <SectionHead id="dg-erpnext-faq-title" title={content.home.faq.title} />
          <Faq questions={content.questions} keys={page.faqKeys} name="dg-faq-erpnext" />
        </div>
      </Section>

      <Related site={site} locale={locale} content={content} paths={["/automation/", "/industries/", "/method/"]} />
      <Closing site={site} locale={locale} content={content} />
    </>
  );
}
