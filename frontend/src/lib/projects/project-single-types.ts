import type { SiteKey } from "@/types/site";

export type ProjectSingleDiagnosticCode =
  | "invalid-featured-image"
  | "restricted-featured-image"
  | "invalid-gallery-image"
  | "restricted-gallery-image"
  | "invalid-statistic"
  | "unsupported-related-node"
  | "invalid-related-company"
  | "restricted-related-company";

export interface ProjectSingleDiagnostic {
  readonly code: ProjectSingleDiagnosticCode;
  readonly databaseId: number | null;
}

export interface ProjectSingleImage {
  readonly databaseId: number;
  readonly sourceUrl: string;
  readonly altText: string | null;
  readonly width: number | null;
  readonly height: number | null;
}

export interface ProjectSingleStatistic {
  readonly label: string;
  readonly value: string;
}

export interface ProjectSingleRelatedCompany {
  readonly databaseId: number;
  readonly title: string;
  readonly href: string;
}

export interface ProjectSingleProject {
  readonly databaseId: number;
  readonly title: string;
  readonly href: string;
  readonly excerpt: string | null;
  readonly content: string | null;
  readonly featuredImage: ProjectSingleImage | null;
  readonly subtitle: string | null;
  readonly location: string | null;
  readonly status: string | null;
  readonly gallery: readonly ProjectSingleImage[];
  readonly statistics: readonly ProjectSingleStatistic[];
  readonly relatedCompanies: readonly ProjectSingleRelatedCompany[];
  readonly diagnostics: readonly ProjectSingleDiagnostic[];
}

export type InvalidProjectSingleReason =
  | "invalid-locator"
  | "invalid-project"
  | "locator-mismatch"
  | "invalid-gallery"
  | "truncated-gallery"
  | "duplicate-gallery-identity"
  | "invalid-statistics"
  | "invalid-related-companies"
  | "truncated-related-companies"
  | "duplicate-related-company-identity";

export type ProjectSingleResolution =
  | Readonly<{
      status: "ready";
      siteKey: SiteKey;
      project: ProjectSingleProject;
    }>
  | Readonly<{
      status: "not-found";
      siteKey: SiteKey;
    }>
  | Readonly<{
      status: "invalid";
      siteKey: SiteKey;
      reason: InvalidProjectSingleReason;
      diagnostics: readonly ProjectSingleDiagnostic[];
    }>
  | Readonly<{
      status: "remote-error";
      siteKey: SiteKey;
      errorName: string;
    }>;
