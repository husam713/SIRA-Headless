import type { ReactNode } from "react";

import { joinClasses } from "@/components/layout/page-container";

// The design reference marks every section eyebrow with a short leading rule —
// hero, overview, projects and contact alike. Only BranchHero drew one: five
// other sections repeated the same eyebrow typography without it, so the mark
// read as a hero flourish rather than the section signal it is.
//
// The tone picks which token carries the rule and the text. `accent` is the
// default on paper; `bright` is for the deep/dark sections, where the standard
// accent does not hold contrast.

type EyebrowTone = "accent" | "bright" | "faint";

const TONE_CLASSES: Readonly<Record<EyebrowTone, string>> = Object.freeze({
  accent: "text-brand-accent",
  bright: "text-brand-accent-bright",
  // Several sections have always carried the quieter ink tone. Converting them
  // to the shared eyebrow must not silently repaint them.
  faint: "text-brand-ink-faint",
});

interface SectionEyebrowProps {
  readonly children: ReactNode;
  readonly tone?: EyebrowTone;
  // Some sections use their eyebrow as the section's accessible name, wired
  // through aria-labelledby, so it has to stay a heading and keep its id.
  // Rendering those as a <p> would drop both the heading outline and the name.
  readonly as?: "p" | "h2";
  readonly id?: string;
  readonly className?: string;
}

export function SectionEyebrow({
  children,
  tone = "accent",
  as: Element = "p",
  id,
  className,
}: SectionEyebrowProps) {
  return (
    <Element
      id={id}
      className={joinClasses(
        "flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em]",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {/* Decorative: the eyebrow text already names the section. */}
      <span aria-hidden="true" className="h-px w-8 shrink-0 bg-current" />
      {children}
    </Element>
  );
}
