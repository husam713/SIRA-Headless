"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// The reveal choreography, ported from the approved Atlas prototype
// (frontend/prototypes/sira-atlas/app.js, "reveal choreography").
//
// One observer for the whole document: anything carrying `data-reveal` or the
// older `.reveal` hook arrives — opacity and a short rise — the first time it
// enters the viewport, and inside a `[data-stagger]` group each child is given
// its place in the sequence (`--d`, 0..8) so a row of cards or figures lands
// one after another. The rules that do the moving are in globals.css under
// "Reveal choreography"; this island only adds the classes.
//
// Two promises this file keeps:
//
//   1. Nothing is ever stuck invisible. The hidden from-state is gated on
//      `html.js.motion`, and those classes are only written here, on mount:
//      a page whose JavaScript never runs, a reader who asked for reduced
//      motion, or a browser without IntersectionObserver simply sees the
//      finished page. An element scrolled past before the observer met it
//      (scroll restoration, a hash link) is shown at once rather than waiting
//      to be scrolled back to, and one whose class attribute React rewrote
//      after it had arrived is shown again immediately.
//
//   2. Every section stays a Server Component. Content added after mount —
//      a client-side route change, a filtered grid, a section that streamed
//      in — is picked up by a mutation observer, so no component has to know
//      this island exists.
//
// It also marks the heroes ready (`is-ready` on `.atlas-hero` and
// `.atlas-page-hero`) a frame after mount, which is what starts the
// entrance: the tag, the headline lines from under their clips, the lead,
// the actions.

const REVEAL_SELECTOR = "[data-reveal], .reveal";
const HERO_SELECTOR = ".atlas-hero, .atlas-page-hero";
const MAX_STAGGER_STEP = 8;

function markReady(root: ParentNode): void {
  for (const hero of root.querySelectorAll<HTMLElement>(HERO_SELECTOR)) {
    hero.classList.add("is-ready");
  }
}

export function RevealChoreography() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("js");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // The tenant may still opt out of entrance motion altogether
    // (`data-motion="quiet"`); no current tenant does, and the reader's own
    // preference is the gate that always wins.
    const wantsMotion = () =>
      !reduced.matches && html.dataset["motion"] !== "quiet" && "IntersectionObserver" in window;

    if (!wantsMotion()) {
      markReady(document);
      return undefined;
    }

    html.classList.add("motion");

    const revealed = new WeakSet<Element>();
    const reveal = (element: Element) => {
      element.classList.add("in");
      revealed.add(element);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Below the fold: wait. In view, or already above it: arrive.
          if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    const scan = (root: ParentNode) => {
      // The place in the sequence is assigned once, by the nearest group —
      // a city list inside a narrative column counts from its own first
      // city, not from wherever the column's copy left off — and an explicit
      // `--d` written by a component (a filtered grid re-numbering its cards)
      // is kept.
      for (const group of root.querySelectorAll<HTMLElement>("[data-stagger]")) {
        let index = 0;
        for (const element of group.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)) {
          if (element.closest("[data-stagger]") !== group) continue;
          if (element.style.getPropertyValue("--d") === "") {
            element.style.setProperty("--d", String(Math.min(index, MAX_STAGGER_STEP)));
          }
          index += 1;
        }
      }

      for (const element of root.querySelectorAll(REVEAL_SELECTOR)) {
        if (revealed.has(element)) {
          if (!element.classList.contains("in")) element.classList.add("in");
          continue;
        }
        observer.observe(element);
      }

      markReady(root);
    };

    // Two frames, not one: the first paints the from-state, the second lets
    // the transition run from it. Same as the prototype.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => scan(document));
    });

    let pending = 0;
    const mutations = new MutationObserver((records) => {
      let rescan = false;
      for (const record of records) {
        if (record.type === "childList") {
          if (record.addedNodes.length > 0) rescan = true;
          continue;
        }
        // A class attribute React rewrote on an element that had already
        // arrived: put it back on stage rather than let it sit at opacity 0.
        const target = record.target as Element;
        if (revealed.has(target) && !target.classList.contains("in")) {
          target.classList.add("in");
        }
      }
      if (!rescan || pending !== 0) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        scan(document);
      });
    });

    mutations.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    // A reader who turns reduced motion on mid-visit gets the finished page;
    // the hidden from-state goes with the class.
    const onPreferenceChange = () => {
      if (reduced.matches) html.classList.remove("motion");
    };
    reduced.addEventListener("change", onPreferenceChange);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(pending);
      observer.disconnect();
      mutations.disconnect();
      reduced.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  // A client-side navigation replaces the page beneath the shell. The mutation
  // observer sees the new nodes; this effect is the belt to its braces, so a
  // route whose content arrived before the observer was listening still gets
  // its heroes marked ready.
  useEffect(() => {
    const frame = requestAnimationFrame(() => markReady(document));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
