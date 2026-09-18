import type { ReactNode } from "react";

import { joinClasses } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";

interface SectionHeadProps {
  readonly id?: string | undefined;
  readonly eyebrow: string;
  readonly heading: string | null;
  readonly lead?: string | null | undefined;
  readonly tone?: "accent" | "bright" | "faint";
  readonly size?: "l" | "m";
  readonly action?: ReactNode;
  readonly className?: string;
}

/**
 * The chapter opening every Atlas section shares: eyebrow over the display
 * line on the left, the lead (or the section's action) on the right, bottoms
 * aligned. One shape, so the six homepages read as one document and a new
 * section cannot invent a fourth heading scale.
 *
 * The heading is the CMS's own string. It is not split or italicised here;
 * the hero is the one place a highlight phrase is an editorial field.
 */
export function SectionHead({
  id,
  eyebrow,
  heading,
  lead,
  tone = "accent",
  size = "l",
  action,
  className,
}: SectionHeadProps) {
  return (
    <div className={joinClasses("atlas-head", className)}>
      <div>
        <SectionEyebrow tone={tone}>{eyebrow}</SectionEyebrow>
        {heading !== null ? (
          <h2 id={id} className={`atlas-display atlas-display--${size} atlas-head__title`}>
            {heading}
          </h2>
        ) : null}
      </div>
      {lead !== undefined && lead !== null ? (
        <p className="atlas-lead">{lead}</p>
      ) : action !== undefined ? (
        <div className="lg:justify-self-end lg:pb-2">{action}</div>
      ) : null}
    </div>
  );
}
