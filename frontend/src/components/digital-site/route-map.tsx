import type { CSSProperties } from "react";

import type { DigitalRouteMapContent } from "@/content/digital-site";
import { buildRouteMap, type RouteMapGeometry, type RouteOrientation } from "@/lib/digital-site/route-map";

interface RouteMapProps {
  readonly content: DigitalRouteMapContent;
  readonly direction: "ltr" | "rtl";
}

/** Three documents per route, spread along it so the map is alive at first paint. */
const TOKENS = [0, 1, 2] as const;
const CYCLE_SECONDS = 9;

function RouteSvg({
  geometry,
  content,
  orientation,
}: {
  readonly geometry: RouteMapGeometry;
  readonly content: DigitalRouteMapContent;
  readonly orientation: RouteOrientation;
}) {
  const labelFor = (route: "purchase" | "sales", index: number): string =>
    (route === "purchase" ? content.purchase : content.sales)[index] ?? "";

  return (
    <svg
      className={`dg-route dg-route--${orientation === "horizontal" ? "h" : "v"}`}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      role="img"
      aria-label={content.label}
      style={{ "--dg-route-font": `${geometry.fontSize}px` } as CSSProperties}
    >
      {/* The documents' keyframes come from the same points as the lines. */}
      <style>{geometry.keyframes}</style>

      <path className="dg-route__line" d={geometry.paths.purchase} />
      <path className="dg-route__line" d={geometry.paths.sales} />

      <g className="dg-route__ledger">
        <rect
          className="dg-route__ledger-box"
          x={geometry.ledger.x}
          y={geometry.ledger.y}
          width={geometry.ledger.width}
          height={geometry.ledger.height}
          rx={3}
        />
        <text className="dg-route__ledger-label" x={geometry.ledger.labelX} y={geometry.ledger.labelY - 3}>
          {content.ledger.map((line, index) => (
            <tspan key={line} x={geometry.ledger.labelX} dy={index === 0 ? 0 : "1.2em"}>
              {line}
            </tspan>
          ))}
        </text>
      </g>

      {geometry.stations.map((station) => (
        <g key={`${station.route}-${station.index}`} className="dg-route__station">
          {station.decision ? (
            <rect
              className="dg-route__decision"
              x={station.x - 7}
              y={station.y - 7}
              width={14}
              height={14}
              transform={`rotate(45 ${station.x} ${station.y})`}
            />
          ) : (
            <circle className="dg-route__stop" cx={station.x} cy={station.y} r={6} />
          )}
          <text className="dg-route__label" x={station.labelX} y={station.labelY}>
            {labelFor(station.route, station.index)}
          </text>
        </g>
      ))}

      <g className="dg-route__tokens" aria-hidden="true">
        {(["purchase", "sales"] as const).flatMap((route) =>
          TOKENS.map((token) => (
            <rect
              key={`${route}-${token}`}
              className="dg-route__token"
              x={-9}
              y={-6}
              width={18}
              height={12}
              rx={2}
              style={{
                animationName: geometry.animations[route],
                animationDelay: `${-(token * CYCLE_SECONDS) / TOKENS.length - (route === "sales" ? CYCLE_SECONDS / 6 : 0)}s`,
                animationDuration: `${CYCLE_SECONDS}s`,
              }}
            />
          )),
        )}
      </g>
    </svg>
  );
}

/**
 * The hero's figure: purchases and sales, document by document, posting to
 * one general ledger. Drawn on the server as SVG — visible at first paint,
 * no script. Both orientations are rendered and CSS shows the one that fits.
 * The travelling documents loop, so the figure carries a pause control
 * (WCAG 2.2.2) that needs no script either: a checkbox read by `:has()`.
 */
export function RouteMap({ content, direction }: RouteMapProps) {
  const horizontal = buildRouteMap("horizontal", direction);
  const vertical = buildRouteMap("vertical", direction);

  return (
    <figure className="dg-hero__figure">
      <div className="dg-hero__map">
        <RouteSvg geometry={horizontal} content={content} orientation="horizontal" />
        <RouteSvg geometry={vertical} content={content} orientation="vertical" />
      </div>
      <figcaption className="dg-hero__caption">
        <span>{content.caption}</span>
        <label className="dg-motion">
          <input type="checkbox" className="dg-motion__input" />
          <span className="dg-motion__box" aria-hidden="true" />
          <span>{content.pause}</span>
        </label>
      </figcaption>
    </figure>
  );
}
