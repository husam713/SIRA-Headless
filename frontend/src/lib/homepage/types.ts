import type { SiteKey } from "@/types/site";

export type BranchSiteKey = Exclude<SiteKey, "group">;
export type HomepageVariant = "group" | "branch";

export interface HomepageLink {
  readonly label: string | null;
  readonly href: string;
  readonly target: "_blank" | null;
}

export interface HomepageMedia {
  readonly databaseId: number;
  readonly sourceUrl: string;
  readonly altText: string | null;
  readonly width: number | null;
  readonly height: number | null;
}

export interface HomepageMetric {
  readonly value: string | null;
  readonly label: string | null;
  readonly supportingText: string | null;
}

export interface HomepageBusinessUnit {
  readonly databaseId: number;
  readonly name: string;
  readonly slug: string;
}

export type HomepageContentKind =
  | "article"
  | "company"
  | "document"
  | "download"
  | "insight"
  | "investment"
  | "news"
  | "partner"
  | "press-release"
  | "project"
  | "service"
  | "testimonial"
  | "whitepaper";

export interface HomepageContentItem {
  readonly kind: HomepageContentKind;
  readonly databaseId: number;
  readonly title: string;
  readonly href: string;
  readonly excerpt: string | null;
  readonly featuredImage: HomepageMedia | null;
  readonly date: string | null;
  readonly modified: string | null;
  readonly subtitle: string | null;
  readonly location: string | null;
  readonly status: string | null;
  readonly descriptor: string | null;
  readonly externalHref: string | null;
  readonly ticketSizeLabel: string | null;
  readonly role: string | null;
  readonly organization: string | null;
  readonly relationshipLabel: string | null;
  readonly publicationDate: string | null;
  readonly version: string | null;
  /** Currently only populated for companies (`SiraCompany.siraBusinessUnits`). */
  readonly businessUnit: HomepageSelection<HomepageBusinessUnit>;
}

export type HomepageSelectionReason =
  | "invalid-connection"
  | "relationship-truncated"
  | "no-public-items";

/**
 * Every presentation section that may be omitted without collapsing the page.
 * Used to attribute a GraphQL field error to the section it actually affected;
 * an error that cannot be attributed safely stays `null` rather than being
 * blamed on the wrong section.
 */
export type HomepageSectionName =
  | "about"
  | "companies"
  | "contact"
  | "focusAreas"
  | "footer"
  | "hero"
  | "insights"
  | "investor"
  | "latestUpdates"
  | "overview"
  | "partners"
  | "projects"
  | "services"
  | "statistics"
  | "testimonials"
  | "ticker";

export interface HomepageDiagnostic {
  readonly code:
    | "content-type-mismatch"
    | "graphql-field-error"
    | "invalid-content-item"
    | "invalid-media"
    | "invalid-restriction-signal"
    | "relationship-truncated"
    | "restricted-content-item"
    | "unsupported-content-type";
  readonly databaseId: number | null;
  /**
   * The affected section when an error path maps to one exactly, otherwise
   * `null`. Never carries a GraphQL message, endpoint, or query text: this
   * value reaches the browser through the rendered payload.
   */
  readonly section: HomepageSectionName | null;
}

export type HomepageSelection<T> =
  | Readonly<{
      status: "ready";
      items: readonly T[];
      diagnostics: readonly HomepageDiagnostic[];
    }>
  | Readonly<{
      status: "empty";
      items: readonly [];
      diagnostics: readonly HomepageDiagnostic[];
    }>
  | Readonly<{
      status: "invalid";
      reason: HomepageSelectionReason;
      items: readonly [];
      diagnostics: readonly HomepageDiagnostic[];
    }>;

export interface HomepageSectionHeader {
  readonly eyebrow: string | null;
  readonly heading: string | null;
  readonly description: string | null;
  readonly link: HomepageLink | null;
}

export interface HomepageContentSection extends HomepageSectionHeader {
  readonly sourceMode: string | null;
  readonly itemLimit: number | null;
  readonly selection: HomepageSelection<HomepageContentItem>;
}

export interface HomepageEditorialSection extends HomepageContentSection {
  readonly sourceMode: string | null;
  readonly itemLimit: number | null;
}

export interface HomepageRichTextSection extends HomepageSectionHeader {
  readonly body: string | null;
}

export interface HomepageContactSection {
  readonly eyebrow: string | null;
  readonly heading: string | null;
  readonly description: string | null;
  readonly formVariant: string | null;
  readonly formContext: string | null;
}

export interface HomepageHero {
  readonly headingBefore: string | null;
  readonly headingHighlight: string | null;
  readonly headingAfter: string | null;
  readonly description: string | null;
  readonly primaryCta: HomepageLink | null;
  readonly secondaryCta: HomepageLink | null;
}

export interface GroupHomepageHeroSlide {
  readonly title: string | null;
  readonly eyebrow: string | null;
  readonly description: string | null;
  readonly location: string | null;
  readonly imageAlt: string | null;
  readonly image: HomepageMedia | null;
  readonly mobileImage: HomepageMedia | null;
  readonly primaryCta: HomepageLink | null;
  readonly secondaryCta: HomepageLink | null;
  readonly businessUnit: HomepageSelection<HomepageBusinessUnit>;
  readonly relatedProject: HomepageSelection<HomepageContentItem>;
  readonly relatedCompany: HomepageSelection<HomepageContentItem>;
}

export interface GroupHomepageHero extends HomepageHero {
  readonly slides: readonly GroupHomepageHeroSlide[];
}

export interface HomepageTickerItem {
  readonly label: string | null;
  readonly link: HomepageLink | null;
  readonly businessUnit: HomepageSelection<HomepageBusinessUnit>;
}

export interface HomepageTicker {
  readonly enabled: boolean;
  readonly items: readonly HomepageTickerItem[];
}

export interface HomepageMetricsSection extends HomepageRichTextSection {
  readonly metrics: readonly HomepageMetric[];
}

export interface HomepageInvestorSection extends HomepageMetricsSection {
  readonly formHeading: string | null;
  readonly formDescription: string | null;
  readonly investments: HomepageSelection<HomepageContentItem>;
  readonly onePager: HomepageSelection<HomepageContentItem>;
}

export interface GroupHomepage {
  readonly siteKey: "group";
  readonly databaseId: number;
  readonly uri: "/";
  readonly title: string | null;
  readonly variant: "group";
  /**
   * Nullable like every other section: a hero that is absent or that failed to
   * resolve is omitted, and the rest of the homepage still renders. Only the
   * page envelope itself is critical.
   */
  readonly hero: GroupHomepageHero | null;
  readonly ticker: HomepageTicker | null;
  readonly latestUpdates: HomepageEditorialSection | null;
  readonly companies: HomepageContentSection | null;
  readonly about: HomepageMetricsSection | null;
  readonly investor: HomepageInvestorSection | null;
  readonly services: HomepageContentSection | null;
  readonly projects: HomepageContentSection | null;
  readonly insights: HomepageEditorialSection | null;
  readonly testimonials: HomepageContentSection | null;
  readonly partners: HomepageContentSection | null;
  readonly contact: HomepageContactSection | null;
  /** Page-level diagnostics, e.g. a section dropped by a GraphQL field error. */
  readonly diagnostics: readonly HomepageDiagnostic[];
}

export interface BranchHomepageHero extends HomepageHero {
  readonly eyebrow: string | null;
  readonly region: string | null;
  readonly imageAlt: string | null;
  readonly image: HomepageMedia | null;
  readonly mobileImage: HomepageMedia | null;
}

export interface HomepageFocusArea {
  readonly title: string | null;
  readonly description: string | null;
}

export interface BranchHomepageFooter {
  readonly taglineOverride: string | null;
  readonly groupLinkLabelOverride: string | null;
}

export interface BranchHomepage {
  readonly siteKey: BranchSiteKey;
  readonly databaseId: number;
  readonly uri: "/";
  readonly title: string | null;
  readonly variant: "branch";
  /** Nullable for the same reason as `GroupHomepage.hero`. */
  readonly hero: BranchHomepageHero | null;
  readonly statistics: readonly HomepageMetric[];
  readonly overview: HomepageRichTextSection | null;
  readonly focusAreas: readonly HomepageFocusArea[];
  readonly projects: HomepageContentSection | null;
  readonly insights: HomepageEditorialSection | null;
  readonly contact: HomepageContactSection | null;
  readonly footer: BranchHomepageFooter | null;
  /** Page-level diagnostics, e.g. a section dropped by a GraphQL field error. */
  readonly diagnostics: readonly HomepageDiagnostic[];
}

export type Homepage = GroupHomepage | BranchHomepage;

export type InvalidHomepageReason =
  | "invalid-page"
  | "missing-homepage-data"
  | "variant-mismatch"
  | "missing-variant-data";

export type HomepageResolution =
  | Readonly<{ status: "ready"; homepage: Homepage }>
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
