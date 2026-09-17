import Link from "next/link";
import type { CSSProperties } from "react";

// The project card, shared by the homepage chapter and the archive. One shape,
// so a project looks the same wherever it appears: status badge on the
// picture, the company and place as the kicker, the year at the trailing edge,
// the title, one line of summary, and the picture pushing in under the pointer.
//
// Plain data in, so the archive's client-side filter can render it too.

export interface ProjectCardImage {
  readonly sourceUrl: string;
  readonly altText: string | null;
  readonly width: number | null;
  readonly height: number | null;
}

export interface ProjectCardData {
  readonly databaseId: number;
  readonly title: string;
  /** The route the card opens, or null where the project has no page. */
  readonly href: string | null;
  readonly excerpt: string | null;
  readonly featuredImage: ProjectCardImage | null;
  readonly status: string | null;
  readonly location: string | null;
  readonly year: string | null;
  /** The company kicker (`Real Estate`) and its accent. */
  readonly unitLabel: string | null;
  readonly unitSlug: string | null;
  readonly accentColor: string | null;
}

interface ProjectCardProps {
  readonly item: ProjectCardData;
  readonly index: number;
  readonly exploreLabel: string;
}

export function ProjectCard({ item, index, exploreLabel }: ProjectCardProps) {
  const style = {
    "--reveal-offset": `${String(Math.min(index, 4) * 1.5)}%`,
    ...(item.accentColor !== null ? { "--c": item.accentColor } : {}),
  } as CSSProperties;

  return (
    <article
      className="atlas-card reveal"
      style={style}
      data-unit={item.unitSlug ?? undefined}
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

      {item.unitLabel !== null || item.location !== null || item.year !== null ? (
        <p className="atlas-card__meta">
          <span>
            {item.unitLabel !== null ? (
              <b style={item.accentColor !== null ? { color: item.accentColor } : undefined}>
                {item.unitLabel}
              </b>
            ) : null}
            {item.unitLabel !== null && item.location !== null ? " · " : null}
            {item.location}
          </span>
          {item.year !== null ? <span>{item.year}</span> : null}
        </p>
      ) : null}

      <h3 className="atlas-card__title">
        {item.href === null ? (
          item.title
        ) : (
          // The whole card is the target: the link's ::after covers it (see
          // `.atlas-card__cover`), and the title stays the accessible name.
          <Link href={item.href} className="atlas-card__cover">
            {item.title}
          </Link>
        )}
      </h3>

      {item.excerpt !== null ? <p className="atlas-card__copy">{item.excerpt}</p> : null}

      {item.href !== null ? (
        <span aria-hidden="true" className="atlas-card__go">
          {exploreLabel} <span>&rarr;</span>
        </span>
      ) : null}
    </article>
  );
}
