/**
 * Shared Chromium loader for the sirahdigital.in reference forensics pass.
 *
 * playwright-core lives in frontend/node_modules; these audit scripts sit in the
 * artifacts tree deliberately, so they resolve it explicitly rather than being
 * moved into production tooling.
 */
import { createRequire } from "node:module";

const require = createRequire(new URL("../../../../frontend/package.json", import.meta.url));

export const { chromium, devices } = require("playwright-core");

export const ORIGIN = "https://sirahdigital.in";

export const VIEWPORTS = [
  { name: "390", width: 390, height: 844, mobile: true },
  { name: "768", width: 768, height: 1024, mobile: true },
  { name: "1024", width: 1024, height: 768, mobile: false },
  { name: "1280", width: 1280, height: 800, mobile: false },
  { name: "1440", width: 1440, height: 900, mobile: false },
  { name: "1920", width: 1920, height: 1080, mobile: false },
];

export function outPath(...parts) {
  return new URL(["..", ...parts].join("/"), import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
}
