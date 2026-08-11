import "server-only";

import { cache } from "react";
import { fetchPublishedGraphQL, SiraGraphQLError } from "@/lib/graphql";
import { normalizeNavigation } from "@/lib/navigation/normalize-navigation";
import type { NavigationResolution } from "@/lib/navigation/types";
import {
  SIRA_NAVIGATION_QUERY,
  type SiraNavigationQueryData,
} from "@/queries/navigation";
import type { SiteKey } from "@/types/site";

export type NavigationQueryExecutor = () => Promise<SiraNavigationQueryData>;

function logNavigationFailure(siteKey: SiteKey, error: unknown): void {
  if (error instanceof SiraGraphQLError) {
    console.warn("SIRA navigation query failed.", {
      siteKey,
      errorName: error.name,
      operationName: error.operationName,
      requestId: error.requestId,
    });
    return;
  }

  console.warn("SIRA navigation query failed.", {
    siteKey,
    errorName:
      error instanceof Error ? error.name : "UnknownNavigationResolutionError",
  });
}

export async function resolveNavigation(
  siteKey: SiteKey,
  execute: NavigationQueryExecutor,
): Promise<NavigationResolution> {
  try {
    return normalizeNavigation(siteKey, await execute());
  } catch (error) {
    logNavigationFailure(siteKey, error);

    return Object.freeze({
      status: "remote-error",
      siteKey,
      errorName:
        error instanceof Error
          ? error.name
          : "UnknownNavigationResolutionError",
    });
  }
}

async function resolvePublishedNavigation(
  siteKey: SiteKey,
): Promise<NavigationResolution> {
  return resolveNavigation(
    siteKey,
    async () =>
      await fetchPublishedGraphQL(
        siteKey,
        SIRA_NAVIGATION_QUERY,
        {},
        { tags: ["navigation"] },
      ),
  );
}

export const getNavigation = cache(resolvePublishedNavigation);
