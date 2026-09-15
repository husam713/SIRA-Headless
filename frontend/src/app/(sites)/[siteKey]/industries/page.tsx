import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { PageClosingCta } from "@/components/content/page-closing-cta";
import { PageIntroHeader } from "@/components/content/page-intro-header";
import { PageContainer } from "@/components/layout/page-container";
import { getBrand } from "@/lib/brand";
import {
  getIndustryIndexForLocale,
  neutralSlug,
} from "@/lib/content/get-content-page";
import { resolveContentRoute } from "@/lib/content/route-context";
import { CHROME, localeHref } from "@/lib/i18n/locale";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

// Industries.
//
// The audit's warning about this page was specific: an industries page that
// restates the services page under sector headings teaches nobody anything and
// exists only to add routes. It earns its place by answering a question the
// services page cannot — what does the work actually look like in THIS sector —
// and the flow strip is how it answers that in one glance.
//
// The strip is derived from the sector's real workflow rather than from a
// second field, so the card and the page it opens cannot drift apart after an
// edit. It shows the first four steps: enough to show a shape, few enough to
// stay on one or two lines at every width.
//
// The whole card is the link. A separate "read more" would put a second tab
// stop on every card and give a screen reader twelve links called the same
// thing.

const ROUTE = "/industries";

interface IndustriesPageProps {
  readonly params: Promise<{ readonly siteKey: string }>;
}

async function resolve(params: IndustriesPageProps["params"]) {
  const context = await resolveContentRoute(params, `${ROUTE}/`);
  const industries = await getIndustryIndexForLocale(
    context.site.key,
    context.request.locale,
  );

  return { ...context, industries };
}

export async function generateMetadata({
  params,
}: IndustriesPageProps): Promise<Metadata> {
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
    title: `${page?.title ?? "Industries"} — ${brand.name}`,
  };
}

export default async function IndustriesPage({ params }: IndustriesPageProps) {
  const { industries, page, site, request } = await resolve(params);

  if (industries.length === 0) notFound();

  const chrome = CHROME[request.locale];

  return (
    <>
      <PageIntroHeader
        page={page}
        headingId="industries-heading"
        fallbackEyebrow="Sectors"
        fallbackHeading="Automation, shaped around your industry."
        fallbackStandfirst="We design systems around the workflows, teams and constraints that are specific to your sector — starting from where the time actually goes."
      />

      <PageContainer className="pb-[clamp(4rem,8vw,7rem)]">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry, index) => {
            const slug = neutralSlug(industry.slug);
            const flow = industry.flow.slice(0, 4);

            return (
              <li
                key={industry.databaseId}
                id={slug}
                className="digital-reveal scroll-mt-8"
                style={
                  {
                    "--digital-reveal-offset": `${String(Math.min(index, 5) * 1.5)}%`,
                  } as CSSProperties
                }
              >
                <Link
                  href={localeHref(site, request.locale, `${ROUTE}/${slug}`)}
                  className="digital-sector flex h-full flex-col rounded-2xl border border-brand-border bg-brand-ink/[0.02] p-6"
                >
                  {industry.eyebrow !== null ? (
                    <span className="digital-eyebrow text-[11px] font-bold uppercase leading-[1.4] tracking-[0.18em] text-brand-accent">
                      {industry.eyebrow}
                    </span>
                  ) : null}

                  <h2 className="mt-4 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.015em]">
                    {industry.name}
                  </h2>

                  {industry.standfirst !== null ? (
                    <p className="digital-sector__summary mt-3 text-[0.9375rem] leading-[1.6] text-brand-ink-soft">
                      {industry.standfirst}
                    </p>
                  ) : null}

                  {/* The flow strip. `aria-hidden` because the sector page it
                      opens carries the same steps as a real ordered list with
                      their descriptions — repeating four fragments here would
                      make a screen reader read the process twice, badly. */}
                  {flow.length > 0 ? (
                    <p
                      aria-hidden="true"
                      className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-7 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-brand-ink-faint"
                    >
                      {flow.map((step, position) => (
                        <span key={step} className="inline-flex items-center gap-2">
                          {position > 0 ? (
                            <span className="digital-sector__chevron text-brand-accent">
                              &#8594;
                            </span>
                          ) : null}
                          {step}
                        </span>
                      ))}
                    </p>
                  ) : null}

                  {/* The pipe-encoded pair, kept for a tenant that has not been
                      re-authored onto the sector fields. It renders only when
                      there is no flow to show, so a migrated sector does not
                      print its narrative twice. */}
                  {flow.length === 0 &&
                  (industry.bottleneck !== null || industry.opportunity !== null) ? (
                    <dl className="mt-auto grid gap-4 pt-7">
                      {industry.bottleneck !== null ? (
                        <div>
                          <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
                            {chrome.bottleneckLabel}
                          </dt>
                          <dd className="mt-2 text-sm leading-[1.65] text-brand-ink-soft">
                            {industry.bottleneck}
                          </dd>
                        </div>
                      ) : null}
                      {industry.opportunity !== null ? (
                        <div>
                          <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent">
                            {chrome.opportunityLabel}
                          </dt>
                          <dd className="mt-2 text-sm leading-[1.65] text-brand-ink-soft">
                            {industry.opportunity}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </PageContainer>

      <PageClosingCta
        page={page}
        headingId="industries-cta-heading"
        fallbackHeading="Have a workflow worth automating?"
        fallbackLabel="Book a free consultation"
        site={site}
        locale={request.locale}
      />
    </>
  );
}
