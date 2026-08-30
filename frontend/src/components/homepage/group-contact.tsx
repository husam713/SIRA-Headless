import type { HomepageContactSection } from "@/lib/homepage/types";

interface GroupContactProps {
  readonly section: HomepageContactSection | null;
  readonly email: string | null;
  readonly address: string | null;
}

/**
 * The submission itself is intentionally NOT wired up: the forms backend/
 * provider decision (2C4-B08) remains unresolved, so every field and the
 * submit control render as an inert visual shell only — same policy as
 * GroupInvestor's request-pack form. Unlike Investor, there's no per-field
 * CMS content to drive field labels here (formVariant/formContext are
 * opaque backend-integration identifiers, not display copy), so the fields
 * are the same fixed set the design reference always showed: name, email,
 * message.
 */
function InertContactForm() {
  return (
    <div className="bg-brand-deep-card p-8 sm:p-10">
      <fieldset disabled className="grid grid-cols-1 gap-6 opacity-70">
        <legend className="sr-only">Contact form (not yet available)</legend>
        <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-paper/60">
          Full Name
          <input
            type="text"
            className="border-0 border-b border-brand-paper/20 bg-transparent py-2 text-sm text-brand-paper"
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-paper/60">
          Email Address
          <input
            type="email"
            className="border-0 border-b border-brand-paper/20 bg-transparent py-2 text-sm text-brand-paper"
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-paper/60">
          Message
          <textarea
            rows={4}
            className="resize-none border-0 border-b border-brand-paper/20 bg-transparent py-2 text-sm text-brand-paper"
          />
        </label>
      </fieldset>

      <button
        type="button"
        disabled
        aria-disabled="true"
        className="mt-8 w-full cursor-not-allowed bg-brand-paper/20 px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-brand-paper opacity-70"
      >
        Send Message
      </button>
      <p className="mt-3 text-xs text-brand-paper/50">
        Online message submission isn&apos;t available yet.
      </p>
    </div>
  );
}

export function GroupContact({ section, email, address }: GroupContactProps) {
  if (section === null) return null;

  const hasHeading = section.heading !== null;
  const hasCopy = section.description !== null;

  if (!hasHeading && !hasCopy && email === null && address === null) {
    return null;
  }

  return (
    <section
      id="contact"
      aria-labelledby={hasHeading ? "contact-heading" : undefined}
      aria-label={hasHeading ? undefined : (section.eyebrow ?? "Get in Touch")}
      className="bg-brand-deep py-20 text-brand-paper sm:py-28 lg:py-36"
    >
      <div className="mx-auto grid w-full max-w-[72.5rem] grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent-bright">
            {section.eyebrow ?? "Get in Touch"}
          </p>
          {hasHeading ? (
            <h2
              id="contact-heading"
              className="mt-4 text-balance font-display text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.05]"
            >
              {section.heading}
            </h2>
          ) : null}
          {hasCopy ? (
            <p className="mt-6 max-w-md text-base leading-relaxed text-brand-paper/75">
              {section.description}
            </p>
          ) : null}

          {email !== null || address !== null ? (
            <div className="mt-8 flex flex-col gap-3">
              {email !== null ? (
                <a
                  href={`mailto:${email}`}
                  className="text-[15px] text-brand-paper transition-colors hover:text-brand-accent-bright"
                >
                  {email}
                </a>
              ) : null}
              {address !== null ? (
                <p className="text-[15px] text-brand-paper/70">{address}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <InertContactForm />
      </div>
    </section>
  );
}
