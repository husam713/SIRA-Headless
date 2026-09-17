import type { CSSProperties } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionHead } from "@/components/layout/section-head";
import { getBrandPreset } from "@/lib/brand";
import {
  resolveBusinessUnitAccent,
  resolveBusinessUnitSiteKey,
  type BusinessUnitAccent,
} from "@/lib/homepage/business-unit-accent";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import type {
  HomepageContentItem,
  HomepageContentSection,
} from "@/lib/homepage/types";
import { localeHref } from "@/lib/i18n/locale";
import type { LocaleCode } from "@/types/site";

// Atlas direction (owner-approved 2026-09-16): "the house". The companies are
// not a card grid but a row of tall panels that share one frame; the panel
// under the pointer takes the room, its photograph sharpens and its summary
// unfolds. Each panel is coloured by its own business unit, borrowing that
// branch's approved accent (business-unit-accent.ts) rather than inventing
// colour here. On small screens the panels stack and are always open, which
// is also the touch and keyboard answer — nothing is hidden behind hover.
//
// The whole panel is one link to the company's own site, resolved through the
// registry; a company whose business unit is unknown gets no link rather than
// a link to nowhere.

interface GroupCompaniesProps {
  readonly section: HomepageContentSection | null;
  /** The page's language; each panel links to the same language on its site. */
  readonly locale?: LocaleCode;
}

interface PanelProps {
  readonly item: HomepageContentItem;
  readonly index: number;
  readonly accent: BusinessUnitAccent;
  readonly locale: LocaleCode;
}

function companyHref(item: HomepageContentItem, locale: LocaleCode): string | null {
  const siteKey = resolveBusinessUnitSiteKey(item.businessUnit);
  if (siteKey === null) return null;
  const site = getSiteDefinition(siteKey);
  return site === null ? null : `https://${site.canonicalHostname}${localeHref(site, locale, "/")}`;
}

function isLive(item: HomepageContentItem): boolean {
  return item.status === null || /^\s*active\s*$/iu.test(item.status);
}

function PanelBody({ item, index, accent }: PanelProps) {
  const copy = item.descriptor ?? item.excerpt;

  return (
    <>
      {item.featuredImage !== null ? (
        // WPGraphQL media-origin allowlisting (2C4-B07) is unresolved, so a
        // plain <img>. Empty alt: the panel names the company itself.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="atlas-panel__media"
          src={item.featuredImage.sourceUrl}
          alt=""
          width={item.featuredImage.width ?? undefined}
          height={item.featuredImage.height ?? undefined}
          loading="lazy"
          decoding="async"
        />
      ) : null}

      {item.status !== null ? (
        <span
          className={`atlas-panel__status${isLive(item) ? "" : " atlas-panel__status--launching"}`}
        >
          {item.status}
        </span>
      ) : null}

      <span aria-hidden="true" className="atlas-panel__n">
        {String(index + 1).padStart(2, "0")}
      </span>

      <h3 className="atlas-panel__title">{item.title}</h3>

      <div className="atlas-panel__more">
        {copy !== null ? <p>{copy}</p> : null}
        <span
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: accent.color }}
        >
          {accent.label}
          <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </>
  );
}

function Panel(props: PanelProps) {
  const href = companyHref(props.item, props.locale);
  const style = { "--c": props.accent.color } as CSSProperties;

  if (href === null) {
    return (
      <div className="atlas-panel" style={style}>
        <PanelBody {...props} />
      </div>
    );
  }

  return (
    <a href={href} className="atlas-panel" style={style}>
      <PanelBody {...props} />
    </a>
  );
}

export function GroupCompanies({ section, locale = "en" }: GroupCompaniesProps) {
  if (section === null || section.selection.status !== "ready") return null;

  const groupPreset = getBrandPreset("group");
  const fallbackAccent = Object.freeze({
    label: groupPreset.name,
    color: groupPreset.identity.accent,
  });

  return (
    <Section id="companies" labelledBy="companies-heading">
      <PageContainer>
        <SectionHead
          id="companies-heading"
          eyebrow={section.eyebrow ?? "Our Companies"}
          heading={section.heading}
          lead={section.description}
        />

        <div className="atlas-house reveal">
          {section.selection.items.map((item, index) => (
            <Panel
              key={item.databaseId}
              item={item}
              index={index}
              accent={resolveBusinessUnitAccent(item.businessUnit, fallbackAccent)}
              locale={locale}
            />
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}
