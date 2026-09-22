import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { Closing } from "@/components/atlas/closing";
import { PageHero } from "@/components/atlas/page-hero";
import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { splitHighlight } from "@/lib/atlas/highlight";
import { atlasPageMetadata } from "@/lib/atlas/metadata";
import { pageHeroImage, resolveAtlasPage } from "@/lib/atlas/page-context";
import { getBrand } from "@/lib/brand";
import { getServiceIndexForLocale, type ServiceEntry } from "@/lib/content/get-content-page";
import { parseListItems, parseParagraphs } from "@/lib/content/headed-list";
import { resolveAccentForBusinessUnitSlug } from "@/lib/homepage/business-unit-accent";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { DigitalServicesPage } from "@/components/digital-site/pages/services";
import { buildDigitalMetadata } from "@/lib/digital-site/metadata";
import { getRequestLocale } from "@/lib/i18n/request-locale";

// The services page.
//
// Two compositions behind one route. SIRA Digital renders its own page from
// the repository's narrative (ADR-039, proposed). Group and the four
// companies get the Atlas page: numbered rows that open in place — the summary, what the service
// covers as a hairline list, and its photograph — with the first row open.
//
// Each row is a `sira_service` record: the excerpt is the summary, the body's
// list items are the coverage, the featured image is the picture, and the
// Business Unit term colours the row. `/services/` is the service post type's
// archive slug in WordPress, so the page's heading block lives at
// `/our-services/`.

const ROUTE = "/services";
const PAGE_URIS = Object.freeze(["/our-services/", "/services-page/"]);

interface ServicesPageProps {
  readonly params: Promise<{ readonly siteKey: string }>;
}

async function resolveDigital(params: ServicesPageProps["params"]) {
  const { siteKey } = await params;
  const site = getSiteDefinition(siteKey);
  if (site === null || site.key !== "digital") return null;
  const request = await getRequestLocale(site);
  return { site, request };
}

export async function generateMetadata(props: ServicesPageProps): Promise<Metadata> {
  const digital = await resolveDigital(props.params);
  if (digital !== null) {
    const requestHeaders = await headers();
    return buildDigitalMetadata({
      site: digital.site,
      locale: digital.request.locale,
      path: ROUTE,
      hostname: requestHeaders.get("host") ?? "",
      page: "services",
    });
  }

  const { site, page, request } = await resolveAtlasPage(props.params, PAGE_URIS);
  const [brand, requestHeaders] = await Promise.all([getBrand(site.key), headers()]);
  const discovery = resolveSiteDiscoveryContext(site.key, requestHeaders.get("host") ?? "");
  const title = page?.intro?.heading ?? page?.title ?? "Services";

  return atlasPageMetadata({
    base: buildSiteMetadata(discovery, brand, ROUTE, { locale: request.locale, path: ROUTE }),
    title,
    description: page?.intro?.standfirst,
    image: pageHeroImage(page),
  });
}

function ServiceRow({ service, index }: { readonly service: ServiceEntry; readonly index: number }) {
  const accent = service.unit === null ? null : resolveAccentForBusinessUnitSlug(service.unit.slug);
  const items = parseListItems(service.html);
  const summary = service.excerpt ?? parseParagraphs(service.html)[0] ?? null;

  return (
    <details
      className="atlas-service reveal"
      name="sira-services"
      open={index === 0}
      style={accent === null ? undefined : ({ "--c": accent.color } as CSSProperties)}
    >
      <summary>
        <span aria-hidden="true" className="atlas-service__n">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2 className="atlas-service__title">{service.title}</h2>
        <span aria-hidden="true" className="atlas-service__plus" />
      </summary>
      <div className="atlas-service__body atlas-service__body--rich">
        {summary !== null ? <p>{summary}</p> : <div />}
        {items.length > 0 ? (
          <ul className="atlas-service__list">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <div />
        )}
        {service.featuredImage !== null ? (
          <figure className="atlas-service__figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.featuredImage.sourceUrl}
              alt={service.featuredImage.altText ?? ""}
              width={service.featuredImage.width ?? undefined}
              height={service.featuredImage.height ?? undefined}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ) : null}
      </div>
    </details>
  );
}

export default async function ServicesPage(props: ServicesPageProps) {
  const digital = await resolveDigital(props.params);
  if (digital !== null) {
    return <DigitalServicesPage site={digital.site} locale={digital.request.locale} />;
  }

  const context = await resolveAtlasPage(props.params, PAGE_URIS);
  const { site, page, chrome, request, closing, closingImage, href } = context;
  const services = await getServiceIndexForLocale(site.key, request.locale);

  if (services.length === 0) notFound();

  const intro = page?.intro ?? null;
  const heading = splitHighlight(intro?.heading ?? page?.title ?? "Services");

  return (
    <>
      <PageHero
        headingId="services-heading"
        heading={heading.text}
        highlight={heading.highlight}
        eyebrow={intro?.eyebrow}
        lead={intro?.standfirst}
        image={pageHeroImage(page) ?? closingImage}
        size="short"
      />

      <Section labelledBy="services-heading" className="bg-brand-paper">
        <PageContainer>
          <div className="atlas-services" data-stagger>
            {services.map((service, index) => (
              <ServiceRow key={service.databaseId} service={service} index={index} />
            ))}
          </div>
        </PageContainer>
      </Section>

      <Closing
        section={closing}
        image={closingImage}
        contactHref={href("/contact")}
        contactLabel={chrome.startConversation}
        secondary={
          site.key === "group" ? { label: chrome.requestPack, href: href("/investors") } : null
        }
      />
    </>
  );
}
