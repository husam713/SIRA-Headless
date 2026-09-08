import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { CtaLink } from "@/components/homepage/cta-link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { getBrand } from "@/lib/brand";
import { getContentPage, getWorkIndex } from "@/lib/content/get-content-page";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

// What Digital builds.
//
// Deliberately NOT a case-study grid. A case study is a claim about a named
// client, and there are no named clients to make claims about. What there is
// is a set of systems, and what a buyer actually wants to know about a system
// is the same three things every time: what was broken, what was built, and
// how it works. So each entry answers exactly those, in that order.
//
// The layout is a numbered register rather than cards. Cards equalise items and
// invite skimming; a register invites reading down, which is what a page about
// depth needs. It is the same rail idea as the homepage capabilities, at a
// larger scale — one shared pattern rather than two.

interface WorkPageProps {
  readonly params: Promise<{ readonly siteKey: string }>;
}

async function resolve(params: WorkPageProps["params"]) {
  const { siteKey } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null) notFound();

  const [page, work] = await Promise.all([
    getContentPage(site.key, "/work/"),
    getWorkIndex(site.key),
  ]);

  return { site, page, work };
}

export async function generateMetadata({
  params,
}: WorkPageProps): Promise<Metadata> {
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
    ...buildSiteMetadata(discovery, brand, "/work"),
    title: `${page?.title ?? "Work"} — ${brand.name}`,
  };
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { work } = await resolve(params);

  if (work.length === 0) notFound();

  return (
    <>
      <section
        className="relative flex min-h-[calc(60svh-var(--layout-header-offset))] items-end"
        aria-labelledby="work-heading"
      >
        <PageContainer className="digital-reveal pb-12 pt-[clamp(4rem,8vw,7rem)]">
          <SectionEyebrow tone="accent" className="digital-eyebrow">
            What we build
          </SectionEyebrow>
          <h1
            id="work-heading"
            className="digital-display mt-7 max-w-[18ch] text-balance text-[clamp(2.5rem,1.2rem+3.4vw,3.375rem)] font-bold leading-[0.98] tracking-[-0.03em]"
          >
            Systems, not slide decks.
          </h1>
          <p className="mt-7 max-w-[48ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
            Each of these is a working system. They are described by what was
            broken, what replaced it and how it holds up — not by a client name,
            because the interesting part was never the logo.
          </p>
        </PageContainer>
      </section>

      <PageContainer className="pb-[clamp(4rem,8vw,7rem)]">
        <ol className="grid gap-0">
          {work.map((entry, index) => (
            <li
              key={entry.databaseId}
              id={entry.slug}
              className="digital-reveal scroll-mt-[calc(var(--layout-header-offset)+2rem)] border-t border-brand-border py-[clamp(2.5rem,5vw,4rem)] first:border-t-0 first:pt-0"
              style={
                { "--digital-reveal-offset": `${String(Math.min(index, 3) * 2)}%` } as CSSProperties
              }
            >
              <article className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
                <div className="lg:sticky lg:top-[calc(var(--layout-header-offset)+2rem)] lg:self-start">
                  <p
                    aria-hidden="true"
                    className="font-display text-[2rem] leading-none text-brand-ink-faint"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="digital-display mt-5 text-balance text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.06] tracking-[-0.025em]">
                    {entry.title}
                  </h2>
                  {entry.excerpt !== null ? (
                    <p className="mt-5 max-w-[38ch] text-[1.0625rem] leading-[1.6] text-brand-ink-soft">
                      {entry.excerpt}
                    </p>
                  ) : null}
                </div>

                {entry.html !== null ? (
                  <div
                    className="record-prose max-w-[60ch]"
                    dangerouslySetInnerHTML={{ __html: entry.html }}
                  />
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      </PageContainer>

      <section className="border-t border-brand-border" aria-labelledby="work-cta-heading">
        <PageContainer className="digital-reveal flex min-h-[45svh] flex-col items-center justify-center gap-8 py-[clamp(4rem,8vw,7rem)] text-center">
          <h2
            id="work-cta-heading"
            className="digital-display max-w-[20ch] text-balance text-[clamp(2.25rem,1.5rem+3.6vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.025em]"
          >
            Have a process worth rebuilding?
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
