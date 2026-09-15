/**
 * The SIRA Digital automation impact model.
 *
 * This model is not invented. Every constant below was MEASURED off the
 * reference implementation the owner asked this calculator to reproduce, by
 * driving the live page in a browser and reading the rendered output. The two
 * capture harnesses, the raw samples and the derivation live in
 * `artifacts/reference-forensics/sirahdigital-in/`; `CALCULATOR-MODEL.md` there
 * explains how each constant was recovered and how tightly it is pinned.
 *
 * The claim this file makes is narrow and testable: across all 115 captured
 * input combinations it reproduces all 1,380 observed display fields exactly.
 * `tests/unit/calculator/model.test.ts` asserts that against the HELD-OUT
 * samples, which were never used to fit anything.
 *
 * Currency is USD and the outputs are single figures rather than ranges,
 * because that is what the reference shows. The honesty devices are still real
 * arithmetic rather than small print underneath:
 *
 *   1. `REALISATION` — only 35% of freed hours are counted as avoided cost. The
 *      line "Realised cost avoidance, not the notional value of every freed
 *      hour" is describing this constant, not apologising for its absence.
 *   2. `COVERAGE_CEILING` — the coverage meter cannot reach 100%.
 *   3. ROI and payback are charged against a real implementation cost, so ROI
 *      goes NEGATIVE when the inputs do not justify the work.
 *
 * Nothing here is a quotation.
 */

export const CURRENCY = "USD";

/** Share of released time counted as realised cost avoidance. Measured: exact. */
export const REALISATION = 0.35;

/** Working weeks a year. Measured: exact, error 0 across a 115-row sweep. */
export const WORKING_WEEKS_PER_YEAR = 46;

/**
 * Transaction volume, expressed as hours per person per week.
 *
 * This is the `+ 2` that makes `40 people x 14 hours x 52 weeks` fail to
 * reproduce the published 29,440 manual hours and `40 x 46 x (14 + 2)` succeed.
 * It is the leads, calls and documents the note beside the inputs describes.
 */
export const TRANSACTION_HOURS_PER_WEEK = 2;

/** A full-time week: the denominator for the productivity figure. */
export const FULL_TIME_HOURS_PER_WEEK = 40;

/** The coverage meter is capped here and can never read 100%. */
export const COVERAGE_CEILING = 0.99;

/**
 * The share of a manual workload that is automatable before any adjustment.
 *
 * `base = BASELINE_COVERAGE x INDUSTRY_COVERAGE x SIZE_FACTOR`. The three-way
 * split is not a guess: measured coverage across all 48 industry x size cells
 * factors into exactly this product, every industry multiplier landing on two
 * decimal places and every size multiplier on two, to within 2e-6.
 */
export const BASELINE_COVERAGE = 0.62;

/** Lead response improvement. Constant at every input on the reference. */
export const LEAD_RESPONSE_MULTIPLE = 720;

/**
 * Monthly transaction volumes per person, used only for the note beside the
 * inputs ("about 400 leads, 880 calls and 2,480 documents a month").
 *
 * STRONGLY INFERRED rather than confirmed. The reference states those three
 * figures at the default team of 40, and 400/880/2480 divide by 40 to give
 * exactly 10/22/62; its wording says the volumes are estimated from team size,
 * so they are computed here. Only that one observation point exists.
 */
export const MONTHLY_VOLUME_PER_PERSON = Object.freeze({
  leads: 10,
  calls: 22,
  documents: 62,
});

export type IndustryKey =
  | "healthcare"
  | "real-estate"
  | "manufacturing"
  | "retail"
  | "education"
  | "finance"
  | "hospitality"
  | "construction"
  | "professional-services"
  | "automotive"
  | "logistics"
  | "technology";

export type SizeKey = "startup" | "small" | "growing" | "enterprise";

/** Presentation order, matching the reference's option order exactly. */
export const INDUSTRY_KEYS: readonly IndustryKey[] = Object.freeze([
  "healthcare",
  "real-estate",
  "manufacturing",
  "retail",
  "education",
  "finance",
  "hospitality",
  "construction",
  "professional-services",
  "automotive",
  "logistics",
  "technology",
]);

export const SIZE_KEYS: readonly SizeKey[] = Object.freeze([
  "startup",
  "small",
  "growing",
  "enterprise",
]);

/**
 * How mechanical each sector's work is, relative to the baseline.
 *
 * Recovered exactly: dividing measured coverage by `BASELINE_COVERAGE` and the
 * size factor lands every one of these on two decimal places across 48 cells.
 */
export const INDUSTRY_COVERAGE: Readonly<Record<IndustryKey, number>> =
  Object.freeze({
    healthcare: 1.12,
    "real-estate": 1.08,
    manufacturing: 1.05,
    retail: 1.1,
    education: 1.02,
    finance: 1.15,
    hospitality: 1.06,
    construction: 0.94,
    "professional-services": 1.13,
    automotive: 1.0,
    logistics: 1.09,
    technology: 1.11,
  });

/**
 * Annual revenue opportunity per person, before the size factor, in USD.
 *
 * MEASURED, and the only table here that is not exact. The reference prints
 * revenue to three significant figures, so each entry is pinned to an interval
 * rather than a point; the value chosen is inside the interval that satisfies
 * every observed revenue, twelve-month, ROI and payback string. The widest
 * interval is technology at 0.11%, the tightest logistics at 0.005%. The
 * author's own source values are UNKNOWN — no rounder set reproduces the
 * observations, so these are not quietly presented as if they were exact.
 */
export const INDUSTRY_REVENUE_PER_PERSON: Readonly<Record<IndustryKey, number>> =
  Object.freeze({
    healthcare: 3080,
    "real-estate": 4320,
    manufacturing: 9450,
    retail: 730.5,
    education: 3460,
    finance: 6898,
    hospitality: 1272,
    construction: 8560,
    "professional-services": 7284,
    automotive: 3946,
    logistics: 4496,
    technology: 7135,
  });

/**
 * One multiplier, serving both coverage and revenue.
 *
 * Larger organisations have more standardised process to remove and more
 * revenue riding on each person; the spread is deliberately narrow.
 */
export const SIZE_FACTOR: Readonly<Record<SizeKey, number>> = Object.freeze({
  startup: 0.9,
  small: 0.96,
  growing: 1.04,
  enterprise: 1.1,
});

/**
 * Implementation cost: a fixed engagement setup plus a per-seat rollout.
 *
 * `cost = IMPLEMENTATION_SETUP[size] + IMPLEMENTATION_PER_SEAT x team`.
 *
 * Recovered by inverting the displayed ROI and payback — two independent views
 * of one implied cost — across all 115 samples. The setup figures are pinned to
 * the exact hundred; the per-seat rate is pinned to 1145.95-1146.00. Cost
 * depends on team and size ONLY: it is independent of industry, hours, hourly
 * cost and current automation, which is what makes ROI fall as the remaining
 * manual workload shrinks.
 */
export const IMPLEMENTATION_SETUP: Readonly<Record<SizeKey, number>> =
  Object.freeze({
    startup: 7_500,
    small: 15_000,
    growing: 30_000,
    enterprise: 60_000,
  });

export const IMPLEMENTATION_PER_SEAT = 1_146;

/**
 * Control bounds, matching the reference's sliders exactly.
 *
 * These are clamps, not decoration. The reference clamps `hourlyCost` at 150,
 * which is visible in its own output: driving that control to 200 still
 * produced the figure for 150.
 */
export const INPUT_BOUNDS = Object.freeze({
  team: { min: 5, max: 1000, step: 5 },
  hoursPerWeek: { min: 1, max: 60, step: 1 },
  hourlyCost: { min: 10, max: 150, step: 1 },
  currentAutomation: { min: 0, max: 100, step: 1 },
});

export interface CalculatorInput {
  readonly industry: IndustryKey;
  readonly size: SizeKey;
  /** People whose work the automation would touch. */
  readonly team: number;
  /** Repetitive hours per person per week. */
  readonly hoursPerWeek: number;
  /** Fully-loaded employee cost per hour, in USD. */
  readonly hourlyCost: number;
  /** How much of the work already runs without a person, 0-100. */
  readonly currentAutomation: number;
}

/** The reference's published defaults. The figures on its page come from these. */
export const INPUT_DEFAULTS: CalculatorInput = Object.freeze({
  industry: "professional-services",
  size: "growing",
  team: 40,
  hoursPerWeek: 14,
  hourlyCost: 32,
  currentAutomation: 15,
});

export interface MonthlyVolumes {
  readonly leads: number;
  readonly calls: number;
  readonly documents: number;
}

export interface CalculatorResult {
  readonly currency: string;
  /** The inputs actually used, after clamping to the control bounds. */
  readonly input: CalculatorInput;
  /** Manual hours a year across the affected people, before any change. */
  readonly manualHoursPerYear: number;
  /** Manual hours a year left afterwards. */
  readonly manualHoursAfter: number;
  readonly hoursSavedPerYear: number;
  /** Realised cost avoidance a year. NOT the value of every freed hour. */
  readonly annualSaving: number;
  /** Additional revenue the released capacity could carry. */
  readonly revenueOpportunity: number;
  /** Saving plus revenue over twelve months. */
  readonly twelveMonthTotal: number;
  readonly implementationCost: number;
  /** First-year return, as a fraction. Negative when the work is not justified. */
  readonly firstYearRoi: number;
  /** Months to recover the implementation cost. `0` when there is no benefit. */
  readonly paybackMonths: number;
  /** Released capacity as a share of the team's full-time hours. */
  readonly productivityGain: number;
  /** The share the coverage meter reads. Capped at `COVERAGE_CEILING`. */
  readonly automationCoverage: number;
  /** The share of the manual workload that stops being manual. */
  readonly workloadRemoved: number;
  readonly leadResponseMultiple: number;
  /** The transaction volumes behind `TRANSACTION_HOURS_PER_WEEK`. */
  readonly monthlyVolumes: MonthlyVolumes;
  /** Cumulative benefit at the end of each of the next twelve months. */
  readonly projection: readonly number[];
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Runs the model.
 *
 * Pure: no clock, no locale, no network. Every line is one multiplication or
 * subtraction, so a client who asks how a figure was produced can be shown.
 */
export function calculate(raw: CalculatorInput): CalculatorResult {
  const input: CalculatorInput = Object.freeze({
    industry: raw.industry,
    size: raw.size,
    team: clamp(Math.round(raw.team), INPUT_BOUNDS.team.min, INPUT_BOUNDS.team.max),
    hoursPerWeek: clamp(
      Math.round(raw.hoursPerWeek),
      INPUT_BOUNDS.hoursPerWeek.min,
      INPUT_BOUNDS.hoursPerWeek.max,
    ),
    hourlyCost: clamp(
      Math.round(raw.hourlyCost),
      INPUT_BOUNDS.hourlyCost.min,
      INPUT_BOUNDS.hourlyCost.max,
    ),
    currentAutomation: clamp(
      Math.round(raw.currentAutomation),
      INPUT_BOUNDS.currentAutomation.min,
      INPUT_BOUNDS.currentAutomation.max,
    ),
  });

  const automated = input.currentAutomation / 100;
  const remaining = 1 - automated;

  const base =
    BASELINE_COVERAGE *
    INDUSTRY_COVERAGE[input.industry] *
    SIZE_FACTOR[input.size];

  const manualHoursPerYear =
    input.team *
    WORKING_WEEKS_PER_YEAR *
    (input.hoursPerWeek + TRANSACTION_HOURS_PER_WEEK);

  // Coverage only ever applies to the part that is still manual, which is why
  // raising "current automation" lowers the saving rather than raising it.
  const workloadRemoved = base * remaining;
  const hoursSavedPerYear = manualHoursPerYear * workloadRemoved;
  const manualHoursAfter = manualHoursPerYear - hoursSavedPerYear;

  const annualSaving = hoursSavedPerYear * input.hourlyCost * REALISATION;
  const revenueOpportunity =
    input.team *
    INDUSTRY_REVENUE_PER_PERSON[input.industry] *
    SIZE_FACTOR[input.size] *
    remaining;
  const twelveMonthTotal = annualSaving + revenueOpportunity;

  const implementationCost =
    IMPLEMENTATION_SETUP[input.size] + IMPLEMENTATION_PER_SEAT * input.team;

  // Both are charged against the twelve-month total, and both are guarded: with
  // no benefit at all the return is a total loss and payback is not a number,
  // so it is reported as zero rather than as infinity.
  const firstYearRoi = twelveMonthTotal / implementationCost - 1;
  const paybackMonths =
    twelveMonthTotal > 0 ? (implementationCost / twelveMonthTotal) * 12 : 0;

  const productivityGain =
    hoursSavedPerYear /
    (input.team * WORKING_WEEKS_PER_YEAR * FULL_TIME_HOURS_PER_WEEK);

  /*
   * The coverage meter.
   *
   * Not `base`, and not the removed fraction: work already running without a
   * person counts as covered too, and what the project adds is the coverage
   * rate applied to what is left. Hence `automated + base x remaining^2`, which
   * dips before it climbs — its minimum sits near 31% current automation, where
   * the ground already covered has not yet outgrown the ground given up.
   *
   * Recovered exactly. Across all 21 sweep points the residual is 4.4e-7, which
   * is the meter's own four-decimal-place rounding and nothing else.
   */
  const automationCoverage = Math.min(
    COVERAGE_CEILING,
    automated + base * remaining * remaining,
  );

  const projection = Object.freeze(
    Array.from({ length: 12 }, (_, index) => (twelveMonthTotal * (index + 1)) / 12),
  );

  return Object.freeze({
    currency: CURRENCY,
    input,
    manualHoursPerYear,
    manualHoursAfter,
    hoursSavedPerYear,
    annualSaving,
    revenueOpportunity,
    twelveMonthTotal,
    implementationCost,
    firstYearRoi,
    paybackMonths,
    productivityGain,
    automationCoverage,
    workloadRemoved,
    leadResponseMultiple: LEAD_RESPONSE_MULTIPLE,
    monthlyVolumes: Object.freeze({
      leads: input.team * MONTHLY_VOLUME_PER_PERSON.leads,
      calls: input.team * MONTHLY_VOLUME_PER_PERSON.calls,
      documents: input.team * MONTHLY_VOLUME_PER_PERSON.documents,
    }),
    projection,
  });
}

/*
 * Formatting.
 *
 * Deliberately hand-rolled rather than `Intl.NumberFormat` with compact
 * notation. Two reasons, and the second is the binding one:
 *
 *   - the reference's thresholds are specific — three significant figures until
 *     the number is large enough to lose its decimal — and compact notation
 *     does not produce them;
 *   - ADR-034 keeps numerals Latin in Arabic, and `Intl` would localise both
 *     the digits and the magnitude word. A figure stays one uninterrupted Latin
 *     numeral run in both languages; only the unit after it is a word, and that
 *     is passed in by the caller from `copy.ts`.
 */

/** `$204K`, `$96.1K`, `$1.3M`, `$18M`. Money, three significant figures. */
export function formatMoney(value: number): string {
  const sign = value < 0 ? "-" : "";
  const magnitude = Math.abs(value);
  if (magnitude >= 1e6) {
    return `${sign}$${(magnitude / 1e6).toFixed(magnitude >= 1e7 ? 0 : 1)}M`;
  }
  if (magnitude >= 1e3) {
    return `${sign}$${(magnitude / 1e3).toFixed(magnitude >= 1e5 ? 0 : 1)}K`;
  }
  return `${sign}$${String(Math.round(magnitude))}`;
}

/** `18.2Kh`, `271Kh`, `640h`. The unit is a word, so the caller supplies it. */
export function formatHours(value: number, unit: string): string {
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(value >= 1e5 ? 0 : 1)}K${unit}`;
  }
  return `${String(Math.round(value))}${unit}`;
}

/** `29,440`. Grouped, Latin digits, in both languages. */
export function formatCount(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

/** `509%`, `-28%`. */
export function formatPercent(fraction: number): string {
  return `${String(Math.round(fraction * 100))}%`;
}

/** `+24.8%`. Signed, because a gain that reads as a level is not a gain. */
export function formatSignedPercent(fraction: number): string {
  return `+${(fraction * 100).toFixed(1)}%`;
}

/**
 * Beyond two years, payback stops being a number.
 *
 * A payback of thirty-one months is not a more precise version of one at
 * twenty-nine months; both mean "not this year". The reference stops counting
 * at 24 and so does this.
 */
export const PAYBACK_CEILING_MONTHS = 24;

/** `2.0`, or `null` past the ceiling, where the caller substitutes a word. */
export function formatPaybackMonths(months: number): string | null {
  return months >= PAYBACK_CEILING_MONTHS ? null : months.toFixed(1);
}
