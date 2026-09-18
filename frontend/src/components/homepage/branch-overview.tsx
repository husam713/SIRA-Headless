import { CtaLink } from "@/components/homepage/cta-link";
import { GridItem, PageGrid } from "@/components/layout/page-grid";
import { Prose } from "@/components/layout/prose";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
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
//
// Step 4 Phase 2 pilot (branch side). The point of this one is that a branch
// section needs no branch-specific layout code: it uses the same master grid
// and the same tokens as the Group sections, and varies only through the
// brand accent already carried by --brand-accent (ADR-028 s6). There is still
// exactly one BranchHomepage architecture.
//
// Note: focusAreas resolves and carries real content. Live-verified
// 2026-08-31: Consulting, Lifestyle and Real Estate each return 3 focus
// areas; Healthcare returns null only because nobody has authored them. An
// earlier version of this note claimed ACF repeaters do not resolve over
// WPGraphQL and that the empty path was the live path — both false. The
// empty branch below is a real but currently Healthcare-only case.

interface BranchOverviewProps {
  readonly overview: HomepageRichTextSection | null;
  readonly focusAreas: readonly HomepageFocusArea[];
}

interface FocusAreaRowProps {
  readonly area: HomepageFocusArea;
  readonly index: number;
}

function FocusAreaRow({ area, index }: FocusAreaRowProps) {
  // Atlas direction: the focus areas read as the branch's capability ledger —
  // numbered, ruled, arriving one after another — the same grammar as the
  // Group's service rows without the disclosure, since each carries only a
  // line of description.
  return (
    <div
      className="reveal grid grid-cols-[3rem_1fr] gap-x-4 gap-y-1 border-t border-brand-border py-7 first:border-t-0 first:pt-0"
    >
      <span aria-hidden="true" className="font-display text-xl leading-none text-brand-accent">
        {String(index + 1).padStart(2, "0")}
      </span>
      {area.title !== null ? (
        <h3 className="font-display text-[clamp(1.35rem,2vw,1.75rem)] font-normal leading-[1.15]">
          {area.title}
        </h3>
      ) : null}
      {area.description !== null ? (
        <p className="col-start-2 text-[15px] leading-relaxed text-brand-ink-soft">
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

  // With no focus areas there is no second column, so the copy takes a wider
  // span instead of leaving half the grid empty. This is the master grid doing
  // art direction, not a breakpoint collapse.
  const copySpan = hasFocusAreas ? 5 : 8;

  return (
    <Section
      id="overview"
      labelledBy={hasHeading ? "overview-heading" : undefined}
      label={hasHeading ? undefined : (overview?.eyebrow ?? "Overview")}
    >
      <PageGrid className="gap-y-12">
        <GridItem span={copySpan}>
          {/* Eyebrow, display line, lead: one after another. */}
          <div data-stagger>
            <SectionEyebrow className="reveal">{overview?.eyebrow ?? "Overview"}</SectionEyebrow>
            {hasHeading ? (
              <h2 id="overview-heading" className="atlas-display atlas-display--l reveal mt-5">
                {overview?.heading}
              </h2>
            ) : null}
            {hasCopy ? (
              // Reading measure comes from --layout-reading-width rather than a
              // hand-picked max-w-[32rem].
              <Prose className="mt-6">
                <p className="atlas-lead reveal">{overview?.description}</p>
              </Prose>
            ) : null}
            {overview?.link !== null && overview?.link !== undefined ? (
              <div className="mt-8">
                <CtaLink link={overview.link} variant="ghost-light" />
              </div>
            ) : null}
          </div>
        </GridItem>

        {hasFocusAreas ? (
          <GridItem span={5} start={8}>
            <div className="flex flex-col" data-stagger>
              {focusAreas.map((area, index) => (
                // The focus-area list is a fixed, non-reorderable server-rendered
                // selection with no stable identifier of its own — index is safe here.
                <FocusAreaRow key={index} area={area} index={index} />
              ))}
            </div>
          </GridItem>
        ) : null}
      </PageGrid>
    </Section>
  );
}
