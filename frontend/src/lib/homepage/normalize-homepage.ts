import type {
  BranchHomepage,
  BranchHomepageHero,
  GroupHomepage,
  HomepageHero,
  HomepageResolution,
  InvalidHomepageReason,
} from "@/lib/homepage/types";
import type { SiraHomepageQueryData } from "@/queries/homepage";
import type { SiteKey } from "@/types/site";

function normalizeText(
  value: string | null | undefined,
  maximumLength: number,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  return normalized === "" ? null : normalized.slice(0, maximumLength);
}

function invalid(
  siteKey: SiteKey,
  reason: InvalidHomepageReason,
): HomepageResolution {
  return Object.freeze({
    status: "invalid",
    siteKey,
    reason,
  });
}

function normalizeHero(
  hero: {
    readonly headingBefore: string | null;
    readonly headingHighlight: string | null;
    readonly headingAfter: string | null;
    readonly description: string | null;
  },
): HomepageHero {
  return Object.freeze({
    headingBefore: normalizeText(hero.headingBefore, 240),
    headingHighlight: normalizeText(hero.headingHighlight, 240),
    headingAfter: normalizeText(hero.headingAfter, 240),
    description: normalizeText(hero.description, 1200),
  });
}

export function normalizeHomepage(
  siteKey: SiteKey,
  data: SiraHomepageQueryData,
): HomepageResolution {
  if (
    typeof data !== "object" ||
    data === null ||
    !("page" in data)
  ) {
    return invalid(siteKey, "invalid-page");
  }

  const page = data.page;

  if (page === null) {
    return Object.freeze({
      status: "not-found",
      siteKey,
      reason: "homepage-not-configured",
    });
  }

  if (
    !Number.isSafeInteger(page.databaseId) ||
    page.databaseId <= 0 ||
    page.uri !== "/"
  ) {
    return invalid(siteKey, "invalid-page");
  }

  const fields = page.siraHomepage;

  if (fields === null) {
    return invalid(siteKey, "missing-homepage-data");
  }

  const expectedVariant = siteKey === "group" ? "group" : "branch";

  if (fields.variant !== expectedVariant) {
    return invalid(siteKey, "variant-mismatch");
  }

  const title = normalizeText(page.title, 240);

  if (siteKey === "group") {
    const hero = fields.groupHomepage?.hero;

    if (hero === null || hero === undefined) {
      return invalid(siteKey, "missing-variant-data");
    }

    const homepage: GroupHomepage = Object.freeze({
      siteKey,
      databaseId: page.databaseId,
      uri: "/",
      title,
      variant: "group",
      hero: normalizeHero(hero),
    });

    return Object.freeze({ status: "ready", homepage });
  }

  const hero = fields.branchHomepage?.hero;

  if (hero === null || hero === undefined) {
    return invalid(siteKey, "missing-variant-data");
  }

  const branchHero: BranchHomepageHero = Object.freeze({
    ...normalizeHero(hero),
    eyebrow: normalizeText(hero.eyebrow, 160),
    region: normalizeText(hero.region, 160),
  });
  const homepage: BranchHomepage = Object.freeze({
    siteKey,
    databaseId: page.databaseId,
    uri: "/",
    title,
    variant: "branch",
    hero: branchHero,
  });

  return Object.freeze({ status: "ready", homepage });
}
