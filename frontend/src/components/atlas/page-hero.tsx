import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";

// The opening of every Atlas inner page (owner-approved direction,
// 2026-09-16): a photograph under the overlay header, the copy at the foot of
// the frame, arriving line by line the way the homepage hero does.
//
// Everything rendered here is CMS content — the page's own intro block, its
// featured image, or a record's fields. The component never invents copy: a
// missing heading is a missing heading, and the route decides what that means.

export interface PageHeroCrumb {
  readonly label: string;
  readonly href: string | null;
}

export interface PageHeroFact {
  readonly value: string;
  readonly label: string;
}

export interface PageHeroImage {
  readonly sourceUrl: string;
  readonly altText: string | null;
  readonly width: number | null;
  readonly height: number | null;
}

interface PageHeroProps {
  readonly headingId: string;
  readonly heading: string;
  /**
   * A phrase inside `heading` set in the italic accent, if the heading contains
   * it. It is a presentation hint, not a second field: the heading stays one
   * string and reads whole to assistive technology.
   */
  readonly highlight?: string | null | undefined;
  readonly eyebrow?: string | null | undefined;
  readonly lead?: string | null | undefined;
  readonly image?: PageHeroImage | null | undefined;
  readonly crumbs?: readonly PageHeroCrumb[] | undefined;
  readonly facts?: readonly PageHeroFact[] | undefined;
  readonly actions?: ReactNode;
  readonly size?: "short" | "full";
  readonly displaySize?: "xl" | "l";
  /** A company's accent, applied through `--atlas-accent` for the highlight. */
  readonly accentColor?: string | undefined;
}

function Heading({ heading, highlight }: Pick<PageHeroProps, "heading" | "highlight">) {
  if (highlight === null || highlight === undefined || highlight.trim() === "") {
    return <span className="atlas-line"><span>{heading}</span></span>;
  }

  const index = heading.indexOf(highlight);

  if (index === -1) {
    return <span className="atlas-line"><span>{heading}</span></span>;
  }

  const before = heading.slice(0, index);
  const after = heading.slice(index + highlight.length);

  return (
    <span className="atlas-line">
      <span>
        {before}
        <em>{highlight}</em>
        {after}
      </span>
    </span>
  );
}

export function PageHero({
  headingId,
  heading,
  highlight,
  eyebrow,
  lead,
  image,
  crumbs,
  facts,
  actions,
  size = "full",
  displaySize = "xl",
  accentColor,
}: PageHeroProps) {
  const style =
    accentColor === undefined
      ? undefined
      : ({ "--atlas-accent": accentColor, "--c": accentColor } as CSSProperties);
  let order = 0;
  const next = () => ({ "--i": String(order++) } as CSSProperties);

  return (
    <section
      aria-labelledby={headingId}
      className={`atlas-page-hero${size === "short" ? " atlas-page-hero--short" : ""}`}
      style={style}
    >
      {image !== null && image !== undefined ? (
        // WPGraphQL media-origin allowlisting (2C4-B07) is unresolved, so a
        // plain <img> rather than next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="atlas-page-hero__bg"
          src={image.sourceUrl}
          alt={image.altText ?? ""}
          width={image.width ?? undefined}
          height={image.height ?? undefined}
          fetchPriority="high"
          decoding="async"
        />
      ) : null}

      <PageContainer className="atlas-page-hero__body atlas-arrive">
        {crumbs !== undefined && crumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="atlas-crumbs" style={next()}>
            {crumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${String(index)}`} className="contents">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {crumb.href === null ? (
                  <span>{crumb.label}</span>
                ) : (
                  <Link href={crumb.href}>{crumb.label}</Link>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        {eyebrow !== null && eyebrow !== undefined ? (
          <SectionEyebrow tone="bright" style={next()}>
            {eyebrow}
          </SectionEyebrow>
        ) : null}

        <h1
          id={headingId}
          className={`atlas-display atlas-display--${displaySize}`}
          style={next()}
        >
          <Heading heading={heading} highlight={highlight} />
        </h1>

        {lead !== null && lead !== undefined ? (
          <p className="atlas-lead" style={next()}>
            {lead}
          </p>
        ) : null}

        {facts !== undefined && facts.length > 0 ? (
          <dl className="atlas-facts" style={next()}>
            {facts.map((fact) => (
              <div key={`${fact.label}-${fact.value}`}>
                <dd className="order-1">
                  <b>{fact.value}</b>
                </dd>
                <dt className="order-2">
                  <span>{fact.label}</span>
                </dt>
              </div>
            ))}
          </dl>
        ) : null}

        {actions !== undefined ? (
          <div className="atlas-hero-actions" style={next()}>
            {actions}
          </div>
        ) : null}
      </PageContainer>
    </section>
  );
}
