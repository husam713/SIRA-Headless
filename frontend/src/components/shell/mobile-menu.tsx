"use client";

import { useEffect, useRef, useState } from "react";
import { CHROME } from "@/lib/i18n/locale";
import type { NavigationItem } from "@/lib/navigation";
import { NavLink } from "@/components/shell/nav-link";
import { isCurrentPath } from "@/lib/navigation/current-path";
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
  /** The locale-stripped path being read — see SiteHeader. */
  readonly currentPath: string;
}

export function MobileMenu({
  items,
  groupLink,
  locale,
  languageAlternate,
  currentPath,
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
        className="press flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center gap-[5px] rounded-md border border-brand-border hover:border-brand-ink lg:hidden"
      >
        <span aria-hidden="true" className="block h-px w-5 bg-brand-ink" />
        <span aria-hidden="true" className="block h-px w-5 bg-brand-ink" />
        <span aria-hidden="true" className="block h-px w-5 bg-brand-ink" />
      </button>

      {/*
        Native <dialog> gives modal focus-trapping, Escape-to-close, and a
        ::backdrop for free (showModal()/close() below) — no custom focus
        management or keydown handling needed. The open/close transition is
        CSS too: `site-menu` in globals.css uses @starting-style and
        transition-behavior: allow-discrete, so this component never waits
        on an animation before calling close().
      */}
      <dialog
        id="site-mobile-menu"
        ref={dialogRef}
        aria-label={chrome.siteMenu}
        className="site-menu fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-brand-ink/50"
      >
        <div className="site-menu__panel ms-auto flex h-dvh w-[min(85vw,22rem)] flex-col gap-1 bg-brand-deep p-6 text-brand-on-deep">
          <button
            type="button"
            aria-label={chrome.closeMenu}
            onClick={() => dialogRef.current?.close()}
            // 44px target, and the same colour transition as every other
            // control; -me-2 keeps the glyph on the panel's text edge.
            className="press -me-2 flex h-11 w-11 items-center justify-center self-end rounded-md text-3xl leading-none text-brand-on-deep/80 hover:text-brand-on-deep"
          >
            &times;
          </button>

          {items.length > 0 ? (
            <nav aria-label={chrome.siteNav} className="mt-6 flex flex-col">
              {items.map((item) => (
                <NavLink
                  key={item.databaseId}
                  href={item.href}
                  target={item.target}
                  onClick={() => dialogRef.current?.close()}
                  current={isCurrentPath(item.href, currentPath)}
                  className="site-menu__link border-b border-brand-on-deep/15 py-4 text-lg font-medium uppercase tracking-wide text-brand-on-deep/90"
                >
                  {item.label}
                </NavLink>
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
              className="mt-6 inline-flex min-h-11 items-center self-start border-b border-brand-on-deep/15 text-lg font-medium text-brand-on-deep/90 transition-colors hover:text-brand-on-deep"
            >
              {chrome.switchLanguage}
            </a>
          ) : null}

          {groupLink !== null ? (
            <a
              href={groupLink.href}
              onClick={() => dialogRef.current?.close()}
              className="mt-auto inline-flex min-h-11 items-center pt-6 text-sm font-semibold uppercase tracking-[0.06em] text-brand-accent-bright transition-colors hover:text-brand-on-deep"
            >
              {groupLink.label}
            </a>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
