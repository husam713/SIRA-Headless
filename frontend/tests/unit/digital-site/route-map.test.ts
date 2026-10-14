import { describe, expect, it } from "vitest";

import { buildRouteMap, DECISION_STATIONS, ROUTE_STATIONS } from "@/lib/digital-site/route-map";

// The hero's drawing: two routes into one ledger, mirrored for Arabic, with
// the travelling documents' keyframes generated from the same points.

describe("hero route map", () => {
  for (const orientation of ["horizontal", "vertical"] as const) {
    it(`draws five stations per route and one decision each (${orientation})`, () => {
      const map = buildRouteMap(orientation, "ltr");
      expect(map.stations).toHaveLength(ROUTE_STATIONS * 2);
      for (const route of ["purchase", "sales"] as const) {
        const decisions = map.stations.filter((station) => station.route === route && station.decision);
        expect(decisions.map((station) => station.index)).toEqual([DECISION_STATIONS[route]]);
      }
    });

    it(`mirrors x for Arabic and keeps y (${orientation})`, () => {
      const ltr = buildRouteMap(orientation, "ltr");
      const rtl = buildRouteMap(orientation, "rtl");
      ltr.stations.forEach((station, index) => {
        const mirrored = rtl.stations[index];
        expect(mirrored?.x).toBeCloseTo(ltr.width - station.x);
        expect(mirrored?.y).toBe(station.y);
      });
      expect(rtl.ledger.x).toBeCloseTo(ltr.width - ltr.ledger.x - ltr.ledger.width);
    });

    it(`ends both routes at the ledger, and the keyframes follow the drawn path (${orientation})`, () => {
      const map = buildRouteMap(orientation, "ltr");
      const end = (d: string) => d.split(" L").at(-1);
      expect(end(map.paths.purchase)).toBe(end(map.paths.sales));
      for (const route of ["purchase", "sales"] as const) {
        expect(map.keyframes).toContain(`@keyframes ${map.animations[route]}`);
        // Every vertex of the drawn path appears as a translate() in the keyframes.
        for (const vertex of map.paths[route].split(/ ?[ML]/u).filter(Boolean)) {
          const [x, y] = vertex.trim().split(" ");
          expect(map.keyframes).toContain(`translate(${x}px, ${y}px)`);
        }
      }
      expect(map.keyframes).toContain("0% {");
      expect(map.keyframes).toContain("100% {");
    });
  }

  it("names the keyframes per orientation and direction, so two maps never collide", () => {
    const names = new Set(
      (["horizontal", "vertical"] as const).flatMap((orientation) =>
        (["ltr", "rtl"] as const).flatMap((direction) => Object.values(buildRouteMap(orientation, direction).animations)),
      ),
    );
    expect(names.size).toBe(8);
  });
});
