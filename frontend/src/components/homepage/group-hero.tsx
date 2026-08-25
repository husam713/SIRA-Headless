import { getBrandPreset } from "@/lib/brand";
import { resolveBusinessUnitAccent } from "@/lib/homepage/business-unit-accent";
import type { GroupHomepageHero } from "@/lib/homepage/types";
import { HeroCtaLink } from "@/components/homepage/hero-cta-link";
import {
  GroupHeroCarousel,
  type PreparedGroupHeroSlide,
} from "@/components/homepage/group-hero-carousel";

interface GroupHeroProps {
  readonly hero: GroupHomepageHero;
}

export function GroupHero({ hero }: GroupHeroProps) {
  const groupPreset = getBrandPreset("group");
  const fallbackAccent = Object.freeze({
    label: groupPreset.name,
    color: groupPreset.identity.accent,
  });

  const preparedSlides: readonly PreparedGroupHeroSlide[] = hero.slides.map(
    (slide, index) => {
      const accent = resolveBusinessUnitAccent(slide.businessUnit, fallbackAccent);

      return Object.freeze({
        key: `${index}-${slide.image?.databaseId ?? slide.title ?? index}`,
        title: slide.title,
        tag: slide.eyebrow ?? accent.label,
        location: slide.location,
        accentColor: accent.color,
        image: slide.image,
        mobileImage: slide.mobileImage,
        imageAlt: slide.imageAlt,
        cta: slide.primaryCta,
      });
    },
  );

  const highlightColor = preparedSlides[0]?.accentColor ?? "var(--brand-accent-bright)";
  const hasHeading =
    hero.headingBefore !== null ||
    hero.headingHighlight !== null ||
    hero.headingAfter !== null;

  const headingContent = (
    <div className="flex flex-col gap-8 text-brand-paper">
      {hasHeading ? (
        <h1 className="text-balance font-display text-[clamp(2.75rem,9vw,7.5rem)] font-normal leading-[0.95] tracking-tight">
          {hero.headingBefore}
          {hero.headingHighlight !== null ? (
            <>
              {hero.headingBefore !== null ? " " : ""}
              <span className="italic" style={{ color: highlightColor }}>
                {hero.headingHighlight}
              </span>
            </>
          ) : null}
          {hero.headingAfter !== null ? ` ${hero.headingAfter}` : ""}
        </h1>
      ) : null}

      {hero.description !== null ? (
        <p className="max-w-[34rem] text-pretty text-base leading-7 text-brand-paper/80 sm:text-lg">
          {hero.description}
        </p>
      ) : null}

      {hero.primaryCta !== null || hero.secondaryCta !== null ? (
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {hero.primaryCta !== null ? (
            <HeroCtaLink link={hero.primaryCta} variant="solid" />
          ) : null}
          {hero.secondaryCta !== null ? (
            <HeroCtaLink link={hero.secondaryCta} variant="outline" />
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <section
      aria-label="SIRA Group"
      className="relative isolate flex min-h-[85svh] flex-col justify-end overflow-hidden bg-brand-deep lg:min-h-[95svh]"
    >
      {preparedSlides.length > 0 ? (
        <GroupHeroCarousel slides={preparedSlides}>{headingContent}</GroupHeroCarousel>
      ) : (
        <div className="relative z-[2] mx-auto w-full max-w-[82.5rem] px-6 pb-16 pt-32 sm:pb-20 lg:px-8 lg:pb-24">
          {headingContent}
        </div>
      )}
    </section>
  );
}
