import type { SiteKey } from "@/types/site";

export type ProjectArchiveDiagnosticCode =
  | "restricted-project"
  | "invalid-project-identity"
  | "invalid-restriction-signal"
  | "invalid-title"
  | "unsafe-uri"
  | "invalid-featured-image"
  | "invalid-project-details";

export interface ProjectArchiveDiagnostic {
  readonly code: ProjectArchiveDiagnosticCode;
  readonly projectDatabaseId: number | null;
}

export interface ProjectArchiveImage {
  readonly databaseId: number;
  readonly sourceUrl: string;
  readonly altText: string | null;
  readonly width: number | null;
  readonly height: number | null;
}

export interface ProjectArchiveItem {
  readonly databaseId: number;
  readonly title: string;
  readonly href: string;
  readonly excerpt: string | null;
  readonly featuredImage: ProjectArchiveImage | null;
  readonly subtitle: string | null;
  readonly location: string | null;
  readonly status: string | null;
}

export interface ProjectArchivePageInfo {
  readonly hasNextPage: boolean;
  readonly endCursor: string | null;
}

export interface ProjectArchivePage {
  readonly items: readonly ProjectArchiveItem[];
  readonly pageInfo: ProjectArchivePageInfo;
  readonly diagnostics: readonly ProjectArchiveDiagnostic[];
}

export type InvalidProjectArchiveReason =
  | "invalid-pagination-request"
  | "invalid-connection"
  | "invalid-page-info"
  | "duplicate-project-identity"
  | "no-valid-items";

export type ProjectArchiveResolution =
  | Readonly<{
      status: "ready";
      siteKey: SiteKey;
      page: ProjectArchivePage;
    }>
  | Readonly<{
      status: "empty";
      siteKey: SiteKey;
      pageInfo: ProjectArchivePageInfo;
    }>
  | Readonly<{
      status: "invalid";
      siteKey: SiteKey;
      reason: InvalidProjectArchiveReason;
      diagnostics: readonly ProjectArchiveDiagnostic[];
    }>
  | Readonly<{
      status: "remote-error";
      siteKey: SiteKey;
      errorName: string;
    }>;
