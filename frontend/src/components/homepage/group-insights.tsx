import { CtaLink } from "@/components/homepage/cta-link";
import { formatContentDate } from "@/lib/homepage/format-date";
import type {
  HomepageContentItem,
  HomepageEditorialSection,
} from "@/lib/homepage/types";

interface GroupInsightsProps {
  readonly section: HomepageEditorialSection | null;
}

interface InsightCardProps {
  readonly item: HomepageContentItem;
}

function InsightCard({ item }: InsightCardProps) {
  const date = formatContentDate(item.date);

  return (
    // No per-item link: item.href is the article/insight content node's own
    // uri, but this app has no article detail route yet (no NewsroomPage —
    // see STEP-4-EXACT-DESIGN-FIDELITY-IMPLEMENTATION.md §5C — has been
    // built). Restore once that route exists.
    <article className="flex flex-col gap-5">
      <div className="aspect-[16/11] w-full overflow-hidden bg-brand-tint">
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
      </div>
      <div className="flex items-center gap-3">
        {date !== null ? (
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-accent">
            {date}
          </span>
        ) : null}
        <span aria-hidden="true" className="h-px flex-1 bg-brand-border" />
      </div>
      <h3 className="font-display text-xl font-normal leading-snug">
        {item.title}
      </h3>
      {item.excerpt !== null ? (
        <p className="text-[15px] leading-relaxed text-brand-ink-soft">
          {item.excerpt}
        </p>
      ) : null}
    </article>
  );
}

export function GroupInsights({ section }: GroupInsightsProps) {
  if (section === null || section.selection.status !== "ready") return null;

  return (
    <section
      id="insights"
      aria-labelledby="insights-heading"
      className="border-b border-brand-border py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto w-full max-w-[82.5rem] px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
              {section.eyebrow ?? "News & Perspectives"}
            </p>
            {section.heading !== null ? (
              <h2
                id="insights-heading"
                className="mt-4 text-balance font-display text-[clamp(2.25rem,5vw,3.75rem)] font-normal leading-[1.05]"
              >
                {section.heading}
              </h2>
            ) : null}
          </div>
          {section.link !== null ? (
            <CtaLink link={section.link} variant="ghost-light" />
          ) : null}
        </div>

        {section.description !== null ? (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-brand-ink-soft">
            {section.description}
          </p>
        ) : null}

        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {section.selection.items.map((item) => (
            <InsightCard key={item.databaseId} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
