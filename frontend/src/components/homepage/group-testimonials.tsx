import type {
  HomepageContentItem,
  HomepageContentSection,
} from "@/lib/homepage/types";

interface GroupTestimonialsProps {
  readonly section: HomepageContentSection | null;
}

interface TestimonialCardProps {
  readonly item: HomepageContentItem;
}

function TestimonialCard({ item }: TestimonialCardProps) {
  const attribution = [item.role, item.organization].filter(
    (value): value is string => value !== null,
  );

  if (item.excerpt === null) return null;

  return (
    <figure className="border-t-[3px] border-brand-accent bg-brand-tint p-9 sm:p-10">
      <p
        aria-hidden="true"
        className="font-display text-5xl leading-[0.6] text-brand-accent"
      >
        &ldquo;
      </p>
      <blockquote className="mt-3 font-display text-[clamp(1.125rem,1.8vw,1.375rem)] italic leading-relaxed">
        {item.excerpt}
      </blockquote>
      <figcaption className="mt-7 flex flex-col gap-1">
        <span className="text-[15px] font-semibold">{item.title}</span>
        {attribution.length > 0 ? (
          <span className="text-sm text-brand-ink-faint">
            {attribution.join(", ")}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function GroupTestimonials({ section }: GroupTestimonialsProps) {
  if (section === null || section.selection.status !== "ready") return null;

  const hasHeading = section.heading !== null;

  return (
    <section
      aria-labelledby={hasHeading ? "testimonials-heading" : undefined}
      aria-label={hasHeading ? undefined : (section.eyebrow ?? "In Their Words")}
      className="border-b border-brand-border py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto w-full max-w-[82.5rem] px-6 lg:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
          {section.eyebrow ?? "In Their Words"}
        </p>
        {hasHeading ? (
          <h2
            id="testimonials-heading"
            className="mt-4 max-w-3xl text-balance font-display text-[clamp(2.25rem,5vw,3.75rem)] font-normal leading-[1.05]"
          >
            {section.heading}
          </h2>
        ) : null}

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {section.selection.items.map((item) => (
            <TestimonialCard key={item.databaseId} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
