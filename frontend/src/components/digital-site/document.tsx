import Link from "next/link";
import type { ReactNode } from "react";

import { DigitalFooter } from "@/components/digital-site/footer";
import { DigitalHeader } from "@/components/digital-site/header";
import { getDigitalSiteContent } from "@/content/digital-site";
import { CHROME } from "@/lib/i18n/locale";
import { getTextDirection } from "@/lib/i18n/direction";
import { DIGITAL_FONT_VARIABLE_CLASSES } from "@/styles/digital-fonts";
import type { LocaleCode, SiteDefinition } from "@/types/site";
import "@/styles/digital-site.css";

interface DigitalDocumentProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
  /** The locale-less path the proxy resolved, for the language switch and nav. */
  readonly path: string;
  readonly draft: boolean;
  readonly children: ReactNode;
}

/**
 * SIRA Digital's own <html>.
 *
 * The other five tenants share one shell whose identity is five CMS colours
 * on the Atlas composition. Digital's identity is a designed system — a
 * palette, two type voices, a routed line — so it renders its own document:
 * no brand query, no navigation query, no homepage query on every route. The
 * proxy, the registry and the locale model are untouched; this is only what
 * happens after the request has been resolved to this tenant.
 */
export function DigitalDocument({
  site,
  locale,
  path,
  draft,
  children,
}: DigitalDocumentProps) {
  const content = getDigitalSiteContent(locale);
  const chrome = CHROME[locale];

  return (
    <html
      lang={locale}
      dir={getTextDirection(locale)}
      data-site="digital"
      data-brand-key="digital"
      className={DIGITAL_FONT_VARIABLE_CLASSES}
    >
      <body>
        <a href="#main-content" className="dg-skip">
          {content.nav.skip}
        </a>

        {draft ? (
          <aside aria-label="Preview Mode" className="dg-preview">
            <div className="dg-container dg-preview__inner">
              <strong>{chrome.previewMode}</strong>
              <Link href="/api/preview/exit/?destination=/">{chrome.exitPreview}</Link>
            </div>
          </aside>
        ) : null}

        <DigitalHeader site={site} locale={locale} path={path} content={content} />

        <main id="main-content">{children}</main>

        <DigitalFooter site={site} locale={locale} path={path} content={content} />
      </body>
    </html>
  );
}
