import type { ReactNode } from "react";
import {
  createBrandCssVariables,
  type ResolvedBrand,
} from "@/lib/brand";
import { getTextDirection } from "@/lib/i18n/direction";
import {
  SIRA_FONT_VARIABLE_CLASSES,
} from "@/styles/fonts";
import type { LocaleCode } from "@/types/site";

interface BrandDocumentProps {
  readonly brand: ResolvedBrand;
  /**
   * The language this request resolved to, which is not necessarily the site's
   * default — ADR-034 puts it in the URL. `lang` and `dir` are set from it here
   * because they belong on <html>, and <html> is only rendered in this one
   * place.
   */
  readonly locale: LocaleCode;
  readonly children: ReactNode;
}

export function BrandDocument({
  brand,
  locale,
  children,
}: BrandDocumentProps) {
  const direction = getTextDirection(locale);
  const brandVariables = createBrandCssVariables(brand);

  return (
    <html
      lang={locale}
      dir={direction}
      data-brand-key={brand.key}
      data-brand-source={brand.source}
      className={SIRA_FONT_VARIABLE_CLASSES}
      style={brandVariables}
    >
      <body className="min-h-screen bg-brand-paper font-sans text-brand-ink antialiased">
        {children}
      </body>
    </html>
  );
}
