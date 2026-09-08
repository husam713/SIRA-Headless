import type { Metadata } from "next";
import { headers } from "next/headers";
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
import { CHROME } from "@/lib/i18n/locale";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

// Industries.
//
// The audit's warning about this page was specific: an industries page that
// restates the services page under sector headings teaches nobody anything and
// exists only to add routes. So each entry answers two questions the services
// page cannot — where THIS sector actually loses time, and what could be done
// about it — and says nothing else.
//
// Each card is a bottleneck and an opportunity, side by side. Two columns of
// prose rather than an icon and a promise, because the reader is a person who
// already knows their sector and is checking whether we do.

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
        fallbackHeading="Every sector loses time somewhere different."
        fallbackStandfirst="We start from the bottleneck, not from the software. Below is where it usually sits, sector by sector, and what can realistically be done about it."
      />

      <PageContainer className="pb-[clamp(4rem,8vw,7rem)]">
        <ul className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
          {industries.map((industry, index) => (
            <li
              key={industry.databaseId}
              id={neutralSlug(industry.slug)}
              className="digital-reveal scroll-mt-8 border-t border-brand-border py-9"
              style={
                { "--digital-reveal-offset": `${String(Math.min(index, 5) * 1.5)}%` } as CSSProperties
              }
            >
              <article>
                <h2 className="text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.015em]">
                  {industry.name}
                </h2>
                {industry.summary !== null ? (
                  <p className="mt-3 max-w-[42ch] text-[0.9375rem] leading-[1.6] text-brand-ink-soft">
                    {industry.summary}
                  </p>
                ) : null}

                {industry.bottleneck !== null || industry.opportunity !== null ? (
                  <dl className="mt-7 grid gap-5">
                    {industry.bottleneck !== null ? (
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
                          {chrome.bottleneckLabel}
                        </dt>
                        <dd className="mt-2 max-w-[46ch] text-sm leading-[1.65] text-brand-ink-soft">
                          {industry.bottleneck}
                        </dd>
                      </div>
                    ) : null}
                    {industry.opportunity !== null ? (
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent">
                          {chrome.opportunityLabel}
                        </dt>
                        <dd className="mt-2 max-w-[46ch] text-sm leading-[1.65] text-brand-ink-soft">
                          {industry.opportunity}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      </PageContainer>

      <PageClosingCta
        page={page}
        headingId="industries-cta-heading"
        fallbackHeading="Not listed? The bottleneck is usually the same shape."
        fallbackLabel="Book an operations review"
        site={site}
        locale={request.locale}
      />
    </>
  );
}
