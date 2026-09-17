import type { CSSProperties } from "react";

import type { HeadedEntry } from "@/lib/content/headed-list";

// Numbered cells in a hairline grid: a company's capabilities, the investor
// process. Four across from the desktop step, two on a tablet, one on a phone.

interface CapabilityCellsProps {
  readonly entries: readonly HeadedEntry[];
  readonly accentColor?: string | undefined;
}

export function CapabilityCells({ entries, accentColor }: CapabilityCellsProps) {
  if (entries.length === 0) return null;

  return (
    <div className="atlas-caps">
      {entries.map((entry, index) => (
        <div
          key={`${entry.title}-${String(index)}`}
          className="atlas-cap reveal"
          style={
            {
              "--reveal-offset": `${String(Math.min(index, 3) * 1.5)}%`,
              ...(accentColor !== undefined ? { "--c": accentColor } : {}),
            } as CSSProperties
          }
        >
          <span aria-hidden="true" className="atlas-cap__n">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3>{entry.title}</h3>
          {entry.body !== null ? <p>{entry.body}</p> : null}
        </div>
      ))}
    </div>
  );
}
