import type { CSSProperties } from "react";

import { LiveField } from "@/components/digital-site/field/live-field";
import { heroObstacles, StaticField } from "@/components/digital-site/field/static-field";
import { ArrowGlyph } from "@/components/digital-site/glyphs";
import type { DigitalSiteContent } from "@/content/digital-site";
import { digitalHref } from "@/lib/digital-site/hrefs";
import { getTextDirection } from "@/lib/i18n/direction";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalHeroProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
  readonly content: DigitalSiteContent;
}

export const HERO_TITLE_ID = "dg-hero-title";

/**
 * The first impression: the routing field, and two lines of type it flows
 * around. No photograph — the company has no verified imagery, and the field
 * is a truer picture of what it does than a stock desk would be.
 */
export function DigitalHero({ site, locale, content }: DigitalHeroProps) {
  const direction = getTextDirection(locale);
  const obstacles = heroObstacles(direction);

  return (
    <section className="dg-hero" aria-labelledby={HERO_TITLE_ID}>
      <LiveField
        seedKey="sira-digital-hero"
        direction={direction}
        stillObstacles={obstacles}
        protectId={HERO_TITLE_ID}
        label={content.hero.fieldLabel}
      >
        <StaticField seedKey="sira-digital-hero" direction={direction} obstacles={obstacles} />
      </LiveField>

      <div className="dg-container">
        <div className="dg-hero__content">
          <p className="dg-eyebrow dg-mono dg-hero__eyebrow">{content.hero.eyebrow}</p>

          <h1 className="dg-display dg-hero__title" id={HERO_TITLE_ID}>
            {content.hero.title.map((line, index) => (
              <span key={line} className="dg-hero__line" style={{ "--i": index } as CSSProperties}>
                <span>{line}</span>
              </span>
            ))}
          </h1>

          <p className="dg-lede dg-hero__lede">{content.hero.lede}</p>

          <div className="dg-hero__actions">
            <a href={digitalHref(site, locale, content.hero.primary.href)} className="dg-btn">
              <span>{content.hero.primary.label}</span>
              <ArrowGlyph className="dg-btn__arrow" />
            </a>
            <a href={digitalHref(site, locale, content.hero.secondary.href)} className="dg-btn dg-btn--ghost">
              <span>{content.hero.secondary.label}</span>
            </a>
          </div>
        </div>

        <div className="dg-hero__strip dg-mono">
          <span className="dg-scroll-cue">
            <span className="dg-scroll-cue__line" aria-hidden="true" />
            <span>{content.hero.scroll}</span>
          </span>
          <div className="dg-hero__strip-group">
            <span lang="en">English</span>
            <span lang="ar" dir="rtl">
              العربية
            </span>
            <span>{content.brand.groupCompany}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
