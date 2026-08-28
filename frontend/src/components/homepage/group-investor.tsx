import { CtaLink } from "@/components/homepage/cta-link";
import type {
  HomepageContentItem,
  HomepageInvestorSection,
  HomepageMetric,
} from "@/lib/homepage/types";

// Design reference (SIRA Group Homepage.dc.html, #investors): dark section
// (background: oklch(0.16 0.024 255), matching --brand-deep), unlike About
// right above it, which is light — see the note on group-about.tsx.

interface GroupInvestorProps {
  readonly section: HomepageInvestorSection | null;
}

interface TractionMetricProps {
  readonly metric: HomepageMetric;
}

function TractionMetric({ metric }: TractionMetricProps) {
  return (
    <div className="flex flex-col gap-3 bg-brand-deep-card p-8">
      <p className="font-display text-[clamp(2rem,4vw,3rem)] font-normal leading-none text-brand-paper">
        {metric.value}
      </p>
      {metric.supportingText !== null ? (
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-emerald-400">
          <span aria-hidden="true">&#9650;</span>
          {metric.supportingText}
        </p>
      ) : null}
      {metric.label !== null ? (
        <p className="text-[13px] uppercase tracking-[0.03em] text-brand-paper/60">{metric.label}</p>
      ) : null}
    </div>
  );
}

interface InvestmentCardProps {
  readonly item: HomepageContentItem;
}

function InvestmentCard({ item }: InvestmentCardProps) {
  // Plain <div>, not a link: item.href is the investment content node's own
  // uri, but this app has no investment detail route yet — only the
  // homepage is implemented under (sites)/[siteKey]. Restore as a link
  // once a detail route exists.
  //
  // The design colors each opportunity card's top border/sector label by
  // its related company's business unit. That relationship isn't in the
  // GraphQL contract for investments yet (only for companies/hero slides/
  // ticker items so far), so this uses the single approved group accent
  // uniformly rather than fabricate a per-business-unit color with no data
  // behind it — a real follow-up, not a design choice.
  return (
    <div className="flex flex-col gap-4 border border-brand-deep-border border-t-[3px] border-t-brand-accent bg-brand-deep-card p-8">
      <h4 className="font-display text-2xl font-normal leading-tight text-brand-paper">
        {item.title}
      </h4>
      {item.excerpt !== null ? (
        <p className="flex-1 text-sm leading-relaxed text-brand-paper/70">
          {item.excerpt}
        </p>
      ) : null}
      {item.ticketSizeLabel !== null ? (
        <div className="flex items-center justify-between border-t border-brand-deep-border pt-4 text-xs font-semibold">
          <span className="text-brand-paper/50">Ticket Size</span>
          <span className="text-brand-paper">{item.ticketSizeLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The request-pack submission itself is intentionally NOT wired up: the
 * forms backend/provider decision (2C4-B08) remains unresolved, so every
 * field and the submit control render as an inert visual shell only, per
 * the Step 4 charter's forms policy.
 *
 * The one-pager is informational only, not a working download: the
 * approved GraphQL contract exposes document metadata only — the backend's
 * ACF file field is deliberately excluded from GraphQL
 * (`show_in_graphql: false` in AcfIntegration.php) pending a document
 * access/gating policy decision, and `onePager.href` is the document's own
 * content-node uri, not a file URL, with no detail route implemented
 * either. Advertising this as a working "Download" link would promise
 * something that cannot exist yet on two independent counts.
 */
interface InvestorPackShellProps {
  readonly formHeading: string | null;
  readonly formDescription: string | null;
  readonly onePager: HomepageContentItem | null;
}

function InvestorPackShell({
  formHeading,
  formDescription,
  onePager,
}: InvestorPackShellProps) {
  return (
    <div className="mt-16 border border-brand-deep-border bg-brand-deep-card p-8 sm:mt-20 sm:p-12">
      {formHeading !== null ? (
        <h3 className="font-display text-2xl font-normal text-brand-paper">{formHeading}</h3>
      ) : null}
      {formDescription !== null ? (
        <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-paper/70">
          {formDescription}
        </p>
      ) : null}

      <fieldset
        disabled
        className="mt-10 grid grid-cols-1 gap-6 opacity-70 sm:grid-cols-2"
      >
        <legend className="sr-only">Investor pack request (not yet available)</legend>
        <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-paper/50">
          Full Name
          <input
            type="text"
            className="border-0 border-b border-brand-deep-border bg-transparent py-2 text-sm text-brand-paper"
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-paper/50">
          Email Address
          <input
            type="email"
            className="border-0 border-b border-brand-deep-border bg-transparent py-2 text-sm text-brand-paper"
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-paper/50">
          Investor Type
          <select className="border-0 border-b border-brand-deep-border bg-transparent py-2 text-sm text-brand-paper">
            <option>Private / Individual</option>
            <option>Institutional</option>
            <option>Family Office</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-paper/50">
          Indicative Ticket
          <select className="border-0 border-b border-brand-deep-border bg-transparent py-2 text-sm text-brand-paper">
            <option>$250K – $1M</option>
            <option>$1M – $5M</option>
            <option>$5M – $20M</option>
            <option>$20M+</option>
          </select>
        </label>
      </fieldset>

      <button
        type="button"
        disabled
        aria-disabled="true"
        className="mt-8 w-full cursor-not-allowed bg-brand-paper/20 px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-brand-paper opacity-70 sm:w-auto"
      >
        Request Pack
      </button>
      <p className="mt-3 text-xs text-brand-paper/50">
        Online investor pack requests aren&apos;t available yet.
      </p>

      {onePager !== null ? (
        <div className="mt-8 border-t border-brand-deep-border pt-8">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-paper/50">
            {onePager.title}
          </p>
          <p className="mt-2 text-xs text-brand-paper/50">
            Document downloads aren&apos;t available online yet.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function GroupInvestor({ section }: GroupInvestorProps) {
  if (section === null) return null;

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
    <section
      aria-labelledby={hasHeading ? "investor-heading" : undefined}
      aria-label={hasHeading ? undefined : (section.eyebrow ?? "Investor Relations")}
      className="bg-brand-deep py-20 text-brand-paper sm:py-28 lg:py-36"
    >
      <div className="mx-auto w-full max-w-[82.5rem] px-6 lg:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent-bright">
          {section.eyebrow ?? "Investor Relations"}
        </p>

        <div className="mt-6 max-w-3xl">
          {hasHeading ? (
            <h2
              id="investor-heading"
              className="text-balance font-display text-[clamp(2.25rem,5vw,4rem)] font-normal leading-[1.05]"
            >
              {section.heading}
            </h2>
          ) : null}
          {hasCopy ? (
            <p className="mt-6 text-base leading-relaxed text-brand-paper/70">
              {section.description}
            </p>
          ) : null}
          {section.link !== null ? (
            <div className="mt-6">
              <CtaLink link={section.link} variant="ghost-dark" />
            </div>
          ) : null}
        </div>

        {hasMetrics ? (
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-brand-deep-border bg-brand-deep-border sm:grid-cols-4">
            {section.metrics.map((metric, index) => (
              // Fixed, non-reorderable server-rendered selection — index is a safe key.
              <TractionMetric key={index} metric={metric} />
            ))}
          </div>
        ) : null}

        {hasInvestments ? (
          <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {section.investments.items.map((item) => (
              <InvestmentCard key={item.databaseId} item={item} />
            ))}
          </div>
        ) : null}

        {hasFormShell ? (
          <InvestorPackShell
            formHeading={section.formHeading}
            formDescription={section.formDescription}
            onePager={onePager}
          />
        ) : null}
      </div>
    </section>
  );
}
