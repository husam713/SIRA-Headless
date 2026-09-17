"use client";

import { useEffect, useState } from "react";

// One quotation at a time, set large, turning over every few seconds; a row
// of dots to move between them by hand. Every quote is in the HTML — the
// rotation is presentation over a complete list — and it stands still under
// reduced motion and for a single quote.

export interface RotatingQuote {
  readonly databaseId: number;
  readonly quote: string;
  readonly name: string;
  readonly attribution: string | null;
}

interface QuoteRotatorProps {
  readonly quotes: readonly RotatingQuote[];
  readonly dwellMs?: number;
}

export function QuoteRotator({ quotes, dwellMs = 6500 }: QuoteRotatorProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (quotes.length < 2 || paused) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const timer = window.setTimeout(() => setActive((current) => (current + 1) % quotes.length), dwellMs);
    return () => window.clearTimeout(timer);
  }, [active, paused, quotes.length, dwellMs]);

  if (quotes.length === 0) return null;

  return (
    <div
      className="atlas-quote-rotator"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="atlas-quote-stage" aria-live="polite">
        {quotes.map((quote, index) => (
          <figure
            key={quote.databaseId}
            className={`atlas-quote atlas-quote--stage${index === active ? " is-active" : ""}`}
            aria-hidden={index !== active}
          >
            <blockquote>{quote.quote}</blockquote>
            <figcaption>
              <cite>
                <b>{quote.name}</b>
                {quote.attribution !== null ? <span>{quote.attribution}</span> : null}
              </cite>
            </figcaption>
          </figure>
        ))}
      </div>

      {quotes.length > 1 ? (
        <div className="atlas-quote-nav" role="group" aria-label="Quotations">
          {quotes.map((quote, index) => (
            <button
              key={quote.databaseId}
              type="button"
              aria-current={index === active}
              aria-label={`${String(index + 1)} / ${String(quotes.length)}: ${quote.name}`}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
