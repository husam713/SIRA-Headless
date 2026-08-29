import { readFileSync } from "node:fs";
import {
  buildSchema,
  getNamedType,
  isEnumType,
  isObjectType,
  parse,
  TypeInfo,
  validate,
  visit,
  visitWithTypeInfo,
} from "graphql";
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
import { SIRA_BRAND_QUERY } from "@/queries/brand";
import {
  SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY,
  SIRA_EDITORIAL_FEED_QUERY,
} from "@/queries/editorial-feed";
import { SIRA_HOMEPAGE_QUERY } from "@/queries/homepage";
import { SIRA_NAVIGATION_QUERY } from "@/queries/navigation";
import { SIRA_PROJECTS_QUERY } from "@/queries/projects";
import { SIRA_PROJECT_SINGLE_QUERY } from "@/queries/project-single";

const canonicalSchema = buildSchema(
  readFileSync(
    new URL("../../schema/wpgraphql.graphql", import.meta.url),
    "utf8",
  ),
);

describe("approved SIRA GraphQL operation contracts", () => {
  it("derives the curated public brand operation from Codegen output", () => {
    expect(SIRA_BRAND_QUERY.operationName).toBe("SiraBrand");
    expect(SIRA_BRAND_QUERY.source).toBe(SiraBrandDocument.toString().trim());
    expect(SIRA_BRAND_QUERY.source).toContain("siraBrand");
  });

  it("keeps legacy banners and queries both typed public banner contracts", () => {
    expect(SIRA_BRAND_QUERY.source).toContain("announcementBanner");
    expect(SIRA_BRAND_QUERY.source).toContain("emergencyBanner");

    for (const field of ["announcement", "emergency"]) {
      expect(SIRA_BRAND_QUERY.source).toMatch(
        new RegExp(
          `${field}\\s*\\{[\\s\\S]*?message[\\s\\S]*?severity[\\s\\S]*?link\\s*\\{[\\s\\S]*?label[\\s\\S]*?url[\\s\\S]*?target[\\s\\S]*?\\}[\\s\\S]*?startsAt[\\s\\S]*?endsAt[\\s\\S]*?dismissible[\\s\\S]*?revisionKey[\\s\\S]*?\\}`,
        ),
      );
    }

    expect(SIRA_BRAND_QUERY.source).not.toContain("analyticsId");
    expect(SIRA_BRAND_QUERY.source).not.toContain("rawOptions");
    expect(SIRA_BRAND_QUERY.source).not.toContain("_sira_");
  });

  it("derives the editorial operation from canonical Codegen output", () => {
    expect(SIRA_EDITORIAL_FEED_QUERY.operationName).toBe(
      "SiraEditorialFeed",
    );
    expect(SIRA_EDITORIAL_FEED_QUERY.source).toBe(
      SiraEditorialFeedDocument.toString().trim(),
    );
    expect(
      validate(canonicalSchema, parse(SIRA_EDITORIAL_FEED_QUERY.source)),
    ).toEqual([]);
  });

  it("uses the native paginated editorial connection and approved types", () => {
    expect(SIRA_EDITORIAL_FEED_QUERY.source).toMatch(
      /contentNodes\s*\(\s*first:\s*\$first\s+after:\s*\$after/u,
    );
    expect(SIRA_EDITORIAL_FEED_QUERY.source).toContain("hasNextPage");
    expect(SIRA_EDITORIAL_FEED_QUERY.source).toContain("endCursor");
    expect(SIRA_EDITORIAL_FEED_QUERY.source).toContain(
      "orderby: [{field: DATE, order: DESC}]",
    );

    for (const type of [
      "SIRA_NEWS",
      "SIRA_INSIGHT",
      "SIRA_ARTICLE",
      "SIRA_PRESS_RELEASE",
    ]) {
      expect(SIRA_EDITORIAL_FEED_QUERY.source).toContain(type);
    }

    expect(SIRA_EDITORIAL_FEED_QUERY.source).not.toContain(
      "siraEditorialFeed",
    );
  });

  it("keeps the B4 editorial operation unfiltered by Business Unit", () => {
    expect(SIRA_EDITORIAL_FEED_QUERY.source).not.toMatch(
      /business.?unit/iu,
    );
    expect(SIRA_EDITORIAL_FEED_QUERY.source).not.toContain(
      "siraBusinessUnits",
    );
  });

  it("derives the filtered editorial operation from canonical Codegen output", () => {
    expect(SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY.operationName).toBe(
      "SiraBusinessUnitEditorialFeed",
    );
    expect(SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY.source).toBe(
      SiraBusinessUnitEditorialFeedDocument.toString().trim(),
    );
    expect(
      validate(
        canonicalSchema,
        parse(SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY.source),
      ),
    ).toEqual([]);
  });

  it("uses the canonical Business Unit slug lookup and native term connection", () => {
    const source = SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY.source;

    expect(source).toMatch(
      /siraBusinessUnit\s*\(\s*id:\s*\$businessUnit,\s*idType:\s*SLUG\s*\)/u,
    );
    expect(source).toMatch(
      /contentNodes\s*\(\s*first:\s*\$first\s+after:\s*\$after/u,
    );
    expect(source).toContain("hasNextPage");
    expect(source).toContain("endCursor");
    expect(source).toContain("orderby: [{field: DATE, order: DESC}]");

    for (const type of [
      "SIRA_NEWS",
      "SIRA_INSIGHT",
      "SIRA_ARTICLE",
      "SIRA_PRESS_RELEASE",
    ]) {
      expect(source).toContain(type);
    }

    expect(source).not.toContain("siraEditorialFeed");
    expect(source).not.toContain("siraBusinessUnits");
  });

  it("derives the homepage operation from canonical Codegen output", () => {
    expect(SIRA_HOMEPAGE_QUERY.operationName).toBe("SiraHomepage");
    expect(SIRA_HOMEPAGE_QUERY.source).toBe(
      SiraHomepageDocument.toString().trim(),
    );
    expect(
      validate(canonicalSchema, parse(SIRA_HOMEPAGE_QUERY.source)),
    ).toEqual([]);
  });

  it("uses only the approved root URI and canonical homepage variants", () => {
    expect(SIRA_HOMEPAGE_QUERY.source).toContain(
      'page(id: "/", idType: URI, asPreview: $asPreview)',
    );
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("siraHomepage");
    // No groupHomepage/branchHomepage wrapper — every section is a direct
    // sibling of `variant` (see the note on PresentationFields.php's
    // group_homepage_fields() for why that wrapper was removed).
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("groupHero");
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("branchHero");
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("pages(");
    for (const bound of [1, 6, 8, 12, 24]) {
      expect(SIRA_HOMEPAGE_QUERY.source).toContain(`first: ${bound}`);
    }
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("pageInfo");
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("hasNextPage");
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("publicDisplay");
    expect(SIRA_HOMEPAGE_QUERY.source).toContain("consentApproved");
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("SiraInvestor");
    expect(SIRA_HOMEPAGE_QUERY.source).not.toMatch(/\b(file|filePath|mediaItemUrl)\b/u);
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("/home");
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("analyticsId");
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("rawOptions");
    expect(SIRA_HOMEPAGE_QUERY.source).not.toContain("_sira_");
  });

  it("bounds every homepage relationship and requests truncation evidence", () => {
    const document = parse(SIRA_HOMEPAGE_QUERY.source);
    const typeInfo = new TypeInfo(canonicalSchema);
    const relationshipBounds: number[] = [];

    visit(
      document,
      visitWithTypeInfo(typeInfo, {
        Field(node) {
          const fieldType = typeInfo.getType();
          if (fieldType === undefined) return;
          const namedType = getNamedType(fieldType);
          if (namedType === undefined) return;
          if (
            namedType.name !== "AcfContentNodeConnection" &&
            namedType.name !== "AcfTermNodeConnection"
          ) return;

          const first = node.arguments?.find((argument) => argument.name.value === "first");
          expect(first?.value.kind).toBe("IntValue");
          if (first?.value.kind === "IntValue") {
            relationshipBounds.push(Number(first.value.value));
          }

          const pageInfo = node.selectionSet?.selections.find(
            (selection) => selection.kind === "Field" && selection.name.value === "pageInfo",
          );
          expect(pageInfo?.kind).toBe("Field");
          if (pageInfo?.kind === "Field") {
            expect(
              pageInfo.selectionSet?.selections.some(
                (selection) => selection.kind === "Field" && selection.name.value === "hasNextPage",
              ),
            ).toBe(true);
          }
        },
      }),
    );

    expect(relationshipBounds).toHaveLength(16);
    expect([...new Set(relationshipBounds)].sort((left, right) => left - right)).toEqual([
      1,
      6,
      8,
      12,
      24,
    ]);
  });

  it("derives the native navigation operation from canonical Codegen output", () => {
    expect(SIRA_NAVIGATION_QUERY.operationName).toBe("SiraNavigation");
    expect(SIRA_NAVIGATION_QUERY.source).toBe(
      SiraNavigationDocument.toString().trim(),
    );
    expect(
      validate(canonicalSchema, parse(SIRA_NAVIGATION_QUERY.source)),
    ).toEqual([]);
  });

  it("uses only evidence-backed native menu locations without a fallback menu", () => {
    for (const [scope, location] of [
      ["primary", "PRIMARY"],
      ["footer", "FOOTER"],
      ["legal", "LEGAL"],
    ] as const) {
      expect(SIRA_NAVIGATION_QUERY.source).toMatch(
        new RegExp(
          `${scope}: menus\\(first: 2, where: \\{location: ${location}\\}\\)`,
        ),
      );
    }

    expect(SIRA_NAVIGATION_QUERY.source).toContain("menuItems(first: 200)");
    expect(SIRA_NAVIGATION_QUERY.source).not.toContain("siraNavigation");
    expect(SIRA_NAVIGATION_QUERY.source).not.toMatch(/\bmenu\s*\(/u);
    expect(SIRA_NAVIGATION_QUERY.source).not.toMatch(/\b(name|slug)\b/u);
  });

  it("derives the project archive operation from canonical Codegen output", () => {
    expect(SIRA_PROJECTS_QUERY.operationName).toBe("SiraProjects");
    expect(SIRA_PROJECTS_QUERY.source).toBe(
      SiraProjectsDocument.toString().trim(),
    );
    expect(
      validate(canonicalSchema, parse(SIRA_PROJECTS_QUERY.source)),
    ).toEqual([]);
  });

  it("uses the canonical lightweight project archive coordinates", () => {
    expect(SIRA_PROJECTS_QUERY.source).toMatch(
      /siraProjects\s*\(\s*first:\s*\$first,\s*after:\s*\$after\s*\)/u,
    );
    expect(SIRA_PROJECTS_QUERY.source).toContain("hasNextPage");
    expect(SIRA_PROJECTS_QUERY.source).toContain("endCursor");
    expect(SIRA_PROJECTS_QUERY.source).toContain("isRestricted");
    expect(SIRA_PROJECTS_QUERY.source).toContain("projectDetails");
    expect(SIRA_PROJECTS_QUERY.source).toContain("subtitle");
    expect(SIRA_PROJECTS_QUERY.source).toContain("location");
    expect(SIRA_PROJECTS_QUERY.source).toContain("status");
    expect(SIRA_PROJECTS_QUERY.source).not.toContain("SiraProjectDetails");
    expect(SIRA_PROJECTS_QUERY.source).not.toMatch(
      /\b(gallery|statistics|relatedCompany|slug|content|date|modified)\b/u,
    );
    expect(SIRA_PROJECTS_QUERY.source).not.toContain("orderby");
    expect(SIRA_PROJECTS_QUERY.source).not.toContain("_sira_");
  });

  it("proves the shared project connection and ProjectDetails schema types", () => {
    const rootQuery = canonicalSchema.getQueryType();
    const projectConnection = canonicalSchema.getType(
      "RootQueryToSiraProjectConnection",
    );
    const project = canonicalSchema.getType("SiraProject");

    expect(rootQuery).toBeDefined();
    expect(rootQuery?.getFields()["siraProjects"]?.type.toString()).toBe(
      "RootQueryToSiraProjectConnection",
    );
    expect(
      Object.fromEntries(
        rootQuery?.getFields()["siraProjects"]?.args.map((argument) => [
          argument.name,
          argument.type.toString(),
        ]) ?? [],
      ),
    ).toEqual({
      after: "String",
      before: "String",
      first: "Int",
      last: "Int",
      where: "RootQueryToSiraProjectConnectionWhereArgs",
    });
    expect(isObjectType(projectConnection)).toBe(true);
    expect(
      isObjectType(projectConnection)
        ? projectConnection.getFields()["nodes"]?.type.toString()
        : null,
    ).toBe("[SiraProject!]!");
    expect(isObjectType(project)).toBe(true);
    expect(
      isObjectType(project)
        ? project.getFields()["projectDetails"]?.type.toString()
        : null,
    ).toBe("ProjectDetails");
    expect(
      isObjectType(project)
        ? project.getFields()["isRestricted"]?.type.toString()
        : null,
    ).toBe("Boolean");
  });

  it("derives the native project single operation from canonical Codegen output", () => {
    expect(SIRA_PROJECT_SINGLE_QUERY.operationName).toBe(
      "SiraProjectSingle",
    );
    expect(SIRA_PROJECT_SINGLE_QUERY.source).toBe(
      SiraProjectSingleDocument.toString().trim(),
    );
    expect(
      validate(canonicalSchema, parse(SIRA_PROJECT_SINGLE_QUERY.source)),
    ).toEqual([]);
  });

  it("uses the native URI project lookup without a plural first-node fallback", () => {
    const source = SIRA_PROJECT_SINGLE_QUERY.source;

    expect(source).toMatch(
      /siraProject\s*\(\s*id:\s*\$uri,\s*idType:\s*URI,\s*asPreview:\s*false\s*\)/u,
    );
    expect(source).not.toMatch(/\bsiraProjects\s*\(/u);
    expect(source).not.toMatch(/first:\s*1\b/u);
    expect(source).toContain("projectDetails");
    expect(source).not.toContain("SiraProjectDetails");
    expect(source).toContain("content(format: RENDERED)");
    expect(source).toMatch(/gallery\s*\(\s*first:\s*50\s*\)/u);
    expect(source).toMatch(
      /relatedCompany\s*\(\s*first:\s*10\s*\)/u,
    );
    expect(source.match(/hasNextPage/gu)).toHaveLength(2);
    expect(source.match(/endCursor/gu)).toHaveLength(2);
  });

  it("proves the native singular signature and complete locator enum", () => {
    const rootQuery = canonicalSchema.getQueryType();
    const field = rootQuery?.getFields()["siraProject"];
    const locatorEnum = canonicalSchema.getType("SiraProjectIdType");

    expect(field?.type.toString()).toBe("SiraProject");
    expect(
      Object.fromEntries(
        field?.args.map((argument) => [
          argument.name,
          argument.type.toString(),
        ]) ?? [],
      ),
    ).toEqual({
      asPreview: "Boolean",
      id: "ID!",
      idType: "SiraProjectIdType",
    });
    expect(isEnumType(locatorEnum)).toBe(true);
    expect(
      isEnumType(locatorEnum)
        ? locatorEnum.getValues().map((value) => value.name)
        : [],
    ).toEqual(["DATABASE_ID", "ID", "SLUG", "URI"]);
  });
});
