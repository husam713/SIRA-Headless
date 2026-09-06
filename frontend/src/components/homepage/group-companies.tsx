import { getBrandPreset } from "@/lib/brand";
import {
  resolveBusinessUnitAccent,
  resolveBusinessUnitSiteKey,
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

// Media, heading, body and action are four top-level elements rather than a
// media block plus one padded wrapper, because CardRail aligns cards through
// `grid-template-rows: subgrid` and can only align parts it can see. The
// previous `flex-1` on the body only ever aligned the cards' bottom edges.
const CARD_ROWS = 4;

interface GroupCompaniesProps {
  readonly section: HomepageContentSection | null;
}

interface CompanyCardProps {
  readonly item: HomepageContentItem;
  readonly index: number;
  readonly accentColor: string;
  /** Whether the ROW carries media — see the note in GroupCompanies below. */
  readonly withMedia: boolean;
}

/**
 * Where a company card goes, and what its action says.
 *
 * The destination is the company's OWN canonical site from the site registry,
 * resolved through its business unit, rather than a content node this app has
 * no detail route for. A company whose business unit is missing or unknown
 * gets no action rather than a link to nowhere.
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

function CompanyCard({ item, index, accentColor, withMedia }: CompanyCardProps) {
  const copy = item.descriptor ?? item.excerpt;
  const action = companyAction(item);

  return (
    // The card is not itself a link: its action goes to another SIRA hostname,
    // and a whole-card cross-origin target is a surprise rather than a
    // convenience. The action below is the affordance.
    //
    // No flex/grid class here: CardRail's stylesheet makes each child a
    // subgrid, with a flex-column fallback where subgrid is unsupported.
    <div
      className="overflow-hidden border border-brand-deep-border bg-brand-deep-card"
      style={{ borderTopWidth: "3px", borderTopColor: accentColor }}
    >
      <div
        className={
          withMedia
            ? "relative aspect-[16/9] w-full overflow-hidden bg-brand-deep"
            : "relative w-full overflow-hidden bg-brand-deep px-6 pt-6"
        }
      >
        {/*
          Only in the media composition. In the typographic one there is no
          aspect box to clamp to, so `h-full` resolves against an auto-height
          parent and the image renders at its natural aspect — a portrait
          photograph then set the subgrid row for every card in the rail.
        */}
        {withMedia && item.featuredImage !== null ? (
          // WPGraphQL media-origin allowlisting (2C4-B07) is unresolved, so a plain
          // <img> is used rather than next/image, which would require configuring
          // remote patterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.featuredImage.sourceUrl}
            alt={item.featuredImage.altText ?? item.title}
            width={item.featuredImage.width ?? undefined}
            height={item.featuredImage.height ?? undefined}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : null}
        {withMedia ? (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-deep/70" />
        ) : null}
        {item.status !== null ? (
          <span
            aria-hidden="true"
            // Logical inset: `left-4` pinned this to the visual left, so it sat
            // on the wrong corner of the card under Arabic RTL.
            className={
              withMedia
                ? "absolute start-4 top-4 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
                : "inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
            }
            style={{ backgroundColor: accentColor, color: "var(--brand-deep)" }}
          >
            {item.status}
          </span>
        ) : null}
        <span
          aria-hidden="true"
          className={
            withMedia
              ? "absolute bottom-4 start-6 font-display text-[0.8125rem] tracking-[0.18em]"
              : "mt-5 block font-display text-[0.8125rem] tracking-[0.18em]"
          }
          style={{ color: accentColor }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="text-balance px-6 pt-6 font-display text-xl font-normal leading-[1.15] text-brand-paper">
        {item.title}
      </h3>

      {copy === null ? (
        // Placeholder keeps the row count stable; omitting it would shift every
        // later part of this card up a subgrid row and break the alignment.
        <div />
      ) : (
        <p className="px-6 pt-2.5 text-[0.8125rem] leading-[1.6] text-brand-paper/70">
          {copy}
        </p>
      )}

      {action === null ? (
        <div className="pb-6" />
      ) : (
        <p className="px-6 pb-6 pt-5">
          <a
            href={action.href}
            // A CTA scale, deliberately not the shared eyebrow token: an eyebrow
            // labels a section, this asks the reader to leave for another site.
            className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-opacity hover:opacity-75"
            style={{ color: accentColor }}
          >
            {action.label}
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
            >
              &rarr;
            </span>
            <span className="sr-only"> — {item.title}</span>
          </a>
        </p>
      )}
    </div>
  );
}

export function GroupCompanies({ section }: GroupCompaniesProps) {
  if (section === null || section.selection.status !== "ready") return null;

  // EVERY, not some: a 16:10 block reserved on a card with no art is a tall
  // empty rectangle, so the portfolio row shows media only when all four
  // companies have it and otherwise composes typographically.
  const rowHasMedia = section.selection.items.every(
    (item) => item.featuredImage !== null,
  );

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
                withMedia={rowHasMedia}
                accentColor={resolveBusinessUnitAccent(item.businessUnit, fallbackAccent).color}
              />
            ))}
          </CardRail>
        </GridItem>
      </PageGrid>
    </Section>
  );
}
