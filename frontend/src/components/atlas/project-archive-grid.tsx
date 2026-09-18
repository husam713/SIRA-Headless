"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { ProjectCard, type ProjectCardData } from "@/components/atlas/project-card";

// The archive grid with its company filter. The chips are the companies the
// grid actually contains, in first-seen order; "All" restores the set. The
// filter is presentation over a list that is complete in the HTML, so the
// page reads whole without JavaScript and search engines see every project.
//
// Choosing a chip runs the prototype's choreography: the grid drops out, the
// set changes underneath it, and the cards that remain come back in their new
// order, each a step after the last. The cards never leave the document —
// a filtered-out card is `hidden` — so a card that has already arrived keeps
// its place and its state, and the change reads as a re-deal rather than a
// reload.

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

// How long the grid is off stage before the set changes. Long enough for the
// cards to have faded, short enough that the chip still feels immediate.
const FILTER_MS = 260;

export function ProjectArchiveGrid({
  items,
  filters,
  allLabel,
  exploreLabel,
  filterLabel,
}: ProjectArchiveGridProps) {
  // `chosen` is the chip the reader pressed; `active` is the filter the grid
  // shows. They differ only for the beat the grid is fading.
  const [chosen, setChosen] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const filtering = chosen !== active;

  useEffect(() => {
    if (!filtering) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setActive(chosen), reduced ? 0 : FILTER_MS);
    return () => window.clearTimeout(timer);
  }, [filtering, chosen]);

  // The visible cards are re-numbered from zero so the re-deal starts with
  // the first card on view, not with wherever the surviving cards used to be.
  let position = 0;

  return (
    <>
      {filters.length > 1 ? (
        <div className="atlas-filters" role="group" aria-label={filterLabel}>
          <button
            type="button"
            className="atlas-chip"
            aria-pressed={chosen === null}
            onClick={() => setChosen(null)}
          >
            {allLabel}
          </button>
          {filters.map((filter) => (
            <button
              key={filter.slug}
              type="button"
              className="atlas-chip"
              aria-pressed={chosen === filter.slug}
              style={filter.color !== null ? ({ "--c": filter.color } as CSSProperties) : undefined}
              onClick={() => setChosen(filter.slug)}
            >
              <i aria-hidden="true" />
              {filter.label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className={`atlas-projects atlas-projects--even${filtering ? " is-filtering" : ""}`}
        aria-live="polite"
        data-stagger
      >
        {items.map((item) => {
          const shown = active === null || item.unitSlug === active;
          return (
            <ProjectCard
              key={item.databaseId}
              item={item}
              index={shown ? position++ : 0}
              exploreLabel={exploreLabel}
              hidden={!shown}
            />
          );
        })}
      </div>
    </>
  );
}
