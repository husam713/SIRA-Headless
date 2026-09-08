"use client";

import { useId, useMemo, useState } from "react";

import {
  calculate,
  formatNumber,
  formatSar,
  INDUSTRY_LABEL,
  INPUT_BOUNDS,
  SIZE_LABEL,
  WORKFLOW_LABEL,
  type IndustryKey,
  type SizeKey,
  type WorkflowKey,
} from "@/lib/calculator/model";

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

const INDUSTRIES = Object.keys(INDUSTRY_LABEL) as readonly IndustryKey[];
const SIZES = Object.keys(SIZE_LABEL) as readonly SizeKey[];
const WORKFLOWS = Object.keys(WORKFLOW_LABEL) as readonly WorkflowKey[];

interface ImpactCalculatorProps {
  /** BCP-47 tag used for number and currency formatting. */
  readonly locale: string;
}

export function ImpactCalculator({ locale }: ImpactCalculatorProps) {
  const id = useId();
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

  const money = (value: number) => formatSar(value, locale);
  const count = (value: number) => formatNumber(value, locale);
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
            Industry
          </label>
          <select
            id={`${id}-industry`}
            value={industry}
            onChange={(event) => {
              setIndustry(event.target.value as IndustryKey);
            }}
            className="min-h-[44px] rounded-xl border border-brand-border bg-brand-deep-card px-4 text-[0.9375rem] text-brand-ink"
          >
            {INDUSTRIES.map((key) => (
              <option key={key} value={key}>
                {INDUSTRY_LABEL[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor={`${id}-size`}
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint"
          >
            Organisation size
          </label>
          <select
            id={`${id}-size`}
            value={size}
            onChange={(event) => {
              setSize(event.target.value as SizeKey);
            }}
            className="min-h-[44px] rounded-xl border border-brand-border bg-brand-deep-card px-4 text-[0.9375rem] text-brand-ink"
          >
            {SIZES.map((key) => (
              <option key={key} value={key}>
                {SIZE_LABEL[key]}
              </option>
            ))}
          </select>
        </div>

        <NumberField
          id={`${id}-people`}
          label="People this touches"
          hint="Everyone whose work the automation would change."
          value={people}
          bounds={INPUT_BOUNDS.people}
          onChange={setPeople}
          format={count}
        />

        <NumberField
          id={`${id}-hours`}
          label="Repetitive hours each, per week"
          hint="Time spent on work that follows the same steps every time."
          value={hoursPerWeek}
          bounds={INPUT_BOUNDS.hoursPerWeek}
          onChange={setHoursPerWeek}
          format={count}
        />

        <fieldset className="grid gap-3 border-0 p-0">
          <legend className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
            Where the time goes
          </legend>
          <div className="flex flex-wrap gap-2">
            {WORKFLOWS.map((workflow) => {
              const selected = workflows.includes(workflow);

              return (
                <button
                  key={workflow}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    toggleWorkflow(workflow);
                  }}
                  className={`min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors ${
                    selected
                      ? "border-brand-accent bg-brand-accent/15 text-brand-ink"
                      : "border-brand-border bg-transparent text-brand-ink-soft hover:border-brand-ink-faint"
                  }`}
                >
                  {WORKFLOW_LABEL[workflow]}
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
                Indicative annual saving
              </p>
              <p className="mt-3 text-balance text-[clamp(1.875rem,1.35rem+2.4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.02em]">
                {money(result.annualSavingSar.low)} – {money(result.annualSavingSar.high)}
              </p>
              <p className="mt-3 max-w-[46ch] text-sm leading-[1.6] text-brand-ink-soft">
                Realised cost avoidance — not the notional value of every freed
                hour. Most released time is absorbed rather than saved, and this
                figure already accounts for that.
              </p>
            </div>

            <dl className="grid gap-6 sm:grid-cols-3">
              <Metric
                label="Hours released a year"
                value={count(result.hoursReleasedPerYear)}
              />
              <Metric
                label="Of the manual workload"
                value={`${String(Math.round(result.coverage * 100))}%`}
              />
              <Metric
                label="Payback"
                value={`${String(result.paybackMonths.low)}–${String(result.paybackMonths.high)} mo`}
              />
            </dl>

            <div className="border-t border-brand-border pt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
                Indicative build
              </p>
              <p className="mt-2 text-[1.0625rem] text-brand-ink">
                {money(result.indicativeBuildSar.low)} –{" "}
                {money(result.indicativeBuildSar.high)} across{" "}
                {String(result.contributions.length)}{" "}
                {result.contributions.length === 1 ? "workflow" : "workflows"}
              </p>
            </div>
          </>
        ) : (
          <p className="max-w-[42ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
            Choose at least one place the time goes. Without a scope there is
            nothing to estimate, and an average would be a guess dressed as a
            number.
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
            {showAssumptions ? "Hide assumptions" : "Show every assumption"}
          </button>
          <ul
            id={`${id}-assumptions`}
            hidden={!showAssumptions}
            className="mt-4 grid gap-2 text-sm leading-[1.6] text-brand-ink-soft"
          >
            {result.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
        </div>

        <p className="text-xs leading-[1.6] text-brand-ink-faint">
          Indicative only. This is a model, not a quotation, not a forecast and
          not a guarantee of any outcome. Real figures come from looking at your
          actual process.
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { readonly label: string; readonly value: string }) {
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
 */
function NumberField({
  id,
  label,
  hint,
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
          aria-label={`${label} (exact)`}
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
