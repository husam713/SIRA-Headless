import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { CtaLink } from "@/components/homepage/cta-link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { getBrand } from "@/lib/brand";
import { getContentPage, getIndustryIndex } from "@/lib/content/get-content-page";
import { getSiteDefinition } from "@/lib/host/resolve-site";
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

interface IndustriesPageProps {
  readonly params: Promise<{ readonly siteKey: string }>;
}

async function resolve(params: IndustriesPageProps["params"]) {
  const { siteKey } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null) notFound();

  const [page, industries] = await Promise.all([
    getContentPage(site.key, "/industries/"),
    getIndustryIndex(site.key),
  ]);

  return { site, page, industries };
}

export async function generateMetadata({
  params,
}: IndustriesPageProps): Promise<Metadata> {
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
    ...buildSiteMetadata(discovery, brand, "/industries"),
    title: `${page?.title ?? "Industries"} — ${brand.name}`,
  };
}

export default async function IndustriesPage({ params }: IndustriesPageProps) {
  const { industries } = await resolve(params);

  if (industries.length === 0) notFound();

  return (
    <>
      <section
        className="relative flex min-h-[calc(55svh-var(--layout-header-offset))] items-end"
        aria-labelledby="industries-heading"
      >
        <PageContainer className="digital-reveal pb-12 pt-[clamp(4rem,8vw,7rem)]">
          <SectionEyebrow tone="accent" className="digital-eyebrow">
            Sectors
          </SectionEyebrow>
          <h1
            id="industries-heading"
            className="digital-display mt-7 max-w-[20ch] text-balance text-[clamp(2.5rem,1.2rem+3.4vw,3.375rem)] font-bold leading-[0.98] tracking-[-0.03em]"
          >
            Every sector loses time somewhere different.
          </h1>
          <p className="mt-7 max-w-[48ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
            We start from the bottleneck, not from the software. Below is where
            it usually sits, sector by sector, and what can realistically be
            done about it.
          </p>
        </PageContainer>
      </section>

      <PageContainer className="pb-[clamp(4rem,8vw,7rem)]">
        <ul className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
          {industries.map((industry, index) => (
            <li
              key={industry.databaseId}
              id={industry.slug}
              className="digital-reveal scroll-mt-[calc(var(--layout-header-offset)+2rem)] border-t border-brand-border py-9"
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
                          Where the time goes
                        </dt>
                        <dd className="mt-2 max-w-[46ch] text-sm leading-[1.65] text-brand-ink-soft">
                          {industry.bottleneck}
                        </dd>
                      </div>
                    ) : null}
                    {industry.opportunity !== null ? (
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent">
                          What can be done
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

      <section
        className="border-t border-brand-border"
        aria-labelledby="industries-cta-heading"
      >
        <PageContainer className="digital-reveal flex min-h-[45svh] flex-col items-center justify-center gap-8 py-[clamp(4rem,8vw,7rem)] text-center">
          <h2
            id="industries-cta-heading"
            className="digital-display max-w-[20ch] text-balance text-[clamp(2.25rem,1.5rem+3.6vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.025em]"
          >
            Not listed? The bottleneck is usually the same shape.
          </h2>
          <CtaLink
            link={{ label: "Book an operations review", href: "/contact", target: null }}
            variant="solid"
          />
        </PageContainer>
      </section>
    </>
  );
}
