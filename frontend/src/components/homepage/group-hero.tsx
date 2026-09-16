import type { CSSProperties } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { getBrandPreset } from "@/lib/brand";
import { resolveBusinessUnitAccent } from "@/lib/homepage/business-unit-accent";
import type { GroupHomepageHero } from "@/lib/homepage/types";
import { CHROME } from "@/lib/i18n/locale";
import type { LocaleCode } from "@/types/site";
import { CtaLink } from "@/components/homepage/cta-link";
import {
  GroupHeroCarousel,
  type PreparedGroupHeroSlide,
} from "@/components/homepage/group-hero-carousel";

interface GroupHeroProps {
  readonly hero: GroupHomepageHero;
  /** Defaults to the site's default language for callers that have none. */
  readonly locale?: LocaleCode;
}

export function GroupHero({ hero, locale = "en" }: GroupHeroProps) {
  const chrome = CHROME[locale];
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

  // Atlas direction: the headline is set line by line — before, highlight,
  // after — each rising from under its own clip on arrival. The three CMS
  // fields are exactly those three lines, which is what makes the choreography
  // editorial rather than a split this component guesses at.
  const lines = [
    hero.headingBefore,
    hero.headingHighlight,
    hero.headingAfter,
  ].filter((line): line is string => line !== null);

  const headingContent = (
    <div className="atlas-arrive flex flex-col gap-8 text-brand-paper">
      {hasHeading ? (
        <h1
          className="atlas-display atlas-display--xl"
          style={{ "--i": 1, "--atlas-accent": highlightColor } as CSSProperties}
        >
          {lines.map((line, index) => (
            <span
              key={index}
              className={`atlas-line${line === hero.headingHighlight ? " atlas-accent" : ""}`}
              style={{ "--i": index } as CSSProperties}
            >
              <span>{line}</span>
            </span>
          ))}
        </h1>
      ) : null}

      {hero.description !== null ? (
        <p
          className="max-w-[34rem] text-pretty text-base leading-7 text-brand-paper/80 sm:text-lg"
          style={{ "--i": 5 } as CSSProperties}
        >
          {hero.description}
        </p>
      ) : null}

      {hero.primaryCta !== null || hero.secondaryCta !== null ? (
        <div className="flex flex-wrap items-center gap-4 pt-2" style={{ "--i": 6 } as CSSProperties}>
          {hero.primaryCta !== null ? (
            <CtaLink link={hero.primaryCta} variant="solid" />
          ) : null}
          {hero.secondaryCta !== null ? (
            <CtaLink link={hero.secondaryCta} variant="outline" />
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <section
      aria-label="SIRA Group"
      className="atlas-hero relative isolate flex flex-col justify-end overflow-hidden bg-brand-deep"
    >
      {preparedSlides.length > 0 ? (
        <GroupHeroCarousel
          slides={preparedSlides}
          labels={{
            featuredProjects: chrome.featuredProjects,
            previousProject: chrome.previousProject,
            nextProject: chrome.nextProject,
            pause: chrome.pause,
            play: chrome.play,
            featuredVentures: chrome.featuredVentures,
            showingSlide: chrome.showingSlide,
          }}
        >
          {headingContent}
        </GroupHeroCarousel>
      ) : (
        <PageContainer className="relative z-[2] pb-16 pt-32 sm:pb-20 lg:pb-24">
          {headingContent}
        </PageContainer>
      )}
      <div aria-hidden="true" className="atlas-scroll-cue" />
    </section>
  );
}
