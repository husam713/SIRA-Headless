import type { CSSProperties } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import type { AboutProcess } from "@/lib/content/digital-about";

// How we work.
//
// Measured at 1440: a 36/40 heading over a 672px intro, then three equal
// columns 394px tall. The audit named this and the stat band as the two
// structures on the reference worth reusing, and the reason is the same for
// both — it answers a question the reader actually has, in one screen, without
// a diagram.
//
// The stage numeral is decorative and hidden: the ordered list already carries
// the sequence for assistive technology, and reading "zero one" before every
// heading is noise. What the numeral does visually is make three cards read as
// three STEPS rather than as three features.
//
// Columns are driven by the step count, so four stages do not leave a hole and
// two do not stretch to fill three tracks.

interface DigitalProcessProps {
  readonly process: AboutProcess;
}

export function DigitalProcess({ process }: DigitalProcessProps) {
  if (process.steps.length === 0) return null;

  const headingId = "about-process-heading";

  return (
    <section id="process" aria-labelledby={headingId} className="scroll-mt-28">
      <PageContainer className="py-[clamp(4rem,8vw,6rem)]">
        <div className="digital-reveal max-w-[42rem]">
          {process.eyebrow !== null ? (
            <SectionEyebrow tone="accent" className="digital-eyebrow">
              {process.eyebrow}
            </SectionEyebrow>
          ) : null}
          <h2
            id={headingId}
            className="digital-display mt-6 text-balance text-[clamp(1.75rem,1.25rem+1.6vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.025em]"
          >
            {process.heading ?? "How we work"}
          </h2>
          {process.standfirst !== null ? (
            <p className="mt-5 text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
              {process.standfirst}
            </p>
          ) : null}
        </div>

        <ol
          className="digital-process mt-[clamp(2.5rem,5vw,3.5rem)] grid gap-5"
          style={
            {
              "--digital-process-columns": Math.min(process.steps.length, 3),
            } as CSSProperties
          }
        >
          {process.steps.map((step, index) => (
            <li
              key={step.title}
              className="digital-reveal flex h-full flex-col rounded-2xl border border-brand-border bg-brand-ink/[0.02] p-7"
              style={
                {
                  "--digital-reveal-offset": `${String(Math.min(index, 3) * 2)}%`,
                } as CSSProperties
              }
            >
              <span
                aria-hidden="true"
                className="font-display text-[0.75rem] font-bold tabular-nums tracking-[0.2em] text-brand-ink-faint"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-[clamp(1.25rem,1.05rem+0.5vw,1.5rem)] font-semibold leading-[1.25] tracking-[-0.015em] text-brand-accent">
                {step.title}
              </h3>
              {step.body !== null ? (
                <p className="mt-4 text-[0.9375rem] leading-[1.65] text-brand-ink-soft">
                  {step.body}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
