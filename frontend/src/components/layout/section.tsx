import type { ReactNode } from "react";

import { joinClasses } from "@/components/layout/page-container";

// One section rhythm instead of the four competing scales the homepage grew
// (py-20 sm:py-28 lg:py-36, py-24 sm:py-32 lg:py-40, py-16 sm:py-20, flat
// py-20). --space-section matches the dominant 5/7/9rem scale, so adopting
// this is not a visual change for the sections that already used it.
//
// scroll-margin-block-start comes with it: the header is `sticky top-0`, and
// the anchor ids added for the WordPress nav previously landed their headings
// underneath it.

export type SectionTone = "paper" | "deep" | "accent" | "none";
export type SectionSpace = "default" | "tight" | "flush";

const TONE_CLASS: Readonly<Record<SectionTone, string>> = Object.freeze({
  none: "",
  paper: "bg-brand-paper text-brand-ink",
  deep: "bg-brand-deep text-brand-paper",
  accent: "bg-brand-accent text-brand-on-accent",
});

const SPACE_CLASS: Readonly<Record<SectionSpace, string>> = Object.freeze({
  default: "section",
  tight: "section section--tight",
  flush: "section section--flush",
});

interface SectionProps {
  readonly children: ReactNode;
  readonly id?: string;
  readonly tone?: SectionTone;
  readonly space?: SectionSpace;
  // Prefer labelledBy; fall back to label only when there is no rendered heading.
  readonly labelledBy?: string;
  readonly label?: string;
  readonly className?: string;
}

export function Section({
  children,
  id,
  tone = "none",
  space = "default",
  labelledBy,
  label,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      aria-label={labelledBy === undefined ? label : undefined}
      className={joinClasses(SPACE_CLASS[space], TONE_CLASS[tone], className)}
    >
      {children}
    </section>
  );
}
