import { CtaLink } from "@/components/homepage/cta-link";
import type {
  HomepageFocusArea,
  HomepageRichTextSection,
} from "@/lib/homepage/types";

// Design reference (branch .dc.html files, the section right after the
// stats band): two columns on the page's own paper background — eyebrow,
// heading, and description on the left; a numbered (01/02/03) list of focus
// areas on the right, each row separated by a hairline border, numerals in
// the branch's own accent color. `body` (rich text) isn't rendered here yet:
// no branch page in the design reference shows it as separate copy beyond
// `description`, and no WYSIWYG-safe rendering path exists yet for it.

interface BranchOverviewProps {
  readonly overview: HomepageRichTextSection | null;
  readonly focusAreas: readonly HomepageFocusArea[];
}

interface FocusAreaRowProps {
  readonly area: HomepageFocusArea;
  readonly index: number;
}

function FocusAreaRow({ area, index }: FocusAreaRowProps) {
  return (
    <div className="flex flex-col gap-2 border-t border-brand-border py-8 first:pt-0">
      <span className="font-display text-2xl leading-none text-brand-accent">
        {String(index + 1).padStart(2, "0")}
      </span>
      {area.title !== null ? (
        <h3 className="font-display text-xl font-normal leading-snug">
          {area.title}
        </h3>
      ) : null}
      {area.description !== null ? (
        <p className="text-[15px] leading-relaxed text-brand-ink-soft">
          {area.description}
        </p>
      ) : null}
    </div>
  );
}

export function BranchOverview({ overview, focusAreas }: BranchOverviewProps) {
  const hasHeading = overview !== null && overview.heading !== null;
  const hasCopy = overview !== null && overview.description !== null;
  const hasFocusAreas = focusAreas.length > 0;

  if (overview === null && !hasFocusAreas) return null;

  return (
    <section
      id="overview"
      aria-labelledby={hasHeading ? "overview-heading" : undefined}
      aria-label={hasHeading ? undefined : (overview?.eyebrow ?? "Overview")}
      className="py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto grid w-full max-w-[82.5rem] grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent">
            {overview?.eyebrow ?? "Overview"}
          </p>
          {hasHeading ? (
            <h2
              id="overview-heading"
              className="mt-4 text-balance font-display text-[clamp(2.25rem,5vw,3.5rem)] font-normal leading-[1.05]"
            >
              {overview?.heading}
            </h2>
          ) : null}
          {hasCopy ? (
            <p className="mt-6 max-w-[32rem] text-base leading-relaxed text-brand-ink-soft">
              {overview?.description}
            </p>
          ) : null}
          {overview?.link !== null && overview?.link !== undefined ? (
            <div className="mt-8">
              <CtaLink link={overview.link} variant="ghost-light" />
            </div>
          ) : null}
        </div>

        {hasFocusAreas ? (
          <div className="flex flex-col">
            {focusAreas.map((area, index) => (
              // The focus-area list is a fixed, non-reorderable server-rendered
              // selection with no stable identifier of its own — index is safe here.
              <FocusAreaRow key={index} area={area} index={index} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
