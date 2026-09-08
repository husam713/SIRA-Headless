/**
 * The SIRA Digital automation impact model.
 *
 * A deliberately small, transparent, deterministic model. Every constant below
 * is visible, every step is one multiplication or subtraction, and the whole
 * thing is a pure function so it can be tested, reasoned about and shown to a
 * client who asks how the number was produced.
 *
 * It is NOT derived from any third party's model, and it does not try to be
 * clever. A calculator that produces an impressive number nobody can explain is
 * worse than no calculator: it costs credibility in the first meeting where
 * somebody asks.
 *
 * THREE HONESTY RULES ARE BUILT IN RATHER THAN PRINTED UNDERNEATH:
 *
 *   1. Freed hours are not saved money. Only a fraction of released time turns
 *      into realised cost avoidance; the rest is absorbed. `REALISATION` is
 *      that fraction and it is deliberately well under half.
 *   2. Automation never reaches every task. Coverage is capped per workflow and
 *      per industry, so no combination of inputs can produce 100%.
 *   3. Ranges, not points. Outputs carry a low and a high, because a single
 *      figure implies a precision this model does not have.
 *
 * Currency is SAR throughout. Nothing here is a quotation.
 */

export const CURRENCY = "SAR";

/** How much released time a business actually converts into avoided cost. */
export const REALISATION = 0.35;

/** Working hours in a year: 5 days, 48 weeks, 8 hours. */
export const WORKING_HOURS_PER_YEAR = 5 * 48 * 8;

/**
 * Indicative fully-loaded hourly cost of an administrative employee, in SAR.
 *
 * A band rather than a figure, because it varies by sector, seniority and city
 * far more than any single number would admit.
 */
export const HOURLY_COST_SAR = Object.freeze({ low: 55, high: 95 });

/** Ceiling on how much of a manual workload automation can remove at all. */
export const COVERAGE_CEILING = 0.72;

export type IndustryKey =
  | "healthcare"
  | "real-estate"
  | "hospitality"
  | "retail"
  | "logistics"
  | "construction"
  | "professional-services"
  | "education"
  | "manufacturing"
  | "other";

export type SizeKey = "small" | "growing" | "established" | "enterprise";

export type WorkflowKey =
  | "approvals"
  | "documents"
  | "customer-enquiries"
  | "reporting"
  | "field-capture";

export interface CalculatorInput {
  readonly industry: IndustryKey;
  readonly size: SizeKey;
  /** People whose work the automation would touch. */
  readonly people: number;
  /** Repetitive hours per person per week. */
  readonly hoursPerWeek: number;
  readonly workflows: readonly WorkflowKey[];
}

export interface Range {
  readonly low: number;
  readonly high: number;
}

export interface CalculatorResult {
  readonly currency: string;
  /** Manual hours per year across the affected people, before any change. */
  readonly manualHoursPerYear: number;
  /** Share of that workload the selected workflows can realistically cover. */
  readonly coverage: number;
  /** Hours per year the automation could release. */
  readonly hoursReleasedPerYear: number;
  /** Realised cost avoidance per year, as a range. */
  readonly annualSavingSar: Range;
  /** Indicative build cost for the selected scope, as a range. */
  readonly indicativeBuildSar: Range;
  /** Months to recover the indicative build cost, as a range. */
  readonly paybackMonths: Range;
  /** The workflows that contributed, with their individual coverage. */
  readonly contributions: readonly { readonly workflow: WorkflowKey; readonly coverage: number }[];
  /** Everything the model assumed, for display. */
  readonly assumptions: readonly string[];
}

/**
 * How much of a manual workload each workflow can typically remove.
 *
 * These are engineering judgements about how mechanical each kind of work is,
 * not measured outcomes from any client.
 */
const WORKFLOW_COVERAGE: Readonly<Record<WorkflowKey, number>> = Object.freeze({
  documents: 0.3,
  approvals: 0.24,
  "customer-enquiries": 0.2,
  reporting: 0.18,
  "field-capture": 0.16,
});

export const WORKFLOW_LABEL: Readonly<Record<WorkflowKey, string>> = Object.freeze({
  approvals: "Approvals and handovers",
  documents: "Document handling",
  "customer-enquiries": "Customer enquiries",
  reporting: "Reporting and reconciliation",
  "field-capture": "Field and site capture",
});

/**
 * A modifier for how much of a sector's work is mechanical.
 *
 * Document-heavy and process-heavy sectors sit above 1.0; sectors whose value
 * is mostly in non-repeating judgement sit below it.
 */
const INDUSTRY_FACTOR: Readonly<Record<IndustryKey, number>> = Object.freeze({
  healthcare: 1.1,
  "real-estate": 1.05,
  logistics: 1.1,
  retail: 1.0,
  construction: 1.05,
  hospitality: 0.95,
  "professional-services": 0.95,
  education: 0.95,
  manufacturing: 1.0,
  other: 1.0,
});

export const INDUSTRY_LABEL: Readonly<Record<IndustryKey, string>> = Object.freeze({
  healthcare: "Healthcare",
  "real-estate": "Real estate",
  hospitality: "Hospitality",
  retail: "Retail and distribution",
  logistics: "Logistics",
  construction: "Construction",
  "professional-services": "Professional services",
  education: "Education",
  manufacturing: "Manufacturing",
  other: "Something else",
});

/**
 * Larger organisations have more process to standardise, and more coordination
 * cost to remove — but also more systems to integrate, which is why the spread
 * is narrow rather than dramatic.
 */
const SIZE_FACTOR: Readonly<Record<SizeKey, number>> = Object.freeze({
  small: 0.9,
  growing: 1.0,
  established: 1.05,
  enterprise: 1.1,
});

export const SIZE_LABEL: Readonly<Record<SizeKey, string>> = Object.freeze({
  small: "Under 20 people",
  growing: "20 to 100 people",
  established: "100 to 500 people",
  enterprise: "Over 500 people",
});

/** Indicative build cost per workflow, in SAR. A band, not a quotation. */
const BUILD_COST_PER_WORKFLOW_SAR = Object.freeze({ low: 45_000, high: 110_000 });

export const INPUT_BOUNDS = Object.freeze({
  people: { min: 1, max: 500, step: 1 },
  hoursPerWeek: { min: 1, max: 30, step: 1 },
});

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function round(value: number, places = 0): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/**
 * Runs the model.
 *
 * Pure: the same input always produces the same output, and nothing here reads
 * a clock, a locale or the network. That is what makes it testable and what
 * makes the numbers on the page reproducible.
 */
export function calculate(input: CalculatorInput): CalculatorResult {
  const people = clamp(
    Math.round(input.people),
    INPUT_BOUNDS.people.min,
    INPUT_BOUNDS.people.max,
  );
  const hoursPerWeek = clamp(
    Math.round(input.hoursPerWeek),
    INPUT_BOUNDS.hoursPerWeek.min,
    INPUT_BOUNDS.hoursPerWeek.max,
  );

  // Deduplicated so selecting the same workflow twice cannot inflate coverage.
  const workflows = [...new Set(input.workflows)].filter((workflow) =>
    Object.hasOwn(WORKFLOW_COVERAGE, workflow),
  );

  const manualHoursPerYear = people * hoursPerWeek * 48;

  const rawCoverage = workflows.reduce(
    (total, workflow) => total + WORKFLOW_COVERAGE[workflow],
    0,
  );
  const adjusted =
    rawCoverage * INDUSTRY_FACTOR[input.industry] * SIZE_FACTOR[input.size];
  const coverage = Math.min(adjusted, COVERAGE_CEILING);

  const hoursReleasedPerYear = manualHoursPerYear * coverage;
  const realisedHours = hoursReleasedPerYear * REALISATION;

  const annualSavingSar = Object.freeze({
    low: round(realisedHours * HOURLY_COST_SAR.low, -3),
    high: round(realisedHours * HOURLY_COST_SAR.high, -3),
  });

  const indicativeBuildSar = Object.freeze({
    low: workflows.length * BUILD_COST_PER_WORKFLOW_SAR.low,
    high: workflows.length * BUILD_COST_PER_WORKFLOW_SAR.high,
  });

  // Payback pairs the pessimistic saving with the expensive build and the
  // optimistic saving with the cheap one, so the range is a real range rather
  // than two variations on the same assumption.
  const paybackMonths = Object.freeze({
    low:
      annualSavingSar.high > 0
        ? round((indicativeBuildSar.low / annualSavingSar.high) * 12, 1)
        : 0,
    high:
      annualSavingSar.low > 0
        ? round((indicativeBuildSar.high / annualSavingSar.low) * 12, 1)
        : 0,
  });

  return Object.freeze({
    currency: CURRENCY,
    manualHoursPerYear: round(manualHoursPerYear),
    coverage: round(coverage, 3),
    hoursReleasedPerYear: round(hoursReleasedPerYear),
    annualSavingSar,
    indicativeBuildSar,
    paybackMonths,
    contributions: Object.freeze(
      workflows.map((workflow) =>
        Object.freeze({ workflow, coverage: WORKFLOW_COVERAGE[workflow] }),
      ),
    ),
    assumptions: Object.freeze([
      `${String(people)} people × ${String(hoursPerWeek)} repetitive hours per week × 48 working weeks.`,
      `Selected workflows cover ${String(round(coverage * 100, 1))}% of that manual workload, after an industry and size adjustment, capped at ${String(COVERAGE_CEILING * 100)}%.`,
      `Only ${String(REALISATION * 100)}% of released hours are counted as realised cost avoidance — the rest is absorbed rather than saved.`,
      `Fully-loaded cost of ${String(HOURLY_COST_SAR.low)}–${String(HOURLY_COST_SAR.high)} ${CURRENCY} per hour.`,
      `Indicative build of ${String(BUILD_COST_PER_WORKFLOW_SAR.low.toLocaleString("en"))}–${String(BUILD_COST_PER_WORKFLOW_SAR.high.toLocaleString("en"))} ${CURRENCY} per workflow.`,
    ]),
  });
}

/** SAR, grouped, no decimals. Money in a range never needs halalas. */
export function formatSar(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}
