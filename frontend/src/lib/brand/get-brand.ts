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
import type { LocaleCode, SiteKey } from "@/types/site";

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
        // `brand` and `layout` are what the WordPress webhook emits for a
        // brand-options save; `brand-identity` is the frontend's own name.
        tags: ["brand-identity", "brand", "layout"],
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
 * The brand as one language's pages read it. English is the record as
 * stored; Arabic folds the Arabic tagline, address and office columns in
 * where an editor filled them and keeps the English where not, so a half-
 * translated options page degrades to a mixed page rather than a blank one.
 */
function localizeBrand(brand: ResolvedBrand, locale: LocaleCode): ResolvedBrand {
  if (locale !== "ar") return brand;

  return Object.freeze({
    ...brand,
    tagline: brand.taglineAr ?? brand.tagline,
    address: brand.addressAr ?? brand.address,
    offices: Object.freeze(
      brand.offices.map((office) =>
        Object.freeze({
          ...office,
          name: office.nameAr ?? office.name,
          address: office.addressAr ?? office.address,
        }),
      ),
    ),
  });
}

// The record is memoized once per request whatever languages ask for it;
// only the fold differs, and that is cheap.
const getBrandRecord = cache(resolveBrand);

async function resolveBrandForLocale(siteKey: SiteKey, locale: LocaleCode = "en"): Promise<ResolvedBrand> {
  return localizeBrand(await getBrandRecord(siteKey), locale);
}

/**
 * Memoized within a React Server Component render and backed by the
 * published GraphQL fetch cache across requests.
 */
export const getBrand = cache(resolveBrandForLocale);
