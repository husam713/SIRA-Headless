import Link from "next/link";
import type { CSSProperties } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import type { DigitalCapability } from "@/lib/homepage/types";

// The capability rail (ADR-033).
//
// A numbered editorial rail, not a card grid. The distinction is the whole
// point: cards put a box around each item and equalise them, which is right for
// a directory and wrong for a capability list, where the reader is comparing
// depth rather than picking one. Columns separated by a hairline rule and led
// by a large muted index read as a contents page, and a contents page invites
// reading down.
//
// Column counts are measured, not guessed. The Phase 1 audit found the
// reference rail going one column, then two at 720px, then five at 1160px —
// custom breakpoints rather than framework defaults, because five 220px columns
// need about 1160px before they stop being cramped. Ours takes the same three
// steps for the same reason, capped at four so a column keeps a readable
// measure at our container width.

interface DigitalCapabilitiesProps {
  readonly eyebrow: string | null;
  readonly capabilities: readonly DigitalCapability[];
}

/** Two digits, because "1." beside "10." makes a ragged column. */
function indexLabel(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function DigitalCapabilities({
  eyebrow,
  capabilities,
}: DigitalCapabilitiesProps) {
  if (capabilities.length === 0) return null;

  return (
    <Section
      id="capabilities"
      labelledBy={eyebrow !== null ? "digital-capabilities-heading" : undefined}
      label={eyebrow === null ? "Capabilities" : undefined}
    >
      <PageContainer>
        {eyebrow !== null ? (
          <SectionEyebrow
            as="h2"
            id="digital-capabilities-heading"
            tone="faint"
            className="digital-eyebrow"
          >
            {eyebrow}
          </SectionEyebrow>
        ) : null}

        <ul className="mt-12 grid grid-cols-1 gap-x-0 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((capability, index) => (
            <li
              key={`${capability.title ?? "capability"}-${String(index)}`}
              className="digital-rail__item digital-reveal relative"
              // The stagger. A scroll-driven animation has no wall-clock delay,
              // so siblings are separated by starting their range slightly
              // later instead. Capped so the last column in a wide row is not
              // still waiting when the reader has already read it.
              style={
                {
                  "--digital-reveal-offset": `${String(Math.min(index, 5) * 2)}%`,
                } as CSSProperties
              }
            >
              {/* The rule is the column separator, so it belongs on the inline
                  start edge and must flip in Arabic — `border-s` is logical and
                  does that on its own. It is dropped on the first column of
                  each row rather than drawn and hidden, because a hairline at
                  the container edge reads as a stray mark. */}
              <div className="border-brand-border ps-0 sm:border-s sm:ps-7 sm:[&:nth-child(2n+1)]:border-s-0 sm:[&:nth-child(2n+1)]:ps-0 xl:[&:nth-child(2n+1)]:border-s xl:[&:nth-child(2n+1)]:ps-7 xl:[&:nth-child(4n+1)]:border-s-0 xl:[&:nth-child(4n+1)]:ps-0">
                <p
                  aria-hidden="true"
                  className="font-display text-[2rem] leading-none text-brand-ink-faint"
                >
                  {indexLabel(index)}
                </p>

                {capability.title !== null ? (
                  <h3 className="digital-rail__title mt-6 text-[1.75rem] font-bold leading-[1.07] tracking-[-0.02em]">
                    {capability.title}
                  </h3>
                ) : null}

                {capability.summary !== null ? (
                  <p className="mt-4 text-sm leading-[1.65] text-brand-ink-soft">
                    {capability.summary}
                  </p>
                ) : null}

                {capability.link !== null ? (
                  <p className="mt-7">
                    <CapabilityLink
                      href={capability.link.href}
                      target={capability.link.target}
                      label={capability.link.label ?? capability.title}
                    />
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </PageContainer>
    </Section>
  );
}

interface CapabilityLinkProps {
  readonly href: string;
  readonly target: "_blank" | null;
  readonly label: string | null;
}

function CapabilityLink({ href, target, label }: CapabilityLinkProps) {
  // The arrow is the affordance — this rail carries no underlines — so it is
  // decorative and the link needs a real accessible name. Falling back to the
  // href would announce a URL, so a link with no label and no title is not
  // rendered by the caller.
  const content = (
    <>
      <span>{label}</span>
      <span aria-hidden="true" className="digital-rail__arrow">
        →
      </span>
    </>
  );
  const className =
    "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink-faint";

  if (label === null) return null;

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      target={target ?? undefined}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
    >
      {content}
    </a>
  );
}
