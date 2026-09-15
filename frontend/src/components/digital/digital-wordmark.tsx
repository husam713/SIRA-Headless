import { CtaLink } from "@/components/homepage/cta-link";
import type { DigitalWordmarkSection } from "@/lib/homepage/types";

// The kinetic wordmark band (ADR-033).
//
// One brand statement, given more room than anything else on the page. A tall
// track with a sticky stage inside it: the word fills the screen as the band
// arrives and shrinks to a lockup as it leaves, with a supporting line rising
// underneath in the last third.
//
// This is the page's single expensive moment, and it is expensive on purpose.
// The Phase 1 audit measured the reference spending 2.2 screens here while
// every other section stayed under one, and that restraint everywhere else is
// what pays for it. If a second band like this is ever added, this one should
// go.
//
// It costs no JavaScript. The scroll linkage is a CSS view timeline declared on
// the track, so:
//
//   - a browser without scroll-driven animations renders the word at its final
//     size with the lockup visible — a complete, static, readable band;
//   - under prefers-reduced-motion the track loses its 220svh runway entirely
//     and becomes an ordinary block, which shortens the page rather than
//     playing the same page faster;
//   - nothing here is required for comprehension, which is ADR-028's constraint
//     on Layer C.

interface DigitalWordmarkProps {
  readonly section: DigitalWordmarkSection | null;
}

export function DigitalWordmark({ section }: DigitalWordmarkProps) {
  if (section === null || section.word === null) return null;

  return (
    <section
      className="digital-kinetic"
      aria-labelledby="digital-wordmark-heading"
    >
      <div className="digital-kinetic__stage">
        {/* The heading IS the wordmark. Rendering it as a decorative span with
            a separate visually-hidden heading would say the same words twice to
            a screen reader. */}
        <h2
          id="digital-wordmark-heading"
          className="digital-kinetic__word digital-display font-display font-black"
        >
          {section.word}
        </h2>

        {section.lockup !== null || section.link !== null ? (
          <div className="digital-kinetic__lockup flex flex-col items-center gap-5 px-6">
            {section.lockup !== null ? (
              <p className="text-base leading-[1.65] text-brand-ink-soft">
                {section.lockup}
              </p>
            ) : null}
            {section.link !== null ? (
              <CtaLink link={section.link} variant="ghost-dark" />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
