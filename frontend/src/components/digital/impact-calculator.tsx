"use client";

import { useId, useMemo, useState, type ReactNode } from "react";

import { CALCULATOR_COPY, type NumberFormatters } from "@/lib/calculator/copy";
import {
  calculate,
  formatNumber,
  formatSar,
  INDUSTRY_KEYS,
  INPUT_BOUNDS,
  SIZE_KEYS,
  WORKFLOW_KEYS,
  type IndustryKey,
  type SizeKey,
  type WorkflowKey,
} from "@/lib/calculator/model";
import { intlLocale } from "@/lib/i18n/locale";
import type { LocaleCode } from "@/types/site";

// The automation impact calculator.
//
// A Client Component, and one of the few that earns it: this is a real product
// interaction, not decoration. Everything it needs is already in the bundle —
// the model is a pure function with no dependencies and no network — so the
// whole feature costs one small module and no request.
//
// The presentation makes three promises the model already keeps:
//
//   - every figure is a RANGE, because a single number implies a precision
//     nobody has;
//   - the assumptions are on the page, not behind a tooltip, and not in
//     smaller type than the number they qualify;
//   - the headline is realised cost avoidance, which is much less than the
//     notional value of the freed hours, and it says so next to itself.
//
// It exists to start an honest conversation. A calculator that flatters the
// reader costs the meeting it was supposed to win.
//
// Bilingual throughout, and the RTL work here is not cosmetic. Ranges are the
// one place a naive mirror goes wrong: "45,000 – 110,000" must keep its numbers
// in that order in Arabic too, so every range is emitted as an isolated LTR run
// rather than left to the bidi algorithm to guess at.

interface ImpactCalculatorProps {
  readonly locale: LocaleCode;
}

export function ImpactCalculator({ locale }: ImpactCalculatorProps) {
  const id = useId();
  const copy = CALCULATOR_COPY[locale];
  const intl = intlLocale(locale);

  const [industry, setIndustry] = useState<IndustryKey>("professional-services");
  const [size, setSize] = useState<SizeKey>("growing");
  const [people, setPeople] = useState(40);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [workflows, setWorkflows] = useState<readonly WorkflowKey[]>([
    "approvals",
    "documents",
  ]);
  const [showAssumptions, setShowAssumptions] = useState(false);

  const result = useMemo(
    () => calculate({ industry, size, people, hoursPerWeek, workflows }),
    [industry, size, people, hoursPerWeek, workflows],
  );

  const format: NumberFormatters = useMemo(
    () => ({
      count: (value) => formatNumber(value, intl),
      money: (value) => formatSar(value, intl),
      percent: (value) => `${formatNumber(value, intl)}%`,
    }),
    [intl],
  );

  const hasScope = workflows.length > 0;

  function toggleWorkflow(workflow: WorkflowKey): void {
    setWorkflows((current) =>
      current.includes(workflow)
        ? current.filter((entry) => entry !== workflow)
        : [...current, workflow],
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
      {/* ---------------------------------------------------------------- inputs */}
      <form
        className="grid content-start gap-7"
        // Nothing is submitted: the result updates as the inputs change, so a
        // submit would only reload the page.
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="grid gap-2">
          <label
            htmlFor={`${id}-industry`}
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint"
          >
            {copy.industry}
          </label>
          <select
            id={`${id}-industry`}
            value={industry}
            onChange={(event) => {
              setIndustry(event.target.value as IndustryKey);
            }}
            className="min-h-[44px] rounded-xl border border-brand-border bg-brand-deep-card px-4 text-[0.9375rem] text-brand-ink"
          >
            {INDUSTRY_KEYS.map((key) => (
              <option key={key} value={key}>
                {copy.industries[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor={`${id}-size`}
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint"
          >
            {copy.size}
          </label>
          <select
            id={`${id}-size`}
            value={size}
            onChange={(event) => {
              setSize(event.target.value as SizeKey);
            }}
            className="min-h-[44px] rounded-xl border border-brand-border bg-brand-deep-card px-4 text-[0.9375rem] text-brand-ink"
          >
            {SIZE_KEYS.map((key) => (
              <option key={key} value={key}>
                {copy.sizes[key]}
              </option>
            ))}
          </select>
        </div>

        <NumberField
          id={`${id}-people`}
          label={copy.people}
          hint={copy.peopleHint}
          exactSuffix={copy.exactSuffix}
          value={people}
          bounds={INPUT_BOUNDS.people}
          onChange={setPeople}
          format={format.count}
        />

        <NumberField
          id={`${id}-hours`}
          label={copy.hours}
          hint={copy.hoursHint}
          exactSuffix={copy.exactSuffix}
          value={hoursPerWeek}
          bounds={INPUT_BOUNDS.hoursPerWeek}
          onChange={setHoursPerWeek}
          format={format.count}
        />

        <fieldset className="grid gap-3 border-0 p-0">
          <legend className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
            {copy.scope}
          </legend>
          <div className="flex flex-wrap gap-2">
            {WORKFLOW_KEYS.map((workflow) => {
              const selected = workflows.includes(workflow);

              return (
                <button
                  key={workflow}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    toggleWorkflow(workflow);
                  }}
                  // The unselected border is deliberately stronger than the
                  // hairline used elsewhere: these are the only controls on the
                  // page whose *unselected* state still has to read as a
                  // control, and at 10% white it did not.
                  className={`min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors ${
                    selected
                      ? "border-brand-accent bg-brand-accent/15 text-brand-ink"
                      : "border-brand-ink-faint/60 bg-transparent text-brand-ink-soft hover:border-brand-ink-soft hover:text-brand-ink"
                  }`}
                >
                  {copy.workflows[workflow]}
                </button>
              );
            })}
          </div>
        </fieldset>
      </form>

      {/* --------------------------------------------------------------- results */}
      <div
        // Polite rather than assertive: the numbers change on every slider
        // step, and an assertive region would interrupt a screen-reader user
        // continuously while they drag.
        aria-live="polite"
        className="grid content-start gap-8 rounded-2xl border border-brand-border bg-brand-deep-card/60 p-7 sm:p-9"
      >
        {hasScope ? (
          <>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
                {copy.headlineLabel}
              </p>
              <p className="mt-3 text-balance text-[clamp(1.875rem,1.35rem+2.4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.02em]">
                <NumericRange
                  low={format.money(result.annualSavingSar.low)}
                  high={format.money(result.annualSavingSar.high)}
                />
              </p>
              <p className="mt-3 max-w-[46ch] text-sm leading-[1.6] text-brand-ink-soft">
                {copy.headlineNote}
              </p>
            </div>

            <dl className="grid gap-6 sm:grid-cols-3">
              <Metric
                label={copy.hoursReleased}
                value={format.count(result.hoursReleasedPerYear)}
              />
              <Metric
                label={copy.ofWorkload}
                value={format.percent(Math.round(result.coverage * 100))}
              />
              <Metric
                label={copy.payback}
                value={
                  <>
                    <NumericRange
                      low={format.count(result.paybackMonths.low)}
                      high={format.count(result.paybackMonths.high)}
                    />{" "}
                    {copy.monthsAbbreviation}
                  </>
                }
              />
            </dl>

            <div className="border-t border-brand-border pt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
                {copy.buildLabel}
              </p>
              <p className="mt-2 text-[1.0625rem] text-brand-ink">
                <NumericRange
                  low={format.money(result.indicativeBuildSar.low)}
                  high={format.money(result.indicativeBuildSar.high)}
                />{" "}
                {copy.buildAcross(result.contributions.length)}
              </p>
            </div>
          </>
        ) : (
          <p className="max-w-[42ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
            {copy.noScope}
          </p>
        )}

        <div className="border-t border-brand-border pt-6">
          <button
            type="button"
            aria-expanded={showAssumptions}
            aria-controls={`${id}-assumptions`}
            onClick={() => {
              setShowAssumptions((current) => !current);
            }}
            className="min-h-[44px] text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent"
          >
            {showAssumptions ? copy.hideAssumptions : copy.showAssumptions}
          </button>
          <ul
            id={`${id}-assumptions`}
            hidden={!showAssumptions}
            className="mt-4 grid gap-2 text-sm leading-[1.6] text-brand-ink-soft"
          >
            {result.assumptions.map((assumption) => (
              <li key={assumption.kind}>{copy.assumption(assumption, format)}</li>
            ))}
          </ul>
        </div>

        <p className="text-xs leading-[1.6] text-brand-ink-faint">
          {copy.disclaimer}
        </p>
      </div>
    </div>
  );
}

/**
 * A low–high pair that keeps its order in both writing directions.
 *
 * Left to itself, the bidi algorithm reorders a Latin-numeral range inside an
 * Arabic paragraph and the reader is shown the high figure first. `dir="ltr"`
 * with `unicode-bidi: isolate` (Tailwind's `isolate` here is the CSS isolation
 * property, so the explicit style is the one that matters) pins the run.
 */
function NumericRange({
  low,
  high,
}: {
  readonly low: string;
  readonly high: string;
}) {
  return (
    <span dir="ltr" style={{ unicodeBidi: "isolate" }}>
      {low} – {high}
    </span>
  );
}

function Metric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
        {label}
      </dt>
      <dd className="mt-2 text-[1.375rem] font-bold leading-tight text-brand-ink">
        {value}
      </dd>
    </div>
  );
}

interface NumberFieldProps {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly exactSuffix: string;
  readonly value: number;
  readonly bounds: { readonly min: number; readonly max: number; readonly step: number };
  readonly onChange: (value: number) => void;
  readonly format: (value: number) => string;
}

/**
 * A range paired with a number input.
 *
 * The slider alone is not enough: it is imprecise, it is hard to use with a
 * keyboard at this granularity, and on a touch screen it competes with page
 * scrolling. The number input makes the value typeable and gives the field a
 * real, focusable, labelled control.
 *
 * The slider is NOT mirrored for Arabic. A range input is a magnitude axis, not
 * a reading order: browsers already run it right-to-left under `dir="rtl"`, and
 * forcing it back would put the maximum where a reader expects the minimum.
 * This is the "mirror only semantically directional interactions" rule — the
 * numeric readout beside it is what disambiguates either way.
 */
function NumberField({
  id,
  label,
  hint,
  exactSuffix,
  value,
  bounds,
  onChange,
  format,
}: NumberFieldProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint"
        >
          {label}
        </label>
        <output htmlFor={id} className="text-[1.0625rem] font-bold text-brand-ink">
          {format(value)}
        </output>
      </div>
      <div className="flex items-center gap-4">
        <input
          id={id}
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={value}
          onChange={(event) => {
            onChange(Number(event.target.value));
          }}
          className="h-11 w-full accent-[var(--brand-accent)]"
        />
        <input
          type="number"
          aria-label={`${label} (${exactSuffix})`}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={value}
          onChange={(event) => {
            onChange(Number(event.target.value));
          }}
          className="min-h-[44px] w-24 rounded-xl border border-brand-border bg-brand-deep-card px-3 text-center text-[0.9375rem] text-brand-ink"
        />
      </div>
      <p className="text-xs leading-[1.5] text-brand-ink-faint">{hint}</p>
    </div>
  );
}
