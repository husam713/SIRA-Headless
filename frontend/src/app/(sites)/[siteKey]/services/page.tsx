import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { PageClosingCta } from "@/components/content/page-closing-cta";
import { PageIntroHeader } from "@/components/content/page-intro-header";
import { PageContainer } from "@/components/layout/page-container";
import { getBrand } from "@/lib/brand";
import {
  getServiceIndexForLocale,
  neutralSlug,
} from "@/lib/content/get-content-page";
import { resolveContentRoute } from "@/lib/content/route-context";
import { CHROME } from "@/lib/i18n/locale";
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
//
// Anchors use the language-neutral slug, so /services#invoice-capture and
// /ar/services#invoice-capture land on the same capability.

const ROUTE = "/services";

interface ServicesPageProps {
  readonly params: Promise<{ readonly siteKey: string }>;
}

async function resolve(params: ServicesPageProps["params"]) {
  const context = await resolveContentRoute(params, `${ROUTE}/`);
  const services = await getServiceIndexForLocale(
    context.site.key,
    context.request.locale,
  );

  return { ...context, services };
}

export async function generateMetadata({
  params,
}: ServicesPageProps): Promise<Metadata> {
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
    title: `${page?.title ?? "Services"} — ${brand.name}`,
  };
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { services, page, site, request } = await resolve(params);

  // No services and no page is a tenant that has not been given this route.
  // A 404 is honest; an empty scaffold is not.
  if (services.length === 0 && page === null) notFound();

  const chrome = CHROME[request.locale];

  return (
    <>
      <PageIntroHeader
        page={page}
        headingId="services-heading"
        fallbackEyebrow="Capabilities"
        fallbackHeading="What we build"
        fallbackStandfirst={
          services.length === 0
            ? "Capabilities are published from the CMS."
            : "Each one scoped, built, integrated and handed over. Every entry below says what changes operationally, not what the technology is called."
        }
        height="tall"
      />

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
              {chrome.onThisPage}
            </h2>
            <ol className="mt-5 grid gap-0">
              {services.map((service, index) => (
                <li key={service.databaseId}>
                  <a
                    href={`#${neutralSlug(service.slug)}`}
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
                id={neutralSlug(service.slug)}
                className="digital-reveal scroll-mt-[calc(var(--layout-header-offset)+2rem)]"
                style={
                  { "--digital-reveal-offset": `${String(Math.min(index, 3) * 2)}%` } as CSSProperties
                }
                aria-labelledby={`${neutralSlug(service.slug)}-heading`}
              >
                <p
                  aria-hidden="true"
                  className="font-display text-[1.75rem] leading-none text-brand-ink-faint"
                >
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2
                  id={`${neutralSlug(service.slug)}-heading`}
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

      <PageClosingCta
        page={page}
        headingId="services-cta-heading"
        fallbackHeading="Let us look at yours."
        fallbackLabel="Book an operations review"
        site={site}
        locale={request.locale}
      />
    </>
  );
}
