import { PageContainer } from "@/components/layout/page-container";
import type { AboutStatement } from "@/lib/content/digital-about";

// The statement.
//
// Measured at 1440: 388px inside a 1160px track, with an oversized word set
// behind the column at very low contrast and a 30/45 pull-quote at 92% white
// beside it. The ghost word is the one piece of pure decoration on the page and
// it earns its place by giving the section a scale nothing else has.
//
// It is `aria-hidden` and it is not a heading. It repeats a word the section
// already says, so to a screen reader it is noise, and marking it up as an <h2>
// would put a decorative flourish into the document outline.
//
// The social links are a list of circles. Each one is named by its network for
// assistive technology, because a row of identical circles with no accessible
// name is five links called "link".

interface DigitalStatementProps {
  readonly statement: AboutStatement;
}

export function DigitalStatement({ statement }: DigitalStatementProps) {
  const headingId = "about-statement-heading";
  const hasBody = statement.body !== null;

  return (
    <section
      aria-labelledby={statement.quote !== null || hasBody ? headingId : undefined}
      aria-label={statement.quote === null && !hasBody ? "Statement" : undefined}
      className="relative isolate overflow-hidden border-t border-brand-border"
    >
      {statement.ghostWord !== null ? (
        <span
          aria-hidden="true"
          className="digital-ghost-word pointer-events-none absolute -bottom-[0.12em] start-0 select-none font-display font-bold leading-[0.78] tracking-[-0.04em]"
        >
          {statement.ghostWord}
        </span>
      ) : null}

      <PageContainer className="relative py-[clamp(4rem,8vw,7rem)]">
        <div className="digital-reveal ms-auto max-w-[38rem]">
          {/* The section's accessible name. Visually it is the body copy, which
              is genuinely what this section is about — there is no separate
              headline to promote, and inventing one to satisfy the outline
              would put a word on the page the editor never wrote. */}
          {hasBody ? (
            <h2
              id={headingId}
              className="digital-statement__lede text-[clamp(1.25rem,0.95rem+1vw,1.75rem)] font-normal leading-[1.5] tracking-[-0.01em] text-brand-ink"
              dangerouslySetInnerHTML={{ __html: statement.body ?? "" }}
            />
          ) : null}

          {statement.quote !== null ? (
            <figure className="mt-12 border-s-2 border-brand-accent ps-7">
              <blockquote
                {...(hasBody ? {} : { id: headingId })}
                className="text-[clamp(1.125rem,0.9rem+0.8vw,1.5rem)] italic leading-[1.5] text-brand-ink"
              >
                {statement.quote}
              </blockquote>
              {statement.attributionName !== null ||
              statement.attributionRole !== null ? (
                <figcaption className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  {statement.attributionName !== null ? (
                    <span className="text-[0.8125rem] font-bold uppercase tracking-[0.18em]">
                      {statement.attributionName}
                    </span>
                  ) : null}
                  {statement.attributionRole !== null ? (
                    <span className="text-[0.8125rem] leading-[1.5] text-brand-ink-faint">
                      {statement.attributionRole}
                    </span>
                  ) : null}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          {statement.socials.length > 0 ? (
            <ul className="mt-12 flex flex-wrap items-center gap-3">
              {statement.socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    className="digital-social grid size-11 place-items-center rounded-full border border-brand-border text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-brand-ink-faint"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {/* Two letters, not an icon: shipping a sprite of brand
                        marks for networks the owner has not confirmed would be
                        inventing an identity. The full name is the link's
                        accessible name. */}
                    <span aria-hidden="true">
                      {social.network.slice(0, 2).toLocaleUpperCase()}
                    </span>
                    <span className="sr-only">{social.network}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </PageContainer>
    </section>
  );
}
