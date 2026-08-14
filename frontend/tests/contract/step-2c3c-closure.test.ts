import { readFileSync } from "node:fs";
import { buildSchema, isEnumType, Kind, parse, validate, visit } from "graphql";
import { describe, expect, it } from "vitest";
import {
  SiraBrandDocument,
  SiraBusinessUnitEditorialFeedDocument,
  SiraEditorialFeedDocument,
  SiraHomepageDocument,
  SiraNavigationDocument,
  SiraProjectSingleDocument,
  SiraProjectsDocument,
} from "@/generated/graphql/graphql";
import { getEditorialBusinessUnit } from "@/lib/editorial/business-unit";
import { SIRA_BRAND_QUERY } from "@/queries/brand";
import {
  SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY,
  SIRA_EDITORIAL_FEED_QUERY,
} from "@/queries/editorial-feed";
import { SIRA_HOMEPAGE_QUERY } from "@/queries/homepage";
import { SIRA_NAVIGATION_QUERY } from "@/queries/navigation";
import { SIRA_PROJECTS_QUERY } from "@/queries/projects";
import { SIRA_PROJECT_SINGLE_QUERY } from "@/queries/project-single";

function repositoryFile(relativePath: string): string {
  return readFileSync(
    new URL(`../../../${relativePath}`, import.meta.url),
    "utf8",
  );
}

const canonicalSchema = buildSchema(
  readFileSync(
    new URL("../../schema/wpgraphql.graphql", import.meta.url),
    "utf8",
  ),
);

const operations = [
  [SIRA_BRAND_QUERY.source, SiraBrandDocument.toString().trim()],
  [SIRA_HOMEPAGE_QUERY.source, SiraHomepageDocument.toString().trim()],
  [SIRA_NAVIGATION_QUERY.source, SiraNavigationDocument.toString().trim()],
  [
    SIRA_EDITORIAL_FEED_QUERY.source,
    SiraEditorialFeedDocument.toString().trim(),
  ],
  [
    SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY.source,
    SiraBusinessUnitEditorialFeedDocument.toString().trim(),
  ],
  [SIRA_PROJECTS_QUERY.source, SiraProjectsDocument.toString().trim()],
  [
    SIRA_PROJECT_SINGLE_QUERY.source,
    SiraProjectSingleDocument.toString().trim(),
  ],
] as const;

const ACCEPTED_EDITORIAL_CONTENT_TYPES = [
  "SIRA_NEWS",
  "SIRA_INSIGHT",
  "SIRA_ARTICLE",
  "SIRA_PRESS_RELEASE",
] as const;

const REJECTED_EDITORIAL_CONTENT_TYPES = [
  "SIRA_PERSPECTIVE",
  "SIRA_PUBLICATION",
] as const;

function editorialContentTypeLists(source: string): readonly string[][] {
  const contentTypeLists: string[][] = [];

  visit(parse(source), {
    ObjectField(node) {
      if (node.name.value !== "contentTypes" || node.value.kind !== Kind.LIST) {
        return;
      }

      contentTypeLists.push(
        node.value.values.map((value) => {
          if (value.kind !== Kind.ENUM) {
            throw new Error("Editorial contentTypes must contain enum literals.");
          }

          return value.value;
        }),
      );
    },
  });

  return contentTypeLists;
}

describe("Step 2C.3C cumulative closure contract", () => {
  it("keeps every B1-B7 operation generated and canonical-schema valid", () => {
    for (const [source, generatedSource] of operations) {
      expect(source).toBe(generatedSource);
      expect(validate(canonicalSchema, parse(source))).toEqual([]);
    }
  });

  it("keeps the checked-in canonical schema as Codegen source", () => {
    const codegen = repositoryFile("frontend/codegen.ts");

    expect(codegen).toContain('schema: "./schema/wpgraphql.graphql"');
    expect(codegen).toContain('documents: ["./src/queries/**/*.graphql"]');
    expect(codegen).not.toMatch(/schema:\s*["']https?:/u);
    expect(codegen).toContain("immutableTypes: true");
  });

  it("preserves typed and legacy Brand contracts without banner fallback coupling", () => {
    const source = SIRA_BRAND_QUERY.source;
    const normalizer = repositoryFile(
      "frontend/src/lib/brand/normalize-brand.ts",
    );
    const fallbacks = repositoryFile("frontend/src/lib/brand/fallbacks.ts");

    for (const field of [
      "announcementBanner",
      "emergencyBanner",
      "announcement",
      "emergency",
      "severity",
      "startsAt",
      "endsAt",
      "dismissible",
      "revisionKey",
    ]) {
      expect(source).toContain(field);
    }

    expect(normalizer).toContain(
      "announcementBanner: normalizeText(data.announcementBanner, 500)",
    );
    expect(normalizer).toMatch(
      /announcement:\s*normalizeBanner\(\s*data\.announcement,\s*"announcement"/u,
    );
    expect(fallbacks).toMatch(
      /announcementBanner:\s*null,[\s\S]*?emergencyBanner:\s*null,[\s\S]*?announcement:\s*null,[\s\S]*?emergency:\s*null/u,
    );
  });

  it("locks the canonical Homepage and native Navigation coordinates", () => {
    expect(SIRA_HOMEPAGE_QUERY.source).toContain(
      'page(id: "/", idType: URI, asPreview: $asPreview)',
    );
    expect(SIRA_HOMEPAGE_QUERY.source).not.toMatch(/\bpages\s*\(/u);
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("/home");
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("groupHomepage");
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("branchHomepage");

    for (const location of ["PRIMARY", "FOOTER", "LEGAL"]) {
      expect(SIRA_NAVIGATION_QUERY.source).toContain(`location: ${location}`);
    }
    expect(SIRA_NAVIGATION_QUERY.source).not.toContain("siraNavigation");
  });

  it("locks native editorial pagination and the exact ADR-014 mapping", () => {
    expect(SIRA_EDITORIAL_FEED_QUERY.source).toMatch(/\bcontentNodes\s*\(/u);
    expect(SIRA_EDITORIAL_FEED_QUERY.source).not.toMatch(/business.?unit/iu);
    expect(SIRA_EDITORIAL_FEED_QUERY.source).not.toContain(
      "siraEditorialFeed",
    );
    expect(SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY.source).toMatch(
      /siraBusinessUnit\s*\(\s*id:\s*\$businessUnit,\s*idType:\s*SLUG/u,
    );

    for (const operation of [
      SIRA_EDITORIAL_FEED_QUERY,
      SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY,
    ]) {
      const contentTypeLists = editorialContentTypeLists(operation.source);

      expect(contentTypeLists).toEqual([
        ACCEPTED_EDITORIAL_CONTENT_TYPES,
      ]);
      expect(contentTypeLists.flat()).not.toEqual(
        expect.arrayContaining([...REJECTED_EDITORIAL_CONTENT_TYPES]),
      );
    }

    expect({
      group: getEditorialBusinessUnit("group"),
      consulting: getEditorialBusinessUnit("consulting"),
      healthcare: getEditorialBusinessUnit("healthcare"),
      lifestyle: getEditorialBusinessUnit("lifestyle"),
      realestate: getEditorialBusinessUnit("realestate"),
    }).toEqual({
      group: null,
      consulting: "consulting",
      healthcare: "healthcare",
      lifestyle: "lifestyle",
      realestate: "real-estate",
    });
  });

  it("keeps Project Archive light and Project Single native and bounded", () => {
    expect(SIRA_PROJECTS_QUERY.source).toMatch(/\bsiraProjects\s*\(/u);
    expect(SIRA_PROJECTS_QUERY.source).not.toMatch(
      /\b(gallery|statistics|relatedCompany|content)\b/u,
    );
    expect(SIRA_PROJECT_SINGLE_QUERY.source).toMatch(
      /siraProject\s*\(\s*id:\s*\$uri,\s*idType:\s*URI,\s*asPreview:\s*false/u,
    );
    expect(SIRA_PROJECT_SINGLE_QUERY.source).not.toMatch(
      /\bsiraProjects\s*\(/u,
    );
    expect(SIRA_PROJECT_SINGLE_QUERY.source).toContain("projectDetails");
    expect(SIRA_PROJECT_SINGLE_QUERY.source).not.toContain(
      "SiraProjectDetails",
    );
    expect(SIRA_PROJECT_SINGLE_QUERY.source).toContain(
      "content(format: RENDERED)",
    );
    expect(SIRA_PROJECT_SINGLE_QUERY.source).toMatch(/gallery\(first:\s*50\)/u);
    expect(SIRA_PROJECT_SINGLE_QUERY.source).toMatch(
      /relatedCompany\(first:\s*10\)/u,
    );
  });

  it("locks the complete native project identifier enum", () => {
    const locatorType = canonicalSchema.getType("SiraProjectIdType");

    expect(isEnumType(locatorType)).toBe(true);
    expect(
      isEnumType(locatorType)
        ? locatorType.getValues().map(({ name }) => name)
        : [],
    ).toEqual(["DATABASE_ID", "ID", "SLUG", "URI"]);
  });

  it("keeps every published domain adapter server-only and site-isolated", () => {
    for (const path of [
      "frontend/src/lib/brand/get-brand.ts",
      "frontend/src/lib/homepage/get-homepage.ts",
      "frontend/src/lib/navigation/get-navigation.ts",
      "frontend/src/lib/editorial/get-editorial-feed.ts",
      "frontend/src/lib/projects/get-project-archive.ts",
      "frontend/src/lib/projects/get-project-single.ts",
    ]) {
      const source = repositoryFile(path);

      expect(source.startsWith('import "server-only";')).toBe(true);
      expect(source).toContain("fetchPublishedGraphQL");
      expect(source).toContain("siteKey");
      expect(source).not.toContain('"use client"');
    }
  });

  it("records accepted closure while SOT-001 and production gates stay open", () => {
    const state = JSON.parse(repositoryFile("project-state.json")) as {
      readonly status: string;
      readonly currentStage: string;
      readonly currentSubstage: string;
      readonly productionAuthorized: boolean;
      readonly latestAcceptedIncrement: {
        readonly stage: string;
        readonly status: string;
        readonly pullRequest: number;
        readonly implementationHead: string;
        readonly mergeCommit: string;
        readonly frontendCi: string;
        readonly fullRegression: string;
      };
      readonly knownConflicts: readonly {
        readonly id: string;
        readonly status: string;
      }[];
    };

    expect(state).toMatchObject({
      status: "IN_PROGRESS",
      currentStage: "2C.5A",
      currentSubstage: "2C.5A-CMS-PREFLIGHT",
      productionAuthorized: false,
      latestAcceptedIncrement: {
        stage: "Step 2C.4",
        status: "ACCEPTED_MERGED",
        pullRequest: 14,
        implementationHead: "a4d8945bf5b83e304b1b0fb434eb7441ea243849",
        mergeCommit: "710eec3cf90e1a7d707860f9ee73d0abf283019c",
        frontendCi: "PASS",
        fullRegression: "24 files / 204 tests PASS",
      },
    });
    expect(state.knownConflicts).toContainEqual(
      expect.objectContaining({ id: "SOT-001", status: "OPEN" }),
    );
  });
});
