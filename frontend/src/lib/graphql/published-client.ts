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
import { executeGraphQL } from "@/lib/graphql/client";
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

export async function fetchPublishedGraphQL<
  TResult,
  TVariables extends GraphQLVariables,
>(
  siteKey: SiteKey,
  operation: GraphQLOperation<TResult, TVariables>,
  variables: TVariables,
  options: PublishedGraphQLOptions = {},
): Promise<TResult> {
  const site = getWordPressSiteConfig(siteKey);
  const tags = normalizeCacheTags([
    ...siteCacheTags(site.blogId, site.siteKey),
    ...(options.tags ?? []),
  ]);

  return executeGraphQL(site, operation, variables, {
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
  });
}
