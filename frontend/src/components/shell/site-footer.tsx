import type { ResolvedBrand } from "@/lib/brand";
import type { NavigationItem } from "@/lib/navigation";

interface GroupCrossLink {
  readonly label: string;
  readonly href: string;
}

interface SiteFooterProps {
  readonly brand: ResolvedBrand;
  /** Top-level footer-menu items only — same scope note as SiteHeader. */
  readonly items: readonly NavigationItem[];
  /** Cross-link back to SIRA GROUP, present on branch sites only. */
  readonly groupLink: GroupCrossLink | null;
}

export function SiteFooter({ brand, items, groupLink }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-deep-border bg-brand-footer text-brand-paper/70">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-12 border-b border-brand-paper/10 pb-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-3">
              {/* Local static asset — see SiteHeader for why this stays a plain <img>. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.assets.markOnDark.src}
                alt={brand.assets.markOnDark.alt}
                width={brand.assets.markOnDark.width}
                height={brand.assets.markOnDark.height}
                aria-hidden={brand.assets.markOnDark.decorative || undefined}
                className="h-8 w-auto"
              />
              <span className="font-display text-lg font-semibold text-brand-paper">
                {brand.name}
              </span>
            </div>
            {brand.tagline !== null ? (
              <p className="mt-4 text-sm leading-relaxed">{brand.tagline}</p>
            ) : null}
            {brand.address !== null ? (
              <p className="mt-3 text-xs text-brand-paper/55">{brand.address}</p>
            ) : null}
          </div>

          {items.length > 0 ? (
            <nav aria-label="Footer" className="flex flex-wrap gap-x-10 gap-y-4">
              {items.map((item) => (
                <a
                  key={item.databaseId}
                  href={item.href}
                  target={item.target ?? undefined}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="text-sm transition-colors hover:text-brand-accent-bright"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 text-xs">
          <span>
            &copy; {year} {brand.name}. All rights reserved.
          </span>
          {groupLink !== null ? (
            <a
              href={groupLink.href}
              className="font-semibold uppercase tracking-[0.05em] transition-colors hover:text-brand-accent-bright"
            >
              {groupLink.label}
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
