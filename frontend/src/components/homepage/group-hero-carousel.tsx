"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { HeroCtaLink } from "@/components/homepage/hero-cta-link";
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

interface GroupHeroCarouselProps {
  readonly slides: readonly PreparedGroupHeroSlide[];
  /** The server-rendered heading/description/CTA block, positioned inside this carousel's grid. */
  readonly children: ReactNode;
}

const AUTOPLAY_INTERVAL_MS = 6500;

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
      className="absolute inset-0 block transition-opacity duration-1000"
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

export function GroupHeroCarousel({ slides, children }: GroupHeroCarouselProps) {
  const canRotate = slides.length > 1;
  const [activeIndex, setActiveIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotionPreference,
    readReducedMotionPreference,
    readReducedMotionPreferenceOnServer,
  );
  const showAutoplayControls = canRotate && !prefersReducedMotion;
  const isPlaying = showAutoplayControls && !userPaused;

  useEffect(() => {
    if (!isPlaying) return undefined;

    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
    // Re-arming on activeIndex intentionally restarts the countdown whenever
    // the active slide changes, including manual chapter selection below.
  }, [isPlaying, slides.length, activeIndex]);

  const activeSlide = slides[activeIndex];

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

      <div className="relative z-[2] mx-auto grid w-full max-w-[82.5rem] gap-10 px-6 pb-16 pt-32 sm:pb-20 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pb-24">
        <div className="lg:col-span-8">{children}</div>

        {canRotate ? (
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="flex items-baseline gap-3 border-b border-brand-paper/20 pb-4">
              <span
                className="font-display text-4xl leading-none transition-colors duration-700 sm:text-5xl"
                style={{ color: activeSlide?.accentColor }}
              >
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-xs font-semibold text-brand-paper/60">
                / {String(slides.length).padStart(2, "0")}
              </span>
              {showAutoplayControls ? (
                <button
                  type="button"
                  onClick={() => setUserPaused((paused) => !paused)}
                  aria-pressed={isPlaying}
                  className="ms-auto rounded-full border border-brand-paper/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-paper/80 transition-colors hover:border-brand-paper hover:text-brand-paper"
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
              ) : null}
            </div>

            <div role="group" aria-label="Featured ventures" className="flex flex-col">
              {slides.map((slide, index) => {
                const isActive = index === activeIndex;

                return (
                  <div key={slide.key} className="border-b border-brand-paper/10 py-4">
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-current={isActive ? "true" : undefined}
                      className="flex w-full flex-col items-start gap-1 text-start transition-opacity duration-500"
                      style={{ opacity: isActive ? 1 : 0.55 }}
                    >
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.12em]"
                        style={{ color: slide.accentColor }}
                      >
                        {slide.tag}
                      </span>
                      <span className="font-display text-base font-medium sm:text-lg">
                        {slide.title}
                      </span>
                      {slide.location !== null ? (
                        <span className="text-xs text-brand-paper/60">{slide.location}</span>
                      ) : null}
                    </button>

                    {isActive && slide.cta !== null ? (
                      <div className="mt-2">
                        <HeroCtaLink link={slide.cta} variant="ghost" accentColor={slide.accentColor} />
                      </div>
                    ) : null}

                    {isActive && isPlaying ? (
                      <div aria-hidden="true" className="mt-3 h-px w-full bg-brand-paper/15">
                        <div
                          key={`${slide.key}-${activeIndex}`}
                          className="h-full bg-brand-paper/60"
                          style={{
                            animation: `hero-progress ${AUTOPLAY_INTERVAL_MS}ms linear forwards`,
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <p aria-live="polite" className="sr-only">
        {activeSlide !== undefined && canRotate
          ? `Showing ${activeIndex + 1} of ${slides.length}: ${activeSlide.title ?? activeSlide.tag}`
          : ""}
      </p>
    </>
  );
}
