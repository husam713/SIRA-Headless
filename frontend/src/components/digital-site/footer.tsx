import { DigitalClock } from "@/components/digital-site/clock";
import { DigitalLanguageSwitch, DigitalWordmark } from "@/components/digital-site/header";
import type { DigitalSiteContent } from "@/content/digital-site";
import { digitalHref } from "@/lib/digital-site/hrefs";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { localeHref } from "@/lib/i18n/locale";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalFooterProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
  readonly path: string;
  readonly content: DigitalSiteContent;
}

/** The other companies' sites, in the reader's language, from the registry. */
export function companyHref(key: DigitalSiteContent["group"]["companies"][number]["key"], locale: LocaleCode): string | null {
  const company = getSiteDefinition(key);
  if (company === null) return null;
  return `https://${company.canonicalHostname}${localeHref(company, locale, "/")}`;
}

export function DigitalFooter({ site, locale, path, content }: DigitalFooterProps) {
  const homeHref = localeHref(site, locale, "/");
  const year = new Date().getFullYear();

  return (
    <footer className="dg-footer dg-tone-ink">
      <div className="dg-container">
        <div className="dg-footer__grid">
          <div className="dg-footer__brand">
            <DigitalWordmark href={homeHref} content={content} />
            <p className="dg-footer__tagline">{content.brand.tagline}</p>
          </div>

          <nav aria-label={content.footer.siteHeading}>
            <h2 className="dg-mono dg-footer__heading">{content.footer.siteHeading}</h2>
            <ul className="dg-footer__list">
              <li>
                <a className="dg-footer__link" href={homeHref}>
                  {content.nav.home}
                </a>
              </li>
              {content.nav.items.map((item) => (
                <li key={item.href}>
                  <a className="dg-footer__link" href={digitalHref(site, locale, item.href)}>
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a className="dg-footer__link" href={digitalHref(site, locale, content.nav.start.href)}>
                  {content.nav.start.label}
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label={content.footer.groupHeading}>
            <h2 className="dg-mono dg-footer__heading">{content.footer.groupHeading}</h2>
            <ul className="dg-footer__list">
              {content.group.companies.map((company) => {
                const href = companyHref(company.key, locale);
                if (href === null) return null;
                return (
                  <li key={company.key}>
                    <a className="dg-footer__link" href={href}>
                      {company.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <nav aria-label={content.footer.legalHeading}>
            <h2 className="dg-mono dg-footer__heading">{content.footer.legalHeading}</h2>
            <ul className="dg-footer__list">
              {content.footer.legal.map((item) => (
                <li key={item.href}>
                  <a className="dg-footer__link" href={digitalHref(site, locale, item.href)}>
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <DigitalLanguageSwitch site={site} locale={locale} path={path} content={content} />
              </li>
            </ul>
          </nav>
        </div>

        <div className="dg-footer__bottom dg-small">
          <p style={{ margin: 0 }}>
            <span className="dg-num">© {year}</span> {content.footer.rights}
          </p>
          <DigitalClock label={content.footer.clockLabel} locale={locale} />
        </div>
      </div>
    </footer>
  );
}
