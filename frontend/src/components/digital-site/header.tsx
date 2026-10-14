import type { CSSProperties } from "react";

import { CloseGlyph, MenuGlyph, WordmarkGlyph } from "@/components/digital-site/glyphs";
import type { DigitalSiteContent } from "@/content/digital-site";
import { digitalHref, isCurrentPath } from "@/lib/digital-site/hrefs";
import { localeHref } from "@/lib/i18n/locale";
import type { LocaleCode, SiteDefinition } from "@/types/site";

interface DigitalHeaderProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
  readonly path: string;
  readonly content: DigitalSiteContent;
}

interface WordmarkProps {
  readonly href: string;
  readonly content: DigitalSiteContent;
}

/**
 * The name in the reading language, with the same name in the other script
 * set small beside it. No Digital brand mark exists yet (an owner deliverable
 * recorded in ADR-033); the small nesting-line glyph is the interim mark, made
 * of the same grammar as the group's.
 */
export function DigitalWordmark({ href, content }: WordmarkProps) {
  return (
    <a href={href} className="dg-wordmark" aria-label={content.brand.wordmark}>
      <WordmarkGlyph className="dg-wordmark__mark" />
      <span>{content.brand.wordmark}</span>
      <span className="dg-wordmark__echo" aria-hidden="true">
        {content.brand.echo}
      </span>
    </a>
  );
}

interface LanguageSwitchProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
  readonly path: string;
  readonly content: DigitalSiteContent;
}

/**
 * A plain link to the same path in the other language. ADR-034 puts the
 * language in the URL, so switching is navigation — nothing to store, nothing
 * to remember, and a shareable address either way.
 */
export function DigitalLanguageSwitch({ site, locale, path, content }: LanguageSwitchProps) {
  const alternate = site.supportedLocales.find((code) => code !== locale);
  if (alternate === undefined || !site.localeRoutesApproved) return null;

  return (
    <a
      className="dg-lang"
      href={localeHref(site, alternate, path)}
      lang={alternate}
      hrefLang={alternate}
      dir={alternate === "ar" ? "rtl" : "ltr"}
      title={content.nav.language.hint}
    >
      {content.nav.language.label}
    </a>
  );
}

export function DigitalHeader({ site, locale, path, content }: DigitalHeaderProps) {
  const homeHref = localeHref(site, locale, "/");
  const startHref = digitalHref(site, locale, content.nav.start.href);
  const items = content.nav.items.map((item) => ({
    ...item,
    href: digitalHref(site, locale, item.href),
    current: isCurrentPath(path, item.href),
  }));

  return (
    <header className="dg-header">
      <div className="dg-container dg-header__inner">
        <DigitalWordmark href={homeHref} content={content} />

        <nav className="dg-header__nav" aria-label={content.nav.label}>
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="dg-header__link"
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="dg-header__tools">
          <DigitalLanguageSwitch site={site} locale={locale} path={path} content={content} />
          <a href={startHref} className="dg-btn dg-header__cta">
            {content.nav.start.label}
          </a>
          {/* The browser owns this menu: `popover` gives it open/close,
              Escape, light-dismiss and focus handling without a script. */}
          <button
            type="button"
            className="dg-header__menu"
            popoverTarget="dg-menu"
            popoverTargetAction="show"
            aria-label={content.nav.menu}
          >
            <MenuGlyph className="dg-header__menu-glyph" />
            <span>{content.nav.menu}</span>
          </button>
        </div>
      </div>

      <div id="dg-menu" popover="auto" className="dg-menu" aria-label={content.nav.menu}>
        <div className="dg-container dg-menu__top">
          <DigitalWordmark href={homeHref} content={content} />
          <button
            type="button"
            className="dg-header__menu"
            popoverTarget="dg-menu"
            popoverTargetAction="hide"
            aria-label={content.nav.close}
          >
            <span>{content.nav.close}</span>
            <CloseGlyph className="dg-header__menu-glyph" />
          </button>
        </div>

        <nav className="dg-container" aria-label={content.nav.label}>
          <ul className="dg-menu__list">
            {[{ label: content.nav.home, href: homeHref, current: isCurrentPath(path, "/") }, ...items].map(
              (item, index) => (
                <li key={item.href} className="dg-menu__item" style={{ "--i": index } as CSSProperties}>
                  <a
                    href={item.href}
                    className="dg-menu__link"
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="dg-container dg-menu__foot">
          <a href={startHref} className="dg-btn">
            {content.nav.start.label}
          </a>
          <DigitalLanguageSwitch site={site} locale={locale} path={path} content={content} />
        </div>
      </div>
    </header>
  );
}
