import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { Prose } from "@/components/layout/prose";
import { getBrand } from "@/lib/brand";
import { DigitalAutomationPage } from "@/components/digital-site/pages/automation";
import { DigitalErpnextPage } from "@/components/digital-site/pages/erpnext";
import { DigitalMethodPage } from "@/components/digital-site/pages/method";
import { DigitalProsePage } from "@/components/digital-site/pages/prose";
import { digitalSectionPage } from "@/lib/digital-site/routes";
import { buildDigitalMetadata } from "@/lib/digital-site/metadata";
import { getContentPage, getContentPageForLocale } from "@/lib/content/get-content-page";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { localeUri } from "@/lib/i18n/locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

// One route for every CMS page that is prose rather than a composed experience
// — About, Privacy, Terms and anything an editor adds later.
//
// It is deliberately generic. A separate route per page would put the page's
// existence in the code rather than in the CMS, which is exactly the coupling
// WordPress is supposed to remove: adding a page should be an editorial act.
// Routes that need a composition of their own (the homepage, /services,
// /contact) are static segments and win over this one by Next.js precedence.
//
// A slug the CMS does not have is a 404, not an empty page.

interface ContentPageProps {
  readonly params: Promise<{
    readonly siteKey: string;
    /**
     * Named `section` rather than `slug` because Next.js requires one name per
     * dynamic position, and the editorial route at `[section]/[slug]` already
     * claimed it. This is the page's own slug.
     */
    readonly section: string;
  }>;
}

async function resolve(params: ContentPageProps["params"]) {
  const { siteKey, section: slug } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null) notFound();

  const page = await getContentPage(site.key, `/${slug}/`);

  return { site, slug, page };
}

// SIRA Digital's prose pages (privacy, terms) read in the reader's language
// and in the Digital document's own voice (ADR-039, proposed).
async function resolveDigital(params: ContentPageProps["params"]) {
  const { siteKey, section: slug } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null || site.key !== "digital") return null;

  const request = await getRequestLocale(site);

  // A page the repository narrative owns (ADR-039) answers before the CMS is
  // asked: /erpnext/, /automation/ and /method/ exist only on Digital.
  const narrative = digitalSectionPage(slug);
  if (narrative !== null) return { site, slug, request, narrative, page: null };

  const uri = `/${slug}/`;
  const page = await getContentPageForLocale(site.key, localeUri(request.locale, site, uri), uri);

  return { site, slug, request, narrative: null, page };
}

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const digital = await resolveDigital(params);
  if (digital !== null) {
    if (digital.narrative === null && digital.page === null) return {};
    const requestHeaders = await headers();
    return buildDigitalMetadata({
      site: digital.site,
      locale: digital.request.locale,
      path: `/${digital.slug}`,
      hostname: requestHeaders.get("host") ?? "",
      page: digital.narrative ?? { title: digital.page?.title ?? "", description: null },
    });
  }

  const { site, slug, page } = await resolve(params);

  if (page === null) return {};

  const [brand, requestHeaders] = await Promise.all([
    getBrand(site.key),
    headers(),
  ]);
  const discovery = resolveSiteDiscoveryContext(
    site.key,
    requestHeaders.get("host") ?? "",
  );

  return {
    ...buildSiteMetadata(discovery, brand, `/${slug}`),
    title: `${page.title} — ${brand.name}`,
  };
}

export default async function ContentPageRoute({ params }: ContentPageProps) {
  const digital = await resolveDigital(params);
  if (digital !== null) {
    const { site, request } = digital;
    if (digital.narrative === "erpnext") return <DigitalErpnextPage site={site} locale={request.locale} />;
    if (digital.narrative === "automation") return <DigitalAutomationPage site={site} locale={request.locale} />;
    if (digital.narrative === "method") return <DigitalMethodPage site={site} locale={request.locale} />;
    if (digital.page === null) notFound();
    return <DigitalProsePage page={digital.page} />;
  }

  const { page } = await resolve(params);

  if (page === null) notFound();

  return (
    <article>
      {/* The title band carries the page's own <h1>; the prose column below
          starts at h2, which keeps the outline correct for a document whose
          headings were authored in the CMS. */}
      <PageContainer className="reveal pb-4 pt-[clamp(4rem,8vw,7rem)]">
        <h1 className="digital-display max-w-[22ch] text-balance text-[clamp(2.25rem,1.5rem+3.6vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.025em]">
          {page.title}
        </h1>
      </PageContainer>

      {page.html !== null ? (
        <PageContainer className="pb-[clamp(4rem,8vw,7rem)] pt-10">
          <Prose className="reveal">
            {/* `record-prose` is the editorial type scale the newsroom already
                uses. A CMS page is the same kind of document, so it reads with
                the same rhythm rather than a second one invented here. The HTML
                is sanitised in the data layer, not at this boundary. */}
            <div
              className="record-prose"
              dangerouslySetInnerHTML={{ __html: page.html }}
            />
          </Prose>
        </PageContainer>
      ) : null}
    </article>
  );
}
