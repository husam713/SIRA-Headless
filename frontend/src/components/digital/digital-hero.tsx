import { CtaLink } from "@/components/homepage/cta-link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import type { DigitalHomepageHero } from "@/lib/homepage/types";

// SIRA Digital's hero (ADR-033).
//
// Deliberately NOT the BranchHero. The four branch companies share one tested
// full-bleed photographic panel; Digital is a technology company on a dark
// ground and has no photograph to put behind a headline. What carries the panel
// instead is type: a tight display line at a size the branch sites never use,
// against a lot of empty ground.
//
// The measured proportions come from the Phase 1 reference audit
// (artifacts/reference-forensics/sirahdigital-in): one screen minus the header,
// content on the leading half, display leading just under 1.0 against body
// leading of 1.7. The words are ours; the proportions are what was measured.

interface DigitalHeroProps {
  readonly hero: DigitalHomepageHero;
}

export function DigitalHero({ hero }: DigitalHeroProps) {
  const hasHeading =
    hero.headingBefore !== null ||
    hero.headingHighlight !== null ||
    hero.headingAfter !== null;

  return (
    <section
      // Exactly one viewport minus the fixed header, which is the same offset
      // token the shell and every anchor already use, so the first fold is a
      // whole screen rather than a screen-and-a-bit.
      className="relative flex min-h-[calc(100svh-var(--layout-header-offset))] items-start pt-12 lg:items-center lg:pt-0"
      aria-labelledby={hasHeading ? "digital-hero-heading" : undefined}
      aria-label={hasHeading ? undefined : "Introduction"}
    >
      <PageContainer className="digital-reveal py-16 lg:py-0">
        <div className="max-w-[46rem]">
          {hero.eyebrow !== null ? (
            <SectionEyebrow tone="accent" className="digital-eyebrow">
              {hero.eyebrow}
            </SectionEyebrow>
          ) : null}

          {hasHeading ? (
            <h1
              id="digital-hero-heading"
              // Leading below 1.0 is the point: it is what makes a display line
              // read as one object rather than as stacked sentences. It is also
              // exactly what does not survive translation, which is why
              // `digital-display` carries an Arabic override.
              className="digital-display mt-7 text-balance text-[clamp(2.5rem,1.2rem+3.4vw,3.375rem)] font-bold leading-[0.98] tracking-[-0.03em]"
            >
              {hero.headingBefore}
              {hero.headingHighlight !== null ? (
                <>
                  {hero.headingBefore !== null ? " " : ""}
                  <span className="text-brand-accent">{hero.headingHighlight}</span>
                </>
              ) : null}
              {hero.headingAfter !== null ? ` ${hero.headingAfter}` : ""}
            </h1>
          ) : null}

          {hero.description !== null ? (
            // ~50 characters per line. Wider reads as documentation; narrower
            // turns a two-sentence positioning line into a column.
            <p className="mt-7 max-w-[34ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
              {hero.description}
            </p>
          ) : null}

          {hero.primaryCta !== null || hero.secondaryCta !== null ? (
            <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-5">
              {hero.primaryCta !== null ? (
                <CtaLink link={hero.primaryCta} variant="solid" />
              ) : null}
              {hero.secondaryCta !== null ? (
                <CtaLink link={hero.secondaryCta} variant="ghost-dark" />
              ) : null}
            </div>
          ) : null}
        </div>
      </PageContainer>
    </section>
  );
}
