import "server-only";

import { cache } from "react";
import { getEditorialBusinessUnit } from "@/lib/editorial/business-unit";
import { fetchPublishedGraphQL, SiraGraphQLError } from "@/lib/graphql";
import { normalizeEditorialFeed } from "@/lib/editorial/normalize-editorial-feed";
import type { EditorialFeedResolution } from "@/lib/editorial/types";
import {
  SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY,
  SIRA_EDITORIAL_FEED_QUERY,
  type SiraBusinessUnitEditorialFeedQueryData,
  type SiraBusinessUnitEditorialFeedQueryVariables,
  type SiraEditorialFeedQueryData,
  type SiraEditorialFeedQueryVariables,
} from "@/queries/editorial-feed";
import type { SiteKey } from "@/types/site";

const MAX_EDITORIAL_PAGE_SIZE = 50;
const EDITORIAL_CACHE_TAGS = Object.freeze([
  "archive:sira_news",
  "archive:sira_insight",
  "archive:sira_article",
  "archive:sira_press_release",
]);
const BUSINESS_UNIT_EDITORIAL_CACHE_TAGS = Object.freeze([
  ...EDITORIAL_CACHE_TAGS,
  "taxonomy:sira_business_unit",
]);

export type EditorialFeedQueryExecutor = (
  variables: SiraEditorialFeedQueryVariables,
) => Promise<SiraEditorialFeedQueryData>;
export type BusinessUnitEditorialFeedQueryExecutor = (
  variables: SiraBusinessUnitEditorialFeedQueryVariables,
) => Promise<SiraBusinessUnitEditorialFeedQueryData>;

export interface SiteEditorialFeedExecutors {
  readonly unfiltered: EditorialFeedQueryExecutor;
  readonly businessUnit: BusinessUnitEditorialFeedQueryExecutor;
}

function normalizeVariables(
  variables: SiraEditorialFeedQueryVariables,
): SiraEditorialFeedQueryVariables | null {
  if (
    !Number.isSafeInteger(variables.first) ||
    variables.first < 1 ||
    variables.first > MAX_EDITORIAL_PAGE_SIZE
  ) {
    return null;
  }

  const after = variables.after ?? null;

  if (
    after !== null &&
    (typeof after !== "string" ||
      after.trim() === "" ||
      after.length > 4096 ||
      /[\u0000-\u001f\u007f]/u.test(after))
  ) {
    return null;
  }

  return Object.freeze({ first: variables.first, after });
}

function logEditorialFailure(siteKey: SiteKey, error: unknown): void {
  if (error instanceof SiraGraphQLError) {
    console.warn("SIRA editorial feed query failed.", {
      siteKey,
      errorName: error.name,
      operationName: error.operationName,
      requestId: error.requestId,
    });
    return;
  }

  console.warn("SIRA editorial feed query failed.", {
    siteKey,
    errorName:
      error instanceof Error ? error.name : "UnknownEditorialFeedError",
  });
}

export async function resolveEditorialFeed(
  siteKey: SiteKey,
  variables: SiraEditorialFeedQueryVariables,
  execute: EditorialFeedQueryExecutor,
): Promise<EditorialFeedResolution> {
  const normalizedVariables = normalizeVariables(variables);

  if (normalizedVariables === null) {
    return Object.freeze({
      status: "invalid",
      siteKey,
      reason: "invalid-pagination-request",
      diagnostics: Object.freeze([]),
    });
  }

  try {
    return normalizeEditorialFeed(
      siteKey,
      await execute(normalizedVariables),
    );
  } catch (error) {
    logEditorialFailure(siteKey, error);

    return Object.freeze({
      status: "remote-error",
      siteKey,
      errorName:
        error instanceof Error ? error.name : "UnknownEditorialFeedError",
    });
  }
}

export async function resolveSiteEditorialFeed(
  siteKey: SiteKey,
  variables: SiraEditorialFeedQueryVariables,
  execute: SiteEditorialFeedExecutors,
): Promise<EditorialFeedResolution> {
  const normalizedVariables = normalizeVariables(variables);

  if (normalizedVariables === null) {
    return Object.freeze({
      status: "invalid",
      siteKey,
      reason: "invalid-pagination-request",
      diagnostics: Object.freeze([]),
    });
  }

  const businessUnit = getEditorialBusinessUnit(siteKey);

  if (businessUnit === null) {
    return resolveEditorialFeed(
      siteKey,
      normalizedVariables,
      execute.unfiltered,
    );
  }

  try {
    const data = await execute.businessUnit({
      ...normalizedVariables,
      businessUnit,
    });

    if (data.siraBusinessUnit === null) {
      return Object.freeze({
        status: "empty",
        siteKey,
        pageInfo: Object.freeze({
          hasNextPage: false,
          endCursor: null,
        }),
      });
    }

    return normalizeEditorialFeed(siteKey, {
      contentNodes: data.siraBusinessUnit.contentNodes,
    });
  } catch (error) {
    logEditorialFailure(siteKey, error);

    return Object.freeze({
      status: "remote-error",
      siteKey,
      errorName:
        error instanceof Error ? error.name : "UnknownEditorialFeedError",
    });
  }
}

async function resolvePublishedEditorialFeed(
  siteKey: SiteKey,
  first: number,
  after: string | null = null,
): Promise<EditorialFeedResolution> {
  return resolveSiteEditorialFeed(
    siteKey,
    { first, after },
    {
      unfiltered: async (variables) =>
        await fetchPublishedGraphQL(
          siteKey,
          SIRA_EDITORIAL_FEED_QUERY,
          variables,
          { tags: EDITORIAL_CACHE_TAGS },
        ),
      businessUnit: async (variables) =>
        await fetchPublishedGraphQL(
          siteKey,
          SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY,
          variables,
          { tags: BUSINESS_UNIT_EDITORIAL_CACHE_TAGS },
        ),
    },
  );
}

export const getEditorialFeed = cache(resolvePublishedEditorialFeed);
