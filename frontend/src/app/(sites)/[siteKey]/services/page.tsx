import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { PageClosingCta } from "@/components/content/page-closing-cta";
import { PageIntroHeader } from "@/components/content/page-intro-header";
import { CtaLink } from "@/components/homepage/cta-link";
import { PageContainer } from "@/components/layout/page-container";
import { getBrand } from "@/lib/brand";
import {
  getServiceIndexForLocale,
  neutralSlug,
} from "@/lib/content/get-content-page";
import { resolveContentRoute } from "@/lib/content/route-context";
import { CHROME, localeHref } from "@/lib/i18n/locale";
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

// The scroll-spy wiring (see `.digital-index__*` in globals.css).
//
// Each service block publishes a view timeline under this name and the matching
// rail entry animates against it, which is what lets the index say where the
// reader is without a Client Component and without a scroll listener. The names
// have to be generated because the number of services is editorial, so they are
// passed as inline properties rather than written into the stylesheet.
function timelineName(index: number): string {
  return `--sira-service-${String(index + 1)}`;
}

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
        fallbackHeading="Systems that think, automate and scale"
        fallbackStandfirst={
          services.length === 0
            ? "Capabilities are published from the CMS."
            : "Each one scoped, built, integrated and handed over. Every entry below says what changes operationally, not what the technology is called."
        }
        height="full"
      />

      <PageContainer className="pb-[clamp(4rem,8vw,7rem)]">
        <div
          className="grid gap-x-16 gap-y-12 lg:grid-cols-[16rem_minmax(0,1fr)]"
          // The common ancestor of the blocks that publish the timelines and
          // the rail entries that consume them, which is what `timeline-scope`
          // requires. A browser without it drops the property, the names never
          // resolve, and every entry simply keeps its resting state.
          style={
            {
              timelineScope: services
                .map((_, index) => timelineName(index))
                .join(", "),
            } as CSSProperties
          }
        >
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
                  {/* Colour and border are owned by `.digital-index__link`, not
                      by utilities here: the resting, read-now, hover and focus
                      states have to resolve against each other in one place. */}
                  <a
                    href={`#${neutralSlug(service.slug)}`}
                    className="digital-index__link flex items-baseline gap-3 border-s-2 py-2 ps-3.5 text-sm"
                    style={
                      { "--digital-index-timeline": timelineName(index) } as CSSProperties
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="digital-index__number font-display text-[0.6875rem] tabular-nums"
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
                className="digital-reveal digital-index__block scroll-mt-8"
                style={
                  {
                    "--digital-reveal-offset": `${String(Math.min(index, 3) * 2)}%`,
                    "--digital-index-timeline": timelineName(index),
                  } as CSSProperties
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
                {/* The problem first, then the thing. The reference leads every
                    capability this way and it is the right order: a reader who
                    does not recognise the problem has no reason to read the
                    solution. The label is set as an inline lead-in rather than a
                    heading, because it repeats on all ten blocks and ten
                    identical headings would wreck the document outline. */}
                {service.challenge !== null ? (
                  <p className="mt-6 max-w-[54ch] text-[1.0625rem] leading-[1.65] text-brand-ink-soft">
                    <span className="font-semibold text-brand-accent">
                      {chrome.currentChallenge}
                    </span>{" "}
                    {service.challenge}
                  </p>
                ) : null}
                {service.excerpt !== null ? (
                  <p className="mt-5 max-w-[52ch] text-[1.125rem] leading-[1.6] text-brand-ink">
                    {service.excerpt}
                  </p>
                ) : null}
                {/* `digital-spec` is what makes this read as a specification
                    rather than as an article: label-scale headings, and two
                    columns from xl, where the measure cap alone was leaving 43%
                    of the track empty. The cap stays below xl, where the track
                    is too narrow to divide. */}
                {service.html !== null ? (
                  <div
                    className="record-prose digital-spec mt-8 max-w-[62ch] xl:max-w-none"
                    dangerouslySetInnerHTML={{ __html: service.html }}
                  />
                ) : null}
                {/* The outcome closes the block, because the last thing read
                    before the button should be what the reader gets rather than
                    what we do. It is a rule and a line rather than a card: the
                    page already has ten blocks and a card here would make each
                    one look like two. */}
                {service.outcome !== null ? (
                  <p className="mt-8 max-w-[54ch] border-t border-brand-border pt-6 text-[1.0625rem] font-medium leading-[1.6] text-brand-ink">
                    {service.outcome}
                  </p>
                ) : null}
                {service.ctaLabel !== null ? (
                  <div className="mt-7">
                    <CtaLink
                      link={{
                        label: service.ctaLabel,
                        href: localeHref(site, request.locale, "/contact"),
                        target: null,
                      }}
                      variant="ghost-dark"
                    />
                  </div>
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
        height="full"
      />
    </>
  );
}
