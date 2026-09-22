import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { archivo, notoKufiArabic } from "@/styles/fonts";

/**
 * SIRA Digital's type, loaded only by the Digital document.
 *
 * Two voices from one family: Archivo with its width axis is the display
 * face (set semi-expanded, it stops being the group's instrument font and
 * becomes a signage voice of its own), and the ordinary Archivo the site
 * already loads is the text face. Noto Kufi Arabic, also already loaded, is
 * the Arabic for both roles. IBM Plex Mono is the instrument layer: indices,
 * eyebrows, the clock. Kept out of `fonts.ts` so the other five tenants never
 * preload it.
 */
export const archivoWide = Archivo({
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
  variable: "--font-archivo-wide",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
  fallback: ["ui-monospace", "Menlo", "Consolas", "monospace"],
});

export const DIGITAL_FONT_VARIABLE_CLASSES = [
  archivoWide.variable,
  archivo.variable,
  notoKufiArabic.variable,
  plexMono.variable,
].join(" ");
