import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { InsightRows } from "@/components/atlas/insight-rows";
import { InvestorPackDrawer } from "@/components/atlas/investor-pack-drawer";
import { PageHero, type PageHeroFact } from "@/components/atlas/page-hero";
import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { atlasPageMetadata } from "@/lib/atlas/metadata";
import { resolveAtlasPage } from "@/lib/atlas/page-context";
import { getBrand } from "@/lib/brand";
import { parseParagraphs } from "@/lib/content/headed-list";
import { getEditorialFeed } from "@/lib/editorial";
import { isEditorialDeskKey } from "@/lib/editorial/desks";
import type { EditorialItem } from "@/lib/editorial/types";
import {
  resolveAccentForBusinessUnitSlug,
  resolveSiteKeyForBusinessUnitSlug,
} from "@/lib/homepage/business-unit-accent";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { getProjectArchive, getProjectSingle } from "@/lib/projects";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";

// A single project (Atlas direction, owner-approved 2026-09-16).
//
// The record opens on its own photograph with the facts that matter at a
// glance — status, year, the first two statistics — then the body as prose
// beside a ledger of every statistic, the gallery, the desk's latest writing,
// and the next project in the archive as a full-width invitation. Every field
// is the project's own CMS record; the related writing is the newsroom feed
// filtered to the project's company.

const ARCHIVE_SIZE = 48;

interface ProjectPageProps {
  readonly params: Promise<{ readonly siteKey: string; readonly slug: string }>;
}

function projectUri(slug: string): string {
  return `/projects/${slug}/`;
}

async function resolve(params: ProjectPageProps["params"]) {
  const { slug } = await params;
  const context = await resolveAtlasPage(params, []);

  if (!/^[a-z0-9-]+$/u.test(slug)) notFound();

  const resolution = await getProjectSingle(context.site.key, projectUri(slug));

  if (resolution.status !== "ready") notFound();

  return { ...context, slug, project: resolution.project };
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { site, request, project, slug } = await resolve(params);
  const [brand, requestHeaders] = await Promise.all([getBrand(site.key), headers()]);
  const discovery = resolveSiteDiscoveryContext(site.key, requestHeaders.get("host") ?? "");
  const path = `/projects/${slug}`;

  return atlasPageMetadata({
    base: buildSiteMetadata(discovery, brand, path, { locale: request.locale, path }),
    title: project.title,
    description: project.excerpt,
    image: project.featuredImage,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { site, chrome, project, href } = await resolve(params);

  const unit = project.unit ?? project.relatedCompanies[0]?.unit ?? null;
  const accent = unit === null ? null : resolveAccentForBusinessUnitSlug(unit.slug);
  const company = project.relatedCompanies[0] ?? null;
  const companySiteKey = unit === null ? null : resolveSiteKeyForBusinessUnitSlug(unit.slug);
  const companySite = companySiteKey === null ? null : getSiteDefinition(companySiteKey);

  const [archive, feed] = await Promise.all([
    getProjectArchive(site.key, ARCHIVE_SIZE),
    getEditorialFeed(site.key, 12),
  ]);

  // The next project in archive order, wrapping to the first.
  let next = null;
  if (archive.status === "ready" && archive.page.items.length > 1) {
    const index = archive.page.items.findIndex((item) => item.databaseId === project.databaseId);
    next = archive.page.items[(index + 1) % archive.page.items.length] ?? null;
    if (next !== null && next.databaseId === project.databaseId) next = null;
  }

  // The desk's latest writing: the feed filtered to the project's company.
  const related: EditorialItem[] =
    feed.status === "ready"
      ? feed.page.items
          .filter((item) => unit !== null && isEditorialDeskKey(unit.slug) && item.desks.includes(unit.slug))
          .slice(0, 2)
      : [];

  const facts: PageHeroFact[] = [];
  if (project.status !== null) facts.push({ value: project.status, label: chrome.statusLabel });
  if (project.year !== null) facts.push({ value: project.year, label: chrome.yearLabel });
  for (const statistic of project.statistics.slice(0, 2)) {
    facts.push({ value: statistic.value, label: statistic.label });
  }

  const paragraphs = parseParagraphs(project.content);
  const eyebrow = [project.subtitle, project.location].filter((part) => part !== null).join(" · ");
  const crumbs = [
    { label: chrome.projects, href: href("/projects") },
    ...(company !== null
      ? [
          {
            label: accent?.label ?? company.title,
            href: companySite === null ? null : `https://${companySite.canonicalHostname}`,
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHero
        headingId="project-heading"
        heading={project.title}
        eyebrow={eyebrow === "" ? null : eyebrow}
        lead={project.excerpt}
        image={project.featuredImage}
        crumbs={crumbs}
        facts={facts}
        accentColor={accent?.color}
      />

      <Section labelledBy="project-heading" className="bg-brand-paper">
        <PageContainer className="atlas-two-col">
          {paragraphs.length > 0 ? (
            <div className="atlas-prose">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="reveal"
                  style={{ "--reveal-offset": `${String(Math.min(index, 4) * 1.5)}%` } as CSSProperties}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <div />
          )}

          <aside className="atlas-aside reveal" aria-label={chrome.atAGlance}>
            <p className="atlas-aside__label">{chrome.atAGlance}</p>
            {project.location !== null ? (
              <div className="atlas-aside__row">
                <span>{chrome.whereWeWork}</span>
                <b>{project.location}</b>
              </div>
            ) : null}
            {project.status !== null ? (
              <div className="atlas-aside__row">
                <span>{chrome.statusLabel}</span>
                <b>{project.status}</b>
              </div>
            ) : null}
            {project.statistics.map((statistic) => (
              <div key={`${statistic.label}-${statistic.value}`} className="atlas-aside__row">
                <span>{statistic.label}</span>
                <b>{statistic.value}</b>
              </div>
            ))}
            {site.key === "group" ? (
              <InvestorPackDrawer
                chrome={chrome}
                eyebrow="Investor relations"
                trigger={
                  <>
                    {chrome.requestPack} <span aria-hidden="true">&rarr;</span>
                  </>
                }
                triggerClassName="atlas-aside__action press inline-flex items-center gap-2 rounded-sm bg-brand-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-paper hover:bg-brand-ink/90"
              />
            ) : (
              <Link
                href={href("/contact")}
                className="atlas-aside__action press inline-flex items-center gap-2 rounded-sm bg-brand-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-paper hover:bg-brand-ink/90"
              >
                {chrome.startConversation} <span aria-hidden="true">&rarr;</span>
              </Link>
            )}
          </aside>
        </PageContainer>
      </Section>

      {project.gallery.length > 0 ? (
        <Section label={chrome.gallery} space="tight" className="bg-brand-tint">
          <PageContainer>
            <SectionEyebrow tone="accent" className="reveal">
              {chrome.gallery}
            </SectionEyebrow>
            <div className="atlas-gallery mt-8">
              {project.gallery.map((image, index) => (
                <figure
                  key={image.databaseId}
                  className="reveal"
                  style={{ "--reveal-offset": `${String(Math.min(index, 3) * 1.5)}%` } as CSSProperties}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.sourceUrl}
                    alt={image.altText ?? ""}
                    width={image.width ?? undefined}
                    height={image.height ?? undefined}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              ))}
            </div>
          </PageContainer>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section label={chrome.newsAndPerspectives} space="tight" className="bg-brand-paper">
          <PageContainer>
            <SectionEyebrow tone="accent" className="reveal">
              {chrome.newsAndPerspectives}
            </SectionEyebrow>
            <div className="mt-8">
              <InsightRows items={related} href={href} />
            </div>
          </PageContainer>
        </Section>
      ) : null}

      {next !== null ? (
        <Link href={href(next.href)} className="atlas-next" aria-label={`${chrome.nextProjectLabel}: ${next.title}`}>
          {next.featuredImage !== null ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="atlas-next__bg"
              src={next.featuredImage.sourceUrl}
              alt=""
              width={next.featuredImage.width ?? undefined}
              height={next.featuredImage.height ?? undefined}
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <PageContainer className="atlas-next__body">
            <SectionEyebrow tone="bright" className="reveal">
              {chrome.nextProjectLabel}
            </SectionEyebrow>
            <span className="atlas-display atlas-display--l reveal block">{next.title}</span>
            {next.location !== null || next.status !== null ? (
              <span className="atlas-lead reveal atlas-on-deep block">
                {[next.location, next.status].filter((part) => part !== null).join(" · ")}
              </span>
            ) : null}
          </PageContainer>
        </Link>
      ) : null}
    </>
  );
}
