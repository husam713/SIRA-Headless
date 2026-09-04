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

const BASE_CLASSES =
  "inline-flex w-fit items-center text-xs font-semibold uppercase tracking-[0.1em] transition-colors";

// The design reference draws buttons as square-cornered rectangles, and the
// header CTA was squared to match in PR #60. These are the body CTAs, so they
// carry the same radius: a pill here against a rectangle in the header is the
// kind of split that made the eyebrow rule drift in the first place.
const VARIANT_CLASSES: Readonly<Record<CtaVariant, string>> = Object.freeze({
  solid:
    "rounded-sm bg-brand-accent px-6 py-3 text-brand-on-accent hover:bg-brand-accent-bright",
  outline:
    "rounded-sm border border-brand-paper/40 px-6 py-3 text-brand-paper hover:border-brand-paper",
  // For use over dark/image chapters (the hero, dark sections).
  "ghost-dark":
    "text-brand-paper underline decoration-brand-paper/40 underline-offset-4 hover:decoration-brand-paper",
  // For use over the default paper/light chapters.
  "ghost-light":
    "text-brand-ink underline decoration-brand-ink/30 underline-offset-4 hover:decoration-brand-ink",
});

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
    </a>
  );
}
