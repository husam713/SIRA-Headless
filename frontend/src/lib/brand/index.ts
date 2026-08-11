import "server-only";

export {
  createBrandCssVariables,
  DERIVED_BRAND_TOKEN_NAMES,
  WORDPRESS_BRAND_TOKEN_NAMES,
  type BrandCssVariables,
} from "@/lib/brand/css-variables";
export {
  BRAND_PRESETS,
  createFallbackBrand,
  getBrandPreset,
} from "@/lib/brand/fallbacks";
export { getBrand } from "@/lib/brand/get-brand";
export { normalizeWordPressBrand } from "@/lib/brand/normalize-brand";
export type {
  BrandAssetSet,
  BrandBanner,
  BrandBannerLink,
  BrandBannerSeverity,
  BrandBannerTarget,
  BrandIdentityTokens,
  BrandOffice,
  BrandPreset,
  BrandResolutionSource,
  BrandSemanticTokens,
  BrandSocialProfiles,
  BrandValue,
  LocalBrandAsset,
  RemoteBrandMedia,
  ResolvedBrand,
} from "@/lib/brand/types";
