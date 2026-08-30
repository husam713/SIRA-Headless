import type { CSSProperties, ReactNode } from "react";

import { joinClasses } from "@/components/layout/page-container";

// Card rails size to their own inline space via a container query rather than
// the viewport, which is what lets one card component serve both a wide Group
// section and a narrow Branch column without a second React tree (ADR-028 s6).
//
// Children opt into `grid-template-rows: subgrid`, so every card shares the
// rail's row lines and eyebrows/headings/body align across a row. The previous
// `flex flex-col` + `flex-1` approach only ever aligned the bottom edge.
//
// Each child must therefore emit exactly `rows` top-level elements. Render an
// empty placeholder for an absent part rather than omitting it, or that card's
// remaining parts shift up a row.

type RailStyle = CSSProperties & {
  readonly "--rail-max"?: number;
  readonly "--rail-rows"?: number;
};

interface CardRailProps {
  readonly children: ReactNode;
  // Maximum columns at the widest container step.
  readonly max?: 2 | 3 | 4;
  // Top-level row parts per card.
  readonly rows?: number;
  readonly className?: string;
}

export function CardRail({ children, max = 3, rows = 4, className }: CardRailProps) {
  const style: RailStyle = { "--rail-max": max, "--rail-rows": rows };

  return (
    <div className={joinClasses("rail", className)}>
      <div className="rail__items" style={style}>
        {children}
      </div>
    </div>
  );
}
