import type { SiraBrandBannerSeverity } from "@/generated/graphql/graphql";
import type { SiteKey } from "@/types/site";

export type BrandResolutionSource =
  | "wordpress"
  | "wordpress-normalized"
  | "fallback";

export interface BrandIdentityTokens {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly paper: string;
  readonly ink: string;
}

export interface BrandSemanticTokens {
  readonly accentBright: string;
  readonly onAccent: string;
  /**
   * Readable foreground on the `deep` surface.
   *
   * Computed by contrast, never declared, for the same reason as `onAccent`.
   * Deep sections used to hardcode `paper` as their foreground, which held only
   * while every brand had light paper over a dark deep. SIRA Digital inverts
   * that pair (ADR-033), and `paper` on `deep` became dark-on-dark. This
   * resolves to `paper` for every light brand — a literal no-op for them — and
   * to `ink` for a brand set on a dark ground.
   */
  readonly onDeep: string;
  readonly paperGlass: string;
  readonly inkSoft: string;
  readonly inkFaint: string;
  readonly deep: string;
  readonly deepCard: string;
  readonly footer: string;
  readonly tint: string;
  readonly border: string;
  readonly shadow: string;
  readonly onAccentBorder: string;
  readonly deepBorder: string;
  readonly heroOverlayTop: string;
  readonly heroOverlayMiddle: string;
  readonly heroOverlayBottom: string;
}

export interface LocalBrandAsset {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly decorative: boolean;
}

export interface BrandAssetSet {
  readonly logo: LocalBrandAsset | null;
  readonly mark: LocalBrandAsset;
  readonly markOnDark: LocalBrandAsset;
}

export interface RemoteBrandMedia {
  readonly databaseId: number;
  readonly sourceUrl: string;
  readonly altText: string;
  readonly width: number | null;
  readonly height: number | null;
}

export interface BrandValue {
  readonly title: string;
  readonly description: string | null;
}

export interface BrandOffice {
  readonly name: string;
  readonly address: string | null;
  readonly phone: string | null;
  readonly email: string | null;
}

export interface BrandSocialProfiles {
  readonly linkedin: string | null;
  readonly instagram: string | null;
  readonly x: string | null;
  readonly youtube: string | null;
}

export type BrandBannerSeverity = SiraBrandBannerSeverity;
export type BrandBannerTarget = "_self" | "_blank";

export interface BrandBannerLink {
  readonly label: string;
  readonly url: string;
  readonly target: BrandBannerTarget | null;
}

export interface BrandBanner {
  readonly message: string;
  readonly severity: BrandBannerSeverity;
  readonly link: BrandBannerLink | null;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  readonly dismissible: boolean;
  readonly revisionKey: string;
}

export interface ResolvedBrand {
  readonly siteKey: SiteKey;
  readonly key: SiteKey;
  readonly name: string;
  readonly tagline: string | null;
  readonly identity: BrandIdentityTokens;
  readonly semantic: BrandSemanticTokens;
  readonly assets: BrandAssetSet;
  readonly motion: BrandMotionPreset;
  readonly remoteLogo: RemoteBrandMedia | null;
  readonly remoteMark: RemoteBrandMedia | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly address: string | null;
  readonly description: string | null;
  readonly mission: string | null;
  readonly vision: string | null;
  readonly values: readonly BrandValue[];
  readonly offices: readonly BrandOffice[];
  readonly socialProfiles: BrandSocialProfiles;
  readonly announcementBanner: string | null;
  readonly emergencyBanner: string | null;
  readonly announcement: BrandBanner | null;
  readonly emergency: BrandBanner | null;
  readonly source: BrandResolutionSource;
  readonly diagnostics: readonly string[];
}

/**
 * A tenant's motion language. Frontend-owned, like the semantic tokens: the
 * CMS does not choose it. `quiet` is the house default — hover, focus and
 * state feedback only, no entrance choreography. `cinematic` adds the
 * scroll-driven reveals and kinetic chapters SIRA Digital was allowed
 * (ADR-033). It is set on `<html data-motion>` and every entrance rule in
 * the stylesheet is scoped by it, so one company's motion never leaks into
 * another's pages.
 */
export type BrandMotionPreset = "quiet" | "cinematic";

export interface BrandPreset {
  readonly siteKey: SiteKey;
  readonly name: string;
  readonly tagline: string;
  readonly identity: BrandIdentityTokens;
  readonly semantic: Omit<BrandSemanticTokens, "onAccent" | "onDeep">;
  readonly assets: BrandAssetSet;
  readonly motion: BrandMotionPreset;
}
