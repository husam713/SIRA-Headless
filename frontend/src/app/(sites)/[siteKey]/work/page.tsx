import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { PageClosingCta } from "@/components/content/page-closing-cta";
import { PageIntroHeader } from "@/components/content/page-intro-header";
import { PageContainer } from "@/components/layout/page-container";
import { getBrand } from "@/lib/brand";
import {
  getWorkIndexForLocale,
  neutralSlug,
} from "@/lib/content/get-content-page";
import { resolveContentRoute } from "@/lib/content/route-context";
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

const ROUTE = "/work";

interface WorkPageProps {
  readonly params: Promise<{ readonly siteKey: string }>;
}

async function resolve(params: WorkPageProps["params"]) {
  const context = await resolveContentRoute(params, `${ROUTE}/`);
  const work = await getWorkIndexForLocale(
    context.site.key,
    context.request.locale,
  );

  return { ...context, work };
}

export async function generateMetadata({
  params,
}: WorkPageProps): Promise<Metadata> {
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
    title: `${page?.title ?? "Work"} — ${brand.name}`,
  };
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { work, page, site, request } = await resolve(params);

  if (work.length === 0) notFound();

  return (
    <>
      <PageIntroHeader
        page={page}
        headingId="work-heading"
        fallbackEyebrow="What we build"
        fallbackHeading="Systems, not slide decks."
        fallbackStandfirst="Each of these is a working system. They are described by what was broken, what replaced it and how it holds up — not by a client name, because the interesting part was never the logo."
        height="tall"
      />

      <PageContainer className="pb-[clamp(4rem,8vw,7rem)]">
        <ol className="grid gap-0">
          {work.map((entry, index) => (
            <li
              key={entry.databaseId}
              id={neutralSlug(entry.slug)}
              className="digital-reveal scroll-mt-8 border-t border-brand-border py-[clamp(2.5rem,5vw,4rem)] first:border-t-0 first:pt-0"
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

      <PageClosingCta
        page={page}
        headingId="work-cta-heading"
        fallbackHeading="Have a process worth rebuilding?"
        fallbackLabel="Book an operations review"
        site={site}
        locale={request.locale}
      />
    </>
  );
}
