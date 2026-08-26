import { CtaLink } from "@/components/homepage/cta-link";
import type {
  HomepageContentItem,
  HomepageContentSection,
} from "@/lib/homepage/types";

interface GroupCompaniesProps {
  readonly section: HomepageContentSection | null;
}

interface CompanyItemProps {
  readonly item: HomepageContentItem;
  readonly index: number;
  readonly reversed: boolean;
}

function CompanyItem({ item, index, reversed }: CompanyItemProps) {
  const copy = item.descriptor ?? item.excerpt;
  const imageClasses = reversed
    ? "sm:col-span-8 sm:col-start-5 sm:order-2"
    : "sm:col-span-8 sm:col-start-1";
  const textClasses = reversed
    ? "sm:col-span-4 sm:col-start-1 sm:order-1"
    : "sm:col-span-4 sm:col-start-9";

  return (
    <article className="grid grid-cols-1 items-end gap-8 sm:grid-cols-12 sm:gap-6 lg:gap-8">
      {/*
        Plain <div>, not a link: item.href is the company content node's own
        uri, but this app has no company detail route yet — only the
        homepage is implemented under (sites)/[siteKey]. Restore as a link
        once a detail route exists.
      */}
      <div
        className={`relative aspect-[16/10] overflow-hidden bg-brand-deep ${imageClasses}`}
      >
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
        {item.status !== null ? (
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 bg-brand-paper-glass px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-ink"
          >
            {item.status}
          </span>
        ) : null}
      </div>

      <div className={`flex flex-col gap-6 sm:pb-6 ${textClasses}`}>
        <div className="flex items-baseline gap-4">
          <span className="font-display text-3xl leading-none text-brand-accent">
            {String(index + 1).padStart(2, "0")}
          </span>
          {item.status !== null ? (
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-ink-faint">
              {item.status}
            </span>
          ) : null}
        </div>
        <h3 className="text-balance font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-normal leading-tight">
          {item.title}
        </h3>
        {copy !== null ? (
          <p className="text-[15px] leading-relaxed text-brand-ink-soft">
            {copy}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function GroupCompanies({ section }: GroupCompaniesProps) {
  if (section === null || section.selection.status !== "ready") return null;

  return (
    <section
      aria-labelledby="companies-heading"
      className="border-b border-brand-border py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto w-full max-w-[82.5rem] px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
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
                <p className="text-base leading-relaxed text-brand-ink-soft">
                  {section.description}
                </p>
              ) : null}
              {section.link !== null ? (
                <div className="mt-4">
                  <CtaLink link={section.link} variant="ghost-light" />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-16 flex flex-col gap-16 sm:mt-24 sm:gap-24 lg:gap-32">
          {section.selection.items.map((item, index) => (
            <CompanyItem
              key={item.databaseId}
              item={item}
              index={index}
              reversed={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
