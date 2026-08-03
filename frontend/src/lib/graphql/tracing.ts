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
