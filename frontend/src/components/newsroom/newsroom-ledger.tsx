import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { editorialKindSingular } from "@/lib/editorial/ledger";
import type { EditorialYear } from "@/lib/editorial/ledger";
import type { EditorialItem } from "@/lib/editorial/types";
import { formatContentDate } from "@/lib/homepage/format-date";

// The archive itself, as a ledger rather than a card wall.
//
// Every entry in an equal-card grid claims the same importance, so a reader
// scanning twenty of them is given no way in; and each card needs an image to
// hold its shape, which this CMS often cannot supply. Rows solve both. They
// read in one pass, they degrade to pure type when there is no image, and the
// year markers give the archive a spine — which is the thing a card grid never
// has.

interface NewsroomLedgerProps {
  readonly years: readonly EditorialYear[];
}

interface LedgerRowProps {
  readonly item: EditorialItem;
}

function LedgerRow({ item }: LedgerRowProps) {
  const date = formatContentDate(item.publishedAt);

  return (
    // No link, for the same reason as the lead: there is no article route yet.
    // The meta column is sized so the longest kind label, "Press Release",
    // sets on one line rather than breaking across two beside a one-line date.
    <article className="grid gap-x-8 gap-y-4 border-t border-brand-border py-8 sm:grid-cols-[9rem_1fr] lg:grid-cols-[9rem_1fr_8rem] lg:items-start">
      <p className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-[0.14em]">
        {date !== null ? (
          <span className="tabular-nums text-brand-ink-faint">{date}</span>
        ) : null}
        <span className="text-brand-accent">{editorialKindSingular(item.kind)}</span>
      </p>

      <div className="max-w-[62ch]">
        <h3 className="text-balance font-display text-[clamp(1.375rem,2.2vw,1.75rem)] font-normal leading-snug">
          {item.title}
        </h3>
        {item.excerpt !== null ? (
          <p className="mt-3 text-[15px] leading-relaxed text-brand-ink-soft">
            {item.excerpt}
          </p>
        ) : null}
      </div>

      {/*
        The thumbnail is the row's optional third column, not its structure:
        rows without one simply leave the column empty instead of reserving a
        grey placeholder. Hidden below lg, where the width is better spent on
        the title.
      */}
      {item.featuredImage !== null ? (
        <div className="hidden aspect-square w-32 overflow-hidden bg-brand-tint lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.featuredImage.sourceUrl}
            alt={item.featuredImage.altText ?? ""}
            width={item.featuredImage.width ?? undefined}
            height={item.featuredImage.height ?? undefined}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
    </article>
  );
}

export function NewsroomLedger({ years }: NewsroomLedgerProps) {
  return (
    <Section space="tight" label="Newsroom archive">
      <PageContainer>
        {years.map((band) => (
          <section
            key={band.year}
            aria-label={band.year}
            // gap-y-8 below lg, where the year sits above its first row rather
            // than beside it and needs the separation; at lg the spine moves
            // into its own column and the gap stops applying.
            className="grid gap-y-8 border-t-2 border-brand-ink pt-6 lg:grid-cols-[10rem_1fr] lg:gap-x-12 lg:gap-y-2 [&+&]:mt-20"
          >
            {/*
              The spine. Sticky at lg so the year stays beside its entries while
              they scroll, which is what makes a long archive legible without
              repeating the year on every row.
            */}
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-normal leading-none tabular-nums text-brand-ink-faint lg:sticky lg:top-[calc(var(--shell-header-height,4rem)+5rem)] lg:self-start">
              {band.year}
            </h2>

            <div className="[&>article:first-child]:border-t-0 [&>article:first-child]:pt-0">
              {band.items.map((item) => (
                <LedgerRow key={item.databaseId} item={item} />
              ))}
            </div>
          </section>
        ))}
      </PageContainer>
    </Section>
  );
}
