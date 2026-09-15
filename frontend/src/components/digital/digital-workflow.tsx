import type { CSSProperties } from "react";

import type { IndustryStep } from "@/lib/content/get-content-page";

// The automation workflow.
//
// The signature element of the reference's sector pages, and the one piece of
// its design that carries real information rather than atmosphere: it says a
// process has a shape, and that we know the shape before we build for it.
//
// Two layouts, one markup. From md it is a serpentine — cards alternating above
// and below a horizontal rail, with a stub and a dot tying each to it. Below md
// the rail turns vertical and the cards stack, because seven cards across a
// phone is either a horizontal scroller nobody scrolls or seven columns of two
// words each.
//
// It is an <ol>. The order is the whole point, and a list of <div>s would say
// that only to people who can see it.
//
// Direction is never hard-coded. The rail, the stubs and the column order all
// come from grid placement and logical properties, so the flow runs
// right-to-left under `dir="rtl"` without a mirrored stylesheet.

interface DigitalWorkflowProps {
  readonly steps: readonly IndustryStep[];
  readonly label: string;
}

export function DigitalWorkflow({ steps, label }: DigitalWorkflowProps) {
  if (steps.length === 0) return null;

  return (
    <div className="rounded-3xl border border-brand-border bg-brand-ink/[0.02] p-5 sm:p-7 lg:p-9">
      <p className="digital-eyebrow mb-7 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-accent">
        {label}
      </p>

      <ol
        className="digital-workflow"
        style={{ "--wf-steps": steps.length } as CSSProperties}
        aria-label={label}
      >
        {steps.map((step, index) => (
          <li
            key={`${String(index)}-${step.title}`}
            className="digital-workflow__item digital-reveal"
            data-side={index % 2 === 0 ? "start" : "end"}
            style={
              {
                "--wf-index": index,
                // The stagger runs along the flow, so the eye is walked through
                // the process in the order the process happens.
                "--digital-reveal-offset": `${String(Math.min(index, 6) * 1.5)}%`,
              } as CSSProperties
            }
          >
            <span aria-hidden="true" className="digital-workflow__stub" />
            <span aria-hidden="true" className="digital-workflow__dot" />
            <div className="digital-workflow__card">
              <span className="digital-workflow__number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 block text-[0.8125rem] font-semibold leading-snug tracking-tight text-brand-ink">
                {step.title}
              </span>
              {step.detail !== null ? (
                <span className="mt-1.5 block text-[0.6875rem] leading-snug text-brand-ink-soft">
                  {step.detail}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
