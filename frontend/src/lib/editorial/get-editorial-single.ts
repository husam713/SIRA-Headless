import "server-only";

import { cache } from "react";

import type { EditorialSingleResolution } from "@/lib/editorial/editorial-single-types";
import { normalizeEditorialSingle } from "@/lib/editorial/normalize-editorial-single";
import { fetchPublishedGraphQL } from "@/lib/graphql";
import {
  SIRA_EDITORIAL_SINGLE_QUERY,
  type SiraEditorialSingleQueryData,
} from "@/queries/editorial-single";
import type { SiteKey } from "@/types/site";

// The same archive tags the feed uses, so publishing or editing an item
// invalidates both the archive that lists it and the page that shows it. The
// article's own type is not known before the response arrives, which is why
// all four are tagged rather than just the one.
const EDITORIAL_SINGLE_CACHE_TAGS: readonly string[] = Object.freeze([
  "archive:sira_news",
  "archive:sira_insight",
  "archive:sira_article",
  "archive:sira_press_release",
]);

export type EditorialSingleQueryExecutor = (
  uri: string,
) => Promise<SiraEditorialSingleQueryData>;

export async function resolveEditorialSingle(
  siteKey: SiteKey,
  uri: string,
  execute: EditorialSingleQueryExecutor,
): Promise<EditorialSingleResolution> {
  try {
    return normalizeEditorialSingle(siteKey, uri, await execute(uri));
  } catch (error) {
    // Deliberately not logging the URI: it is attacker-controlled input on a
    // 404 sweep, and the site key plus the error name is enough to act on.
    console.error(
      `[sira] editorial single request failed for ${siteKey}:`,
      error instanceof Error ? error.name : "UnknownEditorialSingleError",
    );

    return Object.freeze({
      status: "remote-error",
      siteKey,
      errorName:
        error instanceof Error ? error.name : "UnknownEditorialSingleError",
    });
  }
}

async function resolvePublishedEditorialSingle(
  siteKey: SiteKey,
  uri: string,
): Promise<EditorialSingleResolution> {
  return resolveEditorialSingle(siteKey, uri, async (requestedUri) =>
    fetchPublishedGraphQL(siteKey, SIRA_EDITORIAL_SINGLE_QUERY, { uri: requestedUri }, {
      tags: EDITORIAL_SINGLE_CACHE_TAGS,
    }),
  );
}

export const getEditorialSingle = cache(resolvePublishedEditorialSingle);
