import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionHead } from "@/components/layout/section-head";
import { CtaLink } from "@/components/homepage/cta-link";
import { CHROME, localizeUnitLabel } from "@/lib/i18n/locale";
import type { LocaleCode } from "@/types/site";
import { ProjectCard, type ProjectCardData } from "@/components/atlas/project-card";
import { getBrandPreset } from "@/lib/brand";
import { resolveBusinessUnitAccent } from "@/lib/homepage/business-unit-accent";
import type {
  HomepageContentItem,
  HomepageContentSection,
} from "@/lib/homepage/types";

// Atlas direction (owner-approved 2026-09-16): an editorial grid rather than
// three equal cards — the first two projects share a row 7/5, the rest sit in
// thirds — each with a status badge on the picture, the company and place as
// the kicker, and the picture pushing in under the pointer. The cards arrive
// one after another (the grid is a stagger group; each card's `--d` is its
// place in it).
//
// Each card links to the project's own page: `item.href` is the project's URI
// in WordPress (`/projects/<slug>/`), which is the route this app serves.

interface GroupProjectsProps {
  readonly section: HomepageContentSection | null;
  readonly exploreLabel?: string;
  readonly locale?: LocaleCode;
}

function toCard(item: HomepageContentItem, locale: LocaleCode): ProjectCardData {
  const groupPreset = getBrandPreset("group");
  const fallback = Object.freeze({ label: groupPreset.name, color: groupPreset.identity.accent });
  const unit = item.businessUnit.status === "ready" ? (item.businessUnit.items[0] ?? null) : null;
  const accent = unit === null ? null : resolveBusinessUnitAccent(item.businessUnit, fallback);

  return {
    databaseId: item.databaseId,
    title: item.title,
    href: item.href,
    excerpt: item.excerpt,
    featuredImage: item.featuredImage,
    status: item.status,
    location: item.location,
    year: item.date === null ? null : item.date.slice(0, 4),
    unitLabel: localizeUnitLabel(locale, unit?.slug ?? null, unit?.name ?? accent?.label ?? null),
    unitSlug: unit?.slug ?? null,
    accentColor: accent?.color ?? null,
  };
}

export function GroupProjects({ section, exploreLabel, locale = "en" }: GroupProjectsProps) {
  const explore = exploreLabel ?? CHROME[locale].explore;
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

        <div className="atlas-projects" data-stagger>
          {section.selection.items.map((item, index) => (
            <ProjectCard key={item.databaseId} item={toCard(item, locale)} index={index} exploreLabel={explore} />
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
