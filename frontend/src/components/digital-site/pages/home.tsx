import { DigitalApproach } from "@/components/digital-site/sections/approach";
import { DigitalClosing } from "@/components/digital-site/sections/closing";
import { DigitalGroup } from "@/components/digital-site/sections/group";
import { DigitalHero } from "@/components/digital-site/sections/hero";
import { DigitalPrinciples } from "@/components/digital-site/sections/principles";
import { DigitalStatement } from "@/components/digital-site/sections/statement";
import { DigitalStations } from "@/components/digital-site/sections/stations";
import { getDigitalSiteContent } from "@/content/digital-site";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalHomeProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/**
 * The SIRA Digital homepage, in one language. The order is the argument:
 * what we believe, what we build, how we work, what we hold to, who we are
 * part of, and then the one thing to do next.
 */
export function DigitalHome({ site, locale }: DigitalHomeProps) {
  const content = getDigitalSiteContent(locale);

  return (
    <>
      <DigitalHero site={site} locale={locale} content={content} />
      <DigitalStatement content={content} />
      <DigitalStations site={site} locale={locale} content={content} />
      <DigitalApproach content={content} />
      <DigitalPrinciples content={content} />
      <DigitalGroup locale={locale} content={content} />
      <DigitalClosing site={site} locale={locale} content={content} />
    </>
  );
}
