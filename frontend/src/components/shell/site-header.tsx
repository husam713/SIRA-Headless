import Link from "next/link";
import { LanguageSwitch } from "@/components/shell/language-switch";
import { MobileMenu } from "@/components/shell/mobile-menu";
import { PageContainer } from "@/components/layout/page-container";
import type { ResolvedBrand } from "@/lib/brand";
import { CHROME } from "@/lib/i18n/locale";
import type { NavigationItem } from "@/lib/navigation";
import { Wordmark } from "@/components/shell/wordmark";
import type { LocaleCode } from "@/types/site";

interface GroupCrossLink {
  readonly label: string;
  readonly href: string;
}

/** The same page in the other language, when the site offers one. */
export interface LanguageAlternate {
  readonly locale: LocaleCode;
  readonly href: string;
}

interface SiteHeaderProps {
  readonly brand: ResolvedBrand;
  /**
   * Top-level primary-menu items only — see the comment in MobileMenu about
   * `item.children` not yet having a dropdown treatment.
   */
  readonly items: readonly NavigationItem[];
  /** Cross-link back to SIRA GROUP, present on branch sites only. */
  readonly groupLink: GroupCrossLink | null;
  readonly locale: LocaleCode;
  /** Where the home link points — `/` or `/ar`, per ADR-034. */
  readonly homeHref: string;
  readonly languageAlternate: LanguageAlternate | null;
}

export function SiteHeader({
  brand,
  items,
  groupLink,
  locale,
  homeHref,
  languageAlternate,
}: SiteHeaderProps) {
  const chrome = CHROME[locale];

  return (
    // The header owns --layout-header-offset rather than being described by it.
    //
    // That token is the anchor scroll offset, the sticky top for every rail and
    // index, and the subtrahend in every `100svh - header` band. It said 80px
    // while the header actually rendered 67px at >=lg and 77px at the mobile
    // touch-target floor. Nothing looked broken, which is why it survived: an
    // anchored heading simply stopped 13px lower than it should, and every
    // full-viewport band came out 13px short. Both drift with the header, and
    // the header drifts with its content.
    //
    // A min-height here ends that. The token now sets the box and the padding
    // only sets a floor beneath it, so the two cannot disagree; `py-3` leaves
    // headroom for a taller logo or a larger touch target before the content
    // could push past the token again. Border-box sizing keeps the hairline
    // inside the measurement.
    <header className="sticky top-0 z-40 flex min-h-[var(--layout-header-offset)] items-center border-b border-brand-border bg-brand-paper-glass backdrop-blur-md">
      {/* Same container primitive as every section, so the header content
          column cannot drift from the page beneath it. */}
      <PageContainer className="flex w-full items-center justify-between gap-6 py-3">
        <Link href={homeHref} className="flex flex-shrink-0 items-center gap-3">
          {brand.assets.logo !== null ? (
            // Local static asset (not remote WordPress media, so 2C4-B07 does
            // not apply here) — plain <img> anyway, for consistency with the
            // rest of the codebase, which does not use next/image anywhere yet.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.assets.logo.src}
              alt={brand.assets.logo.alt}
              width={brand.assets.logo.width}
              height={brand.assets.logo.height}
              className="h-8 w-auto sm:h-9"
            />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.assets.mark.src}
                alt={brand.assets.mark.alt}
                width={brand.assets.mark.width}
                height={brand.assets.mark.height}
                aria-hidden={brand.assets.mark.decorative || undefined}
                className="h-7 w-auto"
              />
              <Wordmark
                name={brand.name}
                tone="ink"
                className="font-display text-lg font-semibold tracking-wide"
              />
            </>
          )}
        </Link>

        {items.length > 0 ? (
          <nav
            aria-label={chrome.primaryNav}
            className="hidden items-center gap-8 lg:flex"
          >
            {items.map((item) => (
              <a
                key={item.databaseId}
                href={item.href}
                target={item.target ?? undefined}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink-soft transition-colors hover:text-brand-accent"
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}

        <div className="flex flex-shrink-0 items-center gap-4">
          {groupLink !== null ? (
            <a
              href={groupLink.href}
              className="hidden text-xs font-semibold uppercase tracking-[0.06em] text-brand-ink-faint transition-colors hover:text-brand-accent lg:inline"
            >
              {groupLink.label}
            </a>
          ) : null}

          {languageAlternate !== null ? (
            <LanguageSwitch
              locale={locale}
              href={languageAlternate.href}
              alternate={languageAlternate.locale}
              className="hidden rounded-sm border border-brand-border px-3 py-2 text-xs font-semibold tracking-[0.06em] text-brand-ink-soft transition-colors hover:border-brand-accent hover:text-brand-accent lg:inline-block"
            />
          ) : null}

          {brand.email !== null ? (
            <a
              href={`mailto:${brand.email}`}
              className="hidden rounded-sm bg-brand-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.03em] text-brand-on-deep transition-colors hover:bg-brand-ink/90 lg:inline-block"
            >
              {chrome.contactCta}
            </a>
          ) : null}

          <MobileMenu
            items={items}
            groupLink={groupLink}
            locale={locale}
            languageAlternate={languageAlternate}
          />
        </div>
      </PageContainer>
    </header>
  );
}
