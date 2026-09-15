import type { CSSProperties } from "react";

import { PageContainer } from "@/components/layout/page-container";
import type { AboutStat } from "@/lib/content/digital-about";

// The figures band.
//
// Measured at 1440: four columns inside a 1160px track, 184.8px tall, divided
// by hairlines rather than sat in cards. The audit named this one of the two
// structures on the reference worth reusing, and the reason is that it costs one
// fifth of a screen to say four things a reader would otherwise have to take on
// trust from a paragraph.
//
// The figure is set in the display face at a size nothing else on the page uses,
// and the label is the eyebrow token. That pairing — one very large thing and
// one very small thing, with nothing in between — is what makes a stat band read
// as designed rather than as a table.
//
// Column count is driven by the data, not fixed at four: three figures make
// three equal columns rather than four with a hole in it.

interface DigitalStatBandProps {
  readonly stats: readonly AboutStat[];
}

export function DigitalStatBand({ stats }: DigitalStatBandProps) {
  if (stats.length === 0) return null;

  return (
    <section aria-label="By the numbers" className="border-b border-brand-border">
      <PageContainer className="py-[clamp(2.5rem,5vw,4rem)]">
        <dl
          className="digital-stat-band grid gap-x-8 gap-y-10"
          style={{ "--digital-stat-columns": stats.length } as CSSProperties}
        >
          {stats.map((stat, index) => (
            <div
              key={`${stat.value}-${stat.label ?? String(index)}`}
              className="digital-reveal digital-stat-band__cell"
              // The same stagger the rest of the tenant uses: the range start
              // moves rather than a delay being added, because a scroll-driven
              // animation has no wall-clock delay to add.
              style={
                {
                  "--digital-reveal-offset": `${String(Math.min(index, 3) * 2)}%`,
                } as CSSProperties
              }
            >
              <dt className="sr-only">{stat.label ?? stat.value}</dt>
              <dd>
                <p className="font-display text-[clamp(2.5rem,1.6rem+2.6vw,3.75rem)] font-bold leading-[0.95] tracking-[-0.03em] tabular-nums">
                  {stat.value}
                </p>
                {stat.label !== null ? (
                  <p className="digital-eyebrow mt-4 text-[11px] font-bold uppercase leading-[1.5] tracking-[0.18em] text-brand-ink-faint">
                    {stat.label}
                  </p>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      </PageContainer>
    </section>
  );
}
