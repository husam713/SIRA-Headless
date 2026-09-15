/**
 * Types for the ADR-030 launch gate.
 *
 * The tool itself is plain `.mjs`, because it runs under bare Node on a
 * developer machine and on the origin without a build step. This file exists so
 * the tests that cover its logic get real types instead of a suppression — the
 * gate is the last check before a public launch, and `any` is the wrong shape
 * for the one thing standing between seeded content and production.
 */

/** One tenant's answer to the probe. `null` means the count was unreadable. */
export interface TenantSeedRow {
  readonly name: string;
  readonly blogPublic: string;
  readonly seededPosts: number | null;
  readonly seededTerms: number | null;
}

export interface LaunchGateVerdict {
  /** Reasons the launch is blocked. Empty means nothing is blocking. */
  readonly failures: readonly string[];
  /** Tenants whose readiness could not be established either way. */
  readonly indeterminate: readonly string[];
}

export function buildProbeScript(wpRoot?: string, marker?: string): string;
export function parseTenantRows(raw: string): TenantSeedRow[];
export function evaluateTenants(rows: readonly TenantSeedRow[]): LaunchGateVerdict;
export function formatRow(row: TenantSeedRow): string;
