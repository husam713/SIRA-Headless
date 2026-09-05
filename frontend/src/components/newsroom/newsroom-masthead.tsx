import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";

// The masthead states what the archive *is* — how much of it there is, and how
// far back it runs. The reference design opened with a title and a sentence,
// which tells a reader nothing about whether the page is worth their time. A
// publication puts its extent on the front.

interface NewsroomMastheadProps {
  readonly heading: string;
  readonly description: string;
  readonly total: number;
  readonly span: string | null;
  readonly scopeLabel: string | null;
}

export function NewsroomMasthead({
  heading,
  description,
  total,
  span,
  scopeLabel,
}: NewsroomMastheadProps) {
  return (
    <Section tone="deep" labelledBy="newsroom-heading" space="tight">
      <PageContainer className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-8">
          <SectionEyebrow tone="bright">Newsroom</SectionEyebrow>
          <h1
            id="newsroom-heading"
            className="mt-6 text-balance font-display text-[clamp(2.75rem,7vw,5.5rem)] font-normal leading-[0.98]"
          >
            {heading}
          </h1>
          <p className="mt-7 max-w-[46ch] text-[clamp(1.0625rem,1.6vw,1.25rem)] leading-relaxed text-brand-paper/70">
            {description}
          </p>
        </div>

        {/*
          The extent line. Rendered as a description list so the numbers keep
          their labels for a screen reader instead of becoming loose digits.
        */}
        <dl className="grid content-end gap-6 border-t border-brand-paper/15 pt-8 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-paper/50">
              In this index
            </dt>
            <dd className="mt-2 font-display text-4xl font-normal tabular-nums">
              {total}
            </dd>
          </div>
          {span !== null ? (
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-paper/50">
                Covering
              </dt>
              <dd className="mt-2 font-display text-4xl font-normal tabular-nums">
                {span}
              </dd>
            </div>
          ) : null}
          {scopeLabel !== null ? (
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-paper/50">
                Desk
              </dt>
              <dd className="mt-2 text-lg leading-snug">{scopeLabel}</dd>
            </div>
          ) : null}
        </dl>
      </PageContainer>
    </Section>
  );
}
