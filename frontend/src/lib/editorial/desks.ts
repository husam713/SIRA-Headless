import { getBrandPreset } from "@/lib/brand/fallbacks";
import type { EditorialDeskKey, EditorialItem } from "@/lib/editorial/types";
import type { SiteKey } from "@/types/site";

// A "desk" is where a story came from: SIRA GROUP itself, or one of its
// operating companies. It is the newsroom's primary axis, because the thing
// that distinguishes a holding company's record from any other newsroom is
// *which house* filed each entry.
//
// The keys are the CMS-owned Business Unit slugs plus `group`, which is the
// absence of a term — ADR-014 maps `group -> null`, so an item on the Group
// tenant carrying no Business Unit term is Group's own reporting, not
// unclassified data.
//
// Labels and accents are frontend-owned presentation (ADR-008). The accent is
// never a new colour: it is read out of the already-approved brand preset for
// that company, so the newsroom cannot drift away from the sites it links to.

export const EDITORIAL_DESK_ORDER: readonly EditorialDeskKey[] = Object.freeze([
  "group",
  "healthcare",
  "real-estate",
  "lifestyle",
  "consulting",
  "digital",
]);

const SITE_KEY_BY_DESK: Readonly<Record<EditorialDeskKey, SiteKey>> =
  Object.freeze({
    group: "group",
    healthcare: "healthcare",
    "real-estate": "realestate",
    lifestyle: "lifestyle",
    consulting: "consulting",
    digital: "digital",
  });

// Short enough to set at 11px in a register margin without wrapping. The brand
// presets carry the full legal-ish names ("SIRA Real Estate"); repeating "SIRA"
// down every row of a page is noise, not identity.
const DESK_LABEL: Readonly<Record<EditorialDeskKey, string>> = Object.freeze({
  group: "Group",
  healthcare: "Healthcare",
  "real-estate": "Real Estate",
  lifestyle: "Lifestyle",
  consulting: "Consulting",
  digital: "Digital",
});

export function isEditorialDeskKey(value: string): value is EditorialDeskKey {
  return Object.hasOwn(SITE_KEY_BY_DESK, value);
}

export function editorialDeskLabel(desk: EditorialDeskKey): string {
  return DESK_LABEL[desk];
}

/** The company's approved brand accent, borrowed rather than reinvented. */
export function editorialDeskAccent(desk: EditorialDeskKey): string {
  return getBrandPreset(SITE_KEY_BY_DESK[desk]).identity.accent;
}

export function editorialDeskSiteKey(desk: EditorialDeskKey): SiteKey {
  return SITE_KEY_BY_DESK[desk];
}

/** The desk a tenant publishes as, used when its feed carries no terms. */
export function siteEditorialDesk(siteKey: SiteKey): EditorialDeskKey {
  return siteKey === "realestate" ? "real-estate" : siteKey;
}

/**
 * The desk an entry is filed under for display purposes.
 *
 * An item can legitimately carry more than one Business Unit term — a joint
 * announcement between two companies. The register shows the first in canonical
 * order rather than stacking badges, and `item.desks` keeps the full set for
 * filtering, so a two-desk story appears under both filters while still reading
 * as one entry.
 */
export function primaryDesk(item: EditorialItem): EditorialDeskKey {
  for (const desk of EDITORIAL_DESK_ORDER) {
    if (item.desks.includes(desk)) return desk;
  }

  return "group";
}

export interface DeskRegisterEntry {
  readonly desk: EditorialDeskKey;
  readonly label: string;
  readonly accent: string;
  readonly count: number;
  /** Share of the loaded record, 0-1. The desk index draws it as a rule. */
  readonly share: number;
}

/**
 * The composition of the house, as counts and shares over the entries actually
 * loaded.
 *
 * Every desk is listed even at zero, so the index does not change shape as the
 * archive fills — a reader learns the group's structure from the page whether
 * or not every company has published this month.
 */
export function deskRegister(
  items: readonly EditorialItem[],
): readonly DeskRegisterEntry[] {
  const total = items.length;

  return Object.freeze(
    EDITORIAL_DESK_ORDER.map((desk) => {
      const count = items.filter((item) => item.desks.includes(desk)).length;

      return Object.freeze({
        desk,
        label: DESK_LABEL[desk],
        accent: editorialDeskAccent(desk),
        count,
        share: total === 0 ? 0 : count / total,
      });
    }),
  );
}

/**
 * Resolve the `desk` search parameter, which may arrive absent, repeated, or as
 * something nobody offered. Anything unrecognised falls back to the whole
 * record rather than an empty page.
 */
export function resolveDeskFilter(
  value: string | readonly string[] | undefined,
): EditorialDeskKey | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== "string") return null;
  return isEditorialDeskKey(candidate) ? candidate : null;
}
