import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const TENANT_KEYS = Object.freeze(["group", "consulting", "healthcare", "lifestyle", "realestate"]);
const BRANCH_TERMS = Object.freeze({
  consulting: Object.freeze({ name: "Consulting", slug: "consulting" }),
  healthcare: Object.freeze({ name: "Healthcare", slug: "healthcare" }),
  lifestyle: Object.freeze({ name: "Lifestyle", slug: "lifestyle" }),
  realestate: Object.freeze({ name: "Real Estate", slug: "real-estate" }),
});

const IDENTITIES = Object.freeze({
  group: Object.freeze({
    actionId: "CMS-2C4-001",
    current: Object.freeze({
      key: "group",
      name: "SIRA Global Logo",
      tagline: "Shaping a smarter future.",
      primary: "#cccccc",
      secondary: "#5b5b5b",
      accent: "#cca34b",
      paper: "#f7f4ed",
      ink: "#20242b",
    }),
    expected: Object.freeze({
      key: "group",
      name: "SIRA GROUP",
      tagline: "Shaping a smarter future.",
      primary: "#cca34b",
      secondary: "#172232",
      accent: "#cca34b",
      paper: "#f7f4ed",
      ink: "#20242b",
    }),
    affectedFields: Object.freeze(["name", "primaryColor", "secondaryColor"]),
    notAffectedFields: Object.freeze([
      "key", "tagline", "accentColor", "paperColor", "inkColor", "logo", "mark",
      "contacts", "values", "offices", "announcement", "emergency",
    ]),
  }),
  healthcare: Object.freeze({
    actionId: "CMS-2C4-002",
    current: Object.freeze({
      key: "healthcare",
      name: "SIRA Health",
      tagline: "Advancing diagnostic and healthcare infrastructure.",
      primary: "#1e73be",
      secondary: "#81d742",
      accent: "#8224e3",
      paper: "#f3f7fb",
      ink: "#1f2932",
    }),
    expected: Object.freeze({
      key: "healthcare",
      name: "SIRA Healthcare",
      tagline: "Advancing diagnostic and healthcare infrastructure.",
      primary: "#2c6dad",
      secondary: "#12283f",
      accent: "#2c6dad",
      paper: "#f3f7fb",
      ink: "#1f2932",
    }),
    affectedFields: Object.freeze(["name", "primaryColor", "secondaryColor", "accentColor"]),
    notAffectedFields: Object.freeze([
      "key", "tagline", "paperColor", "inkColor", "logo", "mark", "contacts",
      "values", "offices", "announcement", "emergency",
    ]),
  }),
});

function sameEvidence(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function classifyEvidence({ available, observed, acceptedCurrent, acceptedExpected }) {
  if (!available) return { evidenceStatus: "EVIDENCE_UNKNOWN", evidenceClassification: "UNKNOWN" };
  if (sameEvidence(observed, acceptedExpected)) {
    return { evidenceStatus: "CHANGED_AS_EXPECTED", evidenceClassification: "CONFIRMED" };
  }
  if (sameEvidence(observed, acceptedCurrent)) {
    return { evidenceStatus: "VALIDATED_UNCHANGED", evidenceClassification: "CONFIRMED" };
  }
  return { evidenceStatus: "DRIFT_DETECTED", evidenceClassification: "CONFIRMED" };
}

function identityState(site) {
  const brand = site?.current?.brand;
  return brand ? {
    key: brand.key,
    name: brand.name,
    tagline: brand.tagline,
    primary: brand.colors?.primary,
    secondary: brand.colors?.secondary,
    accent: brand.colors?.accent,
    paper: brand.colors?.paper,
    ink: brand.colors?.ink,
  } : null;
}

function normalized(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/gu, "");
}

function branchTermState(site, expected) {
  const businessUnit = site?.current?.businessUnit;
  const availableTerms = Array.isArray(businessUnit?.availableTerms) ? businessUnit.availableTerms : null;
  const available = site?.inspected === true
    && availableTerms !== null
    && businessUnit?.availableTermsTruncated === false;
  if (!available) return { available: false, observed: null, exactMatches: [], collisions: [] };

  const exactMatches = availableTerms.filter((term) => term.slug === expected.slug);
  const collisions = availableTerms.filter((term) => (
    term.slug !== expected.slug
    && (normalized(term.slug) === normalized(expected.slug) || normalized(term.name) === normalized(expected.name))
  ));
  const exactAssignmentCount = exactMatches.length === 1
    ? exactMatches[0].totalAssignedObjectCount
    : null;
  if (exactMatches.length === 1 && !Number.isInteger(exactAssignmentCount)) {
    return { available: false, observed: null, exactMatches, collisions };
  }
  const observed = exactMatches.length === 0 && collisions.length === 0
    ? {
        state: "ABSENT",
        exactMatchCount: 0,
        collisionCount: 0,
        totalAssignedObjectCount: null,
        truncated: false,
      }
    : exactMatches.length === 1
      && exactMatches[0].name === expected.name
      && collisions.length === 0
      && exactAssignmentCount === 0
      ? {
          state: "PRESENT_AS_EXPECTED",
          exactMatchCount: 1,
          collisionCount: 0,
          totalAssignedObjectCount: 0,
          truncated: false,
        }
      : {
          state: "COLLISION_OR_UNEXPECTED_TERM",
          exactMatchCount: exactMatches.length,
          collisionCount: collisions.length,
          totalAssignedObjectCount: exactAssignmentCount,
          truncated: false,
        };
  return { available, observed, exactMatches, collisions };
}

function sanitizeGroupTerms(site) {
  const businessUnit = site?.current?.businessUnit;
  if (site?.inspected !== true || !Array.isArray(businessUnit?.availableTerms)) return null;
  return {
    truncated: businessUnit.availableTermsTruncated,
    terms: businessUnit.availableTerms.map((term) => ({
      databaseId: term.databaseId,
      name: term.name,
      slug: term.slug,
      totalAssignedObjectCount: term.totalAssignedObjectCount,
    })),
  };
}

export function deriveBatchAReadiness(fresh, accepted, generatedAt = new Date().toISOString()) {
  const identities = Object.fromEntries(Object.entries(IDENTITIES).map(([tenant, contract]) => {
    const observed = identityState(fresh.sites?.[tenant]);
    const result = classifyEvidence({
      available: fresh.sites?.[tenant]?.inspected === true && observed !== null
        && Object.values(observed).every((value) => value !== undefined),
      observed,
      acceptedCurrent: contract.current,
      acceptedExpected: contract.expected,
    });
    return [tenant, {
      actionId: contract.actionId,
      evidenceClassification: result.evidenceClassification,
      evidenceStatus: result.evidenceStatus,
      unexpectedExpectedStateWithoutAuthorization: result.evidenceStatus === "CHANGED_AS_EXPECTED",
      current: observed,
      acceptedCurrent: contract.current,
      futureExpected: contract.expected,
      affectedFields: contract.affectedFields,
      fieldsExplicitlyNotAffected: contract.notAffectedFields,
    }];
  }));

  const businessUnitTerms = Object.fromEntries(Object.entries(BRANCH_TERMS).map(([tenant, expected]) => {
    const state = branchTermState(fresh.sites?.[tenant], expected);
    const result = classifyEvidence({
      available: state.available,
      observed: state.observed,
      acceptedCurrent: {
        state: "ABSENT",
        exactMatchCount: 0,
        collisionCount: 0,
        totalAssignedObjectCount: null,
        truncated: false,
      },
      acceptedExpected: {
        state: "PRESENT_AS_EXPECTED",
        exactMatchCount: 1,
        collisionCount: 0,
        totalAssignedObjectCount: 0,
        truncated: false,
      },
    });
    return [tenant, {
      actionId: "CMS-2C4-006",
      evidenceClassification: result.evidenceClassification,
      evidenceStatus: result.evidenceStatus,
      unexpectedExpectedStateWithoutAuthorization: result.evidenceStatus === "CHANGED_AS_EXPECTED",
      taxonomy: "sira_business_unit",
      expectedName: expected.name,
      expectedSlug: expected.slug,
      exactAbsenceConfirmed: state.observed?.state === "ABSENT",
      exactMatchCount: state.exactMatches.length,
      equivalentCollisionCount: state.collisions.length,
      currentAssignedObjectCount: state.exactMatches[0]?.totalAssignedObjectCount ?? null,
      connectionTruncated: fresh.sites?.[tenant]?.current?.businessUnit?.availableTermsTruncated ?? null,
      futureCreatedDatabaseId: null,
      recordAssignmentsAuthorized: false,
      deletionAuthorized: false,
    }];
  }));

  const groupTerms = sanitizeGroupTerms(fresh.sites?.group);
  const acceptedGroupTerms = sanitizeGroupTerms(accepted.sites?.group);
  const groupTermsUnchanged = groupTerms !== null && sameEvidence(groupTerms, acceptedGroupTerms);
  const actionStatuses = [
    ...Object.values(identities).map((item) => item.evidenceStatus),
    ...Object.values(businessUnitTerms).map((item) => item.evidenceStatus),
  ];
  const evidenceUnknown = actionStatuses.includes("EVIDENCE_UNKNOWN") || groupTerms === null;
  const unexpectedExpectedState = actionStatuses.includes("CHANGED_AS_EXPECTED");
  const driftDetected = actionStatuses.includes("DRIFT_DETECTED") || !groupTermsUnchanged || unexpectedExpectedState;
  const tenantsInspected = TENANT_KEYS.filter((tenant) => fresh.sites?.[tenant]?.inspected === true);

  return {
    schemaVersion: 1,
    stage: "Step 2C.5B — CMS Mutation Readiness & Backup Gate",
    status: evidenceUnknown ? "UNKNOWN" : driftDetected ? "BLOCKED_BY_DRIFT" : "REQUIRES_HUMAN_ADMIN_ACTION",
    planStatus: "OWNER_ACCEPTED_PENDING_MERGE",
    mutationReadiness: evidenceUnknown
      ? "UNKNOWN"
      : driftDetected
        ? "BLOCKED_BY_DRIFT"
        : "BLOCKED_BY_BACKUP_EVIDENCE",
    generatedAt,
    evidenceCapturedAt: fresh.auditedAt,
    baseline: {
      branch: "main",
      commit: "f0d0974a75ac49a9c4fd88f0f229fa28a209acfd",
      latestAcceptedMilestone: "Step 2C.5A — CMS Preflight & Remediation Plan",
      pullRequest: 15,
      approvedHead: "bb6cca02bd97524182e2d53628c5ea9567228ee4",
      mergeCommit: "f0d0974a75ac49a9c4fd88f0f229fa28a209acfd",
    },
    evidenceSources: {
      acceptedPreflight: "artifacts/step-2c5a/cms-preflight.json",
      acceptedRemediationPlan: "artifacts/step-2c5a/remediation-batches.json",
      acceptedRollbackRequirements: "artifacts/step-2c5a/rollback-preconditions.json",
      acceptedCorrectionManifest: "artifacts/step-2c4/cms-correction-manifest.json",
      freshQueryInfrastructure: "frontend/scripts/cms-preflight-audit.mjs",
      derivationSource: "frontend/scripts/batch-a-readiness-audit.mjs",
    },
    mode: "READ_ONLY_PREFLIGHT_AND_MUTATION_READINESS_PLANNING",
    tenants: {
      required: TENANT_KEYS,
      inspected: tenantsInspected,
      inspectedCount: tenantsInspected.length,
      allRequiredEvidenceAvailable: tenantsInspected.length === TENANT_KEYS.length && !evidenceUnknown,
    },
    drift: {
      status: evidenceUnknown ? "EVIDENCE_BLOCKED" : driftDetected ? "DRIFT_DETECTED" : "NONE_DETECTED",
      evidenceClassification: evidenceUnknown ? "UNKNOWN" : "CONFIRMED",
      unexpectedExpectedStateWithoutAuthorizedWindow: unexpectedExpectedState,
      acceptedStep2c5aPublicEvidenceStillMatches: fresh.drift?.status === "NONE_DETECTED",
    },
    batchAScope: {
      actions: ["CMS-2C4-001", "CMS-2C4-002", "CMS-2C4-006:term-creation-only"],
      businessUnitAssignmentsIncluded: false,
      taxonomyDeletionIncluded: false,
      groupTaxonomyIncluded: false,
    },
    identities,
    businessUnitTerms,
    groupBusinessUnitTerms: {
      mutationTarget: false,
      unchangedFromAcceptedStep2c5a: groupTermsUnchanged,
      current: groupTerms,
    },
    blockers: [
      "RB-001_NETWORK_BACKUP_EVIDENCE_UNKNOWN",
      "RB-009_RESTORE_VALIDATION_EVIDENCE_UNKNOWN",
      "EXACT_LIVE_ADMIN_MUTATION_COORDINATES_UNCONFIRMED",
      "CMS_MUTATION_AUTHORIZATION_NOT_GRANTED",
    ],
    authorization: {
      step2c5bAccepted: true,
      cmsMutationAuthorization: "NOT_GRANTED",
      batchAMutationAuthorized: false,
      taxonomyDeletionAuthorized: false,
      backupCreationAuthorized: false,
      exportExecutionAuthorized: false,
      restoreExecutionAuthorized: false,
      productionAuthorized: false,
      nextGate: "MERGE_REQUIRES_SEPARATE_OWNER_AUTHORIZATION",
    },
    security: {
      endpointValuesPersisted: false,
      credentialsPersisted: false,
      authorizationHeadersUsed: false,
      cookiesUsed: false,
      rawProtectedPayloadsPersisted: false,
      wordpressMutationOccurred: false,
      graphqlMutationOccurred: false,
      databaseMutationOccurred: false,
      wpCliWriteOccurred: false,
      backupExecutionOccurred: false,
      exportExecutionOccurred: false,
      restoreExecutionOccurred: false,
      contentDeletionOccurred: false,
      taxonomyDeletionOccurred: false,
      backendRuntimeMutationOccurred: false,
      generatedGraphqlMutationOccurred: false,
      productionUiMutationOccurred: false,
      dependencyOrLockfileMutationOccurred: false,
      deploymentOccurred: false,
      step3Started: false,
      step2c5cStarted: false,
      sot001Status: "OPEN",
    },
  };
}

async function main() {
  const freshPath = resolve(process.argv[2]);
  const acceptedPath = resolve(process.argv[3] ?? "../artifacts/step-2c5a/cms-preflight.json");
  const outputPath = resolve(process.argv[4] ?? "../artifacts/step-2c5b/batch-a-readiness.json");
  const [fresh, accepted] = await Promise.all([
    readFile(freshPath, "utf8").then(JSON.parse),
    readFile(acceptedPath, "utf8").then(JSON.parse),
  ]);
  const output = deriveBatchAReadiness(fresh, accepted);
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, { flag: process.argv.includes("--replace") ? "w" : "wx" });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main();
}
