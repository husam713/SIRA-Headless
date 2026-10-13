import { getDigitalSiteContent } from "@/content/digital-site";
import { digitalHref } from "@/lib/digital-site/hrefs";
import { localeHref } from "@/lib/i18n/locale";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalNotFoundPageProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
}

/** A route that does not exist: say so plainly, and list the ones that do. */
export function DigitalNotFoundPage({ site, locale }: DigitalNotFoundPageProps) {
  const content = getDigitalSiteContent(locale);
  const { notFound } = content;

  return (
    <section className="dg-section dg-tone-paper dg-notfound" aria-labelledby="dg-404-heading">
      <div className="dg-container">
        <p className="dg-status dg-status--rejected">{notFound.code}</p>
        <h1 className="dg-title-l" id="dg-404-heading">
          {notFound.title}
        </h1>
        <p className="dg-lede">{notFound.body}</p>
        <nav aria-label={notFound.suggestions}>
          <ul className="dg-notfound__list">
            <li>
              <a className="dg-related__link" href={localeHref(site, locale, "/")}>
                {notFound.home}
              </a>
            </li>
            {content.nav.items.map((item) => (
              <li key={item.href}>
                <a className="dg-related__link" href={digitalHref(site, locale, item.href)}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a className="dg-related__link" href={digitalHref(site, locale, content.nav.start.href)}>
                {content.nav.start.label}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  );
}
