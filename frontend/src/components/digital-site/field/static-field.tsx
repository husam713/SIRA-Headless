import {
  hashSeed,
  renderStaticField,
  type FieldDirection,
  type FieldRect,
} from "@/lib/digital-site/route-field";

/**
 * The logical grid every field shares, whatever the surface's pixels. 40 × 40
 * and `slice`-fitted, so a landscape screen crops rows and a portrait one
 * crops columns, and the client canvas can continue the exact same system
 * from the exact same picture.
 */
export const FIELD_GRID = 40;
export const FIELD_STILL_TICKS = 150;

/**
 * Where the headline sits: the bottom of the hero, on the reading side. The
 * server cannot measure the real box, so the still keeps routes out of the
 * region the type is designed into; the client then measures and refines.
 */
export function heroObstacles(direction: FieldDirection): readonly FieldRect[] {
  const width = 27;
  const top = 14;
  return [
    {
      x: direction === "ltr" ? 0 : FIELD_GRID - width,
      y: top,
      width,
      height: FIELD_GRID - top,
    },
  ];
}

/** The 404's words sit mid-height on the reading side. */
export function notFoundObstacles(direction: FieldDirection): readonly FieldRect[] {
  const width = 26;
  return [{ x: direction === "ltr" ? 0 : FIELD_GRID - width, y: 11, width, height: 20 }];
}

interface StaticFieldProps {
  readonly seedKey: string;
  readonly direction: FieldDirection;
  readonly ticks?: number;
  readonly obstacles?: readonly FieldRect[];
  readonly className?: string;
}

/**
 * A still of the field, as inline SVG. It is what a reader sees before any
 * script runs, and the whole picture when motion is reduced or unavailable.
 */
export function StaticField({
  seedKey,
  direction,
  ticks = FIELD_STILL_TICKS,
  obstacles,
  className,
}: StaticFieldProps) {
  const routes = renderStaticField({
    cols: FIELD_GRID,
    rows: FIELD_GRID,
    seed: hashSeed(seedKey),
    direction,
    ticks,
    ...(obstacles === undefined ? {} : { obstacles }),
  });

  return (
    <svg
      className={className}
      viewBox={`0 0 ${FIELD_GRID} ${FIELD_GRID}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="none"
        stroke="var(--dg-lapis)"
        strokeWidth={1.5}
        strokeLinejoin="miter"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
        transform="translate(0.5 0.5)"
      >
        {routes.map((route) => (
          <path key={route.d} d={route.d} opacity={route.opacity} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <g fill="var(--dg-ink)" transform="translate(0.5 0.5)">
        {routes.map((route) => (
          <rect
            key={`${route.end.x}-${route.end.y}`}
            x={route.end.x - 0.11}
            y={route.end.y - 0.11}
            width={0.22}
            height={0.22}
            opacity={route.opacity}
          />
        ))}
      </g>
    </svg>
  );
}
