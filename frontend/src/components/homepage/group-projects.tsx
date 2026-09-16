import type { CSSProperties } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionHead } from "@/components/layout/section-head";
import { CtaLink } from "@/components/homepage/cta-link";
import type {
  HomepageContentItem,
  HomepageContentSection,
} from "@/lib/homepage/types";

// Atlas direction (owner-approved 2026-09-16): an editorial grid rather than
// three equal cards — the first two projects share a row 7/5, the rest sit in
// thirds — each with a status badge on the picture, the location as the
// kicker, and the picture pushing in under the pointer. The cards arrive one
// after another (`--reveal-offset`).
//
// Still not links: `item.href` is the project node's own URI and this app has
// no project detail route yet (see get-project-single.ts, which serves the
// branch-site route). The card becomes a link the day the route exists.

interface GroupProjectsProps {
  readonly section: HomepageContentSection | null;
}

interface ProjectCardProps {
  readonly item: HomepageContentItem;
  readonly index: number;
}

function ProjectCard({ item, index }: ProjectCardProps) {
  return (
    <article
      className="atlas-card reveal"
      style={{ "--reveal-offset": `${String(Math.min(index, 4) * 1.5)}%` } as CSSProperties}
    >
      <div className="atlas-card__media">
        {item.status !== null ? (
          <span className="atlas-card__badge">{item.status}</span>
        ) : null}
        {item.featuredImage !== null ? (
          // WPGraphQL media-origin allowlisting (2C4-B07) is unresolved, so a
          // plain <img> rather than next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.featuredImage.sourceUrl}
            alt={item.featuredImage.altText ?? item.title}
            width={item.featuredImage.width ?? undefined}
            height={item.featuredImage.height ?? undefined}
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>

      {item.location !== null || item.descriptor !== null ? (
        <p className="atlas-card__meta">
          <span>
            {item.descriptor !== null ? <b>{item.descriptor}</b> : null}
            {item.descriptor !== null && item.location !== null ? " · " : null}
            {item.location}
          </span>
        </p>
      ) : null}

      <h3 className="atlas-card__title">{item.title}</h3>

      {item.excerpt !== null ? <p className="atlas-card__copy">{item.excerpt}</p> : null}
    </article>
  );
}

export function GroupProjects({ section }: GroupProjectsProps) {
  if (section === null || section.selection.status !== "ready") return null;

  return (
    <Section
      id="projects"
      labelledBy="projects-heading"
      className="border-b border-brand-border bg-brand-tint"
    >
      <PageContainer>
        <SectionHead
          id="projects-heading"
          eyebrow={section.eyebrow ?? "Global Footprint"}
          heading={section.heading}
          lead={section.description}
          action={
            section.link !== null ? <CtaLink link={section.link} variant="ghost-light" /> : undefined
          }
        />

        <div className="atlas-projects">
          {section.selection.items.map((item, index) => (
            <ProjectCard key={item.databaseId} item={item} index={index} />
          ))}
        </div>

        {section.link !== null && section.description !== null ? (
          <p className="mt-12">
            <CtaLink link={section.link} variant="ghost-light" />
          </p>
        ) : null}
      </PageContainer>
    </Section>
  );
}
