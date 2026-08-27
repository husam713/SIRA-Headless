import Link from "next/link";
import { MobileMenu } from "@/components/shell/mobile-menu";
import type { ResolvedBrand } from "@/lib/brand";
import type { NavigationItem } from "@/lib/navigation";

interface GroupCrossLink {
  readonly label: string;
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
}

export function SiteHeader({ brand, items, groupLink }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-brand-paper-glass backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link href="/" className="flex flex-shrink-0 items-center gap-3">
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
              <span className="font-display text-lg font-semibold tracking-wide text-brand-ink">
                {brand.name}
              </span>
            </>
          )}
        </Link>

        {items.length > 0 ? (
          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
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

          {brand.email !== null ? (
            <a
              href={`mailto:${brand.email}`}
              className="hidden rounded-full bg-brand-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.03em] text-brand-paper transition-colors hover:bg-brand-ink/90 lg:inline-block"
            >
              Contact Us
            </a>
          ) : null}

          <MobileMenu items={items} groupLink={groupLink} />
        </div>
      </div>
    </header>
  );
}
