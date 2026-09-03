import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { CtaLink } from "@/components/homepage/cta-link";
import type { BranchHomepageHero } from "@/lib/homepage/types";

// Design reference (Sira Real Estate / Healthcare / Lifestyle / Consulting
// .dc.html, hero section): unlike the Group homepage, a branch hero is a
// single static image (no carousel/slides) with an eyebrow of
// "<BRAND> · <REGION>", a two-line heading whose last clause is italicized in
// the branch's own accent color, a description, and two CTAs over a dark
// overlay gradient — same overlay tokens the Group hero carousel uses.

interface BranchHeroProps {
  readonly hero: BranchHomepageHero;
}

export function BranchHero({ hero }: BranchHeroProps) {
  const hasHeading =
    hero.headingBefore !== null ||
    hero.headingHighlight !== null ||
    hero.headingAfter !== null;

  return (
    <section
      aria-label={hero.eyebrow ?? "Hero"}
      className="relative isolate flex min-h-[75svh] flex-col justify-end overflow-hidden bg-brand-deep lg:min-h-[85svh]"
    >
      <div aria-hidden="true" className="absolute inset-0 z-0">
        {hero.image !== null ? (
          <picture className="absolute inset-0 block">
            {hero.mobileImage !== null ? (
              <source media="(max-width: 767px)" srcSet={hero.mobileImage.sourceUrl} />
            ) : null}
            {/* WPGraphQL media-origin allowlisting (2C4-B07) is unresolved, so a plain
                <img> is used rather than next/image, which would require configuring
                remote patterns. */}
            <img
              src={hero.image.sourceUrl}
              alt={hero.imageAlt ?? ""}
              width={hero.image.width ?? undefined}
              height={hero.image.height ?? undefined}
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              className="h-full w-full object-cover"
            />
          </picture>
        ) : null}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, var(--brand-hero-overlay-top) 0%, var(--brand-hero-overlay-middle) 45%, var(--brand-hero-overlay-bottom) 100%)",
        }}
      />

      <PageContainer className="relative z-[2] pb-16 pt-32 sm:pb-20 lg:pb-24">
        <div className="flex max-w-[42rem] flex-col gap-8 text-brand-paper">
          {hero.eyebrow !== null || hero.region !== null ? (
            <SectionEyebrow>
              {[hero.eyebrow, hero.region].filter((part) => part !== null).join(" · ")}
            </SectionEyebrow>
          ) : null}

          {hasHeading ? (
            <h1 className="text-balance font-display text-[clamp(2.5rem,7vw,5.5rem)] font-normal leading-[0.98] tracking-tight">
              {hero.headingBefore}
              {hero.headingHighlight !== null ? (
                <>
                  {hero.headingBefore !== null ? " " : ""}
                  <span className="italic text-brand-accent">{hero.headingHighlight}</span>
                </>
              ) : null}
              {hero.headingAfter !== null ? ` ${hero.headingAfter}` : ""}
            </h1>
          ) : null}

          {hero.description !== null ? (
            <p className="max-w-[36rem] text-pretty text-base leading-7 text-brand-paper/80 sm:text-lg">
              {hero.description}
            </p>
          ) : null}

          {hero.primaryCta !== null || hero.secondaryCta !== null ? (
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {hero.primaryCta !== null ? (
                <CtaLink link={hero.primaryCta} variant="solid" />
              ) : null}
              {hero.secondaryCta !== null ? (
                <CtaLink link={hero.secondaryCta} variant="outline" />
              ) : null}
            </div>
          ) : null}
        </div>
      </PageContainer>
    </section>
  );
}
