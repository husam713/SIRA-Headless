import type { ReactNode } from "react";

import { PageContainer } from "@/components/layout/page-container";
import type { ResolvedBrand } from "@/lib/brand";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import type { NavigationItem } from "@/lib/navigation";
import { SITE_KEYS, type SiteKey } from "@/types/site";

// Four columns, matching the reference: the brand statement, the site's own
// pages, the portfolio companies, and how to reach the group.
//
// This used to be a brand block beside one flat row of links, which measured
// the right HEIGHT but read as a generic site footer rather than the
// institutional index the reference ends on. Every column below is fed by an
// existing source of truth — the WordPress footer menu, the trusted site
// registry, and the CMS brand record — so none of it is hardcoded copy.

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
  /**
   * Branch-authored replacement for the brand tagline, from the homepage
   * `footer.taglineOverride` field. Null on Group and whenever the editor
   * has not set one, in which case the brand tagline stands.
   */
  readonly taglineOverride: string | null;
}

interface FooterColumnProps {
  readonly heading: string;
  readonly children: ReactNode;
}

function FooterColumn({ heading, children }: FooterColumnProps) {
  return (
    <div>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-paper/50">
        {heading}
      </h2>
      <ul className="mt-5 flex flex-col gap-3">{children}</ul>
    </div>
  );
}

const FOOTER_LINK_CLASS =
  "text-sm text-brand-paper/70 transition-colors hover:text-brand-accent-bright";

/**
 * The four portfolio companies, from the trusted site registry.
 *
 * The registry already owns each company's name and canonical hostname, and it
 * is the same source the host resolver and the canonical-URL builder use, so
 * the footer cannot drift from the sites it links to. Group is excluded: a
 * site does not list itself under "Companies".
 */
function portfolioCompanies(currentSite: SiteKey) {
  return SITE_KEYS.filter((key) => key !== "group").flatMap((key) => {
    const site = getSiteDefinition(key);
    if (site === null) return [];

    return [
      {
        key,
        name: site.name,
        href: `https://${site.canonicalHostname}`,
        isCurrent: key === currentSite,
      },
    ];
  });
}

export function SiteFooter({ brand, items, groupLink, taglineOverride }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const companies = portfolioCompanies(brand.siteKey);

  const social = [
    ["LinkedIn", brand.socialProfiles.linkedin],
    ["Instagram", brand.socialProfiles.instagram],
    ["X", brand.socialProfiles.x],
    ["YouTube", brand.socialProfiles.youtube],
  ].filter((entry): entry is [string, string] => typeof entry[1] === "string");

  const hasConnect = brand.email !== null || social.length > 0;

  return (
    <footer className="border-t border-brand-deep-border bg-brand-footer text-brand-paper/70">
      <PageContainer className="pb-8 pt-[clamp(3rem,5vw,4.5rem)]">
        {/*
          Auto-fit rather than a fixed four-track grid: the Pages column is a
          CMS menu and the Connect column depends on brand contact data, so a
          tenant with neither must close up instead of leaving two empty tracks.
        */}
        <div className="grid gap-x-10 gap-y-12 [grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))] sm:grid-cols-2 lg:[grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))]">
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
            {(taglineOverride ?? brand.tagline) !== null ? (
              <p className="mt-5 text-sm leading-relaxed">
                {taglineOverride ?? brand.tagline}
              </p>
            ) : null}
            {brand.address !== null ? (
              <p className="mt-4 text-xs text-brand-paper/50">{brand.address}</p>
            ) : null}
          </div>

          {items.length > 0 ? (
            <FooterColumn heading="Pages">
              {items.map((item) => (
                <li key={item.databaseId}>
                  <a
                    href={item.href}
                    target={item.target ?? undefined}
                    rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                    className={FOOTER_LINK_CLASS}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </FooterColumn>
          ) : null}

          {companies.length > 0 ? (
            <FooterColumn heading="Companies">
              {companies.map((company) => (
                <li key={company.key}>
                  <a
                    href={company.href}
                    // The company you are already on is still listed — the group
                    // has four either way — but it is marked rather than
                    // offered as somewhere else to go.
                    aria-current={company.isCurrent ? "page" : undefined}
                    className={
                      company.isCurrent
                        ? "text-sm text-brand-paper"
                        : FOOTER_LINK_CLASS
                    }
                  >
                    {company.name}
                  </a>
                </li>
              ))}
            </FooterColumn>
          ) : null}

          {hasConnect ? (
            <FooterColumn heading="Connect">
              {brand.email !== null ? (
                <li>
                  <a href={`mailto:${brand.email}`} className={FOOTER_LINK_CLASS}>
                    {brand.email}
                  </a>
                </li>
              ) : null}
              {social.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={FOOTER_LINK_CLASS}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </FooterColumn>
          ) : null}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-brand-paper/10 pt-6 text-xs">
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
      </PageContainer>
    </footer>
  );
}
