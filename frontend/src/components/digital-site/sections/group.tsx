import type { CSSProperties } from "react";

import { companyHref } from "@/components/digital-site/footer";
import { ArrowGlyph } from "@/components/digital-site/glyphs";
import type { DigitalSiteContent } from "@/content/digital-site";
import { getBrandPreset } from "@/lib/brand/fallbacks";
import type { LocaleCode } from "@/types/site";

interface DigitalGroupProps {
  readonly locale: LocaleCode;
  readonly content: DigitalSiteContent;
}

/**
 * Where this company sits. The five tiles carry the sister companies' own
 * accents from the brand presets — the one place the group's hues appear on
 * this site, and a small honest fact about who this company belongs to.
 */
export function DigitalGroup({ locale, content }: DigitalGroupProps) {
  const { group } = content;

  return (
    <section className="dg-section" aria-labelledby="dg-group-heading">
      <div className="dg-container">
        <div className="dg-section-head dg-reveal">
          <div>
            <p className="dg-eyebrow dg-mono">{group.eyebrow}</p>
            <h2 className="dg-display-l" id="dg-group-heading">
              {group.title}
            </h2>
          </div>
          <p className="dg-lede">{group.body}</p>
        </div>

        <ul className="dg-companies dg-reveal dg-reveal--far">
          {group.companies.map((company) => {
            const href = companyHref(company.key, locale);
            if (href === null) return null;
            const hue = getBrandPreset(company.key).identity.accent;

            return (
              <li
                key={company.key}
                className="dg-company"
                style={{ "--dg-company-hue": hue } as CSSProperties}
              >
                <span className="dg-company__swatch" aria-hidden="true" />
                <ArrowGlyph className="dg-company__arrow" />
                <span className="dg-company__name">
                  <strong>{company.name}</strong>
                  <span>{company.field}</span>
                </span>
                <a
                  className="dg-company__link"
                  href={href}
                  aria-label={`${group.visit} ${company.name}`}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
