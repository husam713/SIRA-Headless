import type {
  BrandPreset,
  ResolvedBrand,
} from "@/lib/brand/types";
import { selectReadableForeground } from "@/lib/brand/contrast";
import type { SiteKey } from "@/types/site";

const WHITE_MARK = Object.freeze({
  src: "/brands/shared/mark-white.png",
  width: 285,
  height: 274,
  alt: "",
  decorative: true,
});

const BRANCH_COMMON = Object.freeze({
  paperGlass: "oklch(0.98 0.005 90 / 0.9)",
  inkSoft: "oklch(0.44 0.015 260)",
  inkFaint: "oklch(0.55 0.01 260)",
  border: "oklch(0.88 0.01 90)",
  onAccentBorder: "oklch(1 0 0 / 0.18)",
});

function branchSemantic(hue: number) {
  return Object.freeze({
    accentBright: `oklch(0.72 0.14 ${hue})`,
    paperGlass: BRANCH_COMMON.paperGlass,
    inkSoft: BRANCH_COMMON.inkSoft,
    inkFaint: BRANCH_COMMON.inkFaint,
    deep: `oklch(0.17 0.045 ${hue})`,
    deepCard: `oklch(0.21 0.05 ${hue})`,
    footer: `oklch(0.14 0.04 ${hue})`,
    tint: `oklch(0.965 0.012 ${hue})`,
    border: BRANCH_COMMON.border,
    shadow: `oklch(0.4 0.06 ${hue} / 0.4)`,
    onAccentBorder: BRANCH_COMMON.onAccentBorder,
    deepBorder: `oklch(0.3 0.04 ${hue})`,
    heroOverlayTop: `oklch(0.15 0.04 ${hue} / 0.35)`,
    heroOverlayMiddle: `oklch(0.15 0.04 ${hue} / 0.4)`,
    heroOverlayBottom: `oklch(0.13 0.04 ${hue} / 0.95)`,
  });
}

export const BRAND_PRESETS = Object.freeze({
  group: {
    siteKey: "group",
    name: "SIRA GROUP",
    tagline: "Shaping a smarter future.",
    identity: {
      primary: "#cca34b",
      secondary: "#172232",
      accent: "#cca34b",
      paper: "#f7f4ed",
      ink: "#20242b",
    },
    semantic: {
      accentBright: "oklch(0.78 0.14 78)",
      paperGlass: "oklch(0.97 0.006 75 / 0.92)",
      inkSoft: "oklch(0.45 0.01 260)",
      inkFaint: "oklch(0.6 0.01 260)",
      deep: "oklch(0.16 0.024 255)",
      deepCard: "oklch(0.24 0.03 250)",
      footer: "oklch(0.16 0.024 255)",
      tint: "oklch(0.94 0.008 255)",
      border: "oklch(0.88 0.01 75)",
      shadow: "oklch(0.08 0.02 255 / 0.85)",
      onAccentBorder: "oklch(0.16 0.02 260 / 0.18)",
      deepBorder: "oklch(0.3 0.02 255)",
      heroOverlayTop: "oklch(0.15 0.02 255 / 0.4)",
      heroOverlayMiddle: "oklch(0.15 0.02 255 / 0.35)",
      heroOverlayBottom: "oklch(0.12 0.02 255 / 0.94)",
    },
    assets: {
      logo: {
        src: "/brands/group/logo.png",
        width: 768,
        height: 290,
        alt: "SIRA GROUP",
        decorative: false,
      },
      mark: {
        src: "/brands/group/mark.png",
        width: 285,
        height: 274,
        alt: "",
        decorative: true,
      },
      markOnDark: WHITE_MARK,
    },
  },
  consulting: {
    siteKey: "consulting",
    name: "SIRA Consulting",
    tagline: "Strategy for new markets.",
    identity: {
      primary: "#8b5aae",
      secondary: "#2b1f36",
      accent: "#8b5aae",
      paper: "#f8f4fa",
      ink: "#29232d",
    },
    semantic: branchSemantic(300),
    assets: {
      logo: null,
      mark: {
        src: "/brands/consulting/mark.png",
        width: 285,
        height: 274,
        alt: "",
        decorative: true,
      },
      markOnDark: WHITE_MARK,
    },
  },
  healthcare: {
    siteKey: "healthcare",
    name: "SIRA Healthcare",
    tagline: "Advancing diagnostic and healthcare infrastructure.",
    identity: {
      primary: "#2c6dad",
      secondary: "#12283f",
      accent: "#2c6dad",
      paper: "#f3f7fb",
      ink: "#1f2932",
    },
    semantic: branchSemantic(235),
    assets: {
      logo: null,
      mark: {
        src: "/brands/healthcare/mark.png",
        width: 285,
        height: 274,
        alt: "",
        decorative: true,
      },
      markOnDark: WHITE_MARK,
    },
  },
  lifestyle: {
    siteKey: "lifestyle",
    name: "SIRA Lifestyle",
    tagline:
      "Creating destination-led hospitality and lifestyle experiences.",
    identity: {
      primary: "#2e8c72",
      secondary: "#12382f",
      accent: "#2e8c72",
      paper: "#f2f8f5",
      ink: "#1f2b27",
    },
    semantic: branchSemantic(165),
    assets: {
      logo: null,
      mark: {
        src: "/brands/lifestyle/mark.png",
        width: 285,
        height: 274,
        alt: "",
        decorative: true,
      },
      markOnDark: WHITE_MARK,
    },
  },
  realestate: {
    siteKey: "realestate",
    name: "SIRA Real Estate",
    tagline: "Building enduring places across markets.",
    identity: {
      primary: "#b0733c",
      secondary: "#2b1b14",
      accent: "#b0733c",
      paper: "#faf5ef",
      ink: "#25201d",
    },
    semantic: branchSemantic(45),
    assets: {
      logo: null,
      mark: {
        src: "/brands/realestate/mark.png",
        width: 285,
        height: 274,
        alt: "",
        decorative: true,
      },
      markOnDark: WHITE_MARK,
    },
  },
} as const satisfies Readonly<Record<SiteKey, BrandPreset>>);

export function getBrandPreset(siteKey: SiteKey): BrandPreset {
  return BRAND_PRESETS[siteKey];
}

export function createFallbackBrand(
  siteKey: SiteKey,
  diagnostics: readonly string[] = [],
): ResolvedBrand {
  const preset = getBrandPreset(siteKey);
  const onAccent = selectReadableForeground(
    preset.identity.accent,
    preset.identity.paper,
    preset.identity.ink,
  );

  return Object.freeze({
    siteKey,
    key: siteKey,
    name: preset.name,
    tagline: preset.tagline,
    identity: Object.freeze({ ...preset.identity }),
    semantic: Object.freeze({
      ...preset.semantic,
      onAccent,
    }),
    assets: preset.assets,
    remoteLogo: null,
    remoteMark: null,
    email: null,
    phone: null,
    address: null,
    description: null,
    mission: null,
    vision: null,
    values: Object.freeze([]),
    offices: Object.freeze([]),
    socialProfiles: Object.freeze({
      linkedin: null,
      instagram: null,
      x: null,
      youtube: null,
    }),
    announcementBanner: null,
    emergencyBanner: null,
    source: "fallback",
    diagnostics: Object.freeze([...diagnostics]),
  });
}
