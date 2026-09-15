import { CtaLink } from "@/components/homepage/cta-link";
import { PageContainer } from "@/components/layout/page-container";
import type { ContentPage } from "@/lib/content/get-content-page";
import { localeHref } from "@/lib/i18n/locale";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface PageClosingCtaProps {
  readonly page: ContentPage | null;
  readonly headingId: string;
  readonly fallbackHeading: string;
  readonly fallbackLabel: string;
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/**
 * The closing band that every index route ends on.
 *
 * Its copy comes from the same CMS intro group as the opening band, so a page's
 * first and last words are edited in one place and translated together. The
 * destination is always the contact route in the reader's own language — a link
 * that drops an Arabic reader onto the English contact form is the most
 * expensive place to lose them.
 */
export function PageClosingCta({
  page,
  headingId,
  fallbackHeading,
  fallbackLabel,
  site,
  locale,
}: PageClosingCtaProps) {
  const intro = page?.intro ?? null;

  return (
    <section className="border-t border-brand-border" aria-labelledby={headingId}>
      <PageContainer className="digital-reveal flex min-h-[45svh] flex-col items-center justify-center gap-8 py-[clamp(4rem,8vw,7rem)] text-center">
        <h2
          id={headingId}
          className="digital-display max-w-[20ch] text-balance text-[clamp(2.25rem,1.5rem+3.6vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.025em]"
        >
          {intro?.ctaHeading ?? fallbackHeading}
        </h2>
        <CtaLink
          link={{
            label: intro?.ctaLabel ?? fallbackLabel,
            href: localeHref(site, locale, "/contact"),
            target: null,
          }}
          variant="solid"
        />
      </PageContainer>
    </section>
  );
}
