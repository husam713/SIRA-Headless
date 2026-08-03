import {
  createHash,
} from "node:crypto";
import {
  mkdirSync,
  writeFileSync,
} from "node:fs";
import {
  resolve,
} from "node:path";
import {
  buildClientSchema,
  getIntrospectionQuery,
  getNamedType,
  isEnumType,
  isInterfaceType,
  isObjectType,
  lexicographicSortSchema,
  printSchema,
} from "graphql";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // The inventory can also receive environment variables from the shell.
  }
}

const SITE_ENDPOINT_KEYS = Object.freeze({
  group: "SIRA_WP_GROUP_GRAPHQL_URL",
  consulting: "SIRA_WP_CONSULTING_GRAPHQL_URL",
  healthcare: "SIRA_WP_HEALTHCARE_GRAPHQL_URL",
  lifestyle: "SIRA_WP_LIFESTYLE_GRAPHQL_URL",
  realestate: "SIRA_WP_REALESTATE_GRAPHQL_URL",
});

const REQUIRED_ROOT_FIELDS = Object.freeze([
  "siraBrand",
  "siraProjects",
]);

const REQUIRED_TYPES = Object.freeze([
  "Page",
  "ContentNode",
  "SiraBrand",
  "SiraProject",
  "SiraProjectDetails",
]);

const SIRA_TYPES_TO_INSPECT = Object.freeze([
  "Page",
  "ContentNode",
  "SiraBrand",
  "SiraBrandMedia",
  "SiraProject",
  "SiraProjectDetails",
  "SiraPersonDetails",
  "SiraDocumentDetails",
  "SiraCompany",
  "SiraInvestment",
  "SiraTestimonial",
  "SiraPartner",
]);

function assertEndpoint(rawValue, environmentKey) {
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    throw new Error(`Missing ${environmentKey}.`);
  }

  const url = new URL(rawValue);

  if (url.username !== "" || url.password !== "") {
    throw new Error(`${environmentKey} must not contain credentials.`);
  }

  if (url.search !== "" || url.hash !== "") {
    throw new Error(`${environmentKey} must not contain a query or fragment.`);
  }

  const local =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname.endsWith(".localhost");

  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) {
    throw new Error(`${environmentKey} must use HTTPS outside local development.`);
  }

  return url;
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function stableValue(value) {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableValue(child)]),
    );
  }

  return value;
}

function typeRef(type) {
  if (type === undefined || type === null) {
    return null;
  }

  const named = getNamedType(type);

  return {
    printable: String(type),
    namedType: named.name,
  };
}

function fieldMap(type) {
  if (!isObjectType(type) && !isInterfaceType(type)) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(type.getFields())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, field]) => [
        name,
        {
          type: typeRef(field.type),
          args: field.args.map((argument) => ({
            name: argument.name,
            type: typeRef(argument.type),
            defaultValue:
              argument.defaultValue === undefined
                ? null
                : argument.defaultValue,
          })),
          deprecated: field.deprecationReason ?? null,
        },
      ]),
  );
}

function inspectType(schema, typeName) {
  const type = schema.getType(typeName);

  if (type === undefined) {
    return null;
  }

  const result = {
    name: type.name,
    kind: type.constructor.name,
    fields: fieldMap(type),
  };

  if (isInterfaceType(type)) {
    Object.assign(result, {
      possibleTypes: schema
        .getPossibleTypes(type)
        .map((possibleType) => possibleType.name)
        .sort(),
    });
  }

  if (isEnumType(type)) {
    Object.assign(result, {
      enumValues: type
        .getValues()
        .map((value) => value.name)
        .sort(),
    });
  }

  if (isObjectType(type)) {
    Object.assign(result, {
      interfaces: type
        .getInterfaces()
        .map((implementedInterface) => implementedInterface.name)
        .sort(),
    });
  }

  return result;
}

function findMenuLocationEnums(schema) {
  return Object.values(schema.getTypeMap())
    .filter(
      (type) =>
        isEnumType(type) &&
        /menu.*location|location.*menu/i.test(type.name),
    )
    .map((type) => ({
      name: type.name,
      values: type
        .getValues()
        .map((value) => value.name)
        .sort(),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function findAcfTypes(schema) {
  const acfInterface = schema.getType("AcfFieldGroup");

  if (!isInterfaceType(acfInterface)) {
    return [];
  }

  return schema
    .getPossibleTypes(acfInterface)
    .map((type) => ({
      name: type.name,
      fields: Object.keys(type.getFields()).sort(),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function rootFieldSummary(schema) {
  const queryType = schema.getQueryType();

  if (queryType === undefined) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(queryType.getFields())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, field]) => [
        name,
        {
          type: typeRef(field.type),
          args: field.args.map((argument) => ({
            name: argument.name,
            type: typeRef(argument.type),
            defaultValue:
              argument.defaultValue === undefined
                ? null
                : argument.defaultValue,
          })),
        },
      ]),
  );
}

function selectExistingFields(type, candidates) {
  if (!isObjectType(type)) {
    return [];
  }

  const available = type.getFields();

  return candidates.filter((candidate) => available[candidate] !== undefined);
}

async function requestGraphQL(endpoint, operationName, query, variables = {}) {
  const headers = {
    accept: "application/graphql-response+json, application/json;q=0.9",
    "content-type": "application/json",
    "user-agent": "sira-step2c2a-inventory/1",
  };

  const authorization = process.env.SIRA_INVENTORY_AUTHORIZATION;

  if (typeof authorization === "string" && authorization.trim() !== "") {
    headers.authorization = authorization;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      operationName,
      query,
      variables,
    }),
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
  });

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new Error(
      `${operationName} on ${endpoint.hostname} did not return JSON (HTTP ${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `${operationName} on ${endpoint.hostname} returned HTTP ${response.status}.`,
    );
  }

  if (
    payload === null ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new Error(`${operationName} returned a malformed GraphQL envelope.`);
  }

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    const messages = payload.errors
      .map((error) =>
        error && typeof error.message === "string"
          ? error.message
          : "Unknown GraphQL error",
      )
      .join("; ");

    throw new Error(`${operationName} returned GraphQL errors: ${messages}`);
  }

  return payload.data ?? null;
}

async function probeBrand(endpoint, schema) {
  const queryType = schema.getQueryType();

  if (
    queryType === undefined ||
    queryType.getFields().siraBrand === undefined
  ) {
    return {
      supported: false,
      reason: "RootQuery.siraBrand is absent.",
    };
  }

  const brandType = schema.getType("SiraBrand");
  const fields = selectExistingFields(brandType, [
    "name",
    "key",
    "primaryColor",
    "secondaryColor",
    "accentColor",
    "paperColor",
    "inkColor",
  ]);

  const query = `
    query SiraInventoryBrand {
      siraBrand {
        ${fields.join("\n")}
      }
    }
  `;

  return {
    supported: true,
    data: await requestGraphQL(
      endpoint,
      "SiraInventoryBrand",
      query,
    ),
  };
}

async function probeFrontPage(endpoint, schema) {
  const queryType = schema.getQueryType();
  const pageType = schema.getType("Page");

  if (
    queryType === undefined ||
    queryType.getFields().pages === undefined ||
    !isObjectType(pageType)
  ) {
    return {
      supported: false,
      reason: "RootQuery.pages or Page type is absent.",
    };
  }

  const fields = selectExistingFields(pageType, [
    "databaseId",
    "title",
    "slug",
    "uri",
    "status",
    "isFrontPage",
  ]);

  const query = `
    query SiraInventoryFrontPages {
      pages(first: 100) {
        nodes {
          ${fields.join("\n")}
        }
      }
    }
  `;

  const data = await requestGraphQL(
    endpoint,
    "SiraInventoryFrontPages",
    query,
  );

  const nodes = data?.pages?.nodes ?? [];
  const frontPages = fields.includes("isFrontPage")
    ? nodes.filter((node) => node?.isFrontPage === true)
    : [];

  return {
    supported: true,
    fields,
    frontPages,
    totalReturned: nodes.length,
  };
}

async function probeMenus(endpoint, schema) {
  const queryType = schema.getQueryType();

  if (
    queryType === undefined ||
    queryType.getFields().menus === undefined
  ) {
    return {
      supported: false,
      reason: "RootQuery.menus is absent.",
    };
  }

  const menuType = schema.getType("Menu");
  const fields = selectExistingFields(menuType, [
    "databaseId",
    "name",
    "slug",
    "locations",
    "count",
  ]);

  if (fields.length === 0) {
    return {
      supported: false,
      reason: "Menu type has no recognized inventory fields.",
    };
  }

  const query = `
    query SiraInventoryMenus {
      menus(first: 100) {
        nodes {
          ${fields.join("\n")}
        }
      }
    }
  `;

  return {
    supported: true,
    fields,
    data: await requestGraphQL(
      endpoint,
      "SiraInventoryMenus",
      query,
    ),
  };
}

async function probeBusinessUnits(endpoint, schema) {
  const queryType = schema.getQueryType();

  if (queryType === undefined) {
    return {
      supported: false,
      reason: "Root query type is absent.",
    };
  }

  const candidate = [
    "siraBusinessUnits",
    "businessUnits",
  ].find((name) => queryType.getFields()[name] !== undefined);

  if (candidate === undefined) {
    return {
      supported: false,
      reason: "No Business Unit root connection was found.",
    };
  }

  const rootField = queryType.getFields()[candidate];
  const connectionNamedType = getNamedType(rootField.type);
  const connectionType = schema.getType(connectionNamedType.name);

  if (!isObjectType(connectionType)) {
    return {
      supported: false,
      reason: `${candidate} does not return an object connection.`,
    };
  }

  const nodesField = connectionType.getFields().nodes;
  const nodeNamedType =
    nodesField === undefined ? null : getNamedType(nodesField.type);
  const nodeType =
    nodeNamedType === null ? null : schema.getType(nodeNamedType.name);

  const fields = selectExistingFields(nodeType, [
    "databaseId",
    "name",
    "slug",
    "count",
  ]);

  const firstArgument = rootField.args.find(
    (argument) => argument.name === "first",
  );

  const invocation =
    firstArgument === undefined ? candidate : `${candidate}(first: 100)`;

  const query = `
    query SiraInventoryBusinessUnits {
      ${invocation} {
        nodes {
          ${fields.join("\n")}
        }
      }
    }
  `;

  return {
    supported: true,
    rootField: candidate,
    fields,
    data: await requestGraphQL(
      endpoint,
      "SiraInventoryBusinessUnits",
      query,
    ),
  };
}

async function inventorySite(siteKey, environmentKey, outputRoot) {
  const endpoint = assertEndpoint(
    process.env[environmentKey],
    environmentKey,
  );

  const introspectionData = await requestGraphQL(
    endpoint,
    "SiraInventoryIntrospection",
    getIntrospectionQuery({
      descriptions: true,
      directiveIsRepeatable: true,
      inputValueDeprecation: true,
      schemaDescription: true,
      specifiedByUrl: true,
    }),
  );

  const schema = lexicographicSortSchema(
    buildClientSchema(introspectionData),
  );
  const schemaText = `${printSchema(schema).trim()}\n`;
  const schemaSha256 = hash(schemaText);
  const rootFields = rootFieldSummary(schema);

  const summary = {
    siteKey,
    endpointHostname: endpoint.hostname,
    endpointPathname: endpoint.pathname,
    schemaSha256,
    requiredRootFields: Object.fromEntries(
      REQUIRED_ROOT_FIELDS.map((fieldName) => [
        fieldName,
        rootFields[fieldName] !== undefined,
      ]),
    ),
    requiredTypes: Object.fromEntries(
      REQUIRED_TYPES.map((typeName) => [
        typeName,
        schema.getType(typeName) !== undefined,
      ]),
    ),
    capabilityFields: {
      contentNodes: rootFields.contentNodes ?? null,
      menus: rootFields.menus ?? null,
      menuItems: rootFields.menuItems ?? null,
      pages: rootFields.pages ?? null,
      nodeByUri: rootFields.nodeByUri ?? null,
      siraBusinessUnits:
        rootFields.siraBusinessUnits ??
        rootFields.businessUnits ??
        null,
    },
    rootFields,
    inspectedTypes: Object.fromEntries(
      SIRA_TYPES_TO_INSPECT.map((typeName) => [
        typeName,
        inspectType(schema, typeName),
      ]),
    ),
    acfTypes: findAcfTypes(schema),
    menuLocationEnums: findMenuLocationEnums(schema),
  };

  const probes = {
    brand: await probeBrand(endpoint, schema),
    frontPage: await probeFrontPage(endpoint, schema),
    menus: await probeMenus(endpoint, schema),
    businessUnits: await probeBusinessUnits(endpoint, schema),
  };

  const siteDirectory = resolve(outputRoot, siteKey);
  mkdirSync(siteDirectory, { recursive: true });

  writeFileSync(
    resolve(siteDirectory, "schema.graphql"),
    schemaText,
    "utf8",
  );
  writeFileSync(
    resolve(siteDirectory, "schema-summary.json"),
    `${JSON.stringify(stableValue(summary), null, 2)}\n`,
    "utf8",
  );
  writeFileSync(
    resolve(siteDirectory, "public-probes.json"),
    `${JSON.stringify(stableValue(probes), null, 2)}\n`,
    "utf8",
  );

  return {
    siteKey,
    endpointHostname: endpoint.hostname,
    schemaSha256,
    brandKey:
      probes.brand.supported === true
        ? probes.brand.data?.siraBrand?.key ?? null
        : null,
    frontPageCount:
      probes.frontPage.supported === true
        ? probes.frontPage.frontPages.length
        : null,
    menuCount:
      probes.menus.supported === true
        ? probes.menus.data?.menus?.nodes?.length ?? null
        : null,
    businessUnitCount:
      probes.businessUnits.supported === true
        ? Object.values(probes.businessUnits.data ?? {})[0]?.nodes?.length ??
          null
        : null,
    hasContentNodes: rootFields.contentNodes !== undefined,
    hasMenus: rootFields.menus !== undefined,
    acfTypeNames: summary.acfTypes.map((type) => type.name),
    requiredRootFields: summary.requiredRootFields,
    requiredTypes: summary.requiredTypes,
  };
}

const outputRoot = resolve(
  process.env.SIRA_INVENTORY_OUTPUT_DIR ??
    "output/graphql",
);
mkdirSync(outputRoot, { recursive: true });

const results = [];

for (const [siteKey, environmentKey] of Object.entries(
  SITE_ENDPOINT_KEYS,
)) {
  results.push(
    await inventorySite(
      siteKey,
      environmentKey,
      outputRoot,
    ),
  );
}

const schemaHashes = new Set(
  results.map((result) => result.schemaSha256),
);

const comparison = {
  generatedAt: new Date().toISOString(),
  expectedSiteKeys: Object.keys(SITE_ENDPOINT_KEYS),
  schemaHashesEqual: schemaHashes.size === 1,
  schemaHashes: Object.fromEntries(
    results.map((result) => [
      result.siteKey,
      result.schemaSha256,
    ]),
  ),
  expectedBrandKeysMatch: Object.fromEntries(
    results.map((result) => [
      result.siteKey,
      result.brandKey === result.siteKey,
    ]),
  ),
  exactlyOneFrontPage: Object.fromEntries(
    results.map((result) => [
      result.siteKey,
      result.frontPageCount === 1,
    ]),
  ),
  results,
};

writeFileSync(
  resolve(outputRoot, "network-comparison.json"),
  `${JSON.stringify(stableValue(comparison), null, 2)}\n`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      outputRoot,
      schemaHashesEqual: comparison.schemaHashesEqual,
      expectedBrandKeysMatch:
        !Object.values(comparison.expectedBrandKeysMatch).includes(false),
      exactlyOneFrontPage:
        !Object.values(comparison.exactlyOneFrontPage).includes(false),
    },
    null,
    2,
  ),
);

if (!comparison.schemaHashesEqual) {
  process.exitCode = 2;
}
