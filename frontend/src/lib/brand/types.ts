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

export interface ResolvedBrand {
  readonly siteKey: SiteKey;
  readonly key: SiteKey;
  readonly name: string;
  readonly tagline: string | null;
  readonly identity: BrandIdentityTokens;
  readonly semantic: BrandSemanticTokens;
  readonly assets: BrandAssetSet;
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
  readonly source: BrandResolutionSource;
  readonly diagnostics: readonly string[];
}

export interface BrandPreset {
  readonly siteKey: SiteKey;
  readonly name: string;
  readonly tagline: string;
  readonly identity: BrandIdentityTokens;
  readonly semantic: Omit<BrandSemanticTokens, "onAccent">;
  readonly assets: BrandAssetSet;
}
