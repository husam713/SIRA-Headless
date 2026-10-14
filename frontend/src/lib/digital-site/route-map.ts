/**
 * The hero's route map — geometry only, no rendering.
 *
 * Two routes in the SIRA grammar (one continuous line turning at right
 * angles): purchasing above, sales below. Each passes five stations — the
 * documents a transaction becomes — then both turn and meet at the general
 * ledger. Decision points (the internal approval, ZATCA clearance) are
 * diamonds, the flowchart convention for a step that can say no.
 *
 * Two orientations: a horizontal panorama for wide screens and two vertical
 * routes for narrow ones, chosen in CSS. In Arabic the whole map is mirrored
 * by recomputing x (never by flipping the drawing, which would mirror the
 * type), so it reads right to left.
 *
 * The travelling documents' keyframes are generated here from the same
 * points as the drawn paths, so the motion cannot drift from the line.
 */

export type RouteOrientation = "horizontal" | "vertical";
export type RouteKey = "purchase" | "sales";

interface Point {
  readonly x: number;
  readonly y: number;
}

export interface RouteStation {
  readonly route: RouteKey;
  readonly index: number;
  readonly x: number;
  readonly y: number;
  /** A decision point is drawn as a diamond. */
  readonly decision: boolean;
  readonly labelX: number;
  readonly labelY: number;
}

export interface RouteLedger {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** Centre of the label block. */
  readonly labelX: number;
  readonly labelY: number;
}

export interface RouteMapGeometry {
  readonly orientation: RouteOrientation;
  readonly width: number;
  readonly height: number;
  readonly fontSize: number;
  readonly paths: Readonly<Record<RouteKey, string>>;
  readonly stations: readonly RouteStation[];
  readonly ledger: RouteLedger;
  /** CSS `@keyframes` for the travelling documents, one per route. */
  readonly keyframes: string;
  /** Keyframe names, by route. */
  readonly animations: Readonly<Record<RouteKey, string>>;
}

/** Stations where the document can be stopped: approval (purchase), clearance (sales). */
export const DECISION_STATIONS: Readonly<Record<RouteKey, number>> = Object.freeze({ purchase: 1, sales: 4 });

const STATIONS = 5;

interface Layout {
  readonly width: number;
  readonly height: number;
  readonly fontSize: number;
  readonly routes: Readonly<Record<RouteKey, readonly Point[]>>;
  readonly stations: Readonly<Record<RouteKey, readonly Point[]>>;
  readonly label: (route: RouteKey, station: Point) => Point;
  readonly ledger: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
}

const HORIZONTAL: Layout = (() => {
  const xs = [48, 236, 424, 612, 800];
  const purchaseY = 84;
  const salesY = 216;
  const mergeX = 960;
  const ledger = { x: 1048, y: 114, width: 120, height: 72 };
  const entry = { x: ledger.x, y: ledger.y + ledger.height / 2 };
  return {
    width: 1200,
    height: 300,
    fontSize: 15,
    routes: {
      purchase: [{ x: xs[0] ?? 0, y: purchaseY }, { x: mergeX, y: purchaseY }, { x: mergeX, y: entry.y }, entry],
      sales: [{ x: xs[0] ?? 0, y: salesY }, { x: mergeX, y: salesY }, { x: mergeX, y: entry.y }, entry],
    },
    stations: {
      purchase: xs.map((x) => ({ x, y: purchaseY })),
      sales: xs.map((x) => ({ x, y: salesY })),
    },
    // Labels start at the station, above the purchase line and below the sales line.
    label: (route, station) => ({ x: station.x - 8, y: route === "purchase" ? station.y - 26 : station.y + 40 }),
    ledger,
  };
})();

const VERTICAL: Layout = (() => {
  const ys = [32, 104, 176, 248, 320];
  const purchaseX = 40;
  const salesX = 212;
  const mergeY = 404;
  const ledger = { x: 60, y: 468, width: 132, height: 64 };
  const entry = { x: ledger.x + ledger.width / 2, y: ledger.y };
  return {
    width: 360,
    height: 548,
    fontSize: 14,
    routes: {
      purchase: [{ x: purchaseX, y: ys[0] ?? 0 }, { x: purchaseX, y: mergeY }, { x: entry.x, y: mergeY }, entry],
      sales: [{ x: salesX, y: ys[0] ?? 0 }, { x: salesX, y: mergeY }, { x: entry.x, y: mergeY }, entry],
    },
    stations: {
      purchase: ys.map((y) => ({ x: purchaseX, y })),
      sales: ys.map((y) => ({ x: salesX, y })),
    },
    // Labels sit beside each line, on its inline-end side.
    label: (_route, station) => ({ x: station.x + 18, y: station.y + 5 }),
    ledger,
  };
})();

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function pathData(points: readonly Point[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${round(point.x)} ${round(point.y)}`).join(" ");
}

function segmentLengths(points: readonly Point[]): number[] {
  const lengths: number[] = [];
  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1];
    const b = points[index];
    if (a === undefined || b === undefined) continue;
    lengths.push(Math.abs(b.x - a.x) + Math.abs(b.y - a.y));
  }
  return lengths;
}

/** The fraction of the route's length at which a point on its first segment is reached. */
function fractionAt(points: readonly Point[], target: Point): number {
  const total = segmentLengths(points).reduce((sum, length) => sum + length, 0);
  const start = points[0];
  if (start === undefined || total === 0) return 0;
  return (Math.abs(target.x - start.x) + Math.abs(target.y - start.y)) / total;
}

function percent(fraction: number): string {
  return `${round(fraction * 100)}%`;
}

/**
 * Keyframes for one travelling document: constant speed along the polyline,
 * fading in at the first station, changing state at the decision station,
 * fading into the ledger.
 */
function routeKeyframes(name: string, points: readonly Point[], decisionAt: number, from: string, to: string): string {
  const lengths = segmentLengths(points);
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const frames: string[] = [];
  let travelled = 0;

  points.forEach((point, index) => {
    if (index > 0) travelled += lengths[index - 1] ?? 0;
    const at = total === 0 ? 0 : travelled / total;
    const extra =
      index === 0
        ? ` opacity: 0; fill: ${from};`
        : index === points.length - 1
          ? ` opacity: 0; fill: ${to};`
          : "";
    frames.push(`${percent(at)} { transform: translate(${round(point.x)}px, ${round(point.y)}px);${extra} }`);
  });

  frames.push(`4% { opacity: 1; }`);
  frames.push(`${percent(Math.max(0, decisionAt - 0.006))} { fill: ${from}; }`);
  frames.push(`${percent(Math.min(1, decisionAt + 0.006))} { fill: ${to}; }`);
  frames.push(`96% { opacity: 1; }`);

  return `@keyframes ${name} { ${frames.join(" ")} }`;
}

function mirrorPoint(point: Point, width: number): Point {
  return { x: width - point.x, y: point.y };
}

/** The whole map for one orientation and reading direction. */
export function buildRouteMap(orientation: RouteOrientation, direction: "ltr" | "rtl"): RouteMapGeometry {
  const layout = orientation === "horizontal" ? HORIZONTAL : VERTICAL;
  const mirror = direction === "rtl";
  const place = (point: Point): Point => (mirror ? mirrorPoint(point, layout.width) : point);

  const routes = {
    purchase: layout.routes.purchase.map(place),
    sales: layout.routes.sales.map(place),
  };

  const stations: RouteStation[] = (["purchase", "sales"] as const).flatMap((route) =>
    layout.stations[route].map((station, index) => {
      const label = layout.label(route, station);
      const at = place(station);
      // A mirrored label is anchored at its start too: in RTL the start of
      // the text is its right edge, so mirroring x alone mirrors the label.
      const labelAt = mirror ? { x: layout.width - label.x, y: label.y } : label;
      return {
        route,
        index,
        x: at.x,
        y: at.y,
        decision: DECISION_STATIONS[route] === index,
        labelX: labelAt.x,
        labelY: labelAt.y,
      };
    }),
  );

  const ledgerBox = layout.ledger;
  const ledgerX = mirror ? layout.width - ledgerBox.x - ledgerBox.width : ledgerBox.x;
  const ledger: RouteLedger = {
    x: ledgerX,
    y: ledgerBox.y,
    width: ledgerBox.width,
    height: ledgerBox.height,
    labelX: ledgerX + ledgerBox.width / 2,
    labelY: ledgerBox.y + ledgerBox.height / 2,
  };

  const prefix = `dg-route-${orientation === "horizontal" ? "h" : "v"}-${direction}`;
  const animations = { purchase: `${prefix}-purchase`, sales: `${prefix}-sales` };

  const decisionFraction = (route: RouteKey): number => {
    const station = layout.stations[route][DECISION_STATIONS[route]];
    return station === undefined ? 0 : fractionAt(layout.routes[route], station);
  };

  const keyframes = [
    routeKeyframes(animations.purchase, routes.purchase, decisionFraction("purchase"), "var(--dg-pending)", "var(--dg-approved)"),
    routeKeyframes(animations.sales, routes.sales, decisionFraction("sales"), "var(--dg-route)", "var(--dg-approved)"),
  ].join("\n");

  return {
    orientation,
    width: layout.width,
    height: layout.height,
    fontSize: layout.fontSize,
    paths: { purchase: pathData(routes.purchase), sales: pathData(routes.sales) },
    stations,
    ledger,
    keyframes,
    animations,
  };
}

/** How many stations each route has — the narrative must supply this many labels. */
export const ROUTE_STATIONS = STATIONS;
