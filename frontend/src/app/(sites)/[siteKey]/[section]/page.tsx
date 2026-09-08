import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { Prose } from "@/components/layout/prose";
import { getBrand } from "@/lib/brand";
import { getContentPage } from "@/lib/content/get-content-page";
import { getSiteDefinition } from "@/lib/host/resolve-site";
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

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
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
  const { page } = await resolve(params);

  if (page === null) notFound();

  return (
    <article>
      {/* The title band carries the page's own <h1>; the prose column below
          starts at h2, which keeps the outline correct for a document whose
          headings were authored in the CMS. */}
      <PageContainer className="digital-reveal pb-4 pt-[clamp(4rem,8vw,7rem)]">
        <h1 className="digital-display max-w-[22ch] text-balance text-[clamp(2.25rem,1.5rem+3.6vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.025em]">
          {page.title}
        </h1>
      </PageContainer>

      {page.html !== null ? (
        <PageContainer className="pb-[clamp(4rem,8vw,7rem)] pt-10">
          <Prose className="digital-reveal">
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
