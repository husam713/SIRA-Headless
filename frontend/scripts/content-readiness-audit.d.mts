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
  readonly technicalClassification: ReadinessClassification;
  readonly contentAuthority: ContentAuthorityState;
  readonly evidence: string;
  readonly expectedCanonicalState: string;
  readonly owner: string;
  readonly recommendedAction: string;
  readonly destructive: false;
  readonly mutationAuthorized: false;
  readonly verificationMethod: string;
}

export type ContentAuthorityState =
  | "APPROVED_LAUNCH_CONTENT"
  | "UNAPPROVED_EXISTING_CONTENT"
  | "NO_CONTENT"
  | "NOT_APPLICABLE";

export interface ContentAuthorityMatrix {
  readonly frontPage: ContentAuthorityState;
  readonly primaryMenu: ContentAuthorityState;
  readonly footerMenu: ContentAuthorityState;
  readonly legalMenu: ContentAuthorityState;
  readonly businessUnit: ContentAuthorityState;
  readonly editorial: ContentAuthorityState;
  readonly projects: ContentAuthorityState;
  readonly brand: ContentAuthorityState;
  readonly announcement: ContentAuthorityState;
  readonly emergency: ContentAuthorityState;
  readonly media: ContentAuthorityState;
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

export function classifyContentAuthority(
  siteKey: string,
  site: unknown,
): ContentAuthorityMatrix;

export function applyLaunchAuthority(
  technicalMatrix: SiteReadinessMatrix,
  contentAuthority: ContentAuthorityMatrix,
): SiteReadinessMatrix;

export function buildFindings(
  sites: Readonly<Record<string, unknown>>,
  matrix: Readonly<
    Record<string, SiteReadinessMatrix>
  >,
  technicalMatrix?: Readonly<Record<string, SiteReadinessMatrix>>,
  contentAuthorityMatrix?: Readonly<Record<string, ContentAuthorityMatrix>>,
): readonly ReadinessFinding[];

export function runContentReadinessAudit(
  environment: Readonly<Record<string, string | undefined>>,
  auditedAt?: string,
): Promise<Readonly<Record<string, unknown>>>;
