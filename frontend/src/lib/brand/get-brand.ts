import "server-only";

import { cache } from "react";
import {
  createFallbackBrand,
} from "@/lib/brand/fallbacks";
import {
  normalizeWordPressBrand,
} from "@/lib/brand/normalize-brand";
import type { ResolvedBrand } from "@/lib/brand/types";
import {
  SiraGraphQLError,
  fetchPublishedGraphQL,
} from "@/lib/graphql";
import {
  SIRA_BRAND_QUERY,
} from "@/queries/brand";
import type { SiteKey } from "@/types/site";

function logFallback(siteKey: SiteKey, error: unknown): void {
  if (error instanceof SiraGraphQLError) {
    console.warn("SIRA brand fallback activated.", {
      siteKey,
      errorName: error.name,
      requestId: error.requestId,
      operationName: error.operationName,
    });

    return;
  }

  console.warn("SIRA brand fallback activated.", {
    siteKey,
    errorName:
      error instanceof Error ? error.name : "UnknownBrandResolutionError",
  });
}

async function resolveBrand(siteKey: SiteKey): Promise<ResolvedBrand> {
  try {
    const data = await fetchPublishedGraphQL(
      siteKey,
      SIRA_BRAND_QUERY,
      {},
      {
        tags: ["brand-identity"],
      },
    );

    const brand = normalizeWordPressBrand(siteKey, data.siraBrand);

    if (brand.source === "fallback") {
      console.warn("SIRA brand key mismatch; fallback preset used.", {
        siteKey,
        diagnostics: brand.diagnostics,
      });
    }

    return brand;
  } catch (error) {
    logFallback(siteKey, error);

    return createFallbackBrand(siteKey, ["wordpress-brand-unavailable"]);
  }
}

/**
 * Memoized within a React Server Component render and backed by the
 * published GraphQL fetch cache across requests.
 */
export const getBrand = cache(resolveBrand);
