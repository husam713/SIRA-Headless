import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import type { HomepageContactSection, HomepageMedia } from "@/lib/homepage/types";

// The invitation every Atlas inner page ends on: a photograph behind a centred
// display line and the two actions. The copy is the tenant's own contact
// chapter from the CMS (the same section the homepage closes on), so an
// editor changes one field and every page follows.

interface ClosingProps {
  readonly section: HomepageContactSection | null;
  readonly image: HomepageMedia | null;
  readonly contactHref: string;
  readonly contactLabel: string;
  /** The second action — the investor pack on Group, absent on a branch. */
  readonly secondary?: { readonly label: string; readonly href: string } | null | undefined;
}

export function Closing({ section, image, contactHref, contactLabel, secondary }: ClosingProps) {
  if (section === null || section.heading === null) return null;

  return (
    <section aria-labelledby="closing-heading" className="atlas-closing">
      {image !== null ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="atlas-closing__bg"
          src={image.sourceUrl}
          alt=""
          width={image.width ?? undefined}
          height={image.height ?? undefined}
          loading="lazy"
          decoding="async"
        />
      ) : null}

      <PageContainer>
        {/* Eyebrow, display line, lead, actions: one after another. The
            stagger group is the body itself, an element rather than the
            container primitive, which carries no data attributes. */}
        <div className="atlas-closing__body" data-stagger>
          {section.eyebrow !== null ? (
            <SectionEyebrow tone="bright" className="reveal justify-center">
              {section.eyebrow}
            </SectionEyebrow>
          ) : null}
          <h2 id="closing-heading" className="atlas-display atlas-display--xl reveal">
            {section.heading}
          </h2>
          {section.description !== null ? (
            <p className="atlas-lead reveal">{section.description}</p>
          ) : null}
          <div className="atlas-closing__actions reveal">
            <Link
              href={contactHref}
              className="press btn-solid inline-flex items-center gap-2 rounded-sm bg-brand-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-on-accent hover:bg-brand-accent-bright"
            >
              {contactLabel}
              <span aria-hidden="true" className="arrow">&rarr;</span>
            </Link>
            {secondary !== null && secondary !== undefined ? (
              <Link
                href={secondary.href}
                className="press inline-flex items-center rounded-sm border border-brand-on-deep/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-on-deep hover:border-brand-on-deep"
              >
                {secondary.label}
              </Link>
            ) : null}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
