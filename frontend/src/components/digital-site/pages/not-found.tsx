import { notFoundObstacles, StaticField } from "@/components/digital-site/field/static-field";
import { ArrowGlyph } from "@/components/digital-site/glyphs";
import { getDigitalSiteContent } from "@/content/digital-site";
import { getTextDirection } from "@/lib/i18n/direction";
import { localeHref } from "@/lib/i18n/locale";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalNotFoundPageProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/** A route that does not exist, drawn as one. */
export function DigitalNotFoundPage({ site, locale }: DigitalNotFoundPageProps) {
  const content = getDigitalSiteContent(locale);
  const { notFound } = content;
  const direction = getTextDirection(locale);

  return (
    <section className="dg-404" aria-labelledby="dg-404-heading">
      <div className="dg-hero__field" aria-hidden="true">
        <StaticField
          seedKey="sira-digital-404"
          direction={direction}
          ticks={90}
          obstacles={notFoundObstacles(direction)}
        />
      </div>
      <div className="dg-container" style={{ display: "grid", gap: "1.25rem" }}>
        <p className="dg-display dg-404__code dg-num">{notFound.code}</p>
        <h1 className="dg-display-l" id="dg-404-heading">
          {notFound.title}
        </h1>
        <p className="dg-lede">{notFound.body}</p>
        <p style={{ margin: 0 }}>
          <a href={localeHref(site, locale, "/")} className="dg-btn">
            <span>{notFound.home}</span>
            <ArrowGlyph className="dg-btn__arrow" />
          </a>
        </p>
      </div>
    </section>
  );
}
