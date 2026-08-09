import { createHash } from "node:crypto";
import {
  astFromValue,
  getNamedType,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  isRequiredArgument,
  isRequiredInputField,
  isScalarType,
  isUnionType,
  print,
} from "graphql";

export const SITE_DEFINITIONS = Object.freeze([
  Object.freeze({
    siteKey: "group",
    environmentKey: "SIRA_WP_GROUP_GRAPHQL_URL",
    role: "group-audit",
  }),
  Object.freeze({
    siteKey: "consulting",
    environmentKey: "SIRA_WP_CONSULTING_GRAPHQL_URL",
    role: "canonical-branch",
  }),
  Object.freeze({
    siteKey: "healthcare",
    environmentKey: "SIRA_WP_HEALTHCARE_GRAPHQL_URL",
    role: "branch",
  }),
  Object.freeze({
    siteKey: "lifestyle",
    environmentKey: "SIRA_WP_LIFESTYLE_GRAPHQL_URL",
    role: "branch",
  }),
  Object.freeze({
    siteKey: "realestate",
    environmentKey: "SIRA_WP_REALESTATE_GRAPHQL_URL",
    role: "branch",
  }),
]);

export const BRANCH_SITE_KEYS = Object.freeze([
  "consulting",
  "healthcare",
  "lifestyle",
  "realestate",
]);

export const CANONICAL_BRANCH_SITE_KEY = "consulting";
export const GROUP_SITE_KEY = "group";
export const SCHEMA_POLICY = "four-branch-exact-group-structural-superset";
export const SCHEMA_SOURCE = "live-multisite-introspection";

export const REQUIRED_ROOT_FIELDS = Object.freeze([
  "siraBrand",
  "siraProjects",
]);

export const REQUIRED_TYPES = Object.freeze([
  "ContentNode",
  "Page",
  "SiraBrand",
  "SiraProject",
  "ProjectDetails",
]);

const FORBIDDEN_ARTIFACT_KEY =
  /(authorization|credential|password|secret|token|header|endpoint|cookie)/i;

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function typeKind(type) {
  if (isScalarType(type)) {
    return "SCALAR";
  }

  if (isObjectType(type)) {
    return "OBJECT";
  }

  if (isInterfaceType(type)) {
    return "INTERFACE";
  }

  if (isUnionType(type)) {
    return "UNION";
  }

  if (isEnumType(type)) {
    return "ENUM";
  }

  if (isInputObjectType(type)) {
    return "INPUT_OBJECT";
  }

  return "UNKNOWN";
}

function defaultSignature(definition, type) {
  const modernDefault = definition.default;

  if (modernDefault !== undefined) {
    if (
      modernDefault !== null &&
      typeof modernDefault === "object" &&
      Object.hasOwn(modernDefault, "literal")
    ) {
      return {
        present: true,
        value: print(modernDefault.literal),
      };
    }

    if (
      modernDefault !== null &&
      typeof modernDefault === "object" &&
      Object.hasOwn(modernDefault, "value")
    ) {
      const ast = astFromValue(modernDefault.value, type);

      return {
        present: true,
        value:
          ast === null
            ? JSON.stringify(modernDefault.value)
            : print(ast),
      };
    }
  }

  const legacyDefault = definition.defaultValue;

  if (legacyDefault === undefined) {
    return {
      present: false,
      value: null,
    };
  }

  const ast = astFromValue(legacyDefault, type);

  return {
    present: true,
    value: ast === null ? JSON.stringify(legacyDefault) : print(ast),
  };
}

function compareArgumentContract({
  canonicalArguments,
  groupArguments,
  coordinate,
  issues,
  additions,
}) {
  const groupByName = new Map(
    groupArguments.map((argument) => [argument.name, argument]),
  );

  for (const canonicalArgument of canonicalArguments) {
    const groupArgument = groupByName.get(canonicalArgument.name);

    if (groupArgument === undefined) {
      issues.push({
        code: "MISSING_ARGUMENT",
        coordinate: `${coordinate}(${canonicalArgument.name}:)`,
        expected: String(canonicalArgument.type),
        actual: null,
      });
      continue;
    }

    if (String(groupArgument.type) !== String(canonicalArgument.type)) {
      issues.push({
        code: "ARGUMENT_TYPE_MISMATCH",
        coordinate: `${coordinate}(${canonicalArgument.name}:)`,
        expected: String(canonicalArgument.type),
        actual: String(groupArgument.type),
      });
    }

    const canonicalDefault = defaultSignature(
      canonicalArgument,
      canonicalArgument.type,
    );
    const groupDefault = defaultSignature(
      groupArgument,
      groupArgument.type,
    );

    if (JSON.stringify(groupDefault) !== JSON.stringify(canonicalDefault)) {
      issues.push({
        code: "ARGUMENT_DEFAULT_MISMATCH",
        coordinate: `${coordinate}(${canonicalArgument.name}:)`,
        expected: canonicalDefault,
        actual: groupDefault,
      });
    }
  }

  const canonicalNames = new Set(
    canonicalArguments.map((argument) => argument.name),
  );

  for (const groupArgument of groupArguments) {
    if (canonicalNames.has(groupArgument.name)) {
      continue;
    }

    const requiredWithoutDefault = isRequiredArgument(groupArgument);

    additions.arguments.push({
      coordinate: `${coordinate}(${groupArgument.name}:)`,
      type: String(groupArgument.type),
      requiredWithoutDefault,
    });

    if (requiredWithoutDefault) {
      issues.push({
        code: "GROUP_ONLY_REQUIRED_ARGUMENT",
        coordinate: `${coordinate}(${groupArgument.name}:)`,
        expected: "optional group-only argument",
        actual: String(groupArgument.type),
      });
    }
  }
}

function compareFields({
  canonicalType,
  groupType,
  issues,
  additions,
}) {
  const canonicalFields = canonicalType.getFields();
  const groupFields = groupType.getFields();

  for (const [fieldName, canonicalField] of Object.entries(canonicalFields)) {
    const coordinate = `${canonicalType.name}.${fieldName}`;
    const groupField = groupFields[fieldName];

    if (groupField === undefined) {
      issues.push({
        code: "MISSING_FIELD",
        coordinate,
        expected: String(canonicalField.type),
        actual: null,
      });
      continue;
    }

    if (String(groupField.type) !== String(canonicalField.type)) {
      issues.push({
        code: "FIELD_TYPE_MISMATCH",
        coordinate,
        expected: String(canonicalField.type),
        actual: String(groupField.type),
      });
    }

    compareArgumentContract({
      canonicalArguments: canonicalField.args,
      groupArguments: groupField.args,
      coordinate,
      issues,
      additions,
    });
  }

  for (const [fieldName, groupField] of Object.entries(groupFields)) {
    if (canonicalFields[fieldName] !== undefined) {
      continue;
    }

    additions.fields.push({
      coordinate: `${groupType.name}.${fieldName}`,
      type: String(groupField.type),
    });
  }
}

function compareInterfaces({
  canonicalType,
  groupType,
  issues,
  additions,
}) {
  const canonicalInterfaces = new Set(
    canonicalType.getInterfaces().map((interfaceType) => interfaceType.name),
  );
  const groupInterfaces = new Set(
    groupType.getInterfaces().map((interfaceType) => interfaceType.name),
  );

  for (const interfaceName of canonicalInterfaces) {
    if (!groupInterfaces.has(interfaceName)) {
      issues.push({
        code: "MISSING_INTERFACE",
        coordinate: canonicalType.name,
        expected: interfaceName,
        actual: null,
      });
    }
  }

  for (const interfaceName of groupInterfaces) {
    if (!canonicalInterfaces.has(interfaceName)) {
      additions.interfaces.push({
        type: groupType.name,
        interface: interfaceName,
      });
    }
  }
}

function compareInputFields({
  canonicalType,
  groupType,
  issues,
  additions,
}) {
  const canonicalFields = canonicalType.getFields();
  const groupFields = groupType.getFields();

  for (const [fieldName, canonicalField] of Object.entries(canonicalFields)) {
    const coordinate = `${canonicalType.name}.${fieldName}`;
    const groupField = groupFields[fieldName];

    if (groupField === undefined) {
      issues.push({
        code: "MISSING_INPUT_FIELD",
        coordinate,
        expected: String(canonicalField.type),
        actual: null,
      });
      continue;
    }

    if (String(groupField.type) !== String(canonicalField.type)) {
      issues.push({
        code: "INPUT_FIELD_TYPE_MISMATCH",
        coordinate,
        expected: String(canonicalField.type),
        actual: String(groupField.type),
      });
    }

    const canonicalDefault = defaultSignature(
      canonicalField,
      canonicalField.type,
    );
    const groupDefault = defaultSignature(
      groupField,
      groupField.type,
    );

    if (JSON.stringify(groupDefault) !== JSON.stringify(canonicalDefault)) {
      issues.push({
        code: "INPUT_FIELD_DEFAULT_MISMATCH",
        coordinate,
        expected: canonicalDefault,
        actual: groupDefault,
      });
    }
  }

  for (const [fieldName, groupField] of Object.entries(groupFields)) {
    if (canonicalFields[fieldName] !== undefined) {
      continue;
    }

    const requiredWithoutDefault = isRequiredInputField(groupField);

    additions.inputFields.push({
      coordinate: `${groupType.name}.${fieldName}`,
      type: String(groupField.type),
      requiredWithoutDefault,
    });

    if (requiredWithoutDefault) {
      issues.push({
        code: "GROUP_ONLY_REQUIRED_INPUT_FIELD",
        coordinate: `${groupType.name}.${fieldName}`,
        expected: "optional group-only input field",
        actual: String(groupField.type),
      });
    }
  }
}

function compareEnumValues({
  canonicalType,
  groupType,
  issues,
  additions,
}) {
  const canonicalValues = new Set(
    canonicalType.getValues().map((value) => value.name),
  );
  const groupValues = new Set(groupType.getValues().map((value) => value.name));

  for (const valueName of canonicalValues) {
    if (!groupValues.has(valueName)) {
      issues.push({
        code: "MISSING_ENUM_VALUE",
        coordinate: `${canonicalType.name}.${valueName}`,
        expected: valueName,
        actual: null,
      });
    }
  }

  for (const valueName of groupValues) {
    if (!canonicalValues.has(valueName)) {
      additions.enumValues.push({
        enum: groupType.name,
        value: valueName,
      });
    }
  }
}

function compareUnionMembers({
  canonicalType,
  groupType,
  issues,
  additions,
}) {
  const canonicalMembers = new Set(
    canonicalType.getTypes().map((type) => type.name),
  );
  const groupMembers = new Set(groupType.getTypes().map((type) => type.name));

  for (const memberName of canonicalMembers) {
    if (!groupMembers.has(memberName)) {
      issues.push({
        code: "MISSING_UNION_MEMBER",
        coordinate: canonicalType.name,
        expected: memberName,
        actual: null,
      });
    }
  }

  for (const memberName of groupMembers) {
    if (!canonicalMembers.has(memberName)) {
      additions.unionMembers.push({
        union: groupType.name,
        member: memberName,
      });
    }
  }
}

function compareDirectives(canonicalSchema, groupSchema, issues, additions) {
  const canonicalDirectives = new Map(
    canonicalSchema.getDirectives().map((directive) => [
      directive.name,
      directive,
    ]),
  );
  const groupDirectives = new Map(
    groupSchema.getDirectives().map((directive) => [directive.name, directive]),
  );

  for (const [directiveName, canonicalDirective] of canonicalDirectives) {
    const groupDirective = groupDirectives.get(directiveName);
    const coordinate = `@${directiveName}`;

    if (groupDirective === undefined) {
      issues.push({
        code: "MISSING_DIRECTIVE",
        coordinate,
        expected: coordinate,
        actual: null,
      });
      continue;
    }

    if (groupDirective.isRepeatable !== canonicalDirective.isRepeatable) {
      issues.push({
        code: "DIRECTIVE_REPEATABILITY_MISMATCH",
        coordinate,
        expected: canonicalDirective.isRepeatable,
        actual: groupDirective.isRepeatable,
      });
    }

    const canonicalLocations = new Set(canonicalDirective.locations);
    const groupLocations = new Set(groupDirective.locations);

    for (const location of canonicalLocations) {
      if (!groupLocations.has(location)) {
        issues.push({
          code: "MISSING_DIRECTIVE_LOCATION",
          coordinate,
          expected: location,
          actual: null,
        });
      }
    }

    for (const location of groupLocations) {
      if (!canonicalLocations.has(location)) {
        additions.directiveLocations.push({
          directive: coordinate,
          location,
        });
      }
    }

    compareArgumentContract({
      canonicalArguments: canonicalDirective.args,
      groupArguments: groupDirective.args,
      coordinate,
      issues,
      additions,
    });
  }

  for (const [directiveName] of groupDirectives) {
    if (!canonicalDirectives.has(directiveName)) {
      additions.directives.push(`@${directiveName}`);
    }
  }
}

function compareRootTypes(canonicalSchema, groupSchema, issues) {
  const operations = [
    ["query", canonicalSchema.getQueryType(), groupSchema.getQueryType()],
    ["mutation", canonicalSchema.getMutationType(), groupSchema.getMutationType()],
    [
      "subscription",
      canonicalSchema.getSubscriptionType(),
      groupSchema.getSubscriptionType(),
    ],
  ];

  for (const [operation, canonicalRoot, groupRoot] of operations) {
    if (canonicalRoot === undefined) {
      continue;
    }

    if (groupRoot === undefined) {
      issues.push({
        code: "MISSING_ROOT_TYPE",
        coordinate: operation,
        expected: canonicalRoot.name,
        actual: null,
      });
      continue;
    }

    if (groupRoot.name !== canonicalRoot.name) {
      issues.push({
        code: "ROOT_TYPE_MISMATCH",
        coordinate: operation,
        expected: canonicalRoot.name,
        actual: groupRoot.name,
      });
    }
  }
}

function emptyAdditions() {
  return {
    types: [],
    fields: [],
    arguments: [],
    inputFields: [],
    enumValues: [],
    unionMembers: [],
    interfaces: [],
    directives: [],
    directiveLocations: [],
  };
}

function sortAdditions(additions) {
  return {
    types: additions.types.sort((left, right) =>
      left.name.localeCompare(right.name),
    ),
    fields: additions.fields.sort((left, right) =>
      left.coordinate.localeCompare(right.coordinate),
    ),
    arguments: additions.arguments.sort((left, right) =>
      left.coordinate.localeCompare(right.coordinate),
    ),
    inputFields: additions.inputFields.sort((left, right) =>
      left.coordinate.localeCompare(right.coordinate),
    ),
    enumValues: additions.enumValues.sort((left, right) =>
      `${left.enum}.${left.value}`.localeCompare(
        `${right.enum}.${right.value}`,
      ),
    ),
    unionMembers: additions.unionMembers.sort((left, right) =>
      `${left.union}.${left.member}`.localeCompare(
        `${right.union}.${right.member}`,
      ),
    ),
    interfaces: additions.interfaces.sort((left, right) =>
      `${left.type}.${left.interface}`.localeCompare(
        `${right.type}.${right.interface}`,
      ),
    ),
    directives: sorted(additions.directives),
    directiveLocations: additions.directiveLocations.sort((left, right) =>
      `${left.directive}.${left.location}`.localeCompare(
        `${right.directive}.${right.location}`,
      ),
    ),
  };
}

export function compareCanonicalToGroup(canonicalSchema, groupSchema) {
  const issues = [];
  const additions = emptyAdditions();

  compareRootTypes(canonicalSchema, groupSchema, issues);

  const canonicalTypes = canonicalSchema.getTypeMap();
  const groupTypes = groupSchema.getTypeMap();

  for (const [typeName, canonicalType] of Object.entries(canonicalTypes)) {
    if (typeName.startsWith("__")) {
      continue;
    }

    const groupType = groupTypes[typeName];

    if (groupType === undefined) {
      issues.push({
        code: "MISSING_TYPE",
        coordinate: typeName,
        expected: typeKind(canonicalType),
        actual: null,
      });
      continue;
    }

    const canonicalKind = typeKind(canonicalType);
    const groupKind = typeKind(groupType);

    if (canonicalKind !== groupKind) {
      issues.push({
        code: "TYPE_KIND_MISMATCH",
        coordinate: typeName,
        expected: canonicalKind,
        actual: groupKind,
      });
      continue;
    }

    if (
      (isObjectType(canonicalType) && isObjectType(groupType)) ||
      (isInterfaceType(canonicalType) && isInterfaceType(groupType))
    ) {
      compareFields({
        canonicalType,
        groupType,
        issues,
        additions,
      });
      compareInterfaces({
        canonicalType,
        groupType,
        issues,
        additions,
      });
      continue;
    }

    if (
      isInputObjectType(canonicalType) &&
      isInputObjectType(groupType)
    ) {
      compareInputFields({
        canonicalType,
        groupType,
        issues,
        additions,
      });
      continue;
    }

    if (isEnumType(canonicalType) && isEnumType(groupType)) {
      compareEnumValues({
        canonicalType,
        groupType,
        issues,
        additions,
      });
      continue;
    }

    if (isUnionType(canonicalType) && isUnionType(groupType)) {
      compareUnionMembers({
        canonicalType,
        groupType,
        issues,
        additions,
      });
      continue;
    }

    if (
      isScalarType(canonicalType) &&
      isScalarType(groupType) &&
      canonicalType.specifiedByURL !== groupType.specifiedByURL
    ) {
      issues.push({
        code: "SCALAR_SPECIFIED_BY_MISMATCH",
        coordinate: typeName,
        expected: canonicalType.specifiedByURL ?? null,
        actual: groupType.specifiedByURL ?? null,
      });
    }
  }

  for (const [typeName, groupType] of Object.entries(groupTypes)) {
    if (
      typeName.startsWith("__") ||
      canonicalTypes[typeName] !== undefined
    ) {
      continue;
    }

    additions.types.push({
      name: typeName,
      kind: typeKind(groupType),
    });
  }

  compareDirectives(canonicalSchema, groupSchema, issues, additions);

  issues.sort((left, right) =>
    `${left.coordinate}:${left.code}`.localeCompare(
      `${right.coordinate}:${right.code}`,
    ),
  );

  return {
    compatible: issues.length === 0,
    issues,
    groupOnlyAdditions: sortAdditions(additions),
  };
}

export function schemaHash(schemaText) {
  return createHash("sha256").update(schemaText).digest("hex");
}

export function assertExactBranchSchemas(results) {
  const branchResults = results.filter((result) =>
    BRANCH_SITE_KEYS.includes(result.siteKey),
  );

  if (branchResults.length !== BRANCH_SITE_KEYS.length) {
    throw new Error("Not all four branch schemas were provided.");
  }

  const uniqueSiteKeys = new Set(
    branchResults.map((result) => result.siteKey),
  );

  if (uniqueSiteKeys.size !== BRANCH_SITE_KEYS.length) {
    throw new Error("Branch schema results contain duplicate site keys.");
  }

  for (const siteKey of BRANCH_SITE_KEYS) {
    if (!uniqueSiteKeys.has(siteKey)) {
      throw new Error(`Branch schema result is missing for ${siteKey}.`);
    }
  }

  const hashes = new Set(
    branchResults.map((result) => result.sha256),
  );

  if (hashes.size !== 1) {
    const summary = branchResults
      .map((result) => `${result.siteKey}:${result.sha256}`)
      .join(", ");

    throw new Error(`SIRA branch GraphQL schemas differ: ${summary}`);
  }

  const canonical = branchResults.find(
    (result) => result.siteKey === CANONICAL_BRANCH_SITE_KEY,
  );

  if (canonical === undefined) {
    throw new Error("Canonical Consulting schema result is missing.");
  }

  return canonical;
}

export function assertRequiredContract(schema, siteKey) {
  const queryType = schema.getQueryType();

  if (queryType === undefined) {
    throw new Error(`No RootQuery type was found for ${siteKey}.`);
  }

  for (const fieldName of REQUIRED_ROOT_FIELDS) {
    if (queryType.getFields()[fieldName] === undefined) {
      throw new Error(
        `Required RootQuery field ${fieldName} is missing on ${siteKey}.`,
      );
    }
  }

  for (const typeName of REQUIRED_TYPES) {
    if (schema.getType(typeName) === undefined) {
      throw new Error(`Required type ${typeName} is missing on ${siteKey}.`);
    }
  }

  const projectType = schema.getType("SiraProject");

  if (!isObjectType(projectType)) {
    throw new Error(`SiraProject is not an object type on ${siteKey}.`);
  }

  const projectDetailsField = projectType.getFields().projectDetails;

  if (projectDetailsField === undefined) {
    throw new Error(
      `SiraProject.projectDetails is missing on ${siteKey}.`,
    );
  }

  if (getNamedType(projectDetailsField.type).name !== "ProjectDetails") {
    throw new Error(
      `SiraProject.projectDetails must resolve to ProjectDetails on ${siteKey}.`,
    );
  }
}

export function assertSafeArtifactObject(value, path = "artifact") {
  if (Array.isArray(value)) {
    value.forEach((child, index) =>
      assertSafeArtifactObject(child, `${path}[${index}]`),
    );
    return;
  }

  if (value === null || typeof value !== "object") {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_ARTIFACT_KEY.test(key)) {
      throw new Error(
        `Unsafe persisted schema-artifact key ${path}.${key}.`,
      );
    }

    assertSafeArtifactObject(child, `${path}.${key}`);
  }
}

export function stableJson(value) {
  if (Array.isArray(value)) {
    return value.map(stableJson);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableJson(child)]),
    );
  }

  return value;
}

export function createSchemaMetadata(results, fetchedAt) {
  const canonical = results.find(
    (result) => result.siteKey === CANONICAL_BRANCH_SITE_KEY,
  );
  const group = results.find(
    (result) => result.siteKey === GROUP_SITE_KEY,
  );

  if (canonical === undefined || group === undefined) {
    throw new Error("Canonical branch or Group schema result is missing.");
  }

  const metadata = {
    source: SCHEMA_SOURCE,
    policy: SCHEMA_POLICY,
    fetchedAt,
    canonicalSite: canonical.siteKey,
    canonicalSha256: canonical.sha256,
    groupAuditSite: group.siteKey,
    groupSha256: group.sha256,
    sites: results.map(({ siteKey, hostname, sha256, role }) => ({
      siteKey,
      hostname,
      sha256,
      role,
    })),
  };

  assertSafeArtifactObject(metadata);

  return stableJson(metadata);
}

export function createCompatibilityReport({
  results,
  comparison,
  generatedAt,
}) {
  const canonical = results.find(
    (result) => result.siteKey === CANONICAL_BRANCH_SITE_KEY,
  );
  const group = results.find(
    (result) => result.siteKey === GROUP_SITE_KEY,
  );

  if (canonical === undefined || group === undefined) {
    throw new Error("Canonical branch or Group schema result is missing.");
  }

  const branchHashes = Object.fromEntries(
    results
      .filter((result) => BRANCH_SITE_KEYS.includes(result.siteKey))
      .map((result) => [result.siteKey, result.sha256]),
  );

  const report = {
    source: SCHEMA_SOURCE,
    policy: SCHEMA_POLICY,
    generatedAt,
    compatible: comparison.compatible,
    canonical: {
      siteKey: canonical.siteKey,
      sha256: canonical.sha256,
    },
    branches: {
      siteKeys: BRANCH_SITE_KEYS,
      exactSchemaEquality:
        new Set(Object.values(branchHashes)).size === 1,
      hashes: branchHashes,
    },
    group: {
      siteKey: group.siteKey,
      sha256: group.sha256,
      structurallyContainsCanonical: comparison.compatible,
      issues: comparison.issues,
      groupOnlyAdditions: comparison.groupOnlyAdditions,
    },
  };

  assertSafeArtifactObject(report);

  return stableJson(report);
}
