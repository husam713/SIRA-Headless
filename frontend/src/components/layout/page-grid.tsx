import type { CSSProperties, ReactNode } from "react";

import { joinClasses } from "@/components/layout/page-container";

// The master grid. Column count is inherited from --layout-grid-columns, which
// steps 4 -> 8 -> 12 at 48rem and 68.75rem (globals.css), so a section never
// re-declares its own track and every section aligns to the same lines.
//
// Spans are expressed against the desktop 12-column grid. Below 48rem every
// item is full width, which is the correct mobile default and matches the
// approved art-direction prototype.

interface PageGridProps {
  readonly children: ReactNode;
  // Inherits the parent grid's tracks instead of starting a new context.
  readonly subgrid?: boolean;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function PageGrid({ children, subgrid = false, className, style }: PageGridProps) {
  return (
    <div
      className={joinClasses(subgrid ? "page-grid--subgrid" : "page-grid", className)}
      style={style}
    >
      {children}
    </div>
  );
}

interface GridItemProps {
  readonly children: ReactNode;
  // Columns at >=68.75rem, against 12. Omit for full width.
  readonly span?: number;
  // Columns at >=48rem, against 8. Defaults to full width.
  readonly spanMd?: number;
  // 1-based grid line to start at, when a deliberate gap is wanted.
  readonly start?: number;
  readonly startMd?: number;
  readonly className?: string;
}

// Custom properties rather than generated classes: Tailwind cannot see values
// computed at runtime, and arbitrary `lg:col-span-[N]` strings would not be
// emitted by the JIT scanner.
type GridItemStyle = CSSProperties & {
  readonly "--grid-item-span"?: number;
  readonly "--grid-item-span-md"?: number;
  readonly "--grid-item-start"?: number;
  readonly "--grid-item-start-md"?: number;
};

export function GridItem({ children, span, spanMd, start, startMd, className }: GridItemProps) {
  const style: GridItemStyle = {
    ...(span === undefined ? {} : { "--grid-item-span": span }),
    ...(spanMd === undefined ? {} : { "--grid-item-span-md": spanMd }),
    ...(start === undefined ? {} : { "--grid-item-start": start }),
    ...(startMd === undefined ? {} : { "--grid-item-start-md": startMd }),
  };

  return (
    <div className={joinClasses("grid-item", className)} style={style}>
      {children}
    </div>
  );
}
