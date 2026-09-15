import "server-only";

import { cache } from "react";
import { fetchPublishedGraphQL, SiraGraphQLError } from "@/lib/graphql";
import {
  normalizeNavigation,
  SCOPE_LOCATIONS,
} from "@/lib/navigation/normalize-navigation";
import type { NavigationResolution } from "@/lib/navigation/types";
import {
  SIRA_NAVIGATION_QUERY,
  type SiraNavigationQueryData,
} from "@/queries/navigation";
import type { LocaleCode, SiteKey } from "@/types/site";

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
  locale: LocaleCode = "en",
): Promise<NavigationResolution> {
  try {
    return normalizeNavigation(siteKey, await execute(), locale);
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
  locale: LocaleCode = "en",
): Promise<NavigationResolution> {
  return resolveNavigation(
    siteKey,
    async () =>
      await fetchPublishedGraphQL(
        siteKey,
        SIRA_NAVIGATION_QUERY,
        SCOPE_LOCATIONS[locale],
        { tags: ["navigation"] },
      ),
    locale,
  );
}

export const getNavigation = cache(resolvePublishedNavigation);

/**
 * Navigation in the requested language, falling back to the default locale.
 *
 * A tenant that has not assigned the Arabic menu locations should still get a
 * usable header rather than none. The fallback is all-or-nothing on the primary
 * scope: a half-translated header — Arabic footer, English navigation — reads
 * as a bug, whereas an untranslated header reads as a translation still to do.
 */
export async function getNavigationForLocale(
  siteKey: SiteKey,
  locale: LocaleCode,
  defaultLocale: LocaleCode,
): Promise<NavigationResolution> {
  const localized = await getNavigation(siteKey, locale);

  if (
    locale === defaultLocale ||
    (localized.status === "resolved" && localized.primary.status === "ready")
  ) {
    return localized;
  }

  return getNavigation(siteKey, defaultLocale);
}
