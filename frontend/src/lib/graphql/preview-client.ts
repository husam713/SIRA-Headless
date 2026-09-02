import "server-only";

import {
  getGraphQLTimeoutMs,
  getWordPressPreviewAuthorization,
  getWordPressSiteConfig,
} from "@/config/wordpress";
import {
  executeGraphQL,
  executeGraphQLTolerant,
  type GraphQLExecutionOptions,
  type TolerantGraphQLResult,
} from "@/lib/graphql/client";
import type {
  GraphQLOperation,
  GraphQLVariables,
} from "@/lib/graphql/operation";
import type { GraphQLTraceSink } from "@/lib/graphql/tracing";
import type { SiteKey } from "@/types/site";

export interface PreviewGraphQLOptions {
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
  readonly trace?: GraphQLTraceSink;
  readonly fetchImpl?: typeof fetch;
}

function previewRequest(
  siteKey: SiteKey,
  options: PreviewGraphQLOptions,
): {
  readonly site: ReturnType<typeof getWordPressSiteConfig>;
  readonly execution: GraphQLExecutionOptions;
} {
  const site = getWordPressSiteConfig(siteKey);
  const authorization = getWordPressPreviewAuthorization(siteKey);

  return {
    site,
    execution: {
      cache: "no-store",
      timeoutMs: options.timeoutMs ?? getGraphQLTimeoutMs(),
      authorization,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
      ...(options.trace === undefined ? {} : { trace: options.trace }),
      ...(options.fetchImpl === undefined
        ? {}
        : { fetchImpl: options.fetchImpl }),
    },
  };
}

export async function fetchPreviewGraphQL<
  TResult,
  TVariables extends GraphQLVariables,
>(
  siteKey: SiteKey,
  operation: GraphQLOperation<TResult, TVariables>,
  variables: TVariables,
  options: PreviewGraphQLOptions = {},
): Promise<TResult> {
  const { site, execution } = previewRequest(siteKey, options);

  return executeGraphQL(site, operation, variables, execution);
}

/**
 * Tolerant counterpart of `fetchPreviewGraphQL`, so draft previews degrade the
 * same way published rendering does instead of showing editors a blank page
 * whenever one field errors. Homepage-only.
 */
export async function fetchPreviewGraphQLTolerant<
  TResult,
  TVariables extends GraphQLVariables,
>(
  siteKey: SiteKey,
  operation: GraphQLOperation<TResult, TVariables>,
  variables: TVariables,
  options: PreviewGraphQLOptions = {},
): Promise<TolerantGraphQLResult<TResult>> {
  const { site, execution } = previewRequest(siteKey, options);

  return executeGraphQLTolerant(site, operation, variables, execution);
}
