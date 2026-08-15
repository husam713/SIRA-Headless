export interface BatchAReadinessArtifact extends Readonly<Record<string, unknown>> {
  readonly status: "REQUIRES_HUMAN_ADMIN_ACTION" | "BLOCKED_BY_DRIFT" | "UNKNOWN";
  readonly planStatus: "OWNER_ACCEPTED_PENDING_MERGE";
  readonly mutationReadiness:
    | "BLOCKED_BY_BACKUP_EVIDENCE"
    | "BLOCKED_BY_DRIFT"
    | "UNKNOWN";
}

export function deriveBatchAReadiness(
  fresh: Readonly<Record<string, unknown>>,
  accepted: Readonly<Record<string, unknown>>,
  generatedAt?: string,
): BatchAReadinessArtifact;
