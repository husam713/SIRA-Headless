import "server-only";

import { draftMode } from "next/headers";
import { cache } from "react";
import { normalizeHomepage } from "@/lib/homepage/normalize-homepage";
import type { HomepageResolution } from "@/lib/homepage/types";
import {
  fetchPreviewGraphQLTolerant,
  fetchPublishedGraphQLTolerant,
  SiraGraphQLError,
  type TolerantGraphQLResult,
} from "@/lib/graphql";
import {
  SIRA_HOMEPAGE_QUERY,
  type SiraHomepageQueryData,
} from "@/queries/homepage";
import type { SiteKey } from "@/types/site";

export type HomepageQueryExecutor = () => Promise<
  TolerantGraphQLResult<SiraHomepageQueryData>
>;

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

/**
 * Server-side only. Records which homepage fields the endpoint failed to
 * resolve, with enough context to correlate the failure against WordPress:
 * operation name, site key, request id, the sanitized error path, and the
 * sanitized extension code.
 *
 * The GraphQL message is deliberately excluded, along with the endpoint and
 * the query text: those can carry WordPress internals, and this line is not
 * worth the leak. The browser sees only the section-level diagnostics attached
 * to the homepage itself.
 */
function logToleratedFieldErrors(
  siteKey: SiteKey,
  result: TolerantGraphQLResult<SiraHomepageQueryData>,
): void {
  if (result.errors.length === 0) return;

  console.warn("SIRA homepage query returned partial data.", {
    siteKey,
    operationName: result.operationName,
    requestId: result.requestId,
    failedFields: result.errors.map((error) => ({
      path: error.path,
      code: error.code,
    })),
  });
}

export async function resolveHomepage(
  siteKey: SiteKey,
  execute: HomepageQueryExecutor,
): Promise<HomepageResolution> {
  try {
    const result = await execute();

    logToleratedFieldErrors(siteKey, result);

    return normalizeHomepage(siteKey, result.data, result.errors);
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
      await fetchPublishedGraphQLTolerant(
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
      await fetchPreviewGraphQLTolerant(
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
