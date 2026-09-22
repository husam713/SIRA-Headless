import { ArrowGlyph, RouteGlyph } from "@/components/digital-site/glyphs";
import { DigitalClosing } from "@/components/digital-site/sections/closing";
import { getDigitalSiteContent } from "@/content/digital-site";
import { digitalHref } from "@/lib/digital-site/hrefs";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalServicesPageProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/** What we build: each capability as a full row on the schematic. */
export function DigitalServicesPage({ site, locale }: DigitalServicesPageProps) {
  const content = getDigitalSiteContent(locale);
  const { services, capabilities } = content;

  return (
    <>
      <section aria-labelledby="dg-services-heading">
        <div className="dg-container">
          <div className="dg-intro">
            <p className="dg-eyebrow dg-mono">{services.eyebrow}</p>
            <h1 className="dg-display-l" id="dg-services-heading">
              {services.title}
            </h1>
            <p className="dg-lede">{services.lede}</p>
          </div>

          <ol className="dg-rows">
            {capabilities.items.map((item) => (
              <li key={item.key} id={item.key} className="dg-row dg-reveal">
                <div className="dg-row__lead">
                  <span className="dg-mono" style={{ color: "var(--dg-text-3)" }}>
                    {item.index}
                  </span>
                  <RouteGlyph name={item.key} className="dg-row__glyph" />
                </div>
                <div className="dg-row__body">
                  <h2 className="dg-display-m">{item.title}</h2>
                  <p className="dg-row__detail">{item.detail}</p>
                </div>
                <div className="dg-row__aside">
                  <h3 className="dg-mono" style={{ margin: 0, color: "var(--dg-text-3)" }}>
                    {capabilities.examplesLabel}
                  </h3>
                  <ul className="dg-row__examples">
                    {item.examples.map((example) => (
                      <li key={example}>{example}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          <div className="dg-section dg-section--tight">
            <div className="dg-panel dg-reveal">
              <div>
                <h2 className="dg-display-m">{services.notSureTitle}</h2>
                <p className="dg-panel__body">{services.notSureBody}</p>
              </div>
              <a href={digitalHref(site, locale, services.notSure.href)} className="dg-btn">
                <span>{services.notSure.label}</span>
                <ArrowGlyph className="dg-btn__arrow" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <DigitalClosing site={site} locale={locale} content={content} />
    </>
  );
}
