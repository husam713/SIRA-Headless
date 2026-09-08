import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { ContactForm } from "@/components/homepage/contact-form";
import { ImpactCalculator } from "@/components/digital/impact-calculator";
import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { getBrand } from "@/lib/brand";
import { getContentPage } from "@/lib/content/get-content-page";
import { getSiteDefinition } from "@/lib/host/resolve-site";
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
// resolves the tenant from the request host, so a submission from
// sirahdigital.sa is attributed to the Digital tenant, stored privately on the
// Digital site and delivered through the same authenticated transport as every
// other company's. Nothing here needed a second backend.

interface ContactPageProps {
  readonly params: Promise<{ readonly siteKey: string }>;
}

async function resolve(params: ContactPageProps["params"]) {
  const { siteKey } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null) notFound();

  const page = await getContentPage(site.key, "/contact/");

  return { site, page };
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { site, page } = await resolve(params);
  const [brand, requestHeaders] = await Promise.all([
    getBrand(site.key),
    headers(),
  ]);
  const discovery = resolveSiteDiscoveryContext(
    site.key,
    requestHeaders.get("host") ?? "",
  );

  return {
    ...buildSiteMetadata(discovery, brand, "/contact"),
    title: `${page?.title ?? "Contact"} — ${brand.name}`,
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { site, page } = await resolve(params);
  const brand = await getBrand(site.key);
  const locale = site.defaultLocale === "ar" ? "ar-SA" : "en-SA";

  return (
    <>
      <section aria-labelledby="contact-heading">
        <PageContainer className="digital-reveal grid gap-12 pb-[clamp(3rem,6vw,5rem)] pt-[clamp(4rem,8vw,7rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div>
            <SectionEyebrow tone="accent" className="digital-eyebrow">
              Start here
            </SectionEyebrow>
            <h1
              id="contact-heading"
              className="digital-display mt-7 max-w-[16ch] text-balance text-[clamp(2.5rem,1.2rem+3.4vw,3.375rem)] font-bold leading-[0.98] tracking-[-0.03em]"
            >
              {page?.title === "Contact" ? "Tell us where the time goes." : (page?.title ?? "Contact")}
            </h1>
            <p className="mt-7 max-w-[46ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
              An operations review is a conversation, not a pitch. Describe the
              process that costs you the most hours and we will tell you
              honestly whether software is the answer.
            </p>

            <dl className="mt-12 grid gap-6 sm:grid-cols-2">
              {brand.email !== null ? (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
                    Email
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={`mailto:${brand.email}`}
                      className="text-[1.0625rem] text-brand-ink transition-colors hover:text-brand-accent-bright"
                    >
                      {brand.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
                  Hours
                </dt>
                {/* Arabia Standard Time, and a Sunday-to-Thursday week, because
                    that is the working week where this company operates.
                    Specific opening times are deliberately absent: they are a
                    business fact nobody has supplied. */}
                <dd className="mt-2 text-[1.0625rem] text-brand-ink-soft">
                  Sunday to Thursday, Arabia Standard Time (UTC+3)
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:pt-2">
            {/* The service list is the same capability vocabulary the rail
                and the calculator use, so an enquiry arrives already labelled
                with something the team recognises. */}
            <ContactForm
              services={[
                "Workflow automation",
                "Document intelligence",
                "Systems integration",
                "Customer operations",
                "Internal platforms",
                "Reporting",
                "Applied AI",
                "Not sure yet",
              ]}
            />
          </div>
        </PageContainer>
      </section>

      <section
        className="border-t border-brand-border"
        aria-labelledby="calculator-heading"
      >
        <PageContainer className="digital-reveal py-[clamp(4rem,8vw,7rem)]">
          <SectionEyebrow tone="faint" className="digital-eyebrow">
            Before you write
          </SectionEyebrow>
          <h2
            id="calculator-heading"
            className="digital-display mt-6 max-w-[20ch] text-balance text-[clamp(1.875rem,1.35rem+2.4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.02em]"
          >
            What would this be worth?
          </h2>
          <p className="mt-5 max-w-[56ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
            A deliberately conservative model. It counts only the fraction of
            released time a business actually converts into avoided cost, caps
            what automation can reach, and shows you every assumption it made.
          </p>

          <div className="mt-12">
            <ImpactCalculator locale={locale} />
          </div>
        </PageContainer>
      </section>
    </>
  );
}
