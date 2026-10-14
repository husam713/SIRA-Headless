import { Dashboard } from "@/components/digital-site/dashboard";
import { FlowStrip, ModuleMap, ProblemIslands, Requirements } from "@/components/digital-site/diagrams";
import { Faq, Section, SectionHead, TextLink } from "@/components/digital-site/primitives";
import { Tabs } from "@/components/digital-site/tabs";
import { WorkflowSimulator } from "@/components/digital-site/workflow-simulator";
import type { DigitalSiteContent } from "@/content/digital-site";
import { digitalHref } from "@/lib/digital-site/hrefs";
import { getTextDirection } from "@/lib/i18n/direction";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface HomeSectionProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
  readonly content: DigitalSiteContent;
}

/** Before: the tools a company actually runs on, and what that costs. */
export function ProblemSection({ locale, content }: HomeSectionProps) {
  const { problem } = content.home;
  return (
    <Section tone="mist" labelledBy="dg-problem-title" className="dg-problem">
      <div className="dg-problem__grid">
        <div>
          <SectionHead id="dg-problem-title" title={problem.title} intro={problem.intro} />
          <ProblemIslands
            labels={problem.islands}
            label={problem.diagramLabel}
            direction={getTextDirection(locale) === "rtl" ? "rtl" : "ltr"}
          />
        </div>
        <div className="dg-ledger" role="table" aria-labelledby="dg-problem-title">
          <div className="dg-ledger__row dg-ledger__row--head" role="row">
            <span role="columnheader">{problem.symptomHeading}</span>
            <span role="columnheader">{problem.costHeading}</span>
          </div>
          {problem.rows.map((row) => (
            <div key={row.key} className="dg-ledger__row" role="row">
              <span className="dg-ledger__label" role="cell">
                {row.label}
              </span>
              <span className="dg-ledger__detail" role="cell">
                {row.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/** What we do: five lines of work, explored one at a time. */
export function SolutionsSection({ site, locale, content }: HomeSectionProps) {
  const { solutions } = content.home;
  const panels = content.solutions.map((solution) => (
    <div key={solution.key} className="dg-explorer__panel">
      <p className="dg-explorer__summary">{solution.detail}</p>
      <div className="dg-explorer__columns">
        <div>
          <h3 className="dg-label">{solutions.includesLabel}</h3>
          <ul className="dg-list">
            {solution.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="dg-label">{solutions.outcomeLabel}</h3>
          <p className="dg-explorer__outcome">{solution.outcome}</p>
          <TextLink href={digitalHref(site, locale, solution.link.href)}>{solution.link.label}</TextLink>
        </div>
      </div>
    </div>
  ));

  return (
    <Section tone="paper" labelledBy="dg-solutions-title" id="solutions">
      <SectionHead id="dg-solutions-title" title={solutions.title} intro={solutions.intro} />
      <Tabs
        className="dg-explorer"
        label={solutions.title}
        items={content.solutions.map((solution) => ({ key: solution.key, label: solution.title, meta: solution.summary }))}
        panels={panels}
      />
    </Section>
  );
}

/** ERPNext: the modules on one database, and the Saudi requirements. */
export function ErpSection({ site, locale, content }: HomeSectionProps) {
  const { erp } = content.home;
  return (
    <Section tone="sheet" labelledBy="dg-erp-title" id="erpnext">
      <SectionHead
        id="dg-erp-title"
        title={erp.title}
        intro={erp.intro}
        aside={<TextLink href={digitalHref(site, locale, erp.more.href)}>{erp.more.label}</TextLink>}
      />
      <ModuleMap modules={content.modules} databaseLabel={erp.databaseLabel} />
      <div className="dg-erp__requirements">
        <h3 className="dg-title-s">{erp.requirementsTitle}</h3>
        <Requirements items={content.requirements} />
      </div>
    </Section>
  );
}

/** The system running: an approval you can change, and the view it feeds. */
export function SystemSection({ locale, content }: HomeSectionProps) {
  const { workflow, dashboard } = content.demos;
  return (
    <div className="dg-tone-night dg-system">
      <section className="dg-section" id="approval-demo" aria-labelledby="dg-approval-title">
        <div className="dg-container">
          <SectionHead id="dg-approval-title" title={workflow.title} intro={workflow.intro} />
          <WorkflowSimulator content={workflow} locale={locale} illustrative={content.common.illustrative} />
        </div>
      </section>
      <section className="dg-section dg-section--joined" id="dashboard" aria-labelledby="dg-dashboard-title">
        <div className="dg-container">
          <SectionHead id="dg-dashboard-title" title={dashboard.title} intro={dashboard.intro} />
          <Dashboard content={dashboard} locale={locale} illustrative={content.common.illustrative} />
        </div>
      </section>
    </div>
  );
}

/** Where it applies: each sector's route, as documents. */
export function IndustriesSection({ site, locale, content }: HomeSectionProps) {
  const { industries } = content.home;
  return (
    <Section tone="paper" labelledBy="dg-industries-title">
      <SectionHead
        id="dg-industries-title"
        title={industries.title}
        intro={industries.intro}
        aside={<TextLink href={digitalHref(site, locale, industries.more.href)}>{industries.more.label}</TextLink>}
      />
      <ul className="dg-sector-routes">
        {content.sectors.map((sector) => (
          <li key={sector.key} className="dg-sector-route">
            <h3 className="dg-sector-route__name">{sector.name}</h3>
            <FlowStrip steps={sector.flow} label={`${content.industries.sectors.flowLabel}: ${sector.name}`} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** How a system goes live: the five stages, each with what it hands over. */
export function MethodSection({ site, locale, content }: HomeSectionProps) {
  const { method } = content.home;
  return (
    <Section tone="mist" labelledBy="dg-method-title">
      <SectionHead
        id="dg-method-title"
        title={method.title}
        intro={method.intro}
        aside={<TextLink href={digitalHref(site, locale, method.more.href)}>{method.more.label}</TextLink>}
      />
      <ol className="dg-rail">
        {content.phases.map((phase, index) => (
          <li key={phase.key} className="dg-rail__stage">
            <span className="dg-rail__index" aria-hidden="true">
              {index + 1}
            </span>
            <h3 className="dg-rail__name">{phase.name}</h3>
            <p className="dg-rail__summary">{phase.summary}</p>
            <p className="dg-rail__deliverable">
              <span className="dg-label">{method.deliverableLabel}</span>
              <span>{phase.deliverables[0]}</span>
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** What you can hold us to. */
export function CommitmentsSection({ content }: HomeSectionProps) {
  const { commitments } = content.home;
  return (
    <Section tone="paper" labelledBy="dg-commitments-title">
      <SectionHead id="dg-commitments-title" title={commitments.title} intro={commitments.intro} />
      <ul className="dg-commitments">
        {commitments.items.map((item) => (
          <li key={item.key} className="dg-commitment">
            <h3 className="dg-commitment__title">{item.title}</h3>
            <p className="dg-commitment__body">{item.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** The questions buyers ask first. */
export function FaqSection({ content }: HomeSectionProps) {
  const { faq } = content.home;
  return (
    <Section tone="sheet" labelledBy="dg-faq-title" id="questions">
      <div className="dg-split">
        <SectionHead id="dg-faq-title" title={faq.title} intro={faq.intro} />
        <Faq questions={content.questions} keys={faq.keys} name="dg-faq-home" />
      </div>
    </Section>
  );
}
