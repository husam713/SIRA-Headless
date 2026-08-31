import "server-only";

import { draftMode } from "next/headers";
import { cache } from "react";
import { normalizeHomepage } from "@/lib/homepage/normalize-homepage";
import type { HomepageResolution } from "@/lib/homepage/types";
import {
  fetchPreviewGraphQL,
  fetchPublishedGraphQL,
  SiraGraphQLError,
} from "@/lib/graphql";
import {
  SIRA_HOMEPAGE_QUERY,
  type SiraHomepageQueryData,
} from "@/queries/homepage";
import type { SiteKey } from "@/types/site";

export type HomepageQueryExecutor = () => Promise<SiraHomepageQueryData>;

function logHomepageFailure(siteKey: SiteKey, error: unknown): void {
  if (error instanceof SiraGraphQLError) {
    console.warn("SIRA homepage query failed.", {
      siteKey,
      errorName: error.name,
      operationName: error.operationName,
      requestId: error.requestId,
    });

    return;
  }

  console.warn("SIRA homepage query failed.", {
    siteKey,
    errorName:
      error instanceof Error ? error.name : "UnknownHomepageResolutionError",
  });
}

export async function resolveHomepage(
  siteKey: SiteKey,
  execute: HomepageQueryExecutor,
): Promise<HomepageResolution> {
  try {
    return normalizeHomepage(siteKey, await execute());
  } catch (error) {
    logHomepageFailure(siteKey, error);

    return Object.freeze({
      status: "remote-error",
      siteKey,
      errorName:
        error instanceof Error
          ? error.name
          : "UnknownHomepageResolutionError",
    });
  }
}

async function resolvePublishedHomepage(
  siteKey: SiteKey,
): Promise<HomepageResolution> {
  return resolveHomepage(
    siteKey,
    async () =>
      await fetchPublishedGraphQL(
        siteKey,
        SIRA_HOMEPAGE_QUERY,
        { asPreview: false },
        { tags: ["homepage"] },
      ),
  );
}

export const getHomepage = cache(resolvePublishedHomepage);

async function resolvePreviewHomepage(
  siteKey: SiteKey,
): Promise<HomepageResolution> {
  return resolveHomepage(
    siteKey,
    async () =>
      await fetchPreviewGraphQL(
        siteKey,
        SIRA_HOMEPAGE_QUERY,
        { asPreview: true },
      ),
  );
}

// Request-cached for the same reason as getHomepage above: the layout and the
// page each resolve the homepage, and without this the preview path issues two
// GraphQL round-trips per draft render. React cache() is per-request, so draft
// content is still never shared between requests.
export const getPreviewHomepage = cache(resolvePreviewHomepage);

export async function getHomepageForRequest(
  siteKey: SiteKey,
): Promise<HomepageResolution> {
  const draft = await draftMode();

  return draft.isEnabled
    ? getPreviewHomepage(siteKey)
    : getHomepage(siteKey);
}
