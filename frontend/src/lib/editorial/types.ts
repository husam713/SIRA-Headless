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

export type EditorialDiagnosticCode =
  | "restricted-node"
  | "invalid-node-identity"
  | "unsupported-node-type"
  | "content-type-mismatch"
  | "invalid-title"
  | "unsafe-uri"
  | "invalid-publication-date"
  | "invalid-modified-date"
  | "invalid-featured-image";

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
