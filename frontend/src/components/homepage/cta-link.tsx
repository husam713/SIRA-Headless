import Link from "next/link";
import type { CSSProperties } from "react";
import type { HomepageLink } from "@/lib/homepage/types";

export type CtaVariant = "solid" | "outline" | "ghost-dark" | "ghost-light";

interface CtaLinkProps {
  readonly link: HomepageLink;
  readonly variant: CtaVariant;
  /** Overrides the variant's default color, e.g. with a slide's business-unit accent. */
  readonly accentColor?: string;
}

// `press` carries the colour transition and the one-pixel press settle every
// button on the site shares (globals.css, "Press feedback").
const BASE_CLASSES =
  "press inline-flex w-fit items-center text-xs font-semibold uppercase tracking-[0.1em]";

// The design reference draws buttons as square-cornered rectangles, and the
// header CTA was squared to match in PR #60. These are the body CTAs, so they
// carry the same radius: a pill here against a rectangle in the header is the
// kind of split that made the eyebrow rule drift in the first place.
//
// The solid button lifts on hover (`btn-solid`, its accent cast as a shadow);
// the ghost variants are the prototype's text links (`textlink`): the rule
// is drawn from the leading edge under the pointer rather than faded in, and
// the arrow at the end nudges along the reading direction.
const VARIANT_CLASSES: Readonly<Record<CtaVariant, string>> = Object.freeze({
  solid:
    "btn-solid rounded-sm bg-brand-accent px-6 py-3 text-brand-on-accent hover:bg-brand-accent-bright",
  outline:
    "rounded-sm border border-brand-on-deep/40 px-6 py-3 text-brand-on-deep hover:border-brand-on-deep",
  // For use over dark/image chapters (the hero, dark sections).
  "ghost-dark": "textlink text-brand-on-deep",
  // For use over the default paper/light chapters.
  "ghost-light": "textlink text-brand-ink",
});

// Decorative: the label is the link's whole accessible name.
function Arrow({ variant }: { readonly variant: CtaVariant }) {
  if (!variant.startsWith("ghost")) return null;
  return (
    <span aria-hidden="true" className="arrow">
      &rarr;
    </span>
  );
}

export function CtaLink({ link, variant, accentColor }: CtaLinkProps) {
  const label = link.label ?? link.href;
  const className = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]}`;
  const style: CSSProperties | undefined =
    accentColor !== undefined && variant.startsWith("ghost")
      ? { color: accentColor }
      : undefined;

  if (link.href.startsWith("/")) {
    return (
      <Link href={link.href} className={className} style={style}>
        {label}
        <Arrow variant={variant} />
      </Link>
    );
  }

  return (
    <a
      href={link.href}
      className={className}
      style={style}
      target={link.target ?? undefined}
      rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
    >
      {label}
      <Arrow variant={variant} />
    </a>
  );
}
