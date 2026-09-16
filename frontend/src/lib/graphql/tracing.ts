import type { SiteKey } from "@/types/site";

export type GraphQLTraceOutcome =
  | "success"
  | "graphql-error"
  | "http-error"
  | "network-error"
  | "protocol-error"
  | "timeout";

export interface GraphQLTraceEvent {
  readonly requestId: string;
  readonly siteKey: SiteKey;
  readonly endpointHostname: string;
  readonly operationName: string;
  readonly durationMs: number;
  readonly outcome: GraphQLTraceOutcome;
  readonly httpStatus: number | null;
}

export type GraphQLTraceSink = (event: GraphQLTraceEvent) => void;

export const discardGraphQLTrace: GraphQLTraceSink = () => undefined;

/**
 * One structured line per GraphQL call, in the shape Cloud Logging parses
 * (`severity` + a flat JSON payload). A call served from the Data Cache
 * reports single-digit `durationMs`; a network call reports hundreds, so the
 * cache hit rate can be read straight from the logs:
 *
 *   jsonPayload.event="graphql" | count by outcome, siteKey, operationName
 *
 * Nothing sensitive is carried: no endpoint path, no query text, no GraphQL
 * message. `endpointHostname` is the sanitized host only.
 *
 * Emitted only when `SIRA_GRAPHQL_TRACE` is `on`, or in production when it is
 * not explicitly `off`, so unit tests and local development stay quiet.
 */
export const structuredGraphQLTrace: GraphQLTraceSink = (event) => {
  console.log(
    JSON.stringify({
      severity: event.outcome === "success" ? "INFO" : "WARNING",
      event: "graphql",
      ...event,
    }),
  );
};

export function isGraphQLTraceEnabled(
  environment: NodeJS.ProcessEnv = process.env,
): boolean {
  const flag = environment["SIRA_GRAPHQL_TRACE"];
  if (flag === "on") return true;
  if (flag === "off") return false;
  return environment["NODE_ENV"] === "production";
}

export function defaultGraphQLTrace(): GraphQLTraceSink {
  return isGraphQLTraceEnabled() ? structuredGraphQLTrace : discardGraphQLTrace;
}
