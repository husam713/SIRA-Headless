"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface CountUpProps {
  readonly value: string;
  readonly className?: string;
  readonly children?: ReactNode;
}

const DURATION_MS = 1400;

/**
 * A figure that counts to its value as it scrolls into view.
 *
 * The value is the CMS's own string ("$120M+", "14–18%", "30K+"): only the
 * first run of digits is animated and the rest of the string is kept verbatim,
 * so nothing an editor wrote is reformatted. The final text is what the server
 * rendered; the animation is a from-state, and a browser that never runs it —
 * or a reader who asked for reduced motion — sees the finished number at once.
 */
export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (element === null) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if (document.documentElement.dataset["motion"] !== "cinematic") return undefined;

    const match = /^([^\d]*)(\d[\d,]*)(.*)$/u.exec(value);
    if (match === null) return undefined;

    const [, prefix = "", digits = "0", suffix = ""] = match;
    const target = Number(digits.replace(/,/gu, ""));
    if (!Number.isFinite(target)) return undefined;

    const grouped = digits.includes(",");
    let frame = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();

        const startedAt = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / DURATION_MS);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(target * eased);
          element.textContent =
            prefix + (grouped ? current.toLocaleString("en-US") : String(current)) + suffix;
          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          } else {
            element.textContent = value;
          }
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={className} data-count>
      {value}
    </span>
  );
}
