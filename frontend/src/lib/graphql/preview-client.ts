import "server-only";

import {
  getGraphQLTimeoutMs,
  getWordPressSiteConfig,
} from "@/config/wordpress";
import { executeGraphQL } from "@/lib/graphql/client";
import type {
  GraphQLOperation,
  GraphQLVariables,
} from "@/lib/graphql/operation";
import type { GraphQLTraceSink } from "@/lib/graphql/tracing";
import type { SiteKey } from "@/types/site";

export interface PreviewGraphQLOptions {
  readonly bearerToken: string;
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
  readonly trace?: GraphQLTraceSink;
  readonly fetchImpl?: typeof fetch;
}

export async function fetchPreviewGraphQL<
  TResult,
  TVariables extends GraphQLVariables,
>(
  siteKey: SiteKey,
  operation: GraphQLOperation<TResult, TVariables>,
  variables: TVariables,
  options: PreviewGraphQLOptions,
): Promise<TResult> {
  const token = options.bearerToken.trim();

  if (token.length < 20 || /[\r\n]/.test(token)) {
    throw new TypeError("Invalid preview bearer token.");
  }

  const site = getWordPressSiteConfig(siteKey);

  return executeGraphQL(site, operation, variables, {
    cache: "no-store",
    timeoutMs: options.timeoutMs ?? getGraphQLTimeoutMs(),
    authorization: `Bearer ${token}`,
    ...(options.signal === undefined ? {} : { signal: options.signal }),
    ...(options.trace === undefined ? {} : { trace: options.trace }),
    ...(options.fetchImpl === undefined
      ? {}
      : { fetchImpl: options.fetchImpl }),
  });
}
