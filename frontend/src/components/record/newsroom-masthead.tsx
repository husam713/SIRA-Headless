import Link from "next/link";

import type { DeskFilterOption } from "@/lib/editorial/desk-filters";

interface NewsroomMastheadProps {
  readonly kicker: string;
  readonly issueLine: string | null;
  readonly placesLine: string | null;
}

export function NewsroomMasthead({
  kicker,
  issueLine,
  placesLine,
}: NewsroomMastheadProps) {
  return (
    <header className="newsroom-masthead">
      <div>
        <p className="newsroom-masthead__kicker">{kicker}</p>
        <h1 id="record-heading">Insights</h1>
      </div>
      {issueLine !== null || placesLine !== null ? (
        <p className="newsroom-masthead__meta">
          {issueLine}
          {issueLine !== null && placesLine !== null ? <br /> : null}
          {placesLine}
        </p>
      ) : null}
    </header>
  );
}

interface DeskFiltersProps {
  readonly options: readonly DeskFilterOption[];
  readonly label: string;
}

/** Real links keep an archive filter addressable and accessible. */
export function DeskFilters({ options, label }: DeskFiltersProps) {
  return (
    <nav aria-label={label} className="newsroom-filters">
      <ul>
        {options.map((option) => (
          <li key={option.key}>
            <Link
              href={option.href}
              aria-current={option.isActive ? "page" : undefined}
              className={option.isActive ? "is-active" : undefined}
            >
              {option.label}
              {option.count !== null ? <span>{option.count}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
