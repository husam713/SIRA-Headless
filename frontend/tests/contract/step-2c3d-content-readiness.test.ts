import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildFindings,
  classifySite,
} from "../../scripts/content-readiness-audit.mjs";

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
  readonly siteName: string;
  readonly inspected: boolean;
  readonly homepage: Readonly<Record<string, unknown>> & {
    readonly showOnFront: string;
  };
  readonly menus: Readonly<
    Record<
      "primary" | "footer" | "legal",
      Readonly<Record<string, unknown>> & { readonly assignedCount: number }
    >
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
    readonly root: Readonly<Record<string, unknown>> & {
      readonly returnedCount: number;
    };
    readonly branchFiltered: { readonly returnedCount: number } | null;
  };
  readonly projects: Readonly<Record<string, unknown>>;
  readonly brand: Readonly<Record<string, unknown>>;
}

type ReadinessMatrix = ReturnType<typeof classifySite>;

const clone = <T>(value: T): T => structuredClone(value);

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

  it("derives corrected branch homepage, menu, and Business Unit readiness from evidence", () => {
    const consulting = clone(artifact.sites.consulting);
    Object.assign(consulting.homepage, {
      showOnFront: "page",
      pageOnFront: 101,
      resolvesRootUri: true,
      databaseId: 101,
      uri: "/",
      status: "publish",
      isFrontPage: true,
      variant: "branch",
      expectedVariant: "branch",
      heroFieldPopulation: {
        eyebrow: true,
        headingBefore: true,
        headingHighlight: true,
        headingAfter: true,
        description: true,
        region: true,
      },
    });
    Object.assign(consulting.menus.primary, {
      assignedCount: 1,
      truncated: false,
      menus: [
        {
          databaseId: 201,
          name: "Primary",
          slug: "primary",
          restricted: false,
          locations: ["PRIMARY"],
          itemCount: 1,
          truncated: false,
          unsafeUrlCount: 0,
          restrictedItemCount: 0,
          duplicateIdentityCount: 0,
          orphanCount: 0,
        },
      ],
    });
    Object.assign(consulting.businessUnit, {
      term: {
        databaseId: 81,
        name: "Consulting",
        slug: "consulting",
        totalAssignedObjectCount: 1,
      },
    });

    const matrix = classifySite("consulting", consulting);
    expect(matrix.frontPage).toBe("READY");
    expect(matrix.primaryMenu).toBe("READY");
    expect(matrix.businessUnit).toBe("READY");
  });

  it("compares every site brand against canonical identity evidence", () => {
    const correctedGroup = clone(artifact.sites.group);
    Object.assign(correctedGroup.brand, {
      key: "group",
      name: "SIRA GROUP",
      tagline: "Shaping a smarter future.",
      colors: {
        primary: "#cca34b",
        secondary: "#172232",
        accent: "#cca34b",
        paper: "#f7f4ed",
        ink: "#20242b",
      },
    });
    expect(classifySite("group", correctedGroup).brand).toBe("READY");

    const corruptedConsulting = clone(artifact.sites.consulting);
    Object.assign(corruptedConsulting.brand, { name: "Unexpected Consulting" });
    expect(classifySite("consulting", corruptedConsulting).brand).toBe(
      "DATA_CORRECTION_REQUIRED",
    );
  });

  it("does not keep usable branch content and projects in owner-decision state", () => {
    const consulting = clone(artifact.sites.consulting);
    Object.assign(consulting.businessUnit, {
      term: {
        databaseId: 81,
        name: "Consulting",
        slug: "consulting",
        totalAssignedObjectCount: 1,
      },
    });
    const usableEditorial = clone(artifact.sites.group.editorial.root);
    Object.assign(consulting.editorial, {
      branchFiltered: usableEditorial,
    });
    const usableProjects = clone(artifact.sites.group.projects);
    Object.assign(usableProjects, {
      missingFeaturedImageCount: 0,
      missingFeaturedAltCount: 0,
      missingSubtitleCount: 0,
    });
    Object.assign(consulting, { projects: usableProjects });

    const matrix = classifySite("consulting", consulting);
    expect(matrix.editorial).toBe("READY");
    expect(matrix.projects).toBe("READY");
  });

  it("derives banner and media corrections from current evidence", () => {
    const consulting = clone(artifact.sites.consulting);
    Object.assign(consulting.brand, {
      announcement: {
        state: "populated",
        messagePresent: false,
        severity: "INFO",
        linkPresent: false,
        linkSafe: null,
        target: null,
        startsAt: null,
        endsAt: null,
        dismissible: true,
        revisionKeyPresent: true,
        schedule: "active",
      },
      logo: {
        populated: true,
        databaseId: 91,
        safeSourceUrl: false,
        hasAltText: true,
        width: 100,
        height: 100,
        restricted: false,
      },
    });

    const matrix = classifySite("consulting", consulting);
    expect(matrix.announcement).toBe("DATA_CORRECTION_REQUIRED");
    expect(matrix.media).toBe("EDITORIAL_ACTION");
  });

  it("generates findings only for evidence-derived non-READY areas", () => {
    const consulting = clone(artifact.sites.consulting);
    Object.assign(consulting.menus.primary, {
      assignedCount: 1,
      truncated: false,
      menus: [
        {
          databaseId: 201,
          name: "Primary",
          slug: "primary",
          restricted: false,
          locations: ["PRIMARY"],
          itemCount: 1,
          truncated: false,
          unsafeUrlCount: 0,
          restrictedItemCount: 0,
          duplicateIdentityCount: 0,
          orphanCount: 0,
        },
      ],
    });
    const matrix = classifySite("consulting", consulting);
    const findings = buildFindings(
      { consulting },
      { consulting: matrix } satisfies Readonly<
        Record<string, ReadinessMatrix>
      >,
    );

    expect(matrix.primaryMenu).toBe("READY");
    expect(findings.some((finding) => finding.area === "primaryMenu")).toBe(
      false,
    );
    expect(
      findings.every((finding) => finding.classification !== "READY"),
    ).toBe(true);
  });
});
