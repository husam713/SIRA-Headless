export type ReadinessClassification =
  | "READY"
  | "MISSING_CONTENT"
  | "MISSING_CONFIGURATION"
  | "DATA_CORRECTION_REQUIRED"
  | "EDITORIAL_ACTION"
  | "OWNER_DECISION"
  | "BLOCKED";

export interface ReadinessFinding {
  readonly site: string;
  readonly area: string;
  readonly classification: ReadinessClassification;
  readonly evidence: string;
  readonly expectedCanonicalState: string;
  readonly owner: string;
  readonly recommendedAction: string;
  readonly destructive: false;
  readonly mutationAuthorized: false;
  readonly verificationMethod: string;
}

export interface SiteReadinessMatrix {
  readonly frontPage: ReadinessClassification;
  readonly primaryMenu: ReadinessClassification;
  readonly footerMenu: ReadinessClassification;
  readonly legalMenu: ReadinessClassification;
  readonly businessUnit: ReadinessClassification;
  readonly editorial: ReadinessClassification;
  readonly projects: ReadinessClassification;
  readonly brand: ReadinessClassification;
  readonly announcement: ReadinessClassification;
  readonly emergency: ReadinessClassification;
  readonly media: ReadinessClassification;
}

export function classifySite(
  siteKey: string,
  site: unknown,
): SiteReadinessMatrix;

export function buildFindings(
  sites: Readonly<Record<string, unknown>>,
  matrix: Readonly<
    Record<string, SiteReadinessMatrix>
  >,
): readonly ReadinessFinding[];
