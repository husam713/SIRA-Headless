"use client";

import { useState, type CSSProperties } from "react";

import { ProjectCard, type ProjectCardData } from "@/components/atlas/project-card";

// The archive grid with its company filter. The chips are the companies the
// grid actually contains, in first-seen order; "All" restores the set. The
// filter is presentation over a list that is complete in the HTML, so the
// page reads whole without JavaScript and search engines see every project.

export interface ProjectFilterOption {
  readonly slug: string;
  readonly label: string;
  readonly color: string | null;
}

interface ProjectArchiveGridProps {
  readonly items: readonly ProjectCardData[];
  readonly filters: readonly ProjectFilterOption[];
  readonly allLabel: string;
  readonly exploreLabel: string;
  readonly filterLabel: string;
}

export function ProjectArchiveGrid({
  items,
  filters,
  allLabel,
  exploreLabel,
  filterLabel,
}: ProjectArchiveGridProps) {
  const [active, setActive] = useState<string | null>(null);
  const visible = active === null ? items : items.filter((item) => item.unitSlug === active);

  return (
    <>
      {filters.length > 1 ? (
        <div className="atlas-filters" role="group" aria-label={filterLabel}>
          <button
            type="button"
            className="atlas-chip"
            aria-pressed={active === null}
            onClick={() => setActive(null)}
          >
            {allLabel}
          </button>
          {filters.map((filter) => (
            <button
              key={filter.slug}
              type="button"
              className="atlas-chip"
              aria-pressed={active === filter.slug}
              style={filter.color !== null ? ({ "--c": filter.color } as CSSProperties) : undefined}
              onClick={() => setActive(filter.slug)}
            >
              <i aria-hidden="true" />
              {filter.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="atlas-projects atlas-projects--even" aria-live="polite">
        {visible.map((item, index) => (
          <ProjectCard key={item.databaseId} item={item} index={index} exploreLabel={exploreLabel} />
        ))}
      </div>
    </>
  );
}
