import { CtaLink } from "@/components/homepage/cta-link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import type { AboutHero } from "@/lib/content/digital-about";

// The About hero.
//
// Measured against the reference at 1440: a full-bleed stage 738px tall sitting
// directly under the header, a 64/66 display line at weight 700 and -0.03em,
// and the portrait taking the trailing half and bleeding off the top and the
// outer edge. One ground colour throughout: the panel is the page ground with a
// hairline under it, not a second dark. Depth comes from the photograph and the
// wash over it, which is what stops the section reading as a card.
//
// The portrait is optional and the layout does not reserve space for it. A
// missing photograph gives a wide type panel, not an empty frame — the same
// rule the rest of this tenant follows, and the reason the page can ship before
// the real photography exists.
//
// The name is the highlight, so `headingHighlight` is the accent span rather
// than a colour chosen here: which words carry the accent is editorial.

interface DigitalAboutHeroProps {
  readonly hero: AboutHero;
}

export function DigitalAboutHero({ hero }: DigitalAboutHeroProps) {
  const hasHeading =
    hero.headingBefore !== null ||
    hero.headingHighlight !== null ||
    hero.headingAfter !== null;

  return (
    <section
      className="relative isolate overflow-hidden border-b border-brand-border"
      aria-labelledby={hasHeading ? "about-hero-heading" : undefined}
      aria-label={hasHeading ? undefined : "Introduction"}
    >
      {/* The portrait is a background layer rather than a grid column: at the
          reference's proportions it bleeds off two edges, and a column would
          have forced a gutter it does not have. Hidden below lg, where the
          type needs the whole width and a cropped face reads as an accident. */}
      {hero.portrait !== null ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 end-0 hidden w-[52%] lg:block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero.portrait.sourceUrl}
            alt=""
            width={hero.portrait.width ?? undefined}
            height={hero.portrait.height ?? undefined}
            className="h-full w-full object-cover object-top"
            loading="eager"
            decoding="async"
          />
          {/* Two washes, not one. The horizontal one keeps the type edge legible
              where the photograph runs under it; the vertical one stops the
              image colliding with the section boundary below. */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-brand-paper/40 to-brand-paper" />
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-brand-paper to-transparent" />
        </div>
      ) : null}

      <PageContainer className="digital-reveal relative flex min-h-[clamp(30rem,68svh,46rem)] flex-col justify-center py-[clamp(4rem,8vw,7rem)]">
        <div className="max-w-[36rem]">
          {hero.eyebrow !== null ? (
            <SectionEyebrow tone="accent" className="digital-eyebrow">
              {hero.eyebrow}
            </SectionEyebrow>
          ) : null}

          {hasHeading ? (
            <h1
              id="about-hero-heading"
              className="digital-display mt-7 text-balance text-[clamp(2.5rem,1.4rem+3.1vw,4rem)] font-bold leading-[1.03] tracking-[-0.03em]"
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
            <p className="mt-7 max-w-[38ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
              {hero.description}
            </p>
          ) : null}

          {hero.primaryCta !== null || hero.secondaryCta !== null ? (
            <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
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
