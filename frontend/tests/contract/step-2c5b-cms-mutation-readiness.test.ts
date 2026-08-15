import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { deriveBatchAReadiness } from "../../scripts/batch-a-readiness-audit.mjs";

const root = path.resolve(process.cwd(), "..");
const readJson = <T>(relativePath: string): T => JSON.parse(
  fs.readFileSync(path.join(root, relativePath), "utf8"),
) as T;

interface IdentityReadiness {
  evidenceStatus: string;
  current: Record<string, string>;
  futureExpected: Record<string, string>;
  affectedFields: string[];
}

interface TermReadiness {
  expectedName: string;
  expectedSlug: string;
  evidenceStatus: string;
  exactAbsenceConfirmed: boolean;
  equivalentCollisionCount: number;
  connectionTruncated: boolean;
  recordAssignmentsAuthorized: boolean;
}

interface ReadinessArtifact {
  baseline: Record<string, unknown> & { commit: string };
  mutationReadiness: string;
  batchAScope: {
    actions: string[];
    businessUnitAssignmentsIncluded: boolean;
    taxonomyDeletionIncluded: boolean;
    groupTaxonomyIncluded: boolean;
  };
  authorization: Record<string, unknown> & {
    taxonomyDeletionAuthorized: boolean;
    cmsMutationAuthorization: string;
    batchAMutationAuthorized: boolean;
    productionAuthorized: boolean;
  };
  security: Record<string, unknown>;
  identities: Record<"group" | "healthcare", IdentityReadiness>;
  businessUnitTerms: Record<"consulting" | "healthcare" | "lifestyle" | "realestate", TermReadiness>;
  groupBusinessUnitTerms: Record<string, unknown>;
  drift: Record<string, unknown> & { unexpectedExpectedStateWithoutAuthorizedWindow: boolean };
}

interface Operation {
  operationId: string;
  tenant: string;
  operation: string;
  operationType: string;
  mutationAuthorized: boolean;
  notAffected?: string[];
  rollbackAuthorizationRequirement?: string;
  rollbackStrategy?: string;
}

interface Mechanism {
  evidenceClassification: string;
  exactLiveCoordinateStatus: string;
  readiness: string;
}

interface ExecutionManifest {
  scope: string[];
  status: string;
  operations: Operation[];
  sameWindowGate: string[];
  futureMutationMechanisms: Mechanism[];
}

interface BackupTemplate {
  authorization: Record<string, boolean | string>;
  networkBackup: { backupIdentifier: string | null };
}

interface RollbackReadiness {
  summary: { backupEvidenceStatus: string; readyForMutationAuthorization: boolean };
  requirements: Array<{ id: string }>;
}

interface LedgerTemplate {
  taxonomyCreationRule: string;
  authorization: { taxonomyDeletionAuthorized: boolean };
}

interface BrandState {
  name: string;
  colors: Record<string, string>;
}

interface PreflightSite {
  inspected: boolean;
  evidenceClassification: string;
  current?: { brand?: BrandState; businessUnit?: Record<string, unknown> };
}

interface AcceptedPreflight extends Record<string, unknown> {
  sites: Record<string, PreflightSite> & {
    group: PreflightSite & { current: { brand: BrandState } };
  };
}

interface ProjectState {
  authorization: Record<string, unknown>;
  productionAuthorized: boolean;
}

const readiness = readJson<ReadinessArtifact>("artifacts/step-2c5b/batch-a-readiness.json");
const manifest = readJson<ExecutionManifest>("artifacts/step-2c5b/batch-a-execution-manifest.json");
const backup = readJson<BackupTemplate>("artifacts/step-2c5b/backup-evidence-template.json");
const rollback = readJson<RollbackReadiness>("artifacts/step-2c5b/rollback-readiness.json");
const ledger = readJson<LedgerTemplate>("artifacts/step-2c5b/execution-ledger-template.json");
const accepted = readJson<AcceptedPreflight>("artifacts/step-2c5a/cms-preflight.json");
const projectState = readJson<ProjectState>("project-state.json");

describe("Step 2C.5B CMS mutation readiness and backup gate", () => {
  it("pins the canonical baseline", () => {
    expect(readiness.baseline.commit).toBe("f0d0974a75ac49a9c4fd88f0f229fa28a209acfd");
  });

  it("records Step 2C.5A as the latest accepted merged milestone", () => {
    expect(readiness.baseline).toMatchObject({
      latestAcceptedMilestone: "Step 2C.5A — CMS Preflight & Remediation Plan",
      pullRequest: 15,
      approvedHead: "bb6cca02bd97524182e2d53628c5ea9567228ee4",
      mergeCommit: "f0d0974a75ac49a9c4fd88f0f229fa28a209acfd",
    });
  });

  it("limits future Batch A to the three accepted action scopes", () => {
    expect(readiness.batchAScope.actions).toEqual([
      "CMS-2C4-001",
      "CMS-2C4-002",
      "CMS-2C4-006:term-creation-only",
    ]);
    expect(manifest.scope).toEqual(readiness.batchAScope.actions);
  });

  it("excludes Business Unit record assignments", () => {
    expect(readiness.batchAScope.businessUnitAssignmentsIncluded).toBe(false);
    expect(Object.values(readiness.businessUnitTerms).every((term) => term.recordAssignmentsAuthorized === false)).toBe(true);
  });

  it("excludes taxonomy deletion from the stage and Batch A", () => {
    expect(readiness.batchAScope.taxonomyDeletionIncluded).toBe(false);
    expect(readiness.authorization.taxonomyDeletionAuthorized).toBe(false);
    const mutations = manifest.operations.filter((operation) => operation.operationType.includes("MUTATION"));
    expect(mutations.every((operation) => !operation.operation.toLowerCase().includes("delete"))).toBe(true);
  });

  it("keeps CMS and Batch A mutation authorization closed", () => {
    expect(readiness.authorization.cmsMutationAuthorization).toBe("NOT_GRANTED");
    expect(readiness.authorization.batchAMutationAuthorized).toBe(false);
    expect(manifest.status).toBe("NOT_AUTHORIZED");
  });

  it("does not claim backup, export, or restore execution", () => {
    expect(readiness.security).toMatchObject({
      backupExecutionOccurred: false,
      exportExecutionOccurred: false,
      restoreExecutionOccurred: false,
    });
    expect(backup.authorization).toMatchObject({
      backupCreationAuthorized: false,
      exportExecutionAuthorized: false,
      restoreExecutionAuthorized: false,
    });
  });

  it("cannot be mutation-ready while backup evidence is UNKNOWN", () => {
    expect(rollback.summary.backupEvidenceStatus).toBe("UNKNOWN");
    expect(rollback.summary.readyForMutationAuthorization).toBe(false);
    expect(readiness.mutationReadiness).toBe("BLOCKED_BY_BACKUP_EVIDENCE");
  });

  it("preserves exact Group current, expected, and affected fields", () => {
    expect(readiness.identities.group).toMatchObject({
      evidenceStatus: "VALIDATED_UNCHANGED",
      current: {
        key: "group", name: "SIRA Global Logo", tagline: "Shaping a smarter future.",
        primary: "#cccccc", secondary: "#5b5b5b", accent: "#cca34b", paper: "#f7f4ed", ink: "#20242b",
      },
      futureExpected: {
        key: "group", name: "SIRA GROUP", tagline: "Shaping a smarter future.",
        primary: "#cca34b", secondary: "#172232", accent: "#cca34b", paper: "#f7f4ed", ink: "#20242b",
      },
      affectedFields: ["name", "primaryColor", "secondaryColor"],
    });
  });

  it("preserves exact Healthcare current, expected, tagline, and affected fields", () => {
    expect(readiness.identities.healthcare).toMatchObject({
      evidenceStatus: "VALIDATED_UNCHANGED",
      current: {
        key: "healthcare", name: "SIRA Health", tagline: "Advancing diagnostic and healthcare infrastructure.",
        primary: "#1e73be", secondary: "#81d742", accent: "#8224e3", paper: "#f3f7fb", ink: "#1f2932",
      },
      futureExpected: {
        key: "healthcare", name: "SIRA Healthcare", tagline: "Advancing diagnostic and healthcare infrastructure.",
        primary: "#2c6dad", secondary: "#12283f", accent: "#2c6dad", paper: "#f3f7fb", ink: "#1f2932",
      },
      affectedFields: ["name", "primaryColor", "secondaryColor", "accentColor"],
    });
  });

  it("preserves all four tenant-local term names and slugs", () => {
    expect(Object.fromEntries(Object.entries(readiness.businessUnitTerms).map(([tenant, term]) => [tenant, [term.expectedName, term.expectedSlug]]))).toEqual({
      consulting: ["Consulting", "consulting"],
      healthcare: ["Healthcare", "healthcare"],
      lifestyle: ["Lifestyle", "lifestyle"],
      realestate: ["Real Estate", "real-estate"],
    });
  });

  it("requires absence, zero collisions, and untruncated tenant-local term evidence", () => {
    expect(Object.values(readiness.businessUnitTerms).every((term) => (
      term.evidenceStatus === "VALIDATED_UNCHANGED"
      && term.exactAbsenceConfirmed === true
      && term.equivalentCollisionCount === 0
      && term.connectionTruncated === false
    ))).toBe(true);
  });

  it("keeps Group terms outside the mutation target", () => {
    expect(readiness.groupBusinessUnitTerms).toMatchObject({
      mutationTarget: false,
      unchangedFromAcceptedStep2c5a: true,
    });
    expect(readiness.batchAScope.groupTaxonomyIncluded).toBe(false);
  });

  it("enforces tenant isolation for every future mutation", () => {
    const mutations = manifest.operations.filter((operation) => operation.operationType === "PROPOSED_NOT_AUTHORIZED_MUTATION");
    expect(mutations.map((operation) => operation.tenant)).toEqual([
      "group", "healthcare", "consulting", "healthcare", "lifestyle", "realestate",
    ]);
    expect(mutations.every((operation) => operation.notAffected?.some((value) => value.includes("other tenant") || value.includes("non-") || value.includes("all non-")) === true)).toBe(true);
  });

  it("requires a same-window drift gate before future mutation", () => {
    expect(manifest.sameWindowGate).toHaveLength(6);
    expect(manifest.sameWindowGate.join(" ")).toContain("Stop on drift");
    expect(manifest.operations[0]?.operationId).toBe("A1");
  });

  it("does not report an intentionally corrected action as VALIDATED_UNCHANGED", () => {
    const changed = structuredClone(accepted);
    changed.sites.group.current.brand = {
      ...changed.sites.group.current.brand,
      name: "SIRA GROUP",
      colors: { ...changed.sites.group.current.brand.colors, primary: "#cca34b", secondary: "#172232" },
    };
    const result = deriveBatchAReadiness(changed, accepted, "2026-08-15T00:00:00.000Z");
    const derived = result as unknown as ReadinessArtifact;
    expect(derived.identities.group.evidenceStatus).toBe("CHANGED_AS_EXPECTED");
    expect(derived.identities.group.evidenceStatus).not.toBe("VALIDATED_UNCHANGED");
    expect(derived.drift.unexpectedExpectedStateWithoutAuthorizedWindow).toBe(true);
    expect(derived.mutationReadiness).toBe("BLOCKED_BY_DRIFT");
  });

  it("turns missing required tenant evidence into UNKNOWN", () => {
    const missing = structuredClone(accepted);
    missing.sites["consulting"] = { inspected: false, evidenceClassification: "UNKNOWN" };
    const result = deriveBatchAReadiness(missing, accepted, "2026-08-15T00:00:00.000Z");
    const derived = result as unknown as ReadinessArtifact;
    expect(derived.businessUnitTerms.consulting.evidenceStatus).toBe("EVIDENCE_UNKNOWN");
    expect(derived.drift).toMatchObject({ status: "EVIDENCE_BLOCKED", evidenceClassification: "UNKNOWN" });
    expect(derived.mutationReadiness).toBe("UNKNOWN");
  });

  it("retains all RB-001 through RB-009 requirements", () => {
    expect(rollback.requirements.map((item) => item.id)).toEqual([
      "RB-001", "RB-002", "RB-003", "RB-004", "RB-005", "RB-006", "RB-007", "RB-008", "RB-009",
    ]);
  });

  it("defines but does not execute the exact A1 through A15 sequence", () => {
    expect(manifest.operations.map((operation) => operation.operationId)).toEqual(
      Array.from({ length: 15 }, (_, index) => `A${index + 1}`),
    );
    expect(manifest.operations.every((operation) => operation.mutationAuthorized === false)).toBe(true);
  });

  it("requires a separate deletion authorization for every term rollback", () => {
    const termMutations = manifest.operations.filter((operation) => operation.operation === "FUTURE_CREATE_BUSINESS_UNIT_TERM");
    expect(termMutations).toHaveLength(4);
    expect(termMutations.every((operation) => (
      operation.rollbackAuthorizationRequirement === "EXPLICIT_TAXONOMY_DELETION_AUTHORIZATION_REQUIRED"
      && operation.rollbackStrategy?.includes("Do not delete automatically") === true
      && operation.rollbackStrategy.includes("same-batch provenance")
      && operation.rollbackStrategy.includes("zero unexpected assignments")
    ))).toBe(true);
  });

  it("defines immediate CREATED plus databaseId ledger capture", () => {
    expect(ledger.taxonomyCreationRule).toContain("CREATED");
    expect(ledger.taxonomyCreationRule).toContain("databaseId");
    expect(ledger.authorization.taxonomyDeletionAuthorized).toBe(false);
  });

  it("classifies future mechanisms without claiming exact live coordinates", () => {
    expect(manifest.futureMutationMechanisms.every((mechanism) => (
      mechanism.evidenceClassification === "STRONGLY_INFERRED"
      && mechanism.exactLiveCoordinateStatus === "UNKNOWN"
      && mechanism.readiness === "NOT_READY_FOR_MUTATION_AUTHORIZATION"
    ))).toBe(true);
  });

  it("keeps SOT-001 open and protected gates closed", () => {
    expect(readiness.security).toMatchObject({
      sot001Status: "OPEN",
      wordpressMutationOccurred: false,
      graphqlMutationOccurred: false,
      databaseMutationOccurred: false,
      wpCliWriteOccurred: false,
      backendRuntimeMutationOccurred: false,
      generatedGraphqlMutationOccurred: false,
      productionUiMutationOccurred: false,
      deploymentOccurred: false,
      step3Started: false,
      step2c5cStarted: false,
    });
  });

  it("persists no endpoint, credential, or private path values", () => {
    const artifacts = [readiness, manifest, backup, rollback, ledger];
    expect(artifacts.every((artifact) => JSON.stringify(artifact).includes("http://") === false)).toBe(true);
    expect(artifacts.every((artifact) => JSON.stringify(artifact).includes("https://") === false)).toBe(true);
    expect(readiness.security).toMatchObject({ endpointValuesPersisted: false, credentialsPersisted: false });
    expect(backup.networkBackup.backupIdentifier).toBeNull();
  });

  it("separates Step 2C.5B plan acceptance from Batch A mutation authorization", () => {
    expect(projectState.authorization).toMatchObject({
      step2c5bAccepted: false,
      batchAMutationAuthorized: false,
      cmsMutationAuthorization: "NOT_GRANTED",
    });
  });

  it("keeps production authorization false", () => {
    expect(readiness.authorization.productionAuthorized).toBe(false);
    expect(projectState.productionAuthorized).toBe(false);
  });
});
