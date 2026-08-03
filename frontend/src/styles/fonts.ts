import {
  Archivo,
  Newsreader,
  Noto_Kufi_Arabic,
} from "next/font/google";

export const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  variable: "--font-noto-kufi-arabic",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

export const SIRA_FONT_VARIABLE_CLASSES = [
  archivo.variable,
  newsreader.variable,
  notoKufiArabic.variable,
].join(" ");
