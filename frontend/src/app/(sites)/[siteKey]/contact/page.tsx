import type { Metadata } from "next";
import { headers } from "next/headers";

import { ContactForm } from "@/components/homepage/contact-form";
import { ImpactCalculator } from "@/components/digital/impact-calculator";
import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { getBrand } from "@/lib/brand";
import { CALCULATOR_COPY } from "@/lib/calculator/copy";
import { getServiceIndexForLocale } from "@/lib/content/get-content-page";
import { resolveContentRoute } from "@/lib/content/route-context";
import { CONTACT_COPY } from "@/lib/i18n/contact-copy";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

// The conversion surface.
//
// One page, two jobs, in this order: give somebody a reason to believe the
// conversation is worth having, then make starting it trivial. The calculator
// comes second on purpose — a tool above the form turns a contact page into a
// toy, and a form above a reason to fill it in is a form nobody fills in.
//
// The enquiry itself goes nowhere new: the existing SIRA pipeline already
// resolves the tenant from the request host, so a submission from Digital is
// attributed to the Digital tenant, stored privately on the Digital site and
// delivered through the same authenticated transport as every other company's.
// Nothing here needed a second backend.
//
// The enquiry-subject list is the live service index rather than a literal
// array. That way it is the same vocabulary the homepage rail and the services
// page use, in whichever language the reader is in, and it stays correct when
// an editor adds a capability — the old hard-coded list would have gone stale
// the first time somebody published a ninth service, silently.

const ROUTE = "/contact";

interface ContactPageProps {
  readonly params: Promise<{ readonly siteKey: string }>;
}

async function resolve(params: ContactPageProps["params"]) {
  const context = await resolveContentRoute(params, `${ROUTE}/`);
  const services = await getServiceIndexForLocale(
    context.site.key,
    context.request.locale,
  );

  return { ...context, services };
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { site, page, request } = await resolve(params);
  const [brand, requestHeaders] = await Promise.all([
    getBrand(site.key),
    headers(),
  ]);
  const discovery = resolveSiteDiscoveryContext(
    site.key,
    requestHeaders.get("host") ?? "",
  );

  return {
    ...buildSiteMetadata(discovery, brand, ROUTE, {
      locale: request.locale,
      path: ROUTE,
    }),
    title: `${page?.title ?? "Contact"} — ${brand.name}`,
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { site, page, request, services } = await resolve(params);
  const brand = await getBrand(site.key);
  const copy = CONTACT_COPY[request.locale];
  const calculator = CALCULATOR_COPY[request.locale];
  const intro = page?.intro ?? null;

  const subjects = [
    ...services.map((service) => service.title),
    copy.notSureYet,
  ];

  return (
    <>
      <section aria-labelledby="contact-heading">
        {/* The intro track was 940px holding 440px of text, so the page opened
            on an L-shaped hole: dead width beside the headline and dead height
            under the contact details. Three things close it without inventing
            a single business fact — a wider form track, type that uses the
            measure it is given, and details that sit at the foot of the column
            so the space becomes the gap between two blocks rather than the
            leftover under one. */}
        <PageContainer className="digital-reveal grid gap-12 pb-[clamp(3rem,6vw,5rem)] pt-[clamp(4rem,8vw,7rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
          <div className="flex flex-col">
            <SectionEyebrow tone="accent" className="digital-eyebrow">
              {intro?.eyebrow ?? copy.eyebrow}
            </SectionEyebrow>
            <h1
              id="contact-heading"
              className="digital-display mt-7 max-w-[15ch] text-balance text-[clamp(2.5rem,1.1rem+3.9vw,3.75rem)] font-bold leading-[0.98] tracking-[-0.03em]"
            >
              {intro?.heading ?? copy.heading}
            </h1>
            <p className="mt-7 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
              {intro?.standfirst ?? copy.standfirst}
            </p>

            {/* Pushed to the foot of the column at lg, so the details baseline
                with the bottom of the form instead of leaving a hole beneath
                themselves. `mt-12` stays as the floor for the stacked case.

                Two columns only when there are two entries. A tenant with no
                published address gets one entry, and halving the track for it
                wrapped a single line of opening hours in two. */}
            <dl
              className={`mt-12 grid gap-6 lg:mt-auto lg:pt-12 ${
                brand.email !== null ? "sm:grid-cols-2" : ""
              }`}
            >
              {brand.email !== null ? (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
                    {copy.emailLabel}
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={`mailto:${brand.email}`}
                      // The address is Latin in both languages. An isolated LTR
                      // run is what stops the bidi algorithm from reordering it
                      // inside an Arabic block — an email address whose parts
                      // appear in the wrong order is not a cosmetic problem.
                      dir="ltr"
                      className="inline-block text-[1.0625rem] text-brand-ink transition-colors hover:text-brand-accent-bright"
                    >
                      {brand.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
                  {copy.hoursLabel}
                </dt>
                {/* Arabia Standard Time, and a Sunday-to-Thursday week, because
                    that is the working week where this company operates.
                    Specific opening times are deliberately absent: they are a
                    business fact nobody has supplied. */}
                <dd className="mt-2 text-[1.0625rem] text-brand-ink-soft">
                  {copy.hoursValue}
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:pt-2">
            <ContactForm services={subjects} />
          </div>
        </PageContainer>
      </section>

      <section
        className="border-t border-brand-border"
        aria-labelledby="calculator-heading"
      >
        {/* No eyebrow above this heading, unlike every other section on the
            site. The reference opens the calculator on the headline itself, and
            the two uppercase micro-labels inside it — "Your business" and
            "Estimated impact" — already carry that register. A third would make
            three competing labels in one screen. */}
        <PageContainer className="digital-reveal py-[clamp(4rem,8vw,7rem)]">
          <h2
            id="calculator-heading"
            className="digital-display max-w-[20ch] text-balance text-[clamp(1.875rem,1.35rem+2.4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.02em]"
          >
            {calculator.sectionHeading}
          </h2>
          <p className="mt-5 max-w-[56ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
            {calculator.sectionStandfirst}
          </p>

          <div className="mt-12">
            <ImpactCalculator locale={request.locale} bookHref="#contact-heading" />
          </div>
        </PageContainer>
      </section>
    </>
  );
}
