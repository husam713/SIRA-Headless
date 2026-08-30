import type { CSSProperties, ReactNode } from "react";

// The single owner of the page content column. Before this existed,
// `max-w-[82.5rem]` was hand-written in 17 places with three different gutter
// spellings, so the shell and the sections drifted apart at >=lg. Width and
// gutter now come from --layout-container / --layout-gutter (globals.css).

export type Bleed = "none" | "edge" | "full";

const BLEED_CLASS: Readonly<Record<Bleed, string>> = Object.freeze({
  none: "",
  edge: "bleed-edge",
  full: "bleed-full",
});

interface PageContainerProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function PageContainer({ children, className, style }: PageContainerProps) {
  return (
    <div className={joinClasses("page-container", className)} style={style}>
      {children}
    </div>
  );
}

// Applies a bleed to a single child inside a container or grid. Kept separate
// from PageContainer so a section can bleed one media block without the whole
// column losing its gutter.
interface BleedProps {
  readonly children: ReactNode;
  readonly bleed: Exclude<Bleed, "none">;
  readonly className?: string;
}

export function Bleed({ children, bleed, className }: BleedProps) {
  return <div className={joinClasses(BLEED_CLASS[bleed], className)}>{children}</div>;
}

export function joinClasses(...values: readonly (string | undefined)[]): string {
  return values.filter((value): value is string => typeof value === "string" && value.length > 0).join(" ");
}
