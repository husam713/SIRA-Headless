import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { Closing } from "@/components/atlas/closing";
import { PageHero } from "@/components/atlas/page-hero";
import {
  ProjectArchiveGrid,
  type ProjectFilterOption,
} from "@/components/atlas/project-archive-grid";
import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { atlasPageMetadata } from "@/lib/atlas/metadata";
import { pageHeroImage, resolveAtlasPage, toProjectCard } from "@/lib/atlas/page-context";
import { splitHighlight } from "@/lib/atlas/highlight";
import { getBrand } from "@/lib/brand";
import { getProjectArchiveForLocale } from "@/lib/projects";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

// The projects archive (Atlas direction, owner-approved 2026-09-16).
//
// Every published project on the tenant, in a three-across grid, filtered by
// company on the Group site — the chips are the companies the grid actually
// holds, so a company with nothing published has no chip. The heading block
// is the CMS page for this route; `/projects/` itself is the project post
// type's archive slug in WordPress, so the page lives at `/our-projects/`.

const ROUTE = "/projects";
const PAGE_URIS = Object.freeze(["/our-projects/", "/projects-page/"]);
const ARCHIVE_SIZE = 48;

interface ProjectsPageProps {
  readonly params: Promise<{ readonly siteKey: string }>;
}

export async function generateMetadata({ params }: ProjectsPageProps): Promise<Metadata> {
  const { site, page, request } = await resolveAtlasPage(params, PAGE_URIS);
  const [brand, requestHeaders] = await Promise.all([getBrand(site.key), headers()]);
  const discovery = resolveSiteDiscoveryContext(site.key, requestHeaders.get("host") ?? "");
  const title = page?.intro?.heading ?? page?.title ?? "Projects";

  return atlasPageMetadata({
    base: buildSiteMetadata(discovery, brand, ROUTE, { locale: request.locale, path: ROUTE }),
    title,
    description: page?.intro?.standfirst,
    image: pageHeroImage(page),
  });
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const context = await resolveAtlasPage(params, PAGE_URIS);
  const { site, page, chrome, closing, closingImage, href, request } = context;
  const archive = await getProjectArchiveForLocale(site.key, ARCHIVE_SIZE, request.locale);

  if (archive.status !== "ready") notFound();

  const items = archive.page.items.map((item) => toProjectCard(item, request.locale));
  const filters: ProjectFilterOption[] = [];

  for (const item of items) {
    if (item.unitSlug === null || item.unitLabel === null) continue;
    if (filters.some((filter) => filter.slug === item.unitSlug)) continue;
    filters.push({ slug: item.unitSlug, label: item.unitLabel, color: item.accentColor });
  }

  const intro = page?.intro ?? null;
  const heading = splitHighlight(intro?.heading ?? page?.title ?? chrome.projects);

  return (
    <>
      <PageHero
        headingId="projects-heading"
        heading={heading.text}
        highlight={heading.highlight}
        eyebrow={intro?.eyebrow}
        lead={intro?.standfirst}
        image={pageHeroImage(page) ?? closingImage}
        size="short"
      />

      <Section labelledBy="projects-heading" className="bg-brand-paper">
        <PageContainer>
          <ProjectArchiveGrid
            items={items}
            filters={filters}
            allLabel={chrome.filterAll}
            exploreLabel={chrome.explore}
            filterLabel={chrome.companies}
          />
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
