export interface ActionEvidenceInput {
  readonly evidenceAvailable: boolean;
  readonly observedState: unknown;
  readonly acceptedCurrentState: unknown;
  readonly acceptedExpectedState: unknown;
  readonly blockedBySot001?: boolean;
}

export interface ActionEvidenceResult {
  readonly evidenceStatus:
    | "VALIDATED_UNCHANGED"
    | "CHANGED_AS_EXPECTED"
    | "DRIFT_DETECTED"
    | "EVIDENCE_UNKNOWN"
    | "BLOCKED_BY_SOT_001";
  readonly evidenceClassification: "CONFIRMED" | "UNKNOWN";
}

export function classifyActionEvidence(input: ActionEvidenceInput): ActionEvidenceResult;

export function classifyDrift(input: {
  readonly requiredEvidenceAvailable: boolean;
  readonly comparisonsMatch: boolean;
}): Readonly<{
  status: "NONE_DETECTED" | "DRIFT_DETECTED" | "EVIDENCE_BLOCKED";
  evidenceClassification: "CONFIRMED" | "UNKNOWN";
}>;

export function derivePreflightStatus(input: {
  readonly tenantsInspected: number;
  readonly requiredTenantCount: number;
  readonly detailedTenantEvidenceAvailable: boolean;
  readonly groupInventoryAvailable: boolean;
  readonly actionEvidenceAvailable: boolean;
}): "READY_FOR_INDEPENDENT_REVIEW" | "BLOCKED";

export const HOMEPAGE_DETAIL_QUERY: string;
export const GROUP_ENTITY_QUERY: string;

export function runCmsPreflight(input: Readonly<Record<string, unknown>>): Promise<Readonly<Record<string, unknown>>>;

export function reconcileExistingPreflight(
  existing: Readonly<Record<string, unknown>>,
  manifest: Readonly<Record<string, unknown>>,
  reconciledAt?: string,
): Readonly<Record<string, unknown>>;
