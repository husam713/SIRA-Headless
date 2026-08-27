import type {
  HomepageContentItem,
  HomepageContentSection,
} from "@/lib/homepage/types";

interface GroupPartnersProps {
  readonly section: HomepageContentSection | null;
}

interface PartnerLogoProps {
  readonly item: HomepageContentItem;
}

function PartnerLogo({ item }: PartnerLogoProps) {
  if (item.featuredImage === null) return null;

  return (
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
      className="h-12 w-auto max-w-40 object-contain grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100 sm:h-14"
    />
  );
}

export function GroupPartners({ section }: GroupPartnersProps) {
  if (section === null || section.selection.status !== "ready") return null;

  const hasHeading = section.heading !== null;

  return (
    <section
      aria-labelledby={hasHeading ? "partners-heading" : undefined}
      aria-label={hasHeading ? undefined : (section.eyebrow ?? "Our Partners")}
      className="border-b border-brand-border py-16 text-center sm:py-20"
    >
      <div className="mx-auto w-full max-w-[82.5rem] px-6 lg:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
          {section.eyebrow ?? "Our Partners"}
        </p>
        {hasHeading ? (
          <h2
            id="partners-heading"
            className="mt-3 font-display text-2xl font-normal sm:text-3xl"
          >
            {section.heading}
          </h2>
        ) : null}
        {section.description !== null ? (
          <p className="mx-auto mt-4 max-w-md text-[15px] text-brand-ink-soft">
            {section.description}
          </p>
        ) : null}

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
          {section.selection.items.map((item) => (
            <PartnerLogo key={item.databaseId} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
