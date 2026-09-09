import { describe, expect, it } from "vitest";
import { CALCULATOR_COPY } from "@/lib/calculator/copy";
import {
  calculate,
  COVERAGE_CEILING,
  CURRENCY,
  INPUT_BOUNDS,
  REALISATION,
  WORKING_WEEKS_PER_YEAR,
  formatSar,
  type CalculatorInput,
} from "@/lib/calculator/model";

// The calculator's job is to be believed in a meeting, which means it has to be
// conservative by construction rather than by disclaimer. These assertions are
// the honesty rules themselves: they fail if a later change makes the model
// flatter.

const base: CalculatorInput = {
  industry: "professional-services",
  size: "growing",
  people: 40,
  hoursPerWeek: 10,
  workflows: ["approvals", "documents"],
};

describe("the automation impact model", () => {
  it("is deterministic", () => {
    expect(calculate(base)).toEqual(calculate(base));
  });

  it("prices in SAR", () => {
    expect(calculate(base).currency).toBe("SAR");
    expect(CURRENCY).toBe("SAR");
  });

  it("never claims to remove all of the manual work", () => {
    const everything = calculate({
      ...base,
      industry: "healthcare",
      size: "enterprise",
      people: INPUT_BOUNDS.people.max,
      hoursPerWeek: INPUT_BOUNDS.hoursPerWeek.max,
      workflows: ["approvals", "documents", "customer-enquiries", "reporting", "field-capture"],
    });

    // Every multiplier at maximum still cannot reach the ceiling, and the
    // ceiling itself is well short of total.
    expect(everything.coverage).toBeLessThanOrEqual(COVERAGE_CEILING);
    expect(everything.coverage).toBeLessThan(0.8);
  });

  it("counts only a fraction of freed hours as money", () => {
    // The failure this guards is the one that makes these tools untrustworthy:
    // multiplying every released hour by a salary rate and calling it a saving.
    const result = calculate(base);
    const optimisticIfEveryHourCounted = result.hoursReleasedPerYear * 95;

    expect(result.annualSavingSar.high).toBeLessThan(optimisticIfEveryHourCounted);
    expect(REALISATION).toBeLessThan(0.5);
  });

  it("returns a range, never a single figure", () => {
    const result = calculate(base);

    expect(result.annualSavingSar.high).toBeGreaterThan(result.annualSavingSar.low);
    expect(result.indicativeBuildSar.high).toBeGreaterThan(result.indicativeBuildSar.low);
    expect(result.paybackMonths.high).toBeGreaterThan(result.paybackMonths.low);
  });

  it("produces nothing when no workflow is selected", () => {
    // No selected workflow means no scope, so the honest answer is zero rather
    // than a number derived from an industry average.
    const empty = calculate({ ...base, workflows: [] });

    expect(empty.coverage).toBe(0);
    expect(empty.hoursReleasedPerYear).toBe(0);
    expect(empty.annualSavingSar).toEqual({ low: 0, high: 0 });
    expect(empty.paybackMonths).toEqual({ low: 0, high: 0 });
  });

  it("cannot be inflated by selecting the same workflow twice", () => {
    const once = calculate({ ...base, workflows: ["documents"] });
    const twice = calculate({
      ...base,
      workflows: ["documents", "documents", "documents"],
    });

    expect(twice.coverage).toBe(once.coverage);
    expect(twice.indicativeBuildSar).toEqual(once.indicativeBuildSar);
  });

  it("clamps inputs instead of trusting them", () => {
    const absurd = calculate({
      ...base,
      people: 10_000,
      hoursPerWeek: 200,
    });
    const atMaximum = calculate({
      ...base,
      people: INPUT_BOUNDS.people.max,
      hoursPerWeek: INPUT_BOUNDS.hoursPerWeek.max,
    });

    expect(absurd).toEqual(atMaximum);

    const negative = calculate({ ...base, people: -5, hoursPerWeek: -5 });

    expect(negative.manualHoursPerYear).toBeGreaterThan(0);
  });

  it("survives a non-finite input rather than producing NaN", () => {
    const broken = calculate({
      ...base,
      people: Number.NaN,
      hoursPerWeek: Number.POSITIVE_INFINITY,
    });

    expect(Number.isFinite(broken.annualSavingSar.low)).toBe(true);
    expect(Number.isFinite(broken.paybackMonths.high)).toBe(true);
  });

  it("grows with scope, monotonically", () => {
    const one = calculate({ ...base, workflows: ["documents"] });
    const two = calculate({ ...base, workflows: ["documents", "approvals"] });

    expect(two.coverage).toBeGreaterThan(one.coverage);
    expect(two.annualSavingSar.low).toBeGreaterThan(one.annualSavingSar.low);
    // More scope costs more to build, so payback does not simply improve.
    expect(two.indicativeBuildSar.low).toBeGreaterThan(one.indicativeBuildSar.low);
  });


  it("leaves the hours it cannot remove on the table", () => {
    const result = calculate(base);

    // The before-and-after pair has to reconcile exactly, or the bar chart
    // drawn from it is telling a different story to the number beside it.
    expect(result.manualHoursAfter).toBe(
      result.manualHoursPerYear - result.hoursReleasedPerYear,
    );
    expect(result.manualHoursAfter).toBeGreaterThan(0);
  });

  it("measures released capacity against the whole year, not the manual slice", () => {
    const result = calculate(base);

    // Measured against the repetitive hours alone this figure would be several
    // times larger and would mean nothing. The guard is that it stays a small
    // single-digit share for an ordinary team.
    expect(result.productivityGain).toBeGreaterThan(0);
    expect(result.productivityGain).toBeLessThan(0.15);
  });

  it("starts the projection under water and only then climbs", () => {
    const result = calculate(base);

    expect(result.projection).toHaveLength(12);

    const first = result.projection[0];
    const last = result.projection[11];

    if (first === undefined || last === undefined) {
      throw new Error("The projection must cover twelve months.");
    }

    // Month one is the build cost against one month of saving, so it is
    // negative. If this ever passes with a positive first month, the build cost
    // has stopped being subtracted and the chart has become a sales device.
    expect(first.high).toBeLessThan(0);
    expect(last.high).toBeGreaterThan(first.high);

    // Cumulative, so every month is at least as good as the one before it.
    for (let index = 1; index < result.projection.length; index += 1) {
      const previous = result.projection[index - 1];
      const current = result.projection[index];

      if (previous === undefined || current === undefined) continue;

      expect(current.low).toBeGreaterThanOrEqual(previous.low);
      expect(current.high).toBeGreaterThanOrEqual(previous.high);
    }
  });

  it("produces no projection worth plotting when nothing is selected", () => {
    const result = calculate({ ...base, workflows: [] });

    expect(result.manualHoursAfter).toBe(result.manualHoursPerYear);
    expect(result.productivityGain).toBe(0);
    expect(result.projection.every((month) => month.high === 0)).toBe(true);
  });
  it("states every assumption it used, as facts rather than as sentences", () => {
    // The model used to return finished English prose here, which quietly made
    // it a presentation module and made a second language impossible without
    // editing arithmetic. It now returns the NUMBERS; `copy.ts` owns the words.
    const result = calculate(base);
    const kinds = result.assumptions.map((assumption) => assumption.kind);

    expect(kinds).toEqual([
      "workload",
      "coverage",
      "realisation",
      "hourly-cost",
      "build-cost",
    ]);

    // Every honesty rule the calculator advertises is present as a stated
    // assumption, not merely applied inside the arithmetic.
    const workload = result.assumptions.find((a) => a.kind === "workload");
    const realisation = result.assumptions.find((a) => a.kind === "realisation");
    const coverage = result.assumptions.find((a) => a.kind === "coverage");

    expect(workload).toMatchObject({
      people: base.people,
      hoursPerWeek: base.hoursPerWeek,
      weeksPerYear: WORKING_WEEKS_PER_YEAR,
    });
    expect(realisation?.percent).toBe(REALISATION * 100);
    expect(coverage?.ceilingPercent).toBe(COVERAGE_CEILING * 100);
    expect(result.currency).toBe(CURRENCY);
  });

  it("renders every assumption in both languages", () => {
    // The point of separating the numbers from the words: an assumption that
    // has no wording in one language is a silently blank line in the reader's
    // list, and the assumptions are the honest part of this feature.
    const result = calculate(base);
    const format = {
      count: (value: number) => String(value),
      money: (value: number) => `SAR ${String(value)}`,
      percent: (value: number) => `${String(value)}%`,
    };

    for (const locale of ["en", "ar"] as const) {
      for (const assumption of result.assumptions) {
        const sentence = CALCULATOR_COPY[locale].assumption(assumption, format);

        expect(sentence.length).toBeGreaterThan(10);
        expect(sentence).not.toContain("undefined");
      }
    }

    expect(
      CALCULATOR_COPY.en.assumption(result.assumptions[2]!, format),
    ).toContain("absorbed rather than saved");
  });

  it("formats money as SAR in both locales", () => {
    expect(formatSar(204_000, "en")).toContain("204,000");
    // Arabic formatting differs; what matters is that it is still SAR and still
    // that quantity, not the exact glyphs.
    expect(formatSar(204_000, "ar-SA")).toMatch(/204|٢٠٤/u);
  });
});
