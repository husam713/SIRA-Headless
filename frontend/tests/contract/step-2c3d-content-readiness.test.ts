import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const repositoryFile = (relativePath: string): string =>
  readFileSync(new URL(`../../../${relativePath}`, import.meta.url), "utf8");

interface ReadinessArtifact {
  readonly schemaVersion: number;
  readonly mode: string;
  readonly security: Readonly<Record<string, boolean>>;
  readonly readinessMatrix: Readonly<
    Record<string, Readonly<Record<string, string>>>
  >;
  readonly classificationCounts: Readonly<Record<string, number>>;
  readonly findings: readonly {
    readonly classification: string;
    readonly owner: string;
    readonly destructive: boolean;
    readonly mutationAuthorized: boolean;
  }[];
  readonly sites: Readonly<Record<SiteKey, AuditedSite>>;
}

type SiteKey =
  | "group"
  | "consulting"
  | "healthcare"
  | "lifestyle"
  | "realestate";

interface AuditedSite {
  readonly inspected: boolean;
  readonly homepage: { readonly showOnFront: string };
  readonly menus: Readonly<
    Record<"primary" | "footer" | "legal", { readonly assignedCount: number }>
  >;
  readonly businessUnit: {
    readonly expectedSlug: string | null;
    readonly term: { readonly slug: string } | null;
    readonly availableTerms: readonly {
      readonly slug: string;
      readonly acceptedEditorialAssignments: {
        readonly returnedCount: number;
      };
    }[];
  };
  readonly editorial: {
    readonly branchFiltered: { readonly returnedCount: number } | null;
  };
}

describe("Step 2C.3D content readiness evidence", () => {
  const state = JSON.parse(repositoryFile("project-state.json")) as {
    readonly currentStage: string;
    readonly currentSubstage: string;
    readonly productionAuthorized: boolean;
    readonly latestAcceptedIncrement: Readonly<Record<string, unknown>>;
    readonly knownConflicts: readonly Readonly<Record<string, unknown>>[];
  };
  const artifact = JSON.parse(
    repositoryFile("artifacts/step-2c3d/content-readiness.json"),
  ) as ReadinessArtifact;

  it("records accepted Step 2C.3C and keeps protected gates open", () => {
    expect(state).toMatchObject({
      currentStage: "2C.3D",
      currentSubstage: "2C.3D-AUDIT",
      productionAuthorized: false,
      latestAcceptedIncrement: {
        stage: "Step 2C.3C",
        status: "ACCEPTED_MERGED",
        pullRequest: 12,
        implementationHead: "847b0c3f067d9af4f00591c3554a7a693a646017",
        mergeCommit: "4f306733b3e45bee4244688186e5ecae570fcb8b",
        frontendCi: "PASS",
        fullRegression: "22 files / 183 tests PASS",
      },
    });
    expect(state.knownConflicts).toContainEqual(
      expect.objectContaining({ id: "SOT-001", status: "OPEN" }),
    );
  });

  it("contains a complete five-site, eleven-area classified matrix", () => {
    const allowed = [
      "READY",
      "MISSING_CONTENT",
      "MISSING_CONFIGURATION",
      "DATA_CORRECTION_REQUIRED",
      "EDITORIAL_ACTION",
      "OWNER_DECISION",
      "BLOCKED",
    ];
    expect(Object.keys(artifact.readinessMatrix)).toEqual([
      "group",
      "consulting",
      "healthcare",
      "lifestyle",
      "realestate",
    ]);
    for (const row of Object.values(artifact.readinessMatrix)) {
      expect(Object.keys(row)).toHaveLength(11);
      expect(Object.values(row).every((value) => allowed.includes(value))).toBe(
        true,
      );
    }
    expect(
      Object.values(artifact.classificationCounts).reduce(
        (sum, value) => sum + value,
        0,
      ),
    ).toBe(55);
    expect(artifact.classificationCounts).toEqual({
      READY: 18,
      MISSING_CONTENT: 1,
      MISSING_CONFIGURATION: 23,
      DATA_CORRECTION_REQUIRED: 2,
      EDITORIAL_ACTION: 3,
      OWNER_DECISION: 8,
      BLOCKED: 0,
    });
  });

  it("records every tenant as inspected without substituting site data", () => {
    expect(
      Object.values(artifact.sites).every((site) => site.inspected),
    ).toBe(true);
    expect(artifact.sites.group.homepage.showOnFront).toBe("page");
    for (const siteKey of [
      "consulting",
      "healthcare",
      "lifestyle",
      "realestate",
    ] satisfies readonly SiteKey[]) {
      expect(artifact.sites[siteKey].homepage.showOnFront).toBe("posts");
    }
    expect(artifact.sites.group.businessUnit.expectedSlug).toBeNull();
    expect(artifact.sites.realestate.businessUnit.expectedSlug).toBe(
      "real-estate",
    );
  });

  it("proves exact Business Unit slugs and accepted editorial assignments", () => {
    expect(
      artifact.sites.group.businessUnit.availableTerms.map((term) => [
        term.slug,
        term.acceptedEditorialAssignments.returnedCount,
      ]),
    ).toEqual([
      ["consulting", 1],
      ["healthcare", 1],
      ["lifestyle", 1],
      ["real-estate", 1],
    ]);
    for (const siteKey of [
      "consulting",
      "healthcare",
      "lifestyle",
      "realestate",
    ] satisfies readonly SiteKey[]) {
      expect(artifact.sites[siteKey].businessUnit.term).toBeNull();
      expect(artifact.sites[siteKey].editorial.branchFiltered).toBeNull();
    }
  });

  it("records missing native menu configuration independently per tenant", () => {
    for (const site of Object.values(artifact.sites)) {
      expect(site.menus.primary.assignedCount).toBe(0);
      expect(site.menus.footer.assignedCount).toBe(0);
      expect(site.menus.legal.assignedCount).toBe(0);
    }
  });

  it("keeps the artifact sanitized and every correction non-destructive", () => {
    expect(artifact.schemaVersion).toBe(1);
    expect(artifact.mode).toBe("read-only public GraphQL metadata");
    expect(artifact.security).toEqual({
      endpointValuesPersisted: false,
      credentialsPersisted: false,
      unpublishedBodiesPersisted: false,
      rawPayloadsPersisted: false,
      wordpressMutationOccurred: false,
      backendMutationOccurred: false,
      productionDeploymentOccurred: false,
    });
    for (const finding of artifact.findings) {
      expect(finding.classification).not.toBe("READY");
      expect(finding.destructive).toBe(false);
      expect(finding.mutationAuthorized).toBe(false);
      expect([
        "CMS_ADMIN_ACTION",
        "EDITORIAL_ACTION",
        "OWNER_DECISION",
        "FUTURE_FRONTEND_STAGE",
        "BLOCKED",
      ]).toContain(finding.owner);
    }

    const serialized = repositoryFile(
      "artifacts/step-2c3d/content-readiness.json",
    );
    expect(serialized).not.toMatch(/https?:\/\//u);
    expect(serialized).not.toMatch(/authorization|password|cookie/iu);
  });
});
