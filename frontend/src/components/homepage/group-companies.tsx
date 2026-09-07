import type { CSSProperties } from "react";

import { getBrandPreset } from "@/lib/brand";
import {
  resolveBusinessUnitAccent,
  resolveBusinessUnitSiteKey,
  type BusinessUnitAccent,
} from "@/lib/homepage/business-unit-accent";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { CardRail } from "@/components/layout/card-rail";
import { CtaLink } from "@/components/homepage/cta-link";
import { GridItem, PageGrid } from "@/components/layout/page-grid";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import type {
  HomepageContentItem,
  HomepageContentSection,
} from "@/lib/homepage/types";

// Design reference (SIRA Group Homepage.dc.html, #companies): a dark card
// grid, not the light alternating image/text rows this used to be — each
// card's top border, status badge, and corner number are colored by the
// company's own business unit (real estate/healthcare/lifestyle/consulting),
// borrowing that branch's already-approved accent (see
// business-unit-accent.ts) rather than inventing new colors.
//
// Step 4 Phase 2 pilot: this section is the first consumer of the shared
// layout primitives. It previously hand-rolled `max-w-[82.5rem] px-6 lg:px-8`
// and its own `lg:grid-cols-12` track, so it aligned to nothing else on the
// page.

// Media band, heading, body and action are four top-level elements rather than
// a media block plus one padded wrapper, because CardRail aligns cards through
// `grid-template-rows: subgrid` and can only align parts it can see. The
// approved design leaves each card's action wherever its own text ends; aligning
// them across the rail is the one place this improves on it.
const CARD_ROWS = 4;

interface GroupCompaniesProps {
  readonly section: HomepageContentSection | null;
}

interface CompanyCardProps {
  readonly item: HomepageContentItem;
  readonly index: number;
  readonly accent: BusinessUnitAccent;
}

/**
 * Where a company card goes, and what its action says.
 *
 * The destination is the company's OWN canonical site from the site registry,
 * resolved through its business unit, rather than a content node this app has
 * no detail route for. A company whose business unit is missing or unknown
 * gets no link rather than a link to nowhere.
 *
 * The label follows the CMS status: a company that is live invites you to view
 * it, one that is not yet trading invites you to read about it. Any status the
 * CMS has not marked as active is treated as the latter.
 */
function companyAction(
  item: HomepageContentItem,
): { readonly href: string; readonly label: string } | null {
  const siteKey = resolveBusinessUnitSiteKey(item.businessUnit);
  if (siteKey === null) return null;

  const site = getSiteDefinition(siteKey);
  if (site === null) return null;

  const isLive = item.status === null || /^\s*active\s*$/iu.test(item.status);

  return {
    href: `https://${site.canonicalHostname}`,
    label: isLive ? "View all" : "Learn more",
  };
}

/** The card's four subgrid rows: media band, title, description, action. */
function CardBody({ item, index, accent }: CompanyCardProps) {
  const copy = item.descriptor ?? item.excerpt;
  const action = companyAction(item);

  return (
    <>
      <div className="company-card__media card-media">
        {item.featuredImage !== null ? (
          // WPGraphQL media-origin allowlisting (2C4-B07) is unresolved, so a plain
          // <img> is used rather than next/image, which would require configuring
          // remote patterns.
          //
          // Empty alt: the band is decorative here. The company is named by the
          // heading directly below it and by the label inside the band, so
          // describing the photograph again would only repeat the card.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.featuredImage.sourceUrl}
            alt=""
            width={item.featuredImage.width ?? undefined}
            height={item.featuredImage.height ?? undefined}
            loading="lazy"
            decoding="async"
          />
        ) : null}

        {item.status !== null ? (
          // Logical insets throughout: `left-5` pinned these to the visual left,
          // so they sat on the wrong corner of the card under Arabic RTL.
          <span
            className="absolute start-5 top-5 z-10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ backgroundColor: accent.color, color: "var(--brand-deep)" }}
          >
            {item.status}
          </span>
        ) : null}

        <span
          aria-hidden="true"
          className="absolute bottom-5 start-7 z-10 font-display text-[0.9375rem] tracking-[0.18em]"
          style={{ color: accent.color }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/*
          10px, not the eyebrow's 11px: this is a card label with a per-company
          context, the same species as the carousel's slide label, and the
          repository keeps those off the section-eyebrow signature on purpose.
        */}
        <span
          aria-hidden="true"
          className="absolute bottom-5 end-7 z-10 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-paper/75"
        >
          {accent.label}
        </span>
      </div>

      <h3 className="text-balance px-9 pt-10 font-display text-[1.875rem] font-medium leading-[1.1] text-brand-paper">
        {item.title}
      </h3>

      {copy === null ? (
        // Placeholder keeps the row count stable; omitting it would shift the
        // action up a subgrid row and break the alignment across the rail.
        <div />
      ) : (
        <p className="px-9 pt-4 text-[0.9375rem] leading-[1.65] text-brand-paper/70">
          {copy}
        </p>
      )}

      {action === null ? (
        <div className="pb-11" />
      ) : (
        <p
          className="flex items-center gap-2.5 px-9 pb-11 pt-6 text-xs font-bold uppercase tracking-[0.1em]"
          style={{ color: accent.color }}
        >
          {action.label}
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover/card:translate-x-1 rtl:group-hover/card:-translate-x-1"
          >
            &rarr;
          </span>
        </p>
      )}
    </>
  );
}

function CompanyCard(props: CompanyCardProps) {
  const action = companyAction(props.item);
  const style = { "--company-accent": props.accent.color } as CSSProperties;

  // No CardRail flex/grid class here: its stylesheet makes each child a
  // subgrid, with a flex-column fallback where subgrid is unsupported.
  //
  // The whole card is one link, which is what the approved design does. It
  // leaves for another SIRA hostname, so the visible "View all" line stays as
  // the affordance rather than the card being a silent target.
  if (action === null) {
    return (
      <div className="company-card card-lift card-hover" style={style}>
        <CardBody {...props} />
      </div>
    );
  }

  return (
    <a
      href={action.href}
      className="company-card card-lift card-hover group/card"
      style={style}
    >
      <CardBody {...props} />
    </a>
  );
}

export function GroupCompanies({ section }: GroupCompaniesProps) {
  if (section === null || section.selection.status !== "ready") return null;

  // The media band is unconditional, as the approved design has it. An earlier
  // rule showed art only when EVERY company had it, so one company without a
  // featured image suppressed the band on all four — and because that branch
  // had no aspect box to clamp to, a portrait photograph then set the height of
  // every card in the rail. A company with no art now shows the same band
  // carrying its badge, number and label.
  const groupPreset = getBrandPreset("group");
  const fallbackAccent = Object.freeze({
    label: groupPreset.name,
    color: groupPreset.identity.accent,
  });

  return (
    <Section id="companies" tone="deep" labelledBy="companies-heading">
      <PageGrid className="gap-y-8 lg:items-end">
        <GridItem span={5}>
          <SectionEyebrow tone="bright">{section.eyebrow ?? "Our Companies"}</SectionEyebrow>
          {section.heading !== null ? (
            <h2
              id="companies-heading"
              className="mt-4 text-balance font-display text-[clamp(2.25rem,5vw,4rem)] font-normal leading-[1.05]"
            >
              {section.heading}
            </h2>
          ) : null}
        </GridItem>

        {section.description !== null || section.link !== null ? (
          // Columns 8-12: the deliberate gap after the heading block is the
          // section's asymmetry, and it now measures against the same master
          // grid every other section uses.
          <GridItem span={5} start={8}>
            {section.description !== null ? (
              <p className="text-base leading-relaxed text-brand-paper/70">
                {section.description}
              </p>
            ) : null}
            {section.link !== null ? (
              <div className="mt-4">
                <CtaLink link={section.link} variant="ghost-dark" />
              </div>
            ) : null}
          </GridItem>
        ) : null}

        <GridItem className="mt-8 sm:mt-16">
          <CardRail max={4} rows={CARD_ROWS} variant="portfolio">
            {section.selection.items.map((item, index) => (
              <CompanyCard
                key={item.databaseId}
                item={item}
                index={index}
                accent={resolveBusinessUnitAccent(item.businessUnit, fallbackAccent)}
              />
            ))}
          </CardRail>
        </GridItem>
      </PageGrid>
    </Section>
  );
}
