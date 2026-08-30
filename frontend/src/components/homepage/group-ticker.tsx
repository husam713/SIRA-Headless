import { getBrandPreset } from "@/lib/brand";
import { resolveBusinessUnitAccent } from "@/lib/homepage/business-unit-accent";
import type { HomepageTicker, HomepageTickerItem } from "@/lib/homepage/types";

interface GroupTickerProps {
  readonly ticker: HomepageTicker | null;
}

interface TickerEntry {
  readonly key: number;
  readonly label: string | null;
  readonly link: HomepageTickerItem["link"];
  readonly accentColor: string;
}

/** Decorative marquee copy — spans, not links (see the sr-only list below
 *  for the one real, keyboard/AT-reachable copy of this content). */
function TickerStrip({ entries }: { readonly entries: readonly TickerEntry[] }) {
  return (
    <div aria-hidden="true" className="flex shrink-0">
      {entries.map((entry) => (
        <span
          key={entry.key}
          className="inline-flex items-center gap-2 whitespace-nowrap px-6 text-xs font-semibold uppercase tracking-[0.12em] text-brand-paper/85"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: entry.accentColor }}
          />
          {entry.label}
        </span>
      ))}
    </div>
  );
}

export function GroupTicker({ ticker }: GroupTickerProps) {
  if (ticker === null || !ticker.enabled) return null;

  const groupPreset = getBrandPreset("group");
  const fallbackAccent = Object.freeze({
    label: groupPreset.name,
    color: groupPreset.identity.accent,
  });

  const entries: readonly TickerEntry[] = ticker.items
    .map((item, index) => ({
      key: index,
      label: item.label,
      link: item.link,
      accentColor: resolveBusinessUnitAccent(item.businessUnit, fallbackAccent).color,
    }))
    .filter((entry) => entry.label !== null || entry.link !== null);

  if (entries.length === 0) return null;

  return (
    <div className="overflow-hidden border-t border-brand-paper/15 bg-brand-deep py-3">
      {/*
        The visible strip below duplicates `entries` twice so the CSS
        animation can loop seamlessly (`ticker-marquee` in globals.css,
        which the site-wide prefers-reduced-motion rule already collapses).
        Duplicated + decorative, so both copies are aria-hidden with no
        focusable content — this list is the one real, accessible copy.
      */}
      <ul className="sr-only">
        {entries.map((entry) =>
          entry.link !== null ? (
            <li key={entry.key}>
              <a
                href={entry.link.href}
                target={entry.link.target ?? undefined}
                rel={entry.link.target === "_blank" ? "noopener noreferrer" : undefined}
              >
                {entry.label ?? entry.link.label}
              </a>
            </li>
          ) : (
            <li key={entry.key}>{entry.label}</li>
          ),
        )}
      </ul>
      <div className="ticker-marquee flex w-max animate-[ticker-marquee_32s_linear_infinite]">
        <TickerStrip entries={entries} />
        <TickerStrip entries={entries} />
      </div>
    </div>
  );
}
