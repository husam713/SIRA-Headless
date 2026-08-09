import type { GraphQLSchema } from "graphql";

export interface SchemaIssue {
  readonly code: string;
  readonly coordinate: string;
  readonly expected: unknown;
  readonly actual: unknown;
}

export interface SchemaCompatibilityResult {
  readonly compatible: boolean;
  readonly issues: readonly SchemaIssue[];
  readonly groupOnlyAdditions: Readonly<Record<string, readonly unknown[]>>;
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
