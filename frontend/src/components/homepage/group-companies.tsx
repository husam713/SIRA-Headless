import { getBrandPreset } from "@/lib/brand";
import { resolveBusinessUnitAccent } from "@/lib/homepage/business-unit-accent";
import { CtaLink } from "@/components/homepage/cta-link";
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
    <div
      className="flex flex-col overflow-hidden border border-brand-deep-border bg-brand-deep-card"
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
            className="absolute left-5 top-5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ backgroundColor: accentColor, color: "var(--brand-deep)" }}
          >
            {item.status}
          </span>
        ) : null}
        <span
          aria-hidden="true"
          className="absolute bottom-5 left-7 font-display text-sm tracking-[0.18em]"
          style={{ color: accentColor }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-8">
        <h3 className="text-balance font-display text-2xl font-normal leading-tight text-brand-paper">
          {item.title}
        </h3>
        {copy !== null ? (
          <p className="flex-1 text-sm leading-relaxed text-brand-paper/70">
            {copy}
          </p>
        ) : null}
      </div>
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
    <section
      id="companies"
      aria-labelledby="companies-heading"
      className="bg-brand-deep py-20 text-brand-paper sm:py-28 lg:py-36"
    >
      <div className="mx-auto w-full max-w-[82.5rem] px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
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
          </div>

          {section.description !== null || section.link !== null ? (
            <div className="lg:col-span-5 lg:col-start-8">
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
            </div>
          ) : null}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:mt-24 sm:grid-cols-2">
          {section.selection.items.map((item, index) => (
            <CompanyCard
              key={item.databaseId}
              item={item}
              index={index}
              accentColor={resolveBusinessUnitAccent(item.businessUnit, fallbackAccent).color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
