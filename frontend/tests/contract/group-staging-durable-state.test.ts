import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function repositoryFile(relativePath: string): string {
  return readFileSync(new URL(`../../../${relativePath}`, import.meta.url), "utf8");
}

const state = JSON.parse(repositoryFile("project-state.json")) as {
  readonly executionBaseline: string;
  readonly executionHead: string;
  readonly productionAuthorized: boolean;
  readonly authorization: Readonly<Record<string, boolean | string>>;
  readonly parallelTracks: {
    readonly cmsMutation: Readonly<Record<string, string>>;
    readonly repositoryFrontend: Readonly<Record<string, string>>;
  };
  readonly groupStagingStrategy: Readonly<Record<string, boolean | string>>;
  readonly latestRepositoryReconciliation: {
    readonly pullRequest: number;
    readonly mergeCommit: string;
    readonly purpose: string;
  };
};

const handoff = repositoryFile("docs/HANDOFF.md");
const adr = repositoryFile("docs/adr/ADR-025-GROUP-STAGING-FIRST.md");
const stagingSot = repositoryFile("docs/GROUP-STAGING-SOURCE-OF-TRUTH.md");

describe("Group staging-first durable state", () => {
  it("distinguishes accepted business execution coordinates from canonical main", () => {
    expect(state.executionBaseline).toBe(
      "2bd4991f75a53ab9209e748499dcb8915769e3a6",
    );
    expect(state.executionHead).toBe(state.executionBaseline);
    expect(state.latestRepositoryReconciliation).toMatchObject({
      pullRequest: 19,
      mergeCommit: "e20858b055e556065e96623205fa0d5774ad81d6",
      purpose: "SOT-001 post-merge durable-state reconciliation",
    });
    expect(stagingSot).toContain(state.executionBaseline);
    expect(stagingSot).toContain(
      state.latestRepositoryReconciliation.mergeCommit,
    );
    expect(handoff).toContain(state.latestRepositoryReconciliation.mergeCommit);
  });

  it("keeps the CMS mutation track closed while allowing repository frontend work", () => {
    // The CMS track is no longer blocked on backup evidence: the owner
    // authorized a backup and Batch A on 2026-09-05 (ADR-030 / ADR-031), the
    // backup was taken and verified before the first write, and the
    // branch-local terms were created. The prior status is preserved on the
    // record rather than overwritten, because how a gate was cleared is worth
    // as much as the fact that it was.
    expect(state.parallelTracks.cmsMutation).toMatchObject({
      stage: "2C.5B",
      status: "BACKUP_EVIDENCE_PRESENT_BATCH_A_EXECUTED",
      previousStatus: "BLOCKED_BY_BACKUP_EVIDENCE",
    });
    expect(state.parallelTracks.repositoryFrontend).toMatchObject({
      status: "READY_TO_PROCEED_WITHOUT_PRODUCTION_WORDPRESS_MUTATION",
      nextStage: "3 — Preview / SEO / Discovery",
      launchStrategy: "GROUP_STAGING_FIRST",
    });
    expect(state.authorization["cmsMutationAuthorization"]).toBe(
      "OWNER_AUTHORIZED_BOUNDED",
    );
    expect(state.authorization["batchAMutationAuthorized"]).toBe(true);
    // Bounded is the operative word. Nothing above widened into deletion or
    // into production movement, and that is what this track still guarantees.
    expect(state.authorization["taxonomyDeletionAuthorized"]).toBe(false);
    expect(state.authorization["restoreExecutionAuthorized"]).toBe(false);
    expect(state.productionAuthorized).toBe(false);
  });

  it("uses an unresolved placeholder for Group staging and never authorizes production", () => {
    expect(state.groupStagingStrategy).toMatchObject({
      status: "APPROVED_OWNER_DECISION",
      scope: "GROUP_PUBLIC_FRONTEND_ONLY",
      stagingHostname: "GROUP_STAGING_HOST",
      stagingHostnameStatus: "HUMAN_CONFIRMATION_REQUIRED",
      productionHostname: "siratrgroup.com",
      sameApplicationAndCommit: true,
      separateReactImplementationForStaging: false,
      legacyGroupRemainsLiveDuringBuild: true,
      legacyGroupIsImmediateRollbackTarget: true,
      separateStagingCmsAssumed: false,
      branchSitesUnchanged: true,
      dnsChangeAuthorized: false,
      productionDeploymentAuthorized: false,
      externalStagingProvisioningAuthorized: false,
    });
    expect(state.productionAuthorized).toBe(false);
    expect(state.authorization["groupProductionCutoverAuthorized"]).toBe(false);
    expect(state.authorization["productionDnsChangeAuthorized"]).toBe(false);
    expect(state.authorization["legacyGroupDestructionAuthorized"]).toBe(false);
  });

  it("preserves the staging-first decision in human-readable durable records", () => {
    for (const document of [handoff, adr, stagingSot]) {
      expect(document).toContain("GROUP_STAGING_HOST");
      expect(document).toContain("siratrgroup.com");
    }
    expect(adr).toContain("same Next.js application");
    expect(adr).toContain("immediate rollback target");
    expect(handoff).toContain("Historical Step 2C.5A/2C.5B artifacts remain historical");
  });
});
