import { FlowStrip } from "@/components/digital-site/diagrams";
import { Closing, PageIntro, Related, Section, SectionHead } from "@/components/digital-site/primitives";
import { Tabs } from "@/components/digital-site/tabs";
import { getDigitalSiteContent } from "@/content/digital-site";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalIndustriesPageProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/**
 * Industries: one explorer by sector (where it breaks, which modules carry
 * the work, the route its documents take, what it connects to), then the
 * same story by department, as a before-and-after table.
 */
export function DigitalIndustriesPage({ site, locale }: DigitalIndustriesPageProps) {
  const content = getDigitalSiteContent(locale);
  const page = content.industries;
  const moduleName = (key: string): string => content.modules.find((module) => module.key === key)?.name ?? key;

  const panels = content.sectors.map((sector) => (
    <div key={sector.key} className="dg-sector-panel">
      <p className="dg-sector-panel__summary">{sector.summary}</p>
      <div className="dg-sector-panel__grid">
        <div>
          <h3 className="dg-label">{page.sectors.painsLabel}</h3>
          <ul className="dg-list">
            {sector.pains.map((pain) => (
              <li key={pain}>{pain}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="dg-label">{page.sectors.modulesLabel}</h3>
          <ul className="dg-documents">
            {sector.modules.map((key) => (
              <li key={key} className="dg-document">
                {moduleName(key)}
              </li>
            ))}
          </ul>
          <h3 className="dg-label">{page.sectors.integrationsLabel}</h3>
          <ul className="dg-list dg-list--plain">
            {sector.integrations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <h3 className="dg-label">{page.sectors.flowLabel}</h3>
      <FlowStrip steps={sector.flow} label={`${page.sectors.flowLabel}: ${sector.name}`} />
    </div>
  ));

  return (
    <>
      <PageIntro id="dg-industries-title" intro={page.intro} />

      <Section tone="paper" labelledBy="dg-sectors-title">
        <SectionHead id="dg-sectors-title" title={page.sectors.title} intro={page.sectors.intro} />
        <Tabs
          className="dg-explorer dg-explorer--sectors"
          label={page.sectors.title}
          items={content.sectors.map((sector) => ({ key: sector.key, label: sector.name }))}
          panels={panels}
        />
      </Section>

      <Section tone="sheet" labelledBy="dg-functions-title">
        <SectionHead id="dg-functions-title" title={page.functions.title} intro={page.functions.intro} />
        <div className="dg-table-wrap">
          <table className="dg-table">
            <thead>
              <tr>
                <th scope="col">{page.functions.functionLabel}</th>
                <th scope="col">{page.functions.beforeLabel}</th>
                <th scope="col">{page.functions.afterLabel}</th>
              </tr>
            </thead>
            <tbody>
              {content.functions.map((row) => (
                <tr key={row.key}>
                  <th scope="row">{row.name}</th>
                  <td>{row.before}</td>
                  <td>{row.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="mist" labelledBy="dg-group-sectors-title">
        <SectionHead id="dg-group-sectors-title" title={page.group.title} intro={page.group.intro} />
      </Section>

      <Related site={site} locale={locale} content={content} paths={["/erpnext/", "/automation/", "/method/"]} />
      <Closing site={site} locale={locale} content={content} />
    </>
  );
}
