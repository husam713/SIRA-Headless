import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { CapabilityCells } from "@/components/atlas/capability-cells";
import { Closing } from "@/components/atlas/closing";
import { InvestorPackDrawer } from "@/components/atlas/investor-pack-drawer";
import { PageHero } from "@/components/atlas/page-hero";
import { CountUp } from "@/components/homepage/count-up";
import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionHead } from "@/components/layout/section-head";
import { splitHighlight } from "@/lib/atlas/highlight";
import { atlasPageMetadata } from "@/lib/atlas/metadata";
import { pageHeroImage, resolveAtlasPage } from "@/lib/atlas/page-context";
import { getBrand, getBrandPreset } from "@/lib/brand";
import { parseHeadedList } from "@/lib/content/headed-list";
import { resolveBusinessUnitAccent } from "@/lib/homepage/business-unit-accent";
import type { HomepageContentItem } from "@/lib/homepage/types";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

// Investor relations (Group only; Atlas direction, owner-approved 2026-09-16).
//
// The invitation on photography with the pack request as the one action; the
// hairline metrics and the leading-rule opportunities from the homepage's
// investor chapter — the same CMS section, so the two never disagree — and
// the process as numbered cells, authored on the page as a run of headings
// and paragraphs. The pack request opens the sheet and travels the existing
// contact pipeline.

const ROUTE = "/investors";
const PAGE_URIS = Object.freeze(["/investors/", "/investor-relations/"]);

interface InvestorsPageProps {
  readonly params: Promise<{ readonly siteKey: string }>;
}

export async function generateMetadata({ params }: InvestorsPageProps): Promise<Metadata> {
  const { site, page, request, homepage } = await resolveAtlasPage(params, PAGE_URIS);
  const [brand, requestHeaders] = await Promise.all([getBrand(site.key), headers()]);
  const discovery = resolveSiteDiscoveryContext(site.key, requestHeaders.get("host") ?? "");
  const investor = homepage?.variant === "group" ? homepage.investor : null;
  const title = page?.intro?.heading ?? investor?.heading ?? page?.title ?? "Investors";
  const description = page?.intro?.standfirst ?? investor?.description ?? null;

  return atlasPageMetadata({
    base: buildSiteMetadata(discovery, brand, ROUTE, { locale: request.locale, path: ROUTE }),
    title,
    description,
    image: pageHeroImage(page),
  });
}

function opportunityHref(item: HomepageContentItem, href: (path: string) => string): string | null {
  // The opportunity's own record has no route; its related project does.
  return item.relatedHref !== null ? href(item.relatedHref) : null;
}

export default async function InvestorsPage({ params }: InvestorsPageProps) {
  const context = await resolveAtlasPage(params, PAGE_URIS);
  const { site, page, chrome, homepage, closing, closingImage, href } = context;

  if (site.key !== "group" || homepage === null || homepage.variant !== "group") notFound();

  const investor = homepage.investor;
  if (investor === null) notFound();

  const groupPreset = getBrandPreset("group");
  const fallbackAccent = Object.freeze({ label: groupPreset.name, color: groupPreset.identity.accent });
  const intro = page?.intro ?? null;
  const heading = splitHighlight(intro?.heading ?? investor.heading ?? page?.title ?? "Investors");
  const steps = parseHeadedList(page?.html ?? null);
  const stepsHeading = splitHighlight(intro?.ctaHeading ?? "");
  const investments = investor.investments.status === "ready" ? investor.investments.items : [];

  const packTrigger = (className: string) => (
    <InvestorPackDrawer
      chrome={chrome}
      eyebrow={investor.eyebrow ?? "Investor relations"}
      trigger={
        <>
          {chrome.requestPack} <span aria-hidden="true">&rarr;</span>
        </>
      }
      triggerClassName={className}
    />
  );

  return (
    <>
      <PageHero
        headingId="investors-heading"
        heading={heading.text}
        highlight={heading.highlight}
        eyebrow={intro?.eyebrow ?? investor.eyebrow}
        lead={intro?.standfirst ?? investor.description}
        image={pageHeroImage(page) ?? closingImage}
        size="short"
        actions={packTrigger(
          "press inline-flex items-center gap-2 rounded-sm bg-brand-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-on-accent hover:bg-brand-accent-bright",
        )}
      />

      <Section labelledBy="investors-heading" tone="deep">
        <PageContainer className="atlas-on-deep">
          {investor.metrics.length > 0 ? (
            <div className="atlas-metrics">
              {investor.metrics.map((metric, index) => (
                <div
                  key={index}
                  className="atlas-metric reveal"
                  style={{ "--reveal-offset": `${String(index * 1.5)}%` } as CSSProperties}
                >
                  {metric.value !== null ? (
                    <CountUp value={metric.value} className="atlas-metric__value" />
                  ) : null}
                  {metric.label !== null ? (
                    <span className="atlas-metric__label">{metric.label}</span>
                  ) : null}
                  {metric.supportingText !== null ? (
                    <span className="atlas-metric__note">
                      <span aria-hidden="true">&#9650; </span>
                      {metric.supportingText}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {investments.length > 0 ? (
            <div className="atlas-opps">
              {investments.map((item) => {
                const accent = resolveBusinessUnitAccent(item.businessUnit, fallbackAccent);
                const target = opportunityHref(item, href);
                const body = (
                  <>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: accent.color }}>
                      {accent.label}
                    </p>
                    <h3 className="font-display text-2xl font-normal leading-tight text-brand-paper">
                      {item.title}
                    </h3>
                    {item.excerpt !== null ? (
                      <p className="text-[0.95rem] leading-relaxed text-brand-paper/70">{item.excerpt}</p>
                    ) : null}
                    {item.ticketSizeLabel !== null ? (
                      <div className="atlas-opp__ticket">
                        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-paper/50">
                          {chrome.ticketSize}
                        </span>
                        <span className="font-display text-xl text-brand-paper">{item.ticketSizeLabel}</span>
                      </div>
                    ) : null}
                  </>
                );
                const style = { "--c": accent.color } as CSSProperties;

                return target === null ? (
                  <div key={item.databaseId} className="atlas-opp reveal" style={style}>
                    {body}
                  </div>
                ) : (
                  <Link key={item.databaseId} href={target} className="atlas-opp reveal" style={style}>
                    {body}
                  </Link>
                );
              })}
            </div>
          ) : null}

          <div className="mt-12 flex flex-wrap items-center gap-4">
            {packTrigger(
              "press inline-flex items-center gap-2 rounded-sm bg-brand-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-on-accent hover:bg-brand-accent-bright",
            )}
            <Link
              href={href("/projects")}
              className="press inline-flex items-center rounded-sm border border-brand-on-deep/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-on-deep hover:border-brand-on-deep"
            >
              {chrome.allProjects}
            </Link>
          </div>
        </PageContainer>
      </Section>

      {steps.length > 0 ? (
        <Section labelledBy="investors-process-heading" className="bg-brand-paper">
          <PageContainer>
            <SectionHead
              id="investors-process-heading"
              eyebrow={intro?.ctaLabel ?? "How it works"}
              heading={stepsHeading.text === "" ? page?.title ?? null : stepsHeading.text}
            />
            <CapabilityCells entries={steps} />
          </PageContainer>
        </Section>
      ) : null}

      <Closing
        section={closing}
        image={closingImage}
        contactHref={href("/contact")}
        contactLabel={chrome.startConversation}
        secondary={{ label: chrome.allProjects, href: href("/projects") }}
      />
    </>
  );
}
