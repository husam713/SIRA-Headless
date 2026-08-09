import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  buildSchema,
  lexicographicSortSchema,
} from "graphql";
import {
  assertExactBranchSchemas,
  assertRequiredContract,
  assertSafeArtifactObject,
  compareCanonicalToGroup,
  createSchemaMetadata,
} from "../../scripts/schema-compatibility.mjs";

const fixtureDirectory = fileURLToPath(
  new URL("../fixtures/schema/", import.meta.url),
);
const fetchScriptPath = fileURLToPath(
  new URL("../../scripts/fetch-schema.mjs", import.meta.url),
);

function fixture(name: string) {
  return lexicographicSortSchema(
    buildSchema(
      readFileSync(`${fixtureDirectory}${name}`, "utf8"),
    ),
  );
}

describe("live schema compatibility policy", () => {
  const canonical = fixture("canonical.graphql");

  it("requires exact equality across all four branch hashes", () => {
    const canonicalResult = assertExactBranchSchemas([
      { siteKey: "consulting", sha256: "same" },
      { siteKey: "healthcare", sha256: "same" },
      { siteKey: "lifestyle", sha256: "same" },
      { siteKey: "realestate", sha256: "same" },
    ]);

    expect(canonicalResult.siteKey).toBe("consulting");

    expect(() =>
      assertExactBranchSchemas([
        { siteKey: "consulting", sha256: "same" },
        { siteKey: "healthcare", sha256: "different" },
        { siteKey: "lifestyle", sha256: "same" },
        { siteKey: "realestate", sha256: "same" },
      ]),
    ).toThrow(/schemas differ/);
  });

  it("preserves all five site hashes in safe metadata", () => {
    const metadata = createSchemaMetadata(
      [
        {
          siteKey: "group",
          hostname: "siratrgroup.com",
          sha256: "1".repeat(64),
          role: "group-audit",
        },
        {
          siteKey: "consulting",
          hostname: "consulting.siratrgroup.com",
          sha256: "2".repeat(64),
          role: "canonical-branch",
        },
        {
          siteKey: "healthcare",
          hostname: "healthcare.siratrgroup.com",
          sha256: "2".repeat(64),
          role: "branch",
        },
        {
          siteKey: "lifestyle",
          hostname: "lifestyle.siratrgroup.com",
          sha256: "2".repeat(64),
          role: "branch",
        },
        {
          siteKey: "realestate",
          hostname: "realestate.siratrgroup.com",
          sha256: "2".repeat(64),
          role: "branch",
        },
      ],
      "2026-08-04T04:41:54.669Z",
    ) as {
      sites: Array<{
        siteKey: string;
        sha256: string;
      }>;
    };

    expect(metadata.sites).toHaveLength(5);
    expect(
      Object.fromEntries(
        metadata.sites.map((site) => [
          site.siteKey,
          site.sha256,
        ]),
      ),
    ).toEqual({
      group: "1".repeat(64),
      consulting: "2".repeat(64),
      healthcare: "2".repeat(64),
      lifestyle: "2".repeat(64),
      realestate: "2".repeat(64),
    });
    expect(() => assertSafeArtifactObject(metadata)).not.toThrow();
  });

  it("rejects credential-like keys in persisted schema artifacts", () => {
    expect(() =>
      assertSafeArtifactObject({
        source: "live",
        authorizationHeader: "must-not-persist",
      }),
    ).toThrow(/Unsafe persisted schema-artifact key/);

    expect(() =>
      assertSafeArtifactObject({
        sites: [
          {
            siteKey: "consulting",
            hostname: "consulting.siratrgroup.com",
            sha256: "a".repeat(64),
          },
        ],
      }),
    ).not.toThrow();
  });

  it("accepts a Group structural superset and reports legacy additions", () => {
    const comparison = compareCanonicalToGroup(
      canonical,
      fixture("group-superset.graphql"),
    );

    expect(comparison.compatible).toBe(true);
    expect(comparison.issues).toEqual([]);
    expect(comparison.groupOnlyAdditions.types).toContainEqual({
      name: "LegacyProject",
      kind: "OBJECT",
    });
    expect(comparison.groupOnlyAdditions.fields).toContainEqual({
      coordinate: "RootQuery.legacyProjects",
      type: "[LegacyProject]",
    });
    expect(comparison.groupOnlyAdditions.arguments).toContainEqual({
      coordinate: "RootQuery.siraProjects(after:)",
      type: "String",
      requiredWithoutDefault: false,
    });
  });

  it("rejects a missing canonical field", () => {
    const comparison = compareCanonicalToGroup(
      canonical,
      fixture("group-missing-field.graphql"),
    );

    expect(comparison.compatible).toBe(false);
    expect(comparison.issues).toContainEqual({
      code: "MISSING_FIELD",
      coordinate: "SiraProject.title",
      expected: "String",
      actual: null,
    });
  });

  it("rejects a changed canonical return type", () => {
    const comparison = compareCanonicalToGroup(
      canonical,
      fixture("group-changed-field.graphql"),
    );

    expect(comparison.compatible).toBe(false);
    expect(comparison.issues).toContainEqual({
      code: "FIELD_TYPE_MISMATCH",
      coordinate: "SiraProject.title",
      expected: "String",
      actual: "String!",
    });
  });

  it("rejects a Group-only required argument", () => {
    const comparison = compareCanonicalToGroup(
      canonical,
      fixture("group-required-argument.graphql"),
    );

    expect(comparison.compatible).toBe(false);
    expect(comparison.issues).toContainEqual({
      code: "GROUP_ONLY_REQUIRED_ARGUMENT",
      coordinate: "RootQuery.siraProjects(locale:)",
      expected: "optional group-only argument",
      actual: "String!",
    });
  });

  it("uses the operation name emitted by getIntrospectionQuery", () => {
    const source = readFileSync(fetchScriptPath, "utf8");

    expect(source).toContain(
      'operationName: "IntrospectionQuery"',
    );
    expect(source).not.toContain(
      'operationName: "SiraSchemaIntrospection"',
    );
  });

  it("rejects a Group-only required input field", () => {
    const canonicalInput = buildSchema(`
      type Query {
        search(where: SearchInput): String
      }

      input SearchInput {
        term: String
      }
    `);
    const groupInput = buildSchema(`
      type Query {
        search(where: SearchInput): String
      }

      input SearchInput {
        term: String
        locale: String!
      }
    `);

    const comparison = compareCanonicalToGroup(
      canonicalInput,
      groupInput,
    );

    expect(comparison.compatible).toBe(false);
    expect(comparison.issues).toContainEqual({
      code: "GROUP_ONLY_REQUIRED_INPUT_FIELD",
      coordinate: "SearchInput.locale",
      expected: "optional group-only input field",
      actual: "String!",
    });
  });

  it("rejects removal of canonical enum values and union members", () => {
    const canonicalAbstractTypes = buildSchema(`
      type Query {
        state: State
        result: SearchResult
      }

      enum State {
        ACTIVE
        ARCHIVED
      }

      union SearchResult = Article | Project

      type Article {
        id: ID!
      }

      type Project {
        id: ID!
      }
    `);
    const groupAbstractTypes = buildSchema(`
      type Query {
        state: State
        result: SearchResult
      }

      enum State {
        ACTIVE
      }

      union SearchResult = Article

      type Article {
        id: ID!
      }
    `);

    const comparison = compareCanonicalToGroup(
      canonicalAbstractTypes,
      groupAbstractTypes,
    );

    expect(comparison.compatible).toBe(false);
    expect(comparison.issues).toContainEqual({
      code: "MISSING_ENUM_VALUE",
      coordinate: "State.ARCHIVED",
      expected: "ARCHIVED",
      actual: null,
    });
    expect(comparison.issues).toContainEqual({
      code: "MISSING_UNION_MEMBER",
      coordinate: "SearchResult",
      expected: "Project",
      actual: null,
    });
  });

  it("reports a missing Group root type instead of throwing on a null root", () => {
  const canonicalWithMutation = buildSchema(`
    type Query {
      status: String
    }

    type Mutation {
      updateStatus: String
    }
  `);

  const groupWithoutMutation = buildSchema(`
    type Query {
      status: String
    }
  `);

  const mutationTypeSpy = vi
    .spyOn(groupWithoutMutation, "getMutationType")
    .mockReturnValue(null as never);

  try {
    expect(() =>
      compareCanonicalToGroup(
        canonicalWithMutation,
        groupWithoutMutation,
      ),
    ).not.toThrow();

    const comparison = compareCanonicalToGroup(
      canonicalWithMutation,
      groupWithoutMutation,
    );

    expect(comparison.compatible).toBe(false);

    expect(comparison.issues).toContainEqual({
      code: "MISSING_ROOT_TYPE",
      coordinate: "mutation",
      expected: "Mutation",
      actual: null,
    });
  } finally {
    mutationTypeSpy.mockRestore();
  }
});

  it("requires the verified live ProjectDetails type", () => {
    expect(() =>
      assertRequiredContract(canonical, "fixture"),
    ).not.toThrow();

    const wrongType = buildSchema(
      fixtureCanonicalWithWrongType(),
    );

    expect(() =>
      assertRequiredContract(wrongType, "wrong"),
    ).toThrow(/ProjectDetails/);
  });
});

function fixtureCanonicalWithWrongType() {
  return `
    schema {
      query: RootQuery
    }

    type RootQuery {
      siraBrand: SiraBrand!
      siraProjects: SiraProjectConnection
    }

    type SiraBrand {
      key: String!
    }

    type SiraProjectConnection {
      nodes: [SiraProject]
    }

    type SiraProject {
      projectDetails: SiraProjectDetails
    }

    type SiraProjectDetails {
      status: String
    }

    interface ContentNode {
      databaseId: Int!
    }

    type Page implements ContentNode {
      databaseId: Int!
    }

    type ProjectDetails {
      status: String
    }
  `;
}
