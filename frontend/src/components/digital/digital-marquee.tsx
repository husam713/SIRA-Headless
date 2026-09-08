import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import type { DigitalMarqueeSection } from "@/lib/homepage/types";

// The reach band (ADR-033).
//
// A slow horizontal strip of the sectors or names Digital works across. It is
// ambient: it says "breadth" at a glance and rewards nobody for reading it in
// order, which is why the items are plain text rather than links.
//
// Three things make it acceptable rather than merely fashionable:
//
//   - it pauses on hover AND on focus-within, so ambient motion yields the
//     moment a reader shows intent;
//   - the whole list is present in the DOM once as real text, so a screen
//     reader and a search engine both get the content without the motion;
//   - under prefers-reduced-motion it stops being a strip at all and wraps into
//     a static centred list, which is why the duplicated half is marked and
//     hidden rather than merely halted.
//
// The duplicate is what makes the loop seamless: the track is exactly twice its
// visible width and translates by -50%, so the second copy is mid-strip at the
// instant the animation restarts. It is aria-hidden because it is the same
// content said twice.

interface DigitalMarqueeProps {
  readonly section: DigitalMarqueeSection | null;
}

export function DigitalMarquee({ section }: DigitalMarqueeProps) {
  if (section === null || section.items.length === 0) return null;

  const hasHeading = section.heading !== null;

  return (
    <Section
      tone="deep"
      labelledBy={hasHeading ? "digital-marquee-heading" : undefined}
      label={hasHeading ? undefined : "Sectors we work across"}
    >
      {(section.eyebrow !== null || hasHeading || section.body !== null) && (
        <PageContainer className="digital-reveal text-center">
          {section.eyebrow !== null ? (
            <SectionEyebrow
              tone="bright"
              className="digital-eyebrow justify-center"
            >
              {section.eyebrow}
            </SectionEyebrow>
          ) : null}

          {hasHeading ? (
            <h2
              id="digital-marquee-heading"
              className="digital-display mx-auto mt-6 max-w-[24ch] text-balance text-[clamp(1.875rem,1.35rem+2.4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.02em]"
            >
              {section.heading}
            </h2>
          ) : null}

          {section.body !== null ? (
            <div
              className="mx-auto mt-5 max-w-[60ch] text-base leading-[1.7] text-brand-ink-soft"
              // Rich text from the CMS, normalized upstream by the same
              // sanitizer every other section uses.
              dangerouslySetInnerHTML={{ __html: section.body }}
            />
          ) : null}
        </PageContainer>
      )}

      {/* Full-bleed on purpose: a strip that stops at the container gutter
          reads as a broken table rather than as something passing through. */}
      <div className="digital-marquee mt-14">
        <ul className="digital-marquee__track m-0 list-none p-0">
          {section.items.map((item, index) => (
            <li
              key={`item-${String(index)}`}
              className="digital-marquee__item shrink-0 pe-[clamp(2.5rem,5vw,4.75rem)] text-[1.0625rem] text-brand-ink-soft"
            >
              {item}
            </li>
          ))}
          {section.items.map((item, index) => (
            <li
              key={`duplicate-${String(index)}`}
              data-duplicate="true"
              aria-hidden="true"
              className="digital-marquee__item shrink-0 pe-[clamp(2.5rem,5vw,4.75rem)] text-[1.0625rem] text-brand-ink-soft"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
