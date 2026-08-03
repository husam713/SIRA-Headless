import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function pngDimensions(path: string): readonly [number, number] {
  const file = readFileSync(`public${path}`);

  if (file.toString("ascii", 1, 4) !== "PNG") {
    throw new TypeError(`Not a PNG file: ${path}.`);
  }

  return [file.readUInt32BE(16), file.readUInt32BE(20)];
}

describe("approved local SIRA fallback assets", () => {
  it.each([
    ["/brands/consulting/mark.png", 285, 274],
    ["/brands/group/logo.png", 768, 290],
    ["/brands/group/mark.png", 285, 274],
    ["/brands/healthcare/mark.png", 285, 274],
    ["/brands/lifestyle/mark.png", 285, 274],
    ["/brands/realestate/mark.png", 285, 274],
    ["/brands/shared/mark-white.png", 285, 274],
  ] as const)(
    "%s has the approved intrinsic dimensions",
    (path, expectedWidth, expectedHeight) => {
      expect(pngDimensions(path)).toEqual([
        expectedWidth,
        expectedHeight,
      ]);
    },
  );
});
