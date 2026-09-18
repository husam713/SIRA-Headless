import "server-only";

import { cache } from "react";
import { fetchPublishedGraphQL, SiraGraphQLError } from "@/lib/graphql";
import {
  normalizeProjectLocator,
  normalizeProjectSingle,
} from "@/lib/projects/normalize-project-single";
import type { ProjectSingleResolution } from "@/lib/projects/project-single-types";
import {
  SIRA_PROJECT_SINGLE_QUERY,
  type SiraProjectSingleQueryData,
  type SiraProjectSingleQueryVariables,
} from "@/queries/project-single";
import { entityCacheTag } from "@/lib/cache/tags";
import { recordUrisForLocale } from "@/lib/i18n/record-href";
import type { LocaleCode, SiteDefinition, SiteKey } from "@/types/site";

export const PROJECT_SINGLE_CACHE_TAGS = Object.freeze([
  "post-type:sira_project",
]);

/**
 * The tags for one project's page: the type-wide tag plus the project's own
 * `slug:sira_project:<slug>`, which is exactly what the WordPress revalidation
 * webhook emits when that project changes. The id is not known before the
 * response, the slug is, so the slug is the entity key.
 */
export function projectSingleCacheTags(uri: string): readonly string[] {
  const entity = entityCacheTag("sira_project", uri.split("/").filter(Boolean).pop());
  return entity === null
    ? PROJECT_SINGLE_CACHE_TAGS
    : Object.freeze([...PROJECT_SINGLE_CACHE_TAGS, entity]);
}

export type ProjectSingleQueryExecutor = (
  variables: SiraProjectSingleQueryVariables,
) => Promise<SiraProjectSingleQueryData>;

function logProjectSingleFailure(siteKey: SiteKey, error: unknown): void {
  if (error instanceof SiraGraphQLError) {
    console.warn("SIRA project single query failed.", {
      siteKey,
      errorName: error.name,
      operationName: error.operationName,
      requestId: error.requestId,
    });
    return;
  }

  console.warn("SIRA project single query failed.", {
    siteKey,
    errorName:
      error instanceof Error ? error.name : "UnknownProjectSingleError",
  });
}

export async function resolveProjectSingle(
  siteKey: SiteKey,
  uri: string,
  execute: ProjectSingleQueryExecutor,
): Promise<ProjectSingleResolution> {
  const normalizedUri = normalizeProjectLocator(uri);

  if (normalizedUri === null) {
    return Object.freeze({
      status: "invalid",
      siteKey,
      reason: "invalid-locator",
      diagnostics: Object.freeze([]),
    });
  }

  try {
    return normalizeProjectSingle(
      siteKey,
      normalizedUri,
      await execute(Object.freeze({ uri: normalizedUri })),
    );
  } catch (error) {
    logProjectSingleFailure(siteKey, error);

    return Object.freeze({
      status: "remote-error",
      siteKey,
      errorName:
        error instanceof Error ? error.name : "UnknownProjectSingleError",
    });
  }
}

async function resolvePublishedProjectSingle(
  siteKey: SiteKey,
  uri: string,
): Promise<ProjectSingleResolution> {
  return resolveProjectSingle(siteKey, uri, async (variables) =>
    await fetchPublishedGraphQL(
      siteKey,
      SIRA_PROJECT_SINGLE_QUERY,
      variables,
      { tags: projectSingleCacheTags(uri) },
    ),
  );
}

export const getProjectSingle = cache(resolvePublishedProjectSingle);

/**
 * One project in the requested language, falling back to the default-locale
 * record when it has no translation (ADR-034). The locale's copy lives at the
 * same slug under a locale prefix (`/projects/ar-<slug>/`), so at most two
 * lookups are made and the first hit wins.
 */
export async function getProjectSingleForLocale(
  site: SiteDefinition,
  locale: LocaleCode,
  uri: string,
): Promise<ProjectSingleResolution> {
  let last: ProjectSingleResolution | null = null;

  for (const candidate of recordUrisForLocale(site, locale, uri)) {
    last = await getProjectSingle(site.key, candidate);
    if (last.status !== "not-found") return last;
  }

  return last ?? Object.freeze({ status: "not-found", siteKey: site.key });
}
