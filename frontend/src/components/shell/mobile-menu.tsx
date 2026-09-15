"use client";

import { useEffect, useRef, useState } from "react";
import { CHROME } from "@/lib/i18n/locale";
import type { NavigationItem } from "@/lib/navigation";
import type { LocaleCode } from "@/types/site";

interface GroupCrossLink {
  readonly label: string;
  readonly href: string;
}

interface LanguageAlternate {
  readonly locale: LocaleCode;
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
  readonly locale: LocaleCode;
  readonly languageAlternate: LanguageAlternate | null;
}

export function MobileMenu({
  items,
  groupLink,
  locale,
  languageAlternate,
}: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const chrome = CHROME[locale];

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

  // The language switch is desktop-only in the header, so below lg it exists
  // only here. That makes this panel load-bearing for Arabic on a phone, which
  // is why it renders even when there is no menu to show.
  if (items.length === 0 && groupLink === null && languageAlternate === null) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        aria-label={chrome.openMenu}
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
        aria-label={chrome.siteMenu}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-brand-ink/50"
      >
        <div className="ms-auto flex h-dvh w-[min(85vw,22rem)] flex-col gap-1 bg-brand-deep p-6 text-brand-on-deep">
          <button
            type="button"
            aria-label={chrome.closeMenu}
            onClick={() => dialogRef.current?.close()}
            className="self-end text-3xl leading-none text-brand-on-deep/80"
          >
            &times;
          </button>

          {items.length > 0 ? (
            <nav aria-label={chrome.siteNav} className="mt-6 flex flex-col">
              {items.map((item) => (
                <a
                  key={item.databaseId}
                  href={item.href}
                  target={item.target ?? undefined}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  onClick={() => dialogRef.current?.close()}
                  className="border-b border-brand-on-deep/15 py-4 text-lg font-medium uppercase tracking-wide text-brand-on-deep/90"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}

          {languageAlternate !== null ? (
            <a
              href={languageAlternate.href}
              lang={languageAlternate.locale}
              hrefLang={languageAlternate.locale}
              dir={languageAlternate.locale === "ar" ? "rtl" : "ltr"}
              onClick={() => dialogRef.current?.close()}
              className="mt-6 inline-flex min-h-11 items-center self-start border-b border-brand-on-deep/15 text-lg font-medium text-brand-on-deep/90"
            >
              {chrome.switchLanguage}
            </a>
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
