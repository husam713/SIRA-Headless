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

/** A sister company's site, in the reader's language, from the registry — never a hard-coded hostname. */
export function companyHref(key: DigitalSiteContent["about"]["group"]["companies"][number]["key"], locale: LocaleCode): string | null {
  const company = getSiteDefinition(key);
  if (company === null) return null;
  return `https://${company.canonicalHostname}${localeHref(company, locale, "/")}`;
}

/**
 * The footer is the site's second navigation: every solution, every company
 * page, the group's other companies, the legal pages and the language. The
 * last line says what this is — a prototype whose content awaits approval —
 * so nobody mistakes provisional copy for a published commitment.
 */
export function DigitalFooter({ site, locale, path, content }: DigitalFooterProps) {
  const homeHref = localeHref(site, locale, "/");
  const year = new Date().getFullYear();
  const companyPages = content.nav.items.filter((item) => item.href !== "/services/");

  return (
    <footer className="dg-footer dg-tone-night">
      <div className="dg-container">
        <div className="dg-footer__grid">
          <div className="dg-footer__brand">
            <DigitalWordmark href={homeHref} content={content} />
            <p className="dg-footer__tagline">{content.brand.tagline}</p>
            <a className="dg-btn dg-btn--on-night" href={digitalHref(site, locale, content.nav.start.href)}>
              {content.nav.start.label}
            </a>
          </div>

          <nav aria-labelledby="dg-footer-solutions">
            <h2 className="dg-footer__heading" id="dg-footer-solutions">
              {content.footer.solutionsHeading}
            </h2>
            <ul className="dg-footer__list">
              {content.solutions.map((solution) => (
                <li key={solution.key}>
                  <a className="dg-footer__link" href={digitalHref(site, locale, `/services/#${solution.key}`)}>
                    {solution.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="dg-footer-company">
            <h2 className="dg-footer__heading" id="dg-footer-company">
              {content.footer.companyHeading}
            </h2>
            <ul className="dg-footer__list">
              {companyPages.map((item) => (
                <li key={item.href}>
                  <a className="dg-footer__link" href={digitalHref(site, locale, item.href)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="dg-footer-group">
            <h2 className="dg-footer__heading" id="dg-footer-group">
              {content.footer.groupHeading}
            </h2>
            <ul className="dg-footer__list">
              {content.about.group.companies.map((company) => {
                const href = companyHref(company.key, locale);
                return (
                  <li key={company.key}>
                    {href === null ? (
                      <span className="dg-footer__link">{company.name}</span>
                    ) : (
                      <a className="dg-footer__link" href={href}>
                        {company.name}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <nav aria-labelledby="dg-footer-legal">
            <h2 className="dg-footer__heading" id="dg-footer-legal">
              {content.footer.legalHeading}
            </h2>
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

        <div className="dg-footer__base">
          <p>
            © {year} {content.footer.rights}
          </p>
          <p className="dg-footer__provisional">{content.footer.provisional}</p>
        </div>
      </div>
    </footer>
  );
}
