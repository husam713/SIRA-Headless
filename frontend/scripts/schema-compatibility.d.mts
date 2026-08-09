import type { GraphQLSchema } from "graphql";

export interface SchemaIssue {
  readonly code: string;
  readonly coordinate: string;
  readonly expected: unknown;
  readonly actual: unknown;
}

export interface SchemaTypeAddition {
  readonly name: string;
  readonly kind: string;
}

export interface SchemaFieldAddition {
  readonly coordinate: string;
  readonly type: string;
}

export interface SchemaArgumentAddition {
  readonly coordinate: string;
  readonly type: string;
  readonly requiredWithoutDefault: boolean;
}

export interface SchemaInputFieldAddition {
  readonly coordinate: string;
  readonly type: string;
  readonly requiredWithoutDefault: boolean;
}

export interface SchemaEnumValueAddition {
  readonly enum: string;
  readonly value: string;
}

export interface SchemaUnionMemberAddition {
  readonly union: string;
  readonly member: string;
}

export interface SchemaInterfaceAddition {
  readonly type: string;
  readonly interface: string;
}

export interface SchemaDirectiveLocationAddition {
  readonly directive: string;
  readonly location: string;
}

export interface SchemaGroupOnlyAdditions {
  readonly types: readonly SchemaTypeAddition[];
  readonly fields: readonly SchemaFieldAddition[];
  readonly arguments: readonly SchemaArgumentAddition[];
  readonly inputFields: readonly SchemaInputFieldAddition[];
  readonly enumValues: readonly SchemaEnumValueAddition[];
  readonly unionMembers: readonly SchemaUnionMemberAddition[];
  readonly interfaces: readonly SchemaInterfaceAddition[];
  readonly directives: readonly string[];
  readonly directiveLocations: readonly SchemaDirectiveLocationAddition[];
}

export interface SchemaCompatibilityResult {
  readonly compatible: boolean;
  readonly issues: readonly SchemaIssue[];
  readonly groupOnlyAdditions: SchemaGroupOnlyAdditions;
}

export const BRANCH_SITE_KEYS: readonly string[];
export const CANONICAL_BRANCH_SITE_KEY: string;
export const GROUP_SITE_KEY: string;
export const SCHEMA_POLICY: string;
export const SCHEMA_SOURCE: string;
export const REQUIRED_ROOT_FIELDS: readonly string[];
export const REQUIRED_TYPES: readonly string[];

export function compareCanonicalToGroup(
  canonicalSchema: GraphQLSchema,
  groupSchema: GraphQLSchema,
): SchemaCompatibilityResult;

export function schemaHash(schemaText: string): string;

export function assertExactBranchSchemas<
  T extends {
    readonly siteKey: string;
    readonly sha256: string;
  },
>(results: readonly T[]): T;

export function assertRequiredContract(
  schema: GraphQLSchema,
  siteKey: string,
): void;

export function assertSafeArtifactObject(
  value: unknown,
  path?: string,
): void;

export function stableJson<T>(value: T): T;

export function createSchemaMetadata(
  results: readonly {
    readonly siteKey: string;
    readonly hostname: string;
    readonly sha256: string;
    readonly role: string;
  }[],
  fetchedAt: string,
): unknown;
