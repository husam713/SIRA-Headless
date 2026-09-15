import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import type { ContentPage } from "@/lib/content/get-content-page";

interface PageIntroHeaderProps {
  /** The CMS page for this route, or null when the tenant has not made one. */
  readonly page: ContentPage | null;
  /** Anchors the section's accessible name to the rendered `<h1>`. */
  readonly headingId: string;
  /** Shown when the CMS supplies no eyebrow. */
  readonly fallbackEyebrow: string;
  /** Shown when the CMS supplies neither an intro heading nor a page title. */
  readonly fallbackHeading: string;
  /** Shown when the CMS supplies no standfirst. Omitted entirely when null. */
  readonly fallbackStandfirst?: string | null;
  /** Height of the band, as a fraction of the viewport. */
  readonly height?: "tall" | "medium";
}

/**
 * The heading band at the top of an index route.
 *
 * Every string here is CMS-authored, with a literal only as the last resort.
 * That is what makes the most prominent copy on the page editable, and — since
 * ADR-034 gives each language its own page — what makes it translatable without
 * a deploy. The fallbacks exist so a tenant that has not authored the page yet
 * still gets a valid document with one `<h1>`, not an empty band.
 *
 * `heading` is preferred over `title` because a page title is also a menu label
 * and a browser tab, and the sentence that works as a headline is rarely the
 * two words that work in a menu.
 */
export function PageIntroHeader({
  page,
  headingId,
  fallbackEyebrow,
  fallbackHeading,
  fallbackStandfirst = null,
  height = "medium",
}: PageIntroHeaderProps) {
  const intro = page?.intro ?? null;
  const heading = intro?.heading ?? page?.title ?? fallbackHeading;
  const standfirst = intro?.standfirst ?? fallbackStandfirst;

  return (
    <section
      className={
        height === "tall"
          ? "relative flex min-h-[calc(70svh-var(--layout-header-offset))] items-end"
          : "relative flex min-h-[calc(55svh-var(--layout-header-offset))] items-end"
      }
      aria-labelledby={headingId}
    >
      <PageContainer className="digital-reveal pb-12 pt-[clamp(4rem,8vw,7rem)]">
        <SectionEyebrow tone="accent" className="digital-eyebrow">
          {intro?.eyebrow ?? fallbackEyebrow}
        </SectionEyebrow>
        <h1
          id={headingId}
          className="digital-display mt-7 max-w-[20ch] text-balance text-[clamp(2.5rem,1.2rem+3.4vw,3.375rem)] font-bold leading-[0.98] tracking-[-0.03em]"
        >
          {heading}
        </h1>
        {standfirst !== null ? (
          <p className="mt-7 max-w-[48ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
            {standfirst}
          </p>
        ) : null}
      </PageContainer>
    </section>
  );
}
