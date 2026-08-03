import type {
  BrandMedia,
  SiraBrandQueryData,
} from "@/queries/brand";
import {
  createFallbackBrand,
  getBrandPreset,
} from "@/lib/brand/fallbacks";
import { selectReadableForeground } from "@/lib/brand/contrast";
import type {
  BrandOffice,
  BrandSocialProfiles,
  BrandValue,
  RemoteBrandMedia,
  ResolvedBrand,
} from "@/lib/brand/types";
import type { SiteKey } from "@/types/site";

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

function normalizeText(
  value: string | null | undefined,
  maximumLength: number,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  return normalized === "" ? null : normalized.slice(0, maximumLength);
}

function normalizeHexColor(
  value: string,
  fallback: string,
  fieldName: string,
  diagnostics: string[],
): string {
  const normalized = value.trim().toLowerCase();

  if (!HEX_COLOR_PATTERN.test(normalized)) {
    diagnostics.push(`invalid-${fieldName}`);
    return fallback;
  }

  return normalized;
}

function normalizeMedia(value: BrandMedia | null): RemoteBrandMedia | null {
  if (
    value === null ||
    !Number.isSafeInteger(value.databaseId) ||
    value.databaseId <= 0
  ) {
    return null;
  }

  let sourceUrl: URL;

  try {
    sourceUrl = new URL(value.sourceUrl);
  } catch {
    return null;
  }

  if (sourceUrl.protocol !== "https:") {
    return null;
  }

  const width =
    value.width !== null &&
    Number.isSafeInteger(value.width) &&
    value.width > 0
      ? value.width
      : null;

  const height =
    value.height !== null &&
    Number.isSafeInteger(value.height) &&
    value.height > 0
      ? value.height
      : null;

  return Object.freeze({
    databaseId: value.databaseId,
    sourceUrl: sourceUrl.toString(),
    altText: normalizeText(value.altText, 300) ?? "",
    width,
    height,
  });
}

function normalizeValues(
  values: SiraBrandQueryData["siraBrand"]["values"],
): readonly BrandValue[] {
  if (values === null) {
    return Object.freeze([]);
  }

  return Object.freeze(
    values.flatMap((value) => {
      if (value === null) {
        return [];
      }

      const title = normalizeText(value.title, 160);

      if (title === null) {
        return [];
      }

      return [
        Object.freeze({
          title,
          description: normalizeText(value.description, 1000),
        }),
      ];
    }),
  );
}

function normalizeOffices(
  offices: SiraBrandQueryData["siraBrand"]["officeLocations"],
): readonly BrandOffice[] {
  if (offices === null) {
    return Object.freeze([]);
  }

  return Object.freeze(
    offices.flatMap((office) => {
      if (office === null) {
        return [];
      }

      const name = normalizeText(office.name, 160);

      if (name === null) {
        return [];
      }

      return [
        Object.freeze({
          name,
          address: normalizeText(office.address, 600),
          phone: normalizeText(office.phone, 80),
          email: normalizeText(office.email, 254),
        }),
      ];
    }),
  );
}

function normalizeSocialProfiles(
  profiles: SiraBrandQueryData["siraBrand"]["socialProfiles"],
): BrandSocialProfiles {
  return Object.freeze({
    linkedin: normalizeText(profiles?.linkedin, 500),
    instagram: normalizeText(profiles?.instagram, 500),
    x: normalizeText(profiles?.x, 500),
    youtube: normalizeText(profiles?.youtube, 500),
  });
}

export function normalizeWordPressBrand(
  siteKey: SiteKey,
  data: SiraBrandQueryData["siraBrand"],
): ResolvedBrand {
  const preset = getBrandPreset(siteKey);
  const diagnostics: string[] = [];

  if (data.key !== siteKey) {
    return createFallbackBrand(siteKey, ["brand-key-mismatch"]);
  }

  const primary = normalizeHexColor(
    data.primaryColor,
    preset.identity.primary,
    "primary-color",
    diagnostics,
  );
  const secondary = normalizeHexColor(
    data.secondaryColor,
    preset.identity.secondary,
    "secondary-color",
    diagnostics,
  );
  const accent = normalizeHexColor(
    data.accentColor,
    preset.identity.accent,
    "accent-color",
    diagnostics,
  );
  const paper = normalizeHexColor(
    data.paperColor,
    preset.identity.paper,
    "paper-color",
    diagnostics,
  );
  const ink = normalizeHexColor(
    data.inkColor,
    preset.identity.ink,
    "ink-color",
    diagnostics,
  );

  const name = normalizeText(data.name, 160);

  if (name === null) {
    diagnostics.push("invalid-brand-name");
  }

  const onAccent = selectReadableForeground(accent, paper, ink);

  return Object.freeze({
    siteKey,
    key: siteKey,
    name: name ?? preset.name,
    tagline: normalizeText(data.tagline, 300) ?? preset.tagline,
    identity: Object.freeze({
      primary,
      secondary,
      accent,
      paper,
      ink,
    }),
    semantic: Object.freeze({
      ...preset.semantic,
      onAccent,
    }),
    assets: preset.assets,
    remoteLogo: normalizeMedia(data.logo),
    remoteMark: normalizeMedia(data.mark),
    email: normalizeText(data.email, 254),
    phone: normalizeText(data.phone, 80),
    address: normalizeText(data.address, 600),
    description: normalizeText(data.description, 4000),
    mission: normalizeText(data.mission, 2000),
    vision: normalizeText(data.vision, 2000),
    values: normalizeValues(data.values),
    offices: normalizeOffices(data.officeLocations),
    socialProfiles: normalizeSocialProfiles(data.socialProfiles),
    announcementBanner: normalizeText(data.announcementBanner, 500),
    emergencyBanner: normalizeText(data.emergencyBanner, 500),
    source:
      diagnostics.length === 0 ? "wordpress" : "wordpress-normalized",
    diagnostics: Object.freeze(diagnostics),
  });
}
