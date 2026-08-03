import type { CSSProperties } from "react";
import type { ResolvedBrand } from "@/lib/brand/types";

export const WORDPRESS_BRAND_TOKEN_NAMES = Object.freeze([
  "--brand-primary",
  "--brand-secondary",
  "--brand-accent",
  "--brand-paper",
  "--brand-ink",
] as const);

export const DERIVED_BRAND_TOKEN_NAMES = Object.freeze([
  "--brand-accent-bright",
  "--brand-on-accent",
  "--brand-paper-glass",
  "--brand-ink-soft",
  "--brand-ink-faint",
  "--brand-deep",
  "--brand-deep-card",
  "--brand-footer",
  "--brand-tint",
  "--brand-border",
  "--brand-shadow",
  "--brand-on-accent-border",
  "--brand-deep-border",
  "--brand-hero-overlay-top",
  "--brand-hero-overlay-middle",
  "--brand-hero-overlay-bottom",
] as const);

export type BrandCssVariables = CSSProperties &
  Readonly<Record<
    | (typeof WORDPRESS_BRAND_TOKEN_NAMES)[number]
    | (typeof DERIVED_BRAND_TOKEN_NAMES)[number],
    string
  >>;

export function createBrandCssVariables(
  brand: ResolvedBrand,
): BrandCssVariables {
  return Object.freeze({
    "--brand-primary": brand.identity.primary,
    "--brand-secondary": brand.identity.secondary,
    "--brand-accent": brand.identity.accent,
    "--brand-paper": brand.identity.paper,
    "--brand-ink": brand.identity.ink,
    "--brand-accent-bright": brand.semantic.accentBright,
    "--brand-on-accent": brand.semantic.onAccent,
    "--brand-paper-glass": brand.semantic.paperGlass,
    "--brand-ink-soft": brand.semantic.inkSoft,
    "--brand-ink-faint": brand.semantic.inkFaint,
    "--brand-deep": brand.semantic.deep,
    "--brand-deep-card": brand.semantic.deepCard,
    "--brand-footer": brand.semantic.footer,
    "--brand-tint": brand.semantic.tint,
    "--brand-border": brand.semantic.border,
    "--brand-shadow": brand.semantic.shadow,
    "--brand-on-accent-border": brand.semantic.onAccentBorder,
    "--brand-deep-border": brand.semantic.deepBorder,
    "--brand-hero-overlay-top": brand.semantic.heroOverlayTop,
    "--brand-hero-overlay-middle": brand.semantic.heroOverlayMiddle,
    "--brand-hero-overlay-bottom": brand.semantic.heroOverlayBottom,
  });
}
