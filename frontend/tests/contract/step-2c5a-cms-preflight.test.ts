import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  classifyActionEvidence,
  classifyDrift,
  derivePreflightStatus,
} from "../../scripts/cms-preflight-audit.mjs";

function repositoryFile(relativePath: string): string {
  return readFileSync(
    new URL(`../../../${relativePath}`, import.meta.url),
    "utf8",
  );
}

interface SiteEvidence {
  readonly inspected: boolean;
  readonly evidenceClassification: string;
  readonly previousPublicEvidenceMatches: boolean;
}

interface InventoryRecord {
  readonly typename: string;
}

interface Inventory {
  readonly returnedPublishedCount: number;
  readonly contentAuthority: string;
  readonly truncated: boolean;
  readonly records: readonly InventoryRecord[];
}

interface GroupEntityInventories {
  readonly companies: Inventory;
  readonly services: Inventory;
  readonly investments: Inventory;
  readonly testimonials: Inventory;
  readonly partners: Inventory;
  readonly documents: Inventory;
  readonly [key: string]: Inventory;
}

interface ExecutionSpec {
  readonly actionId: string;
  readonly destructive: boolean;
  readonly currentAuthorization: boolean;
  readonly rollbackMethod: string;
  readonly [key: string]: unknown;
}

interface PreflightArtifact {
  readonly stage: string;
  readonly status: string;
  readonly tenantsInspected: number;
  readonly auditedAt: string;
  readonly baseline: Readonly<Record<string, unknown>>;
  readonly tenantKeys: readonly string[];
  readonly sites: Readonly<Record<string, SiteEvidence>>;
  readonly drift: Readonly<Record<string, unknown>>;
  readonly classificationCounts: Readonly<Record<string, number>>;
  readonly contentAuthority: {
    readonly vocabulary: readonly string[];
    readonly matrix: {
      readonly group: Readonly<Record<string, string>>;
      readonly [siteKey: string]: Readonly<Record<string, string>>;
    };
  };
  readonly groupHomepageRelatedEntities: {
    readonly inventories: GroupEntityInventories;
  };
  readonly acceptedActionCounts: Readonly<Record<string, number>>;
  readonly actionMapping: readonly {
    readonly actionId: string;
    readonly evidenceStatus: string;
    readonly evidenceClassification: string;
  }[];
  readonly security: Readonly<Record<string, boolean | string>>;
  readonly authorization: Readonly<Record<string, boolean | string>>;
}

interface BatchesArtifact {
  readonly executionSpecs: readonly ExecutionSpec[];
  readonly authorization: Readonly<Record<string, boolean | string>>;
  readonly batches: readonly {
    readonly id: string;
    readonly excluded?: readonly string[];
    readonly stopCondition: string;
  }[];
  readonly ownerCategorySummary: {
    readonly deterministicCmsAdminAfterAuthorization: readonly string[];
  };
}

interface RollbackArtifact {
  readonly authorization: Readonly<Record<string, boolean | string>>;
  readonly currentEvidence: Readonly<Record<string, boolean | string>>;
  readonly requirements: readonly { readonly status: string }[];
  readonly restoreRules: readonly string[];
}

interface ProjectState {
  readonly currentStage: string;
  readonly currentSubstage: string;
  readonly executionBranch: string;
  readonly executionBaseline: string;
  readonly productionAuthorized: boolean;
  readonly latestAcceptedIncrement: Readonly<Record<string, unknown>>;
  readonly knownConflicts: readonly Readonly<Record<string, unknown>>[];
}

const preflight = JSON.parse(
  repositoryFile("artifacts/step-2c5a/cms-preflight.json"),
) as PreflightArtifact;
const batches = JSON.parse(
  repositoryFile("artifacts/step-2c5a/remediation-batches.json"),
) as BatchesArtifact;
const rollback = JSON.parse(
  repositoryFile("artifacts/step-2c5a/rollback-preconditions.json"),
) as RollbackArtifact;
const state = JSON.parse(repositoryFile("project-state.json")) as ProjectState;

describe("Step 2C.5A CMS preflight and remediation plan", () => {
  it("records accepted Step 2C.5A continuity and keeps every protected gate closed", () => {
    expect(state).toMatchObject({
      currentStage: "2C.5B",
      currentSubstage: "2C.5B-CMS-MUTATION-READINESS-BACKUP-GATE",
      executionBranch: "main",
      executionBaseline: "2bd4991f75a53ab9209e748499dcb8915769e3a6",
      productionAuthorized: false,
      latestAcceptedIncrement: {
        stage: "Step 2C.5B",
        status: "ACCEPTED_MERGED",
        pullRequest: 16,
        implementationHead: "4afad259dd4c184de5b61ca51f91fcde7222cbf2",
        mergeCommit: "2bd4991f75a53ab9209e748499dcb8915769e3a6",
        frontendCiRun: 35,
        fullRegression: "26 files / 252 tests PASS",
      },
    });
    expect(state.knownConflicts).toContainEqual(
      expect.objectContaining({ id: "SOT-001", status: "OPEN" }),
    );
  });

  it("contains a timestamped fresh preflight for exactly five tenant websites", () => {
    expect(preflight).toMatchObject({
      stage: "Step 2C.5A — CMS Preflight & Remediation Plan",
      status: "READY_FOR_INDEPENDENT_REVIEW",
      tenantsInspected: 5,
      baseline: {
        commit: "710eec3cf90e1a7d707860f9ee73d0abf283019c",
        latestAcceptedStage: "Step 2C.4",
      },
      tenantKeys: [
        "group",
        "consulting",
        "healthcare",
        "lifestyle",
        "realestate",
      ],
    });
    expect(Number.isNaN(Date.parse(preflight.auditedAt))).toBe(false);
    expect(Object.keys(preflight.sites)).toEqual(preflight.tenantKeys);
    for (const site of Object.values(preflight.sites)) {
      expect(site).toMatchObject({
        inspected: true,
        evidenceClassification: "CONFIRMED",
        previousPublicEvidenceMatches: true,
      });
    }
  });

  it("reports no drift in previously observable public coordinates", () => {
    expect(preflight.drift).toEqual({
      status: "NONE_DETECTED",
      evidenceClassification: "CONFIRMED",
      requiredEvidenceAvailable: true,
      comparedTenantCount: 5,
      comparedReadinessCoordinates: 55,
      readinessMatrixMatches: true,
      technicalReadinessMatrixMatches: true,
      exactPublicSiteSummariesMatch: true,
      expandedGroupEntityCoordinates: "NOT_COMPARABLE_NEW_PUBLIC_BASELINE",
    });
    expect(preflight.classificationCounts).toEqual({
      READY: 17,
      MISSING_CONTENT: 0,
      MISSING_CONFIGURATION: 23,
      DATA_CORRECTION_REQUIRED: 2,
      EDITORIAL_ACTION: 13,
      OWNER_DECISION: 0,
      BLOCKED: 0,
    });
  });

  it("preserves launch authority independently from technical validity", () => {
    expect(preflight.contentAuthority.vocabulary).toEqual([
      "APPROVED_LAUNCH_CONTENT",
      "UNAPPROVED_EXISTING_CONTENT",
      "NO_CONTENT",
      "NOT_APPLICABLE",
    ]);
    expect(preflight.contentAuthority.matrix.group).toMatchObject({
      frontPage: "UNAPPROVED_EXISTING_CONTENT",
      editorial: "UNAPPROVED_EXISTING_CONTENT",
      projects: "UNAPPROVED_EXISTING_CONTENT",
    });
    for (const siteKey of [
      "consulting",
      "healthcare",
      "lifestyle",
      "realestate",
    ]) {
      expect(preflight.contentAuthority.matrix[siteKey]).toMatchObject({
        frontPage: "NO_CONTENT",
        editorial: "NO_CONTENT",
        projects: "NO_CONTENT",
      });
    }
  });

  it("records the expanded Group entity inventory without granting authority", () => {
    const entities = preflight.groupHomepageRelatedEntities.inventories;
    expect(entities.companies).toMatchObject({
      returnedPublishedCount: 4,
      contentAuthority: "UNAPPROVED_EXISTING_CONTENT",
      truncated: false,
    });
    expect(entities.services).toMatchObject({
      returnedPublishedCount: 3,
      contentAuthority: "UNAPPROVED_EXISTING_CONTENT",
      truncated: false,
    });
    expect(entities.services.records.every((record) => record.typename === "Service")).toBe(true);
    for (const family of ["investments", "testimonials", "partners", "documents"]) {
      expect(entities[family]).toMatchObject({
        returnedPublishedCount: 0,
        contentAuthority: "NO_CONTENT",
        truncated: false,
      });
    }
  });

  it("reconciles all fifteen accepted actions without changing classification", () => {
    expect(preflight.acceptedActionCounts).toEqual({
      BLOCKING: 12,
      DEFERRED: 3,
      DESTRUCTIVE: 0,
      AUTHORIZED: 0,
    });
    expect(preflight.actionMapping).toHaveLength(15);
    expect(batches.executionSpecs).toHaveLength(15);
    expect(
      preflight.actionMapping.map((action) => action.actionId),
    ).toEqual(
      Array.from({ length: 15 }, (_, index) =>
        `CMS-2C4-${String(index + 1).padStart(3, "0")}`,
      ),
    );
    for (const action of batches.executionSpecs) {
      expect(action.destructive).toBe(false);
      expect(action.currentAuthorization).toBe(false);
      expect(action).toMatchObject({
        currentEvidence: expect.any(String),
        expectedApprovedState: expect.any(String),
        actionOwner: expect.any(String),
        cmsLocationOrTarget: expect.any(String),
        futureMutationType: expect.any(String),
        preChangeEvidenceRequired: expect.any(String),
        rollbackMethod: expect.any(String),
        postChangeValidation: expect.any(String),
        failureCondition: expect.any(String),
        stopCondition: expect.any(String),
      });
    }
  });

  it("records the exact four-field Healthcare identity correction", () => {
    const action = batches.executionSpecs.find((item) => item.actionId === "CMS-2C4-002");
    expect(action).toMatchObject({
      currentEvidence: expect.stringContaining(
        "name=SIRA Health, tagline=Advancing diagnostic and healthcare infrastructure., primary=#1e73be, secondary=#81d742, accent=#8224e3",
      ),
      expectedApprovedState: expect.stringContaining(
        "name=SIRA Healthcare, tagline=Advancing diagnostic and healthcare infrastructure., primary=#2c6dad, secondary=#12283f, accent=#2c6dad",
      ),
      fieldsAffected: ["name", "primaryColor", "secondaryColor", "accentColor"],
      fieldsExplicitlyNotAffected: expect.arrayContaining(["tagline"]),
    });
  });

  it("classifies an intended correction as changed-as-expected, never unchanged", () => {
    const result = classifyActionEvidence({
      evidenceAvailable: true,
      observedState: { name: "SIRA Healthcare", primary: "#2c6dad" },
      acceptedCurrentState: { name: "SIRA Health", primary: "#1e73be" },
      acceptedExpectedState: { name: "SIRA Healthcare", primary: "#2c6dad" },
    });
    expect(result).toEqual({
      evidenceStatus: "CHANGED_AS_EXPECTED",
      evidenceClassification: "CONFIRMED",
    });
    expect(result.evidenceStatus).not.toBe("VALIDATED_UNCHANGED");

    expect(classifyActionEvidence({
      evidenceAvailable: true,
      observedState: { name: "Unexpected" },
      acceptedCurrentState: { name: "Current" },
      acceptedExpectedState: { name: "Expected" },
    })).toMatchObject({ evidenceStatus: "DRIFT_DETECTED" });
  });

  it("uses UNKNOWN/BLOCKED semantics when required evidence is unavailable", () => {
    expect(classifyActionEvidence({
      evidenceAvailable: false,
      observedState: null,
      acceptedCurrentState: null,
      acceptedExpectedState: null,
    })).toEqual({
      evidenceStatus: "EVIDENCE_UNKNOWN",
      evidenceClassification: "UNKNOWN",
    });
    expect(classifyDrift({
      requiredEvidenceAvailable: false,
      comparisonsMatch: true,
    })).toEqual({
      status: "EVIDENCE_BLOCKED",
      evidenceClassification: "UNKNOWN",
    });
  });

  it("requires the expanded Group inventory before the stage can be READY", () => {
    const common = {
      tenantsInspected: 5,
      requiredTenantCount: 5,
      detailedTenantEvidenceAvailable: true,
      actionEvidenceAvailable: true,
    };
    expect(derivePreflightStatus({ ...common, groupInventoryAvailable: false })).toBe("BLOCKED");
    expect(derivePreflightStatus({ ...common, groupInventoryAvailable: true })).toBe(
      "READY_FOR_INDEPENDENT_REVIEW",
    );
    expect(preflight.groupHomepageRelatedEntities).toMatchObject({
      currentEvidenceClassification: "CONFIRMED",
    });
  });

  it("defines controlled batches and recoverable preconditions without executing them", () => {
    expect(batches.batches.map((batch) => batch.id)).toEqual([
      "BATCH-A",
      "BATCH-B",
      "BATCH-C",
      "BATCH-D",
      "BATCH-E",
    ]);
    expect(batches.ownerCategorySummary.deterministicCmsAdminAfterAuthorization).toEqual([
      "CMS-2C4-001",
      "CMS-2C4-002",
      "CMS-2C4-006:term-creation-only",
    ]);
    expect(rollback.currentEvidence).toEqual({
      exportTaken: false,
      backupTaken: false,
      restoreCheckPerformed: false,
      evidenceClassification: "UNKNOWN",
      owner: "HUMAN_ADMIN_ACTION",
    });
    expect(rollback.requirements).toHaveLength(9);
    expect(rollback.requirements.every((item) => item.status === "NOT_RUN")).toBe(true);
  });

  it("does not authorize taxonomy deletion in Step 2C.5A or Batch A", () => {
    const batchA = batches.batches.find((batch) => batch.id === "BATCH-A");
    const action = batches.executionSpecs.find((item) => item.actionId === "CMS-2C4-006");
    expect(batches.authorization).toMatchObject({
      taxonomyDeletionAuthorized: false,
    });
    expect(rollback.authorization).toMatchObject({
      taxonomyDeletionAuthorized: false,
    });
    expect(batchA?.excluded).toContain(
      "Taxonomy term deletion without separate explicit rollback/deletion authorization",
    );
    expect(batchA?.stopCondition).toContain("rollback/deletion authorization");
    expect(action?.rollbackMethod).toEqual(expect.stringContaining("exact created databaseId"));
    expect(action?.rollbackMethod).toEqual(expect.stringContaining("Never delete an existing term"));
    expect(action?.rollbackMethod).toEqual(expect.stringContaining("unexpected assignments"));
    expect(rollback.restoreRules.join(" ")).toContain("separate explicit rollback/deletion authorization");
    expect(preflight.acceptedActionCounts).toMatchObject({ DESTRUCTIVE: 0, AUTHORIZED: 0 });
  });

  it("persists no endpoint or secret and records zero mutation/deployment", () => {
    const persisted = [
      repositoryFile("artifacts/step-2c5a/cms-preflight.json"),
      repositoryFile("artifacts/step-2c5a/remediation-batches.json"),
      repositoryFile("artifacts/step-2c5a/rollback-preconditions.json"),
    ].join("\n");
    expect(persisted).not.toMatch(/https?:\/\//i);
    expect(persisted).not.toMatch(
      /(?:bearer\s+[a-z0-9._-]+|password\s*[=:]|secret\s*[=:]|access[_-]?token\s*[=:])/i,
    );
    expect(preflight.security).toMatchObject({
      queryDocumentsContainMutation: false,
      endpointValuesPersisted: false,
      credentialsPersisted: false,
      authorizationHeadersUsed: false,
      cookiesUsed: false,
      rawPayloadsPersisted: false,
      wordpressMutationOccurred: false,
      contentDeletionOccurred: false,
      backendRuntimeMutationOccurred: false,
      generatedGraphqlMutationOccurred: false,
      productionUiMutationOccurred: false,
      dependencyOrLockfileMutationOccurred: false,
      productionDeploymentOccurred: false,
      productionAuthorized: false,
      sot001Status: "OPEN",
    });
    expect(preflight.authorization).toMatchObject({
      cmsMutationAuthorization: "NOT_GRANTED",
      deploymentAuthorized: false,
      mergeAuthorized: false,
      nextGate: "OWNER_ACCEPTANCE",
    });
  });

  it("keeps the live audit implementation query-only and sanitised", () => {
    const source = repositoryFile("frontend/scripts/cms-preflight-audit.mjs");
    expect(source).toContain("executeReadOnly");
    expect(source).toContain("MUTATION_DOCUMENT_REJECTED");
    expect(source).toContain("groupEntitySummary");
    expect(source).toContain("classifyActionEvidence");
    expect(source).not.toContain("function actionEvidenceStatus");
    expect(source).not.toMatch(/\bmutation\s+[A-Z]/);
    expect(source).not.toMatch(/headers\s*:\s*\{[^}]*authorization/iu);
    expect(source).not.toMatch(/headers\s*:\s*\{[^}]*cookie/iu);
  });
});
