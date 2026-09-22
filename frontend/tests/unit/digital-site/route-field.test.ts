import { describe, expect, it } from "vitest";

import {
  createField,
  createRandom,
  FIELD_DEFAULTS,
  hashSeed,
  renderStaticField,
  type FieldConfig,
} from "@/lib/digital-site/route-field";

const BASE: FieldConfig = {
  ...FIELD_DEFAULTS,
  cols: 40,
  rows: 24,
  seed: hashSeed("test"),
  direction: "ltr",
};

function run(config: FieldConfig, ticks: number, attractor = null) {
  const field = createField(config);
  for (let index = 0; index < ticks; index += 1) field.step(attractor);
  return field;
}

describe("route field", () => {
  it("is deterministic for a seed", () => {
    const a = renderStaticField({ cols: 40, rows: 24, seed: 7, direction: "ltr" });
    const b = renderStaticField({ cols: 40, rows: 24, seed: 7, direction: "ltr" });
    const c = renderStaticField({ cols: 40, rows: 24, seed: 8, direction: "ltr" });

    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect(createRandom(1)()).toBe(createRandom(1)());
    expect(hashSeed("hero")).toBe(hashSeed("hero"));
    expect(hashSeed("hero")).not.toBe(hashSeed("herp"));
  });

  it("keeps every route inside the grid and moving one cell at a time at right angles", () => {
    const field = run(BASE, 200);

    expect(field.routes.length).toBeGreaterThan(0);

    for (const route of field.routes) {
      for (let index = 0; index < route.points.length; index += 1) {
        const point = route.points[index];
        expect(point).toBeDefined();
        if (point === undefined) continue;
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThan(BASE.cols);
        expect(point.y).toBeLessThan(BASE.rows);

        const previous = route.points[index - 1];
        if (previous === undefined) continue;
        const dx = Math.abs(point.x - previous.x);
        const dy = Math.abs(point.y - previous.y);
        // Exactly one axis moves, by exactly one cell.
        expect(dx + dy).toBe(1);
      }
    }
  });

  it("never lets two routes share or touch a cell", () => {
    const field = run(BASE, 260);
    const owner = new Map<string, number>();

    for (const route of field.routes) {
      for (const point of route.points) {
        const key = `${point.x},${point.y}`;
        expect(owner.has(key), `cell ${key} used twice`).toBe(false);
        owner.set(key, route.id);
      }
    }

    // The one-cell moat: no cell of one route has a different route beside it.
    for (const [key, id] of owner) {
      const [x, y] = key.split(",").map(Number) as [number, number];
      for (let ny = y - 1; ny <= y + 1; ny += 1) {
        for (let nx = x - 1; nx <= x + 1; nx += 1) {
          const neighbour = owner.get(`${nx},${ny}`);
          if (neighbour !== undefined) expect(neighbour).toBe(id);
        }
      }
    }
  });

  it("respects the route budget and the length range", () => {
    const field = run(BASE, 300);
    const alive = field.routes.filter((route) => route.doneTick === null);

    expect(alive.length).toBeLessThanOrEqual(BASE.maxRoutes);
    for (const route of field.routes) {
      expect(route.points.length).toBeLessThanOrEqual(BASE.maxLength);
    }
  });

  it("enters from the right edge when the direction is rtl", () => {
    const ltr = run({ ...BASE, spawnChance: 1 }, 3);
    const rtl = run({ ...BASE, direction: "rtl", spawnChance: 1 }, 3);

    const edgeStarts = (field: typeof ltr, column: number) =>
      field.routes.filter((route) => route.points[0]?.x === column).length;

    expect(edgeStarts(ltr, 0)).toBeGreaterThan(0);
    expect(edgeStarts(rtl, BASE.cols - 1)).toBeGreaterThan(0);
    expect(edgeStarts(rtl, 0)).toBe(0);
  });

  it("keeps routes out of the attractor's radius", () => {
    const attractor = { x: 20, y: 12, radius: 3, reach: 9 };
    const field = createField({ ...BASE, spawnChance: 1, maxRoutes: 30 });
    for (let index = 0; index < 240; index += 1) field.step(attractor);

    for (const route of field.routes) {
      for (const point of route.points) {
        const dx = point.x - attractor.x;
        const dy = point.y - attractor.y;
        expect(dx * dx + dy * dy).toBeGreaterThanOrEqual(attractor.radius * attractor.radius);
      }
    }
  });

  it("releases finished routes' cells after they linger", () => {
    const field = run({ ...BASE, linger: 20, maxLength: 6, minLength: 4 }, 400);
    // With a short linger the field renews: the number of stored routes stays
    // bounded instead of growing with every tick.
    expect(field.routes.length).toBeLessThan(BASE.maxRoutes * 4);
  });

  it("renders a still as SVG path data with an end node per route", () => {
    const still = renderStaticField({ cols: 48, rows: 28, seed: 1, direction: "ltr", ticks: 120 });

    expect(still.length).toBeGreaterThan(8);
    for (const route of still) {
      expect(route.d).toMatch(/^M\d+ \d+( L\d+ \d+)+$/);
      expect(route.opacity).toBeGreaterThan(0);
      expect(route.opacity).toBeLessThanOrEqual(1);
      expect(route.end.x).toBeLessThan(48);
    }
  });
});
