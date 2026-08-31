import type { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  createBrandCssVariables,
  type ResolvedBrand,
} from "@/lib/brand";
import { getTextDirection } from "@/lib/i18n/direction";
import {
  SIRA_FONT_VARIABLE_CLASSES,
} from "@/styles/fonts";
import type { SiteDefinition } from "@/types/site";

interface BrandDocumentProps {
  readonly site: SiteDefinition;
  readonly brand: ResolvedBrand;
  readonly children: ReactNode;
}

export function BrandDocument({
  site,
  brand,
  children,
}: BrandDocumentProps) {
  const direction = getTextDirection(site.defaultLocale);
  const brandVariables = createBrandCssVariables(brand);

  return (
    <html
      lang={site.defaultLocale}
      dir={direction}
      data-brand-key={brand.key}
      data-brand-source={brand.source}
      className={SIRA_FONT_VARIABLE_CLASSES}
      style={brandVariables}
    >
      <body className="min-h-screen bg-brand-paper font-sans text-brand-ink antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
