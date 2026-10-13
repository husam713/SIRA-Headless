import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";

/**
 * SIRA Digital's type, loaded only by the Digital document.
 *
 * One superfamily for both editions: IBM Plex Sans for Latin and IBM Plex
 * Sans Arabic for Arabic, drawn to the same proportions, so the English and
 * Arabic sites carry the same voice instead of two fonts that merely sit side
 * by side. Plex was designed for enterprise software, which is the world this
 * company works in.
 *
 * Plex Sans is variable (one file for every weight). Plex Sans Arabic is
 * static, so only the three weights the sheet uses are loaded, and only its
 * Arabic subset: Latin characters on Arabic pages fall through to Plex Sans,
 * which is already loaded, instead of downloading a second Latin. Neither is
 * preloaded on the other edition's pages: the Arabic face is fetched by
 * unicode-range when Arabic text appears. Kept out of `fonts.ts` so the other
 * five tenants never load them.
 */
export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-sans",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const plexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
  variable: "--font-plex-arabic",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

export const DIGITAL_FONT_VARIABLE_CLASSES = [plexSans.variable, plexSansArabic.variable].join(" ");
