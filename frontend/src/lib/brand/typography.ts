import type { SiteKey } from "@/types/site";

/**
 * A tenant's typographic voice, chosen from the pairings the design system
 * already loads (`src/styles/fonts.ts`): no preset can introduce a font the
 * spec (§8) has not approved.
 *
 * - `editorial`: Newsreader for display, Archivo for the interface — the
 *   house voice, and what every tenant renders today.
 * - `modern`: Archivo for display too, tight and heavy — available for a
 *   tenant that wants a technology register. Assigning it is an owner
 *   decision; nothing selects it yet.
 *
 * Written to `<html data-typography>` so the stylesheet can retarget
 * `--font-sira-display` per tenant without a second font file, a second
 * stylesheet, or a fork.
 */
export type TypographyPreset = "editorial" | "modern";

export const TYPOGRAPHY_BY_SITE: Readonly<Record<SiteKey, TypographyPreset>> = Object.freeze({
  group: "editorial",
  consulting: "editorial",
  healthcare: "editorial",
  lifestyle: "editorial",
  realestate: "editorial",
  digital: "editorial",
});

export function typographyPresetFor(siteKey: SiteKey): TypographyPreset {
  return TYPOGRAPHY_BY_SITE[siteKey];
}
