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
import type { SiteKey } from "@/types/site";

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
