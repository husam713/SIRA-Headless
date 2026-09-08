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

/**
 * The lighter of a brand's two neutrals, for use on a surface known to be dark.
 *
 * `selectReadableForeground` cannot be used for the deep surfaces: it measures
 * against the background, and every preset writes `deep`, `deepCard` and
 * `footer` in `oklch()`, which the six-digit hex parser above rejects by design
 * rather than half-understanding.
 *
 * It does not need to measure. Those tokens are dark by definition — the names
 * say so, and a preset that made one of them light would be describing a
 * different thing. The only open question is which of the brand's two neutrals
 * is the light one, and both of those are hex. For a brand on light paper the
 * answer is `paper`, which is what every deep section hardcoded before this
 * existed; for one on a dark ground (ADR-033) it is `ink`.
 */
export function selectForegroundForDarkSurface(
  paper: string,
  ink: string,
): string {
  return relativeLuminance(paper) >= relativeLuminance(ink) ? paper : ink;
}
