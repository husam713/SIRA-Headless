import { CtaLink } from "@/components/homepage/cta-link";
import type {
  HomepageContentItem,
  HomepageInvestorSection,
  HomepageMetric,
} from "@/lib/homepage/types";

interface GroupInvestorProps {
  readonly section: HomepageInvestorSection | null;
}

interface TractionMetricProps {
  readonly metric: HomepageMetric;
}

function TractionMetric({ metric }: TractionMetricProps) {
  return (
    <div className="flex flex-col gap-3 border-s border-brand-border ps-5">
      <p className="font-display text-[clamp(2rem,4vw,3rem)] font-normal leading-none">
        {metric.value}
      </p>
      {metric.supportingText !== null ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-accent">
          {metric.supportingText}
        </p>
      ) : null}
      {metric.label !== null ? (
        <p className="text-[13px] text-brand-ink-faint">{metric.label}</p>
      ) : null}
    </div>
  );
}

interface InvestmentCardProps {
  readonly item: HomepageContentItem;
}

function InvestmentCard({ item }: InvestmentCardProps) {
  return (
    <a
      href={item.href}
      className="flex flex-col gap-4 border-t-2 border-brand-accent pt-6"
    >
      <h4 className="font-display text-2xl font-normal leading-tight">
        {item.title}
      </h4>
      {item.excerpt !== null ? (
        <p className="flex-1 text-sm leading-relaxed text-brand-ink-soft">
          {item.excerpt}
        </p>
      ) : null}
      {item.ticketSizeLabel !== null ? (
        <div className="flex items-center justify-between border-t border-brand-border pt-4 text-xs font-semibold">
          <span className="text-brand-ink-faint">Ticket Size</span>
          <span>{item.ticketSizeLabel}</span>
        </div>
      ) : null}
    </a>
  );
}

/**
 * The request-pack submission itself is intentionally NOT wired up: the
 * forms backend/provider decision (2C4-B08) remains unresolved, so every
 * field and the submit control render as an inert visual shell only, per
 * the Step 4 charter's forms policy. The one-pager download below it is a
 * real, working link — it's a static document fetch, not a form submission.
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
    <div className="mt-16 bg-brand-tint p-8 sm:mt-20 sm:p-12">
      {formHeading !== null ? (
        <h3 className="font-display text-2xl font-normal">{formHeading}</h3>
      ) : null}
      {formDescription !== null ? (
        <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-ink-soft">
          {formDescription}
        </p>
      ) : null}

      <fieldset
        disabled
        className="mt-10 grid grid-cols-1 gap-6 opacity-70 sm:grid-cols-2"
      >
        <legend className="sr-only">Investor pack request (not yet available)</legend>
        <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-ink-faint">
          Full Name
          <input
            type="text"
            className="border-0 border-b border-brand-border bg-transparent py-2 text-sm text-brand-ink"
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-ink-faint">
          Email Address
          <input
            type="email"
            className="border-0 border-b border-brand-border bg-transparent py-2 text-sm text-brand-ink"
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-ink-faint">
          Investor Type
          <select className="border-0 border-b border-brand-border bg-transparent py-2 text-sm text-brand-ink">
            <option>Private / Individual</option>
            <option>Institutional</option>
            <option>Family Office</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-ink-faint">
          Indicative Ticket
          <select className="border-0 border-b border-brand-border bg-transparent py-2 text-sm text-brand-ink">
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
        className="mt-8 w-full cursor-not-allowed bg-brand-ink/40 px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-brand-paper opacity-70 sm:w-auto"
      >
        Request Pack
      </button>
      <p className="mt-3 text-xs text-brand-ink-faint">
        Online investor pack requests aren&apos;t available yet.
      </p>

      {onePager !== null ? (
        <div className="mt-8 border-t border-brand-border pt-8">
          <a
            href={onePager.href}
            className="inline-flex w-fit items-center gap-3 text-xs font-bold uppercase tracking-[0.1em] text-brand-accent underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
          >
            Download {onePager.title}
          </a>
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
      className="border-b border-brand-border py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto w-full max-w-[82.5rem] px-6 lg:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
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
            <p className="mt-6 text-base leading-relaxed text-brand-ink-soft">
              {section.description}
            </p>
          ) : null}
          {section.link !== null ? (
            <div className="mt-6">
              <CtaLink link={section.link} variant="ghost-light" />
            </div>
          ) : null}
        </div>

        {hasMetrics ? (
          <div className="mt-16 grid grid-cols-2 gap-8 border-b border-brand-border pb-16 sm:grid-cols-4">
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
