import { ArrowGlyph, RouteGlyph } from "@/components/digital-site/glyphs";
import type { DigitalSiteContent } from "@/content/digital-site";
import { digitalHref } from "@/lib/digital-site/hrefs";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalClosingProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
  readonly content: DigitalSiteContent;
}

/** The route ends at a conversation. */
export function DigitalClosing({ site, locale, content }: DigitalClosingProps) {
  const { closing } = content;

  return (
    <section className="dg-section dg-tone-deep dg-closing-section" aria-labelledby="dg-closing-heading">
      <div className="dg-container">
        <RouteGlyph name="arrival" className="dg-closing__glyph" />
        <div className="dg-closing dg-reveal">
          <h2 className="dg-display" id="dg-closing-heading">
            {closing.title}
          </h2>
          <p className="dg-closing__body">{closing.body}</p>
          <p style={{ margin: 0 }}>
            <a href={digitalHref(site, locale, closing.primary.href)} className="dg-btn dg-btn--bone">
              <span>{closing.primary.label}</span>
              <ArrowGlyph className="dg-btn__arrow" />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
