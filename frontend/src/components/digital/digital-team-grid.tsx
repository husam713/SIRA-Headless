import type { CSSProperties } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import type { AboutSectionHeader, TeamMember } from "@/lib/content/digital-about";

// The team.
//
// Measured at 1440: a five-up grid of 128px round portraits under a 48/48
// heading, the whole section 530px tall. It steps 5 -> 3 -> 2 rather than
// collapsing straight to one column, because a person card is narrow and a
// single column of five faces is a very long scroll for very little content.
//
// Names, roles and photographs are business facts about real people. Nothing
// here invents one: a member with no portrait gets a monogram built from their
// own initials rather than a stock face or a grey silhouette, and a member with
// no role simply has no role line.
//
// There is deliberately no per-person link. The reference gives each profile a
// root-level path, which the Phase 1 audit flagged as certain to collide with
// content namespaces, and that template was never captured. A card that links
// nowhere is better than a card that links to a 404.

interface DigitalTeamGridProps {
  readonly header: AboutSectionHeader | null;
  readonly people: readonly TeamMember[];
}

/** Up to two initials, from the parts of a name that are actually letters. */
function monogram(name: string): string {
  const parts = name
    .split(/[\s.]+/u)
    .map((part) => part.trim())
    .filter((part) => /^\p{L}/u.test(part));

  return parts
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? "")
    .join("")
    .toLocaleUpperCase();
}

export function DigitalTeamGrid({ header, people }: DigitalTeamGridProps) {
  if (people.length === 0) return null;

  const headingId = "about-team-heading";

  return (
    <section id="team" aria-labelledby={headingId} className="scroll-mt-28">
      <PageContainer className="py-[clamp(4rem,8vw,6rem)]">
        <div className="digital-reveal">
          {header?.eyebrow != null ? (
            <SectionEyebrow tone="accent" className="digital-eyebrow">
              {header.eyebrow}
            </SectionEyebrow>
          ) : null}
          <h2
            id={headingId}
            className="digital-display mt-6 text-balance text-[clamp(2rem,1.3rem+2.2vw,3rem)] font-bold leading-[1] tracking-[-0.02em]"
          >
            {header?.heading ?? "The team"}
          </h2>
          {header?.standfirst != null ? (
            <p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
              {header.standfirst}
            </p>
          ) : null}
        </div>

        <ul className="mt-[clamp(2.5rem,5vw,4rem)] grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {people.map((person, index) => (
            <li
              key={person.databaseId}
              className="digital-reveal text-center"
              style={
                {
                  "--digital-reveal-offset": `${String(Math.min(index, 4) * 1.5)}%`,
                } as CSSProperties
              }
            >
              <div className="mx-auto grid size-[clamp(5.5rem,10vw,8rem)] place-items-center overflow-hidden rounded-full border border-brand-border bg-brand-ink/[0.04]">
                {person.portrait !== null ? (
                  // A plain <img>: 2C4-B07 media-origin allowlisting is
                  // unresolved, so next/image would need remote patterns this
                  // project has not agreed yet.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.portrait.sourceUrl}
                    alt={person.portrait.altText ?? person.name}
                    width={person.portrait.width ?? undefined}
                    height={person.portrait.height ?? undefined}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="font-display text-[1.5rem] font-bold tracking-[0.02em] text-brand-ink-faint"
                  >
                    {monogram(person.name)}
                  </span>
                )}
              </div>

              <p className="mt-6 text-[0.9375rem] font-bold uppercase leading-[1.35] tracking-[0.02em]">
                {person.name}
              </p>
              {person.role !== null ? (
                <p className="mt-2 text-[0.8125rem] leading-[1.5] text-brand-accent">
                  {person.role}
                </p>
              ) : null}
              {person.summary !== null ? (
                <p className="mt-4 text-[0.8125rem] leading-[1.6] text-brand-ink-soft">
                  {person.summary}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
