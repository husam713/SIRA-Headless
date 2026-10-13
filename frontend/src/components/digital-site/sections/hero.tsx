import { ButtonLink } from "@/components/digital-site/primitives";
import { RouteMap } from "@/components/digital-site/route-map";
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
 * The first screen: one sentence and the drawing that proves it. The route
 * map is the site's single animated moment; the type around it is still, so
 * the headline is the first thing painted and never waits for motion.
 */
export function DigitalHero({ site, locale, content }: DigitalHeroProps) {
  const { hero } = content.home;
  const direction = getTextDirection(locale);

  return (
    <section className="dg-hero dg-tone-paper" aria-labelledby={HERO_TITLE_ID}>
      <div className="dg-container">
        <div className="dg-hero__copy">
          <h1 className="dg-display dg-hero__title" id={HERO_TITLE_ID}>
            {hero.title.map((line) => (
              <span key={line} className="dg-line">
                {line}
              </span>
            ))}
          </h1>
          <div className="dg-hero__side">
            <p className="dg-lede dg-hero__lede">{hero.lede}</p>
            <div className="dg-hero__actions">
              <ButtonLink href={digitalHref(site, locale, hero.primary.href)}>{hero.primary.label}</ButtonLink>
              <ButtonLink href={digitalHref(site, locale, hero.secondary.href)} variant="secondary">
                {hero.secondary.label}
              </ButtonLink>
            </div>
          </div>
        </div>

        <RouteMap content={hero.map} direction={direction === "rtl" ? "rtl" : "ltr"} />
      </div>
    </section>
  );
}
