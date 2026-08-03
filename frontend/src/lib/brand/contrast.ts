const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

function parseHexColor(value: string): readonly [number, number, number] {
  if (!HEX_COLOR_PATTERN.test(value)) {
    throw new TypeError(`Expected a six-digit hexadecimal color: ${value}.`);
  }

  return [
    Number.parseInt(value.slice(1, 3), 16),
    Number.parseInt(value.slice(3, 5), 16),
    Number.parseInt(value.slice(5, 7), 16),
  ];
}

function toLinearChannel(channel: number): number {
  const normalized = channel / 255;

  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(value: string): number {
  const [red, green, blue] = parseHexColor(value);

  return (
    0.2126 * toLinearChannel(red) +
    0.7152 * toLinearChannel(green) +
    0.0722 * toLinearChannel(blue)
  );
}

export function contrastRatio(
  foreground: string,
  background: string,
): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

export function selectReadableForeground(
  background: string,
  lightCandidate: string,
  darkCandidate: string,
  minimumRatio = 4.5,
): string {
  const candidates = [
    lightCandidate,
    darkCandidate,
    "#ffffff",
    "#000000",
  ] as const;

  const ranked = candidates
    .map((candidate) => ({
      candidate,
      ratio: contrastRatio(candidate, background),
    }))
    .sort((left, right) => right.ratio - left.ratio);

  const preferredCandidates = ranked.filter(({ candidate }) =>
    candidate === lightCandidate || candidate === darkCandidate,
  );
  const preferredPassing = preferredCandidates.find(
    ({ ratio }) => ratio >= minimumRatio,
  );

  return preferredPassing?.candidate ?? ranked[0]?.candidate ?? "#000000";
}
