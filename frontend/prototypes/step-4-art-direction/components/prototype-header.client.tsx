"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import groupLogo from "../../../public/brands/group/logo.png";

const NAVIGATION = Object.freeze([
  { label: "Perspective", href: "#perspective" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Updates", href: "#updates" },
  { label: "RTL study", href: "#rtl-study" },
] as const);

export function PrototypeHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trigger = triggerRef.current;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    const first = focusable?.item(0);
    const last = focusable?.item((focusable.length ?? 1) - 1);
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className="prototype-header">
      <div className="prototype-header__inner">
        <a className="prototype-logo" href="#top" aria-label="SIRA Group home">
          <Image src={groupLogo} alt="SIRA Group" priority sizes="150px" />
        </a>

        <nav className="prototype-nav" aria-label="Prototype navigation">
          {NAVIGATION.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="prototype-header__actions">
          <span className="prototype-status">Local study / 01</span>
          <button
            ref={triggerRef}
            className="menu-trigger"
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen(true)}
          >
            <span className="sr-only">Open navigation</span>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      {open ? (
        <div
          ref={dialogRef}
          className="mobile-menu"
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label="Prototype navigation"
        >
          <div className="mobile-menu__topline">
            <span>SIRA / Navigation</span>
            <button type="button" onClick={closeMenu}>
              <span aria-hidden="true">Close</span>
              <span className="sr-only">Close navigation</span>
            </button>
          </div>
          <nav aria-label="Mobile prototype navigation">
            {NAVIGATION.map((item, index) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <p>
            An institutional editorial publication expressed through
            architectural space.
          </p>
        </div>
      ) : null}
    </header>
  );
}
