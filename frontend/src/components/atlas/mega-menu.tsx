"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

// The companies panel under the Group header. The nav entry becomes a button;
// hovering or pressing it opens a strip of company cells — number, name, one
// line, place — each striped in its own colour. Pointer-leave closes it after
// a short grace; Escape, an outside click and a Tab away close it at once.
//
// The cells are the same company records the homepage house shows, passed
// down from the layout, so the menu and the house never disagree.

export interface MegaMenuCompany {
  readonly key: string;
  readonly name: string;
  readonly tagline: string | null;
  readonly place: string | null;
  readonly href: string;
  readonly color: string;
}

interface MegaMenuProps {
  readonly label: string;
  readonly companies: readonly MegaMenuCompany[];
  readonly className: string;
}

export function MegaMenu({ label, companies, className }: MegaMenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const clear = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };
  const openNow = () => {
    clear();
    setOpen(true);
  };
  const closeSoon = () => {
    clear();
    timer.current = window.setTimeout(() => setOpen(false), 220);
  };

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  useEffect(() => clear, []);

  if (companies.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className="contents"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className={`nav-link nav-link--mega ${className}`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => (open ? setOpen(false) : openNow())}
      >
        {label}
        <span aria-hidden="true" className="text-[0.6em]">&#9662;</span>
      </button>

      <div id={`${id}-panel`} className="atlas-mega" data-open={open ? "true" : "false"} aria-hidden={!open}>
        <div className="mx-auto w-full max-w-[var(--layout-container)] px-[var(--layout-gutter)]">
          <div className="atlas-mega__grid">
            {companies.map((company, index) => (
              <a
                key={company.key}
                href={company.href}
                className="atlas-mega__item"
                style={{ "--c": company.color } as CSSProperties}
                tabIndex={open ? 0 : -1}
              >
                <span aria-hidden="true" className="atlas-mega__n">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="atlas-mega__name">{company.name}</span>
                {company.tagline !== null ? (
                  <span className="atlas-mega__tag">{company.tagline}</span>
                ) : null}
                {company.place !== null ? (
                  <span className="atlas-mega__place">{company.place}</span>
                ) : null}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
