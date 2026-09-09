"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { CtaLink } from "@/components/homepage/cta-link";
import { CALCULATOR_COPY } from "@/lib/calculator/copy";
import {
  calculate,
  formatCount,
  formatHours,
  formatMoney,
  formatPaybackMonths,
  formatPercent,
  formatSignedPercent,
  INDUSTRY_KEYS,
  INPUT_BOUNDS,
  INPUT_DEFAULTS,
  SIZE_KEYS,
  type IndustryKey,
  type SizeKey,
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
// Control set, label wording and output order are the reference's, exactly. The
// two things this build does NOT copy are the header, which the owner excluded,
// and the chart library: the twelve-month curve and the before/after bar are
// drawn with grid rows and brand tokens, so they inherit the type scale, the
// theme and the writing direction for free.
//
// Two honesty devices survive from the earlier SAR model because the reference
// has them too, in its own words: the headline is realised cost avoidance and
// says so beside itself, and ROI is charged against a real implementation cost
// so it can — and does — go negative.
//
// Bidi: every figure is a Latin numeral run, and several of them sit inside
// Arabic sentences or beside Arabic labels. Each is emitted through `Numeric`,
// which pins the run LTR rather than leaving the order to the bidi algorithm.

interface ImpactCalculatorProps {
  readonly locale: LocaleCode;
  /** Where the primary call to action points. */
  readonly bookHref: string;
}

export function ImpactCalculator({ locale, bookHref }: ImpactCalculatorProps) {
  const id = useId();
  const copy = CALCULATOR_COPY[locale];
  const intl = intlLocale(locale);

  const [industry, setIndustry] = useState<IndustryKey>(INPUT_DEFAULTS.industry);
  const [size, setSize] = useState<SizeKey>(INPUT_DEFAULTS.size);
  const [team, setTeam] = useState(INPUT_DEFAULTS.team);
  const [hoursPerWeek, setHoursPerWeek] = useState(INPUT_DEFAULTS.hoursPerWeek);
  const [hourlyCost, setHourlyCost] = useState(INPUT_DEFAULTS.hourlyCost);
  const [currentAutomation, setCurrentAutomation] = useState(
    INPUT_DEFAULTS.currentAutomation,
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [generatedOn, setGeneratedOn] = useState("");

  const result = useMemo(
    () =>
      calculate({
        industry,
        size,
        team,
        hoursPerWeek,
        hourlyCost,
        currentAutomation,
      }),
    [industry, size, team, hoursPerWeek, hourlyCost, currentAutomation],
  );

  const payback = formatPaybackMonths(result.paybackMonths);
  const twelveMonthTotal = formatMoney(result.twelveMonthTotal);
  const print = usePrintReport(setGeneratedOn, intl);

  return (
    <div data-automation-report="" className="grid gap-14">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* -------------------------------------------------------- inputs */}
        <form
          className="min-w-0"
          // Nothing is submitted: the result updates as the inputs change, so a
          // submit would only reload the page.
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-ink-faint">
            {copy.inputsTitle}
          </h3>

          <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2">
            <Choice
              id={`${id}-industry`}
              label={copy.industry}
              value={industry}
              options={INDUSTRY_KEYS}
              labels={copy.industries}
              onChange={setIndustry}
            />
            <Choice
              id={`${id}-size`}
              label={copy.size}
              value={size}
              options={SIZE_KEYS}
              labels={copy.sizes}
              onChange={setSize}
            />
          </div>

          <div className="mt-9 grid gap-7">
            <Slider
              id={`${id}-team`}
              label={copy.team}
              hint={copy.teamHint}
              bounds={INPUT_BOUNDS.team}
              value={team}
              display={formatCount(team)}
              valueText={copy.teamValueText(String(team))}
              onChange={setTeam}
            />
            <Slider
              id={`${id}-hours`}
              label={copy.hours}
              hint={copy.hoursHint}
              bounds={INPUT_BOUNDS.hoursPerWeek}
              value={hoursPerWeek}
              display={formatCount(hoursPerWeek)}
              valueText={copy.hoursValueText(String(hoursPerWeek))}
              onChange={setHoursPerWeek}
            />
          </div>

          {/* The two assumptions most people should not have to think about,
              behind a disclosure rather than removed: someone who does want to
              argue with the hourly rate must be able to find it and change it,
              or the figure below is not theirs. */}
          <div className="mt-9">
            <button
              type="button"
              aria-expanded={advancedOpen}
              aria-controls={`${id}-advanced`}
              onClick={() => {
                setAdvancedOpen((open) => !open);
              }}
              className="digital-disclosure inline-flex min-h-[44px] items-center gap-2 text-[13px] font-medium text-brand-accent"
            >
              <svg
                viewBox="0 0 12 12"
                className="digital-disclosure__icon h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  d="M4.5 2.5L8 6l-3.5 3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {copy.advanced}
            </button>
            {/* `display` is switched with a utility rather than the `hidden`
                attribute. Tailwind v4 puts utilities in a later cascade layer
                than preflight, so `.grid` beats preflight's `[hidden]` rule and
                the attribute alone would leave the panel on screen. */}
            <div
              id={`${id}-advanced`}
              className={advancedOpen ? "mt-7 grid gap-7" : "hidden"}
            >
              <Slider
                id={`${id}-hourly`}
                label={copy.hourlyCost}
                hint={copy.hourlyCostHint}
                bounds={INPUT_BOUNDS.hourlyCost}
                value={hourlyCost}
                display={`$${formatCount(hourlyCost)}`}
                valueText={copy.hourlyCostValueText(String(hourlyCost))}
                onChange={setHourlyCost}
              />
              <Slider
                id={`${id}-automation`}
                label={copy.currentAutomation}
                hint={copy.currentAutomationHint}
                bounds={INPUT_BOUNDS.currentAutomation}
                value={currentAutomation}
                display={`${formatCount(currentAutomation)}%`}
                valueText={copy.currentAutomationValueText(String(currentAutomation))}
                onChange={setCurrentAutomation}
              />
            </div>
          </div>

          <p className="mt-9 max-w-[46ch] text-[12px] leading-relaxed text-brand-ink-faint">
            {copy.volumeNote({
              leads: formatCount(result.monthlyVolumes.leads),
              calls: formatCount(result.monthlyVolumes.calls),
              documents: formatCount(result.monthlyVolumes.documents),
            })}
          </p>
        </form>

        {/* ------------------------------------------------------- outputs */}
        <div
          // Polite rather than assertive: the numbers change on every slider
          // step, and an assertive region would interrupt a screen-reader user
          // continuously while they drag.
          aria-live="polite"
          className="min-w-0"
        >
          <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-ink-faint">
            {copy.outputsTitle}
          </h3>

          <div className="mt-8">
            <p className="text-[13px] text-brand-ink-soft">{copy.savingLabel}</p>
            <p className="digital-display mt-2 font-bold leading-[0.95] tracking-[-0.02em] text-[clamp(3rem,1.9rem+4.4vw,4rem)]">
              <Numeric>{formatMoney(result.annualSaving)}</Numeric>
            </p>
            <p className="mt-3 max-w-[42ch] text-[12px] leading-relaxed text-brand-ink-faint">
              {copy.savingNote}
            </p>
          </div>

          <div className="mt-9">
            <p className="text-[clamp(1.6rem,1.2rem+1.4vw,2rem)] font-bold leading-none">
              {/* The NUMERAL is pinned LTR; the unit beside it is a word and
                  flows in the paragraph direction. Inside the isolate, an
                  Arabic reader meets "ساعة" before the number it belongs to. */}
              <Numeric>{formatHours(result.hoursSavedPerYear, "")}</Numeric>
              {copy.hourUnit}
            </p>
            <p className="mt-2 text-[13px] text-brand-ink-soft">{copy.hoursSaved}</p>
          </div>

          <dl className="mt-10 border-y border-brand-border">
            <Row label={copy.roi}>
              <Numeric>{formatPercent(result.firstYearRoi)}</Numeric>
            </Row>
            <Row label={copy.payback}>
              {payback === null ? (
                // Past the ceiling this is a sentence, not a figure, so it is
                // not pinned LTR.
                copy.paybackBeyond
              ) : (
                <>
                  <Numeric>{payback}</Numeric> {copy.monthUnit}
                </>
              )}
            </Row>
            <Row label={copy.revenue}>
              <Numeric>{formatMoney(result.revenueOpportunity)}</Numeric>
            </Row>
            <Row label={copy.leadResponse} suffix={copy.leadResponseSuffix}>
              <Numeric>{`${formatCount(result.leadResponseMultiple)}×`}</Numeric>
            </Row>
          </dl>

          <section aria-labelledby={`${id}-coverage`} className="mt-11">
            <p className="text-[clamp(1.9rem,1.4rem+1.8vw,2.4rem)] font-bold leading-none">
              <Numeric>{formatPercent(result.automationCoverage)}</Numeric>
            </p>
            <h4 id={`${id}-coverage`} className="mt-2 text-[13px] text-brand-ink-soft">
              {copy.coverage}
            </h4>
            <Meter fraction={result.automationCoverage} />
            <p className="mt-3 max-w-[46ch] text-[12px] leading-relaxed text-brand-ink-faint">
              {copy.coverageNote}
            </p>
          </section>

          <section aria-labelledby={`${id}-productivity`} className="mt-9">
            <div className="flex items-baseline justify-between gap-4">
              <h4 id={`${id}-productivity`} className="text-[13px] text-brand-ink-soft">
                {copy.productivity}
              </h4>
              <p className="shrink-0 text-[16px] font-semibold">
                <Numeric>{formatSignedPercent(result.productivityGain)}</Numeric>
              </p>
            </div>
            <Meter fraction={result.productivityGain} />
          </section>

          {/* Before and after, as one bar rather than two numbers. A reader who
              does not trust a currency figure still recognises their own hours,
              and the width IS the argument: the remaining bar is drawn to scale
              against today's, so a modest coverage looks modest. */}
          <section aria-labelledby={`${id}-manual`} className="mt-11">
            <h4 id={`${id}-manual`} className="text-[13px] text-brand-ink-soft">
              {copy.manualHoursTitle}
            </h4>
            <dl className="mt-5 grid gap-4">
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[13px] text-brand-ink-soft">{copy.manualToday}</dt>
                  <dd className="shrink-0 text-[15px] font-semibold tabular-nums">
                    <Numeric>{formatCount(result.manualHoursPerYear)}</Numeric>
                    {copy.hourUnit}
                  </dd>
                </div>
                <div
                  aria-hidden="true"
                  className="mt-2.5 h-[2px] rounded-sm bg-brand-ink/25"
                />
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[13px] text-brand-ink-soft">{copy.manualAfter}</dt>
                  <dd className="shrink-0 text-[15px] font-semibold tabular-nums text-brand-accent">
                    <Numeric>{formatCount(result.manualHoursAfter)}</Numeric>
                    {copy.hourUnit}
                  </dd>
                </div>
                <div aria-hidden="true" className="mt-2.5 h-[2px] rounded-sm bg-brand-ink/10">
                  <div
                    className="digital-bar h-full rounded-sm bg-brand-accent"
                    style={{
                      inlineSize: `${String(
                        Math.max(
                          0,
                          Math.min(
                            100,
                            (result.manualHoursAfter / result.manualHoursPerYear) * 100,
                          ),
                        ),
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </dl>
          </section>

          {/* The twelve-month position. Bars are grid rows rather than an SVG
              so the chart inherits the type, the tokens and the direction
              without a chart library — this site has none and this did not
              justify adding one. The months before the build is paid back are
              drawn in faint ink and the ones after in the accent, so the reader
              can see where the line stops costing and starts returning. */}
          <section aria-labelledby={`${id}-projection`} className="mt-11">
            <div className="flex items-baseline justify-between gap-4">
              <h4 id={`${id}-projection`} className="text-[13px] text-brand-ink-soft">
                {copy.projectionTitle}
              </h4>
              <p className="shrink-0 text-[15px] font-semibold tabular-nums">
                <Numeric>{twelveMonthTotal}</Numeric>
              </p>
            </div>
            <ol
              className="digital-projection mt-5"
              role="img"
              aria-label={copy.projectionChartLabel(twelveMonthTotal)}
            >
              {result.projection.map((cumulative, index) => (
                <li
                  key={index}
                  className="digital-projection__bar"
                  data-state={
                    cumulative < result.implementationCost ? "unpaid" : "paid"
                  }
                  style={
                    {
                      "--bar": `${String(
                        result.twelveMonthTotal > 0
                          ? Math.max(2, (cumulative / result.twelveMonthTotal) * 100)
                          : 2,
                      )}%`,
                    } as CSSProperties
                  }
                />
              ))}
            </ol>
            <div className="digital-print-hide mt-3 flex items-center justify-between text-[12px] text-brand-ink-faint">
              <span>{copy.firstMonth}</span>
              <span>{copy.lastMonth}</span>
            </div>
          </section>
        </div>
      </div>

      <div className="border-t border-brand-border pt-8">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-ink-faint">
          {copy.recommendedTitle}
        </h3>
        <p className="mt-4 max-w-[70ch] text-[15px] leading-relaxed text-brand-ink-soft">
          {copy.recommended[industry].join(" · ")}
        </p>
      </div>

      <div>
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
          <span className="digital-print-hide">
            <CtaLink
              link={{ label: copy.bookSession, href: bookHref, target: null }}
              variant="solid"
            />
          </span>
          {/* Not a PDF. `window.print()` with a print stylesheet produces a
              document every browser can already save as one, works offline,
              needs no dependency and no server, and prints correctly from a
              phone. What it costs is control over the page furniture, which is
              why the report renders its own inputs summary below. */}
          <button
            type="button"
            onClick={print}
            className="digital-print-hide group inline-flex min-h-[44px] items-center gap-2 text-[14px] font-medium text-brand-ink-soft transition-colors hover:text-brand-ink"
          >
            {copy.downloadReport}
            <span
              aria-hidden="true"
              className="digital-arrow transition-transform duration-300 group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </button>
        </div>

        <p className="mt-8 max-w-[62ch] text-[12px] leading-relaxed text-brand-ink-faint">
          <strong className="font-medium text-brand-ink-soft">
            {copy.disclaimerLead}
          </strong>{" "}
          {copy.disclaimer}
        </p>
      </div>

      {/* Print only. On paper the sliders are gone, so the assumptions behind
          the figures have to be restated or the report is unreadable a week
          later. */}
      <div className="digital-print-only" aria-hidden="true">
        <h3>{copy.reportInputsTitle}</h3>
        <dl>
          <Fact label={copy.industry} value={copy.industries[industry]} />
          <Fact label={copy.size} value={copy.sizes[size]} />
          <Fact label={copy.team} value={formatCount(result.input.team)} />
          <Fact label={copy.hours} value={formatCount(result.input.hoursPerWeek)} />
          <Fact label={copy.hourlyCost} value={`$${formatCount(result.input.hourlyCost)}`} />
          <Fact
            label={copy.currentAutomation}
            value={`${formatCount(result.input.currentAutomation)}%`}
          />
        </dl>
        {generatedOn === "" ? null : <p>{copy.reportGeneratedOn(generatedOn)}</p>}
      </div>
    </div>
  );
}

/**
 * Prints the report, and puts the page back afterwards.
 *
 * The isolation is a class on the root element plus a print stylesheet, rather
 * than anything that edits the shared shell: the header and footer belong to
 * five other companies as well, and a print concern is not a reason to reach
 * into them.
 *
 * `afterprint` is the signal to clean up because `window.print()` returns
 * before the dialog closes in Safari. A timeout backs it up, since a browser
 * that never fires the event would otherwise leave the page in report mode.
 */
function usePrintReport(
  setGeneratedOn: (value: string) => void,
  intl: string,
): () => void {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const restore = useCallback(() => {
    document.documentElement.classList.remove("digital-printing");
  }, []);

  useEffect(() => {
    window.addEventListener("afterprint", restore);
    return () => {
      window.removeEventListener("afterprint", restore);
      if (timer.current !== undefined) clearTimeout(timer.current);
      restore();
    };
  }, [restore]);

  return useCallback(() => {
    // Rendered only now, so the server and the first client render agree.
    setGeneratedOn(
      new Intl.DateTimeFormat(intl, { dateStyle: "long" }).format(new Date()),
    );
    document.documentElement.classList.add("digital-printing");
    // One frame, so the print stylesheet applies to a laid-out page.
    requestAnimationFrame(() => {
      window.print();
      timer.current = setTimeout(restore, 1_000);
    });
  }, [intl, restore, setGeneratedOn]);
}

/**
 * A Latin numeral run that keeps its order in both writing directions.
 *
 * Left to itself the bidi algorithm reorders `$204K` and `720x` inside an
 * Arabic line. `dir="ltr"` with `unicode-bidi: isolate` pins the run.
 */
function Numeric({ children }: { readonly children: ReactNode }) {
  return (
    <span dir="ltr" style={{ unicodeBidi: "isolate" }} className="tabular-nums">
      {children}
    </span>
  );
}

/**
 * One label/figure row.
 *
 * The value arrives as children rather than as a string, because only part of
 * it belongs in an LTR isolate: the numeral does, the unit beside it does not.
 */
function Row({
  label,
  children,
  suffix,
}: {
  readonly label: string;
  readonly children: ReactNode;
  readonly suffix?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-brand-border py-3.5 last:border-b-0">
      <dt className="text-[13px] text-brand-ink-soft">{label}</dt>
      <dd className="flex shrink-0 items-baseline gap-1.5">
        <span className="text-[16px] font-semibold">{children}</span>
        {suffix === undefined ? null : (
          <span className="text-[12px] text-brand-ink-faint">{suffix}</span>
        )}
      </dd>
    </div>
  );
}

function Fact({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/**
 * A proportion, drawn.
 *
 * Decorative: the same number is printed beside it as text, so it carries
 * `aria-hidden` rather than a meter role that would announce a second, less
 * precise copy of the figure.
 */
function Meter({ fraction }: { readonly fraction: number }) {
  return (
    <div className="digital-meter mt-4" aria-hidden="true">
      <div
        className="digital-meter__fill"
        style={{
          inlineSize: `${String(Math.max(0, Math.min(100, fraction * 100)))}%`,
        }}
      />
    </div>
  );
}

interface ChoiceProps<Key extends string> {
  readonly id: string;
  readonly label: string;
  readonly value: Key;
  readonly options: readonly Key[];
  readonly labels: Readonly<Record<Key, string>>;
  readonly onChange: (value: Key) => void;
}

function Choice<Key extends string>({
  id,
  label,
  value,
  options,
  labels,
  onChange,
}: ChoiceProps<Key>) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-[13px] text-brand-ink-soft">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value as Key);
        }}
        className="mt-2 min-h-[44px] w-full rounded-xl border border-brand-border bg-brand-deep-card px-4 text-[16px] font-medium text-brand-ink"
      >
        {options.map((key) => (
          <option key={key} value={key}>
            {labels[key]}
          </option>
        ))}
      </select>
    </div>
  );
}

interface SliderProps {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly bounds: { readonly min: number; readonly max: number; readonly step: number };
  readonly value: number;
  readonly display: string;
  readonly valueText: string;
  readonly onChange: (value: number) => void;
}

/**
 * One slider, its label and its live readout.
 *
 * The slider is NOT mirrored for Arabic. A range input is a magnitude axis, not
 * a reading order: browsers already run it right-to-left under `dir="rtl"`, and
 * forcing it back would put the maximum where a reader expects the minimum.
 * This is the "mirror only semantically directional interactions" rule; the
 * numeric readout beside it disambiguates either way.
 */
function Slider({
  id,
  label,
  hint,
  bounds,
  value,
  display,
  valueText,
  onChange,
}: SliderProps) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[13px] leading-snug text-brand-ink-soft">
          {label}
        </label>
        <output
          htmlFor={id}
          className="shrink-0 text-[19px] font-semibold leading-none text-brand-ink"
        >
          <Numeric>{display}</Numeric>
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        value={value}
        aria-describedby={`${id}-hint`}
        aria-valuetext={valueText}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
        className="digital-slider mt-3 h-11 w-full accent-[var(--brand-accent)]"
      />
      <p id={`${id}-hint`} className="-mt-1 text-[12px] leading-snug text-brand-ink-faint">
        {hint}
      </p>
    </div>
  );
}
