import type { ReactNode } from "react";

import { joinClasses } from "@/components/layout/page-container";

// Editorial copy needs a measure, not a column width. The codebase had nine
// different hand-picked values (32/34/36/40/42rem plus four Tailwind steps)
// while --layout-reading-width sat unused.

interface ProseProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function Prose({ children, className }: ProseProps) {
  return <div className={joinClasses("prose-measure", className)}>{children}</div>;
}
