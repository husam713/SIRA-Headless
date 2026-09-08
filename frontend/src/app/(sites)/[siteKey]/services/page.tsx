import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { CtaLink } from "@/components/homepage/cta-link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { getBrand } from "@/lib/brand";
import { getContentPage, getServiceIndex } from "@/lib/content/get-content-page";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

// The services experience.
//
// One anchored page rather than a route per service, which is the single
// strongest structural idea the Phase 1 audit found: it keeps every capability
// one anchor from the navigation, it lets a reader compare depth by scrolling
// instead of by going back, and it means the homepage rail can deep-link into
// the exact capability it names.
//
// The index is a real <nav>, not a decorative rail. On wide viewports it is
// sticky beside the content; below that it becomes an ordinary list above the
// content rather than a horizontal strip, because a horizontal strip of ten
// items is the mid-width failure the audit recorded in the reference.
//
// Depth per service is what stops this reading as a card wall. Each entry
// carries its own authored body — the problem, what changes, what the system
// does, what it connects to, where a person stays in the loop — and that body
// is CMS content, so an editor changes it without a deploy.

interface ServicesPageProps {
  readonly params: Promise<{ readonly siteKey: string }>;
}

async function resolve(params: ServicesPageProps["params"]) {
  const { siteKey } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null) notFound();

  const [page, services] = await Promise.all([
    getContentPage(site.key, "/services/"),
    getServiceIndex(site.key),
  ]);

  return { site, page, services };
}

export async function generateMetadata({
  params,
}: ServicesPageProps): Promise<Metadata> {
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
    ...buildSiteMetadata(discovery, brand, "/services"),
    title: `${page?.title ?? "Services"} — ${brand.name}`,
  };
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { services, page } = await resolve(params);

  // No services and no page is a tenant that has not been given this route.
  // A 404 is honest; an empty scaffold is not.
  if (services.length === 0 && page === null) notFound();

  return (
    <>
      <section
        className="relative flex min-h-[calc(70svh-var(--layout-header-offset))] items-end"
        aria-labelledby="services-heading"
      >
        <PageContainer className="digital-reveal pb-14 pt-[clamp(4rem,8vw,7rem)]">
          <SectionEyebrow tone="accent" className="digital-eyebrow">
            Capabilities
          </SectionEyebrow>
          <h1
            id="services-heading"
            className="digital-display mt-7 max-w-[16ch] text-balance text-[clamp(2.5rem,1.2rem+3.4vw,3.375rem)] font-bold leading-[0.98] tracking-[-0.03em]"
          >
            {page?.title ?? "What we build"}
          </h1>
          <p className="mt-7 max-w-[46ch] text-[1.0625rem] leading-[1.7] text-brand-ink-soft">
            {services.length === 0
              ? "Capabilities are published from the CMS."
              : `${String(services.length)} capabilities, each one scoped, built, integrated and handed over. Every entry below says what changes operationally, not what the technology is called.`}
          </p>
        </PageContainer>
      </section>

      <PageContainer className="pb-[clamp(4rem,8vw,7rem)]">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[16rem_minmax(0,1fr)]">
          {/* Sticky beside the content only where there is room for it to be
              beside anything. Below lg it is a plain list, which is navigable
              with a keyboard and does not overflow. */}
          <nav
            aria-labelledby="services-index-heading"
            className="lg:sticky lg:top-[calc(var(--layout-header-offset)+2rem)] lg:self-start"
          >
            <h2
              id="services-index-heading"
              className="digital-eyebrow text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint"
            >
              On this page
            </h2>
            <ol className="mt-5 grid gap-0">
              {services.map((service, index) => (
                <li key={service.databaseId}>
                  <a
                    href={`#${service.slug}`}
                    className="digital-rail__item flex items-baseline gap-3 border-s-2 border-brand-border py-2 ps-3.5 text-sm text-brand-ink-soft transition-colors hover:border-brand-accent hover:text-brand-ink focus-visible:border-brand-accent focus-visible:text-brand-ink"
                  >
                    <span
                      aria-hidden="true"
                      className="font-display text-[0.6875rem] tabular-nums text-brand-ink-faint"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{service.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="grid gap-[clamp(3.5rem,7vw,6rem)]">
            {services.map((service, index) => (
              <article
                key={service.databaseId}
                id={service.slug}
                className="digital-reveal scroll-mt-[calc(var(--layout-header-offset)+2rem)]"
                style={
                  { "--digital-reveal-offset": `${String(Math.min(index, 3) * 2)}%` } as CSSProperties
                }
                aria-labelledby={`${service.slug}-heading`}
              >
                <p
                  aria-hidden="true"
                  className="font-display text-[1.75rem] leading-none text-brand-ink-faint"
                >
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2
                  id={`${service.slug}-heading`}
                  className="digital-display mt-5 text-balance text-[clamp(1.875rem,1.35rem+2.4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.025em]"
                >
                  {service.title}
                </h2>
                {service.excerpt !== null ? (
                  <p className="mt-5 max-w-[52ch] text-[1.125rem] leading-[1.6] text-brand-ink">
                    {service.excerpt}
                  </p>
                ) : null}
                {service.html !== null ? (
                  <div
                    className="record-prose mt-8 max-w-[62ch]"
                    dangerouslySetInnerHTML={{ __html: service.html }}
                  />
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </PageContainer>

      <section
        className="border-t border-brand-border"
        aria-labelledby="services-cta-heading"
      >
        <PageContainer className="digital-reveal flex min-h-[45svh] flex-col items-center justify-center gap-8 py-[clamp(4rem,8vw,7rem)] text-center">
          <h2
            id="services-cta-heading"
            className="digital-display max-w-[18ch] text-balance text-[clamp(2.25rem,1.5rem+3.6vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.025em]"
          >
            Let us look at yours.
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
