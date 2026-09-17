import type { LocaleCode, SiteKey } from "@/types/site";

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

/**
 * The company a project belongs to, as the archive needs it: the name for the
 * card kicker and the Business Unit slug for the filter and the accent. Taken
 * from the project's own Business Unit term when it has one, otherwise from
 * the related company's, so a Group project filed only through its company
 * still filters and colours correctly.
 */
export interface ProjectArchiveUnit {
  readonly slug: string;
  readonly name: string;
}

export interface ProjectArchiveItem {
  readonly databaseId: number;
  readonly title: string;
  /** The public path this app serves for the record — `/ar/projects/…/` for a translation. */
  readonly href: string;
  /** The language the record is written in (ADR-034). */
  readonly locale: LocaleCode;
  readonly excerpt: string | null;
  readonly featuredImage: ProjectArchiveImage | null;
  readonly subtitle: string | null;
  readonly location: string | null;
  readonly status: string | null;
  /** Four-digit year of the record's publish date, or null. */
  readonly year: string | null;
  readonly unit: ProjectArchiveUnit | null;
  readonly companyTitle: string | null;
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
