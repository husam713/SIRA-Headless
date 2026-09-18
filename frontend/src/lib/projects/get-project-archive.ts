import "server-only";

import { cache } from "react";
import { fetchPublishedGraphQL, SiraGraphQLError } from "@/lib/graphql";
import { normalizeProjectArchive } from "@/lib/projects/normalize-project-archive";
import type { ProjectArchiveResolution } from "@/lib/projects/types";
import {
  SIRA_PROJECTS_QUERY,
  type SiraProjectsQueryData,
  type SiraProjectsQueryVariables,
} from "@/queries/projects";
import type { LocaleCode, SiteKey } from "@/types/site";

const MAX_PROJECT_ARCHIVE_PAGE_SIZE = 50;

export const PROJECT_ARCHIVE_CACHE_TAGS = Object.freeze([
  "archive:sira_project",
]);

export type ProjectArchiveQueryExecutor = (
  variables: SiraProjectsQueryVariables,
) => Promise<SiraProjectsQueryData>;

function normalizeVariables(
  variables: SiraProjectsQueryVariables,
): SiraProjectsQueryVariables | null {
  if (
    !Number.isSafeInteger(variables.first) ||
    variables.first < 1 ||
    variables.first > MAX_PROJECT_ARCHIVE_PAGE_SIZE
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

function logProjectArchiveFailure(siteKey: SiteKey, error: unknown): void {
  if (error instanceof SiraGraphQLError) {
    console.warn("SIRA project archive query failed.", {
      siteKey,
      errorName: error.name,
      operationName: error.operationName,
      requestId: error.requestId,
    });
    return;
  }

  console.warn("SIRA project archive query failed.", {
    siteKey,
    errorName:
      error instanceof Error ? error.name : "UnknownProjectArchiveError",
  });
}

export async function resolveProjectArchive(
  siteKey: SiteKey,
  variables: SiraProjectsQueryVariables,
  execute: ProjectArchiveQueryExecutor,
): Promise<ProjectArchiveResolution> {
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
    return normalizeProjectArchive(
      siteKey,
      await execute(normalizedVariables),
    );
  } catch (error) {
    logProjectArchiveFailure(siteKey, error);

    return Object.freeze({
      status: "remote-error",
      siteKey,
      errorName:
        error instanceof Error ? error.name : "UnknownProjectArchiveError",
    });
  }
}

async function resolvePublishedProjectArchive(
  siteKey: SiteKey,
  first: number,
  after: string | null = null,
): Promise<ProjectArchiveResolution> {
  return resolveProjectArchive(
    siteKey,
    { first, after },
    async (variables) =>
      await fetchPublishedGraphQL(
        siteKey,
        SIRA_PROJECTS_QUERY,
        variables,
        { tags: PROJECT_ARCHIVE_CACHE_TAGS },
      ),
  );
}

export const getProjectArchive = cache(resolvePublishedProjectArchive);

/**
 * The archive in one language.
 *
 * ADR-034 keeps every translation in the same post type, so the raw archive
 * carries both languages and each page shows one. An untranslated archive
 * falls back to the language it does exist in rather than to an empty page —
 * the same rule the Digital indexes apply — because a content gap should read
 * as a gap and not as a broken build.
 */
export async function getProjectArchiveForLocale(
  siteKey: SiteKey,
  first: number,
  locale: LocaleCode,
): Promise<ProjectArchiveResolution> {
  const resolution = await getProjectArchive(siteKey, first);

  if (resolution.status !== "ready") return resolution;

  const selected = resolution.page.items.filter((item) => item.locale === locale);

  if (selected.length === 0 || selected.length === resolution.page.items.length) {
    return resolution;
  }

  return Object.freeze({
    ...resolution,
    page: Object.freeze({ ...resolution.page, items: Object.freeze(selected) }),
  });
}
