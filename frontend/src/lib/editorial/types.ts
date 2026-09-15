import type { SiteKey } from "@/types/site";

export type EditorialTypename =
  | "SiraNewsItem"
  | "SiraInsight"
  | "SiraArticle"
  | "SiraPressRelease";

export type EditorialKind =
  | "news"
  | "insight"
  | "article"
  | "press-release";

export type EditorialContentTypeName =
  | "sira_news"
  | "sira_insight"
  | "sira_article"
  | "sira_press_release";

/**
 * The CMS-owned Business Unit slugs. ADR-014 fixes these exact strings; note
 * `real-estate`, which is deliberately not derivable from the `realestate`
 * site key.
 */
export type EditorialBusinessUnitSlug =
  | "consulting"
  | "healthcare"
  | "lifestyle"
  | "real-estate";

/**
 * Where an entry was filed. The four companies, plus `group` for SIRA GROUP
 * itself — which is the ABSENCE of a Business Unit term, per the ADR-014
 * mapping `group -> null`.
 */
export type EditorialDeskKey = "group" | EditorialBusinessUnitSlug;

export type EditorialDiagnosticCode =
  | "restricted-node"
  | "invalid-node-identity"
  | "unsupported-node-type"
  | "content-type-mismatch"
  | "invalid-title"
  | "unsafe-uri"
  | "invalid-publication-date"
  | "invalid-modified-date"
  | "invalid-featured-image"
  | "unknown-business-unit";

export interface EditorialDiagnostic {
  readonly code: EditorialDiagnosticCode;
  readonly nodeDatabaseId: number | null;
}

export interface EditorialImage {
  readonly databaseId: number;
  readonly sourceUrl: string;
  readonly altText: string | null;
  readonly width: number | null;
  readonly height: number | null;
}

export interface EditorialItem {
  readonly databaseId: number;
  readonly typename: EditorialTypename;
  readonly contentTypeName: EditorialContentTypeName;
  readonly kind: EditorialKind;
  readonly title: string;
  readonly excerpt: string | null;
  readonly href: string;
  readonly publishedAt: string | null;
  readonly modifiedAt: string | null;
  readonly featuredImage: EditorialImage | null;
  /**
   * The desks this entry belongs to, in canonical order, never empty.
   *
   * An entry with no Business Unit term resolves to the desk of the tenant that
   * published it, so a Group item with no term is Group's own reporting rather
   * than an unlabelled row. A joint announcement can carry two.
   */
  readonly desks: readonly EditorialDeskKey[];
}

export interface EditorialPageInfo {
  readonly hasNextPage: boolean;
  readonly endCursor: string | null;
}

export interface EditorialPage {
  readonly items: readonly EditorialItem[];
  readonly pageInfo: EditorialPageInfo;
  readonly diagnostics: readonly EditorialDiagnostic[];
}

export type InvalidEditorialFeedReason =
  | "invalid-pagination-request"
  | "invalid-connection"
  | "invalid-page-info"
  | "duplicate-node-identity"
  | "no-valid-items";

export type EditorialFeedResolution =
  | Readonly<{
      status: "ready";
      siteKey: SiteKey;
      page: EditorialPage;
    }>
  | Readonly<{
      status: "empty";
      siteKey: SiteKey;
      pageInfo: EditorialPageInfo;
    }>
  | Readonly<{
      status: "invalid";
      siteKey: SiteKey;
      reason: InvalidEditorialFeedReason;
      diagnostics: readonly EditorialDiagnostic[];
    }>
  | Readonly<{
      status: "remote-error";
      siteKey: SiteKey;
      errorName: string;
    }>;
