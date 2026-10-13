"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface TabItem {
  readonly key: string;
  readonly label: string;
  /** A short second line under the label (optional). */
  readonly meta?: string;
}

interface TabsProps {
  readonly items: readonly TabItem[];
  /** One server-rendered panel per item, in the same order. */
  readonly panels: readonly ReactNode[];
  /** Accessible name of the tab list. */
  readonly label: string;
  readonly className?: string;
}

/**
 * Tabs, per the WAI-ARIA tabs pattern: one tab stop, arrows move between
 * tabs (both axes, so the list can sit beside the panel on wide screens and
 * above it on narrow ones), Home and End jump, selection follows focus.
 * Arrow direction follows the reading direction, so the same keys feel right
 * in Arabic. Every panel is rendered by the server; the inactive ones are
 * `hidden`, which keeps their text in the document for search engines and
 * for readers without JavaScript (the first panel is the default).
 */
export function Tabs({ items, panels, label, className }: TabsProps) {
  const [active, setActive] = useState(0);
  const base = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    const count = items.length;
    const next = ((index % count) + count) % count;
    setActive(next);
    tabs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const forward = ["ArrowDown", rtl ? "ArrowLeft" : "ArrowRight"];
    const backward = ["ArrowUp", rtl ? "ArrowRight" : "ArrowLeft"];

    if (forward.includes(event.key)) select(index + 1);
    else if (backward.includes(event.key)) select(index - 1);
    else if (event.key === "Home") select(0);
    else if (event.key === "End") select(items.length - 1);
    else return;

    event.preventDefault();
  };

  return (
    <div className={`dg-tabs${className === undefined ? "" : ` ${className}`}`}>
      <div className="dg-tabs__list" role="tablist" aria-label={label}>
        {items.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.key}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${item.key}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.key}`}
              tabIndex={selected ? 0 : -1}
              className="dg-tabs__tab"
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <span className="dg-tabs__label">{item.label}</span>
              {item.meta === undefined ? null : <span className="dg-tabs__meta">{item.meta}</span>}
            </button>
          );
        })}
      </div>

      {items.map((item, index) => (
        <div
          key={item.key}
          role="tabpanel"
          id={`${base}-panel-${item.key}`}
          aria-labelledby={`${base}-tab-${item.key}`}
          hidden={index !== active}
          tabIndex={0}
          className="dg-tabs__panel"
        >
          {panels[index]}
        </div>
      ))}
    </div>
  );
}
