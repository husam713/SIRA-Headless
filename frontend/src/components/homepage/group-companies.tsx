import { getBrandPreset } from "@/lib/brand";
import { resolveBusinessUnitAccent } from "@/lib/homepage/business-unit-accent";
import { CardRail } from "@/components/layout/card-rail";
import { CtaLink } from "@/components/homepage/cta-link";
import { GridItem, PageGrid } from "@/components/layout/page-grid";
import { Section } from "@/components/layout/section";
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

// Media, heading, and body are three top-level elements rather than a media
// block plus one padded wrapper, because CardRail aligns cards through
// `grid-template-rows: subgrid` and can only align parts it can see. The
// previous `flex-1` on the body only ever aligned the cards' bottom edges.
const CARD_ROWS = 3;

interface GroupCompaniesProps {
  readonly section: HomepageContentSection | null;
}

interface CompanyCardProps {
  readonly item: HomepageContentItem;
  readonly index: number;
  readonly accentColor: string;
}

function CompanyCard({ item, index, accentColor }: CompanyCardProps) {
  const copy = item.descriptor ?? item.excerpt;

  return (
    // Plain <div>, not a link: item.href is the company content node's own
    // uri, but this app has no company detail route yet — only the
    // homepage is implemented under (sites)/[siteKey]. Restore as a link
    // once a detail route exists.
    //
    // No flex/grid class here: CardRail's stylesheet makes each child a
    // subgrid, with a flex-column fallback where subgrid is unsupported.
    <div
      className="overflow-hidden border border-brand-deep-border bg-brand-deep-card"
      style={{ borderTopWidth: "3px", borderTopColor: accentColor }}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-deep">
        {item.featuredImage !== null ? (
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-deep/70" />
        {item.status !== null ? (
          <span
            aria-hidden="true"
            // Logical inset: `left-5` pinned this to the visual left, so it sat
            // on the wrong corner of the card under Arabic RTL.
            className="absolute start-5 top-5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ backgroundColor: accentColor, color: "var(--brand-deep)" }}
          >
            {item.status}
          </span>
        ) : null}
        <span
          aria-hidden="true"
          className="absolute bottom-5 start-7 font-display text-sm tracking-[0.18em]"
          style={{ color: accentColor }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="text-balance px-8 pt-8 font-display text-2xl font-normal leading-tight text-brand-paper">
        {item.title}
      </h3>

      {copy === null ? (
        // Placeholder keeps the row count stable; omitting it would shift every
        // later part of this card up a subgrid row and break the alignment.
        <div className="pb-8" />
      ) : (
        <p className="px-8 pb-8 pt-3 text-sm leading-relaxed text-brand-paper/70">
          {copy}
        </p>
      )}
    </div>
  );
}

export function GroupCompanies({ section }: GroupCompaniesProps) {
  if (section === null || section.selection.status !== "ready") return null;

  const groupPreset = getBrandPreset("group");
  const fallbackAccent = Object.freeze({
    label: groupPreset.name,
    color: groupPreset.identity.accent,
  });

  return (
    <Section id="companies" tone="deep" labelledBy="companies-heading">
      <PageGrid className="gap-y-8 lg:items-end">
        <GridItem span={5}>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent-bright">
            {section.eyebrow ?? "Our Companies"}
          </p>
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
          <CardRail max={2} rows={CARD_ROWS}>
            {section.selection.items.map((item, index) => (
              <CompanyCard
                key={item.databaseId}
                item={item}
                index={index}
                accentColor={resolveBusinessUnitAccent(item.businessUnit, fallbackAccent).color}
              />
            ))}
          </CardRail>
        </GridItem>
      </PageGrid>
    </Section>
  );
}
