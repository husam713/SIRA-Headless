import { ArrowGlyph, RouteGlyph } from "@/components/digital-site/glyphs";
import type { DigitalSiteContent } from "@/content/digital-site";
import { digitalHref } from "@/lib/digital-site/hrefs";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalStationsProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
  readonly content: DigitalSiteContent;
}

/** The six capabilities as stations on the route. */
export function DigitalStations({ site, locale, content }: DigitalStationsProps) {
  const { capabilities } = content;
  const servicesHref = digitalHref(site, locale, "/services/");

  return (
    <section className="dg-section" id="capabilities" aria-labelledby="dg-capabilities-heading">
      <div className="dg-container">
        <div className="dg-section-head dg-reveal">
          <div>
            <p className="dg-eyebrow dg-mono">{capabilities.eyebrow}</p>
            <h2 className="dg-display-l" id="dg-capabilities-heading">
              {capabilities.title}
            </h2>
          </div>
          <p className="dg-lede">{capabilities.intro}</p>
        </div>

        <ol className="dg-stations dg-reveal dg-reveal--far">
          {capabilities.items.map((item) => (
            <li key={item.key} className="dg-station">
              <div className="dg-station__top">
                <span className="dg-mono dg-station__index">{item.index}</span>
                <RouteGlyph name={item.key} className="dg-station__glyph" />
              </div>
              <div className="dg-station__body">
                <h3 className="dg-display-s dg-station__title">{item.title}</h3>
                <p className="dg-station__summary">{item.summary}</p>
              </div>
              <ul className="dg-station__examples" aria-label={capabilities.examplesLabel}>
                {item.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
              {/* The whole station is one link, named by its title. */}
              <a className="dg-station__link" href={`${servicesHref}#${item.key}`} aria-label={item.title} />
            </li>
          ))}
        </ol>

        <p className="dg-reveal" style={{ marginBlockStart: "2rem" }}>
          <a href={digitalHref(site, locale, capabilities.more.href)} className="dg-link">
            <span>{capabilities.more.label}</span>
            <ArrowGlyph className="dg-link__arrow" />
          </a>
        </p>
      </div>
    </section>
  );
}
