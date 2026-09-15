import { describe, expect, it } from "vitest";

import observations from "../../fixtures/calculator/reference-observations.json";
import { CALCULATOR_COPY } from "@/lib/calculator/copy";
import {
  BASELINE_COVERAGE,
  calculate,
  COVERAGE_CEILING,
  CURRENCY,
  formatCount,
  formatHours,
  formatMoney,
  formatPaybackMonths,
  formatPercent,
  formatSignedPercent,
  IMPLEMENTATION_PER_SEAT,
  IMPLEMENTATION_SETUP,
  INDUSTRY_COVERAGE,
  INDUSTRY_KEYS,
  INDUSTRY_REVENUE_PER_PERSON,
  INPUT_BOUNDS,
  INPUT_DEFAULTS,
  LEAD_RESPONSE_MULTIPLE,
  REALISATION,
  SIZE_FACTOR,
  SIZE_KEYS,
  WORKING_WEEKS_PER_YEAR,
  type CalculatorInput,
  type IndustryKey,
  type SizeKey,
} from "@/lib/calculator/model";

/*
 * The model is a reproduction, so this suite tests reproduction.
 *
 * "It looks the same" is not a claim anyone can check. What can be checked is
 * whether this implementation produces the exact strings the reference produced
 * for inputs it was never fitted against — so the HELD-OUT samples are the
 * fixtures here, and every displayed field of each is asserted.
 *
 * `holdout` in the fixture is the set the capture harness reserved and never
 * used to derive a constant. `sweeps` is the set the constants WERE fitted
 * from; it is asserted too, but only the held-out block is evidence that the
 * model generalises rather than memorises.
 *
 * The second half of the file keeps the honesty properties from the SAR model
 * that the reference happens to share. Those are not fidelity claims; they are
 * the assertions that fail if a later change quietly makes the calculator
 * flatter.
 */

const EN = CALCULATOR_COPY.en;

interface Observation {
  readonly label: string;
  readonly input: {
    readonly industry: string;
    readonly size: string;
    readonly team: number;
    readonly hoursPerWeek: number;
    readonly hourlyCost: number;
    readonly currentAutomation: number;
  };
  readonly observed: {
    readonly annualSaving: string;
    readonly hoursSaved: string;
    readonly firstYearRoi: string;
    readonly paybackMonths: string;
    readonly revenueOpportunity: string;
    readonly leadResponse: string;
    readonly automationCoverage: string;
    readonly automationCoverageExact: number;
    readonly productivityExact: number;
    readonly manualHoursToday: string;
    readonly manualHoursAfter: string;
    readonly twelveMonthTotal: string;
    readonly recommended: string;
  };
}

function inputOf(sample: Observation): CalculatorInput {
  return {
    industry: sample.input.industry as IndustryKey,
    size: sample.input.size as SizeKey,
    team: sample.input.team,
    hoursPerWeek: sample.input.hoursPerWeek,
    hourlyCost: sample.input.hourlyCost,
    currentAutomation: sample.input.currentAutomation,
  };
}

/** Every displayed field, rendered exactly as the reference renders it. */
function render(sample: Observation) {
  const result = calculate(inputOf(sample));
  const payback = formatPaybackMonths(result.paybackMonths);

  return {
    annualSaving: formatMoney(result.annualSaving),
    hoursSaved: formatHours(result.hoursSavedPerYear, EN.hourUnit),
    firstYearRoi: formatPercent(result.firstYearRoi),
    paybackMonths:
      payback === null ? EN.paybackBeyond : `${payback} ${EN.monthUnit}`,
    revenueOpportunity: formatMoney(result.revenueOpportunity),
    leadResponse: `${formatCount(result.leadResponseMultiple)}×${EN.leadResponseSuffix}`,
    automationCoverage: formatPercent(result.automationCoverage),
    manualHoursToday: `${formatCount(result.manualHoursPerYear)}${EN.hourUnit}`,
    manualHoursAfter: `${formatCount(result.manualHoursAfter)}${EN.hourUnit}`,
    twelveMonthTotal: formatMoney(result.twelveMonthTotal),
    recommended: EN.recommended[sample.input.industry as IndustryKey].join(" · "),
    // The two meter widths, which the reference exposes unrounded in the DOM to
    // four decimal places. They are the highest-precision evidence captured.
    automationCoverageExact: result.automationCoverage * 100,
    productivityExact: result.productivityGain * 100,
  };
}

const holdout = observations.holdout as readonly Observation[];
const sweeps = observations.sweeps as readonly Observation[];

describe("the model reproduces the reference on held-out samples", () => {
  it("has a held-out set that is not empty and is disjoint from the fitted sweeps", () => {
    expect(holdout.length).toBe(30);
    const fitted = new Set(sweeps.map((sample) => JSON.stringify(sample.input)));
    for (const sample of holdout) {
      expect(fitted.has(JSON.stringify(sample.input))).toBe(false);
    }
  });

  it.each(holdout.map((sample) => [sample.label, sample] as const))(
    "%s",
    (_label, sample) => {
      const got = render(sample);
      const want = sample.observed;

      expect(got.annualSaving).toBe(want.annualSaving);
      expect(got.hoursSaved).toBe(want.hoursSaved);
      expect(got.firstYearRoi).toBe(want.firstYearRoi);
      expect(got.paybackMonths).toBe(want.paybackMonths);
      expect(got.revenueOpportunity).toBe(want.revenueOpportunity);
      expect(got.leadResponse).toBe(want.leadResponse);
      expect(got.automationCoverage).toBe(want.automationCoverage);
      expect(got.manualHoursToday).toBe(want.manualHoursToday);
      expect(got.manualHoursAfter).toBe(want.manualHoursAfter);
      expect(got.twelveMonthTotal).toBe(want.twelveMonthTotal);
      expect(got.recommended).toBe(want.recommended);

      // The meters carry four decimal places of a percentage, so the tolerance
      // is that rounding and nothing more.
      expect(got.automationCoverageExact).toBeCloseTo(
        want.automationCoverageExact,
        3,
      );
      expect(got.productivityExact).toBeCloseTo(want.productivityExact, 3);
    },
  );
});

describe("the model reproduces the reference on the fitted sweeps", () => {
  it("matches every displayed field of all 85 sweep samples", () => {
    const mismatches = sweeps.flatMap((sample) => {
      const got = render(sample);
      const want = sample.observed;
      return (
        [
          "annualSaving",
          "hoursSaved",
          "firstYearRoi",
          "paybackMonths",
          "revenueOpportunity",
          "leadResponse",
          "automationCoverage",
          "manualHoursToday",
          "manualHoursAfter",
          "twelveMonthTotal",
          "recommended",
        ] as const
      )
        .filter((field) => got[field] !== want[field])
        .map((field) => `${sample.label}: ${field} ${got[field]} != ${want[field]}`);
    });

    expect(mismatches).toEqual([]);
  });
});

describe("the published defaults", () => {
  // The figures printed on the reference's own page. If any one of these moves,
  // the rebuild has stopped being a reproduction.
  it("produce the reference's headline figures", () => {
    const result = calculate(INPUT_DEFAULTS);

    expect(formatMoney(result.annualSaving)).toBe("$204K");
    expect(formatHours(result.hoursSavedPerYear, EN.hourUnit)).toBe("18.2Kh");
    expect(formatPercent(result.firstYearRoi)).toBe("509%");
    expect(formatPaybackMonths(result.paybackMonths)).toBe("2.0");
    expect(formatMoney(result.revenueOpportunity)).toBe("$258K");
    expect(result.leadResponseMultiple).toBe(720);
    expect(formatPercent(result.automationCoverage)).toBe("68%");
    expect(formatSignedPercent(result.productivityGain)).toBe("+24.8%");
    expect(formatCount(result.manualHoursPerYear)).toBe("29,440");
    expect(formatCount(result.manualHoursAfter)).toBe("11,207");
    expect(formatMoney(result.twelveMonthTotal)).toBe("$462K");
  });

  it("match the defaults the reference's own controls carry", () => {
    expect(observations.defaults).toEqual({
      industry: "professional-services",
      size: "growing",
      team: "40",
      hours: "14",
      hourly: "32",
      automation: "15",
    });
  });

  it("uses the reference's control bounds", () => {
    const controls = observations.controls;
    expect(INPUT_BOUNDS.team).toEqual({
      min: Number(controls.team.min),
      max: Number(controls.team.max),
      step: Number(controls.team.step),
    });
    expect(INPUT_BOUNDS.hoursPerWeek).toEqual({
      min: Number(controls.hours.min),
      max: Number(controls.hours.max),
      step: Number(controls.hours.step),
    });
    expect(INPUT_BOUNDS.hourlyCost).toEqual({
      min: Number(controls.hourly.min),
      max: Number(controls.hourly.max),
      step: Number(controls.hourly.step),
    });
    expect(INPUT_BOUNDS.currentAutomation).toEqual({
      min: Number(controls.automation.min),
      max: Number(controls.automation.max),
      step: Number(controls.automation.step),
    });
  });

  it("offers exactly the reference's options, in its order", () => {
    expect([...INDUSTRY_KEYS]).toEqual(observations.controls.industry.options);
    expect([...SIZE_KEYS]).toEqual(observations.controls.size.options);
  });
});

describe("the derived constants", () => {
  it("prices in USD", () => {
    expect(CURRENCY).toBe("USD");
    expect(calculate(INPUT_DEFAULTS).currency).toBe("USD");
  });

  it("uses a 46-week year with the transaction volume folded in", () => {
    // 40 x 14 x 52 does not reproduce 29,440, and that near-miss is what sent
    // the first derivation wrong. 40 x 46 x (14 + 2) does.
    expect(WORKING_WEEKS_PER_YEAR).toBe(46);
    expect(calculate(INPUT_DEFAULTS).manualHoursPerYear).toBe(29_440);
    expect(40 * 14 * 52).not.toBe(29_440);
  });

  it("keeps every coverage multiplier on two decimal places", () => {
    for (const key of INDUSTRY_KEYS) {
      const value = INDUSTRY_COVERAGE[key];
      expect(Math.abs(value * 100 - Math.round(value * 100))).toBeLessThan(1e-9);
    }
    for (const key of SIZE_KEYS) {
      const value = SIZE_FACTOR[key];
      expect(Math.abs(value * 100 - Math.round(value * 100))).toBeLessThan(1e-9);
    }
  });

  it("charges implementation cost against team and size only", () => {
    // Cost is what makes ROI fall as the remaining manual workload shrinks; if
    // it ever picked up an industry or hours term, ROI would stop being
    // comparable between sectors.
    const cost = (input: CalculatorInput) => calculate(input).implementationCost;
    const at = { ...INPUT_DEFAULTS };

    expect(cost(at)).toBe(IMPLEMENTATION_SETUP.growing + IMPLEMENTATION_PER_SEAT * 40);
    expect(cost({ ...at, industry: "retail" })).toBe(cost(at));
    expect(cost({ ...at, hoursPerWeek: 60 })).toBe(cost(at));
    expect(cost({ ...at, hourlyCost: 150 })).toBe(cost(at));
    expect(cost({ ...at, currentAutomation: 90 })).toBe(cost(at));
    expect(cost({ ...at, size: "startup" })).not.toBe(cost(at));
    expect(cost({ ...at, team: 400 })).not.toBe(cost(at));
  });

  it("has a revenue table it does not pretend is exact", () => {
    // Recorded as measured intervals rather than rounded to look authored. The
    // half-value on retail is real; rounding it to 730 or 731 stops reproducing
    // the observed revenue strings.
    expect(INDUSTRY_REVENUE_PER_PERSON.retail).toBe(730.5);
    expect(Object.keys(INDUSTRY_REVENUE_PER_PERSON).sort()).toEqual(
      [...INDUSTRY_KEYS].sort(),
    );
  });
});

describe("the coverage meter", () => {
  it("dips before it climbs, with its minimum near a third already automated", () => {
    // U-shaped in current automation, which is the one part of the reference
    // the first derivation could not fit. `automated + base x remaining^2`
    // reproduces every sweep point to the meter's own rounding.
    const at = (currentAutomation: number) =>
      calculate({ ...INPUT_DEFAULTS, currentAutomation }).automationCoverage;

    expect(at(30)).toBeLessThan(at(0));
    expect(at(30)).toBeLessThan(at(60));
    expect(at(25)).toBeGreaterThan(at(30));
    expect(at(35)).toBeGreaterThan(at(30));
  });

  it("starts at the industry and size base when nothing is automated yet", () => {
    const result = calculate({ ...INPUT_DEFAULTS, currentAutomation: 0 });
    expect(result.automationCoverage).toBeCloseTo(
      BASELINE_COVERAGE *
        INDUSTRY_COVERAGE["professional-services"] *
        SIZE_FACTOR.growing,
      10,
    );
  });

  it("never reaches 100%, at any input", () => {
    for (const industry of INDUSTRY_KEYS) {
      for (const size of SIZE_KEYS) {
        const result = calculate({
          industry,
          size,
          team: INPUT_BOUNDS.team.max,
          hoursPerWeek: INPUT_BOUNDS.hoursPerWeek.max,
          hourlyCost: INPUT_BOUNDS.hourlyCost.max,
          currentAutomation: 100,
        });
        expect(result.automationCoverage).toBeLessThanOrEqual(COVERAGE_CEILING);
        expect(result.automationCoverage).toBeLessThan(1);
      }
    }
  });
});

describe("the honesty properties", () => {
  it("is deterministic", () => {
    expect(calculate(INPUT_DEFAULTS)).toEqual(calculate(INPUT_DEFAULTS));
  });

  it("counts only a fraction of freed hours as money", () => {
    // The failure this guards is the one that makes these tools untrustworthy:
    // multiplying every released hour by a salary rate and calling it a saving.
    const result = calculate(INPUT_DEFAULTS);
    const ifEveryHourCounted =
      result.hoursSavedPerYear * INPUT_DEFAULTS.hourlyCost;

    expect(REALISATION).toBeLessThan(0.5);
    expect(result.annualSaving).toBeLessThan(ifEveryHourCounted);
    expect(result.annualSaving).toBeCloseTo(ifEveryHourCounted * REALISATION, 6);
  });

  it("returns a negative first-year ROI when the work is not justified", () => {
    // A calculator that cannot say no is an advertisement. A large team with
    // almost nothing left to automate is exactly that case.
    const result = calculate({
      ...INPUT_DEFAULTS,
      team: 40,
      hoursPerWeek: 1,
      hourlyCost: 10,
      currentAutomation: 95,
    });

    expect(result.firstYearRoi).toBeLessThan(0);
  });

  it("makes more current automation worth less, not more", () => {
    const little = calculate({ ...INPUT_DEFAULTS, currentAutomation: 5 });
    const lots = calculate({ ...INPUT_DEFAULTS, currentAutomation: 80 });

    expect(lots.annualSaving).toBeLessThan(little.annualSaving);
    expect(lots.hoursSavedPerYear).toBeLessThan(little.hoursSavedPerYear);
  });

  it("reports payback as zero rather than infinity when there is no benefit", () => {
    const result = calculate({ ...INPUT_DEFAULTS, currentAutomation: 100 });

    expect(result.twelveMonthTotal).toBe(0);
    expect(result.paybackMonths).toBe(0);
    expect(Number.isFinite(result.paybackMonths)).toBe(true);
    expect(formatPercent(result.firstYearRoi)).toBe("-100%");
  });

  it("clamps every control rather than extrapolating past it", () => {
    const beyond = calculate({
      industry: "professional-services",
      size: "growing",
      team: 5_000,
      hoursPerWeek: 200,
      hourlyCost: 900,
      currentAutomation: 400,
    });

    expect(beyond.input.team).toBe(INPUT_BOUNDS.team.max);
    expect(beyond.input.hoursPerWeek).toBe(INPUT_BOUNDS.hoursPerWeek.max);
    expect(beyond.input.hourlyCost).toBe(INPUT_BOUNDS.hourlyCost.max);
    expect(beyond.input.currentAutomation).toBe(INPUT_BOUNDS.currentAutomation.max);
  });

  it("holds the lead response constant, as the reference does", () => {
    expect(LEAD_RESPONSE_MULTIPLE).toBe(720);
    for (const industry of INDUSTRY_KEYS) {
      expect(calculate({ ...INPUT_DEFAULTS, industry }).leadResponseMultiple).toBe(
        720,
      );
    }
  });
});

describe("the copy", () => {
  it("carries the owner's two honesty devices verbatim, in English", () => {
    // Including the reference's own hyphen where a typographer would set an em
    // dash. "Verbatim" includes the punctuation, and a silent improvement is
    // still a change to somebody else's words.
    expect(EN.savingNote).toBe(
      "Realised cost avoidance - not the notional value of every freed hour.",
    );
    expect(EN.disclaimerLead).toBe("Indicative estimate.");
    expect(EN.disclaimer).toContain("not a quotation and not a guarantee of results");
  });

  it("names every industry and size in both languages", () => {
    for (const locale of ["en", "ar"] as const) {
      const copy = CALCULATOR_COPY[locale];
      for (const key of INDUSTRY_KEYS) {
        expect(copy.industries[key].length).toBeGreaterThan(0);
        expect(copy.recommended[key].length).toBeGreaterThan(0);
      }
      for (const key of SIZE_KEYS) {
        expect(copy.sizes[key].length).toBeGreaterThan(0);
      }
    }
  });

  it("recommends the same number of automations in both languages", () => {
    for (const key of INDUSTRY_KEYS) {
      expect(CALCULATOR_COPY.ar.recommended[key].length).toBe(
        CALCULATOR_COPY.en.recommended[key].length,
      );
    }
  });
});

describe("the formatters", () => {
  it("reproduce the reference's compact money thresholds", () => {
    expect(formatMoney(204_209.9)).toBe("$204K");
    expect(formatMoney(96_120)).toBe("$96.1K");
    expect(formatMoney(1_300_000)).toBe("$1.3M");
    expect(formatMoney(18_000_000)).toBe("$18M");
    expect(formatMoney(0)).toBe("$0");
  });

  it("keep numerals Latin in Arabic and localise only the unit", () => {
    // ADR-034: numerals stay Latin, because mixing numeral systems inside one
    // page is worse than either alone. Only the word after the figure changes.
    expect(formatCount(29_440)).toBe("29,440");
    expect(formatHours(18_233, CALCULATOR_COPY.en.hourUnit)).toBe("18.2Kh");
    expect(formatHours(18_233, CALCULATOR_COPY.ar.hourUnit)).toBe("18.2K ساعة");
  });
});
