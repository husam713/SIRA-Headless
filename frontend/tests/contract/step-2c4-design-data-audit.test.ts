import { readFileSync } from "node:fs";
import { buildSchema, isObjectType } from "graphql";
import { describe, expect, it } from "vitest";

function repositoryFile(relativePath: string): string {
  return readFileSync(
    new URL(`../../../${relativePath}`, import.meta.url),
    "utf8",
  );
}

interface DesignAuditArtifact {
  readonly schemaVersion: number;
  readonly stage: string;
  readonly status: string;
  readonly baseline: Readonly<Record<string, unknown>>;
  readonly security: Readonly<Record<string, boolean | string>>;
  readonly canonicalPublicProductionTopology: {
    readonly decisionStatus: string;
    readonly apex: string;
    readonly sites: Readonly<Record<string, string>>;
    readonly scope: string;
    readonly canonicalPublicDomainGapStatus: string;
    readonly notInferred: readonly string[];
  };
  readonly designSources: {
    readonly duplicateSourceSetsMatch: boolean;
    readonly runtimeRole: string;
    readonly files: readonly {
      readonly name: string;
      readonly sha256: string;
      readonly role: string;
    }[];
    readonly forbiddenProductionDependencies: readonly string[];
  };
  readonly pageSystems: readonly {
    readonly id: string;
    readonly sites: readonly string[];
    readonly orchestrator: string;
    readonly sharedImplementation: boolean;
    readonly websiteModel?: string;
    readonly instantiation?: string;
    readonly sections: readonly string[];
  }[];
  readonly componentArchitecture: {
    readonly serverDefault: boolean;
    readonly branchHomepageInvariant: string;
    readonly serverComponents: readonly string[];
    readonly clientIslands: readonly {
      readonly component: string;
      readonly reason: string;
    }[];
    readonly prohibitedBranchPatterns: readonly string[];
  };
  readonly contractMap: readonly {
    readonly area: string;
    readonly schema: string;
    readonly frontend: string;
    readonly status: string;
  }[];
  readonly auditDimensions: readonly string[];
  readonly gaps: readonly {
    readonly id: string;
    readonly severity: "BLOCKING" | "NONBLOCKING";
    readonly area: string;
    readonly owner: string;
  }[];
  readonly gapCounts: Readonly<Record<"BLOCKING" | "NONBLOCKING", number>>;
  readonly authorization: Readonly<Record<string, boolean | string>>;
}

interface CmsManifest {
  readonly schemaVersion: number;
  readonly status: string;
  readonly authorization: Readonly<Record<string, boolean>>;
  readonly rules: readonly string[];
  readonly preconditions: readonly Readonly<Record<string, string>>[];
  readonly actions: readonly {
    readonly id: string;
    readonly classification: string;
    readonly owner: string;
    readonly area: string;
    readonly tenant?: string;
    readonly tenants?: readonly string[];
    readonly target?: unknown;
    readonly targets?: readonly Readonly<Record<string, string>>[];
    readonly expected: unknown;
    readonly destructive: boolean;
    readonly mutationAuthorized: boolean;
  }[];
  readonly actionCounts: Readonly<Record<string, number>>;
  readonly rollback: Readonly<Record<string, boolean | string>>;
}

const artifact = JSON.parse(
  repositoryFile("artifacts/step-2c4/design-data-contract-audit.json"),
) as DesignAuditArtifact;
const manifest = JSON.parse(
  repositoryFile("artifacts/step-2c4/cms-correction-manifest.json"),
) as CmsManifest;
const canonicalSchemaSource = repositoryFile(
  "frontend/schema/wpgraphql.graphql",
);
const canonicalSchema = buildSchema(canonicalSchemaSource);
const groupSchema = buildSchema(
  repositoryFile("frontend/schema/wpgraphql.group.graphql"),
);

describe("Step 2C.4 production design and data-contract audit", () => {
  it("starts from the accepted Step 2C.3D baseline with protected gates open", () => {
    const state = JSON.parse(repositoryFile("project-state.json")) as {
      readonly currentStage: string;
      readonly currentSubstage: string;
      readonly executionBranch: string;
      readonly executionBaseline: string;
      readonly productionAuthorized: boolean;
      readonly canonicalPublicProductionTopology: Readonly<
        Record<string, unknown>
      >;
      readonly latestAcceptedIncrement: Readonly<Record<string, unknown>>;
      readonly knownConflicts: readonly Readonly<Record<string, unknown>>[];
    };

    expect(state).toMatchObject({
      currentStage: "2C.4",
      currentSubstage: "2C.4-AUDIT",
      executionBranch: "agent/step-2c4-design-data-audit",
      executionBaseline: "1cfab49f113acca5a1866e225f8b5b64a5fcb926",
      productionAuthorized: false,
      canonicalPublicProductionTopology: {
        status: "APPROVED_OWNER_DECISION",
        apex: "siratrgroup.com",
        sites: {
          group: "siratrgroup.com",
          consulting: "consulting.siratrgroup.com",
          healthcare: "healthcare.siratrgroup.com",
          lifestyle: "lifestyle.siratrgroup.com",
          realestate: "realestate.siratrgroup.com",
        },
        scope: "public production hostnames only",
      },
      latestAcceptedIncrement: {
        stage: "Step 2C.3D",
        status: "ACCEPTED_MERGED",
        pullRequest: 13,
        implementationHead: "73bec8e671a53c1abb5396ed945785162b71b5da",
        mergeCommit: "1cfab49f113acca5a1866e225f8b5b64a5fcb926",
        frontendCi: "PASS",
        frontendCiRun: 25,
        fullRegression: "23 files / 196 tests PASS",
      },
    });
    expect(state.knownConflicts).toContainEqual(
      expect.objectContaining({ id: "SOT-001", status: "OPEN" }),
    );
    expect(artifact.baseline).toMatchObject({
      branch: "main",
      commit: "1cfab49f113acca5a1866e225f8b5b64a5fcb926",
      latestAcceptedStage: "Step 2C.3D",
      pullRequest: 13,
      correctionHead: "73bec8e671a53c1abb5396ed945785162b71b5da",
      frontendCiRun: 25,
      fullRegression: "23 files / 196 tests PASS",
    });
  });

  it("records all seven approved references without making them runtime dependencies", () => {
    expect(artifact.schemaVersion).toBe(1);
    expect(artifact.status).toBe("AUDIT_COMPLETE_PENDING_OWNER_ACCEPTANCE");
    expect(artifact.designSources).toMatchObject({
      duplicateSourceSetsMatch: true,
      runtimeRole: "visual-and-interaction-reference-only",
    });
    expect(artifact.designSources.files).toHaveLength(7);
    expect(
      new Set(artifact.designSources.files.map((source) => source.name)).size,
    ).toBe(7);
    expect(
      artifact.designSources.files.every((source) =>
        /^[a-f0-9]{64}$/u.test(source.sha256),
      ),
    ).toBe(true);
    expect(
      artifact.designSources.files.filter(
        (source) => source.role === "branch-selector-only",
      ),
    ).toHaveLength(4);
    expect(artifact.designSources.forbiddenProductionDependencies).toEqual([
      ".dc.html",
      "x-dc",
      "dc-import",
      "sc-for",
      "sc-if",
      "support.js",
      "image-slot.js",
      "deck-stage.js",
      "DCLogic",
      "style-hover",
      "template-interpolation",
    ]);
  });

  it("locks three page systems and one reusable BranchHomepage architecture", () => {
    expect(artifact.pageSystems.map((system) => system.id)).toEqual([
      "GROUP_HOMEPAGE",
      "BRANCH_HOMEPAGE",
      "NEWSROOM",
    ]);

    const branch = artifact.pageSystems.find(
      (system) => system.id === "BRANCH_HOMEPAGE",
    );
    expect(branch).toMatchObject({
      orchestrator: "BranchHomepage",
      sharedImplementation: true,
      websiteModel: "independent-tenant-websites",
      instantiation: "one-per-trusted-site-key-and-hostname",
      sites: ["consulting", "healthcare", "lifestyle", "realestate"],
    });
    expect(branch?.sections).toEqual([
      "banner-stack",
      "branch-header",
      "branch-hero",
      "statistics",
      "overview-focus-areas",
      "projects",
      "insights",
      "contact",
      "branch-footer",
    ]);
    expect(
      artifact.pageSystems.filter(
        (system) => system.orchestrator === "BranchHomepage",
      ),
    ).toHaveLength(1);
    expect(artifact.componentArchitecture).toMatchObject({
      serverDefault: true,
      branchHomepageInvariant:
        "same tested BranchHomepage component architecture, independently instantiated with a different trusted SiteKey, tenant dataset, hostname, and CMS records for each of four branch websites",
    });
    expect(artifact.componentArchitecture.prohibitedBranchPatterns).toContain(
      "branch-specific homepage component trees",
    );
    expect(artifact.canonicalPublicProductionTopology).toMatchObject({
      decisionStatus: "APPROVED_OWNER_DECISION",
      apex: "siratrgroup.com",
      sites: {
        group: "siratrgroup.com",
        consulting: "consulting.siratrgroup.com",
        healthcare: "healthcare.siratrgroup.com",
        lifestyle: "lifestyle.siratrgroup.com",
        realestate: "realestate.siratrgroup.com",
      },
      scope: "public-production-hostnames-only",
      canonicalPublicDomainGapStatus: "RESOLVED",
    });
    expect(artifact.canonicalPublicProductionTopology.notInferred).toEqual([
      "wordpress-backend-hostname",
      "graphql-endpoint-hostname",
      "media-origin-hostname",
      "staging-hostname",
      "vercel-preview-hostname",
      "cookie-domain-requirements",
      "cors-rules",
      "revalidation-endpoint-origins",
    ]);
  });

  it("limits Client Components to bounded interaction islands", () => {
    expect(artifact.componentArchitecture.serverComponents).toContain(
      "GroupHomepage",
    );
    expect(artifact.componentArchitecture.serverComponents).toContain(
      "BranchHomepage",
    );
    expect(artifact.componentArchitecture.clientIslands.map((island) =>
      island.component
    )).toEqual([
      "MobileNavigation",
      "HeroCarousel",
      "ContactForm",
      "InvestorInquiryForm",
      "TickerPauseControl",
    ]);
    expect(
      artifact.componentArchitecture.clientIslands.every(
        (island) => island.reason.trim().length > 20,
      ),
    ).toBe(true);
  });

  it("covers every required audit dimension and classifies every gap", () => {
    expect(artifact.auditDimensions).toHaveLength(19);
    expect(new Set(artifact.auditDimensions).size).toBe(19);
    expect(artifact.auditDimensions).toContain("ltr-rtl");
    expect(artifact.auditDimensions).toContain("reduced-motion");
    expect(artifact.auditDimensions).toContain("seo-preview");
    expect(artifact.auditDimensions).toContain("cms-correction-manifest");

    expect(artifact.gapCounts).toEqual({ BLOCKING: 11, NONBLOCKING: 5 });
    expect(artifact.gaps).toHaveLength(16);
    expect(
      artifact.gaps.filter((gap) => gap.severity === "BLOCKING"),
    ).toHaveLength(11);
    expect(
      artifact.gaps.filter((gap) => gap.severity === "NONBLOCKING"),
    ).toHaveLength(5);
    expect(new Set(artifact.gaps.map((gap) => gap.id)).size).toBe(16);
    expect(
      artifact.gaps.every(
        (gap) => gap.area.trim() !== "" && gap.owner.trim() !== "",
      ),
    ).toBe(true);
  });

  it("maps the current canonical live types instead of proposing duplicates", () => {
    const expectedFields = {
      SiraHomepage: ["branchHomepage", "groupHomepage", "variant"],
      SiraHomepageBranchHomepage: [
        "contact",
        "focusAreas",
        "footer",
        "hero",
        "insights",
        "overview",
        "projects",
        "statistics",
      ],
      SiraHomepageGroupHomepage: [
        "about",
        "companies",
        "contact",
        "hero",
        "insights",
        "investor",
        "latestUpdates",
        "partners",
        "projects",
        "services",
        "testimonials",
        "ticker",
      ],
      CompanyDetails: [
        "cardImageOverride",
        "externalWebsiteUrl",
        "operatingStatus",
        "shortDescriptor",
      ],
      InvestmentDetails: [
        "onePagerDocument",
        "publicDisplay",
        "relatedCompany",
        "relatedProject",
        "ticketSizeLabel",
      ],
      TestimonialDetails: [
        "consentApproved",
        "organization",
        "role",
        "sourceUrl",
      ],
      PartnerDetails: [
        "logoAltOverride",
        "relationshipLabel",
        "websiteUrl",
      ],
    } as const;

    for (const [typeName, fields] of Object.entries(expectedFields)) {
      const type = canonicalSchema.getType(typeName);
      expect(isObjectType(type), `${typeName} must be an object`).toBe(true);
      if (!isObjectType(type)) continue;
      expect(Object.keys(type.getFields())).toEqual(
        expect.arrayContaining([...fields]),
      );
    }

    expect(canonicalSchemaSource).not.toContain("siraNavigation:");
    expect(canonicalSchemaSource).not.toContain("siraEditorialFeed:");
    const service = groupSchema.getType("Service");
    const serviceItem = groupSchema.getType("ServiceItem");
    expect(isObjectType(service)).toBe(true);
    expect(isObjectType(serviceItem)).toBe(true);
    if (isObjectType(service)) {
      expect(service.getFields()).toHaveProperty("serviceItem");
    }
    if (isObjectType(serviceItem)) {
      expect(Object.keys(serviceItem.getFields())).toEqual(
        expect.arrayContaining([
          "advisoryServices",
          "impact",
          "photos",
          "serviceDetails",
        ]),
      );
    }
    expect(artifact.contractMap.find((entry) => entry.area === "homepage"))
      .toMatchObject({
        status: "BLOCKING_FRONTEND_CONTRACT_GAP",
      });
    expect(artifact.contractMap.find((entry) => entry.area === "editorial"))
      .toMatchObject({
        status: "READY_CONTRACT_MISSING_AUTHORIZED_CONTENT",
      });
  });

  it("keeps the CMS manifest exact, non-destructive, and unauthorized", () => {
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.status).toBe(
      "PROPOSED_PENDING_DESIGN_AND_OWNER_APPROVAL",
    );
    expect(manifest.authorization).toEqual({
      wordpressMutationAuthorized: false,
      contentDeletionAuthorized: false,
      destructiveCleanupAuthorized: false,
      backendRuntimeMutationAuthorized: false,
      productionDeploymentAuthorized: false,
    });
    expect(manifest.actions).toHaveLength(15);
    expect(new Set(manifest.actions.map((action) => action.id)).size).toBe(15);
    expect(
      manifest.actions.every(
        (action) =>
          action.destructive === false && action.mutationAuthorized === false,
      ),
    ).toBe(true);
    expect(manifest.actionCounts).toEqual({
      BLOCKING: 12,
      DEFERRED: 3,
      DESTRUCTIVE: 0,
      AUTHORIZED: 0,
    });

    const navigation = manifest.actions.find(
      (action) => action.id === "CMS-2C4-005",
    );
    expect(navigation).toMatchObject({
      area: "navigation",
      tenants: ["group", "consulting", "healthcare", "lifestyle", "realestate"],
      expected: {
        locationsPerTenant: ["PRIMARY", "FOOTER", "LEGAL"],
        totalAssignments: 15,
      },
    });

    const businessUnits = manifest.actions.find(
      (action) => action.id === "CMS-2C4-006",
    );
    expect(businessUnits?.targets).toEqual([
      { tenant: "consulting", slug: "consulting" },
      { tenant: "healthcare", slug: "healthcare" },
      { tenant: "lifestyle", slug: "lifestyle" },
      { tenant: "realestate", slug: "real-estate" },
    ]);
    const homepageEntities = manifest.actions.find(
      (action) => action.id === "CMS-2C4-010",
    );
    expect(homepageEntities).toMatchObject({
      target:
        "Companies, Services, Investments, Testimonials, Partners, and approved Documents selected by the Group homepage",
      expected: {
        services:
          "approved published Service records selected through the existing homepage services relationship, with stable identity, title, URI, card media and alt metadata, plus only the bounded existing Service.serviceItem fields required by the approved design",
      },
      destructive: false,
      mutationAuthorized: false,
    });
    expect(manifest.rollback).toMatchObject({
      requiredBeforeExecution: true,
      recordDeletion: "not permitted",
    });
  });

  it("persists no endpoints, credentials, private payloads, or mutation claim", () => {
    expect(artifact.security).toEqual({
      wordpressMutationOccurred: false,
      backendRuntimeMutationOccurred: false,
      productionDeploymentOccurred: false,
      productionUiImplementationOccurred: false,
      contentDeletionOccurred: false,
      credentialsPersisted: false,
      endpointValuesPersisted: false,
      productionAuthorized: false,
      sot001Status: "OPEN",
    });
    expect(artifact.authorization).toEqual({
      cmsMutationAuthorized: false,
      backendMutationAuthorized: false,
      productionComponentImplementationAuthorized: false,
      deploymentAuthorized: false,
      mergeAuthorized: false,
      nextGate: "OWNER_ACCEPTANCE",
    });

    for (const path of [
      "artifacts/step-2c4/design-data-contract-audit.json",
      "artifacts/step-2c4/cms-correction-manifest.json",
    ]) {
      const source = repositoryFile(path);
      expect(source).not.toMatch(/https?:\/\//u);
      expect(source).not.toMatch(/"(?:password|cookie|bearerToken|clientSecret)"/iu);
    }
  });
});
