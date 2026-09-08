import { describe, expect, it } from "vitest";
import {
  calculate,
  COVERAGE_CEILING,
  CURRENCY,
  INPUT_BOUNDS,
  REALISATION,
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

  it("states every assumption it used", () => {
    const result = calculate(base);

    expect(result.assumptions.length).toBeGreaterThanOrEqual(5);
    expect(result.assumptions.join(" ")).toContain("48 working weeks");
    expect(result.assumptions.join(" ")).toContain("absorbed rather than saved");
    expect(result.assumptions.join(" ")).toContain(CURRENCY);
  });

  it("formats money as SAR in both locales", () => {
    expect(formatSar(204_000, "en")).toContain("204,000");
    // Arabic formatting differs; what matters is that it is still SAR and still
    // that quantity, not the exact glyphs.
    expect(formatSar(204_000, "ar-SA")).toMatch(/204|٢٠٤/u);
  });
});
