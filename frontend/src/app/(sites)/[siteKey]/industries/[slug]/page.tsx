import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { DigitalWorkflow } from "@/components/digital";
import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { getBrand } from "@/lib/brand";
import { CtaLink } from "@/components/homepage/cta-link";
import { getIndustryDetail, recordLocale } from "@/lib/content/get-content-page";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { CHROME, localeHref } from "@/lib/i18n/locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

// One sector.
//
// The index says which sectors we work in; this says what we actually know
// about one of them. The audit's warning applies here more than anywhere on the
// site: a sector page that restates the services page under a different
// heading teaches nobody anything. So this page carries four things the
// services page cannot — the shape of the process, one measured figure where
// there is an honest one, what specifically gets built, and what it is built
// with — and nothing else.
//
// Arabic records live under the same slug with the `ar-` prefix, so the route
// resolves the localized slug first and falls back to the default one. That
// keeps `/ar/industries/healthcare` and `/industries/healthcare` on the same
// sector rather than 404ing the translation.

interface IndustryPageProps {
  readonly params: Promise<{
    readonly siteKey: string;
    readonly slug: string;
  }>;
}

async function resolve(params: IndustryPageProps["params"]) {
  const { siteKey, slug } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null) notFound();

  const request = await getRequestLocale(site);
  // The Arabic record carries the prefixed slug. Asking for it first and
  // falling back means a sector translated into Arabic serves Arabic, and one
  // that is not yet translated still serves the page rather than a 404.
  const localized =
    request.locale === "ar"
      ? await getIndustryDetail(site.key, `ar-${slug}`)
      : null;
  const industry = localized ?? (await getIndustryDetail(site.key, slug));

  return { site, request, slug, industry };
}

export async function generateMetadata({
  params,
}: IndustryPageProps): Promise<Metadata> {
  const { site, slug, industry, request } = await resolve(params);

  if (industry === null) return {};

  const [brand, requestHeaders] = await Promise.all([
    getBrand(site.key),
    headers(),
  ]);
  const discovery = resolveSiteDiscoveryContext(
    site.key,
    requestHeaders.get("host") ?? "",
  );
  const path = `/industries/${slug}`;

  return {
    ...buildSiteMetadata(discovery, brand, path, {
      locale: request.locale,
      path,
    }),
    title: `${industry.name} — ${brand.name}`,
    ...(industry.standfirst === null
      ? {}
      : { description: industry.standfirst }),
  };
}

export default async function IndustryPage({ params }: IndustryPageProps) {
  const { industry, site, request } = await resolve(params);

  if (industry === null) notFound();

  const chrome = CHROME[request.locale];
  const headingId = "industry-heading";
  // The record decides the direction of its own text. A sector translated into
  // Arabic must not be served inside an English document language, or the type
  // rules that neutralise tracking and casing for Arabic never apply to it.
  const contentLocale = recordLocale(industry);

  return (
    <article
      {...(contentLocale === request.locale ? {} : { lang: contentLocale })}
    >
      <PageContainer className="digital-reveal pb-4 pt-[clamp(2.5rem,5vw,4rem)]">
        <Link
          href={localeHref(site, request.locale, "/industries")}
          className="digital-back inline-flex items-center gap-2 text-sm font-medium text-brand-ink-faint"
        >
          {/* Mirrored by the stylesheet under RTL rather than by swapping the
              character here: one arrow, one rule, no second string to keep in
              step with the first. */}
          <span aria-hidden="true" className="digital-back__arrow">
            &#8592;
          </span>
          {chrome.allIndustries}
        </Link>

        <header className="mt-10">
          {industry.eyebrow !== null ? (
            <SectionEyebrow tone="accent" className="digital-eyebrow">
              {industry.eyebrow}
            </SectionEyebrow>
          ) : null}
          <h1
            id={headingId}
            className="digital-display mt-5 max-w-[18ch] text-balance text-[clamp(2.25rem,1.5rem+3vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.025em]"
          >
            {industry.name}
          </h1>
          {industry.standfirst !== null ? (
            <p className="mt-6 max-w-[58ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
              {industry.standfirst}
            </p>
          ) : null}
        </header>
      </PageContainer>

      {industry.workflow.length > 0 ? (
        <PageContainer className="digital-reveal mt-12">
          <DigitalWorkflow
            steps={industry.workflow}
            label={chrome.automationWorkflow}
          />
        </PageContainer>
      ) : null}

      {/* The figure is optional and seven of the twelve sectors publish none.
          An absent figure removes the block rather than showing a dash: a
          placeholder where a number should be reads as a broken page, and an
          invented one would be worse than either. */}
      {industry.stat !== null ? (
        <PageContainer className="digital-reveal mt-14">
          <p className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <span className="font-display text-[clamp(2.5rem,1.6rem+2.6vw,3.75rem)] font-bold leading-none tracking-[-0.03em] tabular-nums text-brand-accent">
              {industry.stat.value}
            </span>
            {industry.stat.label !== null ? (
              <span className="text-[0.9375rem] leading-[1.5] text-brand-ink-soft">
                {industry.stat.label}
              </span>
            ) : null}
          </p>
        </PageContainer>
      ) : null}

      {industry.build.length > 0 || industry.stack.length > 0 ? (
        <PageContainer className="mt-14 grid gap-x-16 gap-y-12 pb-[clamp(3rem,6vw,5rem)] lg:grid-cols-2">
          {industry.build.length > 0 ? (
            <section className="digital-reveal" aria-labelledby="industry-build">
              <h2
                id="industry-build"
                className="text-[1.375rem] font-semibold leading-[1.25] tracking-[-0.015em]"
              >
                {chrome.whatWeBuild}
              </h2>
              <ul className="mt-6 grid gap-3">
                {industry.build.map((item, index) => (
                  <li
                    key={item}
                    className="digital-reveal flex gap-3 text-[0.9375rem] leading-[1.6] text-brand-ink-soft"
                    style={
                      {
                        "--digital-reveal-offset": `${String(Math.min(index, 3) * 1.5)}%`,
                      } as CSSProperties
                    }
                  >
                    <span aria-hidden="true" className="mt-[0.55em] size-1 shrink-0 rounded-full bg-brand-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              {industry.buildNote !== null ? (
                <p className="mt-6 border-t border-brand-border pt-5 text-[0.875rem] leading-[1.6] text-brand-ink-faint">
                  {industry.buildNote}
                </p>
              ) : null}
            </section>
          ) : null}

          {industry.stack.length > 0 ? (
            <section className="digital-reveal" aria-labelledby="industry-stack">
              <h2
                id="industry-stack"
                className="text-[1.375rem] font-semibold leading-[1.25] tracking-[-0.015em]"
              >
                {chrome.typicalStack}
              </h2>
              {/* Chips rather than a list: these are names, not sentences, and
                  a vertical list of four one-word items wastes a column. */}
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {industry.stack.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-full border border-brand-border px-4 py-2 text-[0.8125rem] leading-none text-brand-ink-soft"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </PageContainer>
      ) : null}

      <section
        className="border-t border-brand-border"
        aria-labelledby="industry-cta"
      >
        <PageContainer className="digital-reveal flex min-h-[40svh] flex-col items-center justify-center gap-8 py-[clamp(3rem,6vw,5rem)] text-center">
          <h2
            id="industry-cta"
            className="digital-display max-w-[20ch] text-balance text-[clamp(1.75rem,1.2rem+2.2vw,3rem)] font-bold leading-[1.08] tracking-[-0.025em]"
          >
            {chrome.industryCtaHeading}
          </h2>
          <CtaLink
            link={{
              label: chrome.industryCtaLabel,
              href: localeHref(site, request.locale, "/contact"),
              target: null,
            }}
            variant="solid"
          />
        </PageContainer>
      </section>
    </article>
  );
}
