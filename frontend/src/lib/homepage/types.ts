import type { SiteKey } from "@/types/site";

export type BranchSiteKey = Exclude<SiteKey, "group">;
export type HomepageVariant = "group" | "branch";

export interface HomepageHero {
  readonly headingBefore: string | null;
  readonly headingHighlight: string | null;
  readonly headingAfter: string | null;
  readonly description: string | null;
}

export interface GroupHomepage {
  readonly siteKey: "group";
  readonly databaseId: number;
  readonly uri: "/";
  readonly title: string | null;
  readonly variant: "group";
  readonly hero: HomepageHero;
}

export interface BranchHomepageHero extends HomepageHero {
  readonly eyebrow: string | null;
  readonly region: string | null;
}

export interface BranchHomepage {
  readonly siteKey: BranchSiteKey;
  readonly databaseId: number;
  readonly uri: "/";
  readonly title: string | null;
  readonly variant: "branch";
  readonly hero: BranchHomepageHero;
}

export type Homepage = GroupHomepage | BranchHomepage;

export type InvalidHomepageReason =
  | "invalid-page"
  | "missing-homepage-data"
  | "variant-mismatch"
  | "missing-variant-data";

export type HomepageResolution =
  | Readonly<{
      status: "ready";
      homepage: Homepage;
    }>
  | Readonly<{
      status: "not-found";
      siteKey: SiteKey;
      reason: "homepage-not-configured";
    }>
  | Readonly<{
      status: "invalid";
      siteKey: SiteKey;
      reason: InvalidHomepageReason;
    }>
  | Readonly<{
      status: "remote-error";
      siteKey: SiteKey;
      errorName: string;
    }>;
