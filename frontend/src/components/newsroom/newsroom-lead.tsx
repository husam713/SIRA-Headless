import { Bleed, PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { editorialKindSingular } from "@/lib/editorial/ledger";
import type { EditorialItem } from "@/lib/editorial/types";
import { formatContentDate } from "@/lib/homepage/format-date";

// The newest item, given the weight a front page gives its lead.
//
// Two treatments rather than one, because roughly half the editorial items in
// this CMS carry no featured image. The reference design assumed every entry
// had one and reserved a 4:3 block regardless, so an imageless lead opened the
// page with a large empty rectangle. Here an imageless lead becomes a
// typographic lead instead: the excerpt is promoted to display size and carries
// the spread on its own.

interface NewsroomLeadProps {
  readonly item: EditorialItem;
}

function LeadMeta({ item }: NewsroomLeadProps) {
  const date = formatContentDate(item.publishedAt);

  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-[0.14em]">
      <span className="text-brand-accent">{editorialKindSingular(item.kind)}</span>
      {date !== null ? (
        <>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-brand-ink-faint" />
          <span className="text-brand-ink-faint">{date}</span>
        </>
      ) : null}
    </p>
  );
}

export function NewsroomLead({ item }: NewsroomLeadProps) {
  // No link: item.href is the WordPress content-node uri and this app has no
  // article detail route yet, so linking would send readers to a 404. Same
  // constraint the homepage editorial sections already carry.
  if (item.featuredImage === null) {
    return (
      <Section space="tight" className="border-b border-brand-border">
        <PageContainer>
          <article>
            <LeadMeta item={item} />
            {/*
              The measure belongs on the heading, not on its wrapper: `ch` is
              computed against the element's own font-size, so a wrapper at body
              size gives a display heading a measure roughly a quarter of what
              it reads as, and the lead collapses into a narrow column.
            */}
            <h2 className="mt-6 max-w-[20ch] text-balance font-display text-[clamp(2rem,5.5vw,4rem)] font-normal leading-[1.04]">
              {item.title}
            </h2>
          </article>
          {item.excerpt !== null ? (
            <p className="mt-8 max-w-[54ch] text-[clamp(1.125rem,2vw,1.5rem)] leading-[1.5] text-brand-ink-soft">
              {item.excerpt}
            </p>
          ) : null}
        </PageContainer>
      </Section>
    );
  }

  return (
    <Section space="tight" className="border-b border-brand-border">
      <PageContainer className="grid items-center gap-y-10 lg:grid-cols-12 lg:gap-x-14">
        {/*
          Asymmetric on purpose: 7/5 rather than the reference's even split, so
          the lead does not read as the first cell of the grid that follows it.
          The image bleeds to the viewport edge at lg, which is what separates
          the lead from every row beneath it.
        */}
        <Bleed bleed="edge" className="lg:col-span-7">
          <div className="aspect-[5/4] w-full overflow-hidden border-t-2 border-brand-accent bg-brand-tint sm:aspect-[16/10]">
            {/*
              WPGraphQL media-origin allowlisting (2C4-B07) is unresolved, so a
              plain <img> is used rather than next/image, which would need
              remote patterns configured.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.featuredImage.sourceUrl}
              alt={item.featuredImage.altText ?? ""}
              width={item.featuredImage.width ?? undefined}
              height={item.featuredImage.height ?? undefined}
              // The lead is above the fold, so it is the one image on the page
              // that should not wait for the lazy loader.
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </Bleed>

        <article className="lg:col-span-5">
          <LeadMeta item={item} />
          <h2 className="mt-6 text-balance font-display text-[clamp(1.875rem,3.5vw,3rem)] font-normal leading-[1.06]">
            {item.title}
          </h2>
          {item.excerpt !== null ? (
            <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-brand-ink-soft">
              {item.excerpt}
            </p>
          ) : null}
        </article>
      </PageContainer>
    </Section>
  );
}
