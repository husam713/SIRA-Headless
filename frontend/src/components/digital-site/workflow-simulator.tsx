"use client";

import { useEffect, useId, useState, type ChangeEvent, type CSSProperties } from "react";

import type { DigitalWorkflowContent } from "@/content/digital-site/types";
import { WORKFLOW_DEMO } from "@/content/digital-site/demo/workflow";
import { formatAmount, formatNumber } from "@/lib/digital-site/format";
import {
  approvalCount,
  clampAmount,
  routeRequest,
  type WorkflowCategory,
} from "@/lib/digital-site/workflow";
import type { LocaleCode } from "@/types/site";

interface WorkflowSimulatorProps {
  readonly content: DigitalWorkflowContent;
  readonly locale: LocaleCode;
  /** The visible "illustrative" label, from the narrative's common strings. */
  readonly illustrative: string;
}

const INITIAL = {
  amount: WORKFLOW_DEMO.defaultAmount as number,
  category: "stock" as WorkflowCategory,
  urgent: false,
};

type StepState = "planned" | "done" | "current" | "waiting";

/** A sentence with `{reference}` set as an isolated left-to-right run. */
function WithReference({ text, reference }: { readonly text: string; readonly reference: string }) {
  const [before, after = ""] = text.split("{reference}");
  return (
    <>
      {before}
      <bdi dir="ltr">{reference}</bdi>
      {after}
    </>
  );
}

/**
 * The approval example. Every input changes the route, which comes from the
 * pure rule engine (`lib/digital-site/workflow.ts`); this component renders
 * it, and "Send the request" walks the request through it one step at a
 * time. Motion only answers an action: new steps arrive with a short
 * transition, the run advances on a timer, and under reduced motion the run
 * completes at once. The summary is the only live region, so a screen reader
 * hears the outcome rather than the whole list again.
 */
export function WorkflowSimulator({ content, locale, illustrative }: WorkflowSimulatorProps) {
  const id = useId();
  const [amount, setAmount] = useState<number>(INITIAL.amount);
  const [draft, setDraft] = useState(formatNumber(locale, INITIAL.amount));
  const [category, setCategory] = useState<WorkflowCategory>(INITIAL.category);
  const [urgent, setUrgent] = useState(INITIAL.urgent);
  /** How many steps of the current route are done; null while not running. */
  const [progress, setProgress] = useState<number | null>(null);

  const steps = routeRequest({ amount, category, urgent });
  const approvals = approvalCount(steps);
  const finished = progress !== null && progress >= steps.length;

  useEffect(() => {
    if (progress === null || progress >= steps.length) return;
    const timer = window.setTimeout(() => {
      setProgress((value) => (value === null ? null : value + 1));
    }, WORKFLOW_DEMO.stepMs);
    return () => window.clearTimeout(timer);
  }, [progress, steps.length]);

  const commitAmount = (value: number) => {
    const next = clampAmount(value);
    setAmount(next);
    setDraft(formatNumber(locale, next));
    setProgress(null);
  };

  const onDraft = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft(event.target.value);
    const digits = Number(event.target.value.replace(/[^0-9]/gu, ""));
    if (digits >= WORKFLOW_DEMO.min && digits <= WORKFLOW_DEMO.max) {
      setAmount(digits);
      setProgress(null);
    }
  };

  const run = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setProgress(reduced ? steps.length : 0);
  };

  const reset = () => {
    commitAmount(INITIAL.amount);
    setCategory(INITIAL.category);
    setUrgent(INITIAL.urgent);
    setProgress(null);
  };

  const stateOf = (index: number): StepState => {
    if (progress === null) return "planned";
    if (index < progress) return "done";
    if (index === progress) return "current";
    return "waiting";
  };

  const reasonText = (reason: keyof DigitalWorkflowContent["reasons"], limit: number | null): string =>
    content.reasons[reason].replace("{limit}", limit === null ? "" : formatAmount(locale, limit, content.currency));

  return (
    <div className="dg-sim">
      <div className="dg-sim__controls">
        <div className="dg-record" data-state={finished ? "approved" : "pending"}>
          <div className="dg-record__head">
            <p className="dg-record__type">{content.request.heading}</p>
            <span className={`dg-status dg-status--${finished ? "approved" : "pending"}`}>
              {finished ? content.states.approved : content.states.pending}
            </span>
          </div>
          <p className="dg-record__ref" dir="ltr">
            {WORKFLOW_DEMO.reference}
          </p>
          <p className="dg-record__title">{content.request.item}</p>
          <p className="dg-record__meta">{content.request.requester}</p>
          <p className="dg-record__amount">{formatAmount(locale, amount, content.currency)}</p>
        </div>

        <div className="dg-field">
          <label className="dg-field__label" htmlFor={`${id}-amount`}>
            {content.amountLabel}
          </label>
          <div className="dg-field__amount">
            <input
              id={`${id}-amount`}
              className="dg-input dg-input--amount"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              dir="ltr"
              value={draft}
              onChange={onDraft}
              onBlur={() => commitAmount(Number(draft.replace(/[^0-9]/gu, "")))}
              aria-describedby={`${id}-amount-hint`}
            />
            <span className="dg-field__unit">{content.currency}</span>
          </div>
          <input
            className="dg-range"
            type="range"
            min={WORKFLOW_DEMO.min}
            max={WORKFLOW_DEMO.max}
            step={WORKFLOW_DEMO.step}
            value={amount}
            onChange={(event) => commitAmount(Number(event.target.value))}
            aria-label={content.amountLabel}
            aria-valuetext={formatAmount(locale, amount, content.currency)}
            style={
              {
                "--dg-range-fill": `${((amount - WORKFLOW_DEMO.min) / (WORKFLOW_DEMO.max - WORKFLOW_DEMO.min)) * 100}%`,
              } as CSSProperties
            }
          />
          <p className="dg-field__hint" id={`${id}-amount-hint`}>
            {content.amountHint}
          </p>
          <div className="dg-sim__presets">
            {WORKFLOW_DEMO.presets.map((preset) => (
              <button
                key={preset}
                type="button"
                className="dg-chip"
                aria-pressed={amount === preset}
                onClick={() => commitAmount(preset)}
              >
                {formatAmount(locale, preset, content.currency)}
              </button>
            ))}
          </div>
        </div>

        <fieldset className="dg-field">
          <legend className="dg-field__label">{content.categoryLabel}</legend>
          <div className="dg-segmented">
            {content.categories.map((option) => (
              <label key={option.key} className="dg-segmented__option">
                <input
                  type="radio"
                  name={`${id}-category`}
                  value={option.key}
                  checked={category === option.key}
                  onChange={() => {
                    setCategory(option.key);
                    setProgress(null);
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="dg-field">
          <label className="dg-switch">
            <input
              type="checkbox"
              role="switch"
              checked={urgent}
              onChange={(event) => {
                setUrgent(event.target.checked);
                setProgress(null);
              }}
              aria-describedby={`${id}-urgent-hint`}
            />
            <span className="dg-switch__track" aria-hidden="true" />
            <span className="dg-field__label">{content.urgentLabel}</span>
          </label>
          <p className="dg-field__hint" id={`${id}-urgent-hint`}>
            {content.urgentHint}
          </p>
        </div>
      </div>

      <div className="dg-sim__route">
        <div className="dg-sim__route-head">
          <h3 className="dg-title-s">{content.routeHeading}</h3>
          <p className="dg-sim__summary" role="status">
            {finished ? (
              <WithReference text={content.done} reference={WORKFLOW_DEMO.orderReference} />
            ) : (
              content.routeSummary.replace("{count}", formatNumber(locale, approvals))
            )}
          </p>
        </div>

        <ol className="dg-sim__steps" data-running={progress === null ? undefined : "true"}>
          {steps.map((step, index) => {
            const state = stateOf(index);
            return (
              <li
                key={step.key}
                className="dg-sim__step"
                data-approval={step.approval ? "true" : undefined}
                data-automatic={step.role === "system" ? "true" : undefined}
                data-state={state}
                style={{ "--i": index } as CSSProperties}
              >
                <span className="dg-sim__marker" aria-hidden="true" />
                <div className="dg-sim__body">
                  <p className="dg-sim__role">{content.roles[step.role]}</p>
                  <p className="dg-sim__action">{content.steps[step.key]}</p>
                  <p className="dg-sim__reason">{reasonText(step.reason, step.limit)}</p>
                </div>
                <div className="dg-sim__side">
                  {state === "done" ? (
                    <span className="dg-status dg-status--approved">{content.states.approved}</span>
                  ) : state === "current" ? (
                    <span className="dg-status dg-status--pending">{content.states.pending}</span>
                  ) : null}
                  {step.escalateAfterHours === null ? null : (
                    <p className="dg-sim__sla">
                      {content.escalates} {formatNumber(locale, step.escalateAfterHours)} {content.hours}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="dg-sim__actions">
          <button type="button" className="dg-btn dg-btn--on-night" onClick={run} disabled={progress !== null && !finished}>
            {content.run}
          </button>
          <button type="button" className="dg-btn dg-btn--quiet" onClick={reset}>
            {content.reset}
          </button>
        </div>

        <p className="dg-note">{content.note}</p>
        <p className="dg-illustrative">{illustrative}</p>
      </div>
    </div>
  );
}
