import { GridItem, PageGrid } from "@/components/layout/page-grid";
import { Section } from "@/components/layout/section";
import { CtaLink } from "@/components/homepage/cta-link";
import { formatContentDate } from "@/lib/homepage/format-date";
import type {
  HomepageContentItem,
  HomepageEditorialSection,
} from "@/lib/homepage/types";

interface GroupLatestUpdatesProps {
  readonly section: HomepageEditorialSection | null;
}

const KIND_LABELS: Readonly<Record<string, string>> = Object.freeze({
  article: "Article",
  insight: "Insight",
  news: "News",
  "press-release": "Press Release",
});

interface UpdateMetaProps {
  readonly item: HomepageContentItem;
  readonly className?: string;
}

function UpdateMeta({ item, className = "" }: UpdateMetaProps) {
  const label = KIND_LABELS[item.kind] ?? item.kind;
  const date = formatContentDate(item.date);

  return (
    <div className={className}>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-accent">
        {label}
      </p>
      {date !== null ? (
        <p className="mt-2 text-xs font-medium text-brand-ink-faint">
          {date}
        </p>
      ) : null}
    </div>
  );
}

interface UpdateBodyProps {
  readonly item: HomepageContentItem;
  readonly headingClassName: string;
}

function UpdateBody({ item, headingClassName }: UpdateBodyProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className={`font-display font-normal leading-[1.15] ${headingClassName}`}>
        {item.title}
      </h3>
      {item.excerpt !== null ? (
        <p className="text-[15px] leading-relaxed text-brand-ink-soft">
          {item.excerpt}
        </p>
      ) : null}
      {/*
        No "Read More" link: item.href is the CMS content node's own uri
        (e.g. /insights/some-article/), but this app has no article/insight
        detail route yet — only the homepage is implemented under
        (sites)/[siteKey]. Linking it would 404. Restore this once a detail
        route exists for the relevant content kinds.
      */}
    </div>
  );
}

export function GroupLatestUpdates({ section }: GroupLatestUpdatesProps) {
  if (section === null || section.selection.status !== "ready") return null;

  const [first, ...rest] = section.selection.items;

  return (
    <Section labelledBy="latest-updates-heading" className="border-b border-brand-border">
      <PageGrid className="gap-y-10">
        <GridItem span={3}>
          <h2
            id="latest-updates-heading"
            className="text-[11px] font-bold uppercase tracking-[0.12em]"
          >
            {section.eyebrow ?? "Latest Updates"}
          </h2>
          {section.heading !== null ? (
            <p className="mt-4 font-display text-2xl font-normal leading-tight">
              {section.heading}
            </p>
          ) : null}
          {section.description !== null ? (
            <p className="mt-4 text-sm leading-relaxed text-brand-ink-soft">
              {section.description}
            </p>
          ) : null}
          {section.link !== null ? (
            <div className="mt-6">
              <CtaLink link={section.link} variant="ghost-light" />
            </div>
          ) : null}
        </GridItem>

        <GridItem span={9}>
          {first !== undefined ? (
            <div className="flex flex-col gap-6 border-t border-brand-border pt-6 sm:flex-row sm:gap-12">
              <UpdateMeta item={first} className="sm:w-36 sm:flex-shrink-0" />
              <UpdateBody
                item={first}
                headingClassName="text-[clamp(1.375rem,2.5vw,2rem)]"
              />
            </div>
          ) : null}

          {rest.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-10">
              {rest.map((item) => (
                <div
                  key={item.databaseId}
                  className="flex flex-col gap-4 border-t border-brand-border pt-6"
                >
                  <UpdateMeta item={item} />
                  <UpdateBody item={item} headingClassName="text-xl" />
                </div>
              ))}
            </div>
          ) : null}
        </GridItem>
      </PageGrid>
    </Section>
  );
}
