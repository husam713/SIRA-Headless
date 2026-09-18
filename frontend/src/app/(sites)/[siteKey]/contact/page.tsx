import type { Metadata } from "next";
import { headers } from "next/headers";

import { CityList } from "@/components/atlas/city-list";
import { PageHero } from "@/components/atlas/page-hero";
import { ContactForm } from "@/components/homepage/contact-form";
import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { splitHighlight } from "@/lib/atlas/highlight";
import { atlasPageMetadata } from "@/lib/atlas/metadata";
import { pageHeroImage, resolveAtlasPage } from "@/lib/atlas/page-context";
import { getBrand } from "@/lib/brand";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

import {
  DigitalContactPage,
  generateDigitalMetadata,
  type ContactPageProps,
} from "./digital-contact";

// The contact page.
//
// Two compositions behind one route. SIRA Digital keeps its own page with the
// impact calculator (ADR-033). Group and the four companies get the Atlas
// page: the invitation on photography, then where the company works — the
// brand's office locations — beside the form on its deep panel.
//
// The enquiry travels the existing pipeline: the trusted Next.js route resolves
// the tenant from the request host and hands it to that site's WordPress.
// The subject list is the homepage's companies on Group, so an enquiry can be
// addressed to one of them, and empty on a company site, whose form is its own.

const ROUTE = "/contact";
const PAGE_URIS = Object.freeze(["/contact/", "/contact-us/"]);

async function isDigital(params: ContactPageProps["params"]): Promise<boolean> {
  const { siteKey } = await params;
  return getSiteDefinition(siteKey)?.key === "digital";
}

export async function generateMetadata(props: ContactPageProps): Promise<Metadata> {
  if (await isDigital(props.params)) return generateDigitalMetadata(props);

  const { site, page, request } = await resolveAtlasPage(props.params, PAGE_URIS);
  const [brand, requestHeaders] = await Promise.all([getBrand(site.key), headers()]);
  const discovery = resolveSiteDiscoveryContext(site.key, requestHeaders.get("host") ?? "");
  const title = page?.intro?.heading ?? page?.title ?? "Contact";

  return atlasPageMetadata({
    base: buildSiteMetadata(discovery, brand, ROUTE, { locale: request.locale, path: ROUTE }),
    title,
    description: page?.intro?.standfirst,
    image: pageHeroImage(page),
  });
}

export default async function ContactPage(props: ContactPageProps) {
  if (await isDigital(props.params)) return DigitalContactPage(props);

  const context = await resolveAtlasPage(props.params, PAGE_URIS);
  const { page, chrome, brand, homepage, closing, closingImage, request } = context;

  const intro = page?.intro ?? null;
  const heading = splitHighlight(intro?.heading ?? closing?.heading ?? page?.title ?? chrome.contact);

  const subjects =
    homepage !== null &&
    homepage.variant === "group" &&
    homepage.companies !== null &&
    homepage.companies.selection.status === "ready"
      ? [chrome.generalEnquiry, ...homepage.companies.selection.items.map((item) => item.title)]
      : [];

  return (
    <>
      <PageHero
        headingId="contact-heading"
        heading={heading.text}
        highlight={heading.highlight}
        eyebrow={intro?.eyebrow ?? closing?.eyebrow}
        lead={intro?.standfirst ?? closing?.description}
        image={pageHeroImage(page) ?? closingImage}
        size="short"
      />

      <Section labelledBy="contact-heading" className="bg-brand-paper">
        <PageContainer className="atlas-two-col">
          <div data-stagger>
            <SectionEyebrow tone="accent" className="reveal">
              {chrome.whereWeWork}
            </SectionEyebrow>
            <CityList offices={brand.offices} tone="paper" />
            {brand.email !== null ? (
              <p className="atlas-lead reveal mt-10">
                <a href={`mailto:${brand.email}`} dir="ltr" className="transition-colors hover:text-brand-accent">
                  {brand.email}
                </a>
              </p>
            ) : null}
            {brand.address !== null ? (
              <p className="reveal mt-3 text-sm text-brand-ink-faint">{brand.address}</p>
            ) : null}
          </div>

          <div className="atlas-on-deep" data-reveal="fade">
            <ContactForm services={subjects} locale={request.locale} />
          </div>
        </PageContainer>
      </Section>
    </>
  );
}
