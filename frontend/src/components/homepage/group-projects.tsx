import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { CtaLink } from "@/components/homepage/cta-link";
import type {
  HomepageContentItem,
  HomepageContentSection,
} from "@/lib/homepage/types";

interface GroupProjectsProps {
  readonly section: HomepageContentSection | null;
}

interface ProjectCardProps {
  readonly item: HomepageContentItem;
}

function ProjectCard({ item }: ProjectCardProps) {
  return (
    // No per-item link: item.href is the project content node's own uri, but
    // this app has no project detail route yet — same policy as Companies.
    // The section-level `link` below (real CMS data, when present) is the
    // only outbound affordance here.
    <article className="flex flex-col border border-brand-border bg-brand-paper">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-deep">
        {item.featuredImage !== null ? (
          // WPGraphQL media-origin allowlisting (2C4-B07) is unresolved, so a plain
          // <img> is used rather than next/image, which would require configuring
          // remote patterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.featuredImage.sourceUrl}
            alt={item.featuredImage.altText ?? item.title}
            width={item.featuredImage.width ?? undefined}
            height={item.featuredImage.height ?? undefined}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : null}
        {item.status !== null ? (
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 bg-brand-accent px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-on-accent"
          >
            {item.status}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-8">
        {item.location !== null ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-accent">
            {item.location}
          </p>
        ) : null}
        <h3 className="font-display text-2xl font-normal leading-tight">
          {item.title}
        </h3>
        {item.excerpt !== null ? (
          <p className="text-[15px] leading-relaxed text-brand-ink-soft">
            {item.excerpt}
          </p>
        ) : null}
        {item.status !== null ? (
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-ink-faint">
            {item.status}
          </p>
        ) : null}
      </div>
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
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-ink-faint">
              {section.eyebrow ?? "Global Footprint"}
            </p>
            {section.heading !== null ? (
              <h2
                id="projects-heading"
                className="mt-4 text-balance font-display text-[clamp(2.25rem,5vw,3.75rem)] font-normal leading-[1.05]"
              >
                {section.heading}
              </h2>
            ) : null}
          </div>
          {section.link !== null ? (
            <CtaLink link={section.link} variant="ghost-light" />
          ) : null}
        </div>

        {section.description !== null ? (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-brand-ink-soft">
            {section.description}
          </p>
        ) : null}

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {section.selection.items.map((item) => (
            <ProjectCard key={item.databaseId} item={item} />
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}
