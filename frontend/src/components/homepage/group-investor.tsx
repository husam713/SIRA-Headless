import type { CSSProperties } from "react";

import { InvestorPackDrawer } from "@/components/atlas/investor-pack-drawer";
import { CountUp } from "@/components/homepage/count-up";
import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionHead } from "@/components/layout/section-head";
import { getBrandPreset } from "@/lib/brand";
import { CHROME, type Chrome } from "@/lib/i18n/locale";
import { resolveBusinessUnitAccent } from "@/lib/homepage/business-unit-accent";
import { CtaLink } from "@/components/homepage/cta-link";
import type {
  HomepageContentItem,
  HomepageInvestorSection,
  HomepageMetric,
} from "@/lib/homepage/types";
import type { LocaleCode } from "@/types/site";

// Design reference (SIRA Group Homepage.dc.html, #investors): dark section
// (background: oklch(0.16 0.024 255), matching --brand-deep), unlike About
// right above it, which is light — see the note on group-about.tsx.

interface GroupInvestorProps {
  readonly section: HomepageInvestorSection | null;
  readonly locale?: LocaleCode;
}

interface TractionMetricProps {
  readonly metric: HomepageMetric;
}

function TractionMetric({ metric, index }: TractionMetricProps & { readonly index: number }) {
  // Atlas direction: figures on hairlines, not in cards; the value counts up
  // as the band arrives.
  return (
    <div className="atlas-metric reveal" style={{ "--reveal-offset": `${String(index * 1.5)}%` } as CSSProperties}>
      {metric.value !== null ? (
        <CountUp value={metric.value} className="atlas-metric__value" />
      ) : null}
      {metric.label !== null ? (
        <span className="atlas-metric__label">{metric.label}</span>
      ) : null}
      {metric.supportingText !== null ? (
        <span className="atlas-metric__note">
          <span aria-hidden="true">&#9650; </span>
          {metric.supportingText}
        </span>
      ) : null}
    </div>
  );
}

interface InvestmentCardProps {
  readonly item: HomepageContentItem;
  readonly accentColor: string;
  readonly sectorLabel: string | null;
}

function InvestmentCard({ item, accentColor, sectorLabel }: InvestmentCardProps) {
  // Plain <div>, not a link: item.href is the investment content node's own
  // uri, but this app has no investment detail route yet — only the
  // homepage is implemented under (sites)/[siteKey]. Restore as a link
  // once a detail route exists.
  //
  // The design also shows a colored RAISING/OPERATIONAL/EARLY stage badge
  // per card — that's a genuinely separate content-modeling gap (no field
  // for it exists on SiraInvestment at all yet, only ticketSizeLabel), so
  // it isn't rendered rather than inventing a value with no data behind it.
  return (
    <div className="atlas-opp reveal" style={{ "--c": accentColor } as CSSProperties}>
      {sectorLabel !== null ? (
        <p
          className="text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: accentColor }}
        >
          {sectorLabel}
        </p>
      ) : null}
      <h4 className="font-display text-2xl font-normal leading-tight text-brand-paper">
        {item.title}
      </h4>
      {item.excerpt !== null ? (
        <p className="text-[0.95rem] leading-relaxed text-brand-paper/70">
          {item.excerpt}
        </p>
      ) : null}
      {item.ticketSizeLabel !== null ? (
        <div className="atlas-opp__ticket">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-paper/50">Ticket Size</span>
          <span className="font-display text-xl text-brand-paper">{item.ticketSizeLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The pack request. The submission travels the existing contact pipeline —
 * the trusted Next.js route, the tenant's WordPress, private storage and
 * authenticated delivery — with the investor type and range folded into the
 * message, which is how the Digital contact form already ships enquiries.
 * The sheet itself is `InvestorPackDrawer`.
 *
 * The one-pager stays informational: the approved GraphQL contract exposes
 * document metadata only (the ACF file field is `show_in_graphql: false` in
 * AcfIntegration.php pending an access policy), and `onePager.href` is the
 * document's content-node uri, not a file.
 */
interface InvestorPackPanelProps {
  readonly formHeading: string | null;
  readonly formDescription: string | null;
  readonly onePager: HomepageContentItem | null;
  readonly eyebrow: string;
  readonly chrome: Chrome;
}

function InvestorPackPanel({
  formHeading,
  formDescription,
  onePager,
  eyebrow,
  chrome,
}: InvestorPackPanelProps) {
  return (
    <div className="mt-16 grid gap-8 border border-brand-deep-border bg-brand-deep-card p-8 sm:mt-20 sm:p-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div>
        {formHeading !== null ? (
          <h3 className="font-display text-2xl font-normal text-brand-paper">{formHeading}</h3>
        ) : null}
        {formDescription !== null ? (
          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-paper/70">
            {formDescription}
          </p>
        ) : null}
        {onePager !== null ? (
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.1em] text-brand-paper/50">
            {onePager.title}
          </p>
        ) : null}
      </div>
      <InvestorPackDrawer
        chrome={chrome}
        eyebrow={eyebrow}
        trigger={
          <>
            {chrome.requestPack} <span aria-hidden="true">&rarr;</span>
          </>
        }
        triggerClassName="press inline-flex items-center gap-2 rounded-sm bg-brand-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-on-accent hover:bg-brand-accent-bright"
      />
    </div>
  );
}

export function GroupInvestor({ section, locale = "en" }: GroupInvestorProps) {
  if (section === null) return null;

  const chrome = CHROME[locale];

  const groupPreset = getBrandPreset("group");
  const fallbackAccent = Object.freeze({
    label: groupPreset.name,
    color: groupPreset.identity.accent,
  });

  const hasHeading = section.heading !== null;
  const hasCopy = section.description !== null;
  const hasMetrics = section.metrics.length > 0;
  const hasInvestments =
    section.investments.status === "ready" && section.investments.items.length > 0;
  const onePager =
    section.onePager.status === "ready" ? (section.onePager.items[0] ?? null) : null;
  const hasFormShell =
    section.formHeading !== null || section.formDescription !== null || onePager !== null;

  if (!hasHeading && !hasCopy && !hasMetrics && !hasInvestments && !hasFormShell) {
    return null;
  }

  return (
    <Section
      id="investors"
      labelledBy={hasHeading ? "investor-heading" : undefined}
      label={hasHeading ? undefined : (section.eyebrow ?? "Investor Relations")}
      tone="deep"
    >
      <PageContainer className="atlas-on-deep">
        <SectionHead
          id="investor-heading"
          eyebrow={section.eyebrow ?? "Investor Relations"}
          heading={section.heading}
          lead={hasCopy ? section.description : null}
          tone="bright"
        />
        {hasMetrics ? (
          <div className="atlas-metrics">
            {section.metrics.map((metric, index) => (
              // Fixed, non-reorderable server-rendered selection — index is a safe key.
              <TractionMetric key={index} metric={metric} index={index} />
            ))}
          </div>
        ) : null}

        {hasInvestments ? (
          <div className="atlas-opps">
            {section.investments.items.map((item) => {
              const accent = resolveBusinessUnitAccent(item.businessUnit, fallbackAccent);
              // The raw business-unit name ("Real Estate"), not the resolved
              // preset's full brand name ("SIRA Real Estate") — matches the
              // design's short sector label. Null (not the Group fallback
              // label) when the investment has no related company/business
              // unit, since "SIRA GROUP" isn't a sector.
              const sectorLabel =
                item.businessUnit.status === "ready"
                  ? (item.businessUnit.items[0]?.name ?? null)
                  : null;

              return (
                <InvestmentCard
                  key={item.databaseId}
                  item={item}
                  accentColor={accent.color}
                  sectorLabel={sectorLabel}
                />
              );
            })}
          </div>
        ) : null}

        {section.link !== null ? (
          <p className="mt-10">
            <CtaLink link={section.link} variant="ghost-dark" />
          </p>
        ) : null}

        {hasFormShell ? (
          <InvestorPackPanel
            formHeading={section.formHeading}
            formDescription={section.formDescription}
            onePager={onePager}
            eyebrow={section.eyebrow ?? "Investor Relations"}
            chrome={chrome}
          />
        ) : null}
      </PageContainer>
    </Section>
  );
}
