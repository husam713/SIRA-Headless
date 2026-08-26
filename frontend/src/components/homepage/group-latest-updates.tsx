import Link from "next/link";
import { CtaLink } from "@/components/homepage/cta-link";
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

function formatUpdateDate(value: string | null): string | null {
  if (value === null) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}

interface UpdateMetaProps {
  readonly item: HomepageContentItem;
  readonly className?: string;
}

function UpdateMeta({ item, className = "" }: UpdateMetaProps) {
  const label = KIND_LABELS[item.kind] ?? item.kind;
  const date = formatUpdateDate(item.date);

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
      <Link
        href={item.href}
        className="w-fit text-[11px] font-bold uppercase tracking-[0.1em] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
      >
        Read More
      </Link>
    </div>
  );
}

export function GroupLatestUpdates({ section }: GroupLatestUpdatesProps) {
  if (section === null || section.selection.status !== "ready") return null;

  const [first, ...rest] = section.selection.items;

  return (
    <section
      aria-labelledby="latest-updates-heading"
      className="border-b border-brand-border py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto grid w-full max-w-[82.5rem] grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="lg:col-span-3">
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
        </div>

        <div className="lg:col-span-9">
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
        </div>
      </div>
    </section>
  );
}
