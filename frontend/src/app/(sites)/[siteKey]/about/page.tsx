import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { PageClosingCta } from "@/components/content/page-closing-cta";
import {
  DigitalAboutHero,
  DigitalProcess,
  DigitalStatBand,
  DigitalStatement,
  DigitalTeamGrid,
} from "@/components/digital";
import { PageContainer } from "@/components/layout/page-container";
import { Prose } from "@/components/layout/prose";
import { getBrand } from "@/lib/brand";
import { getDigitalAbout, peopleForLocale } from "@/lib/content/digital-about";
import { resolveContentRoute } from "@/lib/content/route-context";
import { localeUri } from "@/lib/i18n/locale";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

// About.
//
// A static segment, so it wins over the generic `[section]` prose route by
// Next.js precedence — exactly the escape hatch that route's own comment
// anticipates for a page that becomes a composition.
//
// The order is the reference's measured one, and it is a narrative rather than
// a layout: person, numbers, people, philosophy, method, then the ask. Each
// section renders only if the CMS holds it, so a tenant part-way through
// authoring gets a shorter page rather than a scaffold with holes in it.
//
// A tenant with no About composition at all still gets a page: the CMS prose
// falls through to the same treatment the `[section]` route would have given
// it. That is what keeps this route safe to add network-wide while only Digital
// has the field group.

const ROUTE = "/about";

interface AboutPageProps {
  readonly params: Promise<{ readonly siteKey: string }>;
}

async function resolve(params: AboutPageProps["params"]) {
  const context = await resolveContentRoute(params, `${ROUTE}/`);
  const about = await getDigitalAbout(
    context.site.key,
    localeUri(context.request.locale, context.site, `${ROUTE}/`),
  );

  return { ...context, about };
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
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
    title: `${page?.title ?? "About"} — ${brand.name}`,
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { about, page, site, request } = await resolve(params);

  // No page and no composition is a tenant that has not been given this route.
  if (page === null && about === null) notFound();

  const people =
    about === null ? [] : peopleForLocale(about.people, request.locale);

  // The <h1>. The hero owns it when there is one; otherwise the page title band
  // does, so the document always has exactly one and never none.
  const heroOwnsHeading =
    about?.hero != null &&
    (about.hero.headingBefore !== null ||
      about.hero.headingHighlight !== null ||
      about.hero.headingAfter !== null);

  return (
    <>
      {about?.hero != null ? <DigitalAboutHero hero={about.hero} /> : null}

      {!heroOwnsHeading ? (
        <PageContainer className="digital-reveal pb-4 pt-[clamp(4rem,8vw,7rem)]">
          <h1 className="digital-display max-w-[22ch] text-balance text-[clamp(2.25rem,1.5rem+3.6vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.025em]">
            {page?.title ?? "About"}
          </h1>
        </PageContainer>
      ) : null}

      {about !== null ? <DigitalStatBand stats={about.stats} /> : null}

      {about !== null ? (
        <DigitalTeamGrid header={about.team} people={people} />
      ) : null}

      {about?.statement != null ? (
        <DigitalStatement statement={about.statement} />
      ) : null}

      {about?.process != null ? <DigitalProcess process={about.process} /> : null}

      {/* The page's own body, when it has one the composition has not already
          absorbed. A tenant without the field group renders here and nowhere
          else, which is what makes this route a superset of the prose route
          rather than a replacement that loses content. */}
      {about?.statement == null && page?.html != null ? (
        <PageContainer className="pb-[clamp(4rem,8vw,7rem)] pt-10">
          <Prose className="digital-reveal">
            <div
              className="record-prose"
              dangerouslySetInnerHTML={{ __html: page.html }}
            />
          </Prose>
        </PageContainer>
      ) : null}

      <PageClosingCta
        page={page}
        headingId="about-cta-heading"
        fallbackHeading="Ready to automate the busywork?"
        fallbackLabel="Book a free consultation"
        site={site}
        locale={request.locale}
      />
    </>
  );
}
