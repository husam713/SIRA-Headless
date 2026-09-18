"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { CtaLink } from "@/components/homepage/cta-link";
import { GridItem, PageGrid } from "@/components/layout/page-grid";
import type { HomepageLink, HomepageMedia } from "@/lib/homepage/types";

export interface PreparedGroupHeroSlide {
  readonly key: string;
  readonly title: string | null;
  readonly tag: string;
  readonly location: string | null;
  readonly accentColor: string;
  readonly image: HomepageMedia | null;
  readonly mobileImage: HomepageMedia | null;
  readonly imageAlt: string | null;
  readonly cta: HomepageLink | null;
}

export interface GroupHeroCarouselLabels {
  readonly featuredProjects: string;
  readonly previousProject: string;
  readonly nextProject: string;
  readonly pause: string;
  readonly play: string;
  readonly featuredVentures: string;
  readonly showingSlide: string;
}

interface GroupHeroCarouselProps {
  readonly slides: readonly PreparedGroupHeroSlide[];
  /** The carousel's own chrome, in the page's language (see CHROME). */
  readonly labels: GroupHeroCarouselLabels;
  /** The server-rendered heading/description/CTA block, positioned inside this carousel's grid. */
  readonly children: ReactNode;
}

// The prototype's dwell: seven seconds a slide, which is also how long the
// index bar takes to fill (`--dwell`).
const AUTOPLAY_INTERVAL_MS = 7000;
// How long the slide's origin line is off stage during a change: it drops out
// while the next photograph is already crossfading in, then returns with the
// new slide's words. Zero under reduced motion.
const SWAP_MS = 340;

interface HeroSlideImageProps {
  readonly slide: PreparedGroupHeroSlide;
  readonly isActive: boolean;
  readonly priority: boolean;
}

function HeroSlideImage({ slide, isActive, priority }: HeroSlideImageProps) {
  if (slide.image === null) {
    return (
      <div
        className="absolute inset-0 bg-brand-deep transition-opacity duration-1000"
        style={{ opacity: isActive ? 1 : 0 }}
      />
    );
  }

  return (
    <picture
      className={`hero-media absolute inset-0 block transition-opacity duration-1000${
        isActive ? " hero-media--active" : ""
      }`}
      style={{ opacity: isActive ? 1 : 0 }}
    >
      {slide.mobileImage !== null ? (
        <source media="(max-width: 767px)" srcSet={slide.mobileImage.sourceUrl} />
      ) : null}
      {/* WPGraphQL media origin allowlisting (2C4-B07) is unresolved, so a plain <img> is
          used here rather than next/image, which would require configuring remote patterns. */}
      <img
        src={slide.image.sourceUrl}
        alt={slide.imageAlt ?? ""}
        width={slide.image.width ?? undefined}
        height={slide.image.height ?? undefined}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
        className="h-full w-full object-cover"
      />
    </picture>
  );
}

function subscribeToReducedMotionPreference(onChange: () => void): () => void {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function readReducedMotionPreference(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readReducedMotionPreferenceOnServer(): boolean {
  return false;
}

export function GroupHeroCarousel({ slides, labels, children }: GroupHeroCarouselProps) {
  const canRotate = slides.length > 1;
  const [activeIndex, setActiveIndex] = useState(0);
  // The slide whose words are on stage. It follows `activeIndex` after the
  // swap: the photograph changes first, the copy a beat later.
  const [copyIndex, setCopyIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  // The pointer resting on the selector holds the rotation — and the dwell
  // bar with it — the way the prototype's index does.
  const [hovering, setHovering] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotionPreference,
    readReducedMotionPreference,
    readReducedMotionPreferenceOnServer,
  );
  const showAutoplayControls = canRotate && !prefersReducedMotion;
  const isPlaying = showAutoplayControls && !userPaused;
  const isPaused = !isPlaying || hovering;
  // The beat between the photograph changing and the words following it.
  const swapping = activeIndex !== copyIndex;

  useEffect(() => {
    if (isPaused) return undefined;

    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
    // Re-arming on activeIndex intentionally restarts the countdown whenever
    // the active slide changes, including manual chapter selection below.
  }, [isPaused, slides.length, activeIndex]);

  useEffect(() => {
    if (!swapping) return undefined;

    const timer = window.setTimeout(
      () => setCopyIndex(activeIndex),
      prefersReducedMotion ? 0 : SWAP_MS,
    );
    return () => window.clearTimeout(timer);
  }, [swapping, activeIndex, prefersReducedMotion]);

  const activeSlide = slides[activeIndex];
  const copySlide = slides[copyIndex];

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <HeroSlideImage
            key={slide.key}
            slide={slide}
            isActive={index === activeIndex}
            priority={index === 0}
          />
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, var(--brand-hero-overlay-top) 0%, var(--brand-hero-overlay-middle) 45%, var(--brand-hero-overlay-bottom) 100%)",
        }}
      />
      {/* Second scrim along the leading edge, under the headline and copy. A
          vertical gradient alone cannot protect text set over a bright subject
          on one side of a daylight photograph. */}
      <div
        aria-hidden="true"
        className="hero-scrim-lead pointer-events-none absolute inset-0 z-[1]"
      />

      <PageGrid className="relative z-[2] items-stretch gap-y-8 pb-12 pt-24 lg:gap-y-10 lg:pb-20 lg:pt-28">
        <GridItem span={7} spanMd={8} className="flex flex-col justify-center">
          {/*
            The active slide's origin, above the headline — the reference opens
            on "SIRA LIFESTYLE · COMING SOON". It lives in the client component
            because it changes with the slide, while the headline beneath it is
            server-rendered and constant.
          */}
          {copySlide !== undefined ? (
            <p
              className={`atlas-hero__tag mb-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.14em]${
                swapping ? " is-swapping" : ""
              }`}
              style={{ color: copySlide.accentColor }}
            >
              <span aria-hidden="true" className="h-px w-8 shrink-0 bg-current" />
              <span>{copySlide.tag}</span>
              {copySlide.location !== null ? (
                <>
                  <span aria-hidden="true" className="opacity-60">
                    &middot;
                  </span>
                  <span className="text-brand-paper/75">{copySlide.location}</span>
                </>
              ) : null}
            </p>
          ) : null}
          {children}
        </GridItem>

        {canRotate ? (
          <GridItem
            span={4}
            start={9}
            spanMd={8}
            // Below the desktop step the selector sits under the headline
            // rather than beside it, so it lays its rows out horizontally and
            // costs one band instead of three. Stacked, it added ~300px to the
            // hero at 1024 against the reference.
            className="flex flex-col justify-between gap-6 lg:gap-10"
          >
            {/* Slide index, held at the top of its column as the reference does
                rather than sitting immediately above the selector. */}
            <div className="flex items-baseline gap-3">
              <span
                className="font-display text-[clamp(2.5rem,4vw,4rem)] leading-none transition-colors duration-700"
                style={{ color: activeSlide?.accentColor }}
              >
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-semibold text-brand-paper/60">
                / {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            {/*
              The selector needs its own surface. Over a photograph the rows
              were unreadable without one, and the reference gives it a panel
              rather than floating the text on the image.
            */}
            <div
              className={`border border-brand-paper/15 bg-brand-deep/70 p-5 backdrop-blur-sm${
                isPaused ? " is-paused" : ""
              }`}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-paper/60">
                  {labels.featuredProjects}
                </span>
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((i) => (i - 1 + slides.length) % slides.length)
                    }
                    aria-label={labels.previousProject}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-paper/30 text-brand-paper/80 transition-colors hover:border-brand-paper hover:text-brand-paper"
                  >
                    <span aria-hidden="true">&larr;</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((i) => (i + 1) % slides.length)}
                    aria-label={labels.nextProject}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-paper/30 text-brand-paper/80 transition-colors hover:border-brand-paper hover:text-brand-paper"
                  >
                    <span aria-hidden="true">&rarr;</span>
                  </button>
                  {showAutoplayControls ? (
                    <button
                      type="button"
                      onClick={() => setUserPaused((paused) => !paused)}
                      aria-pressed={isPlaying}
                      className="ms-1 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-paper/70 transition-colors hover:text-brand-paper"
                    >
                      {isPlaying ? labels.pause : labels.play}
                    </button>
                  ) : null}
                </span>
              </div>

              <div
                role="group"
                aria-label={labels.featuredVentures}
                className="grid grid-cols-1 gap-1 sm:grid-cols-3 lg:grid-cols-1"
              >
              {slides.map((slide, index) => {
                const isActive = index === activeIndex;

                return (
                  <div
                    key={slide.key}
                    // Active row: accent rule on the leading edge and a faint
                    // tint, the same "mark, don't box" grammar the rest of the
                    // site uses.
                    className="border-s-2 transition-colors duration-300"
                    style={{
                      borderInlineStartColor: isActive
                        ? slide.accentColor
                        : "transparent",
                      backgroundColor: isActive
                        ? "color-mix(in oklab, var(--brand-paper) 10%, transparent)"
                        : "transparent",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-current={isActive ? "true" : undefined}
                      className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-start transition-opacity duration-500"
                      style={{ opacity: isActive ? 1 : 0.6 }}
                    >
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.12em]"
                        style={{ color: slide.accentColor }}
                      >
                        {slide.tag}
                      </span>
                      <span className="font-display text-[0.9375rem] font-medium text-brand-paper">
                        {slide.title}
                      </span>
                      {slide.location !== null ? (
                        <span className="text-[11px] text-brand-paper/55">
                          {slide.location}
                        </span>
                      ) : null}
                    </button>

                    {isActive && slide.cta !== null ? (
                      <div className="mt-2">
                        <CtaLink link={slide.cta} variant="ghost-dark" accentColor={slide.accentColor} />
                      </div>
                    ) : null}

                    {isActive && showAutoplayControls ? (
                      <div aria-hidden="true" className="mt-3 h-px w-full bg-brand-paper/15">
                        <div
                          key={`${slide.key}-${activeIndex}`}
                          className="atlas-hero__bar h-full bg-brand-paper/60"
                          style={{ "--dwell": `${AUTOPLAY_INTERVAL_MS}ms` } as CSSProperties}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
              </div>
            </div>
          </GridItem>
        ) : null}
      </PageGrid>

      <p aria-live="polite" className="sr-only">
        {activeSlide !== undefined && canRotate
          ? labels.showingSlide
              .replace("{index}", String(activeIndex + 1))
              .replace("{count}", String(slides.length))
              .replace("{title}", activeSlide.title ?? activeSlide.tag)
          : ""}
      </p>
    </>
  );
}
