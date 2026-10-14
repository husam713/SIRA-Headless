import { Closing } from "@/components/digital-site/primitives";
import { DigitalHero } from "@/components/digital-site/sections/hero";
import {
  CommitmentsSection,
  ErpSection,
  FaqSection,
  IndustriesSection,
  MethodSection,
  ProblemSection,
  SolutionsSection,
  SystemSection,
} from "@/components/digital-site/sections/home";
import { getDigitalSiteContent } from "@/content/digital-site";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalHomeProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/**
 * The SIRA Digital homepage, in one language. The order is the argument:
 * the promise and its drawing; the problem as buyers live it; what we do;
 * the ERP at the centre; the system running (an approval, the view it
 * feeds); where it applies; how it goes live; what you can hold us to; the
 * questions asked first; and one thing to do next.
 */
export function DigitalHome({ site, locale }: DigitalHomeProps) {
  const content = getDigitalSiteContent(locale);
  const props = { site, locale, content };

  return (
    <>
      <DigitalHero {...props} />
      <ProblemSection {...props} />
      <SolutionsSection {...props} />
      <ErpSection {...props} />
      <SystemSection {...props} />
      <IndustriesSection {...props} />
      <MethodSection {...props} />
      <CommitmentsSection {...props} />
      <FaqSection {...props} />
      <Closing {...props} />
    </>
  );
}
