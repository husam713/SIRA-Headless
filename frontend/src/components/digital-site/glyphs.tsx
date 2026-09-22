/**
 * The route glyphs: one continuous line per capability, drawn on a 48-unit
 * grid, ending in a node. Hand-set rather than generated, so each one says
 * something about its capability — a staircase for work that moves forward, a
 * serpentine for reading, a spiral for something built inward — while all six
 * are unmistakably the same line.
 *
 * `pathLength={1}` normalises every path so the same CSS draws each one in the
 * same time.
 */

interface RouteGlyphDefinition {
  readonly d: string;
  readonly end: readonly [number, number];
}

const GLYPHS: Readonly<Record<string, RouteGlyphDefinition>> = Object.freeze({
  // A staircase: each step is a hand-off that now happens on its own.
  workflow: { d: "M0 44 H16 V28 H32 V12 H46", end: [46, 12] },
  // A conversation that goes out and comes back, then hands over.
  agents: { d: "M0 8 H40 V24 H8 V40 H46", end: [46, 40] },
  // Reading, line by line.
  documents: { d: "M0 6 H46 V22 H2 V38 H46", end: [46, 38] },
  // Built inward: the mark's own grammar, unrotated.
  applications: { d: "M2 2 H46 V46 H2 V18 H30 V32 H16", end: [16, 32] },
  // A connector between two systems that were not talking.
  integration: { d: "M0 34 H16 V14 H32 V34 H46", end: [46, 34] },
  // Levels that agree: a stepped reading of the same numbers.
  data: { d: "M2 46 V26 H16 V38 H30 V8 H46", end: [46, 8] },
  // The route arriving: the mark drawn for a received brief.
  arrival: { d: "M0 40 H16 V16 H32 V32 H46", end: [46, 32] },
});

interface RouteGlyphProps {
  readonly name: string;
  readonly className?: string;
}

export function RouteGlyph({ name, className }: RouteGlyphProps) {
  const glyph = GLYPHS[name] ?? GLYPHS["workflow"];
  if (glyph === undefined) return null;

  const [x, y] = glyph.end;

  return (
    <svg
      className={className}
      viewBox="-2 -2 52 52"
      aria-hidden="true"
      focusable="false"
    >
      <path d={glyph.d} pathLength={1} />
      <rect x={x - 3} y={y - 3} width={6} height={6} />
    </svg>
  );
}

export function hasRouteGlyph(name: string): boolean {
  return Object.hasOwn(GLYPHS, name);
}

/** The small mark beside the wordmark: the line nesting inward, once. */
export function WordmarkGlyph({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M1.5 15 V1.5 H14.5 V11 H7 V6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    </svg>
  );
}

/** A routed arrow: forward, then the head. Mirrored by CSS in RTL. */
export function ArrowGlyph({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M1.5 8 H13.5 M9 3.5 L13.5 8 L9 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function MenuGlyph({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="M2 5.5 H18 M2 10 H18 M2 14.5 H18"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="square"
      />
    </svg>
  );
}

export function CloseGlyph({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="M4 4 L16 16 M16 4 L4 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="square"
      />
    </svg>
  );
}
