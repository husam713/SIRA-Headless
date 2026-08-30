"use client";

import { useEffect, useRef, useState } from "react";
import type { NavigationItem } from "@/lib/navigation";

interface GroupCrossLink {
  readonly label: string;
  readonly href: string;
}

interface MobileMenuProps {
  /**
   * Top-level items only — this component (and the desktop nav in
   * SiteHeader) does not yet render a dropdown/mega-menu for
   * `item.children`. If an editor assigns a nested menu item it is
   * currently omitted rather than silently flattened; restore this once
   * a submenu treatment is designed.
   */
  readonly items: readonly NavigationItem[];
  readonly groupLink: GroupCrossLink | null;
}

export function MobileMenu({ items, groupLink }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return undefined;

    const handleClose = () => setOpen(false);
    // Native <dialog> click target is the dialog itself only when the click
    // lands on its ::backdrop (a click on a descendant never bubbles here
    // with the dialog as target), so this is a safe click-outside-to-close.
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close();
    };

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleBackdropClick);
    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleBackdropClick);
    };
  }, []);

  if (items.length === 0 && groupLink === null) return null;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        aria-label="Open menu"
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
        className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center gap-[5px] rounded-md border border-brand-border lg:hidden"
      >
        <span aria-hidden="true" className="block h-px w-5 bg-brand-ink" />
        <span aria-hidden="true" className="block h-px w-5 bg-brand-ink" />
        <span aria-hidden="true" className="block h-px w-5 bg-brand-ink" />
      </button>

      {/*
        Native <dialog> gives modal focus-trapping, Escape-to-close, and a
        ::backdrop for free (showModal()/close() below) — no custom focus
        management or keydown handling needed.
      */}
      <dialog
        id="site-mobile-menu"
        ref={dialogRef}
        aria-label="Site menu"
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-brand-ink/50"
      >
        <div className="ms-auto flex h-dvh w-[min(85vw,22rem)] flex-col gap-1 bg-brand-deep p-6 text-brand-paper">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => dialogRef.current?.close()}
            className="self-end text-3xl leading-none text-brand-paper/80"
          >
            &times;
          </button>

          {items.length > 0 ? (
            <nav aria-label="Site" className="mt-6 flex flex-col">
              {items.map((item) => (
                <a
                  key={item.databaseId}
                  href={item.href}
                  target={item.target ?? undefined}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  onClick={() => dialogRef.current?.close()}
                  className="border-b border-brand-paper/15 py-4 text-lg font-medium uppercase tracking-wide text-brand-paper/90"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}

          {groupLink !== null ? (
            <a
              href={groupLink.href}
              onClick={() => dialogRef.current?.close()}
              className="mt-auto pt-6 text-sm font-semibold uppercase tracking-[0.06em] text-brand-accent-bright"
            >
              {groupLink.label}
            </a>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
