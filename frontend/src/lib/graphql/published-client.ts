import "server-only";

import {
  getGraphQLRevalidateSeconds,
  getGraphQLTimeoutMs,
  getWordPressSiteConfig,
} from "@/config/wordpress";
import {
  normalizeCacheTags,
  siteCacheTags,
} from "@/lib/cache/tags";
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

export interface PublishedGraphQLOptions {
  readonly tags?: readonly string[];
  readonly revalidate?: number | false;
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
  readonly trace?: GraphQLTraceSink;
  readonly fetchImpl?: typeof fetch;
}

function publishedRequest(
  siteKey: SiteKey,
  options: PublishedGraphQLOptions,
): {
  readonly site: ReturnType<typeof getWordPressSiteConfig>;
  readonly execution: GraphQLExecutionOptions;
} {
  const site = getWordPressSiteConfig(siteKey);
  const tags = normalizeCacheTags([
    ...siteCacheTags(site.blogId, site.siteKey),
    ...(options.tags ?? []),
  ]);

  return {
    site,
    execution: {
      cache: "force-cache",
      timeoutMs: options.timeoutMs ?? getGraphQLTimeoutMs(),
      revalidate:
        options.revalidate ?? getGraphQLRevalidateSeconds(),
      tags,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
      ...(options.trace === undefined ? {} : { trace: options.trace }),
      ...(options.fetchImpl === undefined
        ? {}
        : { fetchImpl: options.fetchImpl }),
    },
  };
}

export async function fetchPublishedGraphQL<
  TResult,
  TVariables extends GraphQLVariables,
>(
  siteKey: SiteKey,
  operation: GraphQLOperation<TResult, TVariables>,
  variables: TVariables,
  options: PublishedGraphQLOptions = {},
): Promise<TResult> {
  const { site, execution } = publishedRequest(siteKey, options);

  return executeGraphQL(site, operation, variables, execution);
}

/**
 * Tolerant counterpart of `fetchPublishedGraphQL`. Identical request shape;
 * the only difference is that non-null data accompanied by GraphQL errors is
 * returned rather than thrown. Homepage-only.
 */
export async function fetchPublishedGraphQLTolerant<
  TResult,
  TVariables extends GraphQLVariables,
>(
  siteKey: SiteKey,
  operation: GraphQLOperation<TResult, TVariables>,
  variables: TVariables,
  options: PublishedGraphQLOptions = {},
): Promise<TolerantGraphQLResult<TResult>> {
  const { site, execution } = publishedRequest(siteKey, options);

  return executeGraphQLTolerant(site, operation, variables, execution);
}
