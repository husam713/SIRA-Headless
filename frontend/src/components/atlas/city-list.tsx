import type { CSSProperties } from "react";

import type { BrandOffice } from "@/lib/brand";
import { resolveAccentForBusinessUnitSlug } from "@/lib/homepage/business-unit-accent";

// Where the group works: the brand's office locations from the CMS as a
// numbered list — the city, then what happens there. On a deep ground in the
// places chapter, on paper on the contact page. Each number takes the accent
// of the company the office belongs to (the prototype's `--c`), and the
// brand accent where the editor has not said whose office it is.

interface CityListProps {
  readonly offices: readonly BrandOffice[];
  readonly tone?: "deep" | "paper";
  readonly className?: string;
}

export function CityList({ offices, tone = "deep", className }: CityListProps) {
  if (offices.length === 0) return null;

  return (
    <ol
      className={`atlas-cities${tone === "paper" ? " atlas-cities--paper" : ""}${className === undefined ? "" : ` ${className}`}`}
      data-stagger
    >
      {offices.map((office, index) => (
        <li
          key={`${office.name}-${String(index)}`}
          className="atlas-city reveal"
          style={
            {
              "--c": office.unit === null ? undefined : resolveAccentForBusinessUnitSlug(office.unit)?.color,
            } as CSSProperties
          }
        >
          <span aria-hidden="true" className="atlas-city__n">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="atlas-city__name">{office.name}</span>
          {office.address !== null ? (
            <span className="atlas-city__role">{office.address}</span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
